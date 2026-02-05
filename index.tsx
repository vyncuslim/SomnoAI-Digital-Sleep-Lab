import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD v8.5
 */

const isNoise = (msg: string) => {
  const noise = [
    'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
    'Google is not defined', 'Permissions-Policy', 'browsing-topics',
    'reading \'query\'', 'content.js', 'chrome-extension', 'Object.defineProperty',
    'reading \'postMessage\'', 'chrome.tabs.query', 'signal is aborted',
    'AbortError', 'user_app_status', 'Failed to initialize current tab',
    'initializeCurrentTab', 'Script error', 'E353: csPostMessage', 'timeout 60000 ms'
  ];
  return noise.some(n => msg.includes(n));
};

const getAppState = () => {
  try {
    return {
      path: window.location.pathname || '/',
      agent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };
  } catch (e) {
    return { path: 'UNKNOWN', agent: 'UNKNOWN', timestamp: new Date().toISOString() };
  }
};

window.onerror = (message, source, lineno, colno, error) => {
  const msgStr = String(message);
  if (isNoise(msgStr)) return true; 
  
  const state = getAppState();
  const report = `CRITICAL_EXCEPTION: ${msgStr} | AT: ${source}:${lineno}:${colno} | PATH: ${state.path}`;
  
  logAuditLog('RUNTIME_ERROR', report, 'CRITICAL');
  return false;
};

window.onunhandledrejection = (event) => {
  const reason = event.reason?.message || event.reason;
  if (isNoise(String(reason))) {
    event.preventDefault(); 
    return;
  }
  
  const state = getAppState();
  const report = `ASYNC_EXCEPTION: ${reason} | PATH: ${state.path}`;
  
  logAuditLog('ASYNC_HANDSHAKE_VOID', report, 'CRITICAL');
};

const originalConsoleError = console.error;
console.error = (...args) => {
  try {
    const message = args
      .map(arg => {
        try {
          return typeof arg === 'object' ? JSON.stringify(arg) : String(arg);
        } catch (e) { return "[Circular/Non-Stringifiable Object]"; }
      })
      .join(' ');
      
    if (!isNoise(message)) {
      logAuditLog('CONSOLE_ERROR_PROXIED', `LOG: ${message.slice(0, 500)}`, 'WARNING');
    }
  } catch (err) {}
  originalConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}