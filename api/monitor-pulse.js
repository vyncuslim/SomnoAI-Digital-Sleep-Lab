
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v12.0
 * Healthcheck & Environment Diagnostic Terminal
 */

const BOT_TOKEN = '8049272741:AAFCu9luLbMHeRe_K8WssuTqsKQe8nm5RJQ';
const ADMIN_CHAT_ID = '-1003851949025';
const DEFAULT_SA_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  const querySecret = req.query.secret;
  const serverSecret = process.env.CRON_SECRET || "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'application/json');

  if (querySecret !== serverSecret) {
    return res.status(401).json({ 
      error: "UNAUTHORIZED_PULSE", 
      detail: "The provided secret does not match the server-side CRON_SECRET environment variable." 
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    const checkList = [
      'GA_PROPERTY_ID', 
      'GA_SERVICE_ACCOUNT_KEY', 
      'SUPABASE_URL', 
      'SUPABASE_SERVICE_ROLE_KEY', 
      'API_KEY',
      'SMTP_USER',
      'SMTP_PASS',
      'SMTP_HOST'
    ];

    const envStatus = {};
    checkList.forEach(key => {
      envStatus[key] = !!process.env[key];
    });

    // 尝试从 Key 中提取真实的 Email
    let activeSaEmail = DEFAULT_SA_EMAIL;
    try {
      if (process.env.GA_SERVICE_ACCOUNT_KEY) {
        const keyJson = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
        activeSaEmail = keyJson.client_email || activeSaEmail;
      }
    } catch (e) {}

    let dbStatus = "ONLINE";
    let aiStatus = "ONLINE";
    
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) dbStatus = "OFFLINE";
    if (!process.env.API_KEY) aiStatus = "OFFLINE";

    const isHealthy = dbStatus === "ONLINE" && aiStatus === "ONLINE" && envStatus.GA_PROPERTY_ID;

    return res.status(200).json({ 
      status: isHealthy ? "HEALTHY" : "DEGRADED",
      db: dbStatus,
      ai: aiStatus,
      env: envStatus,
      service_account_email: activeSaEmail,
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: "MONITOR_EXCEPTION", details: e.message });
  }
}
