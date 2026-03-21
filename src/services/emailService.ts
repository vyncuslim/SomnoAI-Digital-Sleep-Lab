import { fetchWithLogging } from './apiService';

const API_URL = '/api';

export const emailService = {
  sendAdminAlert: async (payload: any) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'admin@sleepsomno.com',
          subject: `Admin Alert: ${payload.type || 'System Event'}`,
          html: `
            <h1>System Alert</h1>
            <p><strong>Type:</strong> ${payload.type}</p>
            <p><strong>Message:</strong> ${payload.message}</p>
            <p><strong>Details:</strong> ${JSON.stringify(payload.details || {})}</p>
            <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          `,
        }),
      }, 'sendAdminAlert', 'CRITICAL');
    } catch (error) {
      console.warn('Failed to send admin alert:', error);
    }
  },
  sendSignupWelcome: async (email: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Welcome to SomnoAI Digital Sleep Lab',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
              <h1 style="color: #4f46e5;">Welcome to SomnoAI!</h1>
              <p>Hello,</p>
              <p>Thank you for joining the SomnoAI Digital Sleep Lab. We're excited to help you optimize your sleep and cognitive performance.</p>
              <p>You can now access your dashboard and start exploring our neural sleep optimization tools.</p>
              <div style="margin: 30px 0; text-align: center;">
                <a href="${window.location.origin}/dashboard" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; rounded: 5px; font-weight: bold;">Go to Dashboard</a>
              </div>
              <p>If you have any questions, feel free to reply to this email.</p>
              <p>Best regards,<br>The SomnoAI Team</p>
            </div>
          `,
        }),
      }, 'sendSignupWelcome', 'INFO');
    } catch (error) {
      console.warn('Failed to send welcome email:', error);
    }
  },
  sendPasswordReset: async (email: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Password Reset Request - SomnoAI',
          html: `
            <h1>Password Reset Request</h1>
            <p>We received a request to reset your password for your SomnoAI account.</p>
            <p>If you didn't make this request, you can safely ignore this email.</p>
            <p>To reset your password, please use the link provided in the application or follow the instructions on the screen.</p>
            <p>For security reasons, this request was logged.</p>
          `,
        }),
      }, 'sendPasswordReset', 'WARNING');
    } catch (error) {
      console.warn('Failed to send password reset email:', error);
    }
  },
  sendSecurityAlert: async (email: string, event: string, details: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Security Alert - SomnoAI Account',
          html: `
            <div style="font-family: sans-serif; border: 1px solid #fee2e2; background-color: #fef2f2; padding: 20px; border-radius: 10px;">
              <h1 style="color: #dc2626;">Security Alert</h1>
              <p>Hello,</p>
              <p>We detected a security-related event on your account:</p>
              <p><strong>Event:</strong> ${event}</p>
              <p><strong>Details:</strong> ${details}</p>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p>If this was you, you can ignore this alert. If you don't recognize this activity, please change your password immediately and contact support.</p>
              <p>Stay safe,<br>SomnoAI Security Team</p>
            </div>
          `,
        }),
      }, 'sendSecurityAlert', 'CRITICAL');
    } catch (error) {
      console.warn('Failed to send security alert:', error);
    }
  },
  sendBlockNotification: async (email: string, reason: string, blockCode: string) => {
    try {
      await fetchWithLogging(`${API_URL}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject: 'Account Blocked',
          html: `
            <h1>Account Blocked</h1>
            <p>Your account has been blocked due to: ${reason}</p>
            <p>Your block code is: <strong>${blockCode}</strong></p>
            <p>Please email admin@sleepsomno.com with this code to resolve the issue.</p>
          `,
        }),
      }, 'sendBlockNotification', 'CRITICAL');
      console.log('Block notification sent to:', email);
    } catch (error) {
      console.warn('Failed to send block notification:', error);
    }
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
