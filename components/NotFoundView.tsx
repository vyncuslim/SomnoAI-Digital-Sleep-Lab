import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, ShieldX, Radio, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { safeNavigateHash, safeReload } from '../services/navigation.ts';

const m = motion as any;

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto font-sans relative overflow-hidden bg-[#020617]">
      {/* Immersive Background Decor */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.1]" />
      </div>

      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.02] bg-gradient-to-b from-transparent via-white to-transparent h-10 animate-scan" style={{ animation: 'scan 4s linear infinite' }} />

      {/* Branded Identity Header */}
      <m.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 relative"
      >
        <div className="relative inline-block">
          <Logo size={140} animated={true} className="mx-auto drop-shadow-[0_0_50px_rgba(99,102,241,0.4)]" />
          <m.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-6 border border-dashed border-indigo-500/20 rounded-full" 
          />
        </div>
        <div className="mt-10 space-y-2">
          <h2 className="text-3xl font-black italic text-white uppercase tracking-[0.3em] leading-none">
            SomnoAI <span className="text-indigo-500">Sleep Lab</span>
          </h2>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Biological Node Registry Offline</p>
        </div>
      </m.div>

      {/* High-Fidelity 404 Hub */}
      <GlassCard className="p-12 md:p-20 rounded-[5rem] border-white/5 bg-slate-950/60 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.9)] relative overflow-hidden" intensity={2}>
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-white transform rotate-12">
          <ShieldX size={350} strokeWidth={1} />
        </div>

        <div className="space-y-12 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center justify-center gap-6 mb-4">
               <div className="h-px w-16 bg-rose-500/20" />
               <Radio size={24} className="text-rose-500 animate-pulse" />
               <div className="h-px w-16 bg-rose-500/20" />
            </div>
            <h1 className="text-[110px] md:text-[160px] font-black italic tracking-tighter text-white uppercase leading-none select-none glitch-shadow">
              4<span className="text-indigo-500">0</span>4
            </h1>
            <p className="text-rose-500 font-black uppercase tracking-[0.6em] text-[13px] italic">Neural Link: SEVERED</p>
          </div>

          <div className="space-y-8">
            <p className="text-2xl font-bold text-white italic leading-tight uppercase tracking-tight max-w-lg mx-auto">
              "Virtual node unreachable: The requested physiological sector is offline."
            </p>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent max-w-xs mx-auto" />
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-sm mx-auto italic uppercase tracking-[0.2em]">
              Node resolution failure detected. The sector has been restricted by system policy. <br/>Error Code: NODE_0X404_VOID
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-10 max-w-md mx-auto">
            <button 
              onClick={() => safeNavigateHash('dashboard')}
              className="group flex-1 py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-950/60 hover:bg-indigo-500 active:scale-95 transition-all italic flex items-center justify-center gap-3"
            >
              <Home size={18} className="group-hover:-translate-y-0.5 transition-transform" /> Restore Hub
            </button>
            <button 
              onClick={() => safeReload()}
              className="flex-1 py-7 bg-slate-900 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all italic flex items-center justify-center gap-3 active:scale-95"
            >
              <RefreshCw size={18} /> Sync Node
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-20">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-4 text-[10px] font-black text-slate-700 hover:text-indigo-400 uppercase tracking-widest transition-all italic group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> RETURN TO PREVIOUS SECTOR
        </button>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100vh); }
          to { transform: translateY(100vh); }
        }
        .glitch-shadow {
          text-shadow: 0 0 40px rgba(99, 102, 241, 0.5), 0 0 10px rgba(244, 63, 94, 0.2);
        }
      `}</style>
    </div>
  );
};