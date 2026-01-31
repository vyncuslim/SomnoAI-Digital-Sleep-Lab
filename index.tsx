
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { reportError } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD
 * 监控全域异常并执行异地备份及告警
 */

// 1. 拦截未捕获的运行时错误
window.onerror = (message, source, lineno, colno, error) => {
  reportError(
    String(message), 
    error?.stack, 
    `RUNTIME_ERROR: ${source}:${lineno}:${colno}`
  );
  return false; // 继续在本地控制台显示
};

// 2. 拦截未处理的 Promise 拒绝
window.onunhandledrejection = (event) => {
  reportError(
    `Unhandled Promise Rejection: ${event.reason?.message || event.reason}`,
    event.reason?.stack,
    'ASYNC_HANDSHAKE_VOID'
  );
};

// 3. 拦截 console.error 调用 (Monkeypatch)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args
    .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
    .join(' ');
    
  // 执行异步上报，不阻塞控制台输出
  reportError(message, new Error().stack, 'CONSOLE_ERROR_PROXIED');
  
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
