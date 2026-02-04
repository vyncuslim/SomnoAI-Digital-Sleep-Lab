import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v56.0
 * Optimized for diagnostic clarity on 403/Permission errors.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const FALLBACK_PROPERTY_ID = "380909155"; 

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  while ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1).trim();
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      return JSON.parse(str.replace(/\n/g, "\\n"));
    } catch (e2) { return null; }
  }
}

export default async function handler(req, res) {
  let currentSaEmail = "UNKNOWN";
  const rawPropertyId = process.env.GA_PROPERTY_ID || FALLBACK_PROPERTY_ID;
  const targetPropertyId = String(rawPropertyId).replace(/\D/g, ''); 
  let gcpProjectId = "UNKNOWN";

  // Pre-emptive extraction for troubleshooting
  if (process.env.GA_SERVICE_ACCOUNT_KEY) {
    const creds = robustParse(process.env.GA_SERVICE_ACCOUNT_KEY);
    if (creds) {
      currentSaEmail = creds.client_email || "KEY_INVALID";
      gcpProjectId = creds.project_id || "UNKNOWN";
    }
  }

  try {
    const secret = req.query.secret || req.body?.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    
    if (secret !== serverSecret) {
      return res.status(200).json({ error: "UNAUTHORIZED_VOID" });
    }

    const credentials = robustParse(process.env.GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.private_key) throw new Error("GA_KEY_STRUCTURE_INVALID");
    
    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: credentials.private_key.replace(/\\n/g, '\n') } 
    });

    const [response] = await analyticsClient.runReport({
      property: `properties/${targetPropertyId}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }],
    });

    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const rows = response?.rows || [];
    for (const row of rows) {
      const dateStr = row.dimensionValues[0].value;
      await supabase.from('analytics_daily').upsert({
        date: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });
    }
    
    return res.status(200).json({ 
      success: true, 
      property: targetPropertyId, 
      service_account: currentSaEmail,
      project_id: gcpProjectId
    });
  } catch (error) {
    const errorMsg = error?.message || "Infrastructure timeout.";
    const isForbidden = errorMsg.toLowerCase().includes('permission') || error.code === 7;
    
    // Check if it's explicitly an API not enabled error
    const isApiNotEnabled = errorMsg.includes('Google Analytics Data API has not been used');

    return res.status(isForbidden ? 403 : 500).json({ 
      success: false, 
      error: errorMsg,
      is_api_disabled: isApiNotEnabled,
      service_account: currentSaEmail,
      property: targetPropertyId,
      project_id: gcpProjectId
    });
  }
}