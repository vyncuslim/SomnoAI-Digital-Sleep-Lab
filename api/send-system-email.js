
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

/**
 * SOMNOAI NATIVE SMTP DISPATCHER v1.0
 * 运行在 Vercel Serverless 环境
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

  // 1. 安全校验：验证调用密钥
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'UNAUTHORIZED_HANDSHAKE' });
  }

  // 2. SMTP 传输配置 (从环境变量读取)
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // 使用 SSL
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // 必须是应用专用密码
    },
  });

  try {
    // 3. 执行发送
    const info = await transporter.sendMail({
      from: `"SomnoAI Lab" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });

    // 4. 审计记录
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

    return res.status(500).json({ success: false, error: error.message });
  }
}
