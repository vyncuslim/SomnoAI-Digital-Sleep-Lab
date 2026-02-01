
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC v7.5 (Multi-Lingual Global Dispatch)
 * Enhanced Localization Mirroring
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
      throw new Error("Configuration Void: Missing GA4 credentials.");
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
        return res.status(200).json({ success: true, message: "REGISTRY_UP_TO_DATE" });
    }

    const rows = response.rows.map(row => ({
      date: `${row.dimensionValues[0].value.slice(0,4)}-${row.dimensionValues[0].value.slice(4,6)}-${row.dimensionValues[0].value.slice(6,8)}`,
      users: parseInt(row.metricValues[0].value),
      pageviews: parseInt(row.metricValues[1].value),
    }));

    const { error } = await supabase.from("analytics_daily").upsert(rows, { onConflict: 'date' });
    if (error) throw error;

    await supabase.from('audit_logs').insert([{
        action: 'GA4_SYNC_SUCCESS',
        details: `Registry refreshed: ${rows.length} records mirrored.`,
        level: 'INFO'
    }]);

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    const nodeName = req.headers.host || 'Cloud_Edge';
    const mytTime = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Kuala_Lumpur', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date()) + ' (MYT)';
    
    // Multi-lingual Structural Message
    const tgMessage = `🚨 <b>MIRROR LINK SEVERED</b>\n━━━━━━━━━━━━━━━━━━━━\n\n` +
      `🇬🇧 <b>[ENGLISH]</b>\nGA4 telemetry sync failure. Registry update aborted.\n<code>${err.message}</code>\n\n` +
      `🇪🇸 <b>[ESPAÑOL]</b>\nError de sincronización GA4. Actualización del registro cancelada.\n\n` +
      `🇨🇳 <b>[中文]</b>\nGA4 数据同步故障。注册表更新已中止。\n\n` +
      `━━━━━━━━━━━━━━━━━━━━\n<b>NODE:</b> <code>${nodeName}</code>\n<b>TIME:</b> <code>${mytTime}</code>`;
    
    // 1. Dispatch Telegram
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMessage, parse_mode: 'HTML' })
    }).catch(() => {});

    // 2. Dispatch Email
    const emailHtml = `
      <div style="font-family:sans-serif;background-color:#020617;color:#f1f5f9;padding:40px;border-radius:20px;border:1px solid #ef4444;">
        <h2 style="color:#ef4444;text-align:center;">🚨 Mirror Link Severed</h2>
        <hr style="border-color:#1e293b;"/>
        <div style="margin:20px 0;">
          <p><b>🇬🇧 [EN]</b> GA4 telemetry sync failure. Update aborted.</p>
          <p><b>🇪🇸 [ES]</b> Error de sincronización GA4. Actualización cancelada.</p>
          <p><b>🇨🇳 [ZH]</b> GA4 数据同步故障。更新已中止。</p>
        </div>
        <div style="background:#050a1f;padding:20px;border-radius:10px;font-family:monospace;color:#fca5a5;border:1px solid #1e293b;">
          ${err.message}
        </div>
        <p style="font-size:10px;color:#475569;margin-top:20px;text-align:center;">NODE: ${nodeName} | TIME: ${mytTime}</p>
      </div>
    `;

    await fetch(`https://${nodeName}/api/send-system-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          to: ADMIN_EMAIL, 
          subject: "🚨 Critical: GA4 Mirror Link Severed", 
          html: emailHtml,
          secret: process.env.CRON_SECRET
      }),
    }).catch(() => {});
    
    return res.status(500).json({ error: err.message });
  }
}
