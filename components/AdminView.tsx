
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle, HardDrive, Cpu, Terminal, Zap, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi } from '../services/supabaseService.ts';

const m = motion as any;

type DataSource = 'supabase' | 'local_json' | 'mysql';
type AdminTab = 'overview' | 'users' | 'records' | 'feedback' | 'data_source';

export const AdminView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dataSource, setDataSource] = useState<DataSource>('supabase');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[], records: any[], feedback: any[] }>({ users: [], records: [], feedback: [] });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (dataSource === 'supabase') {
        const [users, records, feedback] = await Promise.all([
          adminApi.getUsers().catch(() => []),
          adminApi.getSleepRecords().catch(() => []),
          adminApi.getFeedback().catch(() => [])
        ]);
        setData({ users, records, feedback });
      } else {
        // Mocking alternate data sources
        setTimeout(() => {
          setData({
            users: [{ id: 'mock-1', email: 'legacy.subject@mysql.net', created_at: new Date().toISOString() }],
            records: [{ id: 'rec-1', score: 92, efficiency: 98, date: '2026-05-15' }],
            feedback: [{ id: 'f-1', content: 'MySQL Node stable.', status: 'pending' }]
          });
          setLoading(false);
        }, 800);
      }
    } catch (err: any) {
      setError("Sync Error: Node disconnected.");
    } finally {
      if (dataSource === 'supabase') setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDelete = async (table: any, id: string) => {
    if (!confirm("Revoke this entry?")) return;
    try {
      await adminApi.deleteRecord(table, id);
      fetchAllData();
    } catch (err) {
      alert("Delete Failed");
    }
  };

  const filteredItems = () => {
    if (activeTab === 'users') return data.users.filter(u => u.email?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeTab === 'records') return data.records.filter(r => r.id?.toLowerCase().includes(searchQuery.toLowerCase()));
    if (activeTab === 'feedback') return data.feedback.filter(f => f.content?.toLowerCase().includes(searchQuery.toLowerCase()));
    return [];
  };

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Admin Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase">Lab <span className="text-rose-500">Command</span></h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Node: {dataSource.toUpperCase()} // Port: 443
            </p>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-slate-900/60 p-1 rounded-full border border-white/5 backdrop-blur-3xl shadow-xl overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'records', 'feedback', 'data_source'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </header>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <m.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
              {[
                { icon: Users, label: 'Registered Subjects', value: data.users.length, color: 'text-rose-400' },
                { icon: Database, label: 'Sleep Records', value: data.records.length, color: 'text-indigo-400' },
                { icon: MessageSquare, label: 'Unresolved Logs', value: data.feedback.filter(f => f.status !== 'resolved').length, color: 'text-emerald-400' },
                { icon: Terminal, label: 'Sync Ops', value: '42k', color: 'text-amber-400' }
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
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Global Telemetry Flow</h3>
                  </div>
                </div>
                <div className="h-56 flex items-end gap-2 px-1">
                  {[30, 45, 60, 50, 80, 70, 90, 85, 95, 75, 88, 60, 40, 65, 90].map((h, i) => (
                    <m.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-rose-900/20 via-rose-500 to-rose-400 rounded-t-lg"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] border-t border-white/5 pt-6">
                  <span>BIO-NODE ALPHA</span>
                  <span>SYNC STATUS: OPTIMAL</span>
                </div>
              </GlassCard>

              <GlassCard className="p-10 rounded-[4rem] border-white/10 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-amber-400" />
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">System Health</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { l: 'Auth Gateway', s: 'ONLINE', c: 'text-emerald-400' },
                      { l: 'Supabase DB', s: 'STABLE', c: 'text-emerald-400' },
                      { l: 'Edge Latency', s: '12ms', c: 'text-sky-400' },
                      { l: 'Encryption', s: 'AES-256', c: 'text-slate-400' }
                    ].map((row, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                        <span className="text-slate-500">{row.l}</span>
                        <span className={row.c}>{row.s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button 
                  onClick={fetchAllData}
                  className="w-full py-5 mt-10 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all flex items-center justify-center gap-3 group"
                >
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> RE-SCAN ALL NODES
                </button>
              </GlassCard>
            </div>
          </m.div>
        )}

        {(activeTab === 'users' || activeTab === 'records' || activeTab === 'feedback') && (
          <m.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-2">
            <GlassCard className="p-12 rounded-[5rem] border-white/10 min-h-[600px] shadow-2xl">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500">
                    {activeTab === 'users' ? <Users size={24} /> : activeTab === 'records' ? <Database size={24} /> : <MessageSquare size={24} />}
                  </div>
                  <div>
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">
                      {activeTab === 'users' ? 'Subject Registry' : activeTab === 'records' ? 'Biometric Records' : 'Anomalous Logs'}
                    </h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                      Manage lab data streams from {dataSource}
                    </p>
                  </div>
                </div>
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SCAN REGISTRY..." 
                    className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-rose-500/50 text-white"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] border-b border-white/5">
                      <th className="pb-8 px-6">Identity</th>
                      <th className="pb-8 px-6">Status / Value</th>
                      <th className="pb-8 px-6">Timestamp</th>
                      <th className="pb-8 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredItems().length > 0 ? filteredItems().map((item: any) => (
                      <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-8 px-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-rose-500 font-black">
                              {activeTab === 'users' ? 'U' : activeTab === 'records' ? 'R' : 'F'}
                            </div>
                            <div>
                              <span className="text-sm font-black text-white italic block">{item.email || item.content || `RECORD-${item.id.slice(0,5)}`}</span>
                              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-6">
                           {activeTab === 'records' ? (
                             <div className="flex items-center gap-2">
                               <Zap size={14} className="text-amber-400" />
                               <span className="text-xs font-black text-white">{item.score}% EFFICIENCY</span>
                             </div>
                           ) : (
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'}`}>
                               {item.status || 'Active Node'}
                             </span>
                           )}
                        </td>
                        <td className="py-8 px-6 text-xs font-bold italic text-slate-400 font-mono">
                          {new Date(item.created_at || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-8 px-6 text-right">
                           <button onClick={() => handleDelete(activeTab === 'users' ? 'profiles' : activeTab === 'records' ? 'sleep_records' : 'feedback', item.id)} className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                            <Trash2 size={20}/>
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-32 text-center">
                          <AlertCircle size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">No Registry Entries Found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </m.div>
        )}

        {activeTab === 'data_source' && (
          <m.div key="data_source" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mx-auto max-w-2xl px-2">
            <GlassCard className="p-12 rounded-[4rem] border-white/10 space-y-10 shadow-2xl">
              <div className="text-center space-y-2">
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Node Configuration</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select primary biometric data source</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'supabase', label: 'Supabase Cloud (PostgreSQL)', desc: 'Real-time cloud database for live lab deployments.', icon: Database },
                  { id: 'mysql', label: 'MySQL Enterprise', desc: 'Secure legacy integration for private data nodes.', icon: HardDrive },
                  { id: 'local_json', label: 'Local JSON Simulation', desc: 'Synthetic environment for UI/UX testing.', icon: Cpu }
                ].map((source) => (
                  <button
                    key={source.id}
                    onClick={() => setDataSource(source.id as any)}
                    className={`w-full p-8 rounded-[2.5rem] border text-left transition-all flex items-center gap-6 ${dataSource === source.id ? 'bg-rose-600/10 border-rose-500 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10'}`}
                  >
                    <div className={`p-4 rounded-2xl ${dataSource === source.id ? 'bg-rose-600 text-white' : 'bg-white/5'}`}>
                      <source.icon size={24} />
                    </div>
                    <div>
                      <h4 className="text-sm font-black italic uppercase tracking-widest mb-1">{source.label}</h4>
                      <p className="text-[10px] font-medium leading-relaxed italic opacity-60">{source.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-4">
                 <ShieldAlert size={20} className="text-indigo-400 shrink-0" />
                 <p className="text-[10px] text-slate-400 italic leading-relaxed">
                   Switching nodes resets the telemetry cursor. Ensure your connection strings are configured in the system environment.
                 </p>
              </div>
            </GlassCard>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
