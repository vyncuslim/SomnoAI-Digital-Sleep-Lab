
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v13.2
 * Global try-catch protected to ensure diagnostic link integrity.
 */

const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Type', 'application/json');

    if (querySecret !== serverSecret) {
      return res.status(401).json({ 
        error: "UNAUTHORIZED_PULSE", 
        detail: "Secret mismatch. Verify Vercel CRON_SECRET." 
      });
    }

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const envStatus = {};
    const fingerprints = {};

    const checkList = [
      'GA_PROPERTY_ID', 
      'GA_SERVICE_ACCOUNT_KEY', 
      'SUPABASE_URL', 
      'SUPABASE_SERVICE_ROLE_KEY', 
      'API_KEY',
      'SMTP_USER'
    ];

    checkList.forEach(key => {
      const val = process.env[key];
      envStatus[key] = !!val;
      if (val && typeof val === 'string') {
        fingerprints[key] = `${val.substring(0, 4)}... (Len: ${val.length})`;
      } else if (val) {
        fingerprints[key] = `TYPE: ${typeof val} (Len: ${String(val).length})`;
      }
    });

    let activeSaEmail = DEFAULT_SA_EMAIL;
    try {
      if (process.env.GA_SERVICE_ACCOUNT_KEY) {
        const sanitized = process.env.GA_SERVICE_ACCOUNT_KEY.replace(/\\n/g, '\n');
        const keyJson = JSON.parse(sanitized);
        activeSaEmail = keyJson.client_email || activeSaEmail;
      }
    } catch (e) {
        envStatus['GA_KEY_PARSE_STATUS'] = 'FAIL';
    }

    let dbStatus = "OFFLINE";
    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
            if (!dbError) dbStatus = "ONLINE";
            else dbStatus = `ERROR: ${dbError.message}`;
        } catch (dbEx) {
            dbStatus = `INIT_CRASH: ${dbEx.message}`;
        }
    }

    return res.status(200).json({ 
      status: "NOMINAL",
      db: dbStatus,
      env: envStatus,
      fingerprints,
      service_account_email: activeSaEmail,
      vercel_runtime: process.env.VERCEL_ENV || 'production',
      node_version: process.version,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    console.error("[PULSE_FATAL]", e);
    return res.status(500).json({ 
        error: "MONITOR_EXCEPTION", 
        details: e.message,
        timestamp: new Date().toISOString()
    });
  }
}
