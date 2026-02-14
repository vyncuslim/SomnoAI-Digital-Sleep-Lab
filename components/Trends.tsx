import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { 
  Award, Activity, Database, BrainCircuit, Loader2, 
  Sparkles, ChevronRight, Binary, Target, History
} from 'lucide-react';
import { analyzeBiologicalTrends, BiologicalReport } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';

const m = motion as any;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[3rem] shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{String(label)}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-black text-white italic leading-none">{payload[0].value}</span>
          <span className="text-[10px] font-black text-indigo-400 uppercase mb-1">Score</span>
        </div>
      </m.div>
    );
  }
  return null;
};

export const Trends: React.FC<{ history: SleepRecord[]; lang: Language }> = ({ history, lang }) => {
  const [report, setReport] = useState<BiologicalReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const chartData = history.slice(0, 14).reverse().map(item => {
    let dateLabel = item.date;
    if (lang === 'zh') {
      const match = item.date.match(/(\d+月\d+日)/);
      dateLabel = match ? match[1] : item.date.split(' ')[0];
    } else {
      dateLabel = item.date.split(',')[0].split(' ').slice(0, 2).join(' ');
    }
    return { date: dateLabel, score: item.score };
  });

  const handleDeepAnalyze = async () => {
    if (isAnalyzing || history.length < 3) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeBiologicalTrends(history, lang);
      setReport(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8 text-center px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-slate-700">
          <Database size={44} />
        </div>
        <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Insufficient Telemetry Data</h2>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left">
      <header className="flex justify-between items-end px-4 pt-8">
        <div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Trend <span className="text-indigo-400">Atlas</span></h1>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mt-2 italic">Historical Biometric Mapping</p>
        </div>
        <button 
          onClick={handleDeepAnalyze}
          disabled={isAnalyzing}
          className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl shadow-indigo-900/20 active:scale-95 disabled:opacity-30 italic"
        >
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
          Deep Pattern Sync
        </button>
      </header>

      <AnimatePresence>
        {report && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GlassCard className="p-12 rounded-[4rem] border-indigo-500/20 bg-indigo-600/[0.02]" intensity={1.5}>
              <div className="flex items-center gap-3 text-indigo-400 mb-8 border-b border-white/5 pb-6">
                <Sparkles size={20} />
                <h3 className="text-xl font-black italic uppercase tracking-tight">Executive Pattern Brief</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-7 space-y-10">
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Synthesis Summary</p>
                      <p className="text-lg font-bold italic text-slate-200 leading-relaxed">"{String(report.summary)}"</p>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2"><Target size={12} /> Protocol Adjustments</p>
                      <div className="grid grid-cols-1 gap-3">
                        {Array.isArray(report.protocolChanges) && report.protocolChanges.map((p, i) => (
                          <div key={i} className="px-6 py-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic font-medium text-slate-300">
                             {String(p)}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-5">
                   <div className="bg-black/40 rounded-[3rem] p-8 border border-white/5 h-full space-y-6">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Identified Patterns</p>
                      <div className="space-y-4">
                        {Array.isArray(report.patterns) && report.patterns.map((p, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                             <p className="text-xs font-bold text-slate-400 italic leading-relaxed">{String(p)}</p>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </GlassCard>
          </m.div>
        )}
      </AnimatePresence>

      <GlassCard className="p-12 rounded-[4.5rem] relative overflow-hidden" intensity={1.1}>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Binary size={20} /></div>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">Neural Restoration Index</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500/5 rounded-full border border-emerald-500/20">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[9px] font-black text-emerald-500 uppercase italic">Signal Stable</span>
          </div>
        </div>

        <div className="h-[340px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(0,0,0,0.03)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} dy={15} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#4f46e5', strokeWidth: 2 }} />
              <Area type="monotone" dataKey="score" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};