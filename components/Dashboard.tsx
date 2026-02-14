import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Activity, Brain, Heart, Waves, ShieldCheck, Zap, HelpCircle, 
  Smartphone, Moon, Sparkles, Microscope, Binary, Cpu, Fingerprint,
  ArrowRight, Loader2, BarChart3, TrendingUp, ChevronRight, Target
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { healthConnect } from '../services/healthConnectService.ts';
import { getQuickInsight } from '../services/geminiService.ts';

const m = motion as any;

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncHealth?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  lang, 
  onSyncHealth, 
  onNavigate
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [insights, setInsights] = useState<string[]>([]);
  const isZh = lang === 'zh';
  const t = translations[lang].dashboard;

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getQuickInsight(data, lang);
        setInsights(Array.isArray(res) ? res.map(String) : []);
      } catch (e) {
        setInsights(["Handshake established. Synchronizing brain waves..."]);
      }
    };
    fetchInsights();
  }, [data, lang]);

  const handleFullSync = async () => {
    if (syncStatus !== 'idle') return;
    setSyncStatus('fetching');
    try {
      if (onSyncHealth) {
        await onSyncHealth((status) => setSyncStatus(status));
      }
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) { 
      setSyncStatus('error'); 
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <div className="space-y-12 pb-40">
      {/* Executive Mission Brief */}
      <m.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-12 md:p-16 bg-slate-900/40 border border-white/5 rounded-[4.5rem] group shadow-2xl"
      >
        <div className="absolute top-0 right-0 p-14 opacity-[0.03] text-indigo-400 pointer-events-none group-hover:rotate-12 transition-transform duration-1000">
           <Microscope size={280} strokeWidth={1} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           <div className="lg:col-span-8 space-y-10 text-left">
              <div className="flex flex-wrap items-center gap-6">
                 <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-inner">
                    <Sparkles size={24} />
                 </div>
                 <div className="flex flex-col">
                    <h2 className="text-[11px] font-black uppercase tracking-[0.6em] text-white italic opacity-40 leading-none mb-2">{t.executiveBrief}</h2>
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest italic">Neural Link Synchronized</span>
                    </div>
                 </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.95] drop-shadow-2xl">
                 Decoding <br/><span className="text-indigo-500">Biological Restoration</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed italic font-bold max-w-2xl opacity-95 border-l-2 border-indigo-600/30 pl-8">
                 {isZh 
                   ? "它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。" 
                   : "Integrating physiological monitoring, deep AI insights, and tailored health protocols into a unified digital sleep laboratory environment."}
              </p>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-10 bg-black/60 border border-white/10 rounded-[3rem] flex flex-col justify-between min-h-[220px] shadow-2xl relative overflow-hidden group/sub">
                 <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em] italic">System Core Status</p>
                 <div className="space-y-2">
                    <p className="text-4xl font-black italic text-emerald-400 tracking-tighter uppercase">{t.statusActive}</p>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">{t.protocolLabel}</p>
                 </div>
                 <Zap size={24} className="text-emerald-500/50" />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1 p-8 bg-indigo-600/10 border border-indigo-500/20 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
                    <ShieldCheck size={20} className="text-indigo-400" />
                    <p className="text-xl font-black italic text-white leading-none">EDGE</p>
                 </div>
                 <div className="flex-1 p-8 bg-white/5 border border-white/10 rounded-[2.5rem] flex flex-col justify-between shadow-xl">
                    <Fingerprint size={20} className="text-slate-400" />
                    <p className="text-xl font-black italic text-white leading-none">E2EE</p>
                 </div>
              </div>
           </div>
        </div>
      </m.div>

      {/* Recovery Synthesis Index */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 text-left">
        <div className="lg:col-span-8">
          <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-white/5 bg-slate-900/40 relative overflow-hidden h-full" intensity={1.1}>
            <div className="flex flex-col md:flex-row justify-between gap-16 relative z-10">
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <Binary size={16} className="text-indigo-500" />
                     <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.6em] italic">Recovery Synthesis Index</span>
                  </div>
                  <div className="flex items-baseline gap-8">
                    <h1 className="text-9xl md:text-[12rem] font-black italic tracking-tighter text-white leading-[0.8] drop-shadow-2xl">{data.score}</h1>
                    <div className="space-y-3">
                       <span className="text-5xl font-black text-slate-800 italic block leading-none">/100</span>
                       <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest italic">OPTIMAL</span>
                       </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 max-w-sm flex flex-col justify-center">
                <div className="bg-black/60 rounded-[3.5rem] p-12 border border-white/10 space-y-10 shadow-2xl relative group/insight">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">AI Inference</span>
                    <Sparkles size={16} className="text-indigo-500" />
                  </div>
                  <p className="text-lg md:text-xl font-bold text-slate-200 leading-relaxed italic border-l-2 border-indigo-600/30 pl-6">
                    "{insights[0] || t.manifesto}"
                  </p>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_15px_40px_rgba(79,70,229,0.3)] active:scale-95 italic"
                  >
                    NEURAL DIALOGUE <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-40 -right-40 opacity-[0.02] pointer-events-none text-white transform -rotate-12">
              <Brain size={800} strokeWidth={0.5} />
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4">
          <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-white/5 bg-indigo-600 text-white h-full flex flex-col justify-between shadow-2xl relative overflow-hidden group" intensity={1.5}>
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 bg-white/20 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/30 backdrop-blur-md">
                  <RefreshCw size={36} className={isProcessing ? 'animate-spin' : ''} />
                </div>
                <HelpCircle size={28} className="text-white/40" />
              </div>
              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-tight">{t.signalInjection}</h3>
                <p className="text-indigo-100/70 text-base font-medium italic leading-relaxed">{t.syncData}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-8 bg-white text-indigo-950 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 italic relative z-10"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
