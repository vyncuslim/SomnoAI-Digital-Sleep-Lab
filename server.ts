import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock email transporter (logs to console in dev)
const transporter = nodemailer.createTransport({
  jsonTransport: true
});

async function sendEmail(to: string, subject: string, text: string) {
  console.log(`[EMAIL MOCK] Sending email to ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body: ${text}`);
  
  // In a real app, you would use a real SMTP service like SendGrid, Mailgun, or AWS SES
  // await transporter.sendMail({ from: 'noreply@somno.ai', to, subject, text });
  return { success: true, messageId: 'mock-id-' + Date.now() };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Security headers
  // app.use(helmet());

  // IP Whitelisting for admin paths
  app.use((req, res, next) => {
    const adminPaths = ['/admin', '/wp-admin'];
    if (adminPaths.some(path => req.path.startsWith(path))) {
      const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
      const allowedIp = process.env.ALLOWED_ADMIN_IP;

      if (!allowedIp || clientIp !== allowedIp) {
        res.status(403).send('Forbidden: Access Denied');
        return;
      }
    }
    next();
  });

  // CORS configuration
  // app.use(cors());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/notify-login", async (req, res) => {
    const { email, device, time, location } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    
    const subject = "New Login Detected - SomnoAI";
    const text = `
      Hello,
      
      A new login was detected for your account (${email}).
      
      Time: ${time}
      Device: ${device}
      Location: ${location} (IP: ${clientIp})
      
      If this wasn't you, please contact support immediately.
    `;

    await sendEmail(email, subject, text);
    res.json({ success: true });
  });

  app.post("/api/notify-block", async (req, res) => {
    const { email, reason } = req.body;
    
    const subject = "Account Security Alert - SomnoAI";
    const text = `
      Hello,
      
      Your account (${email}) has been temporarily blocked due to security concerns.
      
      Reason: ${reason}
      
      Please contact support to resolve this issue.
    `;

    await sendEmail(email, subject, text);
    res.json({ success: true });
  });

  app.post("/api/contact", async (req, res) => {
    const { subject, email, message } = req.body;
    
    // Send to support team
    await sendEmail("support@somno.ai", `Contact Form: ${subject}`, `From: ${email}\n\n${message}`);
    
    // Send confirmation to user
    await sendEmail(email, "We received your message - SomnoAI", "Thank you for contacting us. We will get back to you shortly.");

    res.json({ success: true });
  });

  // Vite middleware for development
  let vite: any;
  const distPath = path.join(process.cwd(), "dist");
  const isProduction = process.env.NODE_ENV === "production" || fs.existsSync(distPath);
  console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}, distPath: ${distPath}, isProduction: ${isProduction}, cwd: ${process.cwd()}`);
  
  if (!isProduction) {
    vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    
    // Development fallback
    app.get('*', async (req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        try {
            const fs = await import("fs/promises");
            const filePath = path.join(process.cwd(), "index.html");
            let html = await fs.readFile(filePath, "utf-8");
            html = await vite.transformIndexHtml(req.originalUrl, html);
            res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e: any) {
            vite?.ssrFixStacktrace(e);
            console.error(e);
            res.status(500).end(e.message);
        }
    });
  } else {
    // Serve static files in production
    app.use(express.static(path.join(process.cwd(), "dist")));
    // Fallback to index.html for production
    app.get('*', (req, res) => {
      res.sendFile(path.join(process.cwd(), "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
