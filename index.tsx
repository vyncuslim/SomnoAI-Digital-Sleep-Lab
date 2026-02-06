import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD v19.0
 * Verified syntactic safety protocol.
 */

const NOISE = [
  'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
  'Google is not defined', 'Permissions-Policy', 'browsing-topics',
  'reading \'query\'', 'content.js', 'chrome-extension', 'Object.defineProperty',
  'reading \'postMessage\'', 'chrome.tabs.query', 'signal is aborted',
  'AbortError', 'user_app_status', 'Failed to initialize current tab',
  'initializeCurrentTab', 'Script error', 'E353: csPostMessage'
];

const isNoise = (msg: string): boolean => {
  for (let i = 0; i < NOISE.length; i++) {
    if (msg.includes(NOISE[i])) {
      return true;
    }
  }
  return false;
};

window.onerror = (msg, src, line, col, err) => {
  const m = String(msg || 'EXCEPTION_GENERIC');
  if (isNoise(m)) {
    return true;
  }
  logAuditLog('RUNTIME_ERROR', `TRACE: ${m.slice(0, 150)}`, 'CRITICAL').catch(() => {});
  return false;
};

window.onunhandledrejection = (e) => {
  const r = e.reason?.message || e.reason;
  const rStr = String(r || 'REJECTION_VOID');
  if (isNoise(rStr)) {
    e.preventDefault();
    return;
  }
  logAuditLog('ASYNC_FAULT', `VOID: ${rStr.slice(0, 150)}`, 'CRITICAL').catch(() => {});
};

const originalError = console.error;
let isLogging = false;

console.error = function(...args: any[]) {
  if (!isLogging) {
    try {
      let combined = "";
      for (let j = 0; j < args.length; j++) {
        const a = args[j];
        if (typeof a === 'object' && a !== null) {
          try {
            combined += JSON.stringify(a);
          } catch (e) {
            combined += "[OBJ]";
          }
        } else {
          combined += String(a);
        }
        combined += " ";
      }

      if (combined.length > 5 && !isNoise(combined)) {
        isLogging = true;
        logAuditLog('CONSOLE_PROXY', combined.slice(0, 200), 'WARNING')
          .then(() => { isLogging = false; })
          .catch(() => { isLogging = false; });
      }
    } catch (err) {
      isLogging = false;
    }
  }
  originalError.apply(console, args);
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}