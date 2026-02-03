
import { createClient } from "@supabase/supabase-js";
import syncHandler from "./sync-analytics.js";

/**
 * SOMNO LAB CONSOLIDATED MAINTANENCE GATEWAY v1.0
 * Targeted by UptimeRobot for 5-minute intervals.
 */

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

export default async function handler(req, res) {
  const secret = req.query.secret || req.body?.secret;
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;

  if (secret !== serverSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED_VOID" });
  }

  const results = {
    timestamp: new Date().toISOString(),
    tasks: {
      telemetry_sync: null,
      system_pulse: "ACTIVE"
    }
  };

  try {
    // 1. Run Analytics Sync
    // We wrap the existing handler logic to ensure consolidated reporting
    const syncResult = await new Promise((resolve) => {
      const mockRes = {
        status: (code) => ({ json: (data) => resolve({ code, data }) }),
        json: (data) => resolve({ code: 200, data })
      };
      syncHandler(req, mockRes);
    });
    
    results.tasks.telemetry_sync = syncResult;

    // 2. Log maintenance event
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    await supabase.from('audit_logs').insert([{
      action: 'CRON_MAINTENANCE_TICK',
      details: `UptimeRobot Pulse Confirmed. Sync Status: ${syncResult.code}`,
      level: 'DEBUG'
    }]);

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ error: "GATEWAY_FAULT", details: e.message });
  }
}
