
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD v8.0
 * Monitors full-stack anomalies with dual-channel (Telegram + Email) fallback alert protocol.
 */

// Error Noise Filter: Prevents alerting on harmless client-side plugins
const isNoise = (msg: string) => {
  const noise = [
    'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
    'Google is not defined', 'Permissions-Policy', 'browsing-topics',
    'reading \'query\'', 'content.js', 'chrome-extension', 'Object.defineProperty',
    'reading \'postMessage\'', 'chrome.tabs.query', 'signal is aborted',
    'AbortError', 'user_app_status', 'Failed to initialize current tab',
    'initializeCurrentTab', 'Script error'
  ];
  return noise.some(n => msg.includes(n));
};

// Application State Capture
const getAppState = () => {
  return {
    path: window.location.hash || window.location.pathname,
    agent: navigator.userAgent,
    timestamp: new Date().toISOString()
  };
};

// 1. Intercept Uncaught Runtime Exceptions
window.onerror = (message, source, lineno, colno, error) => {
  const msgStr = String(message);
  if (isNoise(msgStr)) return true; 
  
  const state = getAppState();
  const report = `CRITICAL_EXCEPTION: ${msgStr} | AT: ${source}:${lineno}:${colno} | PATH: ${state.path} | AGENT: ${state.agent}`;
  
  logAuditLog('RUNTIME_ERROR', report, 'CRITICAL');
  return false;
};

// 2. Intercept Unhandled Promise Rejections (Async Handshakes)
window.onunhandledrejection = (event) => {
  const reason = event.reason?.message || event.reason;
  if (isNoise(String(reason))) {
    event.preventDefault(); 
    return;
  }
  
  const state = getAppState();
  const report = `ASYNC_EXCEPTION: ${reason} | PATH: ${state.path} | AGENT: ${state.agent}`;
  
  logAuditLog('ASYNC_HANDSHAKE_VOID', report, 'CRITICAL');
};

// 3. Intercept Console Error (Monkeypatch for database logging)
const originalConsoleError = console.error;
console.error = (...args) => {
  const message = args
    .map(arg => typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))
    .join(' ');
    
  if (!isNoise(message)) {
    logAuditLog('CONSOLE_ERROR_PROXIED', `LOG: ${message.slice(0, 500)}`, 'WARNING');
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
