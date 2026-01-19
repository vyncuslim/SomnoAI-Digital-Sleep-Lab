
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// Fix: Removed missing TimeRange import to resolve compilation error
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { Award, Activity, Database, BrainCircuit, Loader2, Sparkles, ChevronRight, Binary } from 'lucide-react';
import { getWeeklySummary } from '../services/geminiService.ts';
import { motion } from 'framer-motion';
import { Language } from '../services/i18n.ts';

const m = motion as any;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-950/95 backdrop-blur-2xl border border-white/10 p-6 rounded-[3rem] shadow-2xl min-w-[200px]">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{label}</p>
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
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const chartData = history.slice(0, 7).reverse().map(item => {
    // 增强日期处理，在中文下提取"月日"，英文下提取第一项
    let dateLabel = item.date;
    if (lang === 'zh') {
      const match = item.date.match(/(\d+月\d+日)/);
      dateLabel = match ? match[1] : item.date.split(' ')[0];
    } else {
      dateLabel = item.date.split(',')[0].split(' ').slice(0, 2).join(' ');
    }
    
    return {
      date: dateLabel,
      score: item.score
    };
  });

  const handleGenerate = async () => {
    if (isGenerating || history.length < 2) return;
    setIsGenerating(true);
    try {
      const report = await getWeeklySummary(history, lang);
      setSummary(report);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (history.length < 2) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6 text-center">
        <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-slate-700">
          <Database size={40} />
        </div>
        <h2 className="text-xl font-black italic text-white uppercase">Insufficient Data</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto">
      <header className="px-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black italic text-white uppercase">Trend Atlas</h1>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Historical Mapping</p>
        </div>
      </header>

      {!summary ? (
        <GlassCard onClick={handleGenerate} className="p-8 rounded-full border-indigo-500/20 bg-indigo-500/[0.03] cursor-pointer group" hoverScale={true}>
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                {isGenerating ? <Loader2 size={24} className="animate-spin" /> : <BrainCircuit size={24} />}
              </div>
              <span className="text-sm font-black italic text-white uppercase tracking-tight">Synthesize Analysis</span>
            </div>
            <ChevronRight size={20} className="text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-10 rounded-[4rem] border-indigo-500/30 space-y-4">
          <div className="flex items-center gap-3 text-indigo-400">
            <Sparkles size={16} />
            <h3 className="text-[10px] font-black uppercase tracking-widest">Executive Conclusion</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{summary}"</p>
        </GlassCard>
      )}

      <GlassCard className="p-10 rounded-[4rem] relative overflow-hidden" intensity={1.1}>
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Binary size={18} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Neural Signal</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-500 uppercase font-black">Link Stable</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="date" hide />
              <YAxis domain={[0, 100]} hide />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-6 px-2">
        <GlassCard className="p-8 rounded-full flex flex-col items-center gap-2" hoverScale={true}>
          <Award className="text-amber-500/40" size={24} />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Peak Efficiency</p>
          <p className="text-2xl font-black italic text-white">{Math.max(...history.map(h => h.score))}%</p>
        </GlassCard>
        <GlassCard className="p-8 rounded-full flex flex-col items-center gap-2" hoverScale={true}>
          <Activity className="text-indigo-500/40" size={24} />
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Data Density</p>
          <p className="text-2xl font-black italic text-white">{history.length}</p>
        </GlassCard>
      </div>
    </div>
  );
};
