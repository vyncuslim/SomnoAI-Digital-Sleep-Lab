import { getSafeUrl } from './navigation.ts';

/**
 * SOMNOAI GLOBAL TELEMETRY HUB (v3.0)
 * Handles analytics dispatch with cross-origin safety protocols.
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
      const virtualLocation = `${getSafeUrl().split('#')[0]}#/${path}`;
      
      (window as any).gtag('config', GA_ID, {
        page_path: `/${path}`,
        page_title: title,
        page_location: virtualLocation,
        send_page_view: true
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