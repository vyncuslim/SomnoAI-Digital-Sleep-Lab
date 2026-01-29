import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'records' | 'security' | 'logs';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  const [data, setData] = useState<{ users: any[], records: any[], feedback: any[], logs: any[], security: SecurityEvent[] }>({ 
    users: [], records: [], feedback: [], logs: [], security: []
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const clearance = await adminApi.getAdminClearance(user.id);
        setCurrentAdmin({ id: user.id, ...clearance });
      }

      const [users, records, feedback, logs, security] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents()
      ]);
      
      setData({ users, records, feedback, logs, security });
    } catch (err: any) {
      console.error("Data Sync Failure:", err);
      setError(err.message || "Sync Error: Neural Registry unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleToggleBlock = async (user: any) => {
    if (isProcessing) return;
    setIsProcessing(user.id);
    try {
      await adminApi.toggleBlock(user.id);
      await fetchAllData();
    } catch (err: any) {
      alert(err.message || "Protocol Refused.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSetRole = async (userId: string, role: string) => {
    if (isProcessing) return;
    setIsProcessing(userId);
    try {
      await adminApi.setRole(userId, role);
      await fetchAllData();
    } catch (err: any) {
      alert(err.message || "Promotion Denied: Insufficient root permission.");
    } finally {
      setIsProcessing(null);
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const currentList = (() => {
      switch(activeTab) {
        case 'users': return data.users;
        case 'records': return data.records;
        case 'security': return data.security;
        case 'logs': return data.logs;
        default: return [];
      }
    })();
    if (!q) return currentList;
    return (currentList || []).filter((item: any) => {
      const searchStr = `${item.email || ''} ${item.id || ''} ${item.role || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  const isOwner = currentAdmin?.role === 'owner';

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-10 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-rose-500/10 rounded-3xl text-slate-400 hover:text-rose-500 transition-all border border-white/5 shadow-xl active:scale-95 group">
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          )}
          <div className="space-y-3 text-left">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">Owner</span> : <span>Lab</span>} <span className={isOwner ? "text-white" : "text-rose-500"}>Command</span>
              {isOwner && <Crown size={32} className="text-amber-500 animate-pulse" />}
            </h1>
            <div className="flex items-center gap-3">
              <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOwner ? 'bg-amber-500' : 'bg-rose-500'}`} />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">
                Clearance: {currentAdmin?.role?.toUpperCase() || 'IDENTIFYING'}
              </p>
            </div>
          </div>
        </div>
        
        <nav className="flex flex-wrap gap-2 bg-slate-950/80 p-1.5 rounded-[2rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          {(['overview', 'users', 'records', 'security', 'logs'] as AdminTab[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === tab ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-rose-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-6">
          <div className="relative">
            <Loader2 className="animate-spin text-rose-500" size={60} />
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-500 italic animate-pulse">Synchronizing Neural Core...</p>
        </div>
      ) : error ? (
        <div className="py-40 text-center space-y-8">
          <ShieldX size={80} className="text-rose-500 mx-auto" />
          <div className="space-y-2">
            <h3 className="text-2xl font-black italic text-white uppercase">Sync Failed</h3>
            <p className="text-sm text-slate-500 italic">{error}</p>
          </div>
          <button onClick={fetchAllData} className="px-10 py-4 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 mx-auto shadow-xl">
            <RefreshCw size={16} /> RE-INITIALIZE HANDSHAKE
          </button>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div 
              key="overview"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2"
            >
               <GlassCard className="p-12 rounded-[4rem] flex flex-col items-center gap-6 text-center group hover:border-rose-500/30 transition-all cursor-default">
                  <div className="p-5 bg-rose-500/10 rounded-3xl text-rose-500 shadow-xl border border-rose-500/20 group-hover:scale-110 transition-transform">
                    <Users size={36} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black text-white italic tracking-tighter">{data.users.length}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Registered Subjects</p>
                  </div>
               </GlassCard>

               <GlassCard className="p-12 rounded-[4rem] flex flex-col items-center gap-6 text-center group hover:border-amber-500/30 transition-all cursor-default">
                  <div className="p-5 bg-amber-500/10 rounded-3xl text-amber-500 shadow-xl border border-amber-500/20 group-hover:scale-110 transition-transform">
                    <ShieldAlert size={36} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black text-white italic tracking-tighter">{data.security.length}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Security Events</p>
                  </div>
               </GlassCard>

               <GlassCard className="p-12 rounded-[4rem] flex flex-col items-center gap-6 text-center group hover:border-indigo-500/30 transition-all cursor-default">
                  <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-500 shadow-xl border border-indigo-500/20 group-hover:scale-110 transition-transform">
                    <FileText size={36} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black text-white italic tracking-tighter">{data.logs.length}</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Audit Records</p>
                  </div>
               </GlassCard>

               <GlassCard className="p-12 rounded-[4rem] flex flex-col items-center gap-6 text-center group hover:border-emerald-500/30 transition-all cursor-default">
                  <div className="p-5 bg-emerald-500/10 rounded-3xl text-emerald-500 shadow-xl border border-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Activity size={36} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-5xl font-black text-white italic tracking-tighter">V16.1</p>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Node Integrity</p>
                  </div>
               </GlassCard>
            </m.div>
          ) : (
            <m.div 
              key="table-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              className="mx-2"
            >
               <GlassCard className="p-10 lg:p-14 rounded-[5rem] border-white/10 overflow-hidden shadow-2xl bg-slate-950/60 backdrop-blur-3xl">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                   <div className="space-y-2 text-left">
                     <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{activeTab} <span className="text-rose-500">Registry</span></h3>
                     <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Authorized Database View</p>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96 group">
                      <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-500 transition-colors" size={20} />
                      <input 
                          type="text" 
                          value={searchQuery} 
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="FILTER IDENTIFIERS..."
                          className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-5 text-[11px] font-black uppercase text-white outline-none focus:border-rose-500/50 shadow-inner transition-all"
                        />
                    </div>
                    <button onClick={fetchAllData} className="p-5 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5 hover:bg-white/10 transition-all shadow-xl">
                      <RefreshCw size={22} />
                    </button>
                   </div>
                 </div>

                 <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.3em] border-b border-white/5 italic">
                          <th className="pb-8 px-6">Subject Origin</th>
                          <th className="pb-8 px-6">Node Clearance</th>
                          <th className="pb-8 px-6">Integrity Status</th>
                          <th className="pb-8 px-6 text-right">Laboratory Commands</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.length > 0 ? filteredItems.map((item: any) => (
                          <tr key={item.id} className="hover:bg-white/[0.03] transition-colors group">
                            <td className="py-8 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-600 border border-white/5 group-hover:border-rose-500/20 transition-all">
                                  <UserCircle size={24} />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-sm font-black text-white italic">{item.email || "ANONYMOUS_SUBJECT"}</p>
                                  <p className="text-[9px] font-mono text-slate-700 uppercase tracking-widest">{item.id}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-8 px-6">
                               <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                                 item.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                 item.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' :
                                 'bg-slate-900 border-white/5 text-slate-600'
                               }`}>
                                 {item.role === 'owner' ? <Crown size={14} /> : item.role === 'admin' ? <ShieldCheck size={14} /> : <User size={14} />}
                                 <span className="text-[10px] font-black uppercase tracking-widest italic">{item.role || 'SUBJECT'}</span>
                               </div>
                            </td>
                            <td className="py-8 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                <span className={`text-[10px] font-black uppercase tracking-widest ${item.is_blocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                                  {item.is_blocked ? 'Suspended' : 'Verified'}
                                </span>
                              </div>
                            </td>
                            <td className="py-8 px-6">
                              <div className="flex justify-end gap-3">
                                {activeTab === 'users' && (
                                  <>
                                    <button 
                                      disabled={!!isProcessing && isProcessing !== item.id}
                                      onClick={() => handleToggleBlock(item)}
                                      className={`p-4 rounded-2xl border transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center ${
                                        item.is_blocked 
                                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' 
                                          : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'
                                      }`}
                                      title={item.is_blocked ? "Unblock Node" : "Block Node"}
                                    >
                                      {isProcessing === item.id ? <Loader2 className="animate-spin" size={20}/> : (item.is_blocked ? <ShieldCheck size={20}/> : <Ban size={20}/>)}
                                    </button>

                                    {isOwner && (
                                      <button 
                                        disabled={!!isProcessing && isProcessing !== item.id}
                                        onClick={() => handleSetRole(item.id, item.role === 'admin' ? 'user' : 'admin')}
                                        className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all active:scale-95 disabled:opacity-20"
                                        title={item.role === 'admin' ? "Revoke Administrative Clearance" : "Promote to Admin"}
                                      >
                                        {isProcessing === item.id ? <Loader2 className="animate-spin" size={20}/> : <KeyRound size={20} />}
                                      </button>
                                    )}
                                  </>
                                )}
                                {activeTab === 'records' && (
                                  <button className="p-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                                    <ArrowUpRight size={20} />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={4} className="py-24 text-center">
                               <div className="space-y-4 opacity-20">
                                 <ShieldQuestion size={60} className="mx-auto" />
                                 <p className="text-[11px] font-black uppercase tracking-[0.6em]">No Matching Records Identified</p>
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
        </AnimatePresence>
      )}
    </div>
  );
};