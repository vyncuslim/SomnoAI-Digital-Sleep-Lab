import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Sparkles, Microscope, Binary, 
  ArrowRight, Activity, Command, Target, Waves, Thermometer, Droplets,
  ShieldCheck, ChevronRight, Fingerprint, Radio, BarChart3
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

const NeuralFluxBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
    <m.div 
      animate={{ 
        backgroundPosition: ["0% 0%", "100% 100%"],
        opacity: [0.3, 0.6, 0.3]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:200px_200px]"
    />
    <svg className="w-full h-full">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-indigo-500" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  </div>
);

const MetricNode = ({ icon: Icon, label, value, unit, color, trend }: any) => (
  <div className="p-6 md:p-10 bg-white/[0.03] border border-white/10 rounded-[2.5rem] md:rounded-[3rem] space-y-6 md:space-y-8 group hover:border-indigo-500/30 transition-all shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden">
    <div className={`p-3 md:p-4 rounded-2xl ${color} w-fit relative z-10 shadow-lg`}>
      <Icon size={20} className="md:size-6" strokeWidth={2.5} />
    </div>
    <div className="relative z-10 space-y-1 md:space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-[10px] md:text-[12px] font-black text-slate-500 uppercase tracking-[0.2em]">{label}</p>
        {trend && <span className="text-[8px] md:text-[10px] font-black text-emerald-500 italic uppercase">+{trend}%</span>}
      </div>
      <div className="flex items-baseline gap-2 md:gap-3">
        <span className="text-3xl md:text-5xl font-black text-white italic tabular-nums tracking-tighter">{value}</span>
        <span className="text-[9px] md:text-xs font-black text-slate-700 uppercase tracking-widest">{unit}</span>
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-white group-hover:scale-125 group-hover:opacity-[0.05] transition-all duration-700">
      <Icon size={100} strokeWidth={1} />
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
        setInsights(["Neural link nominal. Protocol stable."]);
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
      setTimeout(() => setSyncStatus('idle'), 2500);
    } catch (err) { 
      setSyncStatus('error'); 
      setTimeout(() => setSyncStatus('idle'), 4000);
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <div className="space-y-12 md:space-y-20 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-left relative">
      <NeuralFluxBackground />
      
      {/* Header Sector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 px-2 relative z-10">
         <div className="flex items-center gap-6 md:gap-10">
            <div className="relative group">
              <div className="absolute -inset-4 md:-inset-8 bg-indigo-500/10 blur-[40px] md:blur-[60px] rounded-full group-hover:bg-indigo-500/20 transition-all" />
              <div className="p-6 md:p-8 bg-slate-900 border-2 border-indigo-500/20 rounded-[2rem] md:rounded-[2.5rem] relative z-10 text-indigo-400 shadow-[0_30px_70px_rgba(0,0,0,0.5)]">
                <Activity size={32} className="md:size-10" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">Lab <span className="text-indigo-400">Terminal</span></h2>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 md:gap-3 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_15px_#10b981]" />
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">{t.status}</span>
                </div>
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 relative z-10">
        {/* Primary Biometric Core */}
        <div className="lg:col-span-8">
          <GlassCard className="p-10 md:p-24 rounded-[4rem] md:rounded-[6rem] border-white/10 bg-[#01040a]/90 h-full relative overflow-hidden" intensity={3}>
            <div className="absolute top-0 right-0 p-12 md:p-24 opacity-[0.05] text-indigo-400 pointer-events-none transform rotate-12 transition-transform duration-1000">
               <Binary size={400} className="md:size-[600px]" strokeWidth={0.5} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24 relative z-10">
              <div className="space-y-12 md:space-y-16">
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 md:w-2 md:h-8 bg-indigo-600 rounded-full" />
                    <p className="text-[11px] md:text-[13px] font-black uppercase text-slate-600 tracking-[0.4em] md:tracking-[0.6em] italic">Recovery Rating</p>
                  </div>
                  <div className="flex items-baseline group cursor-default">
                     <h1 className="text-[min(45vw,14rem)] md:text-[22rem] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.8)] transition-all group-hover:text-indigo-500 group-hover:scale-[1.02]">
                       {Number(data.score)}
                     </h1>
                     <span className="text-3xl md:text-6xl font-black text-slate-800 ml-[-4%] transition-colors group-hover:text-indigo-900 group-hover:translate-x-4">%</span>
                  </div>
                  <div className="inline-flex items-center gap-4 px-8 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-inner group cursor-pointer hover:bg-emerald-500/10 transition-all">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[10px] md:text-[12px] font-black uppercase text-emerald-400 tracking-[0.2em] md:tracking-[0.3em] italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 md:gap-8">
                   <MetricNode icon={Heart} label="Pulse" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" trend="2" />
                   <MetricNode icon={Brain} label="Deep" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-12 md:space-y-20">
                <div className="space-y-8 md:space-y-12">
                   <div className="flex items-center gap-4 md:gap-6">
                      <div className="w-12 h-[2px] bg-slate-800" />
                      <p className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em] md:tracking-[0.6em] italic">{t.stagingTitle}</p>
                   </div>
                   <p className="text-2xl md:text-5xl font-black text-slate-200 leading-[1.1] italic max-w-md tracking-tighter">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-wrap gap-2 md:gap-4">
                    {insights.slice(0, 3).map((insight, idx) => (
                      <div key={idx} className="px-4 py-2 md:px-6 md:py-3 bg-white/[0.04] border border-white/10 rounded-xl md:rounded-2xl text-[10px] md:text-[12px] text-slate-400 italic font-black uppercase tracking-widest hover:text-indigo-400 hover:border-indigo-500/30 transition-all">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-8 md:py-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[11px] md:text-sm font-black uppercase tracking-[0.4em] md:tracking-[0.6em] transition-all flex items-center justify-center gap-4 md:gap-6 shadow-[0_50px_100px_-20px_rgba(79,70,229,0.5)] italic active:scale-95 group"
                  >
                    AI SYNTHESIS <ArrowRight size={24} className="group-hover:translate-x-3 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Matrix */}
        <div className="lg:col-span-4 space-y-8 md:space-y-12">
          <GlassCard className="p-10 md:p-16 rounded-[4rem] md:rounded-[6rem] border-transparent bg-indigo-600 text-white h-[480px] md:h-[580px] flex flex-col justify-between shadow-[0_80px_160px_-30px_rgba(79,70,229,0.5)] relative overflow-hidden group" intensity={2}>
            <div className="absolute top-0 right-0 p-12 md:p-20 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
               <Waves size={400} className="md:size-[500px]" strokeWidth={1} />
            </div>
            
            <div className="space-y-10 md:space-y-14 relative z-10 text-left">
              <div className="w-20 h-20 md:w-28 md:h-28 bg-white/10 rounded-[2.5rem] md:rounded-[3rem] flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-3xl group-hover:rotate-12 transition-all duration-700">
                <RefreshCw size={40} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-4 md:space-y-6">
                <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8]">{t.syncTitle}</h3>
                <p className="text-indigo-100 text-xl md:text-2xl font-bold italic leading-tight opacity-90">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-8 md:py-10 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[12px] md:text-[14px] uppercase tracking-[0.4em] md:tracking-[0.6em] shadow-2xl transition-all hover:bg-black hover:scale-[1.02] active:scale-98 disabled:opacity-50 italic relative z-10"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <GlassCard className="p-10 md:p-14 rounded-[3.5rem] md:rounded-[5rem] border-white/10 bg-slate-950/80 flex-1 space-y-10 relative overflow-hidden group">
             <div className="flex items-center gap-4 md:gap-6 text-slate-500 relative z-10">
               <Thermometer size={20} className="md:size-6" />
               <span className="text-[11px] md:text-[13px] font-black uppercase tracking-[0.4em] italic">Environmental Node</span>
             </div>
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2 md:space-y-4">
                   <p className="text-[10px] md:text-[12px] font-black text-slate-800 uppercase tracking-widest">Ambient</p>
                   <p className="text-4xl md:text-5xl font-black text-white italic">18.4 <span className="text-sm md:text-lg text-slate-700 font-mono tracking-normal">°C</span></p>
                </div>
                <div className="w-px h-16 md:h-20 bg-white/10" />
                <div className="space-y-2 md:space-y-4">
                   <p className="text-[10px] md:text-[12px] font-black text-slate-800 uppercase tracking-widest">Humidity</p>
                   <p className="text-4xl md:text-5xl font-black text-white italic">42 <span className="text-sm md:text-lg text-slate-700 font-mono tracking-normal">%</span></p>
                </div>
             </div>
             <div className="absolute right-0 bottom-0 p-10 opacity-[0.03] text-white group-hover:translate-x-6 transition-transform">
               <Droplets size={120} className="md:size-[180px]" />
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};