
import React, { useState, useEffect } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { supabase } from '../services/supabaseService.ts';

const m = motion as any;

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback'>('overview');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data representing what would come from Supabase tables
  const [stats] = useState({
    totalUsers: 1284,
    activeStreams: 942,
    apiRequests: '42.5k',
    uptime: '99.98%'
  });

  const [feedbacks] = useState([
    { id: 'FB-001', user: 'User 829', content: 'Telemetry sync delay on Wear OS 4.', status: 'Pending', date: '2h ago' },
    { id: 'FB-002', user: 'User 121', content: 'Heart rate mapping precision is incredible.', status: 'Resolved', date: '5h ago' },
    { id: 'FB-003', user: 'User 442', content: 'Request: Darker "Midnight" theme option.', status: 'Pending', date: '1d ago' },
  ]);

  return (
    <div className="space-y-10 pb-32 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Lab Admin <span className="text-rose-500">Engine</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Infrastructure Command Center</p>
        </div>
        
        <div className="flex gap-3 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl">
          {['overview', 'users', 'feedback'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {activeTab === 'overview' && (
        <div className="space-y-10">
          {/* Top Level Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
            {[
              { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-rose-400' },
              { icon: RefreshCw, label: 'Active Links', value: stats.activeStreams, color: 'text-emerald-400' },
              { icon: Database, label: 'Bio-Queries', value: stats.apiRequests, color: 'text-sky-400' },
              { icon: ShieldAlert, label: 'Uptime', value: stats.uptime, color: 'text-amber-400' }
            ].map((stat, i) => (
              <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5 flex flex-col items-center gap-2" hoverScale={true}>
                <stat.icon size={20} className={stat.color} />
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black italic text-white tracking-tight">{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          {/* Infrastructure Health */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
            <GlassCard className="md:col-span-2 p-10 rounded-[4rem] border-white/10" intensity={1.1}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-rose-500" />
                  <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Network Throughput</h3>
                </div>
                <button className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Real-Time</button>
              </div>
              
              <div className="h-48 flex items-end gap-2 px-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 80, 100].map((h, i) => (
                  <m.div 
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.05, duration: 1 }}
                    className="flex-1 bg-gradient-to-t from-rose-600/10 to-rose-500 rounded-t-lg"
                  />
                ))}
              </div>
              <div className="flex justify-between mt-6 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                <span>00:00 UTC</span>
                <span>Telemetry Load (Last 12h)</span>
                <span>NOW</span>
              </div>
            </GlassCard>

            <GlassCard className="p-10 rounded-[4rem] border-white/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="text-amber-400" />
                  <h3 className="text-xs font-black italic text-white uppercase tracking-widest">System Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Supabase DB</span>
                    <span className="text-emerald-400 font-black">STABLE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Gemini Core</span>
                    <span className="text-emerald-400 font-black">STABLE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Edge Workers</span>
                    <span className="text-amber-400 font-black">LATENCY</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                Run Diagnostics
              </button>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'feedback' && (
        <GlassCard className="mx-2 p-10 rounded-[4rem] border-white/10 min-h-[500px]">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-rose-500" />
                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">User Feedbacks</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="FILTER LOGS..." 
                  className="bg-slate-950/60 border border-white/5 rounded-full px-12 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-rose-500/30 w-64"
                />
              </div>
           </div>

           <div className="space-y-4">
              {feedbacks.map((item) => (
                <m.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-rose-500/20 transition-all flex items-center justify-between"
                >
                   <div className="flex items-center gap-6">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {item.status}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white italic">{item.content}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{item.user}</span>
                          <span className="text-[10px] font-black text-slate-700 uppercase">{item.date}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-white"><ArrowUpRight size={16}/></button>
                      <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-rose-400"><Trash2 size={16}/></button>
                   </div>
                </m.div>
              ))}
           </div>
        </GlassCard>
      )}

      {activeTab === 'users' && (
        <GlassCard className="mx-2 p-10 rounded-[4rem] border-white/10 min-h-[500px]">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-rose-500" />
                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Active Patients</h3>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                 <Filter size={14}/> Sort Registry
              </button>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                    <th className="pb-6 px-4">Subject ID</th>
                    <th className="pb-6 px-4">Access Level</th>
                    <th className="pb-6 px-4">Last Sync</th>
                    <th className="pb-6 px-4">Lab Credits</th>
                    <th className="pb-6 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i} className="group hover:bg-white/5 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">P</div>
                          <span className="text-xs font-bold text-white italic">SN-920-{i+1}42</span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                         <span className="px-3 py-1 bg-white/5 rounded-full text-[9px] font-black uppercase text-slate-400">Biometric Tier 2</span>
                      </td>
                      <td className="py-6 px-4 text-xs font-medium italic text-slate-400">14 min ago</td>
                      <td className="py-6 px-4 text-xs font-black text-rose-400 italic">2500</td>
                      <td className="py-6 px-4 text-right">
                         <button className="p-2 text-slate-500 hover:text-white"><MoreHorizontal size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </GlassCard>
      )}
    </div>
  );
};
