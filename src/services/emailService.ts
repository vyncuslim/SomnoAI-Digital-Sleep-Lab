import { fetchWithLogging } from './apiService';

const API_URL = '/api';

export const emailService = {
  sendAdminAlert: async (payload: any) => {
    console.log('Email Alert:', payload);
    // Implementation for sending email alerts
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
      console.error('Failed to send block notification:', error);
    }
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
