
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord, TimeRange } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Calendar, TrendingUp, Award, Share2, Check, Activity, Database, 
  BrainCircuit, FileText, Loader2, Sparkles, ChevronRight, Binary, Clock
} from 'lucide-react';
import { getWeeklySummary } from '../services/geminiService.ts';
import { motion, AnimatePresence } from 'framer-motion';

interface TrendsProps {
  history: SleepRecord[];
}

// 自定义高保真 Tooltip 组件
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-950/90 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl min-w-[180px] space-y-4"
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{label}</p>
          <div className="flex items-center gap-1">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
             <span className="text-[8px] font-black text-indigo-400 uppercase">Live Trace</span>
          </div>
        </div>
        
        <div className="space-y-1">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Sleep Architecture Score</p>
          <p className="text-3xl font-black text-white italic">{data.score}<span className="text-sm font-bold text-slate-600 ml-1">/100</span></p>
        </div>

        <div className="space-y-3 pt-1">
          {/* 深睡比例条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
              <span className="text-indigo-400">Deep Sleep</span>
              <span className="text-white">{data.deepRatio}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 shadow-[0_0_8px_#4f46e5]" style={{ width: `${data.deepRatio}%` }} />
            </div>
          </div>

          {/* REM 比例条 */}
          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
              <span className="text-purple-400">REM Sleep</span>
              <span className="text-white">{data.remRatio}%</span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 shadow-[0_0_8px_#a855f7]" style={{ width: `${data.remRatio}%` }} />
            </div>
          </div>
        </div>

        <div className="pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock size={10} className="text-slate-500" />
            <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">{data.duration}H Total</span>
          </div>
          <Binary size={10} className="text-slate-800" />
        </div>
      </motion.div>
    );
  }
  return null;
};

export const Trends: React.FC<TrendsProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('week');
  const [isShared, setIsShared] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // 增强数据映射，包含深睡与 REM 指标
  const chartData = history.slice(0, 14).reverse().map(item => ({
    date: item.date.split(' ')[0],
    score: item.score,
    duration: Math.round(item.totalDuration / 60 * 10) / 10,
    deepRatio: item.deepRatio || 0,
    remRatio: item.remRatio || 0
  }));

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
  };

  const handleGenerateSummary = async () => {
    if (isGenerating || history.length < 2) return;
    setIsGenerating(true);
    try {
      const report = await getWeeklySummary(history);
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
          <h2 className="text-xl font-black italic tracking-tight text-white">Database Ready - No Signal</h2>
          <p className="text-slate-500 text-[11px] max-w-xs font-black uppercase tracking-widest leading-relaxed">At least 2 sampling points required<br/>for multi-dimensional trend analysis</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center px-1">
        <div className="space-y-0.5">
           <h1 className="text-2xl font-black tracking-tight italic">Trend Atlas</h1>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Historical Analysis Lab</p>
        </div>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
          {(['week', 'month'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {r === 'week' ? 'Week' : 'Month'}
            </button>
          ))}
        </div>
      </header>

      {/* AI Summary Section */}
      {!summary ? (
        <GlassCard 
          onClick={handleGenerateSummary}
          className="p-6 border-indigo-500/20 bg-indigo-500/[0.03] flex items-center justify-between group cursor-pointer active:scale-[0.98]"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
              {isGenerating ? <Loader2 size={24} className="animate-spin text-indigo-400" /> : <BrainCircuit size={24} className="text-indigo-400" />}
            </div>
            <div>
              <p className="text-sm font-black italic text-slate-100">Synthesize Lab Trend Report</p>
              <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-[0.2em] mt-0.5">
                {isGenerating ? 'Aggregating feature streams...' : 'Synthesis Analysis Report'}
              </p>
            </div>
          </div>
          <ChevronRight size={18} className="text-indigo-400 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </GlassCard>
      ) : (
        <GlassCard className="p-8 border-indigo-500/30 bg-indigo-500/[0.02] space-y-5 animate-in zoom-in-95">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">CRO Conclusion</h3>
            </div>
            <button onClick={() => setSummary(null)} className="text-[9px] font-black text-slate-600 uppercase hover:text-white transition-colors">Dismiss</button>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed font-medium italic">
            "{summary}"
          </p>
          <div className="pt-4 border-t border-white/5 flex items-center justify-between opacity-30">
            <span className="text-[8px] font-mono uppercase">Somno-Report v3.2</span>
            <span className="text-[8px] font-mono uppercase">Conf: 0.94</span>
          </div>
        </GlassCard>
      )}

      <GlassCard className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div className="space-y-1">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <Binary size={14} className="text-indigo-400" />
              Signal Quality Index (SQI)
            </h3>
          </div>
          <button 
            onClick={handleShare}
            className={`p-2.5 rounded-xl transition-all ${isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
          >
            {isShared ? <Check size={16} /> : <Share2 size={16} />}
          </button>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                fontFamily="JetBrains Mono"
                dy={10}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={9} 
                tickLine={false} 
                axisLine={false} 
                domain={[0, 100]} 
                fontFamily="JetBrains Mono"
              />
              {/* 使用自定义的 CustomTooltip */}
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ stroke: 'rgba(79, 70, 229, 0.2)', strokeWidth: 1 }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke={COLORS.primary} 
                strokeWidth={3} 
                dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, strokeWidth: 4, stroke: 'rgba(129, 140, 248, 0.2)', fill: '#fff' }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <Award className="text-amber-500/50 mb-3" size={20} />
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Historical Peak</p>
          <p className="text-2xl font-black font-mono mt-1">{Math.max(...history.map(h => h.score))}</p>
        </GlassCard>
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <Calendar className="text-blue-500/50 mb-3" size={20} />
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Sampling Total</p>
          <p className="text-2xl font-black font-mono mt-1">{history.length}</p>
        </GlassCard>
      </div>
    </div>
  );
};
