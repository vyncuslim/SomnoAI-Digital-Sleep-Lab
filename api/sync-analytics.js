
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const SERVICE_ACCOUNT_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  if (authHeader !== `Bearer ${serverSecret}`) {
    return res.status(401).json({ error: "UNAUTHORIZED_ACCESS" });
  }

  try {
    if (!process.env.GA_PROPERTY_ID || !process.env.GA_SERVICE_ACCOUNT_KEY) {
      throw new Error("SERVER_ENV_MISSING");
    }

    const credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
    const client = new BetaAnalyticsDataClient({ credentials });

    const [response] = await client.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
    });

    const rows = (response.rows || []).map(row => ({
      date: `${row.dimensionValues[0].value.slice(0,4)}-${row.dimensionValues[0].value.slice(4,6)}-${row.dimensionValues[0].value.slice(6,8)}`,
      users: parseInt(row.metricValues[0].value),
      pageviews: parseInt(row.metricValues[1].value),
    }));

    if (rows.length > 0) {
      await supabase.from("analytics_daily").upsert(rows, { onConflict: 'date' });
    }

    return res.status(200).json({ success: true, count: rows.length });
  } catch (err) {
    const isPermissionError = err.message.includes('PERMISSION_DENIED') || err.code === 7;
    
    // 如果是权限错误，构造一个包含具体修复指令的错误消息
    const detailedError = isPermissionError 
      ? `PERMISSION_DENIED: Service account lacks access to Property ${process.env.GA_PROPERTY_ID}. Please add "${SERVICE_ACCOUNT_EMAIL}" to GA4 users with "Viewer" role.`
      : err.message;

    console.error("GA4_SYNC_FAILURE:", detailedError);
    
    return res.status(isPermissionError ? 403 : 500).json({ 
      error: isPermissionError ? "GA4_AUTH_REQUIRED" : "SYNC_ERROR",
      message: detailedError 
    });
  }
}
