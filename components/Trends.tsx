
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { 
  Award, Activity, Database, BrainCircuit, Loader2, 
  Sparkles, ChevronRight, Binary, Target, History, TrendingUp, BarChart3, Radio
} from 'lucide-react';
import { analyzeBiologicalTrends, BiologicalReport } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';

const m = motion as any;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#020617] backdrop-blur-2xl border border-indigo-500/20 p-4 rounded-[1.5rem] shadow-2xl min-w-[140px] text-left">
        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white italic leading-none">{payload[0].value}</span>
          <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">%</span>
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
    if (isAnalyzing || history.length < 2) return;
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

  if (history.length < 1) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center px-6">
        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-800">
          <Database size={32} />
        </div>
        <div className="space-y-1">
           <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Telemetry Incomplete</h2>
           <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">Awaiting biological logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-40 max-w-5xl mx-auto px-4 font-sans text-left animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-2">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg"><TrendingUp size={20} /></div>
             <h1 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Trend <span className="text-indigo-400">Atlas</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded-full border border-white/10 text-[8px] font-black text-slate-500 tracking-widest italic">
                <Radio size={10} className="text-indigo-500 animate-pulse" /> LIVE_TELEMETRY
             </div>
          </div>
        </div>
        <button 
          onClick={handleDeepAnalyze} disabled={isAnalyzing}
          className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl active:scale-95 disabled:opacity-30 italic"
        >
          {isAnalyzing ? <Loader2 size={14} className="animate-spin" /> : <BrainCircuit size={14} />}
          PATTERN SYNC
        </button>
      </header>

      <AnimatePresence>
        {report && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <GlassCard className="p-8 md:p-12 rounded-[2.5rem] border-white/5 bg-indigo-600/[0.01]" intensity={1.2}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative z-10">
                <div className="lg:col-span-7 space-y-8">
                   <div className="space-y-3">
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Neural Synthesis Output</p>
                      <p className="text-xl md:text-2xl font-bold italic text-white leading-tight uppercase tracking-tight">
                        "{String(report.summary)}"
                      </p>
                   </div>
                   
                   <div className="space-y-4">
                      <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2 italic"><Target size={12} /> Adjustment protocol</p>
                      <div className="grid grid-cols-1 gap-3">
                        {report.protocolChanges.map((p, i) => (
                          <div key={i} className="px-5 py-4 bg-white/[0.01] rounded-[1.5rem] border border-white/5 text-sm italic font-bold text-slate-300">
                             <span className="text-indigo-600 mr-3">0{i+1}</span> {String(p)}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-5">
                   <div className="bg-black/40 rounded-[2rem] p-6 border border-white/5 h-full space-y-6">
                      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest italic border-b border-white/5 pb-3 block">Detected Fingerprints</span>
                      <div className="space-y-4">
                        {report.patterns.map((p, i) => (
                          <div key={i} className="flex gap-4 items-start">
                             <div className="p-1.5 bg-indigo-600/10 rounded-lg text-indigo-400 mt-0.5"><Activity size={12} /></div>
                             <p className="text-sm font-bold text-slate-400 italic leading-snug">{String(p)}</p>
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

      <GlassCard className="p-8 md:p-12 rounded-[3rem] border-white/5 bg-[#01040a]/80" intensity={1.1}>
        <div className="flex items-center justify-between gap-4 mb-10 relative z-10 px-2">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-slate-900 rounded-xl text-indigo-500 shadow-inner"><BarChart3 size={20} /></div>
            <div>
               <h3 className="text-lg font-black italic text-white uppercase tracking-tight leading-none">Biological Mapping</h3>
               <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest mt-1 italic">Neural Index • 14 Days</p>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 9, fontWeight: 900 }} dy={10} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} fillOpacity={1} 
                fill="url(#colorScore)" animationDuration={2000} 
                dot={{ fill: '#6366f1', strokeWidth: 1.5, r: 3, stroke: '#01040a' }}
                activeDot={{ r: 6, fill: '#818cf8', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};
