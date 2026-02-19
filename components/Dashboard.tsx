import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Brain, Heart, Zap, Activity, ArrowRight, Target, ShieldCheck, ChevronRight, MessageCircle, ExternalLink, FlaskConical, Smartphone, Image as ImageIcon,
  Radio, TrendingUp, Cpu, Binary, Gauge, Microchip
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

const NeuralAura = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
    <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1.5px,transparent_1.5px)] [background-size:48px_48px]" />
    <m.div 
      animate={{ 
        scale: [1, 1.1, 1],
        rotate: [0, 5, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[120%] h-[120%] bg-[conic-gradient(from_0deg,transparent,rgba(99,102,241,0.2),transparent)]"
    />
  </div>
);

const MetricCard = ({ icon: Icon, label, value, unit, color, trend }: any) => (
  <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[3rem] space-y-6 group hover:border-indigo-500/30 transition-all relative overflow-hidden flex-1 shadow-inner">
    <div className={`p-4 rounded-2xl ${color} w-fit relative z-10 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div className="relative z-10">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] italic">{label}</p>
        {trend && <span className="text-[10px] font-black text-emerald-500 italic">+{trend}%</span>}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl md:text-6xl font-black text-white italic tabular-nums tracking-tighter leading-none">{value}</span>
        <span className="text-[11px] font-black text-slate-700 uppercase tracking-[0.3em]">{unit}</span>
      </div>
    </div>
    <div className="absolute -right-6 -bottom-6 opacity-[0.03] text-white group-hover:opacity-[0.06] transition-opacity">
       <Icon size={140} />
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
        setInsights(["Neural baseline established."]);
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
    <div className="space-y-12 pb-32 animate-in fade-in slide-in-from-bottom-8 duration-1000 text-left relative">
      <NeuralAura />
      
      {/* 顶部状态栏 */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 px-6 relative z-10">
         <div className="flex items-center gap-8">
            <div className="p-5 bg-slate-950 border-2 border-indigo-500/20 rounded-[2.5rem] text-indigo-400 shadow-[0_0_80px_rgba(99,102,241,0.15)]">
              <Gauge size={42} />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                 <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">Laboratory <span className="text-indigo-400">Terminal</span></h2>
                 <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] italic">Active Sync</span>
                 </div>
              </div>
              <div className="flex items-center gap-4 opacity-60">
                 <Binary size={12} className="text-slate-500" />
                 <p className="text-[11px] font-mono text-slate-500 uppercase tracking-[0.4em] italic">{t.status} // ID: SOMNO_LAB_001</p>
              </div>
            </div>
         </div>

         <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4 px-8 py-4 bg-indigo-600/5 border border-white/5 rounded-full backdrop-blur-xl group cursor-help">
               <ShieldCheck size={16} className="text-indigo-400 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Biometric Integrity Secured</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* 主要生物遥测数据卡片 (占据 9 列) */}
        <div className="lg:col-span-9">
          <GlassCard className="p-16 md:p-24 rounded-[5rem] bg-[#01040a]/90 border-white/5 relative overflow-hidden h-full" intensity={1.1}>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-24 relative z-10">
              <div className="space-y-16">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 px-2">
                    <Microchip size={14} className="text-indigo-500" />
                    <p className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] italic">Telemetry Overview</p>
                  </div>
                  <div className="flex items-baseline gap-5 group cursor-default">
                     <m.h1 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="text-[10rem] md:text-[14rem] font-black italic tracking-tighter text-white leading-none drop-shadow-[0_0_120px_rgba(99,102,241,0.2)]"
                      >
                       {Number(data.score)}
                     </m.h1>
                     <span className="text-4xl font-black text-slate-800 tracking-widest">%</span>
                  </div>
                  <div className="inline-flex items-center gap-5 px-8 py-3 bg-emerald-500/5 border border-emerald-500/20 rounded-full shadow-inner">
                     <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[13px] font-black uppercase text-emerald-400 tracking-[0.3em] italic">{t.scoreStatus}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-8">
                   <MetricCard icon={Heart} label="Pulse Rate" value={data.heartRate.resting} unit="BPM" color="bg-rose-500/10 text-rose-500" />
                   <MetricCard icon={Brain} label="Recovery Depth" value={data.deepRatio} unit="%" color="bg-indigo-500/10 text-indigo-400" />
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-16">
                <div className="space-y-10">
                   <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                      <TrendingUp size={20} className="text-indigo-400" />
                      <p className="text-xs font-black uppercase text-white tracking-[0.4em] italic">{t.stagingTitle}</p>
                   </div>
                   <p className="text-2xl md:text-4xl font-bold text-slate-300 leading-tight italic tracking-tight border-l-8 border-indigo-600/40 pl-12 py-4 bg-gradient-to-r from-indigo-500/5 to-transparent rounded-r-3xl">
                     "{t.stagingQuote}"
                   </p>
                </div>

                <div className="space-y-10 bg-slate-950/60 p-12 rounded-[4rem] border border-white/5 shadow-inner">
                  <div className="flex flex-wrap gap-4">
                    {insights.map((insight, idx) => (
                      <div key={insight + idx} className="px-6 py-3 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl text-[11px] text-indigo-400 italic font-black uppercase tracking-widest shadow-xl">
                        # {insight}
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => onNavigate?.('dreams')}
                    className="w-full py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-6 shadow-[0_40px_100px_-20px_rgba(79,70,229,0.5)] italic group relative overflow-hidden"
                  >
                    <ImageIcon size={24} className="group-hover:rotate-12 transition-transform duration-500" />
                    START DREAM PROJECTION
                    <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 侧边功能栏 (占据 3 列) */}
        <div className="lg:col-span-3 space-y-8">
          <GlassCard className="p-12 rounded-[5rem] border-transparent bg-indigo-600 text-white flex flex-col justify-between shadow-[0_60px_150px_-30px_rgba(79,70,229,0.5)] relative overflow-hidden h-[45%]" intensity={1.5}>
            <div className="space-y-6 relative z-10">
              <div className="w-20 h-20 bg-white/10 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-white/30 backdrop-blur-3xl group-hover:scale-110 transition-transform duration-500">
                <Smartphone size={36} className={isProcessing ? 'animate-pulse' : ''} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-3xl font-black italic uppercase tracking-tighter leading-none">{t.syncTitle}</h3>
                  <div className="px-2 py-0.5 bg-white/10 rounded text-[8px] font-bold tracking-tighter">HEALTH CONNECT</div>
                </div>
                <p className="text-indigo-100 text-sm font-bold italic opacity-80">{t.syncDesc}</p>
              </div>
            </div>
            <button 
              onClick={handleFullSync}
              disabled={isProcessing}
              className="w-full py-5 mt-10 bg-slate-950 border border-white/10 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl transition-all hover:bg-black active:scale-95 disabled:opacity-50 italic flex items-center justify-center gap-4"
            >
              {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
              {isProcessing ? t.syncingButton : t.syncButton}
            </button>
          </GlassCard>

          <div className="grid grid-cols-1 gap-8 h-[calc(55%-2rem)]">
             <GlassCard 
               onClick={() => onNavigate?.('blog')}
               className="p-12 rounded-[4rem] border-white/5 bg-[#5865F2]/5 hover:bg-[#5865F2]/10 cursor-pointer transition-all flex flex-col justify-between group shadow-2xl"
             >
                <div className="p-4 bg-[#5865F2]/10 rounded-2xl w-fit text-[#5865F2] shadow-inner"><MessageCircle size={32} /></div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">Narrative Node</h4>
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Protocol Discussions</p>
                </div>
                <div className="flex items-center justify-between opacity-30 group-hover:opacity-100 transition-all pt-6 border-t border-white/5">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">STREAM_OK</span>
                   <ExternalLink size={18} className="text-[#5865F2]" />
                </div>
             </GlassCard>

             <GlassCard onClick={() => onNavigate?.('experiment')} className="p-12 rounded-[4rem] border-white/5 bg-slate-900/60 hover:bg-indigo-900/20 cursor-pointer transition-all flex flex-col justify-between group shadow-2xl">
                <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit text-indigo-400 shadow-inner"><FlaskConical size={32} /></div>
                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-white italic uppercase tracking-tight">Trials Matrix</h4>
                   <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Calibration Active</p>
                </div>
                <div className="flex items-center justify-between opacity-30 group-hover:opacity-100 transition-all pt-6 border-t border-white/5">
                   <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">NODE_READY</span>
                   <ChevronRight size={22} className="text-indigo-500" />
                </div>
             </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};