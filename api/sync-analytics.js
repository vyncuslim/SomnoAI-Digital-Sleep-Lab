
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNOAI ANALYTICS SYNC ENGINE v3.2
 * Synchronizes GA4 Cloud Telemetry to Supabase Persistence
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const INTERNAL_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const escapeHTML = (str) => {
  if (!str) return 'null';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

const sendTelegramAlert = async (text) => {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("Alert dispatch failed"); }
};

export default async function handler(req, res) {
  // 1. Authorization Check
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${INTERNAL_SECRET}` && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "UNAUTHORIZED_NODE: Invalid Handshake Secret" });
  }

  // 2. Environment Validation
  if (!process.env.GA_PROPERTY_ID || !process.env.GA_SERVICE_ACCOUNT_KEY) {
    const err = "MISSING_ENV_VARS: GA_PROPERTY_ID or GA_SERVICE_ACCOUNT_KEY not defined.";
    await sendTelegramAlert(`🚨 <b>GA4_CONFIG_VOID</b>\n${err}`);
    return res.status(500).json({ error: err });
  }

  try {
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY),
    });

    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 3. Fetch Data from GA4
    const [dailyResponse] = await analyticsDataClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      metrics: [
        { name: "totalUsers" }, 
        { name: "sessions" }, 
        { name: "screenPageViews" }
      ],
      dimensions: [{ name: "date" }]
    });

    // 4. Batch Upsert to Supabase
    if (dailyResponse.rows?.length > 0) {
      const rows = dailyResponse.rows.map(row => ({
        // GA4 date format is YYYYMMDD
        date: `${row.dimensionValues[0].value.slice(0, 4)}-${row.dimensionValues[0].value.slice(4, 6)}-${row.dimensionValues[0].value.slice(6, 8)}`,
        users: parseInt(row.metricValues[0].value),
        sessions: parseInt(row.metricValues[1].value),
        pageviews: parseInt(row.metricValues[2].value),
      }));

      const { error } = await supabase.from("analytics_daily").upsert(rows, { onConflict: 'date' });
      if (error) throw error;
    }

    // 5. Log Success
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_SUCCESS",
      details: `Telemetry sync complete for ${dailyResponse.rows?.length || 0} days.`,
      level: "INFO"
    }]);

    return res.status(200).json({ success: true, count: dailyResponse.rows?.length });

  } catch (err) {
    const safeMsg = escapeHTML(err.message);
    await sendTelegramAlert(`🚨 <b>GA4_SYNC_FAILURE</b>\n\n<b>Error:</b> <code>${safeMsg}</code>\n<b>Node:</b> <code>Vercel_Worker</code>`);
    
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_ERROR",
      details: err.message,
      level: "CRITICAL"
    }]);

    return res.status(500).json({ error: err.message });
  }
}
