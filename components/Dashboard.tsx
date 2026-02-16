import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion } from 'framer-motion';
// Added ShieldCheck to the lucide-react imports
import { 
  RefreshCw, Brain, Heart, Zap, Sparkles, Microscope, Binary, 
  ArrowRight, Activity, Command, Target, Waves, Thermometer, Droplets,
  ShieldCheck
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

const MetricNode = ({ icon: Icon, label, value, unit, color }: any) => (
  <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4 group hover:border-white/10 transition-all">
    <div className={`p-2 rounded-xl ${color} w-fit`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-1 mt-1">
        <span className="text-xl font-black text-white italic">{value}</span>
        <span className="text-[10px] font-bold text-slate-700">{unit}</span>
      </div>
    </div>
  </div>
);

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
        setInsights(["Neural link active. Initializing..."]);
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
    <div className="space-y-16 pb-40 animate-in fade-in slide-in-from-bottom-4 duration-1000 text-left">
      {/* Header Status Matrix */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-2">
         <div className="flex items-center gap-6">
            <div className="relative">
              <div className="absolute -inset-4 bg-indigo-500/10 blur-xl rounded-full" />
              <div className="p-4 bg-slate-900 border border-indigo-500/20 rounded-[1.5rem] relative z-10 text-indigo-400">
                <Activity size={24} />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Recovery Console</h2>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-emerald-400 tracking-widest italic">{t.status}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">ENCRYPTED_LINK_v2.8</span>
              </div>
            </div>
         </div>
         <div className="flex gap-4">
            <GlassCard className="px-6 py-3 rounded-2xl flex items-center gap-4 border-white/5 bg-slate-900/40">
               <div className="flex flex-col">
                  <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Protocol</span>
                  <span className="text-[10px] font-bold text-slate-300 italic">SECURE_EDGE</span>
               </div>
               <ShieldCheck size={16} className="text-indigo-500" />
            </GlassCard>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Core Biometric Mainframe */}
        <div className="lg:col-span-8">
          <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-white/5 bg-[#01040a]/80 h-full relative overflow-hidden" intensity={1.8}>
            <div className="absolute top-0 right-0 p-16 opacity-[0.04] text-indigo-400 pointer-events-none transform rotate-12">
               <Binary size={400} strokeWidth={0.5} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-10">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.6em] italic border-l-2 border-indigo-500 pl-4">Biological Rating</p>
                  <div className="flex items-baseline group cursor-default">
                     <h1 className="text-[12rem] md:text-[15rem] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all group-hover:text-indigo-400">
                       {Number(data.score)}
                     </h1>
                     <span className="text-3xl font-black text-slate-800 ml-[-5%] transition-colors group-hover:text-indigo-900">%</span>
                  </div>
                  <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-inner">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <MetricNode icon={Heart} label="Resting HR" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" />
                   <MetricNode icon={Brain} label="Deep Ratio" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-12">
                <div className="space-y-8">
                   <div className="flex items-center gap-3">
                      <div className="w-8 h-px bg-slate-800" />
                      <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.4em] italic">{t.stagingTitle}</p>
                   </div>
                   <p className="text-2xl md:text-3xl font-bold text-slate-300 leading-tight italic max-w-sm">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {insights.slice(0, 3).map((insight, idx) => (
                      <div key={idx} className="px-4 py-2 bg-white/[0.02] border border-white/5 rounded-xl text-[10px] text-slate-500 italic font-medium">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-[0_30px_60px_-15px_rgba(79,70,229,0.4)] italic active:scale-95 group"
                  >
                    NEURAL DIALOGUE <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Dynamic Telemetry Injector */}
        <div className="lg:col-span-4 space-y-8">
          <GlassCard className="p-12 rounded-[4rem] border-transparent bg-indigo-600 text-white h-[420px] flex flex-col justify-between shadow-[0_50px_100px_-20px_rgba(79,70,229,0.3)] relative overflow-hidden group" intensity={1.4}>
            <div className="absolute top-0 right-0 p-12 opacity-10 transform translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000">
               <Waves size={300} strokeWidth={1} />
            </div>
            
            <div className="space-y-10 relative z-10 text-left">
              <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-xl group-hover:rotate-12 transition-all duration-700">
                <RefreshCw size={36} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-4">
                <h3 className="text-5xl font-black italic uppercase tracking-tighter leading-[0.9]">{t.syncTitle}</h3>
                <p className="text-indigo-100 text-lg font-medium italic leading-relaxed opacity-85">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-7 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl transition-all hover:bg-black hover:scale-[1.02] active:scale-98 disabled:opacity-50 italic relative z-10"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <GlassCard className="p-10 rounded-[3.5rem] border-white/5 bg-slate-900/40 flex-1 space-y-8">
             <div className="flex items-center gap-4 text-slate-500">
               <Thermometer size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest italic">Lab Environment</span>
             </div>
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-700 uppercase">Core Temp</p>
                   <p className="text-2xl font-black text-white italic">18.4 <span className="text-xs text-slate-800">°C</span></p>
                </div>
                <div className="w-px h-10 bg-white/5" />
                <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-700 uppercase">Humidity</p>
                   <p className="text-2xl font-black text-white italic">42 <span className="text-xs text-slate-800">%</span></p>
                </div>
             </div>
          </GlassCard>
        </div>
      </div>

      {/* Protocol Roadmap - Redefined Visualization */}
      <div className="py-24 text-center space-y-24">
         <div className="space-y-6">
            <h2 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none">The Laboratory Protocol</h2>
            <div className="flex items-center justify-center gap-6 opacity-30">
               <div className="h-px w-20 bg-indigo-500" />
               <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.8em] italic">Telemetry to Transformation</p>
               <div className="h-px w-20 bg-indigo-500" />
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {t.steps.map((step: any, i: number) => (
              <m.div 
                key={i} 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group relative"
              >
                <div className="absolute inset-0 bg-indigo-500/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative space-y-10 p-14 bg-white/[0.01] border border-white/5 rounded-[4.5rem] text-left hover:border-indigo-500/30 transition-all shadow-2xl">
                  <div className="flex justify-between items-start">
                      <div className="p-6 bg-slate-900 rounded-[1.8rem] text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        {i === 0 ? <Activity size={24} /> : i === 1 ? <Brain size={24} /> : <Target size={24} />}
                      </div>
                      <span className="text-[4rem] font-black italic text-slate-900 leading-none group-hover:text-indigo-900/30 transition-colors">0{i+1}</span>
                  </div>
                  <div className="space-y-4">
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{step.title}</h3>
                      <p className="text-slate-500 text-base leading-relaxed italic font-medium opacity-90 group-hover:text-slate-300 transition-colors">{step.desc}</p>
                  </div>
                </div>
              </m.div>
            ))}
         </div>
      </div>
    </div>
  );
};