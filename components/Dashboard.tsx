import React, { useState, useEffect } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, BrainCircuit, HeartPulse, Scan, Cpu, Binary, Zap, 
  Activity, ArrowUpRight, ShieldCheck, Waves, Target, Info, Heart,
  AlertCircle, ChevronRight, Loader2, Lock, Download, Microscope,
  Microchip, Layers, Share2, Linkedin, Copy, CheckCircle2, X, ExternalLink, HeartHandshake
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
  onNavigate?: (view: any) => void;
  staticMode?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, lang, onSyncFit, onNavigate, staticMode = false }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [engineActive, setEngineActive] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang].dashboard;

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setEngineActive(selected);
      } else {
        setEngineActive(!!process.env.API_KEY || (window as any).process?.env?.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    
    setSyncError(null);
    if (!engineActive) {
      setSyncStatus('error');
      setSyncError(lang === 'zh' ? 'AI 引擎未就绪' : 'AI Engine Not Ready');
      setTimeout(() => {
        setSyncStatus('idle');
        setSyncError(null);
      }, 3000);
      return;
    }

    try {
      await onSyncFit((status) => {
        setSyncStatus(status);
        if (status === 'success') {
          setTimeout(() => setSyncStatus('idle'), 2000);
        }
      });
    } catch (err: any) {
      setSyncStatus('error');
      setSyncError(err.message || (lang === 'zh' ? '数据同步中断' : 'Sync Interrupted'));
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  const getLinkedInText = () => {
    const header = lang === 'zh' ? '🚀 我的数字化睡眠实验报告已就绪' : '🚀 My Digital Sleep Lab Report is Ready';
    const body = `
${lang === 'zh' ? '睡眠分数' : 'Sleep Score'}: ${data.score}/100
${lang === 'zh' ? '神经恢复效率' : 'Neural Efficiency'}: ${data.efficiency}%
${lang === 'zh' ? '静息心率' : 'Resting HR'}: ${data.heartRate.resting} BPM

${lang === 'zh' ? '查看我的报告：' : 'View my report here:'}
https://sleepsomno.com

#DigitalHealth #SleepScience #AIPowered #SomnoLab #GeminiAI`;
    return `${header}\n${body}`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getLinkedInText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://sleepsomno.com')}`;
    window.open(url, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-8 pb-32"
    >
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-4">
          <div className="relative flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20 overflow-hidden shadow-[0_0_20px_rgba(79,70,229,0.2)]">
              <img 
                src="https://cdn.jsdelivr.net/gh/vyncuslim/SomnoAI-Digital-Sleep-Lab@main/public/logo.png" 
                alt="SomnoAI" 
                className="w-7 h-7 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-1.5">{t.neuralActive}</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${engineActive ? 'bg-emerald-500' : 'bg-rose-500'} ${!staticMode && engineActive ? 'animate-pulse' : ''}`} aria-hidden="true" />
                <span className={`text-[10px] font-mono uppercase tracking-widest ${engineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {engineActive ? 'Engine Linked' : 'Engine Offline'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => onNavigate?.('profile')}
            className="p-4 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all shadow-xl active:scale-95 group"
            aria-label={translations[lang].settings.funding}
          >
            <HeartHandshake size={20} className="group-hover:scale-110 transition-transform" aria-hidden="true" />
          </button>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowShareModal(true)}
              aria-label={t.shareLab}
              className="p-4 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all shadow-xl active:scale-95"
            >
              <Share2 size={20} aria-hidden="true" />
            </button>
            <button 
              onClick={handleSync}
              disabled={isProcessing}
              aria-label={lang === 'zh' ? '同步睡眠数据' : 'Sync sleep data'}
              aria-busy={isProcessing}
              className={`p-4 rounded-2xl transition-all shadow-2xl active:scale-95 ${
                isProcessing ? 'bg-indigo-600 text-white' : 
                'bg-white/5 text-slate-400 border border-white/10'
              }`}
            >
              <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative py-4" aria-live="polite">
        <GlassCard intensity={1.5} className="p-10 border-indigo-500/40 relative overflow-hidden" role="region" aria-label={lang === 'zh' ? '睡眠分数概览' : 'Sleep Score Overview'}>
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none" aria-hidden="true">
             <Layers size={140} />
          </div>
          
          <div className="flex flex-col md:flex-row justify-between gap-12 relative z-10">
            <div className="space-y-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 mb-2">
                  <BrainCircuit size={16} aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">{t.aiSynthesis}</span>
                </div>
                <div className="flex items-baseline gap-4">
                  <motion.span 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-9xl font-black italic tracking-tighter text-white drop-shadow-[0_15px_40px_rgba(79,70,229,0.4)]"
                  >
                    {data.score}
                  </motion.span>
                  <span className="text-3xl font-bold text-slate-700 font-mono tracking-tighter" aria-hidden="true">/100</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-400" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{t.stable}</span>
                </div>
                <div className="px-4 py-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center gap-2">
                  <Microchip size={14} className="text-indigo-400" aria-hidden="true" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Lab Sync v4.2</span>
                </div>
              </div>
            </div>

            <div className="flex-1 max-w-sm space-y-6">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Zap size={14} className="text-amber-400" aria-hidden="true" />
                  {lang === 'zh' ? '关键实验分析' : 'Chief Insights'}
                </h3>
                <div className="space-y-3">
                  {(data.aiInsights || []).slice(0, 3).map((insight, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" aria-hidden="true" />
                      <p className="text-xs font-medium italic text-slate-300 leading-relaxed group-hover:text-white transition-colors">
                        {insight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 space-y-3">
             <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-400">{lang === 'zh' ? '神经恢复效率' : 'Neural Efficiency'}</span>
                <span className="text-indigo-400 font-mono">{data.score}%</span>
             </div>
             <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-white/5" role="progressbar" aria-valuenow={data.score} aria-valuemin={0} aria-valuemax={100}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${data.score}%` }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                />
             </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-8 group hover:border-rose-500/40 transition-all duration-500" intensity={1.2}>
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-rose-500/10 rounded-3xl text-rose-400 group-hover:scale-110 transition-transform">
                <HeartPulse size={32} aria-hidden="true" />
              </div>
              {!staticMode && (
                <motion.div 
                  animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="absolute inset-0 bg-rose-500/20 rounded-3xl"
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Resting HR</p>
              <p className="text-4xl font-black font-mono tracking-tighter text-white italic">
                {data.heartRate.resting}
                <span className="text-xs text-slate-400 ml-1 font-sans" aria-label="Beats Per Minute">BPM</span>
              </p>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 group hover:border-cyan-500/40 transition-all duration-500" intensity={1.2}>
          <div className="flex flex-col items-center gap-6">
            <div className="p-5 bg-cyan-500/10 rounded-3xl text-cyan-400 group-hover:scale-110 transition-transform">
              <Cpu size={32} aria-hidden="true" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{lang === 'zh' ? '实验效率' : 'Efficiency'}</p>
              <p className="text-4xl font-black font-mono tracking-tighter text-white italic">
                {data.efficiency}
                <span className="text-xs text-slate-400 ml-1 font-sans">%</span>
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl" role="dialog" aria-modal="true" aria-labelledby="share-title">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md"
            >
              <GlassCard className="p-10 border-indigo-500/40 relative overflow-hidden">
                <button 
                  onClick={() => setShowShareModal(false)}
                  aria-label={lang === 'zh' ? '关闭分享窗口' : 'Close share modal'}
                  className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors"
                >
                  <X size={20} aria-hidden="true" />
                </button>

                <div className="space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Linkedin size={24} aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id="share-title" className="text-xl font-black italic text-white tracking-tight">{t.shareTitle}</h2>
                      <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">Professional Synergy</p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl relative">
                    <p className="text-xs text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                      {getLinkedInText()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={copyToClipboard}
                      aria-label={copied ? (lang === 'zh' ? '已复制' : 'Copied') : t.copyText}
                      className={`flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-300'
                      }`}
                    >
                      {copied ? <CheckCircle2 size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                      {copied ? 'Copied' : t.copyText}
                    </button>
                    <button 
                      onClick={shareToLinkedIn}
                      aria-label={lang === 'zh' ? '发布到 LinkedIn' : 'Post to LinkedIn'}
                      className="flex items-center justify-center gap-2 py-4 bg-[#0a66c2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest"
                    >
                      <Linkedin size={16} aria-hidden="true" />
                      {t.postLinked}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};