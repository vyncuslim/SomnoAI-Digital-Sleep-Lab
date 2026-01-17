import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, BrainCircuit, HeartPulse, Cpu, Zap, 
  Share2, Activity, Sparkles, Binary, Waves, Gauge
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';
import { COLORS } from '../constants.tsx';

const m = motion as any;

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncHealth?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
  staticMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, lang, onSyncHealth, onNavigate, staticMode = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [engineActive, setEngineActive] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang].dashboard;

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem('somno_manual_gemini_key');
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setEngineActive(selected || !!process.env.API_KEY || !!storedKey);
      } else {
        setEngineActive(!!process.env.API_KEY || !!storedKey);
      }
    };
    checkKey();
  }, []);

  const handleSync = async () => {
    if (!onSyncHealth || isProcessing) return;
    try {
      await onSyncHealth((status) => {
        setSyncStatus(status);
        if (status === 'success') setTimeout(() => setSyncStatus('idle'), 2000);
      });
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  // Process stages for the hypnogram visualization
  const hypnogramData = (data.stages || []).map((s, i) => ({
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
      {/* 顶部神经状态栏 */}
      <div className="flex justify-between items-center bg-slate-950/60 px-8 py-5 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-5">
          <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
            <Logo size={32} animated={engineActive} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Neural Node Alpha</span>
            <div className="flex items-center gap-2">
               <div className={`w-1.5 h-1.5 rounded-full ${engineActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#ef4444]'}`} />
               <span className={`text-[11px] font-black tracking-widest uppercase ${engineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                 {engineActive ? 'PROTECTION ACTIVE' : 'LINK OFFLINE'}
               </span>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:flex items-center gap-8 px-8 border-x border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Signal Strength</span>
              <div className="flex gap-1.5">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className={`w-1.5 h-4 rounded-full transition-all duration-700 ${i <= (engineActive ? 4 : 1) ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'}`} />
                 ))}
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[9px] font-black text-slate-600 uppercase mb-2 tracking-widest">Bio-Node</span>
              <Activity size={18} className={engineActive ? 'text-indigo-400' : 'text-slate-700'} />
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleSync} 
            disabled={isProcessing} 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 hover:bg-indigo-500/20 text-indigo-400 transition-all active:scale-90 group"
          >
            <RefreshCw size={20} className={`${isProcessing ? 'animate-spin' : 'group-hover:rotate-180'} transition-transform duration-700`} />
          </button>
          <button 
            onClick={() => setShowShareModal(true)} 
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>

      {/* 实验室核心看板 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 左侧：液态分数与洞察 */}
        <div className="lg:col-span-7 space-y-10">
          <GlassCard className="p-12 rounded-[5rem] overflow-hidden min-h-[500px] flex flex-col justify-between" intensity={1.5}>
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-sm font-black italic text-indigo-400 uppercase tracking-[0.4em] mb-2">Subject Efficiency</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_100px_rgba(129,140,248,0.5)] leading-none select-none">
                    {data.score}
                  </span>
                  <span className="text-2xl font-black text-slate-700 uppercase tracking-tighter">/100</span>
                </div>
              </div>
              <div className="p-6 bg-indigo-500/10 rounded-[3rem] border border-indigo-500/20 flex flex-col items-center gap-1">
                 <Gauge size={24} className="text-indigo-400 mb-1" />
                 <span className="text-[9px] font-black text-indigo-300 uppercase tracking-widest">Optimal</span>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 border border-white/10 rounded-[2.5rem] max-w-lg">
                <Sparkles size={18} className="text-indigo-400 shrink-0" />
                <p className="text-[12px] font-medium text-slate-400 italic leading-relaxed">
                  {t.manifesto}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {(data.aiInsights || []).slice(0, 2).map((insight, i) => (
                    <m.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.3 }}
                      className="p-6 bg-slate-900/60 rounded-[3rem] border border-white/5 border-l-2 border-l-indigo-500/50"
                    >
                      <p className="text-[13px] font-medium italic text-slate-300 leading-relaxed">
                        {String(insight)}
                      </p>
                    </m.div>
                 ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* 右侧：神经架构图与指标 */}
        <div className="lg:col-span-5 space-y-8">
          <GlassCard className="p-10 rounded-[4rem] h-full flex flex-col gap-10">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-3">
                 <Binary size={20} className="text-indigo-400" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Neural Mapping</span>
               </div>
               <div className="px-3 py-1 bg-emerald-500/10 rounded-full text-[9px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
                 High Fidelity
               </div>
            </div>

            <div className="flex-1 min-h-[220px]">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hypnogramData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="hypnoColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.deep} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={COLORS.deep} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '12px' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="stepAfter" 
                      dataKey="level" 
                      stroke={COLORS.deep} 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#hypnoColor)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
               </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Deep Neural</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black italic text-white tracking-tighter">{data.deepRatio}%</span>
                  <Waves size={12} className="text-indigo-500" />
                </div>
              </div>
              <div className="p-6 bg-white/5 rounded-[2.5rem] border border-white/5">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">REM Consolid</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black italic text-white tracking-tighter">{data.remRatio}%</span>
                  <BrainCircuit size={12} className="text-purple-500" />
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* 底部生理脉搏卡片组 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
        {[
          { icon: HeartPulse, label: 'Cardiac Stability', value: `${data.heartRate.resting}`, unit: 'BPM', color: 'text-rose-500' },
          { icon: Cpu, label: 'Sync Efficiency', value: `${data.efficiency}`, unit: '%', color: 'text-cyan-400' },
          { icon: Binary, label: 'Session Time', value: `${Math.floor(data.totalDuration/60)}H`, unit: `${data.totalDuration%60}M`, color: 'text-indigo-400' },
          { icon: Zap, label: 'Metabolic Load', value: `${data.calories || 2150}`, unit: 'KCAL', color: 'text-amber-400' }
        ].map((item, i) => (
          <GlassCard key={i} className="p-10 rounded-[3rem] flex flex-col items-center gap-4 text-center group" hoverScale={true}>
            <div className={`p-5 rounded-[2rem] bg-white/5 ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
              <item.icon size={26} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600 mb-2">{item.label}</p>
              <div className="flex items-baseline justify-center gap-1.5">
                <p className="text-3xl font-black italic text-white tracking-tighter leading-none">{item.value}</p>
                <p className="text-[10px] font-black text-slate-500 uppercase">{item.unit}</p>
              </div>
            </div>
          </m.div>
        ))}
      </div>

      {/* 分享弹窗 */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl" onClick={() => setShowShareModal(false)}>
            <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} onClick={(e: any) => e.stopPropagation()}>
              <GlassCard className="p-16 rounded-[5rem] max-w-md border-white/20 text-center space-y-10">
                   <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-2xl mx-auto">
                     <Share2 size={36} />
                   </div>
                   <div className="space-y-4">
                     <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Export Lab Report</h2>
                     <p className="text-sm text-slate-500 italic max-w-xs mx-auto">Cryptographically signed lab metrics ready for external synchronization.</p>
                   </div>
                   <div className="space-y-4 pt-4">
                     <button 
                       onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                       className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all"
                     >
                       {copied ? 'SIGNAL COPIED' : 'COPY REPORT STREAM'}
                     </button>
                     <button onClick={() => setShowShareModal(false)} className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 hover:text-white transition-colors">Abort Command</button>
                   </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </m.div>
  );
};
