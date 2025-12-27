
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord, TimeRange } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
// Fixed: Added Activity to the imported icons
import { Calendar, TrendingUp, Award, Share2, Check, Activity } from 'lucide-react';

interface TrendsProps {
  history: SleepRecord[];
}

export const Trends: React.FC<TrendsProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('week');
  const [isShared, setIsShared] = useState(false);

  const chartData = history.slice(0, 14).reverse().map(item => ({
    date: item.date.split('-').slice(1).join('/'),
    score: item.score,
    duration: Math.round(item.totalDuration / 60 * 10) / 10,
  }));

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">趋势分析</h1>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {r === 'week' ? '周' : r === 'month' ? '月' : '年'}
            </button>
          ))}
        </div>
      </header>

      <GlassCard className="h-72 w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            睡眠质量历程
          </h3>
          <button 
            onClick={handleShare}
            className={`p-2 rounded-xl transition-all ${isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-400 hover:text-white'}`}
          >
            {isShared ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)'}}
              itemStyle={{color: '#818cf8', fontWeight: 'bold'}}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={COLORS.primary} 
              strokeWidth={3} 
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center text-center py-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl rounded-full"></div>
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Award className="text-amber-500" size={24} />
          </div>
          <p className="text-slate-400 text-sm font-medium">历史最高分</p>
          <p className="text-3xl font-black mt-1">96</p>
          <p className="text-[10px] text-emerald-400 mt-2 font-bold uppercase">+12% 较上周</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center py-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 blur-2xl rounded-full"></div>
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Calendar className="text-blue-500" size={24} />
          </div>
          <p className="text-slate-400 text-sm font-medium">作息连贯性</p>
          <p className="text-3xl font-black mt-1">84%</p>
          <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase">目标: 90%</p>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold px-2 flex items-center gap-2">
          <Calendar size={18} className="text-indigo-400" /> 最近记录
        </h3>
        <div className="space-y-3">
          {history.slice(0, 5).map(record => (
            <GlassCard key={record.id} className="flex justify-between items-center py-4 px-6 group hover:border-white/20">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${record.score > 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  {/* Fixed: Activity icon is now correctly recognized */}
                  <Activity size={18} />
                </div>
                <div>
                  <p className="font-bold text-sm">{new Date(record.date).toLocaleDateString('zh-CN', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{Math.floor(record.totalDuration/60)}H {record.totalDuration%60}M • 效率 {record.efficiency}%</p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-black shadow-lg ${record.score > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                {record.score}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
