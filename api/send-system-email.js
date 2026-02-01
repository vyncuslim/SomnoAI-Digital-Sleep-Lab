
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * SOMNOAI NATIVE SMTP DISPATCHER v1.1
 * Improved error reporting for Admin diagnostics
 */

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { to, subject, html, secret } = req.body;

  // 1. 安全校验
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'UNAUTHORIZED_HANDSHAKE: Invalid dispatch secret.' });
  }

  // 2. 环境检查
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
     return res.status(500).json({ 
       error: 'SMTP_CONFIG_VOID: Missing credentials in node environment.',
       hint: 'Ensure SMTP_USER and SMTP_PASS are defined in Vercel project settings.'
     });
  }

  // 3. SMTP 传输配置
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    timeout: 10000 // 10s handshake limit
  });

  try {
    // 4. 执行发送
    const info = await transporter.sendMail({
      from: `"SomnoAI Lab" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    // 5. 审计记录
    await supabase.from('audit_logs').insert([{
      action: 'EMAIL_DISPATCH_SUCCESS',
      details: `Target: ${to}, Subject: ${subject}, MessageId: ${info.messageId}`,
      level: 'INFO'
    }]);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('SMTP_FAILURE:', error);

    // 记录错误审计
    await supabase.from('audit_logs').insert([{
      action: 'EMAIL_DISPATCH_FAILURE',
      details: `Target: ${to}, Error: ${error.message}`,
      level: 'WARNING'
    }]);

    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code || 'UNKNOWN_SMTP_ERR'
    });
  }
}
