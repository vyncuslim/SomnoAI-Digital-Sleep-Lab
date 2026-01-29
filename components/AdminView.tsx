
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound, ArrowUpRight,
  Clock, Mail, Fingerprint, Calendar, Zap, AlertTriangle, Cpu,
  // Fix: Renamed Lock to LockIcon to avoid collision with native DOM Lock interface
  Lock as LockIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'security' | 'records';

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
      if (clearance?.is_super_owner) {
        health = await adminApi.getSystemHealth();
      }
      
      setData({ users, security, health });
    } catch (err: any) {
      setError(err.message || "Registry sync failure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const handleToggleBlock = async (targetUser: any) => {
    if (isProcessing) return;

    // 前端权限校验逻辑
    if (targetUser.is_super_owner) {
      alert("CRITICAL ERROR: Super Owner node is immutable.");
      return;
    }
    if (currentAdmin?.role === 'admin' && (targetUser.role === 'admin' || targetUser.role === 'owner')) {
      alert("CLEARANCE ERROR: Admin cannot modify equal or higher clearance nodes.");
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

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 px-4">
        <div className="flex items-center gap-6 text-left">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-rose-500/10 rounded-3xl text-slate-400 hover:text-rose-500 transition-all border border-white/5">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-3">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isSuperOwner ? <span className="text-amber-500">Root</span> : (isOwner ? <span>Owner</span> : <span>Admin</span>)} Command
              {isOwner && <Crown size={32} className="text-amber-400 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isOwner ? 'bg-amber-500' : 'bg-rose-500'}`} />
              NODE_LEVEL: {currentAdmin?.role?.toUpperCase()} {isSuperOwner && '(SUPER)'}
            </p>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-3xl">
          {(['overview', 'users', 'security'] as AdminTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === tab ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <Loader2 className="animate-spin text-rose-500" size={60} />
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Syncing Management Node...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} className="space-y-10 px-2">
               {/* OWNER 专属卡片 */}
               {isSuperOwner && data.health && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-10 rounded-[3rem] border-amber-500/20 bg-amber-500/[0.02] flex items-center gap-8">
                       <div className="p-5 bg-amber-500/10 rounded-2xl text-amber-500"><Cpu size={32} /></div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Handshakes (24h)</p>
                          <p className="text-4xl font-black text-white italic">{data.health.active_sessions_24h}</p>
                       </div>
                    </GlassCard>
                    <GlassCard className="p-10 rounded-[3rem] border-rose-500/20 bg-rose-500/[0.02] flex items-center gap-8">
                       <div className="p-5 bg-rose-500/10 rounded-2xl text-rose-500"><AlertTriangle size={32} /></div>
                       <div className="text-left">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Security Alerts</p>
                          <p className="text-4xl font-black text-white italic">{data.health.security_alerts_total}</p>
                       </div>
                    </GlassCard>
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                     <Users size={36} className="text-rose-400" />
                     <p className="text-5xl font-black text-white italic">{data.users.length}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Global Subjects</p>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                     <Fingerprint size={36} className="text-amber-400" />
                     <p className="text-5xl font-black text-white italic">{data.security.filter(s => s.event_type === 'LOGIN').length}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Audit Flow</p>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                     <ShieldCheck size={36} className="text-indigo-400" />
                     <p className="text-5xl font-black text-white italic">{isSuperOwner ? 'ROOT' : 'ADM'}</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Your Clearance</p>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[3rem] flex flex-col items-center gap-4 text-center">
                     <Activity size={36} className="text-emerald-400" />
                     <p className="text-5xl font-black text-white italic">V18.2</p>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Logic Kernel</p>
                  </GlassCard>
               </div>
            </m.div>
          ) : (
            <m.div key="table-view" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="mx-2">
               <GlassCard className="p-10 rounded-[4rem] border-white/10 overflow-hidden shadow-2xl bg-slate-950/60 backdrop-blur-3xl">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 text-left">
                   <div className="space-y-2">
                     <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{activeTab} <span className="text-rose-500">Registry</span></h3>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Authorized Personnel Only</p>
                   </div>
                   <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                      <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="IDENTIFIER SCAN..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-5 text-[11px] font-black uppercase text-white outline-none focus:border-rose-500/50" />
                    </div>
                    <button onClick={fetchAllData} className="p-5 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5"><RefreshCw size={22} /></button>
                   </div>
                 </div>

                 <div className="overflow-x-auto no-scrollbar text-left">
                    <table className="w-full">
                      <thead>
                        <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.3em] border-b border-white/5 italic">
                          <th className="pb-8 px-6">Identifier</th>
                          <th className="pb-8 px-6">Status / Level</th>
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
                                  <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5">
                                    {isTargetSuper ? <Crown size={24} className="text-amber-500" /> : <UserCircle size={24} />}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-black text-white italic truncate max-w-[180px]">{item.email || "UNKNOWN"}</p>
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
                                   {isTargetSuper ? <ShieldCheck size={14} /> : (item.is_blocked ? <ShieldX size={14} className="text-rose-500" /> : <Shield size={14} />)}
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
                                        <button onClick={() => alert("Role modification protocol pending...")} className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 hover:bg-indigo-500/20"><KeyRound size={20} /></button>
                                      )}
                                    </>
                                  )}
                                  {activeTab === 'security' && (
                                     <div className="p-4 bg-white/5 rounded-2xl text-slate-700 italic text-[10px] uppercase font-black">Audit Valid</div>
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
