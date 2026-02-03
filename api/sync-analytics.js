
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v19.6
 * Features: Improved JSON Parsing + 10-Min Database Cooldown
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const type = isForbidden ? 'GA4_ACCESS_DENIED' : 'SYNC_ENGINE_FAULT';
  
  // 1. DATABASE COOLDOWN: 10 Minute Window
  const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { data: recentAlerts } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('action', type)
    .gt('created_at', tenMinsAgo)
    .limit(1);

  // Always log to DB
  await supabase.from('audit_logs').insert([{
    action: type,
    details: `Checkpoint: ${checkpoint} | Error: ${errorMsg}`,
    level: isForbidden ? 'WARNING' : 'CRITICAL'
  }]);

  if (recentAlerts && recentAlerts.length > 0) {
    console.log(`[Alert Suppressed] Recently notified.`);
    return;
  }

  // 2. TELEGRAM DISPATCH
  try {
    const status = isForbidden ? '403 Forbidden' : '500 Error';
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC ALERT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${type}</code>\n` +
      `<b>Checkpoint:</b> <code>${checkpoint}</code>\n` +
      `<b>Status:</b> ${status}\n` +
      `<b>Reason:</b> <code>${errorMsg.substring(0, 200)}</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>ACTION:</b> Verification required.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("TG_FAIL", e); }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    if (querySecret !== serverSecret) return res.status(401).json({ error: "UNAUTHORIZED" });

    checkpoint = "ENV_VAR_CAPTURE";
    const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY) {
      await alertAdmin(checkpoint, "GA4 Environment variables missing.");
      return res.status(500).json({ error: "CONFIG_VOID" });
    }

    checkpoint = "GA_CLIENT_INIT";
    let credentials;
    try {
        // Robust Parsing Logic
        let rawKey = GA_SERVICE_ACCOUNT_KEY.trim();
        if (rawKey.startsWith('"') && rawKey.endsWith('"')) rawKey = rawKey.substring(1, rawKey.length - 1);
        
        // Convert literal newlines (real line breaks) to \n for JSON.parse
        const fixedKey = rawKey.replace(/\n/g, '\\n');
        credentials = JSON.parse(fixedKey);
        
        // Final normalization of the actual private_key field
        if (credentials.private_key) {
            credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
        }
    } catch (parseEx) {
        throw new Error(`JSON_PARSE_ERR: ${parseEx.message}`);
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
    const errorMsg = error?.message || "Sync failure.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    return res.status(500).json({ error: 'SYNC_CRASH', message: errorMsg, failed_at: checkpoint });
  }
}
