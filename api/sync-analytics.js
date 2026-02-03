import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v26.0 - UPTIMEROBOT OPTIMIZED
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  try {
    const p = JSON.parse(str);
    if (typeof p === 'object' && p !== null) return p;
  } catch (e) {}
  if (str.startsWith("'") && str.endsWith("'")) str = str.slice(1, -1);
  if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
  try {
    const repaired = str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return JSON.parse(repaired);
  } catch (e) {
    try {
      const literal = str.replace(/\\n/g, '\n');
      return JSON.parse(literal);
    } catch (e2) { return null; }
  }
}

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentAction = isForbidden ? 'GA4_PERMISSION_DENIED' : 'GA4_SYNC_FAILURE';
  
  // 指纹校验：防止一分钟内重复报错
  const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
  const { data: existing } = await supabase
    .from('audit_logs')
    .select('id')
    .eq('action', currentAction)
    .gt('created_at', oneMinuteAgo)
    .limit(1);

  if (existing && existing.length > 0) return;

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
      `📍 <b>STATUS:</b> Gateway auto-throttled.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error(e); }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    if (querySecret !== serverSecret) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    checkpoint = "ENV_VAL_SYNC";
    const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY) {
      await alertAdmin(checkpoint, "Incomplete environment variables.", true);
      return res.status(200).json({ success: false, msg: "Config void" });
    }

    checkpoint = "GA_CLIENT_SETUP";
    let credentials = robustParse(GA_SERVICE_ACCOUNT_KEY);
    if (credentials && credentials.private_key) {
        credentials.private_key = credentials.private_key.replace(/\\n/g, '\n');
    }

    const analyticsClient = new BetaAnalyticsDataClient({ credentials });

    checkpoint = "GA_API_HANDSHAKE";
    const [response] = await analyticsClient.runReport({
      property: `properties/${GA_PROPERTY_ID.trim()}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    checkpoint = "DATA_UPSERT";
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
    return res.status(200).json({ success: true });
  } catch (error) {
    const errorMsg = error?.message || "Internal crash.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    
    // 【针对 UptimeRobot】强制返回 200。
    // 这能防止 UptimeRobot 认为失败并按照自己的策略频繁重试。
    return res.status(200).json({ 
      success: false, 
      error: errorMsg,
      is_uptime_robot_safe: true 
    });
  }
}