
/**
 * SomnoAI Safe Navigation Utility (v3.2)
 * 严格隔离当前框架，防止在跨域沙盒中探测敏感的 Location 属性。
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
 * 优先使用 Pathname 导航。在受限环境中回退。
 */
export const safeNavigatePath = (path: string) => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  try {
    window.history.pushState(null, '', cleanPath);
    // 触发全局 popstate 事件以通知 App.tsx 的路由监听器
    window.dispatchEvent(new PopStateEvent('popstate'));
  } catch (e) {
    try {
      window.location.href = cleanPath;
    } catch (e2) {
      console.warn("Navigation logic restricted by host.");
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
      console.warn("Reload logic blocked by host.");
    }
  }
};
