
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v10.0
 * Healthcheck endpoint for UptimeRobot
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const querySecret = req.query.secret;
  const serverSecret = process.env.CRON_SECRET || "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  // 防止接口被索引
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (querySecret !== serverSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED_PULSE" });
  }

  try {
    let dbStatus = "ONLINE";
    let aiStatus = "ONLINE";
    
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) dbStatus = "OFFLINE";
    if (!process.env.API_KEY) aiStatus = "OFFLINE";

    const isHealthy = dbStatus === "ONLINE" && aiStatus === "ONLINE";

    if (!isHealthy) {
      const mytTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)';
      const tgMessage = `🚨 <b>INFRASTRUCTURE ANOMALY</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📍 <b>NODE:</b> <code>Health Monitor</code>\n` +
        `🗄️ <b>DATABASE:</b> <code>${dbStatus}</code>\n` +
        `🧠 <b>AI LINK:</b> <code>${aiStatus}</code>\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>TIME:</b> <code>${mytTime}</code>`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      }).catch(() => {});
    }

    // UptimeRobot 需要 2xx 状态码表示 Healthy
    return res.status(isHealthy ? 200 : 500).json({ 
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: "MONITOR_EXCEPTION" });
  }
}
