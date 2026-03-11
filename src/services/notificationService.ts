import { UAParser } from 'ua-parser-js';
import { supabase } from './supabaseService';

const API_URL = '/api';

export const notificationService = {
  sendLoginNotification: async (email: string, userId: string) => {
    try {
      const parser = new UAParser();
      const result = parser.getResult();
      const device = `${result.browser.name || 'Unknown Browser'} on ${result.os.name || 'Unknown OS'} (${result.device.type || 'desktop'})`;
      const time = new Date().toISOString();
      
      // Check for existing logins to see if this is "new"
      const { data: existingLogins } = await supabase
        .from('logins')
        .select('device_info')
        .eq('user_id', userId)
        .eq('device_info', device)
        .limit(1);

      const isNewDevice = !existingLogins || existingLogins.length === 0;

      // Record this login
      await supabase.from('logins').insert([{
        user_id: userId,
        device_info: device,
        ip_address: 'AUTO_DETECT',
        status: 'success'
      }]);

      if (isNewDevice) {
        await fetch(`${API_URL}/notify-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            device,
            time,
            userId,
            location: 'New Device/Location Detected'
          }),
        });
        console.log('New login notification sent');
      }
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
