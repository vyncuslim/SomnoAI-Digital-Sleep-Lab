
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC v6.0 (High Precision)
 * Improved Error Handling & Smart Notifications
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
    if (!process.env.GA_PROPERTY_ID || !process.env.GA_SERVICE_ACCOUNT_KEY) {
      throw new Error("Configuration Void: Missing GA4 credentials.");
    }

    const client = new BetaAnalyticsDataClient({
      credentials: JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY),
    });

    // Fetch primary metrics
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

    // Perform Upsert
    const { error } = await supabase.from("analytics_daily").upsert(rows, { onConflict: 'date' });
    if (error) throw error;

    // Log internally but DON'T spam Telegram unless there's a specific need or manual trigger
    await supabase.from('audit_logs').insert([{
        action: 'GA4_SYNC_SUCCESS',
        details: `Registry refreshed: ${rows.length} records mirrored.`,
        level: 'INFO'
    }]);

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    // Only notify Telegram on ACTUAL errors
    const errorMsg = `🚨 <b>GA4 SYNC FAILURE</b>\n<code>${err.message}</code>`;
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: errorMsg, parse_mode: 'HTML' })
    });
    
    return res.status(500).json({ error: err.message });
  }
}
