/**
 * SomnoAI Safe Navigation Utility (v3.0)
 * Strictly isolates current frame and prevents cross-origin Location probes.
 */

export const getSafeUrl = (): string => {
  // Use static document.URL as the most stable primitive in sandboxes
  try {
    if (typeof document !== 'undefined' && document.URL) {
      return String(document.URL);
    }
  } catch (e) {}

  // Carefully guarded local window.location access
  try {
    if (typeof window !== 'undefined' && window.location) {
      // Accessing window.location directly via string conversion
      // to avoid 'named property' access triggers like .href
      return String(window.location); 
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
 * Updates local frame hash safely.
 * Logic: Ensures path starts with #/ and removes redundant slashes.
 */
export const safeNavigateHash = (hash: string) => {
  // Normalize: remove leading # and leading/trailing slashes
  let cleanPath = hash.replace(/^#+/, '').replace(/^\/+/, '').replace(/\/+$/, '');
  
  // Reconstruct correctly
  const target = cleanPath === '' ? '#/' : `#/${cleanPath}`;
  
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
    // If reload is restricted, force navigation to base dashboard
    safeNavigateHash('dashboard');
    if (typeof window !== 'undefined') {
        // Fallback redirection via URL string
        const baseUrl = getSafeUrl().split('#')[0];
        window.location.replace(baseUrl);
    }
  }
};