
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * SOMNOAI NATIVE SMTP DISPATCHER v1.5
 * Robust Fallback for Lab Internal Keys & Environment Self-Healing
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

// Lab Internal Key (Matches frontend fallback)
const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { to, subject, html, secret } = req.body;

  // 1. Security Handshake Check
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
  if (secret !== serverSecret) {
    console.error("[SMTP_GATEWAY] Unauthorized Access Attempted. Secret Mismatch.");
    return res.status(401).json({ error: 'UNAUTHORIZED_HANDSHAKE' });
  }

  // 2. Critical Environment Validation
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
     console.error("[SMTP_GATEWAY] Environment Variables SMTP_USER/SMTP_PASS are undefined.");
     return res.status(500).json({ 
       error: 'SMTP_CONFIG_VOID',
       hint: 'Configure SMTP_USER and SMTP_PASS in Vercel Settings.'
     });
  }

  // 3. Dynamic Transport Configuration
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    timeout: 15000 // Extended handshake window
  });

  try {
    // 4. Execution with Dynamic From-Header
    const fromName = "SomnoAI Digital Lab";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${smtpUser}>`,
      to,
      subject: `[SOMNO-LAB] ${subject}`,
      html,
    });

    console.log(`[SMTP_GATEWAY] Dispatch Success: ${info.messageId}`);

    // 5. Mirrored Audit Log
    try {
      await supabase.from('audit_logs').insert([{
        action: 'EMAIL_DISPATCH_SUCCESS',
        details: `Target: ${to}, ID: ${info.messageId}`,
        level: 'INFO'
      }]);
    } catch (e) {}

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[SMTP_GATEWAY] Execution Failure:', error.message);

    try {
      await supabase.from('audit_logs').insert([{
        action: 'EMAIL_DISPATCH_FAILURE',
        details: `Target: ${to}, Error: ${error.message}`,
        level: 'WARNING'
      }]);
    } catch (e) {}

    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code || 'SMTP_TRANSMISSION_ERR'
    });
  }
}
