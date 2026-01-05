
import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, BrainCircuit, HeartPulse, Scan, Cpu, Binary, Zap, 
  Activity, ArrowUpRight, ShieldCheck, Waves, Target, Info, Heart
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
  staticMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, lang, onSyncFit, onNavigate, staticMode = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [engineActive, setEngineActive] = useState(false);
  const t = translations[lang].dashboard;

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setEngineActive(selected);
      } else {
        setEngineActive(!!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    
    if (!engineActive) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
      return;
    }

    try {
      await onSyncFit((status) => setSyncStatus(status));
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-32"
    >
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              <Scan size={20} className="text-indigo-400" />
            </div>
            {!staticMode && (
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-indigo-500/20 rounded-2xl"
              />
            )}
          </div>
          <div>
            <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-1.5">{t.neuralActive}</h2>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${engineActive ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'} ${!staticMode && engineActive ? 'animate-pulse' : ''}`} />
              <span className={`text-[10px] font-mono uppercase tracking-widest ${engineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {engineActive ? 'Engine Linked' : 'Engine Offline'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onNavigate?.('profile')}
            aria-label={t.supportLab}
            className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-xl active:scale-95 flex items-center gap-2"
          >
            <Heart size={20} className={!staticMode ? 'animate-pulse' : ''} />
            <span className="hidden sm:inline text-[9px] font-black uppercase tracking-widest">{t.supportLab}</span>
          </button>
          <button 
            onClick={handleSync}
            aria-label={lang === 'zh' ? '同步健康数据' : 'Sync Health Data'}
            className={`p-4 rounded-2xl transition-all shadow-2xl active:scale-95 ${isProcessing ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}`}
          >
            <RefreshCw size={20} className={isProcessing ? 'animate-spin' : (syncStatus === 'error' ? 'text-rose-400 animate-bounce' : '')} />
          </button>
        </div>
      </div>

      <div className="relative py-4">
        <GlassCard intensity={1.5} className="p-10 border-indigo-500/40 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
          
          <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <BrainCircuit size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t.aiSynthesis}</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_15px_40px_rgba(79,70,229,0.4)]"
                  >
                    {data.score}
                  </motion.span>
                  <span className="text-3xl font-bold text-slate-700 font-mono tracking-tighter">/100</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.stable}</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-2">
                  <Activity size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Opt: 94%</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" />
                  Chief Insights
                </h3>
                <div className="min-h-[80px] p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl relative">
                  <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500 rounded-full" />
                  <p className="text-sm font-medium italic text-slate-300 leading-relaxed">
                    {engineActive ? (data.aiInsights?.[0] || 'Analyzing biometric streams...') : (lang === 'zh' ? 'AI 引擎未激活。请在登录页激活以接收洞察。' : 'AI Engine offline. Activate gateway in Settings/Login to receive insights.')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">Neural Efficiency</span>
                <span className="text-indigo-400 font-mono">{data.score}%</span>
             </div>
             <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                />
             </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-8 group hover:border-rose-500/40 transition-all duration-500" intensity={1.2}>
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-rose-500/10 rounded-3xl text-rose-400 group-hover:scale-110 transition-transform">
                <HeartPulse size={32} />
              </div>
              {!staticMode && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-rose-500/20 rounded-3xl"
                />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resting HR</p>
              <p className="text-4xl font-black font-mono tracking-tighter text-white italic">
                {data.heartRate.resting}
                <span className="text-xs text-slate-400 ml-1 font-sans">BPM</span>
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 group hover:border-cyan-500/40 transition-all duration-500" intensity={1.2}>
          <div className="flex flex-col items-center gap-6">
            <div className="p-5 bg-cyan-500/10 rounded-3xl text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu size={32} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Efficiency</p>
              <p className="text-4xl font-black font-mono tracking-tighter text-white italic">
                {data.efficiency}
                <span className="text-xs text-slate-400 ml-1 font-sans">%</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
};
