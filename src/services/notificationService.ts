import { UAParser } from 'ua-parser-js';

const API_URL = '/api';

export const notificationService = {
  sendLoginNotification: async (email: string) => {
    try {
      const parser = new UAParser();
      const result = parser.getResult();
      const device = `${result.browser.name} on ${result.os.name}`;
      const time = new Date().toLocaleString();
      
      // In a real app, we would get location from IP via backend or a service
      // For now, we'll let the backend handle IP extraction
      
      await fetch(`${API_URL}/notify-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          device,
          time,
          location: 'Unknown Location' // Backend can try to resolve this
        }),
      });
      
      console.log('Login notification request sent');
    } catch (error) {
      console.error('Failed to send login notification:', error);
    }
  },

  sendContactMessage: async (data: { subject: string; email: string; message: string }) => {
    try {
      const response = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to send contact message:', error);
      throw error;
    }
  }
};
