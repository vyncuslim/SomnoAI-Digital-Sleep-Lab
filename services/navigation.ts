/**
 * SomnoAI Safe Navigation Utility (v4.6)
 * 专门针对 Vercel History Mode 优化的导航工具。
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
 * 核心导航协议：执行物理路径跳转
 * 使用浏览器 History API 保持 URL 整洁且不刷新页面。
 */
export const safeNavigatePath = (path: string) => {
  // 路径标准化
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/landing') cleanPath = '/';

  try {
    // 1. 物理更新浏览器地址栏
    window.history.pushState({ somno_route: true }, '', cleanPath);
    
    // 2. 调度 popstate 事件，强制 App.tsx 的路由监听器感知变化
    window.dispatchEvent(new PopStateEvent('popstate', { state: { somno_route: true } }));
  } catch (e) {
    // 降级处理：若 History API 异常，执行硬跳转
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