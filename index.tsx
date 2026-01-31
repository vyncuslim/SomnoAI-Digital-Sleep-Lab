
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
// Fix: Import logAuditLog as reportError is not exported from supabaseService
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD
 * 监控全域异常并执行异地备份及告警
 */

// 错误过滤逻辑：屏蔽插件/扩展引起的无效错误
const isNoise = (msg: string) => {
  const noise = [
    'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
    'Google is not defined', 'Permissions-Policy', 'browsing-topics'
  ];
  return noise.some(n => msg.includes(n));
};

// 1. 拦截未捕获的运行时错误
window.onerror = (message, source, lineno, colno, error) => {
  const msgStr = String(message);
  if (!isNoise(msgStr)) {
    // Fix: Use logAuditLog instead of non-existent reportError. Signature: (action, details, level)
    logAuditLog(`RUNTIME_ERROR: ${source}:${lineno}:${colno}`, `${msgStr}\nStack: ${error?.stack}`, 'CRITICAL');
  }
  return false;
};

// 2. 拦截未处理的 Promise 拒绝
window.onunhandledrejection = (event) => {
  const reason = event.reason?.message || event.reason;
  if (!isNoise(String(reason))) {
    // Fix: Use logAuditLog instead of non-existent reportError. Signature: (action, details, level)
    logAuditLog(
      'ASYNC_HANDSHAKE_VOID',
      `Unhandled Promise Rejection: ${reason}\nStack: ${event.reason?.stack}`,
      'CRITICAL'
    );
  }
};

// 3. 拦截 console.error 调用 (Monkeypatch)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args
    .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
    .join(' ');
    
  if (!isNoise(message)) {
    // Fix: Use logAuditLog instead of non-existent reportError. Signature: (action, details, level)
    logAuditLog('CONSOLE_ERROR_PROXIED', `${message}\nStack: ${new Error().stack}`, 'WARNING');
  }
  
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
