
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { SleepRecord } from '../types';
import { GlassCard } from './GlassCard';
import { COLORS } from '../constants';
import { Bell, Settings, Clock, Moon, Zap, Activity, Heart, Sparkles, Plus, RefreshCw } from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
}

export const Dashboard: React.FC<DashboardProps> = ({ data }) => {
  const scoreData = [{ value: data.score }, { value: 100 - data.score }];
  
  const weekTrendData = [
    { day: '周日', score: 75 },
    { day: '周一', score: 82 },
    { day: '周二', score: 78 },
    { day: '周三', score: 85 },
    { day: '周四', score: 80 },
    { day: '周五', score: 88 },
    { day: '周六', score: 0 },
  ];

  return (
    <div className="space-y-6 pb-32">
      {/* Header */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">睡眠AI</h1>
          <p className="text-slate-400 text-sm">{data.date}</p>
        </div>
        <div className="flex gap-4">
          <button className="p-2 text-slate-400 hover:text-white"><Bell size={22} /></button>
          <button className="p-2 text-slate-400 hover:text-white"><Settings size={22} /></button>
        </div>
      </header>

      {/* Score Section */}
      <div className="flex flex-col items-center justify-center py-6 relative">
        <div className="w-48 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={85}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill="#4f46e5" />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold">{data.score}</span>
            <span className="text-xs text-slate-400 mt-1">睡眠分数</span>
            <span className="text-xs text-emerald-400 mt-1 font-bold">需改善</span>
          </div>
        </div>
        <p className="text-slate-500 text-xs mt-4">暂无睡眠数据</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex items-start gap-4 p-5">
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">总睡眠时长</p>
            <p className="text-lg font-bold">--</p>
            <p className="text-[10px] text-slate-500">目标: 8小时</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-start gap-4 p-5">
          <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
            <Moon size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">深睡睡眠</p>
            <p className="text-lg font-bold">--</p>
            <p className="text-[10px] text-slate-500">占比 0%</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-start gap-4 p-5">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <Zap size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">REM 睡眠</p>
            <p className="text-lg font-bold">--</p>
            <p className="text-[10px] text-slate-500">占比 0%</p>
          </div>
        </GlassCard>

        <GlassCard className="flex items-start gap-4 p-5">
          <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Activity size={20} />
          </div>
          <div>
            <p className="text-slate-400 text-xs mb-1">睡眠效率</p>
            <p className="text-lg font-bold">--</p>
            <p className="text-[10px] text-slate-500">健康范围 85%+</p>
          </div>
        </GlassCard>
      </div>

      {/* Heart Rate Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Heart size={18} className="text-rose-500" />
          <h3 className="font-bold">睡眠心率</h3>
          <span className="text-[10px] text-slate-500 ml-auto">无数据</span>
        </div>
        <GlassCard className="grid grid-cols-3 gap-0 divide-x divide-white/5 p-4">
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 mb-1">平均</p>
            <p className="text-lg font-bold">--</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 mb-1">最低</p>
            <p className="text-lg font-bold">--</p>
          </div>
          <div className="text-center px-2">
            <p className="text-[10px] text-slate-400 mb-1">最高</p>
            <p className="text-lg font-bold">--</p>
          </div>
        </GlassCard>
      </div>

      {/* Sleep Stages Chart */}
      <div className="space-y-3">
        <h3 className="font-bold px-1">睡眠阶段</h3>
        <GlassCard className="p-4 h-56 flex flex-col">
          <div className="flex-1 flex items-end gap-0.5 px-6">
            <div className="w-full h-full relative">
              <div className="absolute left-[-2rem] top-0 h-full flex flex-col justify-between text-[10px] text-slate-500 pr-2">
                <span>清醒</span>
                <span>浅睡</span>
                <span>REM</span>
                <span>深睡</span>
              </div>
              {/* Stepped Chart Mockup */}
              <div className="w-full h-full border-l border-b border-white/5 flex items-end">
                <svg viewBox="0 0 100 40" className="w-full h-full">
                  <path d="M 0 5 L 10 5 L 10 25 L 30 25 L 30 35 L 50 35 L 50 15 L 70 15 L 70 25 L 90 25 L 90 5 L 100 5" 
                        fill="none" stroke="#4f46e5" strokeWidth="0.5" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-2">
            <span>23:00</span>
            <span>01:00</span>
            <span>03:00</span>
            <span>05:00</span>
            <span>07:00</span>
          </div>
        </GlassCard>
      </div>

      {/* Weekly Trend */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <h3 className="font-bold">本周趋势</h3>
          <span className="text-[10px] text-slate-500">平均 0分</span>
        </div>
        <GlassCard className="p-4 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekTrendData}>
              <Bar dataKey="score" fill="rgba(79, 70, 229, 0.4)" radius={[4, 4, 0, 0]} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={10} stroke="#64748b" />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      {/* AI Insights */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Sparkles size={18} className="text-indigo-400" />
          <h3 className="font-bold">AI 睡眠洞察</h3>
        </div>
        <GlassCard className="space-y-4 p-6">
          {data.aiInsights.map((insight, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
              <p className="text-sm text-slate-300 leading-relaxed">{insight}</p>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Google Fit Card */}
      <div className="space-y-4">
        <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold flex items-center justify-center gap-2 text-slate-400">
          <Plus size={18} /> 手动录入睡眠数据
        </button>
        
        <div className="bg-[#1e1b4b]/40 border border-indigo-500/20 rounded-3xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400">
              <Activity size={24} />
            </div>
            <div>
              <h4 className="font-bold">Google Fit</h4>
              <p className="text-xs text-slate-500">同步您的健康数据</p>
            </div>
          </div>
          <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-sm font-bold transition-all">
            连接
          </button>
        </div>
      </div>
    </div>
  );
};
