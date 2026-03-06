const API_URL = '/api';

export const emailService = {
  sendAdminAlert: async (payload: any) => {
    console.log('Email Alert:', payload);
    // Implementation for sending email alerts
  },
  sendBlockNotification: async (email: string, reason: string) => {
    try {
      await fetch(`${API_URL}/notify-block`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, reason }),
      });
      console.log('Block notification sent to:', email);
    } catch (error) {
      console.error('Failed to send block notification:', error);
    }
  }
};

export const sendEmailAlert = emailService.sendAdminAlert;
