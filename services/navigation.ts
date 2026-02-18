
/**
 * SomnoAI Safe Navigation Utility (v101.0)
 * Optimized for clean URLs, robust SPA routing, and Hybrid Node architectures.
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
 */
export const safeNavigatePath = (path: string) => {
  // 1. 基础标准化：移除查询参数，合并斜杠
  let cleanPath = path.split('?')[0].replace(/\/+/g, '/').trim();
  
  // 2. 根路径绝对归并
  const rootAliases = ['/', '', '/index.html', '/home', '/landing', '/welcome'];
  if (rootAliases.includes(cleanPath)) {
    cleanPath = '/';
  } else {
    // 确保以单斜杠开头
    if (!cleanPath.startsWith('/')) {
      cleanPath = '/' + cleanPath;
    }
    // 强制移除末尾斜杠（除根路径外）
    if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
  }
  
  // 3. 别名转换
  const aliases: Record<string, string> = {
    '/atlas': '/calendar',
    '/join': '/signup',
    '/research': '/news',
    '/stories': '/blog'
  };

  if (aliases[cleanPath]) {
    cleanPath = aliases[cleanPath];
  }

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
    const baseUrl = getSafeUrl().split('#')[0];
    window.location.replace(baseUrl);
  }
};
