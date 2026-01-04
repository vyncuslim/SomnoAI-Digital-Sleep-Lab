import React, { useState, useEffect, useCallback } from 'react';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, Loader2, BrainCircuit, HeartPulse, Scan, Cpu, Github, Download, Check, ChevronLeft, ChevronRight, Binary, Zap, Lightbulb, ExternalLink, Shield, FileText
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

interface DashboardProps {
  data: SleepRecord;
  lang: Language;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, lang, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [ticker, setTicker] = useState("FF00AA11");
  const [isExporting, setIsExporting] = useState(false);
  const [exportComplete, setExportComplete] = useState(false);
  const [insightIndex, setInsightIndex] = useState(0);
  const t = translations[lang].dashboard;

  const insights = (data.aiInsights || []).slice(0, 3);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Array.from({length: 8}, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase();
      setTicker(prev => (prev + " " + hex).slice(-100));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (insights.length <= 1) return;
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % insights.length);
    }, 10000); 
    return () => clearInterval(timer);
  }, [insights.length]);

  useEffect(() => {
    setInsightIndex(0);
  }, [data.id]);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    try {
      await onSyncFit((status) => setSyncStatus(status));
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const handleExport = () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportComplete(false);
    
    setTimeout(() => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", `Somno_Lab_Export_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      setIsExporting(false);
      setExportComplete(true);
      setTimeout(() => setExportComplete(false), 3000);
    }, 2000);
  };

  const nextInsight = useCallback(() => {
    if (insights.length <= 1) return;
    setInsightIndex((prev) => (prev + 1) % insights.length);
  }, [insights.length]);

  const prevInsight = useCallback(() => {
    if (insights.length <= 1) return;
    setInsightIndex((prev) => (prev - 1 + insights.length) % insights.length);
  }, [insights.length]);

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);
  const liveLinkId = ticker.split(' ').filter(Boolean)[0] || "00000000";

  const getInsightCategory = (idx: number) => {
    const categories = lang === 'zh' 
      ? ["生理架构分析", "认知影响预测", "行动方案建议"] 
      : ["PHYSIOLOGICAL ANALYSIS", "COGNITIVE IMPACT", "ACTIONABLE PROTOCOL"];
    return categories[idx % categories.length];
  };

  const insightIcons = [
    <Scan size={14} className="text-indigo-400" />,
    <Zap size={14} className="text-amber-400" />,
    <Lightbulb size={14} className="text-emerald-400" />
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-10"
    >
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg"
          >
             <Scan size={14} className="text-indigo-400" />
          </motion.div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">{t.neuralActive}</p>
            <p className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              {t.liveLink}: 0x{liveLinkId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
            title="查看源代码"
          >
            <Github size={18} />
          </a>
          <button 
            onClick={handleSync}
            disabled={isProcessing}
            className={`p-2.5 rounded-xl transition-all ${isProcessing ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white border border-white/10'}`}
          >
            <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 md:col-span-2 border-indigo-500/30 overflow-hidden relative">
          <div className="flex justify-between items-start mb-10">
            <div className="space-y-1">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
                <BrainCircuit size={14} />
                {t.aiSynthesis}
              </h2>
              <div className="flex items-baseline gap-2">
                <h1 className="text-6xl font-black italic tracking-tighter text-white">
                  {data.score}
                </h1>
                <span className="text-xl text-slate-600 font-bold not-italic tracking-widest">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t.stable}</span>
              </div>
              <p className="text-[9px] font-mono text-slate-600 mt-2 uppercase tracking-widest">v3.4.0-STABLE</p>
            </div>
          </div>

          <div className="relative min-h-[180px] px-2 flex flex-col justify-between">
            <div className="flex items-center justify-between gap-4">
              {insights.length > 1 && (
                <button 
                  onClick={prevInsight}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-90 z-20 shrink-0"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div className="flex-1 relative overflow-hidden h-full py-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={insightIndex}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -40 }}
                    transition={{ duration: 0.5, ease: "anticipate" }}
                    className="space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 border border-white/10 rounded-lg">
                        {insightIcons[insightIndex % insightIcons.length]}
                        <span className="text-[10px] font-black tracking-[0.15em] text-indigo-300 uppercase">
                          {getInsightCategory(insightIndex)}
                        </span>
                      </div>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                    </div>
                    
                    <p className="text-xl md:text-2xl font-semibold italic text-slate-100 leading-tight text-glow-indigo">
                      "{insights[insightIndex] || (lang === 'zh' ? "正在合成洞察..." : "Synthesis in progress...")}"
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {insights.length > 1 && (
                <button 
                  onClick={nextInsight}
                  className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all active:scale-90 z-20 shrink-0"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mt-8">
              {insights.length > 1 && (
                <div className="flex items-center gap-2">
                  {insights.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInsightIndex(idx)}
                      className="group p-1"
                    >
                      <div className={`h-1.5 rounded-full transition-all duration-500 ${idx === insightIndex ? 'w-10 bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.8)]' : 'w-2 bg-white/10 group-hover:bg-white/20'}`} />
                    </button>
                  ))}
                </div>
              )}

              {(!insights || insights.length === 0) && (
                <div className="flex items-center gap-3 text-slate-500 py-4 animate-pulse">
                  <Loader2 size={18} className="animate-spin" />
                  <p className="text-sm font-medium italic tracking-wide">{t.synthesisProgress}...</p>
                </div>
              )}
              
              <div className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">
                {lang === 'zh' ? '片段' : 'Segment'}: {insightIndex + 1}/3
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
              <span>{lang === 'zh' ? '优化水平' : 'Optimization Level'}</span>
              <span className="text-indigo-400">{data.score}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }} 
                animate={{ width: `${data.score}%` }} 
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.6)]"
              />
            </div>
          </div>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4 md:col-span-2">
          <GlassCard className="p-6 text-center group cursor-pointer hover:border-indigo-500/30 transition-all" onClick={handleExport}>
            <div className="flex flex-col items-center gap-2">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${isExporting ? 'bg-indigo-500/30 text-indigo-200 animate-pulse' : 'bg-white/5 text-slate-500 group-hover:text-indigo-400 group-hover:bg-indigo-500/10'}`}>
                {exportComplete ? <Check size={24} className="text-emerald-400" /> : (isExporting ? <Loader2 size={24} className="animate-spin" /> : <Download size={24} />)}
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{t.cmdExport}</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6 text-center group cursor-pointer hover:border-emerald-500/30 transition-all" onClick={handleSync}>
             <div className="flex flex-col items-center gap-2">
              <div className={`p-4 rounded-2xl transition-all duration-300 ${isProcessing ? 'bg-indigo-500/30 text-indigo-200 animate-pulse' : 'bg-white/5 text-slate-500 group-hover:text-emerald-400 group-hover:bg-emerald-500/10'}`}>
                <RefreshCw size={24} className={isProcessing ? 'animate-spin' : ''} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 group-hover:text-slate-300 transition-colors">{t.cmdSync}</p>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 space-y-4 hover:border-rose-500/30 transition-all">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-500/10 rounded-lg">
                <HeartPulse size={16} className="text-rose-400" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{lang === 'zh' ? '静息心率' : 'Resting HR'}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black font-mono tracking-tighter">{data.heartRate.resting}</p>
            <span className="text-[10px] font-bold text-slate-600 uppercase">BPM</span>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4 hover:border-indigo-500/30 transition-all">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-500/10 rounded-lg">
                <Cpu size={16} className="text-indigo-400" />
             </div>
             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.efficiency}</p>
          </div>
          <div className="flex items-baseline gap-1">
            <p className="text-4xl font-black font-mono tracking-tighter">{data.efficiency}</p>
            <span className="text-[10px] font-bold text-slate-600 uppercase">%</span>
          </div>
        </GlassCard>
      </div>

      <div className="px-2 pt-4">
         <div className="flex items-center justify-between opacity-30">
            <div className="flex items-center gap-2">
              <Binary size={10} className="text-indigo-400" />
              <span className="text-[8px] font-mono tracking-widest uppercase">{t.telemetry} [STREAM_OPEN]</span>
            </div>
            <span className="text-[8px] font-mono tracking-widest uppercase opacity-50">SHK: 0x{ticker.slice(0,16)}</span>
         </div>
         <div className="mt-3 h-12 overflow-hidden opacity-10 font-mono text-[7px] break-all leading-tight text-indigo-200">
            {ticker}
         </div>
      </div>

      <footer className="mt-20 py-12 border-t border-white/5 flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-8">
          <a href="https://sleepsomno.com/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <Shield size={12} /> {lang === 'zh' ? '隐私政策' : 'Privacy'}
          </a>
          <a href="https://sleepsomno.com/terms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <FileText size={12} /> {lang === 'zh' ? '服务条款' : 'Terms'}
          </a>
          <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <Github size={12} /> {lang === 'zh' ? '源代码' : 'Source'}
          </a>
        </div>
        <div className="text-center space-y-1">
          <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2025 Somno Lab • {lang === 'zh' ? '数字睡眠基础设施' : 'Digital Sleep Infrastructure'}</p>
          <div className="flex items-center justify-center gap-2">
            <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
            <p className="text-[7px] font-mono text-slate-700 uppercase">{lang === 'zh' ? '神经网关' : 'Neural Gateway'} v3.4.2 [Production]</p>
          </div>
        </div>
      </footer>
    </motion.div>
  );
};