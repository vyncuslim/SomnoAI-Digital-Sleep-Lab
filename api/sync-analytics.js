import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v19.8
 * Features: Multi-pass JSON Repair + Strict 15m Telegram Throttling
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

/**
 * Robust JSON parsing for environment variables that might be 
 * double-quoted, single-line, or containing literal newlines.
 */
function robustParse(input) {
  if (!input) throw new Error("No input provided to parser.");
  let str = input.trim();
  
  // Pass 1: Try direct parse
  try {
    const p = JSON.parse(str);
    if (typeof p === 'object' && p !== null) return p;
    if (typeof p === 'string') str = p; // It was a JSON-encoded string
  } catch (e) {}

  // Pass 2: Clean literal wrapping quotes if they exist and try again
  if (str.startsWith("'") && str.endsWith("'")) str = str.slice(1, -1);
  if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);

  // Pass 3: Repair common newline/escape issues
  try {
    // Replace literal newlines with escaped newlines
    const repaired = str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return JSON.parse(repaired);
  } catch (e) {
    // Pass 4: Final attempt - replace escaped newlines back to literal if previous failed
    try {
      const literal = str.replace(/\\n/g, '\n');
      return JSON.parse(literal);
    } catch (e2) {
      throw new Error(`JSON_REPAIR_FAILED: ${e.message} (Raw start: ${str.substring(0, 10)}...)`);
    }
  }
}

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const type = isForbidden ? 'GA4_ACCESS_DENIED' : 'SYNC_ENGINE_FAULT';
  
  // 1. STRICT PERSISTENT COOLDOWN: 15 Minute Window
  // We check for any alert of this type in the last 15 minutes to avoid flooding TG.
  const cooldownPeriod = new Date(Date.now() - 15 * 60 * 1000).toISOString();
  const { data: recentAlerts } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('action', type)
    .gt('created_at', cooldownPeriod)
    .limit(1);

  // Always log to Database for auditing
  await supabase.from('audit_logs').insert([{
    action: type,
    details: `Checkpoint: ${checkpoint} | Error: ${errorMsg}`,
    level: isForbidden ? 'WARNING' : 'CRITICAL'
  }]);

  if (recentAlerts && recentAlerts.length > 0) {
    console.log(`[Alert Suppressed] Telegram notification throttled. Last alert was within 15m.`);
    return;
  }

  // 2. CONCISE TELEGRAM DISPATCH
  try {
    const status = isForbidden ? '403 Forbidden' : '500 Error';
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC ALERT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${type}</code>\n` +
      `<b>Step:</b> <code>${checkpoint}</code>\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 150)}</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Notification locked for 15m.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("TG_DISPATCH_CRASH", e); }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    if (querySecret !== serverSecret) return res.status(401).json({ error: "UNAUTHORIZED_SYNC" });

    checkpoint = "ENV_VAR_CAPTURE";
    const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY) {
      await alertAdmin(checkpoint, "GA4 Telemetry variables missing in host.");
      return res.status(500).json({ error: "CONFIG_VOID" });
    }

    checkpoint = "GA_CLIENT_INIT";
    let credentials;
    try {
        credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
        // Ensure private_key field is correctly formatted (Google Client SDK is picky)
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
    } catch (parseEx) {
        throw new Error(`JSON_PARSE_FAULT: ${parseEx.message}`);
    }

    const analyticsClient = new BetaAnalyticsDataClient({ credentials });

    checkpoint = "GA_API_HANDSHAKE";
    const [response] = await analyticsClient.runReport({
      property: `properties/${GA_PROPERTY_ID.trim()}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    checkpoint = "DATA_PERSISTENCE";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const rows = response?.rows || [];
    for (const row of rows) {
      const date = row.dimensionValues[0].value;
      await supabase.from('analytics_daily').upsert({
        date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });
    }
    return res.status(200).json({ success: true, processed: rows.length });
  } catch (error) {
    const errorMsg = error?.message || "Internal sync failure.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    return res.status(500).json({ error: 'SYNC_CRASH', message: errorMsg, failed_at: checkpoint });
  }
}