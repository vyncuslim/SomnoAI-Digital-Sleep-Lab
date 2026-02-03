
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v17.5
 * Incident Recovery & Deep Trace Edition
 * Purpose: Track exactly where the 500 error occurs using internal checkpoints.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

    checkpoint = "AUTH_SECRET_VERIFICATION";
    if (querySecret !== serverSecret) {
      return res.status(401).json({ error: "UNAUTHORIZED_SYNC", message: "Key mismatch." });
    }

    checkpoint = "ENV_VAR_CAPTURE";
    const propertyId = process.env.GA_PROPERTY_ID;
    const credentialsJson = process.env.GA_SERVICE_ACCOUNT_KEY;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!propertyId || !credentialsJson || !supabaseUrl || !supabaseKey) {
      const missing = [];
      if (!propertyId) missing.push("GA_PROPERTY_ID");
      if (!credentialsJson) missing.push("GA_SERVICE_ACCOUNT_KEY");
      if (!supabaseUrl) missing.push("SUPABASE_URL");
      if (!supabaseKey) missing.push("SUPABASE_SERVICE_ROLE_KEY");
      
      return res.status(500).json({ 
        error: "CONFIGURATION_VOID", 
        checkpoint,
        message: `Required variables missing: ${missing.join(", ")}` 
      });
    }

    checkpoint = "CREDENTIAL_SANITIZATION";
    let credentials;
    try {
      // Handle Vercel's multi-line environment variable escaping
      const sanitized = credentialsJson.trim().replace(/\\n/g, '\n');
      credentials = JSON.parse(sanitized);
    } catch (parseErr) {
      return res.status(500).json({ 
        error: "JSON_PARSE_CRASH", 
        checkpoint,
        message: "Failed to parse GA_SERVICE_ACCOUNT_KEY. Ensure it is a valid JSON block.",
        hint: credentialsJson.substring(0, 15) + "..."
      });
    }

    checkpoint = "SUPABASE_CLIENT_INIT";
    const supabase = createClient(supabaseUrl, supabaseKey);

    checkpoint = "GA_CLIENT_INIT";
    let analyticsClient;
    try {
      analyticsClient = new BetaAnalyticsDataClient({ credentials });
    } catch (clientErr) {
      throw new Error(`GA_CLIENT_CONSTRUCT_FAIL: ${clientErr.message}`);
    }

    checkpoint = "GA_API_HANDSHAKE";
    // We strictly use the property string format requested by the SDK
    const [response] = await analyticsClient.runReport({
      property: `properties/${String(propertyId).trim()}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    });

    checkpoint = "DATA_TRANSFORMATION";
    const rows = response?.rows || [];
    const results = [];

    for (const row of rows) {
      checkpoint = `DB_UPSERT_${row.dimensionValues?.[0]?.value || 'UNKNOWN'}`;
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
      
      if (upsertErr) throw new Error(`DB_SYNC_FAIL: ${upsertErr.message}`);
      results.push({ date, status: 'synced' });
    }

    return res.status(200).json({ 
      success: true, 
      processed: results.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    const errorMsg = error?.message || "Unhandled exception in sync gateway.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || error.code === 7;
    const errorType = isPermissionDenied ? 'GA4_PERMISSION_DENIED' : 'GATEWAY_FATAL_CRASH';
    
    console.error(`[SYNC_ERROR][${checkpoint}]`, error);

    // EMERGENCY DISPATCH (Fire and forget, but safe)
    if (typeof fetch !== 'undefined') {
      try {
        const tgMsg = `🚨 <b>SOMNO LAB: RECOVERY ALERT</b>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `<b>Checkpoint:</b> <code>${checkpoint}</code>\n` +
          `<b>Status:</b> 500 Internal Error\n` +
          `<b>Reason:</b> <code>${errorMsg.substring(0, 200)}</code>\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `📍 <b>ACTION:</b> Verify GA Property Permissions or JSON format.`;
          
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
        }).catch(() => {});
      } catch (e) {}
    }

    return res.status(isPermissionDenied ? 403 : 500).json({
      error: errorType,
      message: errorMsg,
      failed_at: checkpoint,
      is_permission_denied: isPermissionDenied,
      timestamp: new Date().toISOString()
    });
  }
}
