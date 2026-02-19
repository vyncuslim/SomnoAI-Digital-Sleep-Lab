import React from 'react';
import { motion } from 'framer-motion';

const m = motion as any;

/**
 * RootLayout component optimized for high-density lab interfaces.
 */
export default function RootLayout({ children }: { children?: React.ReactNode }) {
  const navigateToOpenSource = () => {
    window.history.pushState({}, '', '/opensource');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
      <main className="relative z-10 flex-1">
        {children}
      </main>

      {/* Lab Global Footer - Compressed */}
      <footer className="py-8 flex flex-col items-center gap-2 opacity-20 shrink-0">
        <p className="text-[9px] font-mono uppercase tracking-[0.4em]">
          @2026 SomnoAI Digital Sleep Lab • Infrastructure v3.5
        </p>
        <button 
          onClick={navigateToOpenSource}
          className="text-[7px] font-black text-indigo-500 uppercase tracking-[0.2em] italic hover:text-white transition-colors pointer-events-auto cursor-pointer"
        >
          SEMI-OPEN SOURCE PROTOCOL • VIEW ARCHITECTURE
        </button>
      </footer>
    </div>
  );
}