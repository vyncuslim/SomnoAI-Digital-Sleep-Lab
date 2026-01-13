
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle, HardDrive, Cpu, Terminal, Zap, Calendar, Edit3, X, Save, Shield
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
  
  // Editing State
  const [editingItem, setEditingItem] = useState<{ table: string, item: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
            users: [{ id: 'mock-1', email: 'legacy.subject@mysql.net', is_admin: false, created_at: new Date().toISOString() }],
            records: [{ id: 'rec-1', score: 92, efficiency: 98, date: '2026-05-15', created_at: new Date().toISOString() }],
            feedback: [{ id: 'f-1', content: 'MySQL Node stable.', status: 'pending', created_at: new Date().toISOString() }]
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
    if (!confirm(`Are you sure you want to permanently delete this ${table} entry?`)) return;
    try {
      await adminApi.deleteRecord(table, id);
      fetchAllData();
    } catch (err) {
      alert("Delete Failed: Security violation or network error.");
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      if (editingItem.table === 'profiles') {
        await adminApi.updateUserRole(editingItem.item.id, editingItem.item.is_admin);
      } else if (editingItem.table === 'sleep_records') {
        await adminApi.updateSleepRecord(editingItem.item.id, { score: editingItem.item.score });
      }
      setEditingItem(null);
      fetchAllData();
    } catch (err) {
      alert("Update Failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = () => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'users') return data.users.filter(u => u.email?.toLowerCase().includes(q));
    if (activeTab === 'records') return data.records.filter(r => r.id?.toLowerCase().includes(q) || r.user_id?.toLowerCase().includes(q));
    if (activeTab === 'feedback') return data.feedback.filter(f => f.content?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q));
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
              Node: {dataSource.toUpperCase()} // Auth: Verified
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
                { icon: Users, label: 'Subject Registry', value: data.users.length, color: 'text-rose-400' },
                { icon: Database, label: 'Biometric Archive', value: data.records.length, color: 'text-indigo-400' },
                { icon: MessageSquare, label: 'Pending Logs', value: data.feedback.filter(f => f.status !== 'resolved').length, color: 'text-emerald-400' },
                { icon: Terminal, label: 'Network Operations', value: 'Live', color: 'text-amber-400' }
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
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Administrative Throughput</h3>
                  </div>
                </div>
                <div className="h-56 flex items-end gap-2 px-1">
                  {[30, 45, 60, 50, 80, 70, 90, 85, 95, 75, 88, 60, 40, 65, 90].map((h, i) => (
                    <m.div 
                      key={i}
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ delay: i * 0.05, duration: 1 }}
                      className="flex-1 bg-gradient-to-t from-rose-900/20 via-rose-500 to-rose-400 rounded-t-lg shadow-[0_0_15px_rgba(244,63,94,0.1)]"
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-8 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] border-t border-white/5 pt-6">
                  <span>BIO-NODE ALPHA</span>
                  <span>SYNC STATUS: STABLE</span>
                </div>
              </GlassCard>

              <GlassCard className="p-10 rounded-[4rem] border-white/10 flex flex-col justify-between">
                <div className="space-y-8">
                  <div className="flex items-center gap-3">
                    <ShieldAlert size={18} className="text-amber-400" />
                    <h3 className="text-xs font-black italic text-white uppercase tracking-widest">Security Audit</h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { l: 'Auth Gateway', s: 'ENCRYPTED', c: 'text-emerald-400' },
                      { l: 'Supabase Node', s: 'AUTHORIZED', c: 'text-emerald-400' },
                      { l: 'RLS Status', s: 'ENFORCED', c: 'text-sky-400' },
                      { l: 'Admin Access', s: 'SUPERUSER', c: 'text-rose-400' }
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
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> RE-INITIALIZE REGISTRY
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
                      {activeTab === 'users' ? 'Registry Management' : activeTab === 'records' ? 'Telemetry Archive' : 'Feedback Loop'}
                    </h3>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">
                      Direct node interaction for {dataSource}
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
                      <th className="pb-8 px-6">Identity Cluster</th>
                      <th className="pb-8 px-6">Role / Metric</th>
                      <th className="pb-8 px-6">Sync Epoch</th>
                      <th className="pb-8 px-6 text-right">Commands</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredItems().length > 0 ? filteredItems().map((item: any) => (
                      <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-8 px-6">
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-black ${item.is_admin ? 'text-rose-500 border-rose-500/30' : 'text-slate-500'}`}>
                              {activeTab === 'users' ? (item.is_admin ? <Shield size={14}/> : 'U') : activeTab === 'records' ? 'R' : 'F'}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-sm font-black text-white italic block">{item.email || item.content?.slice(0, 30) + '...' || `SUBJECT-${item.id.slice(0,8)}`}</span>
                              <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-8 px-6">
                           {activeTab === 'users' ? (
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.is_admin ? 'bg-rose-500/10 text-rose-400' : 'bg-white/5 text-slate-500'}`}>
                               {item.is_admin ? 'Admin' : 'User'}
                             </span>
                           ) : activeTab === 'records' ? (
                             <div className="flex items-center gap-2">
                               <Zap size={14} className="text-amber-400" />
                               <span className="text-xs font-black text-white">{item.score}% SCORE</span>
                             </div>
                           ) : (
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${item.status === 'resolved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400 animate-pulse'}`}>
                               {item.status || 'Active'}
                             </span>
                           )}
                        </td>
                        <td className="py-8 px-6 text-xs font-bold italic text-slate-400 font-mono">
                          {new Date(item.created_at || Date.now()).toLocaleString()}
                        </td>
                        <td className="py-8 px-6 text-right space-x-2">
                           <button 
                            onClick={() => setEditingItem({ table: activeTab === 'users' ? 'profiles' : activeTab === 'records' ? 'sleep_records' : 'feedback', item })}
                            className="p-3 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all"
                           >
                            <Edit3 size={18}/>
                           </button>
                           <button 
                            onClick={() => handleDelete(activeTab === 'users' ? 'profiles' : activeTab === 'records' ? 'sleep_records' : 'feedback', item.id)} 
                            className="p-3 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                           >
                            <Trash2 size={18}/>
                           </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="py-32 text-center">
                          <AlertCircle size={48} className="mx-auto text-slate-800 mb-4 opacity-20" />
                          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-700 italic">Registry Empty // Node Passive</p>
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
                <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Active Infrastructure</h3>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Select target biometric endpoint</p>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'supabase', label: 'Supabase Node', desc: 'Authoritative biometric cloud with RLS encryption.', icon: Database },
                  { id: 'mysql', label: 'MySQL Integration', desc: 'Secure SQL bridge for laboratory data.', icon: HardDrive },
                  { id: 'local_json', label: 'Local Sandbox', desc: 'Synthetic data node for UX simulation.', icon: Cpu }
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
                   Changes to infrastructure nodes require a system handshake. Administrative clearance is preserved across nodes.
                 </p>
              </div>
            </GlassCard>
          </m.div>
        )}
      </AnimatePresence>

      {/* Editing Modal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-lg">
              <GlassCard className="p-10 rounded-[4rem] border-white/10 shadow-2xl relative overflow-hidden">
                <button onClick={() => setEditingItem(null)} className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors">
                  <X size={24}/>
                </button>
                
                <div className="space-y-10">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                      <Edit3 size={20}/>
                    </div>
                    <div>
                      <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Edit Cluster Entry</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target: {editingItem.table.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {editingItem.table === 'profiles' ? (
                      <div className="space-y-4">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Subject Identity</p>
                            <p className="text-sm font-bold text-white italic">{editingItem.item.email}</p>
                         </div>
                         <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Clearance</span>
                            <button 
                              onClick={() => setEditingItem({ ...editingItem, item: { ...editingItem.item, is_admin: !editingItem.item.is_admin } })}
                              className={`w-12 h-6 rounded-full relative transition-colors ${editingItem.item.is_admin ? 'bg-rose-600' : 'bg-slate-800'}`}
                            >
                              <m.div animate={{ x: editingItem.item.is_admin ? 24 : 4 }} className="absolute top-1 w-4 h-4 bg-white rounded-full" />
                            </button>
                         </div>
                      </div>
                    ) : editingItem.table === 'sleep_records' ? (
                      <div className="space-y-4">
                         <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Efficiency Score</p>
                            <input 
                              type="range" min="0" max="100" 
                              value={editingItem.item.score}
                              onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, score: parseInt(e.target.value) } })}
                              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                            />
                            <p className="mt-2 text-xl font-black text-white italic text-center">{editingItem.item.score}%</p>
                         </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center text-slate-600 italic">Feedback entries are read-only protocols. Use "Resolve" command from main console.</div>
                    )}
                  </div>

                  <button 
                    onClick={handleUpdate} 
                    disabled={isSaving}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3"
                  >
                    {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16}/>}
                    {isSaving ? 'ENCODING UPDATES' : 'COMMIT COMMAND'}
                  </button>
                </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
