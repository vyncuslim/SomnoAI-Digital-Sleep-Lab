import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { logAuditLog } from './services/supabaseService.ts';

if ((window as any).SOMNO_HALT_LOADER) (window as any).SOMNO_HALT_LOADER();

const rootElement = document.getElementById('root');

const clearLoader = () => {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    preloader.style.opacity = '0';
    setTimeout(() => preloader.remove(), 500);
  }
};

if (rootElement) {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    
    // Execute multiple cleanup attempts
    clearLoader();
    window.onload = clearLoader;
  } catch (err) {
    console.error("SomnoAI Runtime Protocol Breach - React Mount Failed:", err);
    logAuditLog('RUNTIME_ERROR', `Critical Mount Failure: ${String(err)}`, 'CRITICAL').catch(() => {});

    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; color: #f8fafc; padding: 40px; background: #01040a;">
        <h1 style="color: #6366f1; font-weight: 900; font-size: 2.5rem; margin-bottom: 16px;">TERMINAL OFFLINE</h1>
        <p style="color: #64748b;">Neural link synchronization failed at the protocol layer.</p>
        <button onclick="window.location.reload()" style="margin-top: 32px; padding: 16px 32px; background: #4f46e5; color: white; border: none; border-radius: 99px; cursor: pointer; font-weight: 900;">Execute Re-Sync</button>
      </div>
    `;
    clearLoader();
  }
}