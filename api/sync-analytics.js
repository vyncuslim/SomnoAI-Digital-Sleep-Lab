import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v24.0 - ANTI-SPAM PROTOCOL
 * 专门针对 Serverless 并发设计的“原子级”告警抑制系统
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

let localMemoryLock = false;

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
    } catch (e2) {
      throw new Error(`JSON_DECODE_ERR: ${e.message}`);
    }
  }
}

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  const currentAction = isForbidden ? 'GA4_ACCESS_DENIED' : 'SYNC_ENGINE_FAULT';
  
  // 1. 内存级去抖 (同实例瞬间并发)
  if (localMemoryLock) return;

  // 2. 高熵随机抖动 (Jitter)
  // 在 Serverless 环境下，这是防止多个并发实例同时通过数据库检查的最佳方案
  const jitter = 500 + Math.random() * 4500;
  await new Promise(resolve => setTimeout(resolve, jitter));

  // 3. 确定静默周期
  // 权限问题(403)属于配置错误，通常不会自行恢复，锁定 24 小时。
  // 其他运行错误锁定 4 小时。
  const cooldownHours = isForbidden ? 24 : 4;
  const cooldownDate = new Date(Date.now() - cooldownHours * 60 * 60 * 1000).toISOString();
  
  // 4. 数据库指纹锁检查 (基于 Action 类型和近期时间)
  const { data: recentAlerts } = await supabase
    .from('audit_logs')
    .select('created_at, action')
    .in('action', ['GA4_ACCESS_DENIED', 'SYNC_ENGINE_FAULT', 'GA4_SYNC_FAILURE'])
    .gt('created_at', cooldownDate)
    .order('created_at', { ascending: false })
    .limit(1);

  // 始终持久化日志用于调试，但不发送通知
  await supabase.from('audit_logs').insert([{
    action: currentAction,
    details: `Step: ${checkpoint} | Error: ${errorMsg}`,
    level: isForbidden ? 'CRITICAL' : 'WARNING'
  }]);

  // 如果检测到近期已有相同类型的告警锁，则彻底静默
  if (recentAlerts && recentAlerts.length > 0) {
    console.log(`[Anti-Spam] Suppression active for ${cooldownHours}h. Suppressing: ${currentAction}`);
    return;
  }

  localMemoryLock = true;

  // 5. 执行 Telegram 告警
  try {
    const tgMsg = `🚨 <b>SOMNO LAB: SYNC INCIDENT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${currentAction}</code>\n` +
      `<b>Step:</b> <code>${checkpoint}</code>\n` +
      `<b>Lock Active:</b> <code>${cooldownHours} Hours</code>\n\n` +
      `<b>Err:</b> <code>${errorMsg.substring(0, 100)}...</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>STATUS:</b> Gateway will now remain SILENT for ${cooldownHours}h.`;
      
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
    if (querySecret !== serverSecret) return res.status(200).json({ error: "UNAUTHORIZED_ACCESS" });

    checkpoint = "ENV_VAR_CAPTURE";
    const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY) {
      await alertAdmin(checkpoint, "GA4 environment configuration is void.", true);
      return res.status(200).json({ success: false, reason: "CONFIG_VOID" });
    }

    checkpoint = "GA_CLIENT_INIT";
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
    return res.status(200).json({ success: true, count: rows.length });
  } catch (error) {
    const errorMsg = error?.message || "Unhandled sync explosion.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    
    // 执行静默告警逻辑
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    
    // 关键核心：强制返回 200 OK
    // 这将物理性地阻止 Vercel 或其他定时任务平台感知到失败并进行自动重试。
    return res.status(200).json({ 
      success: false, 
      managed: true,
      reason: "Error captured, alert suppression active."
    });
  }
}