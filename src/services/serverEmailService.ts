import { Resend } from 'resend';
import { writeAuditLog } from './auditLog';

let resend: Resend | null = null;
if (process.env.RESEND_API_KEY) {
  resend = new Resend(process.env.RESEND_API_KEY);
}

export const serverEmailService = {
  async sendEmail(params: {
    to: string;
    subject: string;
    html: string;
    category?: string;
  }) {
    if (!resend) {
      console.warn('Resend API key not configured, skipping email to:', params.to);
      return { success: false, error: 'Resend not configured' };
    }

    try {
      const { data, error } = await resend.emails.send({
        from: 'SomnoAI <onboarding@resend.dev>',
        to: [params.to],
        subject: params.subject,
        html: params.html,
      });

      await writeAuditLog({
        source: 'email_service',
        level: error ? 'error' : 'info',
        category: (params.category as any) ?? 'admin',
        action: 'send_email',
        status: error ? 'failed' : 'success',
        message: error ? `Failed to send email to ${params.to}` : `Email sent to ${params.to}`,
        metadata: { 
          to: params.to, 
          subject: params.subject, 
          category: params.category,
          resendId: data?.id 
        },
      });

      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      console.error('serverEmailService.sendEmail error:', error);
      return { success: false, error };
    }
  },

  async sendBlockNotification(email: string, reason: string) {
    return this.sendEmail({
      to: email,
      subject: 'Account Blocked - SomnoAI Digital Sleep Lab',
      category: 'account_block',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fee2e2; border-radius: 10px; background-color: #fef2f2;">
          <h1 style="color: #dc2626;">Account Blocked</h1>
          <p>Hello,</p>
          <p>Your account at SomnoAI Digital Sleep Lab has been blocked by an administrator.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>If you believe this is a mistake, please contact our support team at <a href="mailto:support@sleepsomno.com">support@sleepsomno.com</a>.</p>
          <p>Best regards,<br>The SomnoAI Team</p>
        </div>
      `,
    });
  },

  async sendUnblockNotification(email: string) {
    return this.sendEmail({
      to: email,
      subject: 'Account Unblocked - SomnoAI Digital Sleep Lab',
      category: 'account_unblock',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #dcfce7; border-radius: 10px; background-color: #f0fdf4;">
          <h1 style="color: #16a34a;">Account Unblocked</h1>
          <p>Hello,</p>
          <p>Your account at SomnoAI Digital Sleep Lab has been unblocked. You can now log in and access your dashboard.</p>
          <div style="margin: 30px 0; text-align: center;">
            <a href="https://sleepsomno.com/login" style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
          </div>
          <p>Best regards,<br>The SomnoAI Team</p>
        </div>
      `,
    });
  },

  async sendDeleteNotification(email: string) {
    return this.sendEmail({
      to: email,
      subject: 'Account Deleted - SomnoAI Digital Sleep Lab',
      category: 'account_delete',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #4b5563;">Account Deleted</h1>
          <p>Hello,</p>
          <p>This is to inform you that your account at SomnoAI Digital Sleep Lab has been deleted by an administrator.</p>
          <p>All your personal data has been removed from our active systems.</p>
          <p>If you have any questions, please contact <a href="mailto:support@sleepsomno.com">support@sleepsomno.com</a>.</p>
          <p>Best regards,<br>The SomnoAI Team</p>
        </div>
      `,
    });
  }
};
