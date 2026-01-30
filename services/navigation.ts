/**
 * SomnoAI Safe Navigation Utility (v2.6)
 * Optimized for sandboxed cross-origin environments.
 */

export const getSafeUrl = (): string => {
  // Use static document.URL as it is the most reliable primitive in sandboxes
  try {
    if (typeof document !== 'undefined' && document.URL) {
      return String(document.URL);
    }
  } catch (e) {}

  // Fallback to local frame context only
  try {
    if (typeof window !== 'undefined' && window.location) {
      return String(window.location.href); 
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
 * Updates local frame hash safely via window.location.
 */
export const safeNavigateHash = (hash: string) => {
  const target = hash.startsWith('#') ? hash : `#/${hash}`;
  try {
    if (typeof window !== 'undefined' && window.location) {
      window.location.hash = target;
    }
  } catch (e) {
    try {
      window.history.pushState(null, '', target);
    } catch (e2) {}
  }
};

export const safeReload = () => {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.reload) {
      window.location.reload();
    }
  } catch (e) {
    safeNavigateHash('dashboard');
  }
};
