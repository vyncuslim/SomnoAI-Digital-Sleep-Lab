/**
 * Global Analytics Hub for SomnoAI Lab.
 * Interfaces with Google Tag (gtag.js) to track key biometric events and user behaviors.
 */

export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', eventName, {
      ...params,
      page_location: window.location.href,
      client_timestamp: new Date().toISOString()
    });
  } else {
    // 开发环境调试日志
    console.debug(`[Analytics Log] ${eventName}`, params);
  }
};

export const trackPageView = (path: string, title: string) => {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', 'page_view', {
      page_path: path,
      page_title: title,
      page_location: window.location.href
    });
  }
};

/**
 * 核心转化事件追踪 (Key Events)
 */
export const trackConversion = (type: 'signup' | 'sync' | 'ai_insight' | 'admin_access') => {
  trackEvent('conversion', {
    category: 'engagement',
    label: type,
    value: 1
  });
};
