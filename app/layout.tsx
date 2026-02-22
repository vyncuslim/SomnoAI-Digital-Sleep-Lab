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
      <footer className="py-8 flex flex-col items-center gap-4 opacity-70 shrink-0">
        <nav className="flex items-center gap-8">
          <button onClick={() => window.location.href = '/about'} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic hover:text-white transition-colors pointer-events-auto cursor-pointer">
            About Us
          </button>
          <button onClick={() => window.location.href = '/contact'} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic hover:text-white transition-colors pointer-events-auto cursor-pointer">
            Contact
          </button>
          <button onClick={() => window.location.href = '/privacy'} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic hover:text-white transition-colors pointer-events-auto cursor-pointer">
            Privacy
          </button>
          <button onClick={() => window.location.href = '/terms'} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] italic hover:text-white transition-colors pointer-events-auto cursor-pointer">
            Terms
          </button>
        </nav>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em]">
          @2026 SomnoAI Digital Sleep Lab • Infrastructure v3.5
        </p>
      </footer>
    </div>
  );
}