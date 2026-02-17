
/**
 * SomnoAI Safe Navigation Utility (v12.0)
 * Optimized for clean URLs, robust SPA routing, and Dynamic SEO Metadata.
 */

export const getSafeUrl = (): string => {
  try {
    if (typeof window !== 'undefined' && window.location.href) {
      return String(window.location.href);
    }
  } catch (e) {}

  return 'https://sleepsomno.com/';
};

/**
 * Updates document metadata dynamically for SEO / Google News indexing.
 */
export const updateMetadata = (title: string, description?: string, canonicalPath?: string) => {
  const brand = "SomnoAI Digital Sleep Lab";
  const fullTitle = `${title} | ${brand}`;
  document.title = fullTitle;
  
  if (description) {
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', description);
    
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }

  // Update Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical && canonicalPath) {
    const cleanPath = canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`;
    canonical.setAttribute('href', `https://sleepsomno.com${cleanPath}`);
  }

  // Update OpenGraph Title
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);
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
 * Handles alias normalization and enforces single-slash standards.
 */
export const safeNavigatePath = (path: string) => {
  // Normalize path: Ensure single leading slash and no double slashes
  let cleanPath = '/' + path.replace(/^\/+/, '').replace(/\/+$/, '');
  if (cleanPath === '/index.html' || cleanPath === '/home' || cleanPath === '/landing') {
    cleanPath = '/';
  }
  
  // Custom Aliases
  const aliases: Record<string, string> = {
    '/atlas': '/calendar',
    '/join': '/signup'
  };

  if (aliases[cleanPath]) {
    cleanPath = aliases[cleanPath];
  }

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
