import { supabase } from './supabaseService';

export const analyticsService = {
  trackVisit: async (userId?: string) => {
    try {
      // 1. Get user agent info
      const ua = navigator.userAgent;
      const platform = navigator.platform;
      
      // Determine device type
      let deviceType = 'desktop';
      if (/mobile/i.test(ua)) deviceType = 'mobile';
      else if (/tablet/i.test(ua)) deviceType = 'tablet';

      // 2. Update analytics_device
      const { error: deviceError } = await supabase.rpc('increment_device_analytics', { 
        d_type: deviceType, 
        browser_info: ua, 
        os_info: platform 
      });
      if (deviceError && !deviceError.message.includes('does not exist')) {
        console.warn('increment_device_analytics failed:', deviceError.message);
      }

      // 3. Update analytics_country (using a simple API or just placeholder for now)
      // In a real app, we'd use a geo-ip service.
      // For now, we'll use a placeholder or try to get it from the browser if possible.
      const lang = navigator.language || 'en-US';
      const countryCode = lang.split('-')[1] || 'US';
      
      const { error: countryError } = await supabase.rpc('increment_country_analytics', { 
        c_code: countryCode,
        c_name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || 'Unknown'
      });
      if (countryError && !countryError.message.includes('does not exist')) {
        console.warn('increment_country_analytics failed:', countryError.message);
      }

      // 4. Update user_app_status if userId is provided
      if (userId) {
        const { error: statusError } = await supabase.from('user_app_status').upsert({
          user_id: userId,
          last_seen: new Date().toISOString(),
          is_online: true,
          updated_at: new Date().toISOString()
        });
        if (statusError && !statusError.message.includes('Could not find the')) {
          console.warn('user_app_status upsert failed:', statusError.message);
        }

        // 5. Log the login
        const { error: loginError } = await supabase.from('logins').insert({
          user_id: userId,
          ip_address: 'client-side', // We can't get real IP on client easily
          device_info: ua
        });
        if (loginError) console.warn('logins insert failed:', loginError.message);
      }

      // 6. Realtime analytics
      let sessionId = sessionStorage.getItem('analytics_session_id');
      if (!sessionId) {
        sessionId = crypto.randomUUID?.() || Math.random().toString(36).substring(2) + Date.now().toString(36);
        sessionStorage.setItem('analytics_session_id', sessionId);
      }

      const { error: upsertError } = await supabase.from('analytics_realtime').upsert({
        session_id: sessionId,
        user_id: userId || null,
        path: window.location.pathname,
        last_activity: new Date().toISOString()
      }, { onConflict: 'session_id' });

      if (upsertError) {
        console.warn('Analytics upsert failed:', upsertError.message);
      }

    } catch (error) {
      console.error('Error tracking visit:', error);
    }
  }
};
