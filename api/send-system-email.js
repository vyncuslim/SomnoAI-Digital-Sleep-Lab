import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * SOMNOAI NATIVE SMTP DISPATCHER v1.8
 * Optimized: Enforces a 5-minute cooldown per target recipient to prevent flooding.
 * Trustpilot AFS: Includes BCC support for automated feedback invitations.
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { to, subject, html, secret, isHighValueEvent } = req.body;

  // 1. 安全握手
  const serverSecret = process.env.CRON_SECRET;
  if (!serverSecret || secret !== serverSecret) {
    return res.status(401).json({ error: 'UNAUTHORIZED_HANDSHAKE' });
  }

  const TRUSTPILOT_BCC = "sleepsomno.com+2ad3019e65@invite.trustpilot.com";

  // 2. 防刷洪泛校验 (Anti-Flood Guard)
  try {
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { data: recentEmails } = await supabase
      .from('audit_logs')
      .select('created_at')
      .eq('action', 'EMAIL_DISPATCH_SUCCESS')
      .ilike('details', `%Target: ${to}%`)
      .gt('created_at', fiveMinsAgo)
      .limit(1);

    if (recentEmails && recentEmails.length > 0) {
      console.log(`[SMTP_THROTTLED] Skipping redundant dispatch to ${to}`);
      return res.status(200).json({ success: true, message: 'THROTTLED' });
    }
  } catch (e) {
    console.warn("[FLOOD_CHECK_ERR]", e);
  }

  // 3. 环境校验
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
     return res.status(500).json({ error: 'SMTP_CONFIG_VOID' });
  }

  // 4. 配置传输层
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
    timeout: 10000 
  });

  try {
    // 5. 执行发送 (Include Trustpilot BCC for high value events like Signup)
    const info = await transporter.sendMail({
      from: `"SomnoAI Digital Lab" <${smtpUser}>`,
      to,
      bcc: isHighValueEvent ? TRUSTPILOT_BCC : undefined,
      subject: `[SOMNO-LAB] ${subject}`,
      html,
    });

    // 6. 异步审计
    supabase.from('audit_logs').insert([{
      action: 'EMAIL_DISPATCH_SUCCESS',
      details: `Target: ${to}, ID: ${info.messageId}, AFS_Invited: ${!!isHighValueEvent}`,
      level: 'INFO'
    }]).then(() => {}).catch(() => {});

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('[SMTP_FAILURE]', error);
    
    supabase.from('audit_logs').insert([{
      action: 'EMAIL_DISPATCH_FAILURE',
      details: `Target: ${to}, Error: ${error.message}`,
      level: 'WARNING'
    }]).then(() => {}).catch(() => {});

    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code || 'SMTP_ERR'
    });
  }
}