
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v12.0
 * Optimized for UptimeRobot Scheduler with enhanced Audit Logging & Error Isolation
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const SERVICE_ACCOUNT_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  const authHeader = req.headers.authorization;
  const querySecret = req.query.secret;
  const userAgent = req.headers["user-agent"] || "";
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  // 1. Security Verification
  const isAuthorized = (querySecret === serverSecret) || (authHeader === `Bearer ${serverSecret}`);
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');

  if (!isAuthorized) {
    console.warn("[GATEWAY] Unauthorized Cron Access Attempt.");
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  // Define response utility to ensure JSON consistency
  const sendError = async (status, error, detail, code = "SYNC_FAILURE") => {
    // Try to log to audit if possible, but don't crash the response if Supabase fails
    try {
      if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        await supabase.from('audit_logs').insert([{
          action: 'GA4_SYNC_FAILURE',
          details: `Status: ${status} | Error: ${detail} | Code: ${error}`,
          level: status === 403 ? 'CRITICAL' : 'WARNING'
        }]);
      }
    } catch (e) {
      console.error("[GATEWAY_AUDIT] Failed to commit log:", e.message);
    }
    return res.status(status).json({ error, detail, code });
  };

  try {
    // 2. Environment Validation
    if (!process.env.GA_PROPERTY_ID || !process.env.GA_SERVICE_ACCOUNT_KEY) {
      return sendError(500, "ENV_MISCONFIGURED", "GA_PROPERTY_ID or GA_SERVICE_ACCOUNT_KEY is missing from server environment.");
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return sendError(500, "ENV_MISCONFIGURED", "Supabase credentials missing from server environment.");
    }

    let credentials;
    try {
      credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      return sendError(500, "JSON_PARSE_ERROR", "Failed to parse GA_SERVICE_ACCOUNT_KEY environment variable.");
    }

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
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      const { error: upsertError } = await supabase
        .from("analytics_daily")
        .upsert(rows, { onConflict: 'date' });
      
      if (upsertError) throw upsertError;
    }

    return res.status(200).json({ 
      success: true, 
      count: rows.length, 
      source: userAgent.includes("UptimeRobot") ? "UptimeRobot_Scheduler" : "Manual_Trigger",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[GATEWAY_EXCEPTION]", err);
    const isPermissionError = err.message?.includes('PERMISSION_DENIED') || err.code === 7;
    const status = isPermissionError ? 403 : 500;
    const detail = isPermissionError ? `Add ${SERVICE_ACCOUNT_EMAIL} to GA4 as Viewer.` : err.message;
    
    return sendError(status, "SYNC_FAILURE", detail);
  }
}
