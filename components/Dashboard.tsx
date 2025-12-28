
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Heart, Sparkles, RefreshCw, CheckCircle2, AlertCircle, List, Zap, Clock, Activity, Loader2, Flame, Shield
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onAddData?: () => void;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const scoreData = [{ value: data.score }, { value: 100 - data.score }];

  const handleSync = async () => {
    if (!onSyncFit || syncStatus !== 'idle') return;
    
    setSyncStatus('authorizing');
    setErrorMessage(null);
    
    try {
      await onSyncFit((status) => {
        setSyncStatus(status);
      });
      // onSyncFit will set status to 'success' or 'error' internally through the callback
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || "接入失败，请检查同步通路。");
      setTimeout(() => setSyncStatus('idle'), 5000);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const totalStageMins = data.stages.reduce((acc, s) => acc + s.duration, 0);

  const getSyncMessage = () => {
    switch (syncStatus) {
      case 'authorizing': return '正在请求 Google 权限授权...';
      case 'fetching': return '正在从云端提取生理特征流...';
      case 'analyzing': return '实验室 AI 正在分析代谢架构...';
      case 'success': return '实验室数据同步成功';
      case 'error': return errorMessage || '同步失败，请检查实验室连接';
      default: return '';
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tighter text-white italic">SomnoAI Lab</h1>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <Zap size={10} className="text-indigo-400 fill-indigo-400" />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">特征流活跃</span>
            </div>
          </div>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">
            {data.date} • 实时监测中
          </p>
        </div>
        <button 
          onClick={handleSync}
          disabled={isProcessing}
          className={`p-3 border rounded-2xl transition-all active:scale-95 ${
            isProcessing 
            ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400' 
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10'
          }`}
        >
          <RefreshCw size={18} className={isProcessing ? 'animate-spin' : ''} />
        </button>
      </header>

      {/* Score Section */}
      <div className="flex flex-col items-center justify-center py-2 relative">
        <div className="w-64 h-64 relative group">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse"></div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={110}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill="url(#scoreGradient)" />
                <Cell fill="rgba(255,255,255,0.02)" />
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
            <span className="text-7xl font-black text-white tracking-tighter drop-shadow-2xl">{data.score}</span>
            <span className="text-[10px] text-slate-500 font-black tracking-[0.4em] mt-2 uppercase">睡眠质量指数</span>
          </div>
        </div>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="col-span-2 p-0 overflow-hidden border-indigo-500/10 bg-slate-900/40">
           <div className="p-6 flex justify-between items-start">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Heart size={14} className="text-rose-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">生理脉搏流 (BPM)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{data.heartRate.average}</span>
                  <span className="text-[10px] text-slate-500 font-black">AVG</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">RHR</div>
                <div className="text-xl font-black text-rose-400">{data.heartRate.resting}</div>
              </div>
           </div>
           <div className="h-28 w-full px-1">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.heartRate.history}>
                 <defs>
                   <linearGradient id="colorHr" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                     <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area type="monotone" dataKey="bpm" stroke="#f43f5e" fillOpacity={1} fill="url(#colorHr)" strokeWidth={3} isAnimationActive={true} />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 group hover:border-blue-500/30">
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-blue-400" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">睡眠时长</p>
          </div>
          <p className="text-xl font-black text-white">{formatDuration(data.totalDuration)}</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 group hover:border-orange-500/30">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-400" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">能量代谢</p>
          </div>
          <p className="text-xl font-black text-white">{data.calories || 0} <span className="text-[10px] text-slate-500 uppercase">kcal</span></p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 group hover:border-emerald-500/30">
          <div className="flex items-center gap-2">
            <Activity size={16} className="text-emerald-400" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">提取效率</p>
          </div>
          <p className="text-xl font-black text-white">{data.efficiency}%</p>
        </GlassCard>

        <GlassCard className="p-6 space-y-3 group hover:border-indigo-500/30">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">深睡占比</p>
          </div>
          <p className="text-xl font-black text-white">{data.deepRatio}%</p>
        </GlassCard>
      </div>

      {/* AI Intelligence Lab */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-indigo-400" />
            <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">AI 深度洞察实验室</h3>
          </div>
          {syncStatus === 'analyzing' && <Loader2 size={14} className="animate-spin text-indigo-500" />}
        </div>
        <GlassCard className="p-7 bg-indigo-600/[0.03] border-indigo-500/20 shadow-[0_20px_60px_-15px_rgba(79,70,229,0.1)]">
          <div className="space-y-5">
            {data.aiInsights.map((insight, i) => (
              <div key={i} className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-700" style={{ animationDelay: `${i * 200}ms` }}>
                <div className="w-1 h-1 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_8px_#6366f1]"></div>
                <p className="text-sm text-slate-200 leading-relaxed font-medium tracking-wide">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sleep Architecture */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-2">
          <List size={16} className="text-slate-500" />
          <h3 className="font-black text-xs uppercase tracking-[0.3em] text-slate-400">生理架构分层</h3>
        </div>
        <GlassCard className="p-6 space-y-6">
          <div className="w-full h-10 bg-slate-800/40 rounded-3xl overflow-hidden flex shadow-inner border border-white/5">
            {data.stages.map((stage, idx) => {
              const width = `${(stage.duration / Math.max(1, totalStageMins)) * 100}%`;
              let color = COLORS.light;
              if (stage.name === '深睡') color = COLORS.deep;
              if (stage.name === 'REM') color = COLORS.rem;
              if (stage.name === '清醒') color = COLORS.awake;
              
              return (
                <div 
                  key={idx} 
                  style={{ width, backgroundColor: color }}
                  className="h-full relative transition-all hover:brightness-125"
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6">
            {[
              { label: '深层睡眠', color: COLORS.deep, val: data.deepRatio + '%' },
              { label: 'REM 阶段', color: COLORS.rem, val: data.remRatio + '%' },
              { label: '浅层睡眠', color: COLORS.light, val: (100 - data.deepRatio - data.remRatio) + '%' },
              { label: '清醒阶段', color: COLORS.awake, val: Math.round((100 - data.efficiency)) + '%' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-xs font-black text-slate-300 font-mono">{item.val}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Sync Status Banner */}
      {syncStatus !== 'idle' && (
        <div className={`fixed top-12 left-1/2 -translate-x-1/2 z-[100] px-8 py-4 rounded-3xl border backdrop-blur-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500 ${
          syncStatus === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-400' : 
          syncStatus === 'error' ? 'bg-rose-950/90 border-rose-500/50 text-rose-400' : 
          'bg-indigo-950/90 border-indigo-500/50 text-indigo-400'
        }`}>
          {isProcessing ? (
            syncStatus === 'authorizing' ? <Shield size={20} className="animate-pulse" /> :
            syncStatus === 'fetching' ? <RefreshCw size={20} className="animate-spin" /> :
            <Sparkles size={20} className="animate-pulse" />
          ) : syncStatus === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-black uppercase tracking-widest">
            {getSyncMessage()}
          </span>
        </div>
      )}
    </div>
  );
};
