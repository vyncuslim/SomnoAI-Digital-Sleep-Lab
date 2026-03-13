import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function startServer() {
  const app = express();
  app.use(express.json());

  let resend: Resend | null = null;
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  app.post('/api/notify-login', async (req, res) => {
    if (!resend) {
      console.warn('Resend is not configured. Skipping login notification.');
      return res.status(200).json({ success: true, message: 'Resend not configured' });
    }
    const { email, user_name, device, time, location } = req.body;

    try {
      await resend.emails.send({
        from: 'SomnoAI <onboarding@resend.dev>',
        to: [email],
        subject: 'New Login Detected',
        html: `
          <h1>New Login Detected</h1>
          <p>Hello ${user_name},</p>
          <p>A new login was detected for your SomnoAI account.</p>
          <ul>
            <li><strong>Device:</strong> ${device}</li>
            <li><strong>Time:</strong> ${time}</li>
            <li><strong>Location:</strong> ${location}</li>
          </ul>
          <p>If this was not you, please contact support immediately.</p>
        `,
      });
      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Failed to send login notification:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/send-email', async (req, res) => {
    if (!resend) {
      return res.status(500).json({ error: 'Resend is not configured' });
    }
    const { to, subject, html } = req.body;

    try {
      const data = await resend.emails.send({
        from: 'SomnoAI <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      });

      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // Admin Analytics API
  app.get("/api/admin/founder-stats", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      const { data, error } = await supabase.rpc('get_founder_stats');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching founder stats:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/security-events", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      const { data, error } = await supabase
        .from('security_events')
        .select(`
          *,
          profiles:user_id (email, full_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching security events:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/auth-users", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      res.json(users);
    } catch (error: any) {
      console.error('Error fetching auth users:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/schema", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    try {
      // This is a bit of a hack since we can't easily query information_schema via the client
      // We'll return the list of tables we know about and their basic info
      const tables = [
        'profiles', 'sleep_records', 'feedback', 'audit_logs', 
        'security_events', 'app_settings', 'error_logs', 
        'communications', 'reviews', 'analytics_daily'
      ];
      
      const schemaInfo = await Promise.all(tables.map(async (table) => {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) return { table, error: error.message };
        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        return { table, columns };
      }));

      res.json(schemaInfo);
    } catch (error: any) {
      console.error('Error fetching schema:', error);
      res.status(500).json({ error: error.message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist', {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (req, res) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
