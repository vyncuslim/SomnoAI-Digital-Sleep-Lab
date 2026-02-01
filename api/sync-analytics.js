
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v15.0
 * 诊断增强版：返回完整的 Google API 堆栈信息
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'application/json');

  const querySecret = req.query.secret;
  const authHeader = req.headers.authorization;
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  const isAuthorized = (querySecret === serverSecret) || (authHeader === `Bearer ${serverSecret}`);
  if (!isAuthorized) {
    return res.status(401).json({ error: "UNAUTHORIZED_GATEWAY", detail: "Secret mismatch." });
  }

  const requiredKeys = ['GA_PROPERTY_ID', 'GA_SERVICE_ACCOUNT_KEY', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
  const missingKeys = requiredKeys.filter(k => !process.env[k]);

  if (missingKeys.length > 0) {
    return res.status(500).json({ error: "ENV_MISCONFIGURED", missing: missingKeys });
  }

  let credentials;
  try {
    credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
  } catch (e) {
    return res.status(500).json({ error: "JSON_PARSE_ERROR", detail: "GA_SERVICE_ACCOUNT_KEY is not a valid JSON." });
  }

  const saEmail = credentials.client_email || DEFAULT_SA_EMAIL;
  const propertyId = process.env.GA_PROPERTY_ID;

  try {
    const gaClient = new BetaAnalyticsDataClient({ credentials });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    const [response] = await gaClient.runReport({
      property: `properties/${propertyId}`,
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

    return res.status(200).json({ 
      success: true, 
      count: rows.length,
      property_id_used: `${propertyId.substring(0,3)}***` 
    });

  } catch (err) {
    const isPermissionError = err.message?.includes('PERMISSION_DENIED') || err.code === 7;
    const isNotFoundError = err.message?.includes('NOT_FOUND') || err.code === 5;
    
    return res.status(isPermissionError ? 403 : (isNotFoundError ? 404 : 500)).json({ 
      error: "EXECUTION_FAILURE", 
      is_permission_denied: isPermissionError,
      is_not_found: isNotFoundError,
      target_email: saEmail,
      raw_google_error: err.message,
      diagnostic: {
        property_id_used: propertyId,
        service_account: saEmail,
        suggestion: isPermissionError 
          ? `Add '${saEmail}' to GA4 Property Users as 'Viewer'.` 
          : (isNotFoundError ? "Check if GA_PROPERTY_ID is correct (Numeric ID, not G-XXXXX)." : "Unknown upstream error.")
      }
    });
  }
}
