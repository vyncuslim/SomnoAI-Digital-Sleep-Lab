import { getSafeUrl } from './navigation.ts';

/**
 * SOMNOAI GLOBAL TELEMETRY HUB (v4.0)
 * Handles analytics dispatch with cross-origin safety protocols and normalized SPA routing.
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
 * Captures SPA page views. Normalizes clean URLs into GA4 trackable locations.
 */
export const trackPageView = (path: string, title: string) => {
  try {
    if (typeof (window as any).gtag === 'function') {
      const currentFullUrl = getSafeUrl();
      const baseUrl = currentFullUrl.split('#')[0].replace(/\/$/, '');
      
      let cleanVirtualPath = path.startsWith('/') ? path : `/${path}`;
      if (cleanVirtualPath !== '/' && cleanVirtualPath.endsWith('/')) {
        cleanVirtualPath = cleanVirtualPath.slice(0, -1);
      }

      // Reconstruct for GA4 indexing
      const virtualLocation = `${baseUrl}${cleanVirtualPath}`;
      
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
      
      console.debug(`[Telemetry Node] PATH: ${cleanVirtualPath} [${title}]`);
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
