import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Activity, CreditCard, Globe, 
  TrendingUp, ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

interface FounderStats {
  total_users: number;
  new_today: number;
  active_users: number;
  paying_users: number;
  country_distribution: Record<string, number>;
}

export const FounderDashboard: React.FC = () => {
  const [stats, setStats] = useState<FounderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/founder-stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Calculating Neural Metrics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center">
        <p className="font-bold mb-2">Error Loading Analytics</p>
        <p className="text-sm opacity-80">{error || 'Unknown error'}</p>
        <button onClick={fetchStats} className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-bold uppercase tracking-widest">Retry</button>
      </div>
    );
  }

  const pieData = Object.entries(stats.country_distribution || {}).map(([name, value]) => ({ name, value }));
  const COLORS = ['#818cf8', '#c084fc', '#fb7185', '#34d399', '#fbbf24', '#38bdf8'];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total Subjects" 
          value={stats.total_users || 0} 
          icon={Users} 
          color="indigo" 
          trend="+12%" 
        />
        <MetricCard 
          title="New Today" 
          value={stats.new_today || 0} 
          icon={UserPlus} 
          color="emerald" 
          trend="+5%" 
        />
        <MetricCard 
          title="Active (30d)" 
          value={stats.active_users || 0} 
          icon={Activity} 
          color="amber" 
          trend="+8%" 
        />
        <MetricCard 
          title="Paying Nodes" 
          value={stats.paying_users || 0} 
          icon={CreditCard} 
          color="purple" 
          trend="+15%" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Country Distribution */}
        <GlassCard className="p-8 rounded-[2.5rem] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Globe className="text-indigo-400" size={20} />
              <h3 className="text-lg font-black italic uppercase tracking-tight">Global Reach</h3>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Growth Chart (Mock for now as we don't have historical data in the RPC yet) */}
        <GlassCard className="p-8 rounded-[2.5rem] border-white/5">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-emerald-400" size={20} />
              <h3 className="text-lg font-black italic uppercase tracking-tight">Neural Growth</h3>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Mon', users: 12 },
                { name: 'Tue', users: 19 },
                { name: 'Wed', users: 15 },
                { name: 'Thu', users: 22 },
                { name: 'Fri', users: 30 },
                { name: 'Sat', users: 25 },
                { name: 'Sun', users: stats.new_today },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#ffffff05'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="users" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color, trend }: any) => {
  const colorClasses: any = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  };

  return (
    <GlassCard className="p-6 rounded-3xl border-white/5 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Icon size={80} />
      </div>
      <div className="relative z-10">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{title}</p>
        <div className="flex items-end gap-3">
          <h3 className="text-3xl font-black italic text-white leading-none">{value}</h3>
          <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full mb-0.5 ${trend.startsWith('+') ? 'text-emerald-400 bg-emerald-400/10' : 'text-rose-400 bg-rose-400/10'}`}>
            {trend.startsWith('+') ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend}
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
