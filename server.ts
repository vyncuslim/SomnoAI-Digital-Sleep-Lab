import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  process.env.NODE_ENV = 'development';
  const app = express();
  const PORT = 3000;

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

  // Vite middleware for development
  let vite: any;
  if (process.env.NODE_ENV !== "production") {
    vite = await createViteServer({
      root: process.cwd(),
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, "dist")));
  }

  // SPA fallback: Serve index.html for all non-API routes
  app.use(async (req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) {
      return next();
    }
    
    try {
      if (process.env.NODE_ENV !== "production") {
        const fs = await import("fs/promises");
        const filePath = path.join(process.cwd(), "index.html");
        let html = await fs.readFile(filePath, "utf-8");
        html = await vite.transformIndexHtml(req.originalUrl, html);
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } else {
        const filePath = path.join(process.cwd(), "dist/index.html");
        res.sendFile(filePath);
      }
    } catch (e: any) {
      vite?.ssrFixStacktrace(e);
      console.error(e);
      res.status(500).end(e.message);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
