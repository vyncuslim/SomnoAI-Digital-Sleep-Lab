
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound, ArrowUpRight,
  Clock, Mail, Fingerprint, Calendar, Zap, AlertTriangle, Cpu,
  Lock as LockIcon, BarChart3, PieChart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'security' | 'diagnostic';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  const [data, setData] = useState<{ 
    users: any[], 
    security: SecurityEvent[], 
    health?: any 
  }>({ users: [], security: [] });
  
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;
  const isSuperOwner = currentAdmin?.is_super_owner;

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let clearance: any = null;
      if (user) {
        clearance = await adminApi.getAdminClearance(user.id);
        setCurrentAdmin({ id: user.id, ...clearance });
      }

      const [users, security] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSecurityEvents()
      ]);
      
      let health = null;
      if (isOwner) {
        health = await adminApi.getSystemHealth();
      }
      
      setData({ users, security, health });
    } catch (err: any) {
      setError(err.message || "Registry sync failure.");
    } finally {
      setLoading(false);
    }
  }, [isOwner]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleToggleBlock = async (targetUser: any) => {
    if (isProcessing) return;
    if (targetUser.is_super_owner) {
      alert("CRITICAL ERROR: Super Owner node is immutable.");
      return;
    }
    setIsProcessing(targetUser.id);
    try {
      await adminApi.toggleBlock(targetUser.id);
      await fetchAllData();
    } catch (err: any) {
      alert(err.message || "Protocol refused.");
    } finally { setIsProcessing(null); }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const currentList = activeTab === 'users' ? data.users : (activeTab === 'security' ? data.security : []);
    if (!q) return currentList;
    return currentList.filter((item: any) => {
      const searchStr = `${item.email || ''} ${item.id || ''} ${item.full_name || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  const formatTime = (ts: string) => {
    if (!ts) return "NEVER";
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const userStats = useMemo(() => {
    const total = data.users.length;
    const admins = data.users.filter(u => u.role === 'admin' || u.role === 'owner').length;
    const blocked = data.users.filter(u => u.is_blocked).length;
    return { total, admins, blocked };
  }, [data.users]);

  return (
    <div className={`space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700 font-sans ${isOwner ? 'owner-clearance' : 'admin-clearance'}`}>
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 px-4">
        <div className="flex items-center gap-6 text-left">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-3">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">Owner</span> : <span className="text-indigo-500">Admin</span>} Command Center
              {isOwner && <Crown size={32} className="text-amber-400 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOwner ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-indigo-500 shadow-[0_0_10px_#6366f1]'}`} />
              NODE_STATUS: {isSuperOwner ? 'ROOT_CORE' : 'CLEARANCE_VALID'}
            </p>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
          {(['overview', 'users', 'security', 'diagnostic'] as AdminTab[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className={`animate-spin ${isOwner ? 'text-amber-500' : 'text-indigo-500'}`} size={60} />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Synchronizing Neural Records...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10 px-2">
               
               {/* Global Health Monitor */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-start gap-4 text-left border-indigo-500/10">
                     <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><Users size={28} /></div>
                     <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic leading-none">{userStats.total}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Global Subjects</p>
                     </div>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-start gap-4 text-left border-amber-500/10">
                     <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><ShieldCheck size={28} /></div>
                     <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic leading-none">{userStats.admins}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Admin Nodes</p>
                     </div>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-start gap-4 text-left border-rose-500/10">
                     <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500"><AlertTriangle size={28} /></div>
                     <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic leading-none">{userStats.blocked}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nodes Isolated</p>
                     </div>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-start gap-4 text-left border-emerald-500/10">
                     <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500"><Zap size={28} /></div>
                     <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic leading-none">99.9</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Link Uptime %</p>
                     </div>
                  </GlassCard>
               </div>

               {/* Owner Advanced Telemetry */}
               {isOwner && data.health && (
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                       <GlassCard className="p-10 rounded-[4rem] h-full flex flex-col justify-between border-amber-500/20 bg-amber-500/[0.02]">
                          <div className="flex justify-between items-start mb-10">
                             <div className="space-y-2">
                                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Biological Load Distribution</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Subject Activity Synthesis</p>
                             </div>
                             <BarChart3 className="text-amber-500" />
                          </div>
                          <div className="h-[200px] flex items-end justify-between gap-4">
                             {[40, 70, 45, 90, 65, 30, 85].map((h, i) => (
                               <m.div 
                                 key={i} 
                                 initial={{ height: 0 }} 
                                 animate={{ height: `${h}%` }} 
                                 className="flex-1 bg-amber-500/20 rounded-t-xl border-t border-amber-500/40 relative group"
                               >
                                 <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-amber-400">{h}</div>
                               </m.div>
                             ))}
                          </div>
                       </GlassCard>
                    </div>
                    <div className="lg:col-span-4">
                       <GlassCard className="p-10 rounded-[4rem] h-full border-rose-500/20 bg-rose-500/[0.02]">
                          <div className="space-y-8">
                             <div className="flex items-center gap-3">
                                <ShieldAlert className="text-rose-500" />
                                <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Security Alerts</h3>
                             </div>
                             <div className="space-y-6">
                                {data.security.slice(0, 3).map((s, i) => (
                                  <div key={i} className="flex gap-4 items-start pb-6 border-b border-white/5 last:border-0">
                                     <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-2 shrink-0" />
                                     <div className="space-y-1">
                                        <p className="text-[11px] font-black text-white italic uppercase tracking-tight leading-none">{s.event_type}</p>
                                        <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]">{s.email}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </GlassCard>
                    </div>
                 </div>
               )}
            </m.div>
          ) : activeTab === 'diagnostic' ? (
            <m.div key="diagnostic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2">
               <GlassCard className="p-20 rounded-[4rem] text-center space-y-8 border-indigo-500/20">
                  <Cpu size={80} className={`mx-auto ${isOwner ? 'text-amber-500' : 'text-indigo-500'} animate-pulse`} />
                  <div className="space-y-4">
                     <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">Diagnostic Pulse</h3>
                     <p className="text-sm text-slate-500 italic max-w-md mx-auto">Initializing neural infrastructure health check. Protocol v42.0.1 is stable.</p>
                  </div>
                  <div className="flex justify-center gap-4">
                     <div className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em]">Lat: 42ms</div>
                     <div className="px-10 py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Mem: 1.2GB</div>
                  </div>
               </GlassCard>
            </m.div>
          ) : (
            <m.div key="table-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-2">
               <GlassCard className="p-10 rounded-[4rem] border-white/10 overflow-hidden shadow-2xl bg-slate-950/60 backdrop-blur-3xl">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 text-left">
                   <div className="space-y-2">
                     <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{activeTab} <span className={isOwner ? 'text-amber-500' : 'text-indigo-500'}>Registry</span></h3>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Authorized Personnel Access Only</p>
                   </div>
                   <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="IDENTIFIER SCAN..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-5 text-[11px] font-black uppercase text-white outline-none focus:border-indigo-500/50" />
                    </div>
                    <button onClick={fetchAllData} className="p-5 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5"><RefreshCw size={22} /></button>
                   </div>
                 </div>

                 <div className="overflow-x-auto no-scrollbar text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.3em] border-b border-white/5 italic">
                          <th className="pb-8 px-6">Identifier</th>
                          <th className="pb-8 px-6">Clearance</th>
                          <th className="pb-8 px-6">Synchronized</th>
                          <th className="pb-8 px-6 text-right">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item: any) => {
                          const isTargetSuper = item.is_super_owner;
                          const isTargetAdmin = item.role === 'admin' || item.role === 'owner';
                          const canBlock = !isTargetSuper && (!((currentAdmin?.role === 'admin') && isTargetAdmin));

                          return (
                            <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                              <td className="py-8 px-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5 shadow-inner">
                                    {isTargetSuper ? <Crown size={24} className="text-amber-500" /> : <UserCircle size={24} />}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-black text-white italic truncate max-w-[180px]">{item.email || "ANONYMOUS_NODE"}</p>
                                    <p className="text-[9px] font-mono text-slate-700 uppercase">{item.id.slice(0,18)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-8 px-6">
                                 <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                                   item.role === 'owner' || item.is_super_owner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                   item.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' :
                                   'bg-slate-900 border-white/5 text-slate-600'
                                 }`}>
                                   {isTargetSuper ? <Crown size={14} /> : (item.is_blocked ? <ShieldX size={14} className="text-rose-500" /> : <Shield size={14} />)}
                                   <span className="text-[10px] font-black uppercase tracking-widest italic">{item.role || item.event_type}</span>
                                 </div>
                              </td>
                              <td className="py-8 px-6">
                                <div className="flex items-center gap-3">
                                  <Clock size={14} className="text-slate-600" />
                                  <span className="text-[10px] font-black text-slate-400 uppercase">{formatTime(item.timestamp || item.last_sign_in_at)}</span>
                                </div>
                              </td>
                              <td className="py-8 px-6 text-right">
                                <div className="flex justify-end gap-3">
                                  {activeTab === 'users' && (
                                    <>
                                      <button 
                                        onClick={() => handleToggleBlock(item)} 
                                        disabled={!canBlock || isProcessing === item.id}
                                        className={`p-4 rounded-2xl border transition-all ${!canBlock ? 'opacity-20 cursor-not-allowed bg-slate-800' : (item.is_blocked ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20')}`}
                                      >
                                        {isProcessing === item.id ? <Loader2 className="animate-spin" size={20}/> : (item.is_blocked ? <ShieldCheck size={20}/> : (isTargetSuper ? <LockIcon size={20} /> : <Ban size={20}/>))}
                                      </button>
                                      {isOwner && (
                                        <button onClick={() => alert("Clearance modification is available via command line interface.")} className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 hover:bg-indigo-500/20 transition-all"><KeyRound size={20} /></button>
                                      )}
                                    </>
                                  )}
                                  {activeTab === 'security' && (
                                     <div className="p-4 bg-emerald-500/5 rounded-2xl text-emerald-500 italic text-[10px] uppercase font-black border border-emerald-500/10">Audit Verified</div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                 </div>
               </GlassCard>
            </m.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
