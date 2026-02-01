
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB NEURAL MONITOR v8.0 - TRIPLE LINGUAL ORIGIN DISPATCH
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  try {
    let isDbHealthy = true;
    let isAiHealthy = !!process.env.API_KEY;
    
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) isDbHealthy = false;

    const mytTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)';
    const nodeName = req.headers.host || 'sleepsomno.com';

    if (!isDbHealthy || !isAiHealthy) {
      const tgMessage = `🚨 <b>PULSE ANOMALY | 脉搏异常</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📍 <b>SOURCE:</b> <code>⚙️ System Logic | 系统逻辑</code>\n\n` +
        `🇬🇧 <b>[ENGLISH]</b>\n` +
        `<b>Issue:</b> ${!isAiHealthy ? 'Neural Link Offline' : 'Database Disconnected'}\n\n` +
        `🇪🇸 <b>[ESPAÑOL]</b>\n` +
        `<b>Problema:</b> ${!isAiHealthy ? 'Enlace Neural Desconectado' : 'Base de Datos Desconectada'}\n\n` +
        `🇨🇳 <b>[中文]</b>\n` +
        `<b>问题:</b> ${!isAiHealthy ? '神经链路离线' : '数据库连接断开'}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>TIME:</b> <code>${mytTime}</code>`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      }).catch(() => {});
    }

    return res.status(200).json({ db: isDbHealthy, ai: isAiHealthy });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
