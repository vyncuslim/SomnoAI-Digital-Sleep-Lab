
/**
 * Global Analytics Hub for SomnoAI Lab.
 * Enhanced safety wrapper for sandboxed environments.
 */

const getSafeLocation = (): string => {
  try {
    // window.location access can be blocked in cross-origin iframes
    return window.location.href;
  } catch (e) {
    // document.URL is a safer fallback in most browser environments
    return typeof document !== 'undefined' ? document.URL : 'restricted-origin';
  }
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
