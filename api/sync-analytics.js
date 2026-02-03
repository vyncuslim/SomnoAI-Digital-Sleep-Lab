
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v41.0
 * Enhanced: Returns service account identity on 403 for diagnostic resolution.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

async function alertAdmin(checkpoint, errorMsg, isForbidden = false, saEmail = "") {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentAction = isForbidden ? 'GA4_PERMISSION_DENIED' : 'GA4_SYNC_FAILURE';
  
  const dedupTime = isForbidden ? 86400000 : 1800000;
  const timeLimit = new Date(Date.now() - dedupTime).toISOString();
  
  await new Promise(r => setTimeout(r, Math.random() * 3000));

  const { data: existing } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', currentAction)
    .gt('created_at', timeLimit)
    .limit(1);

  if (existing && existing.length > 0) return;

  await supabase.from('audit_logs').insert([{
    action: currentAction,
    details: `Checkpoint: ${checkpoint} | Email: ${saEmail} | Error: ${errorMsg}`,
    level: isForbidden ? 'CRITICAL' : 'WARNING'
  }]);

  try {
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${currentAction}</code>\n` +
      `<b>Handshake:</b> <code>GA4_DATA_API_v1</code>\n` +
      `<b>ID:</b> <code>${saEmail}</code>\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 100)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Throttled. Add this ID to GA4 Property.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("TG Fail:", e); }
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
  const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY } = process.env;

  try {
    const secret = req.query.secret || req.body?.secret;
    if (secret !== (process.env.CRON_SECRET || INTERNAL_LAB_KEY)) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    checkpoint = "GA_CLIENT_SETUP";
    const credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.private_key) throw new Error("Invalid Service Account Key Configuration");
    
    currentSaEmail = credentials.client_email;

    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: credentials.private_key.replace(/\\n/g, '\n') } 
    });

    checkpoint = "GA_API_HANDSHAKE";
    const cleanId = GA_PROPERTY_ID.trim().replace(/^properties\//, '');
    
    // Safety: Data API only supports GA4 (Numeric IDs)
    if (cleanId.startsWith('UA-')) throw new Error("Legacy Universal Analytics (UA) ID detected. Use numeric GA4 Property ID.");

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
    const errorMsg = error?.message || "Gateway crash.";
    const isPermissionDenied = errorMsg.includes('permission') || error.code === 7 || error.status === 403;
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied, currentSaEmail);
    return res.status(isPermissionDenied ? 403 : 500).json({ 
      success: false, 
      error: errorMsg,
      service_account: currentSaEmail,
      property_id: GA_PROPERTY_ID,
      checkpoint,
      is_permission_denied: isPermissionDenied
    });
  }
}
