import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, Database, ZapOff, ArrowLeft, ShieldX, Radio } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { safeNavigateHash, safeReload } from '../services/navigation.ts';

const m = motion as any;

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto font-sans relative overflow-hidden">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15]" />
      </div>

      <div className="scanline absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-gradient-to-b from-transparent via-white to-transparent h-10 animate-scan" style={{ animation: 'scan 4s linear infinite' }} />

      {/* Branded Header */}
      <m.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 relative"
      >
        <div className="relative inline-block">
          <Logo size={140} animated={true} className="mx-auto drop-shadow-[0_0_40px_rgba(99,102,241,0.3)]" />
          <m.div 
            animate={{ rotate: 360 }} 
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-4 border border-dashed border-indigo-500/20 rounded-full" 
          />
        </div>
        <div className="mt-8 space-y-2">
          <h2 className="text-2xl font-black italic text-white uppercase tracking-[0.3em]">
            SomnoAI <span className="text-indigo-500">Sleep Lab</span>
          </h2>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Accessing Virtual Node Sector</p>
        </div>
      </m.div>

      {/* 404 Hub Card */}
      <GlassCard className="p-12 md:p-20 rounded-[5rem] border-white/5 bg-slate-950/60 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.9)] relative overflow-hidden" intensity={2}>
        <div className="absolute top-0 right-0 p-12 opacity-[0.04] pointer-events-none text-white transform rotate-12">
          <ShieldX size={320} strokeWidth={1} />
        </div>

        <div className="space-y-12 relative z-10">
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-6 mb-4">
               <div className="h-px w-12 bg-rose-500/30" />
               <Radio size={24} className="text-rose-500 animate-pulse" />
               <div className="h-px w-12 bg-rose-500/30" />
            </div>
            <h1 className="text-[120px] md:text-[180px] font-black italic tracking-tighter text-white uppercase leading-none select-none glitch-text">
              4<span className="text-indigo-500">0</span>4
            </h1>
            <p className="text-rose-500 font-black uppercase tracking-[0.6em] text-[12px] italic">Neural Link: SEVERED</p>
          </div>

          <div className="space-y-6">
            <p className="text-2xl font-bold text-white italic leading-tight uppercase tracking-tight max-w-lg mx-auto">
              "Virtual node offline: The requested physiological sector is unreachable."
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-sm mx-auto italic uppercase tracking-[0.2em] border-t border-white/5 pt-6">
              The address could not be resolved by the laboratory core node. Error Code: NODE_RESOLUTION_FAILURE_0X404
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 pt-8 max-w-md mx-auto">
            <button 
              onClick={() => safeNavigateHash('dashboard')}
              className="group flex-1 py-6 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-950/60 hover:bg-indigo-500 active:scale-95 transition-all italic flex items-center justify-center gap-3"
            >
              <Home size={16} className="group-hover:-translate-y-0.5 transition-transform" /> Restore Hub
            </button>
            <button 
              onClick={() => safeReload()}
              className="flex-1 py-6 bg-slate-900 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all italic flex items-center justify-center gap-3 active:scale-95"
            >
              <RefreshCw size={16} /> Sync Node
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-16">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-3 text-[10px] font-black text-slate-700 hover:text-indigo-400 uppercase tracking-widest transition-all italic group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> PREVIOUS SECTOR
        </button>
      </div>

      <style>{`
        @keyframes scan {
          from { transform: translateY(-100vh); }
          to { transform: translateY(100vh); }
        }
        .glitch-text {
          text-shadow: 0 0 30px rgba(99, 102, 241, 0.4);
        }
      `}</style>
    </div>
  );
};