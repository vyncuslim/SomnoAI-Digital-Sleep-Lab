
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord, TimeRange } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Award, Activity, Database, BrainCircuit, Loader2, Sparkles, ChevronRight, Binary, Clock, BarChart3
} from 'lucide-react';
import { getWeeklySummary } from '../services/geminiService.ts';
import { motion } from 'framer-motion';
import { Language } from '../services/i18n.ts';

interface TrendsProps {
  history: SleepRecord[];
  lang: Language;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    const stages = [
      { name: 'Deep', color: COLORS.deep, duration: data.deepDuration, ratio: data.deepRatio },
      { name: 'REM', color: COLORS.rem, duration: data.remDuration, ratio: data.remRatio },
      { name: 'Light', color: COLORS.light, duration: data.lightDuration, ratio: data.lightRatio },
      { name: 'Awake', color: COLORS.awake, duration: data.awakeDuration, ratio: data.awakeRatio }
    ];

    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-950/95 backdrop-blur-2xl border border-indigo-500/30 p-6 rounded-3xl shadow-2xl min-w-[240px] space-y-5"
        role="tooltip"
        aria-live="polite"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">Score</span>
            <span className="text-xl font-black text-white italic">{data.score}</span>
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-l-2 border-indigo-500 pl-2">Sleep Architecture</p>
          <div className="space-y-2.5">
            {stages.map((stage) => (
              <div key={stage.name} className="flex items-center justify-between group">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: stage.color }} />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">{stage.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-white/90">{stage.duration}m</span>
                  <span className="text-[9px] font-mono text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">{stage.ratio}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-60">
          <div className="flex items-center gap-2">
            <Clock size={12} className="text-slate-400" />
            <span className="text-[9px] font-mono text-slate-400 uppercase">{data.duration}H Total</span>
          </div>
          <Binary size={12} className="text-slate-700" />
        </div>
      </motion.div>
    );
  }
  return null;
};

export const Trends: React.FC<TrendsProps> = ({ history, lang }) => {
  const [range, setRange] = useState<TimeRange>('week');
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const chartData = history.slice(0, 14).reverse().map(item => {
    const findDuration = (name: string) => item.stages.find(s => s.name === name)?.duration || 0;
    const total = Math.max(1, item.totalDuration);
    
    return {
      date: item.date.split(' ')[0],
      score: item.score,
      duration: Math.round(item.totalDuration / 60 * 10) / 10,
      deepRatio: item.deepRatio || 0,
      remRatio: item.remRatio || 0,
      lightRatio: Math.round((findDuration('Light') / total) * 100),
      awakeRatio: Math.round((findDuration('Awake') / total) * 100),
      deepDuration: findDuration('Deep'),
      remDuration: findDuration('REM'),
      lightDuration: findDuration('Light'),
      awakeDuration: findDuration('Awake'),
    };
  });

  const handleGenerateSummary = async () => {
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

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
        <div className="p-8 bg-slate-800/20 border border-white/5 rounded-[2.5rem]">
          <Database size={48} className="text-slate-700" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-black italic tracking-tight text-white">No Neural Traces</h2>
          <p className="text-slate-500 text-[11px] max-w-xs font-black uppercase tracking-widest leading-relaxed">Synchronization requires at least 2 datasets</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-center px-1">
        <div className="space-y-0.5">
           <h1 className="text-2xl font-black tracking-tight italic">Trend Atlas</h1>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Historical Intelligence</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5" role="group" aria-label="Time range selector">
          {(['week', 'month'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {r === 'week' ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </header>

      {!summary ? (
        <GlassCard 
          onClick={handleGenerateSummary} 
          className="p-6 border-indigo-500/20 bg-indigo-500/[0.03] group cursor-pointer active:scale-[0.98]"
          aria-label="Synthesize trend report"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                {isGenerating ? <Loader2 size={24} className="animate-spin text-indigo-400" /> : <BrainCircuit size={24} className="text-indigo-400" />}
              </div>
              <div>
                <p className="text-sm font-black italic text-slate-100">Compile Trend Intelligence</p>
                <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-widest mt-0.5">Neural Report Synthesis</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </GlassCard>
      ) : (
        <GlassCard className="p-8 border-indigo-500/40 bg-indigo-500/[0.02] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-400 flex items-center gap-2">
              <Sparkles size={12} /> CRO Findings
            </h3>
            <button onClick={() => setSummary(null)} className="text-[8px] font-black text-slate-600 uppercase hover:text-white" aria-label="Dismiss summary">Dismiss</button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium italic">"{summary}"</p>
        </GlassCard>
      )}

      <GlassCard className="p-8 relative overflow-hidden" role="region" aria-label="Sleep Score Trend Chart">
        <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none" aria-hidden="true">
          <BarChart3 size={160} />
        </div>
        
        <div className="flex justify-between items-center mb-10">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 flex items-center gap-2">
              <Binary size={14} className="text-indigo-400" />
              Neural Signal Integrity
            </h3>
          </div>
          <div className="flex items-center gap-2">
             <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true"></span>
             <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Active Link</span>
          </div>
        </div>

        <div className="h-64 w-full" role="img" aria-label="Area chart showing sleep score trends over time">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} fontFamily="JetBrains Mono" dy={10} />
              <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} fontFamily="JetBrains Mono" />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(79, 70, 229, 0.4)', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" animationDuration={2000} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-6">
        <GlassCard className="p-6 flex flex-col items-center text-center gap-3">
          <Award className="text-amber-500/40" size={24} aria-hidden="true" />
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Efficiency Peak</p>
            <p className="text-3xl font-black font-mono mt-1 italic text-white">{Math.max(...history.map(h => h.score))}%</p>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center text-center gap-3">
          <Activity className="text-indigo-500/40" size={24} aria-hidden="true" />
          <div>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Sample Density</p>
            <p className="text-3xl font-black font-mono mt-1 italic text-white">{history.length}</p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
