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
      await supabase.rpc('increment_device_analytics', { 
        d_type: deviceType, 
        browser_info: ua, 
        os_info: platform 
      });

      // 3. Update analytics_country (using a simple API or just placeholder for now)
      // In a real app, we'd use a geo-ip service.
      // For now, we'll use a placeholder or try to get it from the browser if possible.
      const lang = navigator.language || 'en-US';
      const countryCode = lang.split('-')[1] || 'US';
      
      await supabase.rpc('increment_country_analytics', { 
        c_code: countryCode,
        c_name: new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || 'Unknown'
      });

      // 4. Update user_app_status if userId is provided
      if (userId) {
        await supabase.from('user_app_status').upsert({
          user_id: userId,
          last_seen: new Date().toISOString(),
          is_online: true,
          updated_at: new Date().toISOString()
        });

        // 5. Log the login
        await supabase.from('logins').insert({
          user_id: userId,
          ip_address: 'client-side', // We can't get real IP on client easily
          user_agent: ua
        });
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
