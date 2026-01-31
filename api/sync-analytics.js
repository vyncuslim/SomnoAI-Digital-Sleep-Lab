
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNOAI ANALYTICS SYNC ENGINE v2.3
 * Triggered by Vercel Cron
 * Integrated with Telegram Alerts & Audit Logs
 */

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

// 辅助函数：同步预警与日志
const reportSyncFailure = async (errorMsg) => {
  const message = `🚨 GA4_SYNC_CRITICAL_FAILURE\nPROPERTY: ${propertyId}\nERROR: ${errorMsg}\nTIME: ${new Date().toISOString()}`;
  
  // 1. 尝试通知 Telegram (调用 Supabase Edge Function 或内部逻辑)
  try {
    await fetch(`${process.env.SUPABASE_URL}/functions/v1/notify_telegram`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ message })
    });
  } catch (e) { console.error("Alert notification failed"); }

  // 2. 写入 audit_logs
  try {
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_ERROR",
      details: errorMsg,
      level: "CRITICAL",
      timestamp: new Date().toISOString()
    }]);
  } catch (e) { console.error("Audit logging failed"); }
};

export default async function handler(req, res) {
  // 1. SECURITY HANDSHAKE
  const authHeader = req.headers.authorization;
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.error("UNAUTHORIZED_SYNC_ATTEMPT");
    return res.status(401).json({ error: "Unauthorized Access Detected" });
  }

  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 2. Fetch Daily Metrics from GA4
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

    // 3. Fetch Geo Rankings
    const [geoResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "country" }],
      metrics: [{ name: "totalUsers" }],
    });

    const geoData = geoResponse.rows?.map(row => ({
      date: yesterday,
      country: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    if (geoData.length > 0) {
      const { error } = await supabase.from("analytics_country").upsert(geoData, { onConflict: "date, country" });
      if (error) throw error;
    }

    // 4. Fetch Device Segments
    const [deviceResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      dimensions: [{ name: "deviceCategory" }],
      metrics: [{ name: "totalUsers" }],
    });

    const deviceData = deviceResponse.rows?.map(row => ({
      date: yesterday,
      device: row.dimensionValues[0].value,
      users: parseInt(row.metricValues[0].value)
    })) || [];

    if (deviceData.length > 0) {
      const { error } = await supabase.from("analytics_device").upsert(deviceData, { onConflict: "date, device" });
      if (error) throw error;
    }

    // 记录成功审计
    await supabase.from("audit_logs").insert([{
      action: "GA4_SYNC_SUCCESS",
      details: `Telemetry captured for ${yesterday}`,
      level: "INFO"
    }]);

    return res.status(200).json({ success: true, status: "SYNC_COMPLETE" });
    
  } catch (err) {
    await reportSyncFailure(err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
