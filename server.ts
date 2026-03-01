import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "data.json");
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_H4fb2SAp_PM8Lvmrax94nJeTuzndPiAmf';
const resend = new Resend(RESEND_API_KEY);

// Simple JSON Database
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ 
      profiles: [], 
      sleep_records: [], 
      otp: {},
      blocked_ips: [], // { ip: string, blocked_until: number, reason: string }
      ip_activity: {}  // { [ip: string]: { failed_attempts: number, last_seen: number } }
    }));
  }
  const data = JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
  // Ensure new fields exist if reading old DB
  if (!data.blocked_ips) data.blocked_ips = [];
  if (!data.ip_activity) data.ip_activity = {};
  return data;
};

const writeDB = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.set('trust proxy', true); // Trust proxy headers for IP detection
  app.use(express.json());

  // IP Blocking Middleware
  app.use((req, res, next) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const db = readDB();
    
    const blockedEntry = db.blocked_ips.find((entry: any) => entry.ip === ip);
    
    if (blockedEntry) {
      if (Date.now() < blockedEntry.blocked_until) {
        console.warn(`[SECURITY] Blocked request from ${ip}`);
        return res.status(403).json({ 
          error: "Access Denied", 
          message: "Your IP address has been temporarily blocked due to suspicious activity.",
          expires_at: new Date(blockedEntry.blocked_until).toISOString()
        });
      } else {
        // Unblock if expired
        db.blocked_ips = db.blocked_ips.filter((entry: any) => entry.ip !== ip);
        // Reset activity
        if (db.ip_activity[ip]) delete db.ip_activity[ip];
        writeDB(db);
      }
    }
    next();
  });

  // Security Endpoints
  app.get("/api/security/status", (req, res) => {
    // If middleware passed, IP is not blocked
    res.json({ status: "clean", ip: req.ip });
  });

  app.post("/api/security/report", (req, res) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const { type } = req.body; // e.g., 'failed_login'
    
    const db = readDB();
    const activity = db.ip_activity[ip] || { failed_attempts: 0, last_seen: 0 };
    
    activity.failed_attempts += 1;
    activity.last_seen = Date.now();
    db.ip_activity[ip] = activity;

    console.log(`[SECURITY] Suspicious activity reported from ${ip}. Count: ${activity.failed_attempts}`);

    // Block logic: > 5 failed attempts in short window
    if (activity.failed_attempts >= 5) {
      const blockDuration = 15 * 60 * 1000; // 15 minutes
      const blockedUntil = Date.now() + blockDuration;
      
      db.blocked_ips.push({
        ip,
        blocked_until: blockedUntil,
        reason: "Multiple failed login attempts"
      });
      
      console.warn(`[SECURITY] IP ${ip} blocked until ${new Date(blockedUntil).toISOString()}`);
    }

    writeDB(db);
    res.json({ status: "recorded", attempts: activity.failed_attempts });
  });

  // Email API Endpoint with Resend
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, notifyAdmin } = req.body;
    
    if ((!to && !notifyAdmin) || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || 'ongyuze1401@gmail.com'; // Default to user email if env not set
    const recipients = [];
    
    if (to) recipients.push(to);
    if (notifyAdmin && adminEmail && adminEmail !== to) recipients.push(adminEmail);

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No recipients specified" });
    }

    try {
      const results = await Promise.all(recipients.map(recipient => 
        resend.emails.send({
          from: 'SomnoAI <onboarding@resend.dev>', // Use default Resend sender for testing
          to: recipient,
          subject: `[SomnoAI] ${subject}`,
          html: `
            <div style="font-family: sans-serif; color: #333;">
              <div style="background-color: #01040a; padding: 20px; text-align: center;">
                <h1 style="color: #fff; margin: 0;">SomnoAI Digital Sleep Lab</h1>
                <p style="color: #818cf8; margin: 5px 0 0; font-size: 12px; letter-spacing: 2px; text-transform: uppercase;">Neural Unix Access</p>
              </div>
              <div style="padding: 20px; background-color: #f9fafb;">
                ${html}
              </div>
              <div style="background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280;">
                <p>&copy; ${new Date().getFullYear()} SomnoAI Digital Sleep Lab. All rights reserved.</p>
                <p>This is an automated notification from SomnoAI Digital Sleep Lab system.</p>
              </div>
            </div>
          `
        })
      ));

      console.log("Emails sent via Resend:", results);
      res.json({ success: true, results });
    } catch (error: any) {
      console.error("Error sending email via Resend:", error);
      res.status(500).json({ error: "Failed to send email", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
