
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v16.7
 * Incident Response Edition: Resolved 500 Internal Server Error caused by incomplete script.
 * Detailed diagnostics for unauthorized telemetry nodes.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  const querySecret = req.query.secret;
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  if (querySecret !== serverSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED_SYNC" });
  }

  const propertyId = process.env.GA_PROPERTY_ID;
  const credentialsJson = process.env.GA_SERVICE_ACCOUNT_KEY;

  if (!propertyId || !credentialsJson) {
    return res.status(500).json({ 
      error: "MISSING_CONFIGURATION", 
      message: "GA_PROPERTY_ID or GA_SERVICE_ACCOUNT_KEY not set in environment." 
    });
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (e) {
    return res.status(500).json({ error: "INVALID_CREDENTIALS_JSON" });
  }

  const analyticsClient = new BetaAnalyticsDataClient({ credentials });
  const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );

  try {
    // Fetch last 24 hours of data
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' }
      ],
    });

    const rows = response.rows || [];
    const results = [];

    for (const row of rows) {
      const date = row.dimensionValues[0].value;
      const users = parseInt(row.metricValues[0].value);
      const sessions = parseInt(row.metricValues[1].value);
      const views = parseInt(row.metricValues[2].value);

      const { data, error } = await supabase
        .from('analytics_daily')
        .upsert({
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          users,
          sessions,
          views,
          updated_at: new Date().toISOString()
        }, { onConflict: 'date' });
      
      if (error) throw error;
      results.push({ date, status: 'synced' });
    }

    return res.status(200).json({ success: true, processed: results.length, details: results });

  } catch (error) {
    const isPermissionDenied = error.message?.includes('Permission denied') || error.code === 7;
    
    // Log sync failure for admin oversight
    await supabase.from('audit_logs').insert([{
      action: 'GA4_SYNC_FAILURE',
      details: `GA4 Sync Error: ${error.message}`,
      level: 'WARNING'
    }]);

    if (isPermissionDenied) {
      return res.status(403).json({
        error: "PERMISSION_DENIED",
        is_permission_denied: true,
        service_account: credentials.client_email || DEFAULT_SA_EMAIL,
        diagnostic: {
          suggestion: "Please ensure the Service Account email has 'Viewer' access to GA4 Property.",
          target_property: propertyId
        }
      });
    }

    return res.status(500).json({ error: error.message || "GA4_SYNC_EXCEPTION" });
  }
}
