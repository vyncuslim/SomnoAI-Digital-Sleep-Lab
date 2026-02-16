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
  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-6 group hover:border-white/10 transition-all shadow-inner relative overflow-hidden">
    <div className={`p-3 rounded-2xl ${color} w-fit relative z-10 shadow-lg`}>
      <Icon size={20} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{label}</p>
        {trend && <span className="text-[8px] font-black text-emerald-500 italic uppercase">+{trend}%</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-black text-white italic tabular-nums">{value}</span>
        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{unit}</span>
      </div>
    </div>
    <div className="absolute -right-4 -bottom-4 opacity-[0.02] text-white group-hover:scale-110 transition-transform">
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
    <div className="space-y-16 pb-48 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-left relative">
      <NeuralFluxBackground />
      
      {/* Header Sector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 px-4 relative z-10">
         <div className="flex items-center gap-8">
            <div className="relative group">
              <div className="absolute -inset-6 bg-indigo-500/10 blur-2xl rounded-full group-hover:bg-indigo-500/20 transition-all" />
              <div className="p-6 bg-slate-900 border border-indigo-500/20 rounded-[2rem] relative z-10 text-indigo-400 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                <Activity size={32} />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Laboratory <span className="text-indigo-400">Terminal</span></h2>
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex items-center gap-2.5 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest italic">{t.status}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-700 uppercase tracking-[0.5em] font-bold">NODE_REF: #SMN_LAB_0x8F</span>
              </div>
            </div>
         </div>
         <div className="flex items-center gap-6">
            <GlassCard className="px-8 py-4 rounded-[1.5rem] flex items-center gap-5 border-white/5 bg-slate-900/60 shadow-2xl">
               <div className="flex flex-col text-right">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Arch</span>
                  <span className="text-[12px] font-black text-indigo-400 italic uppercase">SECURE_EDGE_v3</span>
               </div>
               <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20"><ShieldCheck size={20} /></div>
            </GlassCard>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Primary Biometric Core */}
        <div className="lg:col-span-8">
          <GlassCard className="p-14 md:p-20 rounded-[5rem] border-white/5 bg-[#01040a]/80 h-full relative overflow-hidden" intensity={2.5}>
            <div className="absolute top-0 right-0 p-20 opacity-[0.04] text-indigo-400 pointer-events-none transform rotate-12 group-hover:rotate-6 transition-transform duration-1000">
               <Binary size={500} strokeWidth={0.5} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20 relative z-10">
              <div className="space-y-14">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                    <p className="text-[11px] font-black uppercase text-slate-600 tracking-[0.5em] italic">Recovery Rating</p>
                  </div>
                  <div className="flex items-baseline group cursor-default">
                     <h1 className="text-[14rem] md:text-[18rem] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)] transition-all group-hover:text-indigo-500">
                       {Number(data.score)}
                     </h1>
                     <span className="text-4xl font-black text-slate-800 ml-[-5%] transition-colors group-hover:text-indigo-900 group-hover:translate-x-2">%</span>
                  </div>
                  <div className="inline-flex items-center gap-4 px-8 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-inner group cursor-pointer hover:bg-emerald-500/10 transition-all">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[11px] font-black uppercase text-emerald-400 tracking-widest italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <MetricNode icon={Heart} label="Pulse Base" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" trend="2" />
                   <MetricNode icon={Brain} label="Deep Logic" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-16">
                <div className="space-y-10">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-px bg-slate-800" />
                      <p className="text-[11px] font-black uppercase text-slate-700 tracking-[0.5em] italic">{t.stagingTitle}</p>
                   </div>
                   <p className="text-3xl md:text-4xl font-bold text-slate-300 leading-[1.1] italic max-w-sm">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-8">
                  <div className="flex flex-wrap gap-3">
                    {insights.slice(0, 3).map((insight, idx) => (
                      <div key={idx} className="px-5 py-2.5 bg-white/[0.03] border border-white/10 rounded-2xl text-[11px] text-slate-500 italic font-black uppercase tracking-widest hover:text-indigo-400 transition-colors">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-xs font-black uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-5 shadow-[0_40px_80px_-15px_rgba(79,70,229,0.5)] italic active:scale-95 group"
                  >
                    NEURAL DIALOGUE <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action & Environment Matrix */}
        <div className="lg:col-span-4 space-y-10">
          <GlassCard className="p-14 rounded-[5rem] border-transparent bg-indigo-600 text-white h-[480px] flex flex-col justify-between shadow-[0_60px_120px_-20px_rgba(79,70,229,0.4)] relative overflow-hidden group" intensity={1.5}>
            <div className="absolute top-0 right-0 p-16 opacity-10 transform translate-x-1/4 -translate-y-1/4 group-hover:scale-125 transition-transform duration-1000 pointer-events-none">
               <Waves size={400} strokeWidth={1} />
            </div>
            
            <div className="space-y-12 relative z-10 text-left">
              <div className="w-24 h-24 bg-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/20 backdrop-blur-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-700">
                <RefreshCw size={44} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-5">
                <h3 className="text-6xl font-black italic uppercase tracking-tighter leading-[0.85]">{t.syncTitle}</h3>
                <p className="text-indigo-100 text-xl font-medium italic leading-relaxed opacity-90">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-8 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[12px] uppercase tracking-[0.6em] shadow-2xl transition-all hover:bg-black hover:scale-[1.02] active:scale-98 disabled:opacity-50 italic relative z-10"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/60 flex-1 space-y-10 relative overflow-hidden group">
             <div className="flex items-center gap-5 text-slate-500 relative z-10">
               <Thermometer size={20} />
               <span className="text-[11px] font-black uppercase tracking-widest italic">Lab Node Connected</span>
             </div>
             <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                   <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Ambient Temp</p>
                   <p className="text-3xl font-black text-white italic">18.4 <span className="text-sm text-slate-700 font-mono">°C</span></p>
                </div>
                <div className="w-px h-14 bg-white/5" />
                <div className="space-y-2">
                   <p className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Humidity</p>
                   <p className="text-3xl font-black text-white italic">42 <span className="text-sm text-slate-700 font-mono">%</span></p>
                </div>
             </div>
             <div className="absolute right-0 bottom-0 p-10 opacity-[0.02] text-white group-hover:translate-x-4 transition-transform">
               <Droplets size={120} />
             </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};