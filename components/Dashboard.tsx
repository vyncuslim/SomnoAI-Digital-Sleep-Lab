
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { SleepRecord } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { 
  Bell, Settings, Clock, Moon, Zap, Activity, Heart, 
  Sparkles, Plus, RefreshCw, CheckCircle2, AlertCircle, CloudSync, ArrowRight
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
  
  const weekTrendData = [
    { day: '周日', score: 75 },
    { day: '周一', score: 82 },
    { day: '周二', score: 78 },
    { day: '周三', score: 85 },
    { day: '周四', score: 80 },
    { day: '周五', score: 88 },
    { day: '周六', score: 82 },
  ];

  const handleSync = async () => {
    if (!onSyncFit || syncStatus === 'syncing') return;
    
    setSyncStatus('syncing');
    setErrorMessage(null);
    
    try {
      await onSyncFit();
      setSyncStatus('success');
      // Auto-reset after success
      setTimeout(() => setSyncStatus('idle'), 4000);
    } catch (err: any) {
      console.error("Sync error:", err);
      setSyncStatus('error');
      setErrorMessage(err.message || "同步过程中发生错误");
      // Reset error state after some time
      setTimeout(() => {
        setSyncStatus('idle');
        setErrorMessage(null);
      }, 6000);
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
            <span className="text-xs text-slate-400 font-bold tracking-[0.2em] mt-1">睡眠分数</span>
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
            <p className="text-slate-400 text-xs font-bold">总睡眠时长</p>
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
            <p className="text-slate-400 text-xs font-bold">深睡睡眠</p>
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
            <p className="text-slate-400 text-xs font-bold">REM 睡眠</p>
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
            <p className="text-slate-400 text-xs font-bold">睡眠效率</p>
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

      {/* Sleep Stages Chart */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg px-1">睡眠阶段</h3>
        <GlassCard className="p-8 h-64 flex flex-col justify-between bg-slate-900/40">
          <div className="flex-1 flex relative">
            <div className="absolute left-[-2.5rem] top-0 h-full flex flex-col justify-between text-[10px] text-slate-500 font-black py-1">
              <span>清醒</span>
              <span>浅睡</span>
              <span>REM</span>
              <span>深睡</span>
            </div>
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="w-full border-t border-white/20"></div>
              <div className="w-full border-t border-white/20"></div>
              <div className="w-full border-t border-white/20"></div>
              <div className="w-full border-b border-white/20"></div>
            </div>
            <div className="flex-1 ml-4 overflow-hidden">
              <svg viewBox="0 0 400 100" className="w-full h-full preserve-3d" preserveAspectRatio="none">
                <path 
                  d="M 0 10 L 40 10 L 40 40 L 100 40 L 100 90 L 160 90 L 160 65 L 240 65 L 240 40 L 320 40 L 320 10 L 400 10" 
                  fill="none" 
                  stroke="#4f46e5" 
                  strokeWidth="3" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="drop-shadow-[0_0_8px_rgba(79,70,229,0.5)]"
                />
              </svg>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-6 ml-4">
            <span>23:00</span>
            <span>01:00</span>
            <span>03:00</span>
            <span>05:00</span>
            <span>07:00</span>
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

      {/* Google Fit Card & Manual Entry */}
      <div className="space-y-4">
        <button 
          onClick={onAddData}
          className="w-full py-5 bg-white/5 border border-white/10 rounded-[2rem] font-bold flex items-center justify-center gap-2 text-slate-300 hover:bg-white/10 transition-all active:scale-95 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" /> 手动录入睡眠数据
        </button>
        
        <div className={`
          relative overflow-hidden p-8 rounded-[2.5rem] border transition-all duration-500
          ${syncStatus === 'success' ? 'bg-emerald-900/20 border-emerald-500/40 shadow-emerald-500/10' : 
            syncStatus === 'error' ? 'bg-rose-900/20 border-rose-500/40 shadow-rose-500/10' : 
            'bg-gradient-to-br from-[#1e1b4b] to-[#0f172a] border-indigo-500/20 shadow-2xl shadow-indigo-900/20'}
          group
        `}>
          {/* Animated background highlights */}
          <div className={`absolute -top-10 -right-10 w-40 h-40 blur-[50px] rounded-full transition-colors duration-700 ${
            syncStatus === 'success' ? 'bg-emerald-500/10' : 
            syncStatus === 'error' ? 'bg-rose-500/10' : 
            'bg-indigo-500/5 group-hover:bg-indigo-500/10'
          }`}></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-5">
              <div className={`
                p-4 rounded-2xl border transition-all duration-500 scale-100 group-hover:scale-105
                ${syncStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 
                  syncStatus === 'error' ? 'bg-rose-500/20 text-rose-400 border-rose-500/20' : 
                  'bg-indigo-600/20 text-indigo-400 border-indigo-500/20'}
              `}>
                {syncStatus === 'syncing' ? <RefreshCw className="animate-spin" size={28} /> : 
                 syncStatus === 'success' ? <CheckCircle2 size={28} /> : 
                 syncStatus === 'error' ? <AlertCircle size={28} /> : <CloudSync size={28} />}
              </div>
              <div className="text-center sm:text-left">
                <h4 className="font-black text-lg flex items-center gap-2 justify-center sm:justify-start">
                  Google Fit 
                  {syncStatus === 'success' && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">同步完成</span>}
                </h4>
                <p className={`text-xs font-medium transition-all duration-300 mt-0.5 ${
                  syncStatus === 'success' ? 'text-emerald-400' : 
                  syncStatus === 'error' ? 'text-rose-400' : 
                  'text-slate-400'
                }`}>
                  {syncStatus === 'syncing' ? '正在与实验室同步数据...' : 
                   syncStatus === 'success' ? '最新睡眠数据已同步至本地' : 
                   syncStatus === 'error' ? (errorMessage || '同步失败，请检查授权') : 
                   '连接您的健康中心，获取真实睡眠指标'}
                </p>
              </div>
            </div>

            <button 
              disabled={syncStatus === 'syncing'}
              onClick={handleSync}
              className={`
                min-w-[140px] px-8 py-3.5 rounded-2xl text-sm font-black transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2
                ${syncStatus === 'syncing' ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 
                  syncStatus === 'success' ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' : 
                  syncStatus === 'error' ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30' : 
                  'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'}
              `}
            >
              {syncStatus === 'syncing' ? (
                <>拉取中...</>
              ) : syncStatus === 'success' ? (
                <>再次同步</>
              ) : syncStatus === 'error' ? (
                <>点击重试</>
              ) : (
                <>一键同步 <ArrowRight size={16} /></>
              )}
            </button>
          </div>
          
          {/* Subtle error detail below if in error state */}
          {syncStatus === 'error' && errorMessage && (
            <div className="mt-4 pt-4 border-t border-rose-500/10 animate-in fade-in slide-in-from-top-1">
              <p className="text-[10px] text-rose-400/80 font-medium leading-relaxed italic">
                提示: 请确保您已在 Auth 页面正确配置 Google 授权并连接了稳定的网络环境。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
