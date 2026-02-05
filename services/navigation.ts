/**
 * SomnoAI Safe Navigation Utility (v5.6)
 * Optimized for Vercel Clean URLs and History API.
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
 * 物理路径导航协议
 */
export const safeNavigatePath = (path: string) => {
  // 路径清洗与标准化
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/landing') cleanPath = '/';

  try {
    // 1. 物理推送状态到浏览器历史堆栈
    window.history.pushState({ somno_route: true, timestamp: Date.now() }, '', cleanPath);
    
    // 2. 调度信号通知 App 状态机执行 UI 切换
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
  } catch (e) {
    // 降级：如果 History API 受限，执行重定向
    window.location.href = cleanPath;
  }
};

/**
 * 遗留哈希兼容代理
 */
export const safeNavigateHash = (view: string) => {
  const cleanView = view.replace(/^#?\/?/, '');
  safeNavigatePath(cleanView);
};

export const safeReload = () => {
  try {
    window.location.reload();
  } catch (e) {
    const baseUrl = getSafeUrl().split('#')[0];
    window.location.replace(baseUrl);
  }
};