
/**
 * SomnoAI Safe Navigation Utility (v3.1)
 * 严格隔离当前框架，防止在跨域沙盒中探测敏感的 Location 属性。
 */

export const getSafeUrl = (): string => {
  // 1. 最稳定的方式：document.URL 在跨域 iframe 中通常是只读且可访问的
  try {
    if (typeof document !== 'undefined' && document.URL) {
      return String(document.URL);
    }
  } catch (e) {}

  // 2. 备选方案：window.origin 权限通常比 location 高
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
 * 安全更新 Hash。在受限环境中回退到 history API。
 */
export const safeNavigateHash = (hash: string) => {
  let cleanPath = hash.replace(/^#+/, '').replace(/^\/+/, '').replace(/\/+$/, '');
  const target = cleanPath === '' ? '#/' : `#/${cleanPath}`;
  
  try {
    // 优先尝试直接修改 hash
    window.location.hash = target;
  } catch (e) {
    try {
      // 如果被禁止，尝试 pushState
      window.history.pushState(null, '', target);
    } catch (e2) {
      // 最终降级：记录到日志，不打断 UI
      console.debug("Navigation sync restricted.");
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
