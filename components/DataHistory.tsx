
import React, { useState, useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, Cell 
} from 'recharts';
import { 
  History, Calendar, Activity, Zap, BarChart3, 
  Clock, Heart, ShieldCheck, ChevronRight, Filter,
  TrendingUp, Download, Database, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord } from '../types.ts';
import { Language, translations } from '../services/i18n.ts';
import { COLORS } from '../constants.tsx';

const m = motion as any;

interface DataHistoryProps {
  history: SleepRecord[];
  lang: Language;
}

type MetricType = 'score' | 'duration' | 'hr';

export const DataHistory: React.FC<DataHistoryProps> = ({ history, lang }) => {
  const [activeMetric, setActiveMetric] = useState<MetricType>('score');
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(7);
  const [hoveredData, setHoveredData] = useState<any>(null);

  const t = translations[lang];

  // Process data for charts
  const chartData = useMemo(() => {
    return [...history]
      .slice(0, timeRange)
      .reverse()
      .map(item => {
        const dateObj = new Date(item.date);
        return {
          ...item,
          displayDate: dateObj.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { 
            month: 'short', 
            day: 'numeric' 
          }),
          score: item.score,
          duration: Math.round(item.totalDuration / 60 * 10) / 10,
          hr: item.heartRate?.resting || 0,
        };
      });
  }, [history, timeRange, lang]);

  const metricsConfig = {
    score: { label: 'Sleep Score', color: COLORS.primary, unit: '%', icon: Zap },
    duration: { label: 'Duration', color: COLORS.light, unit: 'h', icon: Clock },
    hr: { label: 'Resting HR', color: COLORS.rem, unit: 'bpm', icon: Heart }
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-8 text-center px-6">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
          <div className="w-24 h-24 rounded-[2rem] bg-slate-900 border border-white/5 flex items-center justify-center text-slate-700 relative z-10">
            <Database size={48} strokeWidth={1} />
          </div>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Telemetry Void</h2>
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] max-w-xs mx-auto italic">
            No historical records identified in the local laboratory node.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-4 pt-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
              <History size={20} />
            </div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
              History <span className="text-indigo-400">Atlas</span>
            </h1>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
            Archive Logs • Node ID: SOMNO-001
          </p>
        </div>

        <div className="flex gap-2 p-1 bg-slate-950/60 rounded-full border border-white/5 backdrop-blur-xl">
          {[7, 14, 30].map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r as any)}
              className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              {r}D
            </button>
          ))}
        </div>
      </header>

      {/* Main Analysis Chart */}
      <GlassCard className="p-10 rounded-[4rem] border-white/5 overflow-hidden" intensity={1.2}>
        <div className="flex flex-wrap justify-between items-center gap-6 mb-12">
          <div className="flex gap-4">
            {(['score', 'duration', 'hr'] as MetricType[]).map((mType) => (
              <button
                key={mType}
                onClick={() => setActiveMetric(mType)}
                className={`p-4 rounded-3xl border transition-all flex flex-col items-start gap-3 min-w-[120px] ${
                  activeMetric === mType 
                    ? 'bg-indigo-600/10 border-indigo-500/40 text-white' 
                    : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10'
                }`}
              >
                {React.createElement(metricsConfig[mType].icon, { 
                  size: 18, 
                  className: activeMetric === mType ? 'text-indigo-400' : 'text-slate-600'
                })}
                <span className="text-[10px] font-black uppercase tracking-widest">{metricsConfig[mType].label}</span>
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            {hoveredData ? (
              <m.div 
                key="hover"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-right"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{hoveredData.displayDate}</p>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-3xl font-black italic text-white leading-none">{hoveredData[activeMetric]}</span>
                  <span className="text-[11px] font-black text-indigo-400 uppercase">{metricsConfig[activeMetric].unit}</span>
                </div>
              </m.div>
            ) : (
              <m.div 
                key="avg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-right"
              >
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Average {metricsConfig[activeMetric].label}</p>
                <div className="flex items-baseline gap-2 justify-end">
                  <span className="text-3xl font-black italic text-indigo-400 leading-none">
                    {(chartData.reduce((acc, curr) => acc + (curr[activeMetric] as number), 0) / chartData.length).toFixed(1)}
                  </span>
                  <span className="text-[11px] font-black text-slate-600 uppercase">{metricsConfig[activeMetric].unit}</span>
                </div>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={chartData} 
              onMouseMove={(e) => e.activePayload && setHoveredData(e.activePayload[0].payload)}
              onMouseLeave={() => setHoveredData(null)}
            >
              <defs>
                <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricsConfig[activeMetric].color} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={metricsConfig[activeMetric].color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.03)" vertical={false} />
              <XAxis 
                dataKey="displayDate" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'rgba(148, 163, 184, 0.4)', fontSize: 10, fontWeight: 800 }}
                dy={15}
              />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip 
                cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1 }}
                content={() => null}
              />
              <Area 
                type="monotone" 
                dataKey={activeMetric} 
                stroke={metricsConfig[activeMetric].color} 
                strokeWidth={4} 
                fillOpacity={1} 
                fill="url(#colorMetric)"
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* History Log List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-6">
           <div className="flex items-center gap-3">
             <BarChart3 size={18} className="text-indigo-400" />
             <h2 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em] italic">Telemetry Logs</h2>
           </div>
           <button className="text-[10px] font-black text-indigo-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
             <Download size={14} /> Export CSV
           </button>
        </div>

        <div className="space-y-4">
          {history.slice(0, 10).map((record, idx) => (
            <m.div
              key={record.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <GlassCard className="p-6 rounded-[2.5rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white border ${
                      record.score >= 85 ? 'bg-emerald-600/20 border-emerald-500/30' : 
                      record.score >= 70 ? 'bg-amber-600/20 border-amber-500/30' : 
                      'bg-rose-600/20 border-rose-500/30'
                    }`}>
                      <span className="text-lg font-black italic leading-none">{record.score}</span>
                      <span className="text-[8px] font-black uppercase opacity-60">SCORE</span>
                    </div>
                    
                    <div className="space-y-1">
                      <p className="text-sm font-black italic text-white uppercase tracking-tight">{record.date}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                          <Clock size={10} /> {Math.floor(record.totalDuration/60)}H {record.totalDuration%60}M
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase">
                          <Heart size={10} /> {record.heartRate.resting} BPM
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden md:flex gap-2">
                      <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5">
                        Deep: {record.deepRatio}%
                      </div>
                      <div className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black text-slate-600 uppercase tracking-widest border border-white/5">
                        REM: {record.remRatio}%
                      </div>
                    </div>
                    <div className="p-2 text-slate-700 group-hover:text-indigo-400 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </GlassCard>
            </m.div>
          ))}
        </div>
      </div>

      {/* Security Note */}
      <footer className="pt-10 flex flex-col items-center gap-4 opacity-30 text-center">
         <div className="flex items-center gap-2 text-indigo-400">
           <ShieldCheck size={14} />
           <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted Node Architecture</span>
         </div>
         <p className="text-[9px] font-medium text-slate-600 italic max-w-xs leading-relaxed">
           Biometric telemetry is stored using AES-256 standard and synced through the Somno Neural Pipeline.
         </p>
      </footer>
    </div>
  );
};
