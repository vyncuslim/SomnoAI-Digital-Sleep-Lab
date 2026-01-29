
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound
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
      setError(err.message || "Sync Error: Neural Registry unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleToggleBlock = async (user: any) => {
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
    return currentList.filter((item: any) => {
      const searchStr = `${item.email} ${item.id} ${item.role}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  return (
    <div className="space-y-12 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-rose-500/10 rounded-3xl text-slate-400 hover:text-rose-500 transition-all border border-white/5 shadow-lg active:scale-95">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-3">
              Lab <span className="text-rose-500">Command</span>
              {currentAdmin?.is_super_owner && <Crown size={28} className="text-amber-400" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Clearance: {currentAdmin?.role?.toUpperCase() || 'IDENTIFYING'}
            </p>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl">
          {(['overview', 'users', 'records', 'security', 'logs'] as AdminTab[]).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="animate-spin text-rose-500" size={48} />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Synchronizing Terminal Data...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
               <GlassCard className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 text-center">
                  <Users size={32} className="text-rose-400" />
                  <p className="text-3xl font-black text-white">{data.users.length}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subjects</p>
               </GlassCard>
               <GlassCard className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 text-center">
                  <ShieldAlert size={32} className="text-amber-400" />
                  <p className="text-3xl font-black text-white">{data.security.length}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Security Pulse</p>
               </GlassCard>
               <GlassCard className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 text-center">
                  <FileText size={32} className="text-indigo-400" />
                  <p className="text-3xl font-black text-white">{data.logs.length}</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Logs</p>
               </GlassCard>
               <GlassCard className="p-10 rounded-[3.5rem] flex flex-col items-center gap-4 text-center">
                  <Activity size={32} className="text-emerald-400" />
                  <p className="text-3xl font-black text-white">V16</p>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">RPC ISOLATION</p>
               </GlassCard>
            </div>
          ) : (
            <div className="mx-2">
               <GlassCard className="p-10 rounded-[4rem] border-white/10 overflow-hidden">
                 <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                   <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{activeTab} Registry</h3>
                   <div className="flex gap-4 w-full md:w-auto">
                    <input 
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SCAN IDENTIFIERS..."
                        className="w-full md:w-80 bg-slate-950/60 border border-white/10 rounded-full px-6 py-4 text-[10px] font-black uppercase text-white outline-none focus:border-rose-500/50"
                      />
                    <button onClick={fetchAllData} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white"><RefreshCw size={18} /></button>
                   </div>
                 </div>

                 <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[10px] font-black uppercase text-slate-600 tracking-widest border-b border-white/5">
                          <th className="pb-6 px-4">Subject</th>
                          <th className="pb-6 px-4">Role</th>
                          <th className="pb-6 px-4">Status</th>
                          <th className="pb-6 px-4 text-right">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item: any) => (
                          <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-6 px-4 text-sm font-bold text-white italic">
                              {item.email || item.id.slice(0,8)}
                            </td>
                            <td className="py-6 px-4">
                               <div className="flex items-center gap-2">
                                 <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                                   item.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                   item.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' :
                                   'bg-slate-800 border-white/5 text-slate-500'
                                 }`}>
                                   {item.role}
                                 </span>
                               </div>
                            </td>
                            <td className="py-6 px-4">
                              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase ${item.is_blocked ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                {item.is_blocked ? 'Suspended' : 'Active'}
                              </span>
                            </td>
                            <td className="py-6 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                {activeTab === 'users' && (
                                  <>
                                    <button 
                                      disabled={isProcessing === item.id}
                                      onClick={() => handleToggleBlock(item)}
                                      className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-rose-500/50 transition-all active:scale-95 disabled:opacity-30"
                                      title={item.is_blocked ? "Unblock Node" : "Block Node"}
                                    >
                                      {isProcessing === item.id ? <Loader2 className="animate-spin" size={16}/> : (item.is_blocked ? <ShieldCheck className="text-emerald-500" size={16}/> : <Ban className="text-rose-500" size={16}/>)}
                                    </button>

                                    {currentAdmin?.role === 'owner' && (
                                      <button 
                                        disabled={isProcessing === item.id}
                                        onClick={() => handleSetRole(item.id, item.role === 'admin' ? 'user' : 'admin')}
                                        className="p-3 bg-white/5 rounded-xl border border-white/10 hover:border-indigo-500/50 transition-all active:scale-95 disabled:opacity-30"
                                      >
                                        <Shield size={16} className="text-indigo-400" />
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               </GlassCard>
            </div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};
