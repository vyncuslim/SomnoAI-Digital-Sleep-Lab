import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v13.7
 * Secure diagnostic logic with robust multi-pass JSON parsing.
 */

const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

function robustParse(input) {
  if (!input) return null;
  let str = input.trim();
  try {
    const p = JSON.parse(str);
    if (typeof p === 'object' && p !== null) return p;
    if (typeof p === 'string') str = p;
  } catch (e) {}
  if (str.startsWith("'") && str.endsWith("'")) str = str.slice(1, -1);
  if (str.startsWith('"') && str.endsWith('"')) str = str.slice(1, -1);
  try {
    const repaired = str.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
    return JSON.parse(repaired);
  } catch (e) {
    try {
      const literal = str.replace(/\\n/g, '\n');
      return JSON.parse(literal);
    } catch (e2) { return null; }
  }
}

export default async function handler(req, res) {
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET || "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Type', 'application/json');

    if (querySecret !== serverSecret) {
      return res.status(401).json({ error: "UNAUTHORIZED_PULSE" });
    }

    const supabaseUrl = process.env.SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    const envStatus = {};
    const fingerprints = {};

    const checkList = ['GA_PROPERTY_ID', 'GA_SERVICE_ACCOUNT_KEY', 'SUPABASE_URL', 'API_KEY'];

    checkList.forEach(key => {
      const val = process.env[key];
      envStatus[key] = !!val;
      if (val) fingerprints[key] = `${val.substring(0, 5)}... (Len: ${val.length})`;
    });

    let activeSaEmail = DEFAULT_SA_EMAIL;
    try {
      if (process.env.GA_SERVICE_ACCOUNT_KEY) {
        const credentials = robustParse(process.env.GA_SERVICE_ACCOUNT_KEY);
        if (credentials) {
            activeSaEmail = credentials.client_email || activeSaEmail;
            envStatus['GA_KEY_PARSE_STATUS'] = 'SUCCESS';
        } else {
            envStatus['GA_KEY_PARSE_STATUS'] = 'FAIL';
        }
      }
    } catch (e) {
        envStatus['GA_KEY_PARSE_STATUS'] = 'FAIL';
        envStatus['PARSE_ERROR'] = e.message;
    }

    let dbStatus = "OFFLINE";
    if (supabaseUrl && supabaseKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseKey);
            const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
            if (!dbError) dbStatus = "ONLINE";
            else dbStatus = `ERROR: ${dbError.message}`;
        } catch (dbEx) { dbStatus = `INIT_CRASH: ${dbEx.message}`; }
    }

    return res.status(200).json({ 
      status: "NOMINAL",
      db: dbStatus,
      env: envStatus,
      fingerprints,
      service_account_email: activeSaEmail,
      vercel_runtime: process.env.VERCEL_ENV || 'production',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: "MONITOR_EXCEPTION", details: e.message });
  }
}