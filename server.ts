import express from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nodemailer from "nodemailer";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_FILE = path.join(__dirname, "data.json");

// Simple JSON Database
const readDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ profiles: [], sleep_records: [], otp: {} }));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, "utf-8"));
};

const writeDB = (data: any) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

// Email Transporter Setup
const createTransporter = () => {
  if (!process.env.SMTP_HOST) return null;
  
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());



  // Email API Endpoint
  // ... (existing code)
  app.post("/api/send-email", async (req, res) => {
    const { to, subject, html, notifyAdmin } = req.body;
    
    if ((!to && !notifyAdmin) || !subject || !html) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.warn("Email service not configured (SMTP_HOST missing). Skipping email.");
      return res.status(503).json({ error: "Email service not configured" });
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const recipients = [];
    
    if (to) recipients.push(to);
    if (notifyAdmin && adminEmail) recipients.push(adminEmail);

    if (recipients.length === 0) {
      return res.status(400).json({ error: "No recipients specified" });
    }

    try {
      const promises = recipients.map(recipient => transporter.sendMail({
        from: process.env.SMTP_FROM || '"SomnoAI Digital Sleep Lab" <no-reply@sleepsomno.com>',
        to: recipient,
        subject: `[SomnoAI Digital Sleep Lab] ${subject}`, // Prefix subject
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
        `,
      }));

      await Promise.all(promises);
      console.log("Emails sent to:", recipients);
      res.json({ success: true, recipients });
    } catch (error: any) {
      console.error("Error sending email:", error);
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
