
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v17.0
 * Ultra-Resilience Edition
 * Designed to capture all unhandled exceptions and prevent generic 500s.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  // Wrap everything in a massive try-catch to prevent generic 500s
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

    if (querySecret !== serverSecret) {
      return res.status(401).json({ error: "UNAUTHORIZED_SYNC", message: "Secret key mismatch." });
    }

    const propertyId = process.env.GA_PROPERTY_ID;
    const credentialsJson = process.env.GA_SERVICE_ACCOUNT_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // 1. Pre-flight check for environment variables
    const missing = [];
    if (!propertyId) missing.push("GA_PROPERTY_ID");
    if (!credentialsJson) missing.push("GA_SERVICE_ACCOUNT_KEY");
    if (!supabaseUrl) missing.push("SUPABASE_URL");
    if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");

    if (missing.length > 0) {
      return res.status(500).json({ 
        error: "MISSING_ENV_VARS", 
        message: `Missing: ${missing.join(", ")}`,
        diagnostic: "Check Vercel Project Settings > Environment Variables."
      });
    }

    // 2. Parse Credentials safely
    let credentials;
    try {
      const sanitized = credentialsJson.replace(/\\n/g, '\n');
      credentials = JSON.parse(sanitized);
    } catch (e) {
      return res.status(500).json({ 
        error: "INVALID_CREDENTIALS_JSON", 
        message: "Failed to parse GA_SERVICE_ACCOUNT_KEY. Check JSON syntax.",
        hint: credentialsJson.substring(0, 15) + "..."
      });
    }

    const saEmail = credentials.client_email || DEFAULT_SA_EMAIL;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Initialize Analytics Client
    let analyticsClient;
    try {
      analyticsClient = new BetaAnalyticsDataClient({ credentials });
    } catch (initErr) {
      return res.status(500).json({ 
        error: "CLIENT_INIT_FAILED", 
        message: initErr.message 
      });
    }

    // 4. Execute Report
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
      const { error: upsertErr } = await supabase
        .from('analytics_daily')
        .upsert({
          date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
          users: parseInt(row.metricValues?.[0]?.value || '0'),
          sessions: parseInt(row.metricValues?.[1]?.value || '0'),
          views: parseInt(row.metricValues?.[2]?.value || '0'),
          updated_at: new Date().toISOString()
        }, { onConflict: 'date' });
      
      if (upsertErr) {
         throw new Error(`DB_UPSERT_FAILURE: ${upsertErr.message}`);
      }
      results.push({ date, status: 'synced' });
    }

    return res.status(200).json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    // 5. Handle all errors gracefully
    const errorMsg = error?.message || "Unknown runtime exception during telemetry sync.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    const errorType = isPermissionDenied ? 'GA4_PERMISSION_DENIED_403' : 'SYNC_RUNTIME_FAULT';
    
    console.error(`[SYNC_ERROR_TRACE]`, error);

    // Attempt to notify admin (fire and forget)
    try {
      const tgMsg = `🚨 <b>SOMNO LAB: CRITICAL API ERROR</b>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `<b>Type:</b> <code>${errorType}</code>\n` +
        `<b>Message:</b> <code>${errorMsg.substring(0, 300)}</code>\n` +
        `<b>Timestamp:</b> <code>${new Date().toISOString()}</code>\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `📍 <b>SYSTEM:</b> Manual intervention required in Vercel/GA Console.`;
        
      fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
      }).catch(() => {});
    } catch (notifErr) {}

    return res.status(isPermissionDenied ? 403 : 500).json({
      error: errorType,
      message: errorMsg,
      timestamp: new Date().toISOString(),
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
