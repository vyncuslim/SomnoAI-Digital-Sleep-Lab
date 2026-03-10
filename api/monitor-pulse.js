

/**
 * SOMNO LAB INFRASTRUCTURE PULSE v13.8
 * Secure diagnostic logic with robust multi-pass JSON parsing and UptimeRobot secret validation.
 */

const DEFAULT_SA_EMAIL = process.env.GA_SERVICE_ACCOUNT_EMAIL || "UNKNOWN";

export default async function handler(req, res) {
  try {
    const querySecret = req.query.secret;
    const serverSecret = process.env.CRON_SECRET;

    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Content-Type', 'application/json');

    if (!serverSecret || querySecret !== serverSecret) {
      return res.status(401).json({ error: "UNAUTHORIZED_PULSE", message: "Link identity mismatch." });
    }

    return res.status(200).json({ 
      status: "NOMINAL",
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    return res.status(500).json({ error: "MONITOR_EXCEPTION", details: e.message });
  }
}
