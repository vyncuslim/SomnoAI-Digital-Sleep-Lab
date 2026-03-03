
import { createClient } from "@supabase/supabase-js";
import syncHandler from "./sync-analytics.js";

/**
 * SOMNO LAB CONSOLIDATED MAINTENANCE GATEWAY v2.0
 * Optimized for UptimeRobot 5-minute interval scheduling.
 * Orchestrates telemetry synchronization and system pulse auditing.
 */

export default async function handler(req, res) {
  const secret = req.query.secret || req.body?.secret;
  const serverSecret = process.env.CRON_SECRET;

  if (!serverSecret || secret !== serverSecret) {
    return res.status(401).json({ error: "UNAUTHORIZED_VOID", message: "Invalid Lab Secret Provided." });
  }

  const results = {
    timestamp: new Date().toISOString(),
    status: "PROCESSING",
    tasks: {
      telemetry_sync: null,
      audit_persistence: "PENDING"
    }
  };

  try {
    // 1. Run Analytics Sync Logic
    // We wrap the existing handler to reuse logic without redundant HTTP overhead
    const syncResult = await new Promise((resolve) => {
      const mockRes = {
        status: (code) => ({ 
          json: (data) => resolve({ code, data }) 
        }),
        json: (data) => resolve({ code: 200, data }),
        setHeader: () => {} // Mock for headers
      };
      // Trigger the sync handler logic
      syncHandler(req, mockRes).catch(err => resolve({ code: 500, error: err.message }));
    });
    
    results.tasks.telemetry_sync = syncResult;

    // 2. Persistent Audit Logging
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
    const { error: logErr } = await supabase.from('audit_logs').insert([{
      action: 'CRON_MAINTENANCE_TICK',
      details: `UptimeRobot Heartbeat Confirmed. SyncResult: ${syncResult.code}`,
      level: syncResult.code === 200 ? 'INFO' : 'WARNING'
    }]);

    results.tasks.audit_persistence = logErr ? "FAILED" : "SUCCESS";
    results.status = "COMPLETED";

    return res.status(200).json(results);
  } catch (e) {
    return res.status(500).json({ 
      error: "GATEWAY_FAULT", 
      details: e.message,
      timestamp: results.timestamp 
    });
  }
}
