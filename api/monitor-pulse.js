
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB NEURAL MONITOR v1.7 - EN/ZH BILINGUAL REFACTOR
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
    const nodeName = req.headers.host || 'Cloud_Edge';

    if (!isDbHealthy || !isAiHealthy) {
      const tgMessage = `🚨 <b>PULSE ANOMALY | 脉搏异常</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
        `🇬🇧 <b>[ENGLISH]</b>\n` +
        `${!isDbHealthy ? '❌ <b>Database:</b> Connection severed.' : '✅ <b>Database:</b> Nominal.'}\n` +
        `${!isAiHealthy ? '❌ <b>Neural Link:</b> API Key is missing or invalid.' : '✅ <b>Neural Link:</b> Nominal.'}\n\n` +
        `🇨🇳 <b>[中文]</b>\n` +
        `${!isDbHealthy ? '❌ <b>数据库:</b> 连接已断开。' : '✅ <b>数据库:</b> 运行正常。'}\n` +
        `${!isAiHealthy ? '❌ <b>神经链路:</b> API 密钥缺失或已失效。' : '✅ <b>神经链路:</b> 运行正常。'}\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>NODE:</b> <code>${nodeName}</code>\n` +
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
