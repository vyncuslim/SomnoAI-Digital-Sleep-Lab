
import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SleepRecord, TimeRange } from '../types';
import { GlassCard } from './GlassCard';
import { COLORS } from '../constants';
import { Calendar, TrendingUp, Award, Share2 } from 'lucide-react';

interface TrendsProps {
  history: SleepRecord[];
}

export const Trends: React.FC<TrendsProps> = ({ history }) => {
  const [range, setRange] = useState<TimeRange>('week');

  const chartData = history.slice(0, 14).reverse().map(item => ({
    date: item.date.split('-').slice(1).join('/'),
    score: item.score,
    duration: Math.round(item.totalDuration / 60 * 10) / 10,
  }));

  return (
    <div className="space-y-6 pb-24">
      <header className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Trends</h1>
        <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
          {(['week', 'month', 'year'] as TimeRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${range === r ? 'bg-indigo-600 shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </header>

      <GlassCard className="h-72 w-full">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-indigo-400" />
            Sleep Quality History
          </h3>
        </div>
        <ResponsiveContainer width="100%" height="80%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '12px'}}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke={COLORS.primary} 
              strokeWidth={3} 
              dot={{ fill: COLORS.primary, strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="flex flex-col items-center text-center py-8">
          <div className="w-12 h-12 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
            <Award className="text-amber-500" size={24} />
          </div>
          <p className="text-slate-400 text-sm">Best Score</p>
          <p className="text-3xl font-bold">96</p>
          <p className="text-[10px] text-emerald-400 mt-1">+12% vs last week</p>
        </GlassCard>

        <GlassCard className="flex flex-col items-center text-center py-8">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mb-4">
            <Calendar className="text-blue-500" size={24} />
          </div>
          <p className="text-slate-400 text-sm">Consistency</p>
          <p className="text-3xl font-bold">84%</p>
          <p className="text-[10px] text-slate-500 mt-1">Goal: 90%</p>
        </GlassCard>
      </div>

      <GlassCard className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Achievements</h3>
          <button className="text-indigo-400 text-sm flex items-center gap-1">
            <Share2 size={16} /> Share
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {[
            { label: 'Night Owl', desc: 'Sleep after 2 AM' },
            { label: 'Early Bird', desc: 'Wake before 6 AM' },
            { label: 'Deep Sleeper', desc: '2h+ Deep Sleep' },
            { label: 'Zen Master', desc: '90+ Sleep Score' }
          ].map((badge, idx) => (
            <div key={idx} className="flex-shrink-0 w-24 flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                 <div className="w-8 h-8 rounded-full bg-indigo-500 opacity-20 animate-pulse"></div>
              </div>
              <p className="text-[10px] font-bold text-center">{badge.label}</p>
            </div>
          ))}
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 gap-4">
        <h3 className="text-lg font-semibold px-2">Recent Logs</h3>
        {history.slice(0, 5).map(record => (
          <GlassCard key={record.id} className="flex justify-between items-center py-4">
            <div>
              <p className="font-bold">{new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
              <p className="text-xs text-slate-400">{Math.floor(record.totalDuration/60)}h {record.totalDuration%60}m duration</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${record.score > 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {record.score} pts
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
