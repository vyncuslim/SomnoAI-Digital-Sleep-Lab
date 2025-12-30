
import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Heart, Sparkles, RefreshCw, CircleCheck, CircleAlert, List, Zap, Clock, Activity, Loader2, Flame, Shield, Database, Check, Satellite, ShieldAlert, KeyRound, Info
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
  
  const scoreData = useMemo(() => {
    const validScore = typeof data.score === 'number' && !isNaN(data.score) ? data.score : 0;
    return [{ value: validScore }, { value: 100 - validScore }];
  }, [data.score]);

  useEffect(() => {
    if (syncStatus !== 'idle') {
      setShowStatus(true);
      if (syncStatus === 'success') {
        const timer = setTimeout(() => {
          setShowStatus(false);
          setTimeout(() => setSyncStatus('idle'), 600);
        }, 3500);
        return () => clearTimeout(timer);
      } else if (syncStatus === 'error') {
        const timer = setTimeout(() => {
          setShowStatus(false);
          setTimeout(() => {
            setSyncStatus('idle');
            setErrorMessage(null);
          }, 600);
        }, 15000);
        return () => clearTimeout(timer);
      }
    }
  }, [syncStatus]);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    
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
    if (typeof mins !== 'number' || isNaN(mins)) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const totalStageMins = data.stages?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  const renderStatusDetails = () => {
    if (syncStatus === 'error') {
      const isPermissionError = errorMessage?.includes('PERMISSION_DENIED') || !data.stages?.length;
      const isAuthError = errorMessage?.includes('AUTH_EXPIRED');
      const isNoDataError = errorMessage?.includes('DATA_NOT_FOUND');

      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-400">
              {isAuthError ? '会话已过期' : isPermissionError ? '权限未完全授予' : isNoDataError ? '未见睡眠记录' : '实验室连接异常'}
            </span>
          </div>
          <p className="text-[10px] font-medium opacity-90 leading-relaxed max-w-xs">
            {isAuthError 
              ? '您的 Google 令牌已失效。请点击按钮重新授权连接。' 
              : isPermissionError 
              ? '关键权限缺失：请在 Google 授权页面勾选【查看睡眠数据】和【心率数据】。' 
              : isNoDataError 
              ? 'Google Fit 中尚无有效睡眠数据。请确认手机端 Fit 应用已有最近的睡眠图表。'
              : errorMessage || '终端连接丢失，无法从云端检索到有效的生理信号。'}
          </p>
          {(isAuthError || isPermissionError || isNoDataError) && (
            <div className="flex items-center gap-1.5 mt-1 text-[9px] font-black uppercase text-rose-300">
              <Info size={10} /> 建议：点击右上角刷新重新触发授权隧道
            </div>
          )}
        </div>
      );
    }

    const messages = {
      authorizing: {
        title: '安全握手校验',
        desc: '正在连接 Google 身份验证网关以验证访问权限...',
        icon: <KeyRound size={24} className="animate-pulse" />
      },
      fetching: {
        title: '生理流数据提取',
        desc: '正在从 Google Fit 检索最近 7 天的睡眠会话与聚合生理指标...',
        icon: <Satellite size={24} className="animate-bounce" />
      },
      analyzing: {
        title: '架构重构分析',
        desc: 'AI 引擎正在根据采集到的体征数据推演您的睡眠架构模型...',
        icon: <Database size={24} className="animate-spin duration-[4000ms]" />
      },
      success: {
        title: '同步部署完成',
        desc: '实验室数据已成功校准并同步至当前终端。',
        icon: <CircleCheck size={24} className="animate-in zoom-in" />
      }
    };

    const current = messages[syncStatus as keyof typeof messages];
    if (!current) return null;

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-[0.3em]">
            {current.title}
          </span>
          {isProcessing && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
        </div>
        <span className="text-[10px] font-medium opacity-80 mt-1 tracking-wide leading-tight max-w-[220px]">
          {current.desc}
        </span>
      </div>
    );
  };

  const getStatusIcon = () => {
    if (syncStatus === 'authorizing') return <KeyRound size={24} className="animate-pulse" />;
    if (syncStatus === 'fetching') return <Satellite size={24} className="animate-bounce" />;
    if (syncStatus === 'analyzing') return <Database size={24} className="animate-spin duration-[3000ms]" />;
    if (syncStatus === 'success') return <CircleCheck size={24} className="text-emerald-400" />;
    if (syncStatus === 'error') return <ShieldAlert size={24} className="text-rose-400 animate-in shake" />;
    return null;
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-1000">
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
            {data.date} • {isProcessing ? '信号流实时捕获中' : '静态历史分析模式'}
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
           syncStatus === 'error' ? <RefreshCw size={20} className="animate-in shake" /> :
           <RefreshCw size={20} className={isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'} />
          }
        </button>
      </header>

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
              {data.score ?? 0}
            </span>
            <div className="flex items-center gap-2 mt-2 opacity-50">
              <Shield size={10} className="text-indigo-400" />
              <span className="text-[10px] text-slate-400 font-black tracking-[0.5em] uppercase">SQI 质量核心</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <GlassCard className="col-span-2 p-0 overflow-hidden border-white/5 bg-slate-900/40 relative group">
           <div className="p-7 flex justify-between items-start relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">生理脉搏流 (BPM)</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-white">{data.heartRate?.average ?? 0}</span>
                  <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">周期均值</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">静息低值</p>
                <p className="text-2xl font-black text-rose-400 italic">{data.heartRate?.resting ?? 0}</p>
              </div>
           </div>
           <div className="h-32 w-full mt-[-20px] opacity-80 group-hover:opacity-100 transition-opacity">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data.heartRate?.history || []}>
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
            <Database size={64} className="text-indigo-500" />
          </div>
          <div className="space-y-6 relative z-10">
            {data.aiInsights?.map((insight, i) => (
              <div key={i} className="flex gap-5 items-start animate-in fade-in slide-in-from-left-4 duration-700" style={{ animationDelay: `${i * 300}ms` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2.5 shrink-0 shadow-[0_0_12px_#6366f1]"></div>
                <p className="text-[13px] text-slate-200 leading-relaxed font-semibold tracking-wide italic">{insight}</p>
              </div>
            )) || <p className="text-slate-500 italic text-sm">特征分析生成中...</p>}
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-3">
          <List size={16} className="text-slate-500" />
          <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">睡眠架构可视化分布</h3>
        </div>
        <GlassCard className="p-8 space-y-8">
          <div className="w-full h-12 bg-slate-800/40 rounded-[1.5rem] overflow-hidden flex shadow-inner border border-white/5">
            {data.stages?.map((stage, idx) => {
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
              { label: '深层修复', color: COLORS.deep, val: (data.deepRatio ?? 0) + '%' },
              { label: 'REM 认知', color: COLORS.rem, val: (data.remRatio ?? 0) + '%' },
              { label: '浅层恢复', color: COLORS.light, val: (100 - (data.deepRatio ?? 0) - (data.remRatio ?? 0) - (100-(data.efficiency ?? 100))) + '%' },
              { label: '清醒间歇', color: COLORS.awake, val: Math.round((100 - (data.efficiency ?? 100))) + '%' }
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

      {showStatus && (
        <div className={`fixed bottom-28 left-6 right-6 z-[100] px-8 py-5 rounded-[2.5rem] border backdrop-blur-[40px] shadow-[0_32px_128px_-16px_rgba(0,0,0,1)] flex items-center justify-between animate-in slide-in-from-bottom-12 duration-700 exit:animate-out exit:slide-out-to-bottom-12 ${
          syncStatus === 'success' ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100' : 
          syncStatus === 'error' ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.1)]' : 
          'bg-slate-900/95 border-indigo-500/40 text-indigo-100'
        }`}>
          <div className="flex items-center gap-5">
            <div className={`p-3 rounded-2xl ${
              syncStatus === 'success' ? 'bg-emerald-500/20' : 
              syncStatus === 'error' ? 'bg-rose-500/20' : 
              'bg-indigo-500/20'
            }`}>
              {getStatusIcon()}
            </div>
            {renderStatusDetails()}
          </div>
          {isProcessing && <Loader2 size={20} className="animate-spin opacity-40 ml-4" />}
        </div>
      )}
    </div>
  );
};
