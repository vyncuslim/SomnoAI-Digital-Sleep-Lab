
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

/**
 * Service Worker registration is skipped in this environment 
 * to prevent 404 noise and cross-origin security restrictions.
 */

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
