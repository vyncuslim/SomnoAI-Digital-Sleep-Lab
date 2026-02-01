
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * SOMNOAI NATIVE SMTP DISPATCHER v1.6
 * 加固版：即使审计失败也要确保邮件发送结果正确返回
 */

const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const INTERNAL_LAB_KEY = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
  }

  const { to, subject, html, secret } = req.body;

  // 1. 安全握手
  const serverSecret = process.env.CRON_SECRET || INTERNAL_LAB_KEY;
  if (secret !== serverSecret) {
    return res.status(401).json({ error: 'UNAUTHORIZED_HANDSHAKE' });
  }

  // 2. 环境校验
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpUser || !smtpPass) {
     return res.status(500).json({ error: 'SMTP_CONFIG_VOID' });
  }

  // 3. 配置传输层
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: { user: smtpUser, pass: smtpPass },
    timeout: 15000 
  });

  try {
    // 4. 执行发送
    const info = await transporter.sendMail({
      from: `"SomnoAI Digital Lab" <${smtpUser}>`,
      to,
      subject: `[SOMNO-LAB] ${subject}`,
      html,
    });

    // 5. 异步审计（不阻塞响应）
    supabase.from('audit_logs').insert([{
      action: 'EMAIL_DISPATCH_SUCCESS',
      details: `Target: ${to}, ID: ${info.messageId}`,
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
