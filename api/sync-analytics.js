import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v19.2
 * Enhanced robust JSON parsing and permission-aware resolution guidance.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';

async function alertAdmin(checkpoint, errorMsg, isForbidden = false) {
  const timestamp = new Date().toISOString();
  const type = isForbidden ? 'GA4_ACCESS_DENIED' : 'SYNC_ENGINE_FAULT';
  const status = isForbidden ? '403 Forbidden' : '500 Internal Error';

  try {
    const tgMsg = `🚨 <b>SOMNO LAB: ${isForbidden ? 'PERMISSION' : 'RECOVERY'} ALERT</b>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `<b>Type:</b> <code>${type}</code>\n` +
      `<b>Checkpoint:</b> <code>${checkpoint}</code>\n` +
      `<b>Status:</b> ${status}\n` +
      `<b>Reason:</b> <code>${errorMsg.substring(0, 200)}</code>\n` +
      `━━━━━━━━━━━━━━━━━━━━\n` +
      `📍 <b>ACTION:</b> ${isForbidden ? 'Grant Viewer access to the Service Account in Google Analytics Admin.' : 'Manual intervention required.'}`;
      
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text: tgMsg, parse_mode: 'HTML' })
    });
  } catch (e) { console.error("TG_DISPATCH_FAIL", e); }

  try {
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { data: recipients } = await supabase.from('notification_recipients').select('email').eq('is_active', true);
    
    if (recipients && recipients.length > 0) {
      const emailHtml = `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ef4444;">🚨 Somno AI Lab Critical Alert</h2>
          <p><b>Event Type:</b> ${type}</p>
          <p><b>Checkpoint:</b> ${checkpoint}</p>
          <p><b>HTTP Status:</b> ${status}</p>
          <p><b>Error Details:</b> <code>${errorMsg}</code></p>
          <hr/>
          <p><b>Required Action:</b> ${isForbidden ? 'Add the Service Account email to your Google Analytics Property with "Viewer" permissions.' : 'Check Vercel logs and environment variable formatting.'}</p>
          <p style="font-size: 12px; color: #666;">Generated at: ${timestamp}</p>
        </div>
      `;

      const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
      const secret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

      await Promise.all(recipients.map(r => 
        fetch(`${baseUrl}/api/send-system-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: r.email, subject: `🚨 [INCIDENT] ${type}: ${checkpoint}`, html: emailHtml, secret })
        })
      ));
    }
  } catch (e) { console.error("EMAIL_DISPATCH_FAIL", e); }
}

export default async function handler(req, res) {
  let checkpoint = "INITIALIZATION";
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
    checkpoint = "AUTH_SECRET_VERIFICATION";
    if (querySecret !== serverSecret) return res.status(401).json({ error: "UNAUTHORIZED_SYNC" });

    checkpoint = "ENV_VAR_CAPTURE";
    const { GA_PROPERTY_ID, GA_SERVICE_ACCOUNT_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;

    if (!GA_PROPERTY_ID || !GA_SERVICE_ACCOUNT_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      await alertAdmin(checkpoint, "Required variables missing.");
      return res.status(500).json({ error: "CONFIGURATION_VOID" });
    }

    checkpoint = "GA_CLIENT_INIT";
    // HIGH-RESILIENCE SCRUBBING: Handles literal newlines, escaped newlines, and surrounding quotes
    let cleanedKey = GA_SERVICE_ACCOUNT_KEY.trim();
    if (cleanedKey.startsWith('"') && cleanedKey.endsWith('"')) cleanedKey = cleanedKey.slice(1, -1);
    
    // Replace actual newlines with literal '\n' for JSON.parse compatibility
    cleanedKey = cleanedKey.replace(/\n/g, '\\n');
    
    // Fix common double-escaping issues from copy-paste
    cleanedKey = cleanedKey.replace(/\\\\n/g, '\\n');

    const credentials = JSON.parse(cleanedKey);
    const analyticsClient = new BetaAnalyticsDataClient({ credentials });

    checkpoint = "GA_API_HANDSHAKE";
    const [response] = await analyticsClient.runReport({
      property: `properties/${GA_PROPERTY_ID.trim()}`,
      dateRanges: [{ startDate: 'yesterday', endDate: 'today' }],
      dimensions: [{ name: 'date' }],
      metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }],
    });

    checkpoint = "DATA_TRANSFORMATION";
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const rows = response?.rows || [];
    for (const row of rows) {
      const date = row.dimensionValues[0].value;
      await supabase.from('analytics_daily').upsert({
        date: `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`,
        users: parseInt(row.metricValues?.[0]?.value || '0'),
        sessions: parseInt(row.metricValues?.[1]?.value || '0'),
        views: parseInt(row.metricValues?.[2]?.value || '0'),
        updated_at: new Date().toISOString()
      }, { onConflict: 'date' });
    }
    return res.status(200).json({ success: true, processed: rows.length });
  } catch (error) {
    const errorMsg = error?.message || "Unhandled exception.";
    const isPermissionDenied = errorMsg.includes('Permission denied') || errorMsg.includes('not have permission') || error.code === 7;
    await alertAdmin(checkpoint, errorMsg, isPermissionDenied);
    return res.status(isPermissionDenied ? 403 : 500).json({ 
      error: 'SYNC_CRASH', 
      message: errorMsg, 
      failed_at: checkpoint,
      is_permission_denied: isPermissionDenied
    });
  }
}