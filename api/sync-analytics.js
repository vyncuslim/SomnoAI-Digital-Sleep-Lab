
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

// Initialize GA Client
const analyticsDataClient = new BetaAnalyticsDataClient({
  credentials: process.env.GA_SERVICE_ACCOUNT_KEY 
    ? JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY) 
    : undefined,
});

const propertyId = process.env.GA_PROPERTY_ID;

// Initialize Supabase Client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://ojcvvtyaebdodmegwqan.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  // Ensure we only allow Vercel Cron or specific authorized calls
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    if (!propertyId) throw new Error("GA_PROPERTY_ID missing");

    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
      metrics: [
        { name: "totalUsers" },
        { name: "sessions" },
        { name: "screenPageViews" }
      ],
    });

    const row = response.rows?.[0]?.metricValues;
    if (!row) throw new Error("Empty data returned from GA");

    const users = parseInt(row[0].value);
    const sessions = parseInt(row[1].value);
    const pageviews = parseInt(row[2].value);

    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    const { error } = await supabase.from("analytics_daily").upsert({
      date: yesterday,
      users,
      sessions,
      pageviews,
    }, { onConflict: "date" });

    if (error) throw error;

    return res.status(200).json({ 
      message: "Sync success", 
      date: yesterday,
      stats: { users, sessions, pageviews }
    });
  } catch (err) {
    console.error("Sync Failure:", err);
    return res.status(500).json({ error: "Sync failed", detail: err.message });
  }
}
