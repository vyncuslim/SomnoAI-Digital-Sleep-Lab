import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Robust error suppression for ResizeObserver loop errors
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications.';
const resizeObserverLoopLimitErr = 'ResizeObserver loop limit exceeded';

// Patch console.error
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = args[0];
  if (
    typeof msg === 'string' &&
    (msg.includes('ResizeObserver loop') || 
     msg === resizeObserverLoopErr || 
     msg === resizeObserverLoopLimitErr)
  ) {
    return;
  }
  originalConsoleError(...args);
};

// Patch window.onerror
const originalOnError = window.onerror;
window.onerror = (message, source, lineno, colno, error) => {
  if (
    typeof message === 'string' && 
    (message.includes('ResizeObserver loop') || 
     message === resizeObserverLoopErr || 
     message === resizeObserverLoopLimitErr)
  ) {
    return true; // Prevent default handler
  }
  if (originalOnError) {
    return originalOnError(message, source, lineno, colno, error);
  }
  return false;
};

// Patch window error event listener
window.addEventListener('error', (e) => {
  if (
    e.message === resizeObserverLoopErr ||
    e.message === resizeObserverLoopLimitErr ||
    (typeof e.message === 'string' && e.message.includes('ResizeObserver loop'))
  ) {
    e.stopImmediatePropagation();
    e.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>,
);
