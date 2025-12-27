
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { 
  Bell, Settings, Clock, Moon, Zap, Activity, Heart, 
  Sparkles, Plus, RefreshCw, CheckCircle2, AlertCircle, CloudSync, ArrowRight, Loader2
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

  const handleSync = async () => {
    if (!onSyncFit || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setErrorMessage(null);
    
    try {
      await onSyncFit();
      setSyncStatus('success');
      // 4秒后恢复初始状态
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      console.error("Dashboard Sync error:", err);
      setSyncStatus('error');
      
      // 针对不同类型的错误提供更详细的诊断
      let msg = "同步服务暂时不可用。";
      if (err.message?.includes('权限')) {
        msg = "未获得必要的健身权限。";
      } else if (err.message?.includes('popup')) {
        msg = "授权窗口被浏览器拦截。";
      } else if (err.message?.includes('records')) {
        msg = "未发现最近的睡眠数据。";
      }
      
      setErrorMessage(msg);
      // 8秒后重置错误状态
      setTimeout(() => {
        setSyncStatus('idle');
        setErrorMessage(null);
      }, 8000);
    }
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}小时${m}分`;
  };

  return (
    <div className="space-y-8 pb-32 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">睡眠AI</h1>
          <p className="text-slate-400 text-sm font-medium">{data.date}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all" aria-label="通知">
            <Bell size={20} />
          </button>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white transition-all" aria-label="设置">
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
            <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
              <Moon size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">深睡</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">{Math.floor(data.totalDuration * (data.deepRatio / 100) / 60)}h {Math.floor(data.totalDuration * (data.deepRatio / 100) % 60)}m</p>
            <p className="text-[10px] text-slate-500 font-medium">占比 {data.deepRatio}%</p>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col gap-3 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
              <Zap size={20} />
            </div>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">REM</p>
          </div>
          <div className="space-y-1">
            <p className="text-xl font-bold">{Math.floor(data.totalDuration * (data.remRatio / 100) / 60)}h {Math.floor(data.totalDuration * (data.remRatio / 100) % 60)}m</p>
            <p className="text-[10px] text-slate-500 font-medium">占比 {data.remRatio}%</p>
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
            <p className="text-[10px] text-slate-4