import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v25.0 - ATOMIC ANTI-SPAM
 * 专门针对 Serverless 并发环境优化的告警抑制引擎
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

// 模块级内存锁（仅对单实例有效）
let instanceThrottle = false;

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
  const currentAction = isForbidden ? 'GA4_ACCESS_DENIED' : 'SYNC_ENGINE_FAULT';
  
  // 1. 瞬间内存过滤
  if (instanceThrottle) return;

  // 2. 高熵随机抖动 (Jitter)
  // 这是防止并发实例同时通过数据库检查的核心：强迫它们产生时间差
  const jitter = 500 + Math.random() * 4500;
  await new Promise(resolve => setTimeout(resolve, jitter));

  // 3. 确定静默时间
  // 配置错误(403)锁定24小时，运行错误锁定4小时
  const cooldownHours = isForbidden ? 24 : 4;
  const cooldownDate = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
  
  // 4. 执行持久化指纹锁检查
  const { data: existingLock } = await supabase
    .from('audit_logs')
    .select('created_at')
    .eq('action', currentAction)
    .gt('created_at', cooldownDate)
    .order('created_at', { ascending: false })
    .limit(1);

  // 无论如何先持久化日志
  await supabase.from('audit_logs').insert([{
    action: currentAction,
    details: `Checkpoint: ${checkpoint} | Error: ${errorMsg}`,
    level: isForbidden ? 'CRITICAL' : 'WARNING'
  }]);

  // 如果 24h 内已有相同类型的错误，则保持静默
  if (existingLock && existingLock.length > 0) {
    console.log(`[Anti-Spam] Suppression ACTIVE. Action ${currentAction} is currently locked.`);
    return;
  }

  instanceThrottle = true;

  // 5. 执行 Telegram 多语言告警
  try {
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${currentAction}</code>\n` +
      `<b>Step:</b> <code>${checkpoint}</code>\n` +
      `<b>Silent Lock:</b> <code>${cooldownHours}h Active</code>\n\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 150)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Gateway silenced until registry cleared.`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { 
    console.error("TG_DISPATCH_FAIL", e); 
  }
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
    
    // 触发抑制告警
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    
    // 【核心修正】强制返回 200 OK。
    // 这将物理性地阻止 Vercel Cron 在失败时尝试立即重试，从根本上解决刷屏。
    return res.status(200).json({ 
      success: false, 
      suppressed: true,
      reason: errorMsg 
    });
  }
}