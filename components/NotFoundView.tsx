
import React from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, Unplug, Database, ShieldAlert, ZapOff } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

export const NotFoundView: React.FC = () => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-6 text-center max-w-2xl mx-auto font-sans">
      {/* 顶部品牌区 */}
      <m.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-12"
      >
        <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
        <Logo size={180} animated={true} className="mx-auto relative z-10" />
        <m.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-[-40px] border border-dashed border-indigo-500/10 rounded-full pointer-events-none"
        />
      </m.div>

      <div className="mb-10 space-y-4">
        <h2 className="text-2xl font-black italic text-white uppercase tracking-[0.2em]">
          SomnoAI <span className="text-indigo-500">Sleep Lab</span>
        </h2>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent mx-auto" />
      </div>

      {/* 404 核心卡片 */}
      <GlassCard className="p-12 md:p-16 rounded-[5rem] border-white/10 bg-slate-950/40 shadow-2xl relative overflow-hidden" intensity={1.5}>
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none text-white">
          <Database size={240} />
        </div>

        <div className="space-y-10 relative z-10">
          <div className="space-y-4">
            <h1 className="text-[120px] font-black italic tracking-tighter text-white uppercase leading-none select-none">
              4<span className="text-indigo-500">0</span>4
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <ZapOff size={20} />
              </div>
              <p className="text-[12px] font-black text-rose-400 uppercase tracking-[0.8em] italic">Neural Link Severed</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-lg font-bold text-white italic leading-tight">页面走丢了，但睡眠还在 💤</p>
            <p className="text-xs text-slate-500 leading-relaxed font-medium max-w-sm mx-auto italic uppercase tracking-wider">
              Target coordinates not found in the neural grid. The requested node may have been expunged.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-5 pt-6">
            <button 
              onClick={() => window.location.hash = '#/'}
              className="flex-1 py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] hover:bg-indigo-500 active:scale-95 transition-all italic flex items-center justify-center gap-3"
            >
              <Home size={18} /> 返回主控台
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="flex-1 py-6 bg-slate-900 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all italic flex items-center justify-center gap-3"
            >
              <RefreshCw size={16} /> 重新同步节点
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="mt-16 space-y-2 opacity-40">
        <p className="text-slate-700 text-[9px] font-mono font-black uppercase tracking-[0.6em]">Error Code: NODE_NOT_FOUND_404</p>
        <p className="text-slate-700 text-[9px] font-mono font-black uppercase tracking-[0.6em]">Registry: SomnoAI Neural Base Terminal</p>
      </div>
    </div>
  );
};
