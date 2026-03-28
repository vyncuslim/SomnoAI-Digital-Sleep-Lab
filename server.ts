import express from 'express';
import { Resend } from 'resend';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import path from 'path';
import helmet from 'helmet';
import Stripe from 'stripe';
import { rateLimit } from 'express-rate-limit';
import { GoogleGenAI, Type } from '@google/genai';
import { writeAuditLog, auditLogger } from './src/services/auditLog';
import { requireAdminFromRequest } from './src/lib/admin-auth';
import { getUserFromRequest, requireUserFromRequest, isAdmin } from './src/lib/auth-utils';
import { adminServices } from './src/services/adminServices';
import { OFFICIAL_LINKS } from './src/constants/links';

import { serverEmailService } from './src/services/serverEmailService';

dotenv.config();

// Helper for Gemini content generation with exponential backoff and fallback
async function generateWithFallback(ai: any, params: any, maxRetries = 3) {
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
  let lastError: any = null;

  for (const model of models) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        console.log(`[AI] Attempting generation with ${model} (Attempt ${attempt + 1}/${maxRetries})`);
        const response = await ai.models.generateContent({
          ...params,
          model: model,
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const errorMessage = String(error?.message || '').toLowerCase();
        
        // If it's a quota/rate limit error, wait and retry
        if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('limit')) {
          const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
          console.warn(`[AI] Quota reached for ${model}. Retrying in ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // If it's a safety error or other non-retryable error, break retry loop and try next model
        console.error(`[AI] Error with ${model}:`, error.message);
        break; 
      }
    }
  }
  throw lastError;
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' as any }) : null;

import { sendTelegramMessage } from './src/lib/telegram';

const app = express();

async function startServer() {
  let resend: Resend | null = null;
  if (process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }

  // Security Headers
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "data:", "blob:", "https://*.supabase.co", "https://*.sleepsomno.com", "https://picsum.photos", "https://*.google-analytics.com", "https://*.googletagmanager.com", "https://*.gstatic.com", "https://*.run.app"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "'wasm-unsafe-eval'", "https://*.googletagmanager.com", "https://app.livechatai.com", "https://challenges.cloudflare.com", "https://unpkg.com", "https://*.run.app", "https://*.google-analytics.com"],
        "frame-src": ["'self'", "https://challenges.cloudflare.com", "https://app.livechatai.com", "https://*.supabase.co"],
        "connect-src": ["'self'", "https://*.supabase.co", "https://*.google-analytics.com", "https://*.googletagmanager.com", "wss://*.supabase.co", "https://app.livechatai.com", "https://api.elevenlabs.io", "wss://api.elevenlabs.io", "https://connectors.windsor.ai", "https://unpkg.com", "https://*.run.app", "wss://*.run.app", "https://*.google-analytics.com", "https://stats.g.doubleclick.net"]
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Relaxed CSRF for API routes in development/preview
  app.use('/api', (req: any, res: any, next: any) => {
    // Completely bypass CSRF for API routes in non-production or preview environments
    if (process.env.NODE_ENV !== 'production' || (req.hostname && req.hostname.includes('.run.app'))) {
      return next();
    }
    
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      const origin = req.headers.origin;
      const referer = req.headers.referer;
      const host = req.headers.host;

      // Allow if origin matches host or if it's from a trusted preview URL
      const isTrusted = !origin || 
                        (origin && origin.includes(host || '')) || 
                        (referer && referer.includes(host || '')) ||
                        (origin && origin.includes('.run.app')) ||
                        (referer && referer.includes('.run.app'));

      if (!isTrusted) {
        console.warn(`[SECURITY] Potential CSRF attempt from origin: ${origin}, referer: ${referer}`);
        return res.status(403).json({ error: 'Forbidden: CSRF protection triggered' });
      }
    }
    next();
  });

  // Rate Limiting - Tiered approach for security and performance
  const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    limit: 300, // 300 requests per minute for general API
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' }
  });

  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 20, // 20 requests per 15 minutes for sensitive forms
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many attempts from this IP, please try again after 15 minutes.' }
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // 10 login attempts per 15 minutes
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Too many login attempts, please try again later.' }
  });

  // Apply rate limiters to specific routes
  app.use('/api/contact', strictLimiter);
  app.use('/api/subscribe', strictLimiter);
  app.use('/api/audit/login', authLimiter);
  app.use('/api/audit/auth-signup', authLimiter);
  app.use('/api/chat', generalLimiter);
  app.use('/api/analyze-sleep', generalLimiter);
  app.use('/api/sleep-recommendation', generalLimiter);
  app.use('/api/health', generalLimiter);

  // Stripe Webhook needs raw body
  app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req: any, res: any) => {
    if (!stripe || !stripeWebhookSecret) {
      console.warn('Stripe or Webhook Secret not configured');
      return res.status(400).send('Webhook Error: Missing configuration');
    }

    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig as string, stripeWebhookSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
      // Idempotency check
      const { data: existingLog } = await supabase!
        .from('audit_logs')
        .select('id')
        .eq('action', 'stripe_webhook_event')
        .eq('metadata->>event_id', event.id)
        .maybeSingle();
      
      if (existingLog) {
        console.log(`Webhook event ${event.id} already processed.`);
        return res.status(200).json({ received: true, message: 'Already processed' });
      }

      // Record the event to prevent replay
      await supabase!.from('audit_logs').insert([{
        source: 'api',
        category: 'payment',
        status: 'success',
        action: 'stripe_webhook_event',
        level: 'info',
        message: `Processing Stripe event ${event.id}`,
        metadata: { event_id: event.id, type: event.type }
      }]);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await auditLogger.logPayment({
          source: 'api',
          level: 'info',
          action: 'checkout_completed',
          status: 'success',
          actorUserId: session.metadata?.user_id ?? null,
          message: 'Stripe checkout completed',
          metadata: {
            provider: 'stripe',
            checkout_session_id: session.id,
            customer_id: session.customer as string,
            amount_total: session.amount_total,
            currency: session.currency,
          },
        });
      }

      if (event.type === 'invoice.payment_succeeded') {
        const invoice = event.data.object as Stripe.Invoice;
        await auditLogger.logPayment({
          source: 'api',
          level: 'info',
          action: 'invoice_payment_succeeded',
          status: 'success',
          actorUserId: invoice.metadata?.user_id ?? null,
          message: 'Stripe invoice payment succeeded',
          metadata: {
            provider: 'stripe',
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
          },
        });
      }

      if (event.type === 'invoice.payment_failed') {
        const invoice = event.data.object as Stripe.Invoice;
        await auditLogger.logPayment({
          source: 'api',
          level: 'error',
          action: 'invoice_payment_failed',
          status: 'failed',
          actorUserId: invoice.metadata?.user_id ?? null,
          errorCode: 'stripe_payment_failed',
          message: 'Stripe invoice payment failed',
          metadata: {
            provider: 'stripe',
            invoice_id: invoice.id,
            customer_id: invoice.customer as string,
            amount_due: invoice.amount_due,
            currency: invoice.currency,
          },
        });
      }

      if (event.type === 'customer.subscription.created') {
        const subscription = event.data.object as Stripe.Subscription;
        await auditLogger.logPayment({
          source: 'api',
          level: 'info',
          action: 'subscription_created',
          status: 'success',
          actorUserId: subscription.metadata?.user_id ?? null,
          message: 'Stripe subscription created',
          metadata: {
            provider: 'stripe',
            subscription_id: subscription.id,
            customer_id: subscription.customer as string,
            status: subscription.status,
          },
        });
      }

      if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.created') {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          const plan = subscription.items.data[0].price.lookup_key || 'pro'; // Default to pro if lookup_key is missing
          await supabase!.from('profiles').update({
            subscription_plan: plan,
            subscription_status: subscription.status,
            is_paying: subscription.status === 'active'
          }).eq('id', userId);
        }

        await auditLogger.logPayment({
          source: 'api',
          level: 'info',
          action: 'subscription_updated',
          status: 'success',
          actorUserId: userId ?? null,
          message: 'Stripe subscription updated',
          metadata: {
            provider: 'stripe',
            subscription_id: subscription.id,
            customer_id: subscription.customer as string,
            status: subscription.status,
          },
        });
      }

      if (event.type === 'customer.subscription.deleted') {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.user_id;

        if (userId) {
          await supabase!.from('profiles').update({
            subscription_plan: 'go',
            subscription_status: 'canceled',
            is_paying: false
          }).eq('id', userId);
        }

        await auditLogger.logPayment({
          source: 'api',
          level: 'warning',
          action: 'subscription_deleted',
          status: 'success',
          actorUserId: userId ?? null,
          message: 'Stripe subscription deleted',
          metadata: {
            provider: 'stripe',
            subscription_id: subscription.id,
            customer_id: subscription.customer as string,
            status: subscription.status,
          },
        });
      }

      res.status(200).json({ received: true });
    } catch (err) {
      await auditLogger.logPayment({
        source: 'api',
        level: 'critical',
        action: 'stripe_webhook',
        status: 'failed',
        errorCode: 'webhook_handler_error',
        message: err instanceof Error ? err.message : 'Unknown webhook error',
        metadata: {},
      });
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  });

  // Regular JSON parsing for other routes
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.post(['/api/subscribe', '/api/subscribe/'], async (req: any, res: any) => {
    console.log('Received subscribe request:', req.method, req.url);
    const { email } = req.body;
    
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'A valid email is required' });
    }

    try {
      // In a real app, you would save this to a database or newsletter service like Mailchimp/Resend
      // For now, we'll just log it and return success
      console.log(`New newsletter subscription request`);
      
      // Optional: Send a welcome email if Resend is configured
      if (resend) {
        try {
          await resend.emails.send({
            from: 'SomnoAI <onboarding@resend.dev>',
            to: email,
            subject: 'Welcome to SomnoAI Newsletter',
            html: `
              <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
                <h2>Welcome to SomnoAI</h2>
                <p>Thank you for subscribing to our newsletter. You will now receive the latest updates on sleep science and AI.</p>
                <p>Best regards,<br>The SomnoAI Team</p>
              </div>
            `
          });
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail the subscription if the welcome email fails
        }
      }

      res.status(200).json({ success: true, message: 'Subscribed successfully' });
    } catch (error) {
      console.error('Subscription error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });

  app.post(['/api/contact', '/api/contact/'], async (req: any, res: any) => {
    console.log('Received contact request:', req.method, req.url);
    const { subject, email, message } = req.body;
    
    try {
      // Log the contact message to audit logs
      await writeAuditLog({
        source: 'web',
        level: 'info',
        category: 'communication',
        action: 'contact_form_submission',
        status: 'success',
        actorUserId: null,
        message: `Contact message from ${email}: ${subject}`,
        metadata: { subject, email, message_length: message?.length }
      });

      // Also record in communications table if supabase is available
      if (supabase) {
        try {
          await supabase.from('communications').insert([{
            type: 'contact_form',
            subject,
            sender_email: email,
            message,
            status: 'new'
          }]);
        } catch (dbError) {
          console.error('Failed to record in communications table:', dbError);
        }
      }

      // If Resend is configured, send an email to support
      try {
        await serverEmailService.sendEmail({
          to: OFFICIAL_LINKS.email,
          subject: `Contact Form: ${subject}`,
          category: 'contact_form',
          html: `
            <h1>New Contact Message</h1>
            <p><strong>From:</strong> ${email}</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send contact email via serverEmailService:', emailError);
        // Don't fail the request if only email notification fails
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Failed to process contact message:', error);
      res.status(500).json({ 
        error: 'Failed to send message',
        details: error?.message,
        stack: error?.stack
      });
    }
  });

  // API routes FIRST
  app.get("/api/health", (req: any, res: any) => {
    res.json({ 
      status: "ok",
      environment: !!(process.env.GEMINI_API_KEY || process.env.API_KEY)
    });
  });

  // Secure login recording
  // Consolidated Login Logging Endpoint
  app.post(['/api/audit/login', '/api/audit/login/'], async (req: any, res: any) => {
    const { email, status, errorCode, userId, metadata } = req.body;
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    try {
      await auditLogger.logAuth({
        source: 'web',
        level: status === 'success' ? 'info' : 'warning',
        action: 'USER_LOGIN',
        status: status,
        actorUserId: userId || null,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        message: status === 'success' ? `Login success for ${email}` : `Login failed for ${email}: ${errorCode}`,
        metadata: { ...metadata, email, errorCode }
      });

      // Send Telegram alert for failed login
      if (status === 'failed') {
        await sendTelegramMessage(`⚠️ <b>Failed Login Attempt</b>\nEmail: ${email}\nError: ${errorCode}\nIP: ${ip}\nUser Agent: ${userAgent}`);
      }

      // If success, also record in logins table
      if (status === 'success' && userId && supabase) {
        await supabase.from('logins').insert([{
          user_id: userId,
          user_name: metadata?.user_name || 'User',
          device_info: userAgent,
          ip_address: ip,
          status: 'success',
          role: metadata?.role || 'user'
        }]);
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Failed to log login event:', error);
      res.status(500).json({ error: error?.message || 'Unknown error' });
    }
  });

  // General Event Logging Endpoint
  app.post(['/api/audit/log-event', '/api/audit/log-event/'], async (req: any, res: any) => {
    try {
      const user = await getUserFromRequest(req);
      const { category, action, status, level, message, metadata } = req.body;
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      await writeAuditLog({
        source: 'web',
        level: level || 'info',
        category: category || 'system',
        action: action || 'unknown',
        status: status || 'success',
        actorUserId: user?.id || null,
        ipAddress: ip as string,
        userAgent: userAgent as string,
        message: message || '',
        metadata: metadata || {}
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      res.status(500).json({ error: error?.message || 'Unknown error' });
    }
  });

  // USB Authentication Endpoints
  app.post('/api/usb/bind', async (req: any, res: any) => {
    try {
      const user = await requireUserFromRequest(req);
      const { vendorId, productId, serialNumber, productName, manufacturerName } = req.body;

      if (!supabase) {
        return res.status(500).json({ success: false, message: "Database not configured" });
      }

      const { error } = await supabase
        .from('user_usb_keys')
        .upsert({
          user_id: user.id,
          vendor_id: vendorId,
          product_id: productId,
          serial_number: serialNumber,
          product_name: productName,
          manufacturer_name: manufacturerName,
          status: 'active',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, vendor_id, product_id, serial_number'
        });

      if (error) {
        console.error('[USB BIND ERROR]', error);
        return res.status(500).json({ success: false, message: error.message });
      }

      res.json({ success: true });
    } catch (error: any) {
      res.status(401).json({ success: false, message: error.message });
    }
  });

  app.get('/api/usb/get-filters', async (req: any, res: any) => {
    try {
      const { email } = req.query;
      if (!email) return res.status(400).json({ success: false, message: "Email required" });

      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email.trim().toLowerCase())
        .maybeSingle();
      
      let targetUserId = userData?.id;
      if (!targetUserId) {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const foundUser = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
        if (foundUser) targetUserId = foundUser.id;
      }

      if (!targetUserId) return res.json({ success: true, filters: [] });

      const { data: keys } = await supabase
        .from('user_usb_keys')
        .select('vendor_id')
        .eq('user_id', targetUserId)
        .eq('status', 'active');

      const filters = keys ? Array.from(new Set(keys.map((k: any) => ({ vendorId: k.vendor_id })))) : [];
      res.json({ success: true, filters });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/usb/unlock', async (req: any, res: any) => {
    try {
      const { devices, userId, email } = req.body;
      
      let targetUserId = userId;
      if (!targetUserId && email) {
        // Find user by email in profiles or auth.users
        // Assuming profiles table has email or we use auth admin API
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', email.trim().toLowerCase())
          .maybeSingle();
        
        if (userData) {
          targetUserId = userData.id;
        } else {
          // Fallback to auth admin API if profiles doesn't have email or user not found
          const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
          const foundUser = users.find(u => u.email?.toLowerCase() === email.trim().toLowerCase());
          if (foundUser) targetUserId = foundUser.id;
        }
      }

      if (!targetUserId) {
        // Search for ANY user that has this U-disk bound
        for (const d of devices) {
          const { data: keyData } = await supabase
            .from('user_usb_keys')
            .select('user_id')
            .eq('vendor_id', d.vendorId)
            .eq('product_id', d.productId)
            .eq('serial_number', d.serialNumber || "")
            .eq('status', 'active')
            .maybeSingle();
          
          if (keyData) {
            targetUserId = keyData.user_id;
            break;
          }
        }
      }

      if (!targetUserId) {
        return res.status(400).json({ success: false, message: "User not identified. Please enter your email or ensure your U-disk is bound." });
      }

      if (!supabase) {
        return res.status(500).json({ success: false, message: "Database not configured" });
      }

      const { data: boundKeys, error } = await supabase
        .from('user_usb_keys')
        .select('*')
        .eq('user_id', targetUserId)
        .eq('status', 'active');

      if (error) {
        return res.status(500).json({ success: false, message: error.message });
      }

      if (!boundKeys || boundKeys.length === 0) {
        return res.status(404).json({ success: false, message: "No bound USB keys found" });
      }

      const matched = devices.some((d: any) => 
        boundKeys.some((b: any) => {
          const idMatch = d.vendorId === b.vendor_id && d.productId === b.product_id;
          if (!idMatch) return false;

          // Priority 1: Serial Number Match (if both have it)
          if (b.serial_number && d.serialNumber) {
            return b.serial_number === d.serialNumber;
          }

          // Priority 2: If DB has serial but device doesn't (rare/browser limit), 
          // we might fail or require extra verification. 
          // For now, if DB has it, we require it.
          if (b.serial_number && !d.serialNumber) {
            return false; 
          }

          // Priority 3: Fallback to Vendor/Product ID only if DB has no serial
          return true;
        })
      );

      if (!matched) {
        return res.status(401).json({ success: false, message: "U-disk not matched" });
      }

      // Generate a magic link for seamless login
      const { data: userData } = await supabase.auth.admin.getUserById(targetUserId);
      if (!userData || !userData.user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
        type: 'magiclink',
        email: userData.user.email!,
        options: { redirectTo: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard` }
      });

      if (linkError) {
        console.error('[USB UNLOCK LINK ERROR]', linkError);
        return res.status(500).json({ success: false, message: "Failed to generate login link" });
      }

      res.json({ 
        success: true, 
        action_link: linkData.properties.action_link 
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  app.post('/api/notify-login', async (req: any, res: any) => {
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

  app.post('/api/send-email', async (req: any, res: any) => {
    try {
      // Only authenticated users can send emails (or restrict to admins)
      const user = await requireUserFromRequest(req);
      
      if (!resend) {
        return res.status(500).json({ error: 'Resend is not configured' });
      }
      const { to, subject, html } = req.body;

      // Optional: restrict 'to' address or check if user is admin
      const userIsAdmin = await isAdmin(user.id);
      if (!userIsAdmin && to !== user.email) {
        // Non-admins can only send emails to themselves (e.g. for testing or specific features)
        // Or just block non-admins entirely if this is an admin-only tool
        return res.status(403).json({ error: 'Forbidden: Only admins can send arbitrary emails' });
      }

      const data = await resend.emails.send({
        from: 'SomnoAI <onboarding@resend.dev>',
        to: [to],
        subject: subject,
        html: html,
      });

      res.status(200).json(data);
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 401 : 500).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.post(['/api/audit/auth-signup', '/api/audit/auth-signup/'], async (req: any, res: any) => {
    const body = req.body;
    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : null;
    const userAgent = req.headers['user-agent'];

    await auditLogger.logAuth({
      source: 'web',
      level: body.success ? 'info' : 'warning',
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

  // Debugging middleware for API routes
  app.use(['/api/chat', '/api/chat/', '/api/analyze-sleep', '/api/analyze-sleep/'], (req: any, res: any, next: any) => {
    console.log(`[DEBUG] Received ${req.method} request to ${req.url}`);
    next();
  });

  app.post(['/api/chat', '/api/chat/'], async (req: any, res: any) => {
    let user: any = null;
    try {
      user = await requireUserFromRequest(req);
      const { messages = [], currentInput, currentFile, systemInstruction } = req.body;

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        console.error('[CHAT] Gemini API key is missing in environment variables');
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
      }

      console.log(`[CHAT] Processing request for user ${user.id}`);
      const ai = new GoogleGenAI({ apiKey });

      const parts: any[] = [{ text: currentInput || "Please analyze this file." }];
      if (currentFile) {
        parts.push({
          inlineData: {
            data: currentFile.data,
            mimeType: currentFile.type
          }
        });
      }

      const rawContents = [
        ...messages.map((m: any) => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content || " " }] })),
        { role: 'user', parts }
      ];

      // Ensure alternating roles (user, model, user, model)
      const validContents: any[] = [];
      for (const msg of rawContents) {
        if (validContents.length === 0) {
          if (msg.role === 'user') validContents.push(msg);
        } else {
          const lastRole = validContents[validContents.length - 1].role;
          if (msg.role !== lastRole) {
            validContents.push(msg);
          } else {
            // Merge consecutive messages of the same role
            const lastMsg = validContents[validContents.length - 1];
            const lastPart = lastMsg.parts[lastMsg.parts.length - 1];
            const newPart = msg.parts[0];
            
            if (lastPart && newPart && typeof lastPart.text === 'string' && typeof newPart.text === 'string') {
              lastPart.text += "\n\n" + newPart.text;
              if (msg.parts.length > 1) {
                lastMsg.parts.push(...msg.parts.slice(1));
              }
            } else {
              lastMsg.parts.push(...msg.parts);
            }
          }
        }
      }

      const response = await generateWithFallback(ai, {
        contents: validContents,
        config: {
          systemInstruction: (systemInstruction || "You are a professional sleep science expert at SomnoAI Digital Sleep Lab. Always maintain a professional, scientific, yet approachable tone. All your responses are proprietary content of SomnoAI.").substring(0, 8000),
          maxOutputTokens: 8192, // Explicitly set to avoid "generation exceeded max tokens limit"
          temperature: 0.7,
        }
      });

      if (!response.candidates || response.candidates.length === 0) {
        return res.json({ text: "I'm sorry, I couldn't generate a response. Please try a different query." });
      }

      const text = response.text || "I'm sorry, I cannot discuss this topic due to safety guidelines. How else can I help you with your sleep?";
      res.json({ text });
    } catch (error: any) {
      console.error('Chat API Error:', error);
      
      const errorMessage = String(error?.message || error || '').toLowerCase();

      // Handle Quota Reached
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('limit')) {
        await sendTelegramMessage(`⚠️ <b>AI Quota Reached</b>\nUser: <code>${user?.id || 'Unknown'}</code>\nEndpoint: <code>/api/chat</code>`);
        return res.status(429).json({ 
          error: "System is currently busy (quota reached). Please try again in a few minutes or tomorrow.",
          code: 'QUOTA_EXCEEDED'
        });
      }
      
      // Handle safety block errors from the SDK or any other refusal
      const isSafetyError = errorMessage.includes('safety') || 
                           errorMessage.includes('blocked') ||
                           errorMessage.includes('finish_reason') ||
                           errorMessage.includes('candidate');
      
      if (isSafetyError) {
        return res.json({ text: "I'm sorry, I cannot discuss this topic due to safety guidelines. How else can I help you with your sleep?" });
      }
      
      const status = errorMessage.includes('unauthorized') ? 401 : 
                     errorMessage.includes('blocked') ? 403 : 500;
      res.status(status).json({ error: error?.message || "An error occurred. Please try a different query." });
    }
  });

  app.post(['/api/analyze-sleep', '/api/analyze-sleep/'], async (req: any, res: any) => {
    console.log('Received POST request to /api/analyze-sleep');
    let user: any = null;
    try {
      user = await requireUserFromRequest(req);
      const { prompt, lang, selectedFileName } = req.body;

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        console.error('[ANALYZE] Gemini API key is missing in environment variables');
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
      }

      console.log(`[ANALYZE] Processing request for user ${user.id}`);
      const ai = new GoogleGenAI({ apiKey });
      console.log(`[DEBUG] Starting analysis for user ${user.id} using gemini-2.5-flash`);

      const response = await generateWithFallback(ai, {
        contents: prompt || "Please analyze my sleep.",
        config: {
          systemInstruction: "You are a professional sleep scientist and data analyst at SomnoAI. Provide detailed, accurate, and actionable sleep analysis in JSON format. Ensure the analysis reflects the high standards of SomnoAI Digital Sleep Lab.",
          responseMimeType: 'application/json',
          maxOutputTokens: 8192, // Explicitly set to avoid "generation exceeded max tokens limit"
          temperature: 0.5,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING },
              insights: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              tomorrowOptimization: { type: Type.STRING }
            },
            required: ["overview", "insights", "recommendations", "tomorrowOptimization"]
          }
        },
      });

      if (!response.text) {
        console.warn(`[DEBUG] No text returned from Gemini for user ${user.id}`);
        return res.json({
          overview: "I'm sorry, but I cannot process this specific request due to safety guidelines.",
          insights: ["Safety block triggered"],
          recommendations: ["Please try a different query"],
          tomorrowOptimization: "N/A"
        });
      }

      let analysis;
      try {
        let cleanText = response.text || "{}";
        // Remove markdown code blocks if present
        if (cleanText.startsWith('```json')) {
          cleanText = cleanText.replace(/^```json\n/, '').replace(/\n```$/, '');
        } else if (cleanText.startsWith('```')) {
          cleanText = cleanText.replace(/^```\n/, '').replace(/\n```$/, '');
        }
        analysis = JSON.parse(cleanText);
      } catch (parseError) {
        console.error('Failed to parse Gemini response as JSON:', response.text);
        return res.status(500).json({ error: 'Failed to parse sleep analysis data. Please try again.' });
      }
      
      console.log(`[DEBUG] Analysis successful for user ${user.id}`);
      res.json(analysis);
    } catch (error: any) {
      console.error('Analyze Sleep API Error:', error);
      
      const errorMessage = String(error?.message || error || '').toLowerCase();

      // Handle Quota Reached
      if (errorMessage.includes('quota') || errorMessage.includes('429') || errorMessage.includes('limit')) {
        await sendTelegramMessage(`⚠️ <b>AI Quota Reached</b>\nUser: <code>${user?.id || 'Unknown'}</code>\nEndpoint: <code>/api/analyze-sleep</code>`);
        return res.status(429).json({ 
          error: "System is currently busy (quota reached). Please try again in a few minutes or tomorrow.",
          code: 'QUOTA_EXCEEDED'
        });
      }
      
      // Handle safety block errors from the SDK or any other refusal
      const isSafetyError = errorMessage.includes('safety') || 
                           errorMessage.includes('blocked') ||
                           errorMessage.includes('finish_reason') ||
                           errorMessage.includes('candidate');
      
      if (isSafetyError) {
        return res.json({
          overview: "I'm sorry, but I cannot process this specific request due to safety guidelines.",
          insights: ["Safety block triggered"],
          recommendations: ["Please try a different query"],
          tomorrowOptimization: "N/A"
        });
      }

      const status = errorMessage.includes('unauthorized') ? 401 : 
                     errorMessage.includes('blocked') ? 403 : 500;
      res.status(status).json({ 
        error: error?.message || "An error occurred during analysis.",
        details: error?.message || "Unknown error"
      });
    }
  });

  app.post('/api/sleep-recommendation', async (req: any, res: any) => {
    try {
      const user = await requireUserFromRequest(req);
      const { userData } = req.body;

      const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
      if (!apiKey) {
        console.error('[RECOMMENDATION] Gemini API key is missing in environment variables');
        return res.status(500).json({ error: 'Gemini API key is not configured.' });
      }

      console.log(`[RECOMMENDATION] Processing request for user ${user.id}`);
      const ai = new GoogleGenAI({ apiKey });

      const response = await generateWithFallback(ai, {
        contents: `Provide personalized sleep recommendations based on this user data: ${userData}`,
        config: {
          maxOutputTokens: 8192, // Explicitly set to avoid "generation exceeded max tokens limit"
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error('Sleep Recommendation API Error:', error);
      const errorMessage = String(error?.message || '').toLowerCase();
      const status = errorMessage.includes('unauthorized') ? 401 : 
                     errorMessage.includes('blocked') ? 403 : 500;
      res.status(status).json({ error: error?.message || 'Failed to generate recommendation' });
    }
  });

  // Consolidate Stripe Webhook logic above to avoid duplicate route definitions
  // Removed old /api/stripe/webhook here as it's now handled with raw body parsing above

  // Protect all /api/admin/* endpoints
  app.use('/api/admin', async (req: any, res: any, next: any) => {
    try {
      const adminUser = await requireAdminFromRequest(req);
      (req as any).adminUser = adminUser;
      next();
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 401).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/admin/delete-user', async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      const { targetUserId } = req.body;
      console.log(`Admin ${adminUser.id} attempting to delete user ${targetUserId}`);
      await adminServices.deleteUser(adminUser.id, targetUserId);
      res.json({ ok: true });
    } catch (error: any) {
      console.error('Delete user error:', error);
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 400).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/admin/block-user', async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      const { targetUserId, reason } = req.body;
      await adminServices.blockUser({ adminUserId: adminUser.id, targetUserId, reason });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 400).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/admin/unblock-user', async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      const { targetUserId } = req.body;
      await adminServices.unblockUser({ adminUserId: adminUser.id, targetUserId });
      res.json({ ok: true });
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 400).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.post('/api/admin/update-role', async (req: any, res: any) => {
    console.log(`Received ${req.method} request for /api/admin/update-role`);
    try {
      const adminUser = (req as any).adminUser;
      const { targetUserId, newRole } = req.body;
      console.log(`Admin ${adminUser.id} updating user ${targetUserId} to role ${newRole}`);
      await adminServices.updateUserRole({ adminUserId: adminUser.id, targetUserId, newRole });
      res.json({ ok: true });
    } catch (error: any) {
      console.error('Update role error:', error);
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 400).json({ error: error?.message || 'Unknown error' });
    }
  });

  // Admin Analytics API
  app.get("/api/admin/founder-stats", async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
      const { data, error } = await supabase.rpc('get_founder_stats');
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 500).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.get("/api/admin/security-events", async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
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
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 500).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.get("/api/admin/auth-users", async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      // Extra check for super owner if needed, but requireAdminFromRequest already checks for admin/super_owner
      // If this specific route requires ONLY super_owner:
      const { data: profile } = await supabase!
        .from('profiles')
        .select('is_super_owner')
        .eq('id', adminUser.id)
        .single();
      
      if (!profile?.is_super_owner) {
        return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
      }

      if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
      const { data: { users }, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      res.json(users);
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 500).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.get("/api/admin/schema", async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      const { data: profile } = await supabase!
        .from('profiles')
        .select('is_super_owner')
        .eq('id', adminUser.id)
        .single();
      
      if (!profile?.is_super_owner) {
        return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
      }

      if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });
      // This is a bit of a hack since we can't easily query information_schema via the client
      // We'll return the list of tables we know about and their basic info
      const tables = [
        'profiles', 'sleep_records', 'feedback', 'audit_logs', 
        'security_events', 'app_settings', 'error_logs', 
        'communications', 'reviews', 'analytics_daily',
        'analytics_country', 'analytics_device', 'analytics_realtime',
        'articles', 'chat_messages', 'daily_sleep_summary',
        'daily_steps_summary', 'diary_entries', 'health_raw_data',
        'health_records', 'heart_rate_summary', 'logins',
        'subscriptions', 'user_app_status', 'user_data'
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
          if (error) return { name: table, error: error?.message, isAuth: true, schema: 'auth' };
          const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
          return { name: table, columns, isAuth: true, schema: 'auth' };
        } catch (e) {
          return { name: table, error: 'Failed to fetch', isAuth: true, schema: 'auth' };
        }
      }));

      res.json([...schemaInfo, ...authSchemaInfo]);
    } catch (error: any) {
      console.error('Error fetching schema:', error);
      res.status(500).json({ error: error?.message || 'Unknown error' });
    }
  });

  app.get("/api/admin/table-data/:table", async (req: any, res: any) => {
    try {
      const adminUser = (req as any).adminUser;
      const { data: profile } = await supabase!
        .from('profiles')
        .select('is_super_owner')
        .eq('id', adminUser.id)
        .single();
      
      if (!profile?.is_super_owner) {
        return res.status(403).json({ error: 'Unauthorized: Super Owner access required' });
      }

      if (!supabase) return res.status(500).json({ error: 'Supabase not configured' });

      const { table } = req.params;
      const schema = (req.query.schema as string) || 'public';

      // Use the schema() method to access different schemas
      const { data, error } = await supabase.schema(schema).from(table).select('*').limit(100);
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(String(error?.message || '').includes('Unauthorized') ? 403 : 500).json({ error: error?.message || 'Unknown error' });
    }
  });

  console.log('Starting server...');
  // Explicit route for logo to ensure it's served correctly
  app.get('/logo_512.png', (req: any, res: any) => {
    const logoPath = process.env.NODE_ENV === 'production' 
      ? path.join(process.cwd(), 'dist', 'logo_512.png')
      : path.join(process.cwd(), 'public', 'logo_512.png');
    
    res.sendFile(logoPath, (err) => {
      if (err) {
        console.error('Error serving logo_512.png:', err);
        res.status(404).end();
      }
    });
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log('Creating Vite server...');
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      console.log('Vite server created successfully');
      app.use(vite.middlewares);
    } catch (err) {
      console.error('Failed to create Vite server:', err);
    }
  } else {
    app.use(express.static('dist', {
      setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      }
    }));
    app.get('*', (req: any, res: any) => {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  // Global error handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('[GLOBAL ERROR HANDLER]', err);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
      stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    });
  });

  if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
