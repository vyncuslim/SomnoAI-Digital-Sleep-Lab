
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v13.0
 * 增强型诊断：提供变量指纹以便核对注入状态
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
      detail: "Secret mismatch. Check Vercel CRON_SECRET." 
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
      'SMTP_USER'
    ];

    const envStatus = {};
    const fingerprints = {}; // 仅用于核对，不暴露敏感信息

    checkList.forEach(key => {
      const val = process.env[key];
      envStatus[key] = !!val;
      // 提供长度和前缀帮助确认变量是否是最新的
      if (val) {
        fingerprints[key] = `${val.substring(0, 4)}... (Len: ${val.length})`;
      }
    });

    let activeSaEmail = DEFAULT_SA_EMAIL;
    try {
      if (process.env.GA_SERVICE_ACCOUNT_KEY) {
        const keyJson = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
        activeSaEmail = keyJson.client_email || activeSaEmail;
      }
    } catch (e) {}

    let dbStatus = "ONLINE";
    const { error: dbError } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (dbError) dbStatus = "OFFLINE";

    return res.status(200).json({ 
      status: "NOMINAL",
      db: dbStatus,
      env: envStatus,
      fingerprints, // 帮助核对 Vercel 注入
      service_account_email: activeSaEmail,
      vercel_runtime: process.env.VERCEL_ENV || 'production',
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: "MONITOR_EXCEPTION", details: e.message });
  }
}
