declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export const trackPageView = (page: string) => {
  console.log(`Page view: ${page}`);
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'page_view', {
      page_path: page,
      page_location: window.location.href,
      page_title: document.title,
    });
  }
};

export const trackEvent = (action: string, category?: string, label?: string, value?: number) => {
  console.log(`Event: ${action}`, { category, label, value });
  if (typeof window.gtag === 'function') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

export const setUserId = (userId: string) => {
  if (typeof window.gtag === 'function') {
    window.gtag('config', 'G-1WM4RE66ER', {
      user_id: userId
    });
  }
};
