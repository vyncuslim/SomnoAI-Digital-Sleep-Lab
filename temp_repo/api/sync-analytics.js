import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v63.0
 * Optimized for diagnostic clarity and robust environment key extraction.
 */

const FALLBACK_PROPERTY_ID = process.env.GA_PROPERTY_ID; 

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  // Remove wrapping quotes if they exist (common Vercel/Node environment artifact)
  while ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
    str = str.slice(1, -1).trim();
  }
  try {
    return JSON.parse(str);
  } catch (e) {
    try {
      // Attempt repair for escaped characters and newlines
      const repaired = str.replace(/\\n/g, '\n').replace(/\n/g, '\\n');
      return JSON.parse(repaired);
    } catch (e2) { 
      // Last resort: simple string cleaning
      try {
        return JSON.parse(str.replace(/[\u0000-\u001F]+/g, ""));
      } catch (e3) { return null; }
    }
  }
}

export default async function handler(req, res) {
  let currentSaEmail = "UNKNOWN";
  const rawPropertyId = process.env.GA_PROPERTY_ID || FALLBACK_PROPERTY_ID;
  
  // Requirement: Enforce strict numeric string format for Property ID
  const targetPropertyId = String(rawPropertyId).trim().replace(/\D/g, ''); 
  
  let gcpProjectId = "UNKNOWN";

  if (!targetPropertyId || targetPropertyId.length < 5) {
    return res.status(400).json({ success: false, error: "INVALID_PROPERTY_ID_FORMAT" });
  }

  // Diagnostic metadata extraction for logging
  if (process.env.GA_SERVICE_ACCOUNT_KEY) {
    const creds = robustParse(process.env.GA_SERVICE_ACCOUNT_KEY);
    if (creds) {
      currentSaEmail = creds.client_email || "KEY_PARTIAL_VALID";
      gcpProjectId = creds.project_id || "MISSING_PROJECT_ID";
    }
  }

  try {
    const secret = req.query.secret || req.body?.secret;
    const serverSecret = process.env.CRON_SECRET;
    
    if (!serverSecret || secret !== serverSecret) {
      return res.status(401).json({ error: "UNAUTHORIZED_VOID" });
    }

    const credentials = robustParse(process.env.GA_SERVICE_ACCOUNT_KEY);
    if (!credentials || !credentials.private_key) {
       throw new Error("GA_KEY_STRUCTURE_INVALID: Ensure private_key is present in GA_SERVICE_ACCOUNT_KEY environment variable.");
    }
    
    // Explicitly handle newline characters in the private key
    const sanitizedKey = credentials.private_key.includes('\\n') 
      ? credentials.private_key.replace(/\\n/g, '\n') 
      : credentials.private_key;

    const analyticsClient = new BetaAnalyticsDataClient({ 
      credentials: { ...credentials, private_key: sanitizedKey } 
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
    
    console.log(`[GA4_SYNC_SUCCESS] Property: ${targetPropertyId} | Rows: ${rows.length}`);

    return res.status(200).json({ 
      success: true, 
      property: targetPropertyId, 
      service_account: currentSaEmail,
      project_id: gcpProjectId,
      rows_synced: rows.length
    });
  } catch (error) {
    const errorMsg = error?.message || "Infrastructure connectivity fault.";
    const isForbidden = errorMsg.toLowerCase().includes('permission') || error.code === 7;
    
    console.error(`[GA4_HANDSHAKE_ERROR] Source: ${currentSaEmail} | TargetProp: ${targetPropertyId} | Error: ${errorMsg}`);

    return res.status(isForbidden ? 403 : 500).json({ 
      success: false, 
      error: errorMsg,
      diagnostic: {
        service_account: currentSaEmail,
        property_id: targetPropertyId,
        project_id: gcpProjectId,
        suggestion: isForbidden 
          ? "Ensure service account email has 'Viewer' access to the GA4 Property ID." 
          : "Verify API enablement and key formatting in Vercel."
      }
    });
  }
}