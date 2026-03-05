import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Security headers
  app.use(helmet());

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
  app.use(cors({
    origin: ['https://digitalsleeplab.com'],
    credentials: true
  }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
