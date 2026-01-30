/**
 * Global Analytics Hub for SomnoAI Lab.
 * Enhanced safety wrapper for sandboxed environments.
 */

const getSafeLocation = (): string => {
  // Try sequence for restricted environments
  try {
    // 1. window.location conversion to string is usually allowed
    if (typeof window !== 'undefined' && window.location) {
      return String(window.location);
    }
  } catch (e) { /* ignore */ }

  try {
    // 2. document.URL is a standard property often available in sandboxes
    if (typeof document !== 'undefined' && document.URL) {
      return document.URL;
    }
  } catch (e) { /* ignore */ }

  return 'https://sleepsomno.com/restricted-origin';
};

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, {
      ...params,
      page_location: getSafeLocation(),
      client_timestamp: new Date().toISOString()
    });
  } else {
    console.debug(`[Analytics Log] ${eventName}`, params);
  }
};

export const trackPageView = (path: string, title: string) => {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: getSafeLocation()
    });
  }
};

export const trackConversion = (type: 'signup' | 'sync' | 'ai_insight' | 'admin_access') => {
  trackEvent('conversion', {
    category: 'engagement',
    label: type,
    value: 1
  });
};