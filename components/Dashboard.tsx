
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Bell, Settings, Clock, Moon, Activity, Heart, 
  Sparkles, Plus, RefreshCw, CheckCircle2, AlertCircle, CloudSync, ArrowRight, Loader2, ShieldCheck, List
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onAddData?: () => void;
  onSyncFit?: () => Promise<void>;
}

type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const Dashboard: React.FC<DashboardProps> = ({ data, onAddData, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  const scoreData = [{ value: data.score }, { value: 100 - data.score }];
  const isRealData = data.id?.startsWith('fit-');

  const handleSync = async () => {
    if (!onSyncFit || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setErrorMessage(null);
    
    try {
      await onSyncFit();
      setSyncStatus('success');
      setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || "同步失败，请检查 Google Fit 连接。");
      setTimeout(() => setSyncStatus('idle'), 6000);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}小时${m}分`;
  };

  const totalStageMins = data.stages.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">睡眠AI</h1>
            {isRealData ? (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                <ShieldCheck size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">真实数据</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-500/20 border border-slate-500/30 rounded-full">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">演示数据</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">{data.date}</p>
        </div>
        <div className="flex gap-2 text-right">
          <div className="hidden sm:block">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">最后同步</p>
            <p className="text-xs text-slate-300 font-mono">{lastSyncTime}</p>
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all ml-2">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Score Section */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="w-56 h-56 relative group">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={95}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill="url(#scoreGradient)" />
                <Cell fill="rgba(255,255,255,0.03)" />
              </Pie>
              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-white tracking-tighter drop-shadow-lg">{data.score}</span>
            <span className="text-xs text-slate-400 font-bold tracking-[0.2em] mt-1 uppercase">睡眠分数</span>
          </div>
        </div>
      </div>

      {/* Heart Rate & Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="col-span-2 p-0 overflow-hidden bg-slate-900/40">
           <div className="p-5 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">心率趋势 (BPM)</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black">{data.heartRate.average}</span>
                  <span className="text-[10px] text-slate-500 font-bold">AVG</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">范围</div>
                <div className="text-sm font-bold text-rose-400">{data.heartRate.min}-{data.heartRate.max}</div>
              </div>
           </div>
           <div className="h-20 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.heartRate.history}>
                 <defs>
                   <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="bpm" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHr)" strokeWidth={2} isAnimationActive={false} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Clock size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">总时长</p>
          </div>
          <p className="text-xl font-bold">{formatDuration(data.totalDuration)}</p>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Activity size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">效率</p>
          </div>
          <p className="text-xl font-bold">{data.efficiency}%</p>
        </GlassCard>
      </div>

      {/* Sleep Stages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <List size={18} />
          </div>
          <h3 className="font-bold text-lg">睡眠架构</h3>
        </div>
        <GlassCard className="p-6 space-y-6">
          <div className="w-full h-8 bg-slate-800/50 rounded-full overflow-hidden flex shadow-inner">
            {data.stages.map((stage, idx) => {
              const width = `${(stage.duration / totalStageMins) * 100}%`;
              let color = COLORS.light;
              if (stage.name === '深睡') color = COLORS.deep;
              if (stage.name === 'REM') color = COLORS.rem;
              if (stage.name === '清醒') color = COLORS.awake;
              
              return (
                <div 
                  key={idx} 
                  style={{ width, backgroundColor: color }}
                  className="h-full relative group transition-all hover:brightness-110"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[10px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                    {stage.name}: {stage.duration}m
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between items-center gap-2 flex-wrap">
            {[
              { label: '深睡', color: COLORS.deep },
              { label: 'REM', color: COLORS.rem },
              { label: '浅睡', color: COLORS.light },
              { label: '清醒', color: COLORS.awake }
            ].map(item => (
              <div key={item.label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 bg-indigo-500/20 rounded-lg text-indigo-400">
            <Sparkles size={18} />
          </div>
          <h3 className="font-bold text-lg">AI 睡眠洞察</h3>
        </div>
        <GlassCard className="space-y-4 p-6 bg-slate-900/40 border-indigo-500/10">
          {data.aiInsights.map((insight, i) => (
            <div key={i} className="flex gap-4 group">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform"></div>
              <p className="text-sm text-slate-300 leading-relaxed font-medium">{insight}</p>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Sync Section */}
      <div className="pt-4">
        <div className={`
          relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-700
          ${syncStatus === 'success' ? 'bg-emerald-950/20 border-emerald-500/30' : 
            syncStatus === 'error' ? 'bg-rose-950/20 border-rose-500/30' : 
            'bg-indigo-900/20 border-indigo-500/20'}
          group shadow-2xl
        `}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`
                p-4 rounded-2xl border transition-all duration-500
                ${syncStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                  syncStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 
                  'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'}
              `}>
                {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={32} /> : 
                 syncStatus === 'success' ? <CheckCircle2 size={32} /> : 
                 syncStatus === 'error' ? <AlertCircle size={32} /> : <CloudSync size={32} />}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-black text-xl">Google Fit 同步</h4>
                <p className="text-xs text-slate-400 mt-1">拉取最新穿戴设备生理特征流</p>
              </div>
            </div>

            <button 
              disabled={syncStatus === 'syncing'}
              onClick={handleSync}
              className={`
                min-w-[140px] px-8 py-4 rounded-2xl text-sm font-black transition-all active:scale-90
                ${syncStatus === 'syncing' ? 'bg-slate-800 text-slate-500' : 
                  syncStatus === 'success' ? 'bg-emerald-600 text-white' : 
                  'bg-indigo-600 hover:bg-indigo-500 text-white'}
              `}
            >
              {syncStatus === 'syncing' ? '拉取中...' : '立刻同步'}
            </button>
          </div>
          {errorMessage && (
            <div className="mt-4 text-[10px] text-rose-400 italic text-center sm:text-left">{errorMessage}</div>
          )}
        </div>
        
        <button 
          onClick={onAddData}
          className="w-full mt-4 py-4 border border-white/5 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
        >
          手动补录数据
        </button>
      </div>
    </div>
  );
};
