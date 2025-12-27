
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord, TimeRange } from '../types';
import { GlassCard } from './GlassCard';
import { COLORS } from '../constants';
import { Calendar, TrendingUp, Award, Share2, Check, Activity, Database } from 'lucide-react';

interface TrendsProps {
  history: SleepRecord[];
}

export const Trends: React.FC<TrendsProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('week');
  const [isShared, setIsShared] = useState(false);

  const chartData = history.slice(0, 14).reverse().map(item => ({
    date: item.date.split(' ')[0],
    score: item.score,
    duration: Math.round(item.totalDuration / 60 * 10) / 10,
  }));

  const handleShare = () => {
    setIsShared(true);
    setTimeout(() => setIsShared(false), 3000);
  };

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-in fade-in duration-700">
        <div className="p-8 bg-slate-800/20 border border-white/5 rounded-[2.5rem]">
          <Database size={48} className="text-slate-600" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white">数据库为空</h2>
          <p className="text-slate-500 text-sm max-w-xs font-medium">实验室需要至少一天的真实生理信号采集才能生成趋势分析报告。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      <header className="flex justify-between items-center px-1">
        <h1 className="text-3xl font-black tracking-tighter">生理趋势</h1>
        <div className="flex bg-white/5 rounded-2xl p-1 border border-white/5">
          {(['week', 'month'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${range === r ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {r === 'week' ? '本周' : '本月'}
            </button>
          ))}
        </div>
      </header>

      <GlassCard className="h-72 w-full p-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-400">
            <TrendingUp size={16} className="text-indigo-400" />
            信号质量指数 (SQI)
          </h3>
          <button 
            onClick={handleShare}
            className={`p-2.5 rounded-xl transition-all ${isShared ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}
          >
            {isShared ? <Check size={18} /> : <Share2 size={18} />}
          </button>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
            <XAxis dataKey="date" stroke="#475569" fontSize={9} tickLine={false} axisLine={false} />
            <YAxis stroke="#475569" fontSize={9} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip 
              contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'}}
              itemStyle={{color: '#818cf8', fontWeight: '900', fontSize: '12px'}}
              labelStyle={{color: '#94a3b8', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.1em'}}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={COLORS.primary} 
              strokeWidth={4} 
              dot={{ fill: COLORS.primary, strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 4, stroke: 'rgba(79, 70, 229, 0.3)', fill: '#fff' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center text-center py-8 relative overflow-hidden group">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Award className="text-amber-500" size={24} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">历史峰值</p>
          <p className="text-3xl font-black mt-1">{Math.max(...history.map(h => h.score))}</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center py-8 relative overflow-hidden group">
          <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
            <Calendar className="text-blue-500" size={24} />
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">活跃天数</p>
          <p className="text-3xl font-black mt-1">{history.length}</p>
        </GlassCard>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
          <Activity size={14} /> 最近信号流记录
        </h3>
        <div className="space-y-3">
          {history.map(record => (
            <GlassCard key={record.id} className="flex justify-between items-center py-5 px-6 group hover:border-white/20">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${record.score > 80 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
                  <Activity size={20} />
                </div>
                <div>
                  <p className="font-black text-sm text-white tracking-tight">{record.date}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                    {Math.floor(record.totalDuration/60)}H {record.totalDuration%60}M • 效率 {record.efficiency}%
                  </p>
                </div>
              </div>
              <div className={`px-4 py-1.5 rounded-full text-xs font-black shadow-lg ${record.score > 80 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/20 text-amber-400 border border-amber-500/20'}`}>
                {record.score}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </div>
  );
};
