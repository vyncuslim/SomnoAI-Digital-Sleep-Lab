import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import './index.css';

// Suppress ResizeObserver loop error
const resizeObserverLoopErr = 'ResizeObserver loop completed with undelivered notifications.';
const resizeObserverLoopLimitErr = 'ResizeObserver loop limit exceeded';

const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes(resizeObserverLoopErr) || args[0].includes(resizeObserverLoopLimitErr))
  ) {
    return;
  }
  originalConsoleError(...args);
};

window.addEventListener('error', (e) => {
  if (
    e.message === resizeObserverLoopErr ||
    e.message === resizeObserverLoopLimitErr ||
    e.message?.includes('ResizeObserver')
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
