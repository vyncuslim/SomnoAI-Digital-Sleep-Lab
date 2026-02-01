
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNOAI ANALYTICS SYNC ENGINE v3.1
 * Direct Telegram Bot Integration with HTML escaping
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: process.env.GA_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY) 
    : undefined,
});

const propertyId = process.env.GA_PROPERTY_ID;
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Helper: Escape HTML
const escapeHTML = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

// Helper: Direct Telegram Notification
const sendTelegram = async (text) => {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'HTML'
      })
    });
  } catch (e) { console.error("Internal alert dispatch failed"); }
};

const reportSyncFailure = async (errorMsg) => {
  const safeMsg = escapeHTML(errorMsg);
  const safeProp = escapeHTML(propertyId);
  const message = `🚨 <b>GA4_SYNC_CRITICAL_FAILURE</b>\n\n<b>PROPERTY:</b> <code>${safeProp}</code>\n<b>ERROR:</b> <code>${safeMsg}</code>\n<b>TIMESTAMP:</b> <code>${new Date().toISOString()}</code>\n<b>NODE:</b> <code>Vercel_API_Worker</code>`;
  
  // 1. Notify Telegram
  await sendTelegram(message);

  // 2. Commit to Audit Logs
  try {
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_ERROR",
      details: errorMsg,
      level: "CRITICAL",
      created_at: new Date().toISOString()
    }]);
  } catch (e) { console.error("Audit logging failed"); }
};

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized Access Detected" });
  }

  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    const [dailyResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    });

    if (dailyResponse.rows?.length > 0) {
      const vals = dailyResponse.rows[0].metricValues;
      const { error } = await supabase.from("analytics_daily").upsert({
        date: yesterday,
        users: parseInt(vals[0].value),
        sessions: parseInt(vals[1].value),
        pageviews: parseInt(vals[2].value),
      });
      if (error) throw error;
    }

    // Success audit
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_SUCCESS",
      details: `Telemetry captured for ${yesterday}`,
      level: "INFO",
      created_at: new Date().toISOString()
    }]);

    return res.status(200).json({ success: true, status: "SYNC_COMPLETE" });
    
  } catch (err) {
    await reportSyncFailure(err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
