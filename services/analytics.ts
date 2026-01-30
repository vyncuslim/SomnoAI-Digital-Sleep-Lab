import { getSafeUrl } from './navigation.ts';

/**
 * Global Analytics Hub for SomnoAI Lab.
 * Enhanced safety wrapper for sandboxed environments.
 */

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', eventName, {
        ...params,
        page_location: getSafeUrl(),
        client_timestamp: new Date().toISOString()
      });
    }
  } catch (e) {
    console.debug(`[Analytics Blocked] ${eventName}`, params);
  }
};

export const trackPageView = (path: string, title: string) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title,
        page_location: getSafeUrl()
      });
    }
  } catch (e) {
    /* silent fail */
  }
};

export const trackConversion = (type: 'signup' | 'sync' | 'ai_insight' | 'admin_access') => {
  trackEvent('conversion', {
    category: 'engagement',
    label: type,
    value: 1
  });
};
