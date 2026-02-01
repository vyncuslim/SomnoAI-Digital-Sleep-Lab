
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { createClient } from "@supabase/supabase-js";

/**
 * SOMNO LAB GA4 SYNC GATEWAY v13.0
 * 容错增强版：预防环境配置缺失导致的 500 崩溃
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
const SERVICE_ACCOUNT_EMAIL = "somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com";

export default async function handler(req, res) {
  // 1. 设置安全头与响应格式
  res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  res.setHeader('Content-Type', 'application/json');

  const querySecret = req.query.secret;
  const authHeader = req.headers.authorization;
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  // 2. 身份验证
  const isAuthorized = (querySecret === serverSecret) || (authHeader === `Bearer ${serverSecret}`);
  if (!isAuthorized) {
    return res.status(401).json({ error: "UNAUTHORIZED_GATEWAY" });
  }

  // 3. 环境预检 (Pre-flight Check)
  const requiredKeys = [
    'GA_PROPERTY_ID', 
    'GA_SERVICE_ACCOUNT_KEY', 
    'SUPABASE_URL', 
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  const missingKeys = requiredKeys.filter(k => !process.env[k]);

  if (missingKeys.length > 0) {
    console.error("[GATEWAY_CRITICAL] Missing environment keys:", missingKeys);
    return res.status(500).json({ 
      error: "ENV_MISCONFIGURED", 
      missing: missingKeys,
      detail: "Critical environment variables are missing from the server host. Check Vercel project settings."
    });
  }

  try {
    // 4. 初始化客户端
    let credentials;
    try {
      credentials = JSON.parse(process.env.GA_SERVICE_ACCOUNT_KEY);
    } catch (e) {
      return res.status(500).json({ error: "JSON_PARSE_ERROR", detail: "GA_SERVICE_ACCOUNT_KEY is not a valid JSON string." });
    }

    const gaClient = new BetaAnalyticsDataClient({ credentials });
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

    // 5. 执行查询
    const [response] = await gaClient.runReport({
      property: `properties/${process.env.GA_PROPERTY_ID}`,
      dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }],
      metrics: [{ name: "totalUsers" }, { name: "screenPageViews" }],
    });

    const rows = (response.rows || []).map(row => ({
      date: `${row.dimensionValues[0].value.slice(0,4)}-${row.dimensionValues[0].value.slice(4,6)}-${row.dimensionValues[0].value.slice(6,8)}`,
      users: parseInt(row.metricValues[0].value),
      pageviews: parseInt(row.metricValues[1].value),
    }));

    // 6. 数据持久化 (Upsert)
    if (rows.length > 0) {
      const { error: upsertError } = await supabase
        .from("analytics_daily")
        .upsert(rows, { onConflict: 'date' });
      
      if (upsertError) throw upsertError;
    }

    return res.status(200).json({ 
      success: true, 
      count: rows.length, 
      timestamp: new Date().toISOString(),
      node: "Somno-Edge-V13"
    });

  } catch (err) {
    console.error("[GATEWAY_EXCEPTION]", err);
    const isPermissionError = err.message?.includes('PERMISSION_DENIED') || err.code === 7;
    
    // 尝试记录审计日志 (Safe Log)
    try {
      const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('audit_logs').insert([{
        action: 'GA4_SYNC_FAILURE',
        details: err.message,
        level: isPermissionError ? 'CRITICAL' : 'WARNING'
      }]);
    } catch (e) {}

    return res.status(isPermissionError ? 403 : 500).json({ 
      error: "EXECUTION_FAILURE", 
      detail: isPermissionError ? `Authorization missing for ${SERVICE_ACCOUNT_EMAIL}` : err.message 
    });
  }
}
