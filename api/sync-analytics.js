import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v29.1 - STORM SUPPRESSION
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  
  const parseAttempt = (val) => {
    try {
      const p = JSON.parse(val);
      if (typeof p === 'object' && p !== null) return p;
      if (typeof p === 'string') return parseAttempt(p);
    } catch (e) {
      try {
        const repaired = val.replace(/\n/g, "\\n").replace(/\r/g, "\\r");
        return JSON.parse(repaired);
      } catch (e2) {}
    }
    return null;
  };

  if (str.startsWith("'") && str.endsWith("'")) str = str.slice(1, -1);
  if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);

  return parseAttempt(str);
}

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentAction = isForbidden ? 'GA4_PERMISSION_DENIED' : 'GA4_SYNC_FAILURE';
  
  // 60s High-Speed Suppression Check
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { data: existing } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', currentAction)
    .gt('created_at', oneMinuteAgo)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[ALERT_SUPPRESSED] Cluster detected for ${currentAction}`);
    return;
  }

  await supabase.from('audit_logs').insert([{
    action: currentAction,
    details: `Checkpoint: ${checkpoint} | Error: ${errorMsg}`,
    level: isForbidden ? 'CRITICAL' : 'WARNING'
  }]);

  try {
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${currentAction}</code>\n` +
      `<b>Step:</b> <code>${checkpoint}</code>\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 150)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Gateway auto-throttled. Fix in Admin Bridge.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error(e); }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  let credentials = null;
  const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY } = process.env;

  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    if (querySecret !== serverSecret) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    checkpoint = "ENV_VAL_SYNC";
    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY) {
      throw new Error("Required environment variables GA_PROPERTY_ID or GA_SERVICE_ACCOUNT_KEY are missing.");
    }

    checkpoint = "GA_CLIENT_SETUP";
    credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.client_email || !credentials.private_key) {
      throw new Error("Credential structure invalid.");
    }

    const formattedKey = credentials.private_key.includes('\\n') 
      ? credentials.private_key.replace(/\\n/g, '\n')
      : credentials.private_key;

    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: formattedKey } 
    });

    checkpoint = "GA_API_HANDSHAKE";
    const cleanId = GA_PROPERTY_ID.trim().replace(/^properties\//, '');
    
    const [response] = await analyticsClient.runReport({
      property: `properties/${cleanId}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    checkpoint = "DATA_UPSERT";
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
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
    return res.status(200).json({ success: true });
  } catch (error) {
    const errorMsg = error?.message || "Internal gateway crash.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    const diagCreds = credentials || robustParse(GA_SERVICE_ACCOUNT_KEY);
    
    return res.status(200).json({ 
      success: false, 
      error: errorMsg,
      is_permission_denied: isPermissionDenied,
      service_account: diagCreds?.client_email || "DECODING_FAILURE",
      property_id: GA_PROPERTY_ID?.trim() || "MISSING",
      failed_at: checkpoint,
      is_uptime_robot_safe: true 
    });
  }
}