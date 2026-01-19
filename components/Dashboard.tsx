
import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Share2, Activity, Sparkles, Binary, Waves, Gauge,
  ShieldCheck, ArrowUpRight, Smartphone, Cloud, CheckCircle, Database
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';
import { COLORS } from '../constants.tsx';
import { healthConnect } from '../services/healthConnectService.ts';

const m = motion as any;

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncHealth?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
  staticMode?: boolean;
  threeDEnabled?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  data, 
  lang, 
  onSyncHealth, 
  onNavigate, 
  threeDEnabled = true
}) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isNative, setIsNative] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const t = translations[lang].dashboard;

  useEffect(() => {
    setIsNative(healthConnect.isNativeBridgeAvailable());
  }, []);

  const handleFullSync = async () => {
    if (!onSyncHealth || syncStatus !== 'idle') return;
    
    try {
      await onSyncHealth((status) => setSyncStatus(status));
      // Removed Cloud Upload logic
      setTimeout(() => {
        setSyncStatus('idle');
      }, 1000);
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  const hypnogramData = (data.stages || []).map((s) => ({
    time: s.startTime,
    level: s.name === 'Awake' ? 4 : s.name === 'Light' ? 3 : s.name === 'REM' ? 2 : 1,
    name: s.name
  }));

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-10 pb-32 max-w-5xl mx-auto"
    >
      {/* Status Node Terminal */}
      <div className="flex justify-between items-center bg-slate-950/60 px-8 py-5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Logo size={32} animated={isProcessing} threeD={threeDEnabled} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Local Lab Node Alpha</span>
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[11px] font-black tracking-widest uppercase text-emerald-400">
                 {isNative ? <span>HARDWARE LINK ACTIVE</span> : <span>EDGE CLIENT READY</span>}
               </span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 px-8 border-x border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Protocol Type</span>
              <div className="flex items-center gap-2">
                 {isNative ? <Smartphone size={16} className="text-emerald-400" /> : <Database size={16} className="text-indigo-400" />}
                 <span className="text-[10px] font-black text-white">{isNative ? 'ANDROID NATIVE' : 'LOCAL CACHE'}</span>
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Security Status</span>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-[9px] font-black text-white uppercase">Encrypted Edge</span>
              </div>
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleFullSync} 
            disabled={isProcessing} 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-indigo-500/20 text-indigo-400 transition-all active:scale-90 group relative"
          >
            <RefreshCw key="sync-icon" size={20} className={`${isProcessing ? 'animate-spin text-emerald-400' : 'group-hover:rotate-180'} transition-transform duration-700`} />
            <AnimatePresence>
              {syncStatus === 'success' && (
                <m.div 
                  key="check-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1 shadow-lg"
                >
                  <CheckCircle size={10} className="text-white" />
                </m.div>
              )}
            </AnimatePresence>
          </button>
          <button 
            onClick={() => setShowShareModal(true)} 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* Main Analysis Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-10">
          <GlassCard className="p-12 rounded-[5rem] overflow-hidden min-h-[520px] flex flex-col justify-between" intensity={threeDEnabled ? 1.5 : 0}>
            <div className="flex justify-between items-start">
              <div className="text-left">
                <h2 className="text-sm font-black italic text-indigo-400 uppercase tracking-[0.4em] mb-2">Lab Efficiency</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-[10rem] md:text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_100px_rgba(129,140,248,0.5)] leading-none select-none">
                    {data.score}
                  </span>
                  <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">/100</span>
                </div>
              </div>
              <div className="p-6 bg-indigo-500/10 rounded-[3rem] border border-indigo-500/20 flex flex-col items-center gap-1">
                 <Gauge size={24} className="text-indigo-400 mb-1" />
                 <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Precision</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col gap-4 p-8 bg-indigo-500/[0.03] border border-indigo-500/10 rounded-[3.5rem] relative overflow-hidden group cursor-help" onClick={() => onNavigate?.('about')}>
                <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-100 transition-opacity">
                   <ArrowUpRight size={20} className="text-indigo-400" />
                </div>
                <div className="flex items-center gap-3 text-indigo-400">
                   <ShieldCheck size={18} />
                   <span className="text-[10px] font-black uppercase tracking-widest italic">Official Manifesto</span>
                </div>
                <p className="text-[14px] font-bold text-slate-300 italic leading-relaxed text-left">
                  <span>"{t.manifesto}"</span>
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(data.aiInsights || []).slice(0, 2).map((insight, i) => (
                    <m.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-6 bg-slate-900/60 rounded-[3rem] border border-white/5 border-l-2 border-l-indigo-500/50 text-left"
                    >
                      <p className="text-[13px] font-medium italic text-slate-300 leading-relaxed">
                        <span>{String(insight)}</span>
                      </p>
                    </m.div>
                 ))}
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] h-full flex flex-col gap-10" intensity={threeDEnabled ? 1 : 0}>
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Binary size={20} className="text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Neural Mapping</span>
               </div>
            </div>
            <div className="flex-1 min-h-[220px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hypnogramData}>
                    <Area type="stepAfter" dataKey="level" stroke={COLORS.deep} strokeWidth={3} fill="rgba(99, 102, 241, 0.2)" animationDuration={2000} />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <m.div 
            key="share-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl" 
            onClick={() => setShowShareModal(false)}
          >
            <m.div 
              key="share-modal-card"
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }} 
              onClick={(e: any) => e.stopPropagation()}
            >
              <GlassCard className="p-16 rounded-[5rem] max-w-md border-white/20 text-center space-y-10" intensity={threeDEnabled ? 2 : 0}>
                   <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl mx-auto">
                     <Share2 size={36} />
                   </div>
                   <div className="space-y-4">
                     <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Archive Lab Metrics</h2>
                     <p className="text-sm text-slate-500 italic max-w-xs mx-auto">Digitally signed experiment report ready for secondary analysis.</p>
                   </div>
                   <div className="space-y-4 pt-4">
                     <button 
                       onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                       className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
                     >
                       <span>{copied ? 'SIGNAL COPIED' : 'COPY TELEMETRY STREAM'}</span>
                     </button>
                     <button onClick={() => setShowShareModal(false)} className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 hover:text-white transition-colors">Abort Archive</button>
                   </div>
              </GlassCard>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};
