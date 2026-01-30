
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNOAI ANALYTICS SYNC ENGINE v2.0
 * Triggered by Vercel Cron
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

export default async function handler(req, res) {
  // Security Handshake
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: "UNAUTHORIZED_CRON_ACCESS" });
  }

  try {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

    // 1. Fetch Daily Core Metrics
    const [dailyResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [{ name: "totalUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    });

    if (dailyResponse.rows?.length > 0) {
      const vals = dailyResponse.rows[0].metricValues;
      await supabase.from("analytics_daily").upsert({
        date: yesterday,
        users: parseInt(vals[0].value),
        sessions: parseInt(vals[1].value),
        pageviews: parseInt(vals[2].value),
      });
    }

    // 2. Fetch Geographic Ranking
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
      await supabase.from("analytics_country").upsert(geoData, { onConflict: "date, country" });
    }

    // 3. Fetch Device Proportions
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
      await supabase.from("analytics_device").upsert(deviceData, { onConflict: "date, device" });
    }

    return res.status(200).json({ status: "SYNC_COMPLETE", target: yesterday });
  } catch (err) {
    console.error("TELEMETRY_SYNC_CRITICAL_FAILURE:", err);
    return res.status(500).json({ error: err.message });
  }
}
