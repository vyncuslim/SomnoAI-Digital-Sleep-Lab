
import React from 'react';
import { motion } from 'framer-motion';

const m = motion as any;

/**
 * RootLayout component that wraps the main application content.
 * Using optional children to satisfy strict prop checking and prevent "missing children" errors in some build environments.
 */
export default function RootLayout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* 核心布局外壳 */}
      <div className="relative z-10">
        {children}
      </div>

      {/* 底部版权信息 */}
      <footer className="py-12 flex flex-col items-center gap-4 opacity-30 pointer-events-none">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em]">
          SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
}
