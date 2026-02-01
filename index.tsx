
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD
 * 监控全域异常并执行异地备份及告警
 */

// 错误过滤逻辑：屏蔽插件/扩展引起的无效错误
const isNoise = (msg: string) => {
  const noise = [
    'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
    'Google is not defined', 'Permissions-Policy', 'browsing-topics',
    'reading \'query\'', 'content.js', 'chrome-extension', 'Object.defineProperty',
    'reading \'postMessage\'', 'chrome.tabs.query', 'signal is aborted',
    'AbortError', 'user_app_status', 'Failed to initialize current tab',
    'initializeCurrentTab', 'TypeError', 'Failed to load resource'
  ];
  return noise.some(n => msg.includes(n));
};

// 1. 拦截未捕获的运行时错误
window.onerror = (message, source, lineno, colno, error) => {
  const msgStr = String(message);
  if (isNoise(msgStr)) return true; // 返回 true 彻底静默报错
  
  logAuditLog(`RUNTIME_ERROR: ${source}:${lineno}:${colno}`, `${msgStr}\nStack: ${error?.stack}`, 'CRITICAL');
  return false;
};

// 2. 拦截未处理的 Promise 拒绝
window.onunhandledrejection = (event) => {
  const reason = event.reason?.message || event.reason;
  if (isNoise(String(reason))) {
    event.preventDefault(); // 阻止浏览器控制台显示
    return;
  }
  
  logAuditLog(
    'ASYNC_HANDSHAKE_VOID',
    `Unhandled Promise Rejection: ${reason}\nStack: ${event.reason?.stack}`,
    'CRITICAL'
  );
};

// 3. 拦截 console.error 调用 (Monkeypatch)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args
    .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
    .join(' ');
    
  if (isNoise(message)) return; // 直接吞掉插件报错
  
  logAuditLog('CONSOLE_ERROR_PROXIED', `${message}\nStack: ${new Error().stack}`, 'WARNING');
  originalConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
