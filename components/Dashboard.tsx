import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Moon, Zap, Settings, LogOut, 
  BarChart2, Brain, ChevronRight
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Language } from '../services/i18n.ts';
import { supabase } from '../services/supabaseService.ts';

interface DashboardProps {
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (user) setUser(user);
      else navigate('/auth');
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await (supabase.auth as any).signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans p-6">
      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold">
            {user?.email?.[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold">Welcome back</h1>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/settings')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogout} className="p-3 bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500/20 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Moon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Sleep Score</p>
            <h3 className="text-2xl font-black">85</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Resting HR</p>
            <h3 className="text-2xl font-black">58 <span className="text-xs font-medium text-slate-500">bpm</span></h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Readiness</p>
            <h3 className="text-2xl font-black">92%</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Deep Sleep</p>
            <h3 className="text-2xl font-black">1h 45m</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BarChart2 size={20} className="text-indigo-500" />
                Sleep Stages
              </h3>
              <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-xs">
                <option>Last Night</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center text-slate-600 font-mono text-sm border-2 border-dashed border-white/5 rounded-2xl">
              Chart Visualization Placeholder
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Brain size={20} />
              </div>
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
            </div>
            <h4 className="font-bold text-lg mb-2">Optimal Recovery</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your deep sleep ratio is 15% higher than your 30-day average. Cognitive performance is likely peaked today.
            </p>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button onClick={() => navigate('/experiment')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left flex items-center justify-between group transition-all">
                <span className="font-medium text-sm">Start Experiment</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => navigate('/journal')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left flex items-center justify-between group transition-all">
                <span className="font-medium text-sm">Log Journal</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
