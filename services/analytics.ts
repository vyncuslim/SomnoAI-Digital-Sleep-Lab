import { getSafeUrl } from './navigation.ts';

/**
 * SOMNOAI GLOBAL TELEMETRY HUB (v3.1)
 * Handles analytics dispatch with cross-origin safety protocols and SPA routing support.
 */

const GA_ID = 'G-3F9KVPNYLR';

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, {
        ...params,
        send_to: GA_ID,
        page_location: getSafeUrl(),
        client_timestamp: new Date().toISOString(),
        environment: 'digital_sleep_lab'
      });
    }
  } catch (e) {
    console.debug(`[Telemetry Throttled] ${eventName}`, params);
  }
};

export const trackPageView = (path: string, title: string) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      // Ensure we are using the hash-based path for tracking
      const currentFullUrl = getSafeUrl();
      const baseUrl = currentFullUrl.split('#')[0];
      const virtualLocation = `${baseUrl}#/${path.replace(/^#\/?/, '')}`;
      
      (window as any).gtag('event', 'page_view', {
        page_path: `/${path.replace(/^#\/?/, '')}`,
        page_title: title,
        page_location: virtualLocation,
        send_to: GA_ID
      });
      
      console.debug(`[Telemetry Pulse] V-PATH: /${path} [${title}]`);
    }
  } catch (e) {
    /* Silent fail to prevent UI disruption */
  }
};

export const trackConversion = (type: 'signup' | 'sync' | 'ai_insight' | 'admin_access') => {
  trackEvent('conversion', {
    category: 'engagement',
    label: type,
    value: 1
  });
};