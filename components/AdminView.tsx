
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle, HardDrive, Cpu, Terminal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi } from '../services/supabaseService.ts';

const m = motion as any;

type DataSource = 'supabase' | 'local_json' | 'mysql';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'feedback' | 'data_source'>('overview');
  const [dataSource, setDataSource] = useState<DataSource>('supabase');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[], feedback: any[] }>({ users: [], feedback: [] });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (dataSource === 'supabase') {
        const [users, feedback] = await Promise.all([
          adminApi.getUsers().catch(() => []),
          adminApi.getFeedback().catch(() => [])
        ]);
        setData({ users, feedback });
      } else {
        // Mocking Local JSON / MySQL response
        setTimeout(() => {
          setData({
            users: [
              { id: '1', email: 'mock.subject@lab.io', created_at: new Date().toISOString() },
              { id: '2', email: 'guest.773@virtual.net', created_at: new Date().toISOString() }
            ],
            feedback: [
              { id: '1', content: 'Synthetic telemetry loop detected.', status: 'pending', created_at: new Date().toISOString() }
            ]
          });
          setLoading(false);
        }, 800);
      }
    } catch (err: any) {
      setError("Database Synchronization Failed");
    } finally {
      if (dataSource === 'supabase') setLoading(false);
    }
  }, [dataSource]);

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

  const filteredUsers = data.users.filter(u => u.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Lab Command <span className="text-rose-500">Center</span></h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Node: {dataSource.toUpperCase()} // Status: Secure
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-slate-900/60 p-1 rounded-full border border-white/5 backdrop-blur-3xl shadow-xl">
          {['overview', 'users', 'feedback', 'data_source'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${activeTab === tab ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'data_source' && <Database size={12} />}
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Areas */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <m.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
              {[
                { icon: Users, label: 'Registered Subjects', value: data.users.length, color: 'text-rose-400' },
                { icon: MessageSquare, label: 'Unresolved Logs', value: data.feedback.filter(f => f.status !== 'resolved').length, color: 'text-emerald-400' },
                { icon: HardDrive, label: 'Storage Node', value: dataSource === 'supabase' ? 'Cloud' : 'Edge', color: 'text-sky-400' },
                { icon: Cpu, label: 'Neural Latency', value: '18ms', color: 'text-amber-400' }
              ].map((stat, i) => (
                <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-3 text-center" hoverScale={true}>
                  <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                    <stat.icon size={22} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black italic text-white tracking-tight">{loading ? '...' : stat.value}</p>
                  </div>
                </GlassCard>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
              <GlassCard className="md:col-span-2 p-10 rounded-[4rem] border-white/10" intensity={1.1}>
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <Layers size={18} className="text-rose-500" />
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Biometric Throughput</h3>
                  </div>
                  <div className="flex gap-2">
                    <div className="px-3 py-1 bg-rose-500/10 rounded-full text-[9px] font-black text-rose-400 uppercase tracking-widest">Live Flow</div>
                  </div>
                </div>
                <div className="h-56 flex items-end gap-2.5 px-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 80, 100, 75, 88].map((h, i) => (
                    <m.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-rose-900/40 via-rose-600 to-rose-400 rounded-t-xl"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] border-t border-white/5 pt-6">
                  <span>T-24H SCAN</span>
                  <span className="text-rose-500/50 italic font-medium tracking-tight uppercase">Registry Telemetry Sync Active</span>
                  <span>RT-NODE-ALPHA</span>
                </div>
              </GlassCard>

              <GlassCard className="p-10 rounded-[4rem] border-white/10 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-amber-400" />
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">System Diagnostics</h3>
                  </div>
                  <div className="space-y-5">
                    {[
                      { l: 'Auth Gateway', s: 'Online', c: 'text-emerald-400' },
                      { l: 'Database Link', s: dataSource === 'supabase' ? 'Stable' : 'Mock', c: 'text-sky-400' },
                      { l: 'Encryption', s: 'AES-256', c: 'text-slate-400' },
                      { l: 'SSL Cert', s: 'Valid', c: 'text-emerald-400' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold tracking-widest uppercase">
                        <span className="text-slate-500">{row.l}</span>
                        <span className={`${row.c} font-black`}>{row.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={fetchAllData}
                  className="w-full py-5 mt-10 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
                >
                  <RefreshCw size={14} className={`group-hover:rotate-180 transition-transform ${loading ? 'animate-spin' : ''}`} /> Run Global Audit
                </button>
              </GlassCard>
            </div>
          </m.div>
        )}

        {activeTab === 'users' && (
          <m.div key="users" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-2">
            <GlassCard className="p-12 rounded-[5rem] border-white/10 min-h-[600px] shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Subject Registry</h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Management of all laboratory subjects</p>
                  </div>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="IDENTIFY SUBJECT..." 
                    className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-rose-500/50 text-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] border-b border-white/5">
                      <th className="pb-8 px-6">Subject Identity</th>
                      <th className="pb-8 px-6">Node Clearance</th>
                      <th className="pb-8 px-6">Registration Epoch</th>
                      <th className="pb-8 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                      <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-8 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-black text-rose-500">S</div>
                            <div>
                              <span className="text-sm font-black text-white italic block">{user.email}</span>
                              <span className="text-[9px] font-mono text-slate-600 uppercase">{user.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-6">
                           <span className="px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[9px] font-black uppercase text-indigo-400 tracking-widest italic">Biometric Node v2</span>
                        </td>
                        <td className="py-8 px-6 text-xs font-bold italic text-slate-400 font-mono">
                          {new Date(user.created_at).toLocaleString()}
                        </td>
                        <td className="py-8 px-6 text-right">
                           <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                           >
                            <Trash2 size={20}/>
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-32 text-center">
                          <div className="flex flex-col items-center gap-4 text-slate-700">
                            <AlertCircle size={48} className="opacity-20" />
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No Subjects Identified in Registry</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </m.div>
        )}

        {activeTab === 'feedback' && (
          <m.div key="feedback" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="mx-2">
            <GlassCard className="p-12 rounded-[5rem] border-white/10 min-h-[600px] shadow-2xl">
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Telemetry Feedback</h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">Direct feedback from biometric subjects</p>
                  </div>
                </div>
                <button onClick={fetchAllData} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all shadow-xl">
                  <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {data.feedback.length > 0 ? data.feedback.map((item) => (
                  <m.div 
                    key={item.id}
                    layout
                    className="group p-8 bg-slate-950/40 rounded-[3rem] border border-white/5 hover:border-rose-500/30 transition-all flex items-center justify-between"
                  >
                    <div className="flex items-start gap-8">
                      <div className={`mt-1.5 w-3 h-3 rounded-full ${item.status === 'resolved' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                      <div className="space-y-2">
                        <p className="text-lg font-black text-white italic leading-tight max-w-2xl">"{item.content}"</p>
                        <div className="flex items-center gap-5">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.email || 'Anonymous Subject'}</span>
                          <span className="text-[10px] font-black text-slate-700 uppercase font-mono">{new Date(item.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {item.status !== 'resolved' && (
                        <button 
                          onClick={() => handleResolveFeedback(item.id)}
                          className="px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all"
                        >
                          <CheckCircle size={14} className="inline mr-2" /> Mark Resolved
                        </button>
                      )}
                      <button className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-600 hover:text-rose-500 hover:border-rose-500/30 transition-all"><Trash2 size={18}/></button>
                    </div>
                  </m.div>
                )) : (
                  <div className="flex flex-col items-center justify-center py-32 text-slate-800 gap-6">
                    <div className="p-8 bg-white/5 rounded-full">
                      <Terminal size={48} className="opacity-20" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.5em] italic">No Telemetry Anomalies Reported</p>
                  </div>
                )}
              </div>
            </GlassCard>
          </m.div>
        )}

        {activeTab === 'data_source' && (
          <m.div key="data_source" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-2 max-w-2xl mx-auto">
            <GlassCard className="p-12 rounded-[4rem] border-white/10 space-y-10 shadow-2xl">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Backend Infrastructure</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select your primary laboratory data node</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'supabase', label: 'Supabase Cloud (PostgreSQL)', desc: 'Enterprise-grade real-time biometric database.', icon: Database, color: 'text-emerald-400' },
                  { id: 'mysql', label: 'MySQL Integration', desc: 'Custom enterprise SQL node for private datasets.', icon: HardDrive, color: 'text-sky-400' },
                  { id: 'local_json', label: 'Local JSON Simulation', desc: 'Synthetic data environment for sandbox testing.', icon: Cpu, color: 'text-amber-400' }
                ].map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setDataSource(source.id as any)}
                    className={`w-full p-8 rounded-[2.5rem] border text-left transition-all flex items-center gap-6 group ${dataSource === source.id ? 'bg-rose-600/10 border-rose-500 text-white shadow-xl shadow-rose-950/20' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                  >
                    <div className={`p-4 rounded-2xl ${dataSource === source.id ? 'bg-rose-600 text-white' : 'bg-white/5'} transition-colors`}>
                      <source.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic uppercase tracking-widest mb-1">{source.label}</h4>
                      <p className="text-[10px] font-medium text-slate-500 leading-relaxed italic">{source.desc}</p>
                    </div>
                    <div className="ml-auto">
                      {dataSource === source.id && <div className="w-4 h-4 rounded-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]" />}
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-4">
                 <ShieldAlert size={20} className="text-indigo-400 shrink-0" />
                 <p className="text-[10px] text-slate-400 italic leading-relaxed">
                   Switching data nodes re-initializes all registry cursors. Ensure you have properly configured environmental variables for SQL integrations.
                 </p>
              </div>
            </GlassCard>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
