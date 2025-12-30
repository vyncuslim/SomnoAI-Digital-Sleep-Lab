
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Heart, Sparkles, RefreshCw, CheckCircle2, AlertCircle, List, Zap, Clock, Activity, Loader2, Flame, Shield, DatabaseZap, Check, Satellite
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onAddData?: () => void;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);
  
  const scoreData = [{ value: data.score }, { value: 100 - data.score }];

  useEffect(() => {
    if (syncStatus !== 'idle') {
      setShowStatus(true);
      if (syncStatus === 'success' || syncStatus === 'error') {
        const timer = setTimeout(() => {
          setShowStatus(false);
          // Wait for exit animation before resetting status
          setTimeout(() => setSyncStatus('idle'), 600);
        }, 3500);
        return () => clearTimeout(timer);
      }
    }
  }, [syncStatus]);

  const handleSync = async () => {
    if (!onSyncFit || syncStatus !== 'idle') return;
    
    setErrorMessage(null);
    try {
      await onSyncFit((status) => {
        setSyncStatus(status);
      });
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || "实验室信号同步中断");
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
      case 'authorizing': return '正在验证实验室数字签名...';
      case 'fetching': return '正在检索最新生理特征流数据...';
      case 'analyzing': return 'Somno-AI 正在重构睡眠架构模型...';
      case 'success': return '信号流同步成功，已更新实验室数据';
      case 'error': return errorMessage || '终端连接异常，请重试';
      default: return '';
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header */}
      <header className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">SomnoAI Lab</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></div>
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Lab Online</span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
            {data.date} • {isProcessing ? '特征流实时同步中' : '静态信号库分析模式'}
          </p>
        </div>
        
        <button 
          onClick={handleSync}
          disabled={isProcessing}
          className={`p-4 rounded-[1.5rem] transition-all active:scale-[0.85] shadow-xl relative overflow-hidden group border ${
            syncStatus === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
            syncStatus === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
            isProcessing 
            ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' 
            : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
          }`}
        >
          {syncStatus === 'success' ? <Check size={20} className="animate-in zoom-in" /> :
           syncStatus === 'error' ? <AlertCircle size={20} className="animate-in shake" /> :
           <RefreshCw size={20} className={isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          }
        </button>
      </header>

      {/* Primary SQI Score Ring */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="w-72 h-72 relative group">
          <div className="absolute inset-0 bg-indigo-600/10 blur-[120px] rounded-full animate-pulse"></div>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={95}
                outerRadius={125}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill="url(#labGradient)" />
                <Cell fill="rgba(255,255,255,0.03)" />
              </Pie>
              <defs>
                <linearGradient id="labGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-8xl font-black text-white tracking-tighter italic drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]">
              {data.score}
            </span>
            <div className="flex items-center gap-2 mt-2 opacity-50">
              <Shield size={10} className="text-indigo-400" />
              <span className="text-[10px] text-slate-400 font-black tracking-[0.5em] uppercase">SQI 质量核心</span>
            </div>
          </div>
        </div>
      </div>

      {/* Physiological Stream Grid */}
      <div className="grid grid-cols-2 gap-5">
        <GlassCard className="col-span-2 p-0 overflow-hidden border-white/5 bg-slate-900/40 relative group">
           <div className="p-7 flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">生理脉搏流 (BPM)</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-white">{data.heartRate.average}</span>
                  <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">周期均值</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">静息低值</p>
                <p className="text-2xl font-black text-rose-400 italic">{data.heartRate.resting}</p>
              </div>
           </div>
           <div className="h-32 w-full mt-[-20px] opacity-80 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.heartRate.history}>
                 <defs>
                   <linearGradient id="hrStream" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25}/>
                     <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                   </linearGradient>
                 </defs>
                 <Area 
                  type="monotone" 
                  dataKey="bpm" 
                  stroke="#f43f5e" 
                  strokeWidth={4} 
                  fill="url(#hrStream)" 
                  isAnimationActive={true} 
                  animationDuration={1500}
                />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </GlassCard>

        <GlassCard className="p-7 space-y-4 hover:border-blue-500/30 group transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <Clock size={16} className="text-blue-400" />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">监测总时长</p>
          </div>
          <p className="text-2xl font-black text-white italic">{formatDuration(data.totalDuration)}</p>
        </GlassCard>

        <GlassCard className="p-7 space-y-4 hover:border-orange-500/30 group transition-all">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-500/10 rounded-xl">
              <Flame size={16} className="text-orange-400" />
            </div>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">基础能耗</p>
          </div>
          <p className="text-2xl font-black text-white italic">{data.calories || 0} <span className="text-xs text-slate-500 not-italic ml-1">KCAL</span></p>
        </GlassCard>
      </div>

      {/* AI Deep Insights */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/20 rounded-lg">
              <Sparkles size={14} className="text-indigo-400" />
            </div>
            <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">AI 睡眠实验室洞察</h3>
          </div>
          {syncStatus === 'analyzing' && <Loader2 size={16} className="animate-spin text-indigo-500" />}
        </div>
        <GlassCard className="p-8 bg-indigo-600/[0.03] border-indigo-500/20 shadow-[0_32px_80px_-20px_rgba(79,70,229,0.15)] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DatabaseZap size={64} className="text-indigo-500" />
          </div>
          <div className="space-y-6 relative z-10">
            {data.aiInsights.map((insight, i) => (
              <div key={i} className="flex gap-5 items-start animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${i * 300}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_12px_#6366f1]"></div>
                <p className="text-[13px] text-slate-200 leading-relaxed font-semibold tracking-wide italic">{insight}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Architecture Plot */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3">
          <List size={16} className="text-slate-500" />
          <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">睡眠架构可视化分布</h3>
        </div>
        <GlassCard className="p-8 space-y-8">
          <div className="w-full h-12 bg-slate-800/40 rounded-[1.5rem] overflow-hidden flex shadow-inner border border-white/5">
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
                  className="h-full relative transition-all hover:brightness-125 cursor-help group/stage"
                >
                   <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 rounded-lg text-[8px] font-black opacity-0 group-hover/stage:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                    {stage.name} {stage.duration}M
                   </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-y-5 gap-x-8">
            {[
              { label: '深层修复', color: COLORS.deep, val: data.deepRatio + '%' },
              { label: 'REM 认知', color: COLORS.rem, val: data.remRatio + '%' },
              { label: '浅层恢复', color: COLORS.light, val: (100 - data.deepRatio - data.remRatio - (100-data.efficiency)) + '%' },
              { label: '清醒间歇', color: COLORS.awake, val: Math.round((100 - data.efficiency)) + '%' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ backgroundColor: item.color }}></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.label}</span>
                </div>
                <span className="text-xs font-black text-slate-300 font-mono tracking-tighter">{item.val}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Lab Sync Floating Status Banner */}
      {showStatus && (
        <div className={`fixed bottom-28 left-6 right-6 z-[100] px-8 py-5 rounded-[2rem] border backdrop-blur-3xl shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] flex items-center justify-between animate-in slide-in-from-bottom-12 duration-700 exit:animate-out exit:slide-out-to-bottom-12 ${
          syncStatus === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-400' : 
          syncStatus === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-400' : 
          'bg-indigo-950/90 border-indigo-500/40 text-indigo-400'
        }`}>
          <div className="flex items-center gap-5">
            {isProcessing ? (
              syncStatus === 'authorizing' ? <Shield size={24} className="animate-pulse" /> :
              syncStatus === 'fetching' ? <Satellite size={24} className="animate-bounce" /> :
              <DatabaseZap size={24} className="animate-spin duration-[4000ms]" />
            ) : syncStatus === 'success' ? <CheckCircle2 size={24} className="animate-in zoom-in" /> : <AlertCircle size={24} />}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-[0.3em]">
                  {syncStatus === 'error' ? '终端连接失效' : '实验室核心状态'}
                </span>
                {isProcessing && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
              </div>
              <span className="text-[10px] font-medium opacity-80 mt-1.5 tracking-wide leading-tight">
                {getSyncMessage()}
              </span>
            </div>
          </div>
          {isProcessing && <Loader2 size={20} className="animate-spin opacity-40" />}
        </div>
      )}
    </div>
  );
};
