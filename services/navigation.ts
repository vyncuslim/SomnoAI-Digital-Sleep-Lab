/**
 * SomnoAI Safe Navigation Utility (v4.3)
 * Handles physical path-based routing for a cleaner UX.
 * Optimized for Vercel History Mode.
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
 * This is the primary method for Clean URLs.
 */
export const safeNavigatePath = (path: string) => {
  // Ensure path starts with / but doesn't have double //
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/landing') cleanPath = '/';

  try {
    // 1. Push state to browser history
    window.history.pushState({ somno_route: true }, '', cleanPath);
    
    // 2. Explicitly trigger routing logic in App.tsx
    // We dispatch both events for maximum compatibility with current listeners
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
  } catch (e) {
    try {
      // Hard navigation fallback if History API fails
      window.location.href = cleanPath;
    } catch (e2) {
      console.warn("Navigation protocol interrupted by environment constraints.");
    }
  }
};

/**
 * Legacy support for hash-based navigation.
 * While we prefer Clean URLs, we maintain this for backward compatibility.
 */
export const safeNavigateHash = (view: string) => {
  const hashPath = `#/${view.replace(/^#?\/?/, '')}`;
  try {
    window.location.hash = hashPath;
  } catch (e) {
    safeNavigatePath(view);
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