import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

/**
 * SOMNO LAB NEURAL TELEMETRY GUARD v21.2
 * Structural integrity verified. Optimized for Error object serialization.
 */

const NOISE_LIST = [
  'ERR_BLOCKED_BY_CLIENT', 'Extension', 'Salesmartly', 
  'Google is not defined', 'Permissions-Policy', 'browsing-topics',
  'reading \'query\'', 'content.js', 'chrome-extension', 'Object.defineProperty',
  'reading \'postMessage\'', 'chrome.tabs.query', 'signal is aborted',
  'AbortError', 'user_app_status', 'Failed to initialize current tab',
  'initializeCurrentTab', 'Script error', 'E353: csPostMessage',
  'refresh_token_not_found', 'AuthApiError', 'session_not_found'
];

const isNoise = (msg: string): boolean => {
  for (let i = 0; i < NOISE_LIST.length; i++) {
    if (msg.includes(NOISE_LIST[i])) return true;
  }
  return false;
};

window.onerror = (msg, src, line, col, err) => {
  const m = String(msg || 'EXCEPTION_GENERIC');
  if (!isNoise(m)) {
    logAuditLog('RUNTIME_ERROR', `TRACE: ${m.slice(0, 150)}`, 'CRITICAL').catch(() => {});
  }
  return false;
};

window.onunhandledrejection = (e) => {
  const r = e.reason?.message || e.reason;
  const rStr = String(r || 'REJECTION_VOID');
  if (!isNoise(rStr)) {
    logAuditLog('ASYNC_FAULT', `VOID: ${rStr.slice(0, 150)}`, 'CRITICAL').catch(() => {});
  } else {
    e.preventDefault();
  }
};

const originalError = console.error;
let isProxyLogging = false;

console.error = function(...args: any[]) {
  if (!isProxyLogging) {
    try {
      let combinedText = "";
      for (let j = 0; j < args.length; j++) {
        const val = args[j];
        if (val instanceof Error) {
          combinedText += `[Error: ${val.message}] ${val.stack || ''}`;
        } else if (typeof val === 'object' && val !== null) {
          try { combinedText += JSON.stringify(val); } catch (e) { combinedText += "[OBJ]"; }
        } else {
          combinedText += String(val);
        }
        combinedText += " ";
      }

      if (combinedText.length > 5 && !isNoise(combinedText)) {
        isProxyLogging = true;
        logAuditLog('CONSOLE_PROXY', combinedText.slice(0, 400), 'WARNING')
          .finally(() => { isProxyLogging = false; });
      }
    } catch (err) {
      isProxyLogging = false;
    }
  }
  originalError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
