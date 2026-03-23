import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, EyeOff } from 'lucide-react';

interface ContentProtectionProps {
  children: React.ReactNode;
}

export const ContentProtection: React.FC<ContentProtectionProps> = ({ children }) => {
  const { profile } = useAuth();
  const [sessionText, setSessionText] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isWindowFocused, setIsWindowFocused] = useState(true);
  
  const isOwner = profile?.email === 'ongyuze1401@gmail.com';

  useEffect(() => {
    if (isOwner) return;

    const handleSecurity = (e: Event) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      
      if (isInput) return; // Allow normal operations on inputs

      e.preventDefault();
      if (e.type === 'copy') {
        setShowCopyToast(true);
        setTimeout(() => setShowCopyToast(false), 3000);
      }
      return false;
    };

    const handleFocus = () => setIsWindowFocused(true);
    const handleBlur = () => setIsWindowFocused(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable;
      const key = e.key.toLowerCase();
      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      // Allow basic typing and shortcuts in inputs
      if (isInput) {
        // Still block F12 even in inputs
        if (e.key === 'F12') {
          e.preventDefault();
          return false;
        }
        return;
      }

      // Block Ctrl+C, X, V, S, U, P, A for non-input areas
      if (ctrlOrMeta && ['c', 'x', 'v', 's', 'u', 'p', 'a'].includes(key)) {
        e.preventDefault();
        return false;
      }

      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }

      // Block Ctrl+Shift+I/J/C
      if (ctrlOrMeta && e.shiftKey && ['i', 'j', 'c'].includes(key)) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    const events = ['copy', 'cut', 'paste', 'selectstart', 'dragstart', 'contextmenu'];
    events.forEach(evt => document.addEventListener(evt, handleSecurity, true));
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      events.forEach(evt => document.removeEventListener(evt, handleSecurity, true));
      document.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isOwner]);

  useEffect(() => {
    const updateSessionText = () => {
      const now = new Date();
      const text = `CONFIDENTIAL · ${profile?.email || 'GUEST'} · ${now.toLocaleString()}`;
      setSessionText(text);
    };

    updateSessionText();
    const interval = setInterval(updateSessionText, 60000);
    return () => clearInterval(interval);
  }, [profile]);

  return (
    <div className="relative min-h-screen">
      {children}
      
      {!isOwner && (
        <>
          {/* Global Style for Selection Control */}
          <style dangerouslySetInnerHTML={{ __html: `
            body {
              user-select: none !important;
              -webkit-user-select: none !important;
            }
            input, textarea, select, [contenteditable="true"] {
              user-select: text !important;
              -webkit-user-select: text !important;
            }
          `}} />

          {/* Copy Protection Toast */}
          <AnimatePresence>
            {showCopyToast && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[10001] bg-red-500/90 backdrop-blur-md border border-red-400/50 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3"
              >
                <Shield size={18} className="text-white animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-white text-sm font-black uppercase tracking-widest">Security Alert</span>
                  <span className="text-white/80 text-[10px] uppercase tracking-wider">Content is protected. Unauthorized copying is prohibited.</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Focus Loss Overlay (Method 35/Overlay) */}
          <AnimatePresence>
            {!isWindowFocused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[10002] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 flex items-center justify-center mb-8 border border-indigo-500/20 animate-pulse">
                  <EyeOff size={48} className="text-indigo-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">Content Hidden</h2>
                <p className="text-slate-400 max-w-md text-sm uppercase tracking-widest leading-relaxed">
                  For security reasons, content is hidden when the window loses focus. Return to the application to continue.
                </p>
                <div className="mt-12 flex items-center gap-4 text-[10px] text-indigo-500/60 font-black uppercase tracking-[0.3em]">
                  <Shield size={12} />
                  <span>Secure Session Active</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Dynamic Watermark Overlay */}
          <div className="fixed inset-0 pointer-events-none z-[9999] opacity-[0.03] overflow-hidden">
            <div className="absolute inset-0 flex flex-wrap gap-x-32 gap-y-32 p-10 rotate-[-25deg] scale-150">
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="text-xl font-black whitespace-nowrap tracking-widest uppercase">
                  {sessionText}
                </div>
              ))}
            </div>
          </div>

          {/* Image Protection Overlay (Method 74) */}
          <style dangerouslySetInnerHTML={{ __html: `
            img {
              pointer-events: none !important;
              -webkit-user-drag: none !important;
            }
            .img-container {
              position: relative;
              display: inline-block;
            }
            .img-container::after {
              content: "";
              position: absolute;
              inset: 0;
              z-index: 10;
              background: transparent;
            }
          `}} />
        </>
      )}
    </div>
  );
};
