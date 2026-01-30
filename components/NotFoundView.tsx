import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, Database, ZapOff, ArrowLeft } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { safeNavigateHash, safeReload } from '../services/navigation.ts';

const m = motion as any;

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto font-sans relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] pointer-events-none -z-10">
        <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full" />
      </div>

      {/* Branded Header */}
      <m.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 relative"
      >
        <Logo size={120} animated={true} className="mx-auto" />
        <div className="mt-6 space-y-1">
          <h2 className="text-xl font-black italic text-white uppercase tracking-[0.2em]">
            SomnoAI <span className="text-indigo-500">Sleep Lab</span>
          </h2>
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em]">System Integrity Check</p>
        </div>
      </m.div>

      {/* 404 Hub */}
      <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl relative overflow-hidden" intensity={1.5}>
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-white transform rotate-12">
          <Database size={280} />
        </div>

        <div className="space-y-10 relative z-10">
          <div className="space-y-2">
            <h1 className="text-[140px] font-black italic tracking-tighter text-white uppercase leading-none select-none">
              4<span className="text-indigo-500">0</span>4
            </h1>
            <div className="flex items-center justify-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500 border border-rose-500/20">
                <ZapOff size={18} />
              </div>
              <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.4em] italic">Neural Link Failure</p>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-xl font-bold text-white italic leading-tight">"页面离线：该节点已被移除或尚未激活。"</p>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium max-w-sm mx-auto italic uppercase tracking-widest">
              The requested virtual address could not be resolved by the laboratory core. Please return to the primary dashboard.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => safeNavigateHash('dashboard')}
              className="flex-1 py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl shadow-indigo-950/40 hover:bg-indigo-500 active:scale-95 transition-all italic flex items-center justify-center gap-3"
            >
              <Home size={16} /> Restore Hub Access
            </button>
            <button 
              onClick={() => safeReload()}
              className="flex-1 py-5 bg-slate-900 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all italic flex items-center justify-center gap-3"
            >
              <RefreshCw size={16} /> Sync Node
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-12">
        <button 
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors italic"
        >
          <ArrowLeft size={14} /> Back to Previous Sector
        </button>
      </div>

      <div className="mt-16 opacity-30">
        <p className="text-slate-700 text-[8px] font-mono font-black uppercase tracking-[0.5em]">ERROR_CODE: NODE_RESOLUTION_FAILURE_0X404</p>
      </div>
    </div>
  );
};