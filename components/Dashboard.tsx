
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Bell, Settings, Clock, Moon, Zap, Activity, Heart, 
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
  
  const scoreData = [{ value: data.score }, { value: 100 - data.score }];
  const isRealData = data.id?.startsWith('fit-');

  const handleSync = async () => {
    if (!onSyncFit || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setErrorMessage(null);
    
    try {
      await onSyncFit();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || "同步失败，请确保设备数据已上传至 Google Fit。");
      setTimeout(() => setSyncStatus('idle'), 6000);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}小时${m}分`;
  };

  // 计算阶段占比条
  const totalStageMins = data.stages.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">睡眠AI</h1>
            {isRealData && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/30 rounded-full">
                <ShieldCheck size={10} className="text-indigo-400" />
                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter">真实数据</span>
              </div>
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium">{data.date}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <Bell size={20} />
          </button>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Score Section */}
      <div className="flex flex-col items-center justify-center py-4 relative">
        <div className="w-56 h-56 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full scale-75 group-hover:scale-100 transition-transform duration-1000"></div>
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
            <div className="mt-2 px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
              <span className="text-[10px] text-emerald-400 font-black uppercase">表现良好</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sleep Stages Visualization */}
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
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-[10px] px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 transition-opacity">
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

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400">
              <Clock size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">总时长</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">{formatDuration(data.totalDuration)}</p>
            <p className="text-[10px] text-slate-500 font-medium">目标: 8小时</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
              <Activity size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">效率</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">{data.efficiency}%</p>
            <p className="text-[10px] text-slate-500 font-medium">健康范围 85%+</p>
          </div>
        </GlassCard>
      </div>

      {/* Heart Rate Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <div className="p-1.5 bg-rose-500/20 rounded-lg text-rose-500">
            <Heart size={18} />
          </div>
          <h3 className="font-bold text-lg">睡眠心率</h3>
          <span className="text-[10px] text-slate-500 ml-auto font-bold uppercase tracking-wider">实时监测</span>
        </div>
        <GlassCard className="grid grid-cols-3 gap-0 divide-x divide-white/5 p-6 bg-slate-900/40">
          <div className="text-center px-2 space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">平均</p>
            <p className="text-2xl font-black text-white">{data.heartRate.average}<span className="text-[10px] text-slate-500 ml-1">BPM</span></p>
          </div>
          <div className="text-center px-2 space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">最低</p>
            <p className="text-2xl font-black text-rose-400">{data.heartRate.min}<span className="text-[10px] text-slate-500 ml-1">BPM</span></p>
          </div>
          <div className="text-center px-2 space-y-1">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">最高</p>
            <p className="text-2xl font-black text-rose-300">{data.heartRate.max}<span className="text-[10px] text-slate-500 ml-1">BPM</span></p>
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

      {/* Google Fit Sync Section */}
      <div className="space-y-4">
        <button 
          onClick={onAddData}
          className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-slate-300 hover:bg-white/10 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 手动录入睡眠数据
        </button>
        
        <div className={`
          relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-700
          ${syncStatus === 'success' ? 'bg-emerald-950/20 border-emerald-500/30' : 
            syncStatus === 'error' ? 'bg-rose-950/20 border-rose-500/30' : 
            'bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border-indigo-500/20'}
          group shadow-2xl
        `}>
          <div className={`absolute -top-20 -right-20 w-64 h-64 blur-[80px] rounded-full transition-colors duration-1000 ${
            syncStatus === 'success' ? 'bg-emerald-500/10' : 
            syncStatus === 'error' ? 'bg-rose-500/10' : 
            'bg-indigo-500/5 group-hover:bg-indigo-500/10'
          }`}></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`
                p-4 rounded-2xl border transition-all duration-500
                ${syncStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20 shadow-lg shadow-emerald-500/20' : 
                  syncStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20 shadow-lg shadow-rose-500/20' : 
                  'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'}
              `}>
                {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={32} /> : 
                 syncStatus === 'success' ? <CheckCircle2 size={32} className="animate-in zoom-in" /> : 
                 syncStatus === 'error' ? <AlertCircle size={32} className="animate-in bounce-in" /> : <CloudSync size={32} />}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-black text-xl flex items-center gap-2 justify-center sm:justify-start">
                  Google Fit 云同步
                </h4>
                <p className={`text-sm font-medium transition-all duration-300 mt-1 max-w-[240px] ${
                  syncStatus === 'success' ? 'text-emerald-400/90' : 
                  syncStatus === 'error' ? 'text-rose-400/90' : 
                  'text-slate-400'
                }`}>
                  {syncStatus === 'syncing' ? '正在连接实验室云端获取生理信号...' : 
                   syncStatus === 'success' ? '同步成功！检测到真实穿戴设备记录' : 
                   syncStatus === 'error' ? (errorMessage || '数据同步中断') : 
                   '拉取最新健身记录以生成真实 AI 洞察'}
                </p>
              </div>
            </div>

            <button 
              disabled={syncStatus === 'syncing'}
              onClick={handleSync}
              className={`
                min-w-[150px] px-8 py-4 rounded-[1.25rem] text-sm font-black transition-all shadow-xl active:scale-90 flex items-center justify-center gap-2
                ${syncStatus === 'syncing' ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 
                  syncStatus === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 
                  syncStatus === 'error' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 
                  'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}
              `}
            >
              {syncStatus === 'syncing' && <Loader2 size={16} className="animate-spin" />}
              {syncStatus === 'syncing' ? '分析中' : 
               syncStatus === 'success' ? '更新完成' : 
               syncStatus === 'error' ? '重试连接' : 
               '立即抓取'}
              {syncStatus === 'idle' && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </div>
          
          {syncStatus === 'error' && (
            <div className="mt-4 pt-4 border-t border-rose-500/10 flex items-start gap-2 animate-in fade-in slide-in-from-top-1">
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">错误排查</span>
              <p className="text-[11px] text-rose-400/70 font-medium leading-relaxed italic">
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
