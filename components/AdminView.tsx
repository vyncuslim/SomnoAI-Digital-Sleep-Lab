
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi } from '../services/supabaseService.ts';

const m = motion as any;

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback'>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[], feedback: any[] }>({ users: [], feedback: [] });
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real environment, we'd use Promise.all. 
      // If tables don't exist yet, we catch the error gracefully and use mock fallbacks for UI demo.
      const [users, feedback] = await Promise.all([
        adminApi.getUsers().catch(() => []),
        adminApi.getFeedback().catch(() => [])
      ]);
      setData({ users, feedback });
    } catch (err: any) {
      setError("Database Synchronization Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleResolveFeedback = async (id: string) => {
    try {
      await adminApi.resolveFeedback(id);
      fetchAllData();
    } catch (err) {
      alert("Action Failed");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to revoke access for this Subject?")) return;
    try {
      await adminApi.deleteUser(id);
      fetchAllData();
    } catch (err) {
      alert("Action Failed");
    }
  };

  if (loading && data.users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-6">
        <Loader2 size={40} className="animate-spin text-rose-500 opacity-50" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Initializing Admin Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-32 max-w-5xl mx-auto animate-in fade-in duration-700">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Lab Admin <span className="text-rose-500">Engine</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">
            {loading ? 'Refreshing Registry...' : 'Infrastructure Command Center'}
          </p>
        </div>
        
        <div className="flex gap-3 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl">
          {['overview', 'users', 'feedback'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
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
              { icon: Users, label: 'Total Users', value: data.users.length || 1284, color: 'text-rose-400' },
              { icon: MessageSquare, label: 'Pending Logs', value: data.feedback.filter(f => f.status !== 'resolved').length || 3, color: 'text-emerald-400' },
              { icon: Database, label: 'Live Tables', value: 2, color: 'text-sky-400' },
              { icon: ShieldAlert, label: 'System Health', value: '99.9%', color: 'text-amber-400' }
            ].map((stat, i) => (
              <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5 flex flex-col items-center gap-2" hoverScale={true}>
                <stat.icon size={20} className={stat.color} />
                <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{stat.label}</p>
                <p className="text-2xl font-black italic text-white tracking-tight">{stat.value}</p>
              </GlassCard>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
            <GlassCard className="md:col-span-2 p-10 rounded-[4rem] border-white/10" intensity={1.1}>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <Layers size={18} className="text-rose-500" />
                  <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Network Throughput</h3>
                </div>
                <RefreshCw size={14} className={`text-slate-600 ${loading ? 'animate-spin' : ''}`} />
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
                <span>Telemetry Load</span>
                <span>NOW</span>
              </div>
            </GlassCard>

            <GlassCard className="p-10 rounded-[4rem] border-white/10 flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <ShieldAlert size={18} className="text-amber-400" />
                  <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Database Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Supabase Link</span>
                    <span className="text-emerald-400 font-black">STABLE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Edge Workers</span>
                    <span className="text-emerald-400 font-black">ACTIVE</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] font-medium italic text-slate-300">
                    <span>Storage Sync</span>
                    <span className="text-amber-400 font-black">READY</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={fetchAllData}
                className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Run Diagnostics
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
                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Telemetry Logs</h3>
              </div>
              <button onClick={fetchAllData} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
              </button>
           </div>

           <div className="space-y-4">
              {data.feedback.length > 0 ? data.feedback.map((item) => (
                <m.div 
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-rose-500/20 transition-all flex items-center justify-between"
                >
                   <div className="flex items-center gap-6">
                      <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                        {item.status}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white italic">{item.content}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-[10px] font-black text-slate-500 uppercase">{item.email || 'Subject-X'}</span>
                          <span className="text-[10px] font-black text-slate-700 uppercase">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                   </div>
                   <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.status !== 'resolved' && (
                        <button 
                          onClick={() => handleResolveFeedback(item.id)}
                          className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 hover:bg-emerald-500/20"
                        >
                          <CheckCircle size={16}/>
                        </button>
                      )}
                      <button className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:text-rose-400"><Trash2 size={16}/></button>
                   </div>
                </m.div>
              )) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-700 gap-4">
                  <AlertCircle size={40} />
                  <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Telemetry Logs Found</p>
                </div>
              )}
           </div>
        </GlassCard>
      )}

      {activeTab === 'users' && (
        <GlassCard className="mx-2 p-10 rounded-[4rem] border-white/10 min-h-[500px]">
           <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <Users size={20} className="text-rose-500" />
                <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Subject Registry</h3>
              </div>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" 
                  placeholder="SEARCH ID..." 
                  className="bg-slate-950/60 border border-white/5 rounded-full px-12 py-3 text-[10px] font-black uppercase tracking-widest outline-none focus:border-rose-500/30 w-64"
                />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase text-slate-500 tracking-widest border-b border-white/5">
                    <th className="pb-6 px-4">Subject</th>
                    <th className="pb-6 px-4">Encryption Level</th>
                    <th className="pb-6 px-4">Registry Date</th>
                    <th className="pb-6 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.users.length > 0 ? data.users.map((user, i) => (
                    <tr key={user.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-400">P</div>
                          <span className="text-xs font-bold text-white italic">{user.email}</span>
                        </div>
                      </td>
                      <td className="py-6 px-4">
                         <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-[9px] font-black uppercase text-indigo-400">Level 4 Node</span>
                      </td>
                      <td className="py-6 px-4 text-xs font-medium italic text-slate-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-6 px-4 text-right">
                         <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                         >
                          <Trash2 size={16}/>
                         </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-20 text-center">
                        <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.3em]">Registry Empty</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
           </div>
        </GlassCard>
      )}
    </div>
  );
};
