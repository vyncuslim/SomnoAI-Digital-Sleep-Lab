
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v16.9
 * Resilience + Deep Diagnostics Edition
 * Prevents recursive 500 errors by wrapping reporting logic.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
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
      message: "GA_PROPERTY_ID or GA_SERVICE_ACCOUNT_KEY environment variables are null or undefined." 
    });
  }

  let credentials;
  try {
    // Sanitize credentials: Replace escaped newlines if present from Vercel UI pasting
    const sanitized = credentialsJson.replace(/\\n/g, '\n');
    credentials = JSON.parse(sanitized);
  } catch (e) {
    return res.status(500).json({ 
      error: "INVALID_CREDENTIALS_JSON", 
      message: "Failed to parse GA_SERVICE_ACCOUNT_KEY. Check for syntax errors.",
      hint: credentialsJson.substring(0, 20) + "..."
    });
  }

  const analyticsClient = new BetaAnalyticsDataClient({ credentials });
  const supabaseUrl = process.env.SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: "SUPABASE_LINK_VOID", message: "Supabase connection variables missing." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const saEmail = credentials.client_email || DEFAULT_SA_EMAIL;

  try {
    const [response] = await analyticsClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    });

    const rows = response?.rows || [];
    const results = [];

    for (const row of rows) {
      if (!row.dimensionValues?.[0]?.value) continue;
      
      const date = row.dimensionValues[0].value;
      const { error } = await supabase
        .from('analytics_daily')
        .upsert({
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          users: parseInt(row.metricValues?.[0]?.value || '0'),
          sessions: parseInt(row.metricValues?.[1]?.value || '0'),
          views: parseInt(row.metricValues?.[2]?.value || '0'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'date' });
      
      if (error) {
         console.error("[GA_SYNC] Upsert failure:", error.message);
         throw error;
      }
      results.push({ date, status: 'synced' });
    }

    return res.status(200).json({ success: true, processed: results.length });

  } catch (error) {
    const errorMsg = error?.message || "Unknown error during analytics handshake.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    const errorType = isPermissionDenied ? 'GA4_PERMISSION_DENIED_403' : 'GA4_SYNC_FAILURE';
    
    console.error(`[GA_SYNC_CRITICAL] ${errorType}:`, errorMsg);

    // 1. Log to Audit Table (Safe Execution)
    try {
        await supabase.from('audit_logs').insert([{
          action: errorType,
          details: `Sync failure on property ${propertyId}. Trace: ${errorMsg}`,
          level: 'CRITICAL'
        }]);
    } catch (auditErr) {
        console.warn("Audit logging failed during sync error reporting.");
    }

    // 2. DISPATCH EMERGENCY TELEGRAM SIGNAL (Safe Execution)
    try {
      const tgMsg = `🚨 <b>SOMNO LAB: API INCIDENT (500/403)</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>Event:</b> <code>${errorType}</code>\n` +
        `<b>Status:</b> ${isPermissionDenied ? '403 Forbidden' : '500 Server Error'}\n` +
        `<b>Details:</b> <code>${errorMsg.substring(0, 200)}</code>\n` +
        `<b>Node Identity:</b> <code>${saEmail}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 <b>DIAGNOSTIC:</b> Verify Service Account access or Vercel Environment variables.`;
        
      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
      });
    } catch (tgErr) { 
        console.error("Telegram alert failed during sync error handling."); 
    }

    const statusCode = isPermissionDenied ? 403 : 500;
    return res.status(statusCode).json({
      error: errorType,
      message: errorMsg,
      is_permission_denied: isPermissionDenied,
      service_account: saEmail,
      diagnostic: {
        suggestion: isPermissionDenied ? "Grant 'Viewer' access to the Service Account in Google Analytics Console." : "Check API quota and server-side logs.",
        target_property: propertyId
      }
    });
  }
}
