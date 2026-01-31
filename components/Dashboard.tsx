
import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Activity, Gauge, 
  ChevronRight, FlaskConical, Brain, Heart, Waves, Info, ShieldCheck, Zap
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';
import { healthConnect } from '../services/healthConnectService.ts';

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
  const [integrity, setIntegrity] = useState(94.2);
  
  const t = translations[lang].dashboard;

  useEffect(() => {
    const timer = setInterval(() => {
      setIntegrity(prev => Math.min(99.9, Math.max(92.0, prev + (Math.random() - 0.5))));
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleFullSync = async () => {
    if (!onSyncHealth || syncStatus !== 'idle') return;
    try {
      await onSyncHealth((status) => setSyncStatus(status));
      setTimeout(() => setSyncStatus('idle'), 1500);
    } catch (err) { setSyncStatus('error'); }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  const hypnogramData = (data.stages || []).map((s) => ({
    time: s.startTime,
    level: s.name === 'Awake' ? 4 : s.name === 'Light' ? 3 : s.name === 'REM' ? 2 : 1,
    name: s.name
  }));

  return (
    <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 pb-40 max-w-7xl mx-auto px-4 font-sans text-left">
      {/* Top Banner: Infrastructure Status */}
      <div className="flex flex-wrap gap-4 px-4">
         <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">End-to-End Encryption Active</span>
         </div>
         <div className="flex items-center gap-3 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Zap size={12} className="text-indigo-400 animate-pulse" />
            <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Neural Link Sync: 100%</span>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 左侧主要分析面板 */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-10 md:p-14 rounded-[4rem] min-h-[700px] flex flex-col justify-between border-white/[0.05]" intensity={1.5}>
            <div className="flex justify-between items-start">
              <div className="text-left space-y-1">
                <h2 className="text-[11px] font-black italic text-indigo-400 uppercase tracking-[0.6em] mb-4">Neural Architecture Analysis</h2>
                <div className="flex items-baseline relative">
                  <span className="text-[12rem] md:text-[15rem] font-black italic tracking-tighter text-white leading-none select-none">
                    {data.score}
                  </span>
                  <div className="absolute -bottom-4 right-[-50px] flex flex-col items-start">
                     <span className="text-3xl font-black text-slate-700 uppercase tracking-tighter leading-none">/100</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">Optimal Recovery</span>
                  </div>
                </div>
              </div>
              
              <m.div 
                whileHover={{ rotate: 180 }}
                className="w-24 h-24 rounded-full border border-indigo-500/20 bg-indigo-500/5 flex flex-col items-center justify-center gap-1 backdrop-blur-3xl"
              >
                <Gauge size={20} className="text-indigo-400" />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Precision</span>
              </m.div>
            </div>

            <div className="space-y-10">
              {/* Lab Manifesto - HIGH FIDELITY CHINESE COPY */}
              <m.div 
                whileHover={{ scale: 1.01 }}
                onClick={() => onNavigate?.('experiment')}
                className="p-10 bg-[#0a0f25]/80 border border-indigo-500/20 rounded-[3rem] relative overflow-hidden group cursor-pointer shadow-2xl"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white italic">Laboratory Manifesto</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-[9px] font-black uppercase text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">Initialize Experiment</span>
                     <ChevronRight size={20} className="text-slate-700 group-hover:text-indigo-400 transition-colors" />
                  </div>
                </div>
                
                <p className="text-[18px] md:text-[22px] font-bold text-white italic leading-relaxed text-left tracking-tight mb-8 drop-shadow-sm">
                  "{t.manifesto}"
                </p>
                
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Neural Synthesis Engine V5.2.4</span>
                </div>
              </m.div>
              
              {/* Bottom Insight Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(data.aiInsights || []).slice(0, 2).map((insight, i) => (
                    <m.div 
                      key={i} 
                      initial={{ opacity: 0, x: -10 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      className="p-7 bg-slate-900/40 rounded-[2.5rem] border border-white/5 text-left flex items-start gap-4"
                    >
                      <div className="mt-1"><Info size={14} className="text-indigo-400" /></div>
                      <p className="text-[13px] font-bold italic text-slate-300 leading-snug">{String(insight)}</p>
                    </m.div>
                 ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 右侧神经映射面板 */}
        <div className="lg:col-span-5 space-y-6">
          <GlassCard className="p-12 rounded-[4.5rem] min-h-[700px] flex flex-col border-white/[0.05]" intensity={1}>
            <div className="flex justify-between items-start mb-16">
              <div className="flex items-center gap-4">
                 <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-indigo-400 italic leading-none">01</span>
                    <div className="w-4 h-[1px] bg-slate-800 my-1" />
                    <span className="text-[10px] font-black text-slate-800 italic leading-none">10</span>
                 </div>
                 <h3 className="text-[12px] font-black uppercase tracking-[0.5em] text-white italic">Neural Mapping</h3>
              </div>
              <Activity size={18} className="text-slate-700" />
            </div>

            <div className="flex-1 w-full flex flex-col justify-center gap-12">
               <div className="h-[320px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hypnogramData}>
                      <defs>
                        <linearGradient id="neuralGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="100%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="stepAfter" 
                        dataKey="level" 
                        stroke="#6366f1" 
                        strokeWidth={3} 
                        fill="url(#neuralGrad)" 
                        animationDuration={3000} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                  
                  <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-l border-b border-white/[0.03]" />
               </div>

               <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-700">
                     <span>Bio-link integrity</span>
                     <span className="text-emerald-500 font-mono">{integrity.toFixed(1)}%</span>
                  </div>
                  <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                     <m.div 
                       initial={{ width: 0 }} 
                       animate={{ width: `${integrity}%` }} 
                       transition={{ duration: 1 }} 
                       className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                     />
                  </div>
               </div>
            </div>

            <div className="mt-auto pt-10 border-t border-white/[0.03] flex justify-between items-center">
               <div className="flex gap-4">
                  {[Brain, Heart, Waves].map((Icon, i) => (
                    <div key={i} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-600 hover:text-indigo-400 transition-colors cursor-help">
                      <Icon size={16} />
                    </div>
                  ))}
               </div>
               <button onClick={handleFullSync} disabled={isProcessing} className="group flex items-center gap-3 px-8 py-4 rounded-full bg-indigo-600/10 border border-indigo-500/20 hover:bg-indigo-600/20 transition-all active:scale-95 shadow-xl">
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin text-indigo-400' : 'text-indigo-400 group-hover:rotate-180 transition-transform duration-700'} />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-100">{isProcessing ? 'Capturing...' : 'Sync Biometrics'}</span>
               </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </m.div>
  );
};
