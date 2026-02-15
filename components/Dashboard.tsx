import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Sparkles, Microscope, Binary, 
  ArrowRight, Activity, Command, Target
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { getQuickInsight } from '../services/geminiService.ts';

const m = motion as any;

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncHealth?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, lang, onSyncHealth, onNavigate
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [insights, setInsights] = useState<string[]>([]);
  const t = translations[lang].dashboard;

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await getQuickInsight(data, lang);
        setInsights(Array.isArray(res) ? res : [res]);
      } catch (e) {
        setInsights(["Neural link active. Synchronizing telemetry..."]);
      }
    };
    fetchInsights();
  }, [data, lang]);

  const handleFullSync = async () => {
    if (syncStatus !== 'idle') return;
    setSyncStatus('fetching');
    try {
      if (onSyncHealth) await onSyncHealth((status) => setSyncStatus(status));
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err) { 
      setSyncStatus('error'); 
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <div className="space-y-12 pb-40 animate-in fade-in duration-1000 text-left">
      {/* Upper Status Bar */}
      <div className="flex items-center justify-between px-4">
         <div className="flex items-center gap-4">
            <div className="px-5 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2 shadow-inner">
               <Command size={12} className="text-indigo-400" />
               <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest italic">{t.status}</span>
            </div>
         </div>
         <div className="flex gap-4">
            <div className="w-11 h-11 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer shadow-xl"><Microscope size={20} /></div>
            <div className="w-11 h-11 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white transition-colors cursor-pointer shadow-xl"><Sparkles size={20} /></div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Main Score Area - Visual Replication */}
        <div className="lg:col-span-8">
          <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-[#01040a]/60 h-full relative overflow-hidden" intensity={1.5}>
            <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-indigo-400 pointer-events-none">
               <Binary size={320} strokeWidth={0.5} />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] italic px-2">{t.scoreLabel}</p>
                <div className="flex items-baseline">
                   <h1 className="text-[14rem] md:text-[17rem] font-black italic tracking-tighter text-white leading-none drop-shadow-2xl">
                     {Number(data.score)}
                   </h1>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit shadow-inner">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                   <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest italic">{t.scoreStatus}</span>
                </div>
              </div>

              <div className="flex-1 max-w-sm space-y-12">
                <div className="space-y-6">
                   <p className="text-[9px] font-black uppercase text-slate-700 tracking-[0.3em] italic border-b border-white/5 pb-4">{t.stagingTitle}</p>
                   <p className="text-xl md:text-2xl font-bold text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/40 pl-8">
                     "{t.stagingQuote}"
                   </p>
                </div>
                <button 
                  onClick={() => onNavigate?.('assistant')}
                  className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_25px_60px_rgba(79,70,229,0.3)] italic active:scale-95"
                >
                  NEURAL DIALOGUE <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Sync Card */}
        <div className="lg:col-span-4">
          <GlassCard className="p-12 rounded-[4rem] border-transparent bg-indigo-600 text-white h-full flex flex-col justify-between shadow-[0_50px_100px_rgba(79,70,229,0.2)] relative overflow-hidden group" intensity={1.2}>
            <div className="space-y-12 relative z-10 text-left">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl group-hover:rotate-12 transition-all duration-700">
                <RefreshCw size={44} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-4">
                <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">{t.syncTitle.split(' ')[0]}<br/>{t.syncTitle.split(' ')[1]}</h3>
                <p className="text-indigo-100 text-xl font-medium italic leading-relaxed opacity-85">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-8 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[12px] uppercase tracking-[0.5em] shadow-2xl transition-all hover:bg-black hover:scale-[1.02] active:scale-98 disabled:opacity-50 italic relative z-10 mt-12"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>
        </div>
      </div>

      {/* Protocol Section */}
      <div className="py-32 text-center space-y-24">
         <div className="space-y-6">
            <h2 className="text-5xl md:text-[5.5rem] font-black italic text-white uppercase tracking-tighter leading-none">{t.protocolTitle}</h2>
            <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.8em] italic">{t.protocolSub}</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {t.steps.map((step: any, i: number) => (
              <div key={i} className="space-y-10 p-14 bg-white/[0.02] border border-white/5 rounded-[5rem] text-left hover:border-indigo-500/30 transition-all group shadow-2xl">
                 <div className="flex justify-between items-start">
                    <div className="p-5 bg-indigo-500/10 rounded-[1.5rem] text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                       {i === 0 ? <Activity size={28} /> : i === 1 ? <Brain size={28} /> : <Target size={28} />}
                    </div>
                    <span className="text-[3.5rem] font-black italic text-slate-800 leading-none">{step.id}</span>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{step.title}</h3>
                    <p className="text-slate-500 text-base leading-relaxed italic font-medium opacity-90">{step.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};