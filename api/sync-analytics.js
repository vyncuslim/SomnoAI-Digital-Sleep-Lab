import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v48.2
 * Features:
 * - Direct numeric Property ID enforcement.
 * - Distributed Incident Lock (24h singleton).
 * - Enhanced Diagnostic Payload for Permission Denied errors.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TARGET_PROPERTY_ID = "380909155"; 

async function alertAdmin(checkpoint, errorMsg, isForbidden = false, saEmail = "") {
  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const currentAction = isForbidden ? 'GA4_PERMISSION_DENIED' : 'GA4_SYNC_FAILURE';
    
    // Staggered check to handle concurrency
    const jitter = Math.floor(Math.random() * 3000);
    await new Promise(r => setTimeout(r, jitter));

    const lookback = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: existing } = await supabase
      .from('audit_logs')
      .select('id')
      .eq('action', currentAction)
      .gt('created_at', lookback)
      .limit(1);

    if (existing && existing.length > 0) return;

    await supabase.from('audit_logs').insert([{
      action: currentAction,
      details: `Checkpoint: ${checkpoint} | ID: ${saEmail} | Property: ${TARGET_PROPERTY_ID} | Error: ${errorMsg.substring(0, 150)}`,
      level: isForbidden ? 'CRITICAL' : 'WARNING'
    }]);

    const mapping = isForbidden 
      ? { en: 'GA4 Access Denied', zh: '🛡️ GA4 权限缺失 (403)', icon: '🚫' }
      : { en: 'Telemetry Sync Failure', zh: '📊 数据同步链路异常', icon: '🟡' };

    const tgMsg = `${mapping.icon} <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${mapping.en}</code>\n` +
      `<b>Step:</b> <code>${checkpoint}</code>\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 150)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Gateway auto-throttled. Fix in Admin Bridge.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("Admin Signaling Failed:", e); }
}

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  while ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1).trim();
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      return JSON.parse(str.replace(/\n/g, "\\n"));
    } catch (e2) { return null; }
  }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  let currentSaEmail = "UNKNOWN";
  const { GA_SERVICE_ACCOUNT_KEY } = process.env;

  try {
    const secret = req.query.secret || req.body?.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    
    if (secret !== serverSecret) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    checkpoint = "GA_CLIENT_INIT";
    const credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.private_key) throw new Error("GA_KEY_STRUCTURE_INVALID");
    
    currentSaEmail = credentials.client_email || "KEY_PARSE_FAILURE";

    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: credentials.private_key.replace(/\\n/g, '\n') } 
    });

    checkpoint = "GA_API_HANDSHAKE";
    const [response] = await analyticsClient.runReport({
      property: `properties/${TARGET_PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    checkpoint = "DB_UPSERT";
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const rows = response?.rows || [];
    for (const row of rows) {
      const dateStr = row.dimensionValues[0].value;
      await supabase.from('analytics_daily').upsert({
        date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });
    }
    
    return res.status(200).json({ success: true, property: TARGET_PROPERTY_ID, service_account: currentSaEmail });
  } catch (error) {
    const errorMsg = error?.message || "Infrastructure timeout.";
    const isForbidden = errorMsg.includes('permission') || error.code === 7 || error.status === 403;
    
    // Try to extract email from raw ENV if checkpoint failed early
    if (currentSaEmail === "UNKNOWN" && GA_SERVICE_ACCOUNT_KEY) {
       const creds = robustParse(GA_SERVICE_ACCOUNT_KEY);
       if (creds) currentSaEmail = creds.client_email;
    }

    await alertAdmin(checkpoint, errorMsg, isForbidden, currentSaEmail);
    
    return res.status(200).json({ 
      success: false, 
      error: errorMsg,
      checkpoint,
      service_account: currentSaEmail,
      property: TARGET_PROPERTY_ID
    });
  }
}