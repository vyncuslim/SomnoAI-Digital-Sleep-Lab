/**
 * SomnoAI Safe Navigation Utility (v4.0)
 * Handles physical path-based routing for a cleaner UX.
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

  return 'https://sleepsomno.com/virtual-node';
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
 * Standard path-based navigation with History API support.
 */
export const safeNavigatePath = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    // Use standard history push state
    window.history.pushState(null, '', cleanPath);
    
    // Manually dispatch a popstate event so App.tsx's router catches the change
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch (e) {
    try {
      // Hard navigation fallback
      window.location.href = cleanPath;
    } catch (e2) {
      console.warn("Navigation protocol interrupted by environment constraints.");
    }
  }
};

export const safeReload = () => {
  try {
    window.location.reload();
  } catch (e) {
    const baseUrl = getSafeUrl().split('#')[0];
    try {
      window.location.replace(baseUrl);
    } catch (e2) {
      console.warn("Manual node synchronization blocked.");
    }
  }
};