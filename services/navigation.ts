/**
 * SomnoAI Safe Navigation Utility (v5.5)
 * 专门针对 Vercel History Mode (Clean URLs) 优化的路由引擎。
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
 * 现代物理路径导航核心协议
 * 使用 History API 更新地址栏而不刷新页面。
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
    // 降级：如果 History API 受限，执行硬跳转
    window.location.href = cleanPath;
  }
};

/**
 * 遗留哈希兼容代理 (Legacy Support)
 * 自动将旧版 # 链接重定向至物理路径。
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