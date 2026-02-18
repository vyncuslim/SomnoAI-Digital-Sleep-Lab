/**
 * SomnoAI Safe Navigation Utility (v105.3)
 * Optimized for DNS Stability and Strict HTTPS Protocol Enforcement.
 */

export const getSafeUrl = (): string => {
  try {
    if (typeof window !== 'undefined' && window.location.href) {
      return String(window.location.href);
    }
  } catch (e) {}
  return 'https://sleepsomno.com/';
};

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

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://sleepsomno.com';
    const cleanPath = canonicalPath 
      ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`)
      : (typeof window !== 'undefined' ? window.location.pathname : '/');
    canonical.setAttribute('href', `${origin}${cleanPath}`);
  }
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

export const safeNavigatePath = (path: string) => {
  if (typeof window === 'undefined') return;

  // Protocol Enforcement: Fix ERR_SSL_VERSION_OR_CIPHER_MISMATCH
  if (window.location.hostname !== 'localhost' && window.location.protocol === 'http:') {
     window.location.replace(window.location.href.replace('http:', 'https:'));
     return;
  }

  let cleanPath = path.split('?')[0].replace(/\/+/g, '/').trim();
  const rootAliases = ['/', '', '/index.html', '/home', '/landing', '/welcome'];
  if (rootAliases.includes(cleanPath)) {
    cleanPath = '/';
  } else {
    if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
  }
  
  const aliases: Record<string, string> = {
    '/atlas': '/calendar',
    '/join': '/signup',
    '/research': '/news'
  };
  if (aliases[cleanPath]) cleanPath = aliases[cleanPath];

  try {
    const currentPath = window.location.pathname;
    if (currentPath === cleanPath && !window.location.hash) return;
    window.history.pushState({ somno_route: true, timestamp: Date.now() }, '', cleanPath);
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    window.location.href = cleanPath;
  }
};

export const safeReload = () => {
  try {
    window.location.reload();
  } catch (e) {
    window.location.replace(getSafeUrl().split('#')[0]);
  }
};