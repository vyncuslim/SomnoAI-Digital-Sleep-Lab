
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v45.0
 * Protocol:
 * 1. Explicitly locked Property ID 380909155.
 * 2. DISTRIBUTED SUPPRESSION: Checks Supabase for recent alerts. 
 *    Only 1 Telegram message per 24h for permanent errors.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

async function alertAdmin(checkpoint, errorMsg, isForbidden = false, saEmail = "") {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentAction = isForbidden ? 'GA4_PERMISSION_DENIED' : 'GA4_SYNC_FAILURE';
  
  // Prevent parallel trigger race conditions
  const jitter = Math.floor(Math.random() * 5000);
  await new Promise(r => setTimeout(r, jitter));

  // Check if we already alerted in the last 24 hours for this specific blockage
  const lookback = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', currentAction)
    .gt('created_at', lookback)
    .limit(1);

  if (existing && existing.length > 0) {
    console.log(`[SUPPRESSION] Alert for ${currentAction} already dispatched in last 24h.`);
    return;
  }

  // Record log to set the distributed lock
  await supabase.from('audit_logs').insert([{
    action: currentAction,
    details: `Checkpoint: ${checkpoint} | ID: ${saEmail} | Error: ${errorMsg.substring(0, 100)}`,
    level: isForbidden ? 'CRITICAL' : 'WARNING'
  }]);

  // Dispatch ONE Telegram message
  try {
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${currentAction}</code>\n` +
      `<b>ID:</b> <code>${saEmail}</code>\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 150)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Gateway throttled (24h singleton lock). Fix in Admin Bridge.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("TG Dispatch Fail:", e); }
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
  
  // LOCK TARGET ID
  const TARGET_PROPERTY_ID = "380909155"; 

  try {
    const secret = req.query.secret || req.body?.secret;
    if (secret !== (process.env.CRON_SECRET || INTERNAL_LAB_KEY)) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    checkpoint = "GA_CLIENT_SETUP";
    const credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.private_key) throw new Error("GA_KEY_STRUCTURE_INVALID");
    
    currentSaEmail = credentials.client_email;

    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: credentials.private_key.replace(/\\n/g, '\n') } 
    });

    checkpoint = "GA_API_HANDSHAKE";
    const [response] = await analyticsClient.runReport({
      property: `properties/${TARGET_PROPERTY_ID}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    checkpoint = "DB_SYNC";
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
    return res.status(200).json({ success: true, property: TARGET_PROPERTY_ID });
  } catch (error) {
    const errorMsg = error?.message || "Internal gateway crash.";
    const isForbidden = errorMsg.includes('permission') || error.code === 7 || error.status === 403;
    
    // singleton-throttled alert
    await alertAdmin(checkpoint, errorMsg, isForbidden, currentSaEmail);
    
    return res.status(isForbidden ? 403 : 500).json({ 
      success: false, 
      error: errorMsg,
      service_account: currentSaEmail,
      is_permission_denied: isForbidden
    });
  }
}
