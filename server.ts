import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import { writeAuditLog } from './src/services/auditLog';

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

  app.post('/api/auth/record-login', async (req, res) => {
    const { userId, email, role, user_name, device } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

    try {
      // Record in logins table
      const { error: loginError } = await supabase.from('logins').insert([{
        user_id: userId,
        user_name: user_name,
        device_info: device,
        ip_address: ip,
        status: 'success',
        role: role
      }]);

      if (loginError) throw loginError;

      // Also record in audit_logs using writeAuditLog
      await writeAuditLog({
        source: 'web',
        level: 'info',
        category: 'auth',
        action: 'USER_LOGIN',
        status: 'success',
        actorUserId: userId,
        ipAddress: ip as string,
        message: 'User login success',
        metadata: { device, role, email }
      });

      res.status(200).json({ success: true, ip });
    } catch (error: any) {
      console.error('Failed to record login:', error);
      res.status(500).json({ error: error.message });
    }
  });

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

  app.post('/api/audit/auth-signup', async (req, res) => {
    const body = req.body;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : null;
    const userAgent = req.headers['user-agent'];

    await writeAuditLog({
      source: 'web',
      level: body.success ? 'info' : 'warning',
      category: 'auth',
      action: 'signup',
      status: body.success ? 'success' : 'failed',
      actorUserId: body.userId ?? null,
      ipAddress: ip,
      userAgent,
      path: '/signup',
      method: 'POST',
      errorCode: body.errorCode ?? null,
      message: body.success ? 'User signup success' : 'User signup failed',
      metadata: {
        email: body.email ?? null,
        needsEmailConfirmation: body.needsEmailConfirmation ?? null,
      },
    });

    res.status(200).json({ ok: true });
  });

  app.post('/api/stripe/webhook', async (req, res) => {
    try {
      const event = req.body;

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        await writeAuditLog({
          source: 'api',
          level: 'info',
          category: 'payment',
          action: 'checkout_completed',
          status: 'success',
          actorUserId: session.metadata?.user_id ?? null,
          message: 'Stripe checkout completed',
          metadata: {
            provider: 'stripe',
            checkout_session_id: session.id,
            customer_id: session.customer,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        });
      }

      if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object;
        await writeAuditLog({
          source: 'api',
          level: 'error',
          category: 'payment',
          action: 'invoice_payment',
          status: 'failed',
          actorUserId: invoice.metadata?.user_id ?? null,
          errorCode: 'stripe_payment_failed',
          message: 'Stripe invoice payment failed',
          metadata: {
            provider: 'stripe',
            invoice_id: invoice.id,
            customer_id: invoice.customer,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
          },
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      await writeAuditLog({
        source: 'api',
        level: 'critical',
        category: 'payment',
        action: 'stripe_webhook',
        status: 'failed',
        errorCode: 'webhook_handler_error',
        message: err instanceof Error ? err.message : 'Unknown webhook error',
        metadata: {},
      });
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

import { adminServices } from './src/services/adminServices';
import { writeAuditLog } from './src/services/auditLog';

  app.post('/api/admin/delete-user', async (req, res) => {
    const { adminUserId, targetUserId } = req.body;
    try {
      await adminServices.deleteUser(adminUserId, targetUserId);
      res.json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/admin/block-user', async (req, res) => {
    const { adminUserId, targetUserId, reason } = req.body;
    try {
      await adminServices.blockUser({ adminUserId, targetUserId, reason });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
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

  const checkSuperOwner = async (req: express.Request) => {
    if (!supabase) return false;
    const authHeader = req.headers.authorization;
    if (!authHeader) return false;
    const token = authHeader.split(' ')[1];
    if (!token) {
      console.log('checkSuperOwner: No token found');
      return false;
    }
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      console.log('checkSuperOwner: user:', user?.id, 'error:', error);
      if (error || !user) return false;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_super_owner')
        .eq('id', user.id)
        .single();
        
      console.log('checkSuperOwner: profile:', profile);
      return profile?.is_super_owner === true;
    } catch (e) {
      console.error('checkSuperOwner: error:', e);
      return false;
    }
  };

  app.get("/api/admin/auth-users", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    const isSuperOwner = await checkSuperOwner(req);
    if (!isSuperOwner) {
      return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
    }

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

    const isSuperOwner = await checkSuperOwner(req);
    if (!isSuperOwner) {
      return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
    }

    try {
      // This is a bit of a hack since we can't easily query information_schema via the client
      // We'll return the list of tables we know about and their basic info
      const tables = [
        'profiles', 'sleep_records', 'feedback', 'audit_logs', 
        'security_events', 'app_settings', 'error_logs', 
        'communications', 'reviews', 'analytics_daily'
      ];

      // Add auth schema tables for super owners
      const authTables = [
        'audit_log_entries', 'identities', 'mfa_amr_claims', 
        'one_time_tokens', 'refresh_tokens', 'sessions'
      ];
      
      const allTables = [...tables];
      
      const schemaInfo = await Promise.all(allTables.map(async (table) => {
        try {
          // Use information_schema to get column names regardless of whether the table is empty
          const { data, error } = await supabase!.rpc('get_table_columns', { table_name: table });
          
          if (error) {
            // Fallback: try to fetch one row if RPC fails
            const { data: fallbackData, error: fallbackError } = await supabase!.from(table).select('*').limit(1);
            if (fallbackError) return { name: table, error: fallbackError.message, isAuth: false };
            const columns = fallbackData && fallbackData.length > 0 ? Object.keys(fallbackData[0]) : [];
            return { name: table, columns, isAuth: false };
          }
          
          return { name: table, columns: data, isAuth: false };
        } catch (e) {
          return { name: table, error: 'Failed to fetch', isAuth: false };
        }
      }));

      // For auth tables, we can't easily get columns via standard client
      // so we'll just add them as placeholders for now
      const authSchemaInfo = await Promise.all(authTables.map(async (table) => {
        try {
          const { data, error } = await supabase!.schema('auth').from(table).select('*').limit(1);
          if (error) return { name: table, error: error.message, isAuth: true, schema: 'auth' };
          const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
          return { name: table, columns, isAuth: true, schema: 'auth' };
        } catch (e) {
          return { name: table, error: 'Failed to fetch', isAuth: true, schema: 'auth' };
        }
      }));

      res.json([...schemaInfo, ...authSchemaInfo]);
    } catch (error: any) {
      console.error('Error fetching schema:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/admin/table-data/:table", async (req, res) => {
    if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
    
    const isSuperOwner = await checkSuperOwner(req);
    if (!isSuperOwner) {
      return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
    }

    const { table } = req.params;
    const schema = (req.query.schema as string) || 'public';

    try {
      // Use the schema() method to access different schemas
      const { data, error } = await supabase.schema(schema).from(table).select('*').limit(100);
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      console.error(`Error fetching data for ${schema}.${table}:`, error);
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
