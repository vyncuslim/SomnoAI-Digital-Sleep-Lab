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

  app.get("/test-redirect", (req, res) => {
    res.status(302).setHeader('Location', '/en').end();
  });

  app.get("/ping", (req, res) => {
    res.send("pong-v2");
  });

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", env: process.env.NODE_ENV });
  });

  app.get("/debug", (req, res) => {
    res.send("Server is alive!");
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
  const root = process.cwd();
  const distPath = path.resolve(root, "dist");
  const isProduction = process.env.NODE_ENV === "production" && fs.existsSync(distPath);
  
  console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}, isProduction: ${isProduction}, root: ${root}`);
  
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "custom",
      root: root
    });
    app.use(vite.middlewares);
    
    // Development fallback
    app.get(/.*/, async (req, res, next) => {
        const url = req.originalUrl;
        if (url.startsWith('/api') || url.startsWith('/debug') || url === '/ping') return next();
        if (path.extname(url)) return next();
        
        try {
            const templatePath = path.resolve(root, "index.html");
            if (!fs.existsSync(templatePath)) {
                return res.status(404).send("index.html not found");
            }
            const template = fs.readFileSync(templatePath, "utf-8");
            const html = await vite.transformIndexHtml(url, template);
            res.status(200).set({ "Content-Type": "text/html" }).end(html);
        } catch (e: any) {
            vite?.ssrFixStacktrace(e);
            console.error(`[SERVER] Error transforming HTML for ${url}:`, e);
            res.status(500).end(e.message);
        }
    });
  } else {
    // Serve static files in production
    app.use(express.static(distPath, { extensions: ['html'] }));
    // Fallback to app.html for production
    app.get(/.*/, (req, res) => {
      const appPath = path.resolve(distPath, "app.html");
      const indexPath = path.resolve(distPath, "index.html");
      if (fs.existsSync(appPath)) {
        res.sendFile(appPath);
      } else if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Production build found but app.html is missing in dist/");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
