/**
 * SomnoAI Safe Navigation Utility (v6.0)
 * Optimized for clean URLs and robust SPA routing.
 */

export const getSafeUrl = (): string => {
  try {
    if (typeof document !== 'undefined' && document.URL) {
      return String(document.URL);
    }
  } catch (e) {}

  try {
    if (typeof window !== 'undefined' && window.origin) {
      return window.origin;
    }
  } catch (e) {}

  return 'https://sleepsomno.com/';
};

export const getSafeHash = (): string => {
  try {
    const url = getSafeUrl();
    const hashIndex = url.indexOf('#');
    if (hashIndex === -1) return '';
    return url.substring(hashIndex);
  } catch (e) {
    return '';
  }
};

export const getSafeHostname = (): string => {
  try {
    const url = getSafeUrl();
    const match = url.match(/:\/\/([^:/#?]+)/);
    return match ? match[1] : 'restricted-node';
  } catch (e) {
    return 'unknown-node';
  }
};

/**
 * Executes a clean URL transition using the History API.
 * This simulates the behavior of BrowserRouter.
 */
export const safeNavigatePath = (path: string) => {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/landing' || cleanPath === '/index.html') cleanPath = '/';

  try {
    // Prevent redundant navigation
    if (window.location.pathname === cleanPath && !window.location.hash) return;

    // 1. Update browser history stack
    window.history.pushState({ somno_route: true, timestamp: Date.now() }, '', cleanPath);
    
    // 2. Dispatch event to notify App component
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
  } catch (e) {
    // Fallback for restricted environments
    window.location.href = cleanPath;
  }
};

/**
 * Legacy support for hash-based navigation if explicitly required.
 */
export const safeNavigateHash = (view: string) => {
  const cleanView = view.replace(/^#?\/?/, '');
  safeNavigatePath(cleanView);
};

export const safeReload = () => {
  try {
    window.location.reload();
  } catch (e) {
    const baseUrl = getSafeUrl().split('#')[0];
    window.location.replace(baseUrl);
  }
};