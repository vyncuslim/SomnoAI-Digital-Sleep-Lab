
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Home, RefreshCw, Unplug, Database } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto font-sans">
      <m.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8"
      >
        <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
        <Logo size={160} animated={true} className="mx-auto relative z-10" />
        <m.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-30px] border border-dashed border-indigo-500/10 rounded-full pointer-events-none"
        />
      </m.div>

      <div className="mb-10 space-y-2">
        <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
          SomnoAI <span className="text-indigo-500">Sleep Lab</span>
        </h2>
        <div className="h-px w-12 bg-indigo-500/30 mx-auto" />
      </div>

      <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-white">
          <Database size={200} />
        </div>

        <div className="space-y-8 relative z-10">
          <div className="space-y-4">
            <h1 className="text-8xl font-black italic tracking-tighter text-white uppercase leading-none">
              4<span className="text-indigo-500">0</span>4
            </h1>
            <div className="flex items-center justify-center gap-3">
              <Unplug className="text-rose-500" size={20} />
              <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.6em] italic">Neural Link Severed</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed italic font-medium max-w-sm mx-auto">
            Target coordinates not found in the neural grid. The requested node may have been expunged or moved to a restricted sector.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => window.location.hash = '#/'}
              className="flex-1 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all italic flex items-center justify-center gap-3"
            >
              <Home size={16} /> Return to Base
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-5 bg-slate-900 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-widest hover:text-white transition-all italic flex items-center justify-center gap-3"
            >
              <RefreshCw size={14} /> Re-sync Node
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-12 space-y-1 opacity-50">
        <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.8em]">Error Code: NODE_NOT_FOUND</p>
        <p className="text-slate-700 text-[8px] font-black uppercase tracking-[0.8em]">Registry: SomnoAI Sleep Lab Core</p>
      </div>
    </div>
  );
};
