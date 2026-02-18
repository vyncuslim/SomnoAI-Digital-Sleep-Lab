import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Activity, ArrowRight, Target, ShieldCheck, ChevronRight, MessageCircle, ExternalLink, FlaskConical, Smartphone, Image as ImageIcon,
  Radio, TrendingUp, Cpu
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
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.02]">
    <m.div 
      animate={{ 
        backgroundPosition: ["0% 0%", "100% 100%"],
      }}
      transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
      className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-[length:200px_200px]"
    />
  </div>
);

const MetricNode = ({ icon: Icon, label, value, unit, color, trend }: any) => (
  <div className="p-6 bg-white/[0.01] border border-white/5 rounded-[2.5rem] space-y-4 group hover:border-indigo-500/20 transition-all relative overflow-hidden flex-1 shadow-inner">
    <div className={`p-3 rounded-2xl ${color} w-fit relative z-10 shadow-lg`}>
      <Icon size={20} strokeWidth={2.5} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.1em]">{label}</p>
        {trend && <span className="text-[9px] font-black text-emerald-500 italic">+{trend}%</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl md:text-5xl font-black text-white italic tabular-nums tracking-tighter leading-none">{value}</span>
        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{unit}</span>
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
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700 text-left relative">
      <NeuralFluxBackground />
      
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4 relative z-10">
         <div className="flex items-center gap-6">
            <div className="p-4 bg-slate-950 border-2 border-indigo-500/20 rounded-[2rem] text-indigo-400 shadow-[0_0_50px_rgba(99,102,241,0.1)]">
              <Cpu size={32} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                 <h2 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Laboratory <span className="text-indigo-400">Terminal</span></h2>
                 <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full flex items-center gap-2">
                    <Radio size={10} className="text-emerald-500 animate-pulse" />
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active Link</span>
                 </div>
              </div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] italic">{t.status} // BUFFER_STABLE</p>
            </div>
         </div>

         <div className="flex gap-4">
            <div className="hidden lg:flex items-center gap-3 px-6 py-3 bg-indigo-600/5 border border-indigo-500/10 rounded-full">
               <ShieldCheck size={14} className="text-indigo-400" />
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Encrypted Protocol Ingress</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
        {/* Primary Biometric Core - Expanded to 9 cols */}
        <div className="lg:col-span-9">
          <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-[#01040a]/95 h-full relative overflow-hidden" intensity={1.1}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-16 relative z-10">
              <div className="space-y-12">
                <div className="space-y-4">
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em] italic px-2">Diagnostic Baseline</p>
                  <div className="flex items-baseline gap-3 group cursor-default">
                     <h1 className="text-8xl md:text-[10rem] font-black italic tracking-tighter text-white leading-none">
                       {Number(data.score)}
                     </h1>
                     <span className="text-2xl font-black text-slate-800">%</span>
                  </div>
                  <div className="inline-flex items-center gap-4 px-6 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-full">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[11px] font-black uppercase text-emerald-400 tracking-[0.2em] italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6">
                   <MetricNode icon={Heart} label="Pulse Velocity" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" />
                   <MetricNode icon={Brain} label="Restoration Depth" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                   <MetricNode icon={Activity} label="System Efficiency" value={data.efficiency} unit="%" color="bg-emerald-500/10 text-emerald-500" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                      <TrendingUp size={16} className="text-indigo-400" />
                      <p className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">{t.stagingTitle}</p>
                   </div>
                   <p className="text-xl md:text-2xl font-bold text-slate-300 leading-relaxed italic tracking-tight border-l-4 border-indigo-500/30 pl-8">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-8 bg-white/[0.02] p-8 rounded-[3rem] border border-white/5">
                  <div className="flex flex-wrap gap-3">
                    {insights.map((insight, idx) => (
                      <div key={insight + idx} className="px-4 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[9px] text-indigo-400 italic font-black uppercase tracking-widest">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('dreams')}
                    className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-2xl italic group overflow-hidden relative"
                  >
                    <ImageIcon size={20} className="group-hover:scale-110 transition-transform" />
                    DREAM SYNTHESIS
                    <m.div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Action Matrix - 3 cols */}
        <div className="lg:col-span-3 space-y-6">
          <GlassCard className="p-8 rounded-[4rem] border-transparent bg-indigo-600 text-white flex flex-col justify-between shadow-[0_40px_100px_-20px_rgba(79,70,229,0.4)] relative overflow-hidden h-1/2" intensity={1.5}>
            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 backdrop-blur-3xl">
                <Smartphone size={28} className={isProcessing ? 'animate-pulse' : ''} />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none">{t.syncTitle}</h3>
                <p className="text-indigo-100 text-[11px] font-bold italic opacity-80">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-4 mt-8 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all hover:bg-black active:scale-95 disabled:opacity-50 italic flex items-center justify-center gap-3"
            >
              {isProcessing ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <div className="grid grid-cols-1 gap-6 h-[calc(50%-1.5rem)]">
             <GlassCard 
               onClick={() => onNavigate?.('blog')}
               className="p-8 rounded-[3rem] border-white/5 bg-[#5865F2]/5 hover:bg-[#5865F2]/10 cursor-pointer transition-all flex flex-col justify-between group overflow-hidden shadow-2xl"
             >
                <div className="p-3 bg-[#5865F2]/10 rounded-xl w-fit text-[#5865F2]"><MessageCircle size={20} /></div>
                <div className="space-y-1">
                   <h4 className="text-lg font-black text-white italic uppercase tracking-tight">Lab Narrative</h4>
                   <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Community Hub Access</p>
                </div>
                <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all pt-4 border-t border-white/5">
                   <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">NODES_STABLE</span>
                   <ExternalLink size={12} className="text-[#5865F2]" />
                </div>
             </GlassCard>

             <GlassCard onClick={() => onNavigate?.('experiment')} className="p-8 rounded-[3rem] border-white/5 bg-slate-900/60 hover:bg-indigo-900/20 cursor-pointer transition-all flex flex-col justify-between group overflow-hidden shadow-2xl">
                <div className="p-3 bg-indigo-500/10 rounded-xl w-fit text-indigo-400"><FlaskConical size={20} /></div>
                <div className="space-y-1">
                   <h4 className="text-lg font-black text-white italic uppercase tracking-tight">Restoration Trials</h4>
                   <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Active Protocol Synthesis</p>
                </div>
                <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-all pt-4 border-t border-white/5">
                   <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest">TRIALS_LOADED</span>
                   <ChevronRight size={14} className="text-indigo-500" />
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};