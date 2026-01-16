import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, BrainCircuit, HeartPulse, Cpu, Zap, 
  Share2, Activity, Sparkles
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { Logo } from './Logo.tsx';

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

  return (
    <m.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-32 max-w-4xl mx-auto"
    >
      {/* 浮动胶囊状态栏 */}
      <div className="flex justify-between items-center bg-slate-950/40 px-8 py-5 rounded-full border border-white/10 backdrop-blur-3xl shadow-2xl">
        <div className="flex items-center gap-4">
          <Logo size={28} animated={engineActive} />
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Neural Link</span>
            <span className={`text-[10px] font-bold ${engineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {engineActive ? 'PROTECTION ACTIVE' : 'LINK OFFLINE'}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 px-6 border-x border-white/5">
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Signal</span>
              <div className="flex gap-1">
                 {[1, 2, 3, 4].map(i => (
                   <div key={i} className={`w-1 h-3 rounded-full ${i <= (engineActive ? 4 : 1) ? 'bg-indigo-500' : 'bg-slate-800'}`} />
                 ))}
              </div>
           </div>
           <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-slate-600 uppercase mb-1">Node</span>
              <Activity size={12} className={engineActive ? 'text-emerald-500' : 'text-slate-700'} />
           </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={handleSync} 
            disabled={isProcessing} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-indigo-500/10 border border-white/5 hover:bg-indigo-500/20 text-indigo-400 transition-all active:scale-90"
          >
            <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowShareModal(true)} 
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all active:scale-90"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* 核心液体分数面板 */}
      <GlassCard className="p-10 rounded-[5rem] overflow-hidden" intensity={1.2}>
        <div className="flex flex-col items-center gap-12">
          {/* 液态圆环分数 */}
          <div className="relative flex items-center justify-center">
            <m.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-40px] border-[2px] border-dashed border-indigo-500/20 rounded-full"
            />
            <div className="relative z-10 text-center">
              <m.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 15 }}
                className="text-[12rem] font-black italic tracking-tighter text-white drop-shadow-[0_0_80px_rgba(129,140,248,0.4)] leading-none select-none"
              >
                {data.score}
              </m.div>
              <div className="px-6 py-2 bg-indigo-500 text-white rounded-full font-black italic text-sm tracking-widest mt-4 inline-block shadow-[0_10px_30px_rgba(79,70,229,0.5)]">
                BIO-EFFICIENCY
              </div>
            </div>
          </div>

          {/* Manifesto Badge */}
          <m.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-8 py-4 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 max-w-xl"
          >
            <Sparkles size={16} className="text-indigo-400 shrink-0" />
            <p className="text-[11px] font-medium text-slate-400 italic leading-relaxed text-center">
              {t.manifesto}
            </p>
          </m.div>

          {/* AI 洞察流 - 气泡形态 */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
            {(data.aiInsights || []).map((insight, i) => (
              <m.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="p-6 bg-white/5 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                  <BrainCircuit size={16} />
                </div>
                <p className="text-[12px] font-medium italic text-slate-300 leading-relaxed">
                  {/* Defensive rendering for insight content */}
                  {typeof insight === 'string' ? insight : String(insight)}
                </p>
              </m.div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* 圆角指标卡片组组 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
        {[
          { icon: HeartPulse, label: 'Heart Rate', value: `${data.heartRate.resting} BPM`, color: 'text-rose-400' },
          { icon: Cpu, label: 'Processing', value: `${data.efficiency}%`, color: 'text-cyan-400' },
          { icon: Activity, label: 'Deep Neural', value: `${data.deepRatio}%`, color: 'text-indigo-400' },
          { icon: Zap, label: 'Metabolism', value: `${data.calories || 2150}`, color: 'text-amber-400' }
        ].map((item, i) => (
          <GlassCard key={i} className="p-8 rounded-full flex flex-col items-center gap-3 text-center" hoverScale={true}>
            <div className={`p-4 rounded-full bg-white/5 ${item.color}`}>
              <item.icon size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.label}</p>
              <p className="text-xl font-black italic text-white tracking-tight">{item.value}</p>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* 分享弹窗 - 气泡样式 */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl">
            <m.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
              <GlassCard className="p-12 rounded-[5rem] max-w-sm border-white/20">
                <div className="flex flex-col items-center gap-8">
                   <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-2xl">
                     <Share2 size={32} />
                   </div>
                   <h2 className="text-2xl font-black italic text-white uppercase text-center">Export Analysis</h2>
                   <p className="text-sm text-slate-400 text-center italic">Report stream ready for synchronization.</p>
                   <button 
                     onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                     className="w-full py-5 rounded-full bg-white text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all"
                   >
                     {copied ? 'STREAM COPIED' : 'COPY REPORT'}
                   </button>
                   <button onClick={() => setShowShareModal(false)} className="text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors">Abort</button>
                </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </m.div>
  );
};