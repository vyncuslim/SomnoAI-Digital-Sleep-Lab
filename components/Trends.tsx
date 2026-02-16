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
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#020617] backdrop-blur-2xl border border-indigo-500/20 p-6 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,1)] min-w-[200px] text-left">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4 italic">Observation Log • {label}</p>
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-black text-white italic leading-none">{payload[0].value}</span>
          <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">%</span>
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
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8 text-center px-6">
        <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-800 shadow-inner">
          <Database size={48} />
        </div>
        <div className="space-y-2">
           <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Telemetry Incomplete</h2>
           <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.6em] italic">Awaiting sufficient biological logs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-40 max-w-6xl mx-auto px-4 font-sans text-left animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10 px-4 pt-4">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-900/30"><TrendingUp size={24} /></div>
             <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Trend <span className="text-indigo-400">Atlas</span></h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
                <Radio size={12} className="text-indigo-500 animate-pulse" /> LIVE_TELEMETRY
             </div>
             <span className="text-[9px] font-mono text-slate-800 uppercase tracking-[0.4em]">STATION_ID: SOMNO_LAB_08</span>
          </div>
        </div>
        <button 
          onClick={handleDeepAnalyze} disabled={isAnalyzing}
          className="px-12 py-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all flex items-center gap-4 shadow-2xl shadow-indigo-900/40 active:scale-95 disabled:opacity-30 italic overflow-hidden relative group"
        >
          {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <BrainCircuit size={18} />}
          DEEP PATTERN SYNC
          <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </header>

      <AnimatePresence>
        {report && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-indigo-500/20 bg-indigo-600/[0.02] relative overflow-hidden" intensity={1.5}>
              <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-indigo-400 pointer-events-none transform rotate-12">
                 <Binary size={400} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
                <div className="lg:col-span-7 space-y-12">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                         <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em] italic">Neural Synthesis Output</p>
                      </div>
                      <p className="text-2xl md:text-4xl font-bold italic text-white leading-[1.1] uppercase tracking-tighter">
                        "{String(report.summary)}"
                      </p>
                   </div>
                   
                   <div className="space-y-6">
                      <p className="text-[11px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-3 italic"><Target size={16} /> Adjustments protocol</p>
                      <div className="grid grid-cols-1 gap-4">
                        {report.protocolChanges.map((p, i) => (
                          <div key={i} className="px-8 py-6 bg-white/[0.02] rounded-[2rem] border border-white/5 text-base italic font-bold text-slate-300 shadow-inner group hover:border-indigo-500/30 transition-all">
                             <span className="text-indigo-600 mr-4 font-mono">0{i+1}</span> {String(p)}
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
                
                <div className="lg:col-span-5">
                   <div className="bg-black/60 rounded-[3.5rem] p-10 border border-white/5 h-full space-y-10 shadow-2xl">
                      <div className="flex items-center justify-between border-b border-white/5 pb-6">
                         <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest italic">Detected Fingerprints</span>
                         <Sparkles size={20} className="text-indigo-600" />
                      </div>
                      <div className="space-y-8">
                        {report.patterns.map((p, i) => (
                          <div key={i} className="flex gap-6 items-start">
                             <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400 mt-1 shadow-inner"><Activity size={16} /></div>
                             <p className="text-base font-bold text-slate-400 italic leading-relaxed leading-snug">{String(p)}</p>
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

      <GlassCard className="p-12 md:p-16 rounded-[4.5rem] border-white/5 relative overflow-hidden bg-[#01040a]/80" intensity={1.1}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-16 relative z-10">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-slate-900 rounded-[1.5rem] text-indigo-500 border border-indigo-500/10 shadow-inner"><BarChart3 size={28} /></div>
            <div>
               <h3 className="text-2xl font-black italic text-white uppercase tracking-tight leading-none">Biological Mapping</h3>
               <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em] mt-2 italic">Neural Restoration Index • 14 Day Span</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-6 py-2.5 bg-emerald-500/5 rounded-full border border-emerald-500/20 shadow-inner">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] font-black text-emerald-500 uppercase italic tracking-widest">Signal Stable: Connected</span>
          </div>
        </div>

        <div className="h-[400px] w-full relative z-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em' }} dy={20} />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 2, strokeDasharray: '4 4' }} />
              <Area 
                type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={5} fillOpacity={1} 
                fill="url(#colorScore)" animationDuration={2500} 
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 4, stroke: '#01040a' }}
                activeDot={{ r: 8, fill: '#818cf8', stroke: '#fff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
};