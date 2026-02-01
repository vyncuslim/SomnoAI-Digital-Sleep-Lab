
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC v16.0 - UNIFIED VISUAL PROTOCOL
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const TARGET_SERVICE_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

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
    if (!process.env.GA_PROPERTY_ID || !process.env.GA_SERVICE_ACCOUNT_KEY) {
      throw new Error("ENV_KEY_MISSING");
    }

    const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
    const client = new BetaAnalyticsDataClient({ credentials });

    const [response] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
    });

    if (!response.rows || response.rows.length === 0) {
        return res.status(200).json({ success: true, message: "UP_TO_DATE" });
    }

    const rows = response.rows.map(row => ({
      date: `${row.dimensionValues[0].value.slice(0,4)}-${row.dimensionValues[0].value.slice(4,6)}-${row.dimensionValues[0].value.slice(6,8)}`,
      users: parseInt(row.metricValues[0].value),
      pageviews: parseInt(row.metricValues[1].value),
    }));

    const { error } = await supabase.from("analytics_daily").upsert(rows, { onConflict: 'date' });
    if (error) throw error;

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    const isPermissionError = err.message.includes('PERMISSION_DENIED') || err.code === 7;
    const mytTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Kuala_Lumpur' }) + ' (MYT)';

    if (isPermissionError) {
      const tgMessage = `🚨 <b>LAB DISPATCH | 实验室通讯</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `📍 <b>ORIGIN:</b> <code>⚙️ SYSTEM_CORE | 系统逻辑核心</code>\n` +
        `🔗 <b>PATH:</b> <code>Cron_GA4_Sync</code>\n\n` +
        `🇬🇧 <b>[ENGLISH]</b>\n` +
        `<b>Event:</b> <code>Handshake Forbidden</code>\n` +
        `<b>Log:</b> <code>Add ${TARGET_SERVICE_EMAIL} to GA4 Property Permissions.</code>\n\n` +
        `🇪🇸 <b>[ESPAÑOL]</b>\n` +
        `<b>Evento:</b> <code>Handshake Prohibido</code>\n` +
        `<b>Log:</b> <code>Agregue el email de servicio a los permisos de GA4.</code>\n\n` +
        `🇨🇳 <b>[中文]</b>\n` +
        `<b>事件:</b> <code>访问被拒绝（权限不足）</code>\n` +
        `<b>日志:</b> <code>请将 ${TARGET_SERVICE_EMAIL} 添加到 GA4 媒体资源权限管理中。</code>\n\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>NODE:</b> <code>Cloud_Edge</code>\n` +
        `<b>TIME:</b> <code>${mytTime}</code>`;

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
      }).catch(() => {});

      return res.status(403).json({ 
        error: "PERMISSION_DENIED", 
        message: err.message,
        required_email: TARGET_SERVICE_EMAIL
      });
    }

    return res.status(500).json({ error: err.message });
  }
}
