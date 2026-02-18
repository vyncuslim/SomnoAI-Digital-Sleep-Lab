
import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Activity, ArrowRight, Target, ShieldCheck, ChevronRight, MessageCircle, ExternalLink, FlaskConical
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
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.01]">
    <m.div 
      animate={{ 
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:150px_150px]"
    />
  </div>
);

const MetricNode = ({ icon: Icon, label, value, unit, color, trend }: any) => (
  <div className="p-3 bg-white/[0.01] border border-white/5 rounded-2xl space-y-1.5 group hover:border-indigo-500/20 transition-all relative overflow-hidden">
    <div className={`p-1.5 rounded-lg ${color} w-fit relative z-10 shadow-sm`}>
      <Icon size={12} strokeWidth={2.5} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center">
        <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.05em]">{label}</p>
        {trend && <span className="text-[7px] font-black text-emerald-500 italic">+{trend}%</span>}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-base md:text-lg font-black text-white italic tabular-nums tracking-tight">{value}</span>
        <span className="text-[6px] font-black text-slate-800 uppercase tracking-widest">{unit}</span>
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
        setInsights(["Neural link nominal."]);
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
    <div className="space-y-4 md:space-y-5 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500 text-left relative">
      <NeuralFluxBackground />
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-1 relative z-10">
         <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-950 border border-indigo-500/10 rounded-xl text-indigo-400 shadow-md">
              <Activity size={14} />
            </div>
            <div className="space-y-0.5">
              <h2 className="text-sm md:text-base font-black italic text-white uppercase tracking-tighter leading-none">Lab <span className="text-indigo-400">Terminal</span></h2>
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 bg-emerald-500/5 rounded-full border border-emerald-500/10 w-fit">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[6px] font-black uppercase text-emerald-400 tracking-widest italic">{t.status}</span>
              </div>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10">
        {/* Primary Biometric Core */}
        <div className="lg:col-span-8">
          <GlassCard className="p-5 md:p-7 rounded-[2rem] border-white/5 bg-[#01040a]/98 h-full relative overflow-hidden" intensity={1.1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 relative z-10">
              <div className="space-y-5">
                <div className="space-y-1">
                  <p className="text-[7px] font-black uppercase text-slate-700 tracking-[0.2em] italic px-1">Recovery Rating</p>
                  <div className="flex items-baseline group cursor-default">
                     <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white leading-none">
                       {Number(data.score)}
                     </h1>
                     <span className="text-base font-black text-slate-800 ml-[-0.5%]">%</span>
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full mt-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[6px] font-black uppercase text-emerald-400 tracking-[0.1em] italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <MetricNode icon={Heart} label="Pulse" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" />
                   <MetricNode icon={Brain} label="Deep" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-2.5">
                   <p className="text-[7px] font-black uppercase text-slate-700 tracking-[0.2em] italic border-b border-white/5 pb-1">{t.stagingTitle}</p>
                   <p className="text-xs md:text-sm font-black text-slate-300 leading-relaxed italic tracking-tight border-l-2 border-indigo-500/20 pl-4">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {insights.slice(0, 2).map((insight, idx) => (
                      <div key={insight + idx} className="px-2 py-1 bg-white/[0.03] border border-white/5 rounded-lg text-[6px] text-slate-500 italic font-black uppercase tracking-widest">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('assistant')}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[7px] font-black uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 shadow-md italic group"
                  >
                    AI SYNTHESIS <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Matrix */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard className="p-5 rounded-[2rem] border-transparent bg-indigo-600 text-white flex flex-col justify-between shadow-lg relative overflow-hidden" intensity={1.5}>
            <div className="space-y-3 relative z-10">
              <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shadow-md border border-white/20 backdrop-blur-xl">
                <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base md:text-lg font-black italic uppercase tracking-tighter leading-none">{t.syncTitle}</h3>
                <p className="text-indigo-100 text-[9px] font-bold italic opacity-80">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-2.5 mt-5 bg-slate-950 border border-white/5 text-white rounded-full font-black text-[7px] uppercase tracking-[0.2em] shadow-md transition-all hover:bg-black active:scale-98 disabled:opacity-50 italic"
            >
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <div className="grid grid-cols-2 gap-3">
             <GlassCard 
               // Correct the undefined 'navigate' call to 'onNavigate' provided in props
               onClick={() => onNavigate?.('blog')}
               className="p-3.5 rounded-2xl border-indigo-500/10 bg-[#5865F2]/5 hover:bg-[#5865F2]/10 cursor-pointer transition-all flex flex-col justify-between h-[85px] group overflow-hidden"
             >
                <MessageCircle size={12} className="text-[#5865F2]" />
                <h4 className="text-[9px] font-black text-white italic uppercase tracking-tight">Blog Hub</h4>
                <div className="flex items-center justify-between">
                   <span className="text-[5px] font-black text-slate-700 uppercase tracking-widest italic">NODES</span>
                   <ExternalLink size={9} className="text-[#5865F2]" />
                </div>
             </GlassCard>

             <GlassCard onClick={() => onNavigate?.('experiment')} className="p-3.5 rounded-2xl border-white/5 bg-slate-900/60 hover:bg-indigo-900/20 cursor-pointer transition-all flex flex-col justify-between h-[85px] group overflow-hidden">
                <FlaskConical size={12} className="text-indigo-400" />
                <h4 className="text-[9px] font-black text-white italic uppercase tracking-tight">Protocol</h4>
                <div className="flex items-center justify-between">
                   <span className="text-[5px] font-black text-slate-700 uppercase tracking-widest italic">TRIALS</span>
                   <ChevronRight size={9} className="text-indigo-500" />
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};
