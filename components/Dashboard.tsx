import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Sparkles, Microscope, Binary, 
  ArrowRight, Activity, Waves
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
        const processed = Array.isArray(res) 
          ? res.map(item => (typeof item === 'string' ? item : JSON.stringify(item)))
          : [typeof res === 'string' ? res : "Laboratory linked."];
        setInsights(processed);
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
      <m.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-10 md:p-14 bg-[#050a1f]/40 border border-white/5 rounded-[3.5rem] group shadow-2xl"
      >
        <div className="absolute -top-24 -right-24 p-14 opacity-[0.03] text-indigo-400 pointer-events-none group-hover:rotate-12 transition-transform duration-[2s]">
           <Microscope size={420} strokeWidth={0.5} />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
           <div className="lg:col-span-8 space-y-8">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                    <Sparkles size={20} className="animate-pulse" />
                 </div>
                 <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">{String(t.executiveBrief)}</h2>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
                 Decoding <br/><span className="text-indigo-400">Biological Restoration</span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-400 leading-relaxed italic font-medium max-w-2xl border-l-2 border-indigo-500/30 pl-6">
                 "{String(t.manifesto)}"
              </p>
           </div>

           <div className="lg:col-span-4 flex flex-col gap-6">
              <div className="p-10 bg-black/60 border border-white/5 rounded-[2.5rem] flex flex-col justify-between min-h-[220px] shadow-inner relative overflow-hidden">
                 <p className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] italic">System Core Status</p>
                 <div className="space-y-1">
                    <p className="text-5xl font-black italic text-emerald-500 tracking-tighter uppercase">{String(t.statusActive)}</p>
                    <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest italic">{String(t.protocolLabel)}</p>
                 </div>
                 <div className="absolute -bottom-4 -right-4 opacity-[0.05]">
                   <Zap size={100} className="text-emerald-500" />
                 </div>
              </div>
           </div>
        </div>
      </m.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/5 bg-[#01040a]/60 h-full flex flex-col" intensity={0.8}>
            <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10 flex-1">
              <div className="space-y-10">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                     <Binary size={16} className="text-indigo-400" />
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">Recovery Index</span>
                  </div>
                  <div className="flex items-baseline gap-4">
                    <h1 className="text-[10rem] md:text-[12rem] font-black italic tracking-tighter text-white leading-[0.8]">{Number(data.score)}</h1>
                    <span className="text-4xl font-black text-slate-800 italic block leading-none">/100</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 pt-8">
                   {[
                     { label: 'Deep Sleep', val: `${data.deepRatio}%`, icon: Brain },
                     { label: 'Efficiency', val: `${data.efficiency}%`, icon: Activity },
                     { label: 'Resting HR', val: `${data.heartRate.resting}bpm`, icon: Heart },
                     { label: 'Duration', val: `${Math.floor(data.totalDuration/60)}h ${data.totalDuration%60}m`, icon: Waves }
                   ].map((metric, i) => (
                     <div key={i} className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                          <metric.icon size={10} className="text-indigo-400" /> {String(metric.label)}
                        </p>
                        <p className="text-2xl font-black italic text-white tracking-tight uppercase">{String(metric.val)}</p>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex-1 max-w-sm flex flex-col justify-center">
                <div className="bg-black/40 rounded-[3rem] p-10 border border-white/5 space-y-8 relative group/insight overflow-hidden shadow-inner">
                  <div className="flex justify-between items-center relative z-10">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">AI Inference</span>
                    <Sparkles size={14} className="text-indigo-400 animate-pulse" />
                  </div>
                  <p className="text-xl font-bold text-slate-300 leading-relaxed italic border-l-2 border-indigo-500/40 pl-6 relative z-10">
                    "{String(insights[0] || "Synchronizing...")}"
                  </p>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-xl italic relative z-10 active:scale-95"
                  >
                    NEURAL DIALOGUE <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-4">
          <GlassCard className="p-12 rounded-[4rem] border-transparent bg-indigo-600 text-white h-full flex flex-col justify-between shadow-2xl relative overflow-hidden group" intensity={1.2}>
            <div className="space-y-10 relative z-10">
              <div className="flex justify-between items-start">
                <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-xl group-hover:scale-105 transition-transform duration-500">
                  <RefreshCw size={32} className={isProcessing ? 'animate-spin' : ''} />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.85]">{String(t.signalInjection)}</h3>
                <p className="text-indigo-100 text-lg font-medium italic leading-relaxed opacity-80">{String(t.syncData)}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-8 bg-white text-indigo-950 rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-xl transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 italic relative z-10"
            >
              {isProcessing ? String(t.syncingButton) : String(t.syncButton)}
            </button>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
          </GlassCard>
        </div>
      </div>
    </div>
  );
};