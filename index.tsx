
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Enhanced Service Worker Registration
 * Handles 404 responses gracefully in sandboxed environments.
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    try {
      // Avoid registration if on insecure origin or specifically blocked sandboxes
      const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      if (!isSecure) return;

      // Use absolute path for sw.js to ensure it matches the root file
      navigator.serviceWorker.register('/sw.js').then(registration => {
        console.debug('SomnoAI PWA ServiceWorker active');
      }).catch(error => {
        if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
          console.debug('ServiceWorker script missing from root.');
        } else {
          console.warn('ServiceWorker registration error:', error.message);
        }
      });
    } catch (e) {
      console.debug('ServiceWorker init blocked.');
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
