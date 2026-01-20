
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Enhanced Service Worker Registration
 * Handles 404 responses gracefully in sandboxed environments.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Only attempt registration on secure origins that are not sandboxed 'null'
    try {
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      if (!isSecure) return;

      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.debug('SomnoAI PWA ServiceWorker active');
      }).catch(error => {
        // Suppress expected 404 errors in specific preview environments
        if (error.message && error.message.includes('404')) {
          console.debug('ServiceWorker script not found (Skipped).');
        } else {
          console.warn('ServiceWorker registration failed:', error.message);
        }
      });
    } catch (e) {
      // Catch SecurityError if window.location access is blocked
      console.debug('ServiceWorker registration blocked by browser environment.');
    }
  });
}

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
