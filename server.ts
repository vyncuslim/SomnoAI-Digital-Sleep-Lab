import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cors from "cors";
import helmet from "helmet";
import nodemailer from "nodemailer";
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

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

  // Stripe webhook - MUST be defined before express.json() middleware
  app.post("/api/stripe/webhook", express.raw({type: 'application/json'}), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Mapping of Stripe Price IDs to Plan Names
    // TODO: Replace these placeholders with your actual Stripe Price IDs from your Dashboard
    const PLAN_BY_PRICE_ID: Record<string, string> = {
      'price_go_monthly': 'go',
      'price_pro_monthly': 'pro',
      'price_plus_monthly': 'plus',
      // Add your actual IDs here, e.g., 'price_1Q2w3e...': 'pro'
    };

    function getPlanFromPriceId(priceId: string | undefined): string {
      if (!priceId) return 'free';
      return PLAN_BY_PRICE_ID[priceId] || 'pro'; // Default fallback
    }

    try {
      console.log(`Processing event: ${event.type}`);
      
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = session.client_reference_id;
          const subscriptionId = session.subscription as string;
          const customerId = session.customer as string;
          
          if (!userId) {
            console.log('No client_reference_id in session, skipping user mapping.');
            break;
          }

          // Retrieve full subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = session.metadata?.plan || getPlanFromPriceId(priceId);
          
          // Upsert into subscriptions table
          const { error: subError } = await supabaseAdmin.from('subscriptions').upsert({
            user_id: userId,
            stripe_subscription_id: subscriptionId,
            stripe_price_id: priceId,
            plan_name: plan,
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end
          }, { onConflict: 'stripe_subscription_id' });

          if (subError) {
            console.error('Error updating subscriptions table:', subError);
            // Fallback: Update profiles directly if subscriptions table fails (e.g. not created yet)
            await supabaseAdmin.from('profiles').update({
              subscription_plan: plan,
              subscription_id: subscriptionId,
              subscription_status: subscription.status,
              stripe_customer_id: customerId
            }).eq('id', userId);
          } else {
            // If subscriptions update succeeded, the Trigger (if installed) will update profiles.
            // But to be safe (if trigger missing), we can also update profiles here explicitly.
            await supabaseAdmin.from('profiles').update({
              stripe_customer_id: customerId
            }).eq('id', userId);
          }
          
          console.log(`Checkout completed for user ${userId}, plan: ${plan}`);
          break;
        }

        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          const priceId = subscription.items.data[0]?.price.id;
          const plan = getPlanFromPriceId(priceId);
          
          // We need to find the user_id. 
          // 1. Try metadata from subscription (if passed from checkout)
          // 2. Try looking up the subscription in our DB
          let userId = subscription.metadata?.userId;

          if (!userId) {
             const { data: subData } = await supabaseAdmin
               .from('subscriptions')
               .select('user_id')
               .eq('stripe_subscription_id', subscription.id)
               .single();
             userId = subData?.user_id;
          }

          if (!userId) {
            // Fallback: Look up profile by customer ID if we stored it
             const { data: profileData } = await supabaseAdmin
               .from('profiles')
               .select('id')
               .eq('stripe_customer_id', subscription.customer)
               .single();
             userId = profileData?.id;
          }

          if (userId) {
            await supabaseAdmin.from('subscriptions').upsert({
              user_id: userId,
              stripe_subscription_id: subscription.id,
              stripe_price_id: priceId,
              plan_name: plan,
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end
            }, { onConflict: 'stripe_subscription_id' });
            
            console.log(`Subscription updated for user ${userId}: ${status}`);
          } else {
            console.log(`Could not find user for subscription ${subscription.id}`);
          }
          break;
        }

        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          // Update status to canceled
          const { data: subData } = await supabaseAdmin
             .from('subscriptions')
             .select('user_id')
             .eq('stripe_subscription_id', subscription.id)
             .single();
             
          if (subData?.user_id) {
            await supabaseAdmin.from('subscriptions').update({
              status: 'canceled',
              plan_name: 'free' // Optional: mark as free immediately or keep plan name for history
            }).eq('stripe_subscription_id', subscription.id);
            
            console.log(`Subscription deleted/canceled for user ${subData.user_id}`);
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const subscriptionId = invoice.subscription as string;
          
          if (subscriptionId) {
             await supabaseAdmin.from('subscriptions').update({
               status: 'past_due' // Or whatever logic you want
             }).eq('stripe_subscription_id', subscriptionId);
             console.log(`Payment failed for subscription ${subscriptionId}`);
             
             // TODO: Send email notification to user
          }
          break;
        }
        
        case 'invoice.paid': {
           const invoice = event.data.object as Stripe.Invoice;
           const subscriptionId = invoice.subscription as string;
           
           // Usually subscription.updated handles the dates, but invoice.paid confirms good standing
           if (subscriptionId) {
             await supabaseAdmin.from('subscriptions').update({
               status: 'active'
             }).eq('stripe_subscription_id', subscriptionId);
             console.log(`Invoice paid for subscription ${subscriptionId}`);
           }
           break;
        }

        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (error: any) {
      console.error('Error processing webhook:', error);
      res.status(500).send(`Webhook processing error: ${error.message}`);
      return;
    }

    res.json({received: true});
  });

  app.post('/api/stripe/create-portal-session', async (req, res) => {
    try {
      const { userId } = req.body;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get customer ID from profiles table
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();
      
      if (!profile?.stripe_customer_id) {
         return res.status(404).json({ error: 'No billing account found. Please subscribe first.' });
      }
  
      const session = await stripe.billingPortal.sessions.create({
        customer: profile.stripe_customer_id,
        return_url: `${req.headers.origin || 'https://sleepsomno.com'}/subscription`,
      });
  
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating portal session:', error);
      res.status(500).json({ error: error.message });
    }
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
    const { email, device, time, location, userId } = req.body;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress;
    
    // Update profile with last login and location
    if (userId) {
      try {
        const country = location?.split(',')?.pop()?.trim() || 'Unknown';
        await supabase.from('profiles').update({ 
          last_login: new Date().toISOString(),
          country: country
        }).eq('id', userId);
      } catch (err) {
        console.error('Failed to update profile on login:', err);
      }
    }

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

  // Admin Analytics API
  app.get("/api/admin/founder-stats", async (req, res) => {
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
  
  app.use((req, res, next) => {
    console.log(`[SERVER] ${req.method} ${req.url}`);
    next();
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
      root: root
    });
    app.use(vite.middlewares);
    
    // SPA fallback for development
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      
      // Skip API routes and static assets that Vite should have handled
      if (url.startsWith('/api/') || url.includes('.')) {
        return next();
      }

      try {
        let template = fs.readFileSync(path.resolve(root, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        res.status(500).end(e.message);
      }
    });
  } else {
    // Serve static files in production
    app.use(express.static(distPath, { extensions: ['html'] }));
    
    // SPA fallback for production - catch all routes and serve index.html
    app.get('*', (req, res, next) => {
      // Skip API routes
      if (req.url.startsWith('/api/')) {
        return next();
      }

      const indexPath = path.resolve(distPath, "index.html");
      const appPath = path.resolve(distPath, "app.html");
      
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else if (fs.existsSync(appPath)) {
        res.sendFile(appPath);
      } else {
        res.status(404).send("Production build found but index.html/app.html is missing in dist/. Please run 'npm run build'.");
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
