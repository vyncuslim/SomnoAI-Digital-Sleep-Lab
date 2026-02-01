
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC v9.0 - MULTI-LINGUAL DIAGNOSTICS
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const ADMIN_EMAIL = 'ongyuze1401@gmail.com';

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
      throw new Error("API_KEY_MISSING_IN_ENV");
    }

    const client = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY),
    });

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

    const tgMessage = `🚨 <b>GA4 SYNC FAILURE | GA4 同步故障</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🇬🇧 <b>[ENGLISH]</b>\n` +
      `<b>Status:</b> Permission Denied\n` +
      `<b>Diagnostic:</b> The service account does not have access to Property ID <code>${process.env.GA_PROPERTY_ID}</code>.\n` +
      `<b>Action:</b> Add your service account email to GA4 "Property Access Management".\n\n` +
      `🇨🇳 <b>[中文]</b>\n` +
      `<b>状态:</b> 访问受限\n` +
      `<b>诊断:</b> 服务账号无权访问 Property ID <code>${process.env.GA_PROPERTY_ID}</code>。\n` +
      `<b>对策:</b> 请在 GA4 的“媒体资源访问管理”中添加该服务号邮箱。\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>TIME:</b> <code>${mytTime}</code>`;

    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
    }).catch(() => {});

    return res.status(500).json({ error: err.message });
  }
}
