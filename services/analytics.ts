import { getSafeUrl } from './navigation.ts';

/**
 * SOMNOAI GLOBAL TELEMETRY HUB (v3.5)
 * Handles analytics dispatch with cross-origin safety protocols and precise SPA hash-routing support.
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
        environment: 'digital_sleep_lab',
        transport_type: 'beacon'
      });
    }
  } catch (e) {
    console.debug(`[Telemetry Throttled] ${eventName}`, params);
  }
};

/**
 * Captures SPA page views including hash-based routes.
 * Overrides default location to ensure GA4 registers the virtual path correctly.
 */
export const trackPageView = (path: string, title: string) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      const currentFullUrl = getSafeUrl();
      const baseUrl = currentFullUrl.split('#')[0].replace(/\/$/, '');
      
      // Sanitize the virtual path: ensure it starts with /
      let cleanVirtualPath = path.startsWith('/') ? path : `/${path}`;
      if (cleanVirtualPath !== '/' && cleanVirtualPath.endsWith('/')) {
        cleanVirtualPath = cleanVirtualPath.slice(0, -1);
      }

      // Reconstruct the virtual location for GA4 'page_location' override
      // This maps /#/admin to a trackable URL structure
      const virtualLocation = `${baseUrl}/#${cleanVirtualPath.startsWith('/') ? cleanVirtualPath.slice(1) : cleanVirtualPath}`;
      
      // Update global gtag state and trigger event
      (window as any).gtag('set', {
        'page_path': cleanVirtualPath,
        'page_title': title,
        'page_location': virtualLocation
      });

      (window as any).gtag('event', 'page_view', {
        page_path: cleanVirtualPath,
        page_title: title,
        page_location: virtualLocation,
        send_to: GA_ID
      });
      
      console.debug(`[Telemetry Ingress] V-PATH: ${cleanVirtualPath} | TITLE: ${title}`);
    }
  } catch (e) {
    /* Silent fail to preserve UI stability */
  }
};

export const trackConversion = (type: 'signup' | 'sync' | 'ai_insight' | 'admin_access') => {
  trackEvent('conversion', {
    category: 'engagement',
    label: type,
    value: 1
  });
};