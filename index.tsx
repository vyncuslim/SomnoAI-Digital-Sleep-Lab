
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
    
    // Handle preloader removal after successful render attempt
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.style.opacity = '0';
      setTimeout(() => preloader.remove(), 500);
    }
  } catch (err) {
    // Log the catastrophic failure to console and audit logs
    console.error("SomnoAI Runtime Protocol Breach - React Mount Failed:", err);
    logAuditLog('RUNTIME_ERROR', `Critical Mount Failure: ${String(err)}`, 'CRITICAL').catch(() => {});

    // Provide user-friendly DOM fallback - UPDATED TO DARK THEME
    rootElement.innerHTML = `
      <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; color: #f8fafc; padding: 40px; background: #01040a;">
        <div style="width: 64px; height: 64px; border-radius: 50%; box-shadow: inset 16px 0 0 0 #4f46e5; margin-bottom: 32px; animation: spin 2s infinite linear;"></div>
        <h1 style="color: #6366f1; font-style: italic; font-weight: 900; letter-spacing: -0.05em; font-size: 2.5rem; margin-bottom: 16px; text-transform: uppercase;">TERMINAL OFFLINE</h1>
        <p style="max-width: 400px; line-height: 1.6; color: #64748b; font-weight: 500;">Neural link synchronization failed at the protocol layer. This is likely a temporary handshake error.</p>
        <button onclick="window.location.reload()" style="margin-top: 32px; padding: 16px 32px; background: #4f46e5; color: white; border: none; border-radius: 99px; cursor: pointer; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; font-style: italic; transition: transform 0.2s active:scale-95;">Execute Re-Sync</button>
        <style>@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }</style>
      </div>
    `;
  }
}