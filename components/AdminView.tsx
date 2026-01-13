
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, ExternalLink, ArrowUpRight, 
  Settings, Layers, RefreshCw, Filter, MoreHorizontal,
  CheckCircle, Loader2, AlertCircle, HardDrive, Cpu, Terminal, Zap, Calendar, Edit3, X, Save, Shield, Activity, DatabaseZap, ChevronLeft, ShieldCheck, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi } from '../services/supabaseService.ts';

const m = motion as any;

type DataSource = 'supabase' | 'local_json' | 'mysql';
type AdminTab = 'overview' | 'users' | 'records' | 'feedback' | 'audit_logs';

interface AdminViewProps {
  onBack?: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [dataSource, setDataSource] = useState<DataSource>('supabase');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[], records: any[], feedback: any[], logs: any[] }>({ 
    users: [], records: [], feedback: [], logs: [] 
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 编辑状态
  const [editingItem, setEditingItem] = useState<{ table: string, item: any } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (dataSource === 'supabase') {
        const [users, records, feedback, logs] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getSleepRecords(),
          adminApi.getFeedback(),
          adminApi.getAuditLogs()
        ]);
        setData({ users, records, feedback, logs });
      }
    } catch (err: any) {
      setError(err.message || "Sync Error: Laboratory Node unreachable.");
    } finally {
      setLoading(false);
    }
  }, [dataSource]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleDelete = async (table: string, id: string) => {
    if (!confirm(`Confirm irreversible deletion of record ${id} from ${table}?`)) return;
    try {
      await adminApi.deleteRecord(table, id);
      fetchAllData();
    } catch (err) {
      alert("Encryption mismatch: Revocation failed.");
    }
  };

  const handleUpdate = async () => {
    if (!editingItem) return;
    setIsSaving(true);
    try {
      if (editingItem.table === 'profiles') {
        await adminApi.updateUserRole(editingItem.item.id, editingItem.item.role);
      } else if (editingItem.table === 'sleep_records') {
        await adminApi.updateSleepRecord(editingItem.item.id, { score: editingItem.item.score });
      } else if (editingItem.table === 'feedback') {
        await adminApi.resolveFeedback(editingItem.item.id);
      }
      setEditingItem(null);
      fetchAllData();
    } catch (err) {
      alert("Commit failed: Node authority rejection.");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredItems = () => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'users') return data.users.filter(u => (u.email || u.id).toLowerCase().includes(q));
    if (activeTab === 'records') return data.records.filter(r => r.id?.toLowerCase().includes(q) || r.user_id?.toLowerCase().includes(q));
    if (activeTab === 'feedback') return data.feedback.filter(f => f.content?.toLowerCase().includes(q));
    if (activeTab === 'audit_logs') return data.logs.filter(l => l.action?.toLowerCase().includes(q));
    return [];
  };

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700">
      {/* Admin Command Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-3xl text-rose-500 transition-all border border-rose-500/20 active:scale-95 shadow-lg">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Lab <span className="text-rose-500">Command</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : (error ? 'bg-rose-500' : 'bg-emerald-500')}`} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                Node: {dataSource.toUpperCase()} // Clearance: Superuser
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'records', 'feedback', 'audit_logs'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap ${activeTab === tab ? 'bg-rose-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)]' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </header>

      {error ? (
        <div className="px-4">
          <GlassCard className="p-12 rounded-[4rem] border-rose-500/20 text-center space-y-6">
             <ShieldAlert size={48} className="text-rose-500 mx-auto" />
             <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{error}</p>
             <button onClick={fetchAllData} className="px-8 py-3 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">Retry Handshake</button>
          </GlassCard>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-2">
                {[
                  { icon: Users, label: 'Subject Registry', value: data.users.length, color: 'text-rose-400' },
                  { icon: Database, label: 'Biometric Archive', value: data.records.length, color: 'text-indigo-400' },
                  { icon: MessageSquare, label: 'Feedback Loop', value: data.feedback.filter(f => f.status !== 'resolved').length, color: 'text-emerald-400' },
                  { icon: Terminal, label: 'Audit Logs', value: data.logs.length, color: 'text-amber-400' }
                ].map((stat, i) => (
                  <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center" hoverScale={true}>
                    <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                      <stat.icon size={24} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">{stat.label}</p>
                      <p className="text-3xl font-black italic text-white tracking-tight">{loading ? '...' : stat.value}</p>
                    </div>
                  </GlassCard>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
                <GlassCard className="md:col-span-2 p-12 rounded-[4.5rem] border-white/10" intensity={1.2}>
                  <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-4">
                      <Activity size={20} className="text-rose-500" />
                      <h3 className="text-[11px] font-black italic text-white uppercase tracking-widest">Aggregate Laboratory Telemetry</h3>
                    </div>
                  </div>
                  <div className="h-64 flex items-end gap-3 px-1">
                    {[45, 60, 35, 80, 55, 90, 75, 65, 85, 40, 95, 70, 50, 80, 60].map((h, i) => (
                      <m.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, duration: 1, type: 'spring' }}
                        className="flex-1 bg-gradient-to-t from-rose-900/10 via-rose-500 to-rose-400 rounded-t-xl"
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-10 text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] border-t border-white/5 pt-8">
                    <div className="flex items-center gap-2"><ShieldCheck size={14} className="text-emerald-500" /> RLS: ACTIVE</div>
                    <div>AES-GCM-256</div>
                  </div>
                </GlassCard>

                <GlassCard className="p-10 rounded-[4.5rem] border-white/10 flex flex-col justify-between">
                  <div className="space-y-10">
                    <div className="flex items-center gap-4">
                      <Shield size={20} className="text-amber-400" />
                      <h3 className="text-[11px] font-black italic text-white uppercase tracking-widest">Node Diagnostic</h3>
                    </div>
                    <div className="space-y-6">
                      {[
                        { l: 'Auth Handshake', s: 'STABLE', c: 'text-emerald-400' },
                        { l: 'Encryption Layer', s: 'VERIFIED', c: 'text-emerald-400' },
                        { l: 'Database Sync', s: error ? 'DISCONNECTED' : 'STABLE', c: error ? 'text-rose-500' : 'text-emerald-400' },
                        { l: 'Audit Tracker', s: 'MONITORING', c: 'text-sky-400' }
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
                    <RefreshCw size={16} className={loading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'} /> RE-SYNC ALL NODES
                  </button>
                </GlassCard>
              </div>
            </m.div>
          )}

          {(activeTab === 'users' || activeTab === 'records' || activeTab === 'feedback' || activeTab === 'audit_logs') && (
            <m.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mx-2">
              <GlassCard className="p-12 rounded-[5rem] border-white/10 min-h-[650px] shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-500 border border-rose-500/20">
                      {activeTab === 'users' ? <Users size={28} /> : activeTab === 'records' ? <Database size={28} /> : activeTab === 'feedback' ? <MessageSquare size={28} /> : <Terminal size={28} />}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tight leading-none">
                        {activeTab === 'users' ? 'Subject Registry' : activeTab === 'records' ? 'Biometric Archive' : activeTab === 'feedback' ? 'Feedback Loop' : 'System Audit'}
                      </h3>
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mt-2">
                        Managing {dataSource} laboratory endpoint
                      </p>
                    </div>
                  </div>
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="text" 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SCANNING REGISTRY..." 
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-[11px] font-black uppercase tracking-widest outline-none focus:border-rose-500/50 text-white placeholder:text-slate-800"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">
                        <th className="pb-10 px-8">Identity / Session</th>
                        <th className="pb-10 px-8">Status / Parameter</th>
                        <th className="pb-10 px-8">Timestamp</th>
                        <th className="pb-10 px-8 text-right">Command</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems().length > 0 ? filteredItems().map((item: any) => (
                        <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                          <td className="py-10 px-8">
                            <div className="flex items-center gap-6">
                              <div className={`w-12 h-12 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center font-black transition-all ${item.role === 'admin' ? 'text-rose-500 border-rose-500/40 shadow-[0_0_15px_rgba(225,29,72,0.2)]' : 'text-slate-600'}`}>
                                {activeTab === 'users' ? (item.role === 'admin' ? <ShieldCheck size={18}/> : <UserCheck size={18}/>) : activeTab === 'records' ? <DatabaseZap size={18}/> : <Terminal size={18}/>}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base font-black text-white italic block leading-none mb-2">{item.email || item.content?.slice(0, 35) + '...' || `ID: ${item.id.slice(0,12)}`}</span>
                                <span className="text-[10px] font-mono text-slate-600 uppercase tracking-tighter">HASH: {item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-10 px-8">
                             {activeTab === 'users' ? (
                               <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-colors ${item.role === 'admin' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/10 text-slate-500'}`}>
                                 {item.role || 'User'}
                               </span>
                             ) : activeTab === 'records' ? (
                               <div className="flex items-center gap-3">
                                 <Zap size={16} className="text-amber-400" />
                                 <span className="text-sm font-black text-white">{item.score}% BIO-INDEX</span>
                               </div>
                             ) : (
                               <span className={`px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${item.status === 'resolved' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}>
                                 {item.status || 'Active'}
                               </span>
                             )}
                          </td>
                          <td className="py-10 px-8 text-xs font-bold italic text-slate-500 font-mono">
                            {new Date(item.created_at || Date.now()).toLocaleString()}
                          </td>
                          <td className="py-10 px-8 text-right space-x-3">
                             <button 
                              onClick={() => setEditingItem({ table: activeTab === 'users' ? 'profiles' : activeTab === 'records' ? 'sleep_records' : 'feedback', item: { ...item } })}
                              className="p-3.5 text-slate-600 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-2xl transition-all border border-transparent hover:border-indigo-500/20"
                             >
                              <Edit3 size={20}/>
                             </button>
                             <button 
                              onClick={() => handleDelete(activeTab === 'users' ? 'profiles' : activeTab === 'records' ? 'sleep_records' : 'feedback', item.id)} 
                              className="p-3.5 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all border border-transparent hover:border-rose-500/20"
                             >
                              <Trash2 size={20}/>
                             </button>
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={4} className="py-40 text-center">
                            <AlertCircle size={56} className="mx-auto text-slate-800 mb-6 opacity-20" />
                            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-700 italic">No Laboratory Data Identified</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </m.div>
          )}
        </AnimatePresence>
      )}

      {/* Admin Quick Edit Terminal */}
      <AnimatePresence>
        {editingItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
            <m.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-xl">
              <GlassCard className="p-12 rounded-[5rem] border-white/10 shadow-3xl relative overflow-hidden">
                <button onClick={() => setEditingItem(null)} className="absolute top-10 right-10 text-slate-600 hover:text-white transition-colors">
                  <X size={28}/>
                </button>
                
                <div className="space-y-12">
                  <div className="flex items-center gap-5">
                    <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-500 border border-rose-500/20">
                      <Terminal size={24}/>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Command Override</h3>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Target Node: {editingItem.table.toUpperCase()}</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {editingItem.table === 'profiles' ? (
                      <div className="space-y-6">
                         <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-3">Identity Subject</p>
                            <p className="text-base font-bold text-white italic truncate">{editingItem.item.email || editingItem.item.id}</p>
                         </div>
                         <div className="flex items-center justify-between p-8 bg-white/5 rounded-[2.5rem] border border-white/5">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Access Role Clearance</span>
                            <div className="flex gap-2 p-1 bg-slate-950 rounded-full border border-white/5">
                               {(['user', 'admin'] as const).map(role => (
                                 <button 
                                   key={role}
                                   onClick={() => setEditingItem({ ...editingItem, item: { ...editingItem.item, role } })}
                                   className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${editingItem.item.role === role ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
                                 >
                                   {role}
                                 </button>
                               ))}
                            </div>
                         </div>
                      </div>
                    ) : editingItem.table === 'sleep_records' ? (
                      <div className="space-y-6">
                         <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                            <div className="flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                               <span>Bio-Index Calibration</span>
                               <span className="text-rose-400">{editingItem.item.score}%</span>
                            </div>
                            <input 
                              type="range" min="0" max="100" 
                              value={editingItem.item.score}
                              onChange={(e) => setEditingItem({ ...editingItem, item: { ...editingItem.item, score: parseInt(e.target.value) } })}
                              className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-rose-500"
                            />
                         </div>
                      </div>
                    ) : (
                      <div className="p-10 text-center space-y-6">
                         <p className="text-sm text-slate-500 italic">"Feedback threads are cryptographically locked after submission. Resolution is the only permitted state change."</p>
                         <button 
                            onClick={() => setEditingItem({ ...editingItem, item: { ...editingItem.item, status: 'resolved' } })}
                            className="px-8 py-3 bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all"
                         >
                            Mark as Resolved
                         </button>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={handleUpdate} 
                    disabled={isSaving}
                    className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-rose-500 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18}/>}
                    {isSaving ? 'ENCODING CHANGES...' : 'COMMIT PROTOCOL'}
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
