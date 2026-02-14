import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

if ((window as any).SOMNO_HALT_LOADER) (window as any).SOMNO_HALT_LOADER();

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 500);
    }
  } catch (err) {
    console.error("React Core Ingress Failed:", err);
    logAuditLog('RUNTIME_ERROR', `Mount Failed: ${String(err)}`, 'CRITICAL').catch(() => {});
  }
}