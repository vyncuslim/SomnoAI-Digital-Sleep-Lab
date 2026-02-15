/**
 * SomnoAI Safe Navigation Utility (v7.0)
 * Optimized for clean URLs, robust SPA routing, and Dynamic SEO Metadata.
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

/**
 * Updates document metadata dynamically for SEO / Google News indexing.
 */
export const updateMetadata = (title: string, description?: string, canonicalPath?: string) => {
  const brand = "SomnoAI Digital Sleep Lab";
  document.title = `${title} | ${brand}`;
  
  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }

  // Update Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && canonicalPath) {
    canonical.setAttribute('href', `https://sleepsomno.com${canonicalPath}`);
  }

  // Update OpenGraph Title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', `${title} | ${brand}`);
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

/**
 * Executes a clean URL transition using the History API.
 */
export const safeNavigatePath = (path: string) => {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/landing' || cleanPath === '/index.html') cleanPath = '/';

  try {
    if (window.location.pathname === cleanPath && !window.location.hash) return;
    window.history.pushState({ somno_route: true, timestamp: Date.now() }, '', cleanPath);
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
  } catch (e) {
    window.location.href = cleanPath;
  }
};

export const safeReload = () => {
  try {
    window.location.reload();
  } catch (e) {
    const baseUrl = getSafeUrl().split('#')[0];
    window.location.replace(baseUrl);
  }
};
