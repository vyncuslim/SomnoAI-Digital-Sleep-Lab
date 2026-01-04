
import React, { useState, useEffect, useCallback } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Loader2, BrainCircuit, HeartPulse, Scan, Cpu, Github, Download, Check, ChevronLeft, ChevronRight, Binary, Zap, Lightbulb, ExternalLink, Shield, FileText
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, lang, onSyncFit, onNavigate }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [ticker, setTicker] = useState("FF00AA11");
  const [insightIndex, setInsightIndex] = useState(0);
  const t = translations[lang].dashboard;

  const insights = (data.aiInsights || []).slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      setTicker(prev => (prev + " " + hex).slice(-100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    try {
      await onSyncFit((status) => setSyncStatus(status));
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);
  const liveLinkId = ticker.split(' ').filter(Boolean)[0] || "00000000";

  return (
    <motion.div 
      initial={{ opacity: 0, z: -100, rotateX: 20 }} 
      animate={{ opacity: 1, z: 0, rotateX: 0 }} 
      className="space-y-8 pb-10"
      style={{ transformStyle: "preserve-3d" }}
    >
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-xl"
          >
             <Scan size={16} className="text-indigo-400" />
          </motion.div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t.neuralActive}</p>
            <p className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {t.liveLink}: 0x{liveLinkId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSync}
            className={`p-3 rounded-2xl transition-all shadow-3d ${isProcessing ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
          >
            <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" style={{ transformStyle: "preserve-3d" }}>
        <GlassCard 
          intensity={1.2}
          className="p-10 md:col-span-2 border-indigo-500/30 overflow-visible"
        >
          <div className="flex justify-between items-start mb-12">
            <div className="space-y-2">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                <BrainCircuit size={16} />
                {t.aiSynthesis}
              </h2>
              <div className="flex items-baseline gap-2">
                <motion.h1 
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(79,70,229,0.5)]"
                >
                  {data.score}
                </motion.h1>
                <span className="text-2xl text-slate-600 font-bold tracking-widest">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="px-4 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.stable}</span>
              </div>
            </div>
          </div>

          <div className="relative min-h-[160px] px-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={insightIndex}
                initial={{ opacity: 0, y: 20, z: 50 }}
                animate={{ opacity: 1, y: 0, z: 100 }}
                exit={{ opacity: 0, y: -20, z: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-xl">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase">
                      Insight Analysis
                    </span>
                  </div>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                </div>
                
                <p className="text-2xl md:text-3xl font-bold italic text-white leading-tight">
                  "{insights[insightIndex] || (lang === 'zh' ? "正在读取实验报告..." : "Loading synthesis...")}"
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-12 space-y-4">
            <div className="flex justify-between items-center text-[11px] font-black text-slate-500 uppercase tracking-widest">
              <span>Optimization Depth</span>
              <span className="text-indigo-400">{data.score}%</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${data.score}%` }} 
                transition={{ duration: 2, ease: "circOut" }}
                className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.8)]"
              />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-6 md:col-span-2" style={{ transformStyle: "preserve-3d" }}>
          <GlassCard className="p-8 text-center group cursor-pointer hover:border-rose-500/30" intensity={1.1}>
            <div className="flex flex-col items-center gap-4">
               <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 group-hover:scale-110 transition-transform">
                  <HeartPulse size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Resting HR</p>
                 <p className="text-4xl font-black font-mono tracking-tighter text-white">{data.heartRate.resting}<span className="text-xs text-slate-600 ml-1">BPM</span></p>
               </div>
            </div>
          </GlassCard>

          <GlassCard className="p-8 text-center group cursor-pointer hover:border-indigo-500/30" intensity={1.1}>
            <div className="flex flex-col items-center gap-4">
               <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                  <Cpu size={28} />
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Efficiency</p>
                 <p className="text-4xl font-black font-mono tracking-tighter text-white">{data.efficiency}<span className="text-xs text-slate-600 ml-1">%</span></p>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="px-2 pt-10 flex items-center justify-between opacity-20">
        <div className="flex items-center gap-2">
          <Binary size={12} className="text-indigo-400" />
          <span className="text-[9px] font-mono tracking-widest uppercase">Telemetry Active</span>
        </div>
        <div className="flex gap-4">
          <span className="text-[9px] font-mono tracking-widest">0x{ticker.slice(0, 12)}</span>
        </div>
      </div>
    </motion.div>
  );
};
