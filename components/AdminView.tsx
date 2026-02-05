import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, Globe, Terminal as TerminalIcon, X, Cpu,
  Activity, ChevronRight, Fingerprint, Lock, 
  List, Unlock, Mail, ExternalLink, ActivitySquare, Copy, Check, 
  AlertTriangle, Database, Search, ShieldX, 
  TrendingUp, LinkIcon, HelpCircle, Info, ShieldHalf, UserMinus, Shield,
  LockKeyhole, UserCog, UserSearch, Ghost
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'registry' | 'signals' | 'system';
type SyncState = 'IDLE' | 'RUNNING' | 'SYNCED' | 'ERRORED' | 'FORBIDDEN';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: ShieldAlert },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users }
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  
  const [users, setUsers] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [registrySearch, setRegistrySearch] = useState('');
  const [modifyingUserId, setModifyingUserId] = useState<string | null>(null);
  
  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [uRes, tRes] = await Promise.allSettled([
        adminApi.getUsers(),
        supabase.from('analytics_daily').select('*').order('date', { ascending: true }).limit(14)
      ]);

      setUsers(uRes.status === 'fulfilled' ? (uRes as any).value : []);
      setTrafficData(tRes.status === 'fulfilled' && (tRes as any).value.data ? (tRes as any).value.data : []);
      
      const counts: Record<string, number> = {};
      for (const t of DATABASE_SCHEMA) {
        try { counts[t.id] = await adminApi.getTableCount(t.id); } catch(e) { counts[t.id] = 0; }
      }
      setTableCounts(counts);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Robust Search Implementation (useMemo for performance)
  const filteredUsers = useMemo(() => {
    const term = registrySearch.toLowerCase().trim();
    if (!term) return users;
    return users.filter(u => {
      const name = (u.full_name || '').toLowerCase();
      const email = (u.email || '').toLowerCase();
      return name.includes(term) || email.includes(term);
    });
  }, [users, registrySearch]);

  const handleManualSync = async () => {
    if (syncState === 'RUNNING') return;
    setSyncState('RUNNING');
    setActionError(null);

    try {
      const response = await fetch(`/api/sync-analytics?secret=${CRON_SECRET}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSyncState('SYNCED');
        await fetchData(); 
        setTimeout(() => setSyncState('IDLE'), 4000);
      } else {
        setSyncState(response.status === 403 ? 'FORBIDDEN' : 'ERRORED');
        setActionError(data.error || "Sync protocol violation.");
      }
    } catch (e: any) {
      setSyncState('ERRORED');
      setActionError(e.message);
    }
  };

  const handleRoleChange = async (userId: string, email: string, newRole: string) => {
    setModifyingUserId(userId);
    try {
      const { error } = await adminApi.updateUserRole(userId, email, newRole);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setModifyingUserId(null);
    }
  };

  const handleToggleBlock = async (userId: string, email: string, currentlyBlocked: boolean) => {
    setModifyingUserId(userId);
    try {
      const { error } = await adminApi.toggleBlock(userId, email, currentlyBlocked);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: !currentlyBlocked } : u));
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setModifyingUserId(null);
    }
  };

  const getActionPermission = (target: any) => {
    if (!currentAdmin) return { canAction: false, reason: 'PENDING_AUTH' };
    if (target.is_super_owner) return { canAction: false, reason: 'ROOT_IMMUNITY' };
    if (target.id === currentAdmin.id) return { canAction: false, reason: 'SELF_PRESERVATION' };

    const myRole = currentAdmin.is_super_owner ? 'super' : currentAdmin.role;
    const targetRole = target.role;

    if (myRole === 'super') return { canAction: true };
    if (myRole === 'owner') {
      if (targetRole === 'owner') return { canAction: false, reason: 'RANK_PARITY' };
      return { canAction: true };
    }
    if (myRole === 'admin') {
      if (targetRole === 'owner' || targetRole === 'admin') return { canAction: false, reason: 'RANK_INSUFFICIENT' };
      return { canAction: true };
    }
    return { canAction: false, reason: 'NO_ADMIN_CLEARANCE' };
  };

  const status = (() => {
    switch(syncState) {
      case 'IDLE': return { label: 'CONNECTED', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck, pulse: true };
      case 'RUNNING': return { label: 'SYNCHRONIZING', color: 'text-indigo-400', bg: 'bg-indigo-600/20', icon: RefreshCw, spin: true };
      case 'SYNCED': return { label: 'UP TO DATE', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: Check };
      case 'FORBIDDEN': return { label: 'ACCESS DENIED', color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldX, pulse: true };
      default: return { label: 'ERRORED', color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldX };
    }
  })();

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-1 md:space-y-2 text-left">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Bridge <span className="text-indigo-500">Terminal</span></h1>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Access Identity:</span>
              <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${currentAdmin?.is_super_owner ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : currentAdmin?.role === 'owner' ? 'bg-amber-400/10 border-amber-400/30 text-amber-400' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                {currentAdmin?.is_super_owner ? 'ROOT_SUPER_OWNER' : currentAdmin?.role?.toUpperCase() || 'SYNCHRONIZING'}
              </div>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {['overview', 'registry', 'signals', 'system'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as AdminTab)} 
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-500" size={60} />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Authority Matrix...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-10">
            
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DATABASE_SCHEMA.map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><stat.icon size={20} /></div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">DB_ENTRY</span>
                      </div>
                      <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{tableCounts[stat.id] || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">{stat.group || 'System Data'}</p>
                    </GlassCard>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8">
                    <GlassCard className="p-10 rounded-[4rem] border-white/5 h-full">
                      <div className="flex items-center gap-3 mb-12">
                         <TrendingUp size={18} className="text-indigo-400" />
                         <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Traffic Telemetry</h3>
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trafficData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.4)', fontSize: 9, fontWeight: 900 }} dy={15} />
                            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="rgba(99,102,241,0.1)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-4">
                    <GlassCard className="p-10 rounded-[4rem] border-white/5 h-full flex flex-col justify-between gap-10">
                       <div className="space-y-6">
                          <div className={`w-16 h-16 rounded-3xl border border-white/5 flex items-center justify-center ${status.bg} ${status.color}`}>
                             <ActivitySquare size={28} className={status.spin ? 'animate-spin' : ''} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black italic text-white uppercase tracking-tight">GA4 Sync Bridge</h3>
                             <div className={`inline-flex items-center gap-2 mt-2 px-4 py-1.5 rounded-full border border-white/5 ${status.bg}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                             </div>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-relaxed italic">Synchronize global laboratory records with GA4 cloud telemetry node.</p>
                       </div>
                       <button onClick={handleManualSync} disabled={syncState === 'RUNNING'} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl italic active:scale-95 disabled:opacity-30">
                         {syncState === 'RUNNING' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} REFRESH NODES
                       </button>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-8">
                <div className="relative max-w-xl mx-2">
                   <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 pointer-events-none" size={20} />
                   <input 
                      type="text" 
                      value={registrySearch} 
                      onChange={(e) => setRegistrySearch(e.target.value)} 
                      placeholder="Filter by Name or Email..." 
                      className="w-full bg-slate-900/60 border border-white/10 rounded-full pl-16 pr-14 py-5 text-sm text-white focus:border-indigo-500/50 outline-none italic font-bold placeholder:text-slate-700 transition-all shadow-inner" 
                   />
                   {registrySearch && (
                     <button 
                       onClick={() => setRegistrySearch('')}
                       className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                     >
                       <X size={18} />
                     </button>
                   )}
                </div>

                <GlassCard className="rounded-[4rem] border-white/5 overflow-hidden mx-2 shadow-2xl">
                  <div className="overflow-x-auto min-h-[300px]">
                    {filteredUsers.length > 0 ? (
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-white/5 bg-white/[0.02]">
                            <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Identity</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Node Authority</th>
                            <th className="px-8 py-6 text-[9px] font-black text-slate-500 uppercase tracking-widest italic whitespace-nowrap">Channel Protocol</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {filteredUsers.map((u) => {
                            const { canAction, reason } = getActionPermission(u);
                            const canEditRole = !u.is_super_owner && (currentAdmin?.is_super_owner || currentAdmin?.role === 'owner');

                            const roleStyle = u.is_super_owner 
                              ? { label: 'ROOT', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]' }
                              : u.role === 'owner'
                              ? { label: 'OWNER', color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20' }
                              : u.role === 'admin'
                              ? { label: 'ADMIN', color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20' }
                              : { label: 'USER', color: 'text-slate-400', bg: 'bg-white/5', border: 'border-white/5' };

                            return (
                              <tr key={u.id} className={`hover:bg-white/[0.01] transition-colors group ${u.is_blocked ? 'bg-rose-500/[0.02]' : ''}`}>
                                <td className="px-8 py-7">
                                  <div className="flex items-center gap-4">
                                    <div className={`w-11 h-11 rounded-[1.25rem] flex items-center justify-center text-white italic font-black shrink-0 shadow-lg ${u.is_super_owner ? 'bg-amber-500' : u.role === 'owner' ? 'bg-amber-600' : u.role === 'admin' ? 'bg-indigo-600' : 'bg-slate-800'}`}>
                                      {(u.full_name || u.email || '?')[0].toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-black italic text-white uppercase tracking-tight flex items-center gap-2">
                                        {u.full_name || 'ANONYMOUS'}
                                        {u.is_super_owner && <Crown size={12} className="text-amber-500" />}
                                      </p>
                                      <p className="text-[10px] font-mono text-slate-600">{u.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-8 py-7">
                                  <div className="relative w-32">
                                      {canEditRole ? (
                                        <select 
                                          disabled={modifyingUserId === u.id}
                                          value={u.role}
                                          onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                                          className={`w-full bg-slate-950 border rounded-full px-4 py-2 text-[10px] font-black uppercase tracking-widest outline-none focus:border-indigo-500/50 appearance-none cursor-pointer hover:text-white transition-all italic ${roleStyle.color} ${roleStyle.border}`}
                                        >
                                          <option value="user" className="text-slate-400">User</option>
                                          <option value="admin" className="text-indigo-400">Admin</option>
                                          <option value="owner" className="text-amber-400">Owner</option>
                                        </select>
                                      ) : (
                                        <div className={`px-4 py-2 rounded-full border text-[10px] font-black uppercase text-center italic ${roleStyle.color} ${roleStyle.bg} ${roleStyle.border}`}>
                                          {roleStyle.label}
                                        </div>
                                      )}
                                      {modifyingUserId === u.id && (
                                        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2"><Loader2 size={12} className="animate-spin text-indigo-400" /></div>
                                      )}
                                  </div>
                                </td>
                                <td className="px-8 py-7">
                                  <div className="flex items-center gap-6">
                                      <div className="flex items-center gap-2 min-w-[100px]">
                                        <div className={`w-1.5 h-1.5 rounded-full ${u.is_blocked ? 'bg-rose-500 shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'} animate-pulse`} />
                                        <span className={`text-[9px] font-black uppercase tracking-widest ${u.is_blocked ? 'text-rose-500' : 'text-emerald-400'}`}>{u.is_blocked ? 'VOID_LINK' : 'OPERATIONAL'}</span>
                                      </div>
                                      
                                      <button 
                                        disabled={!canAction || modifyingUserId === u.id}
                                        onClick={() => handleToggleBlock(u.id, u.email, !!u.is_blocked)}
                                        title={!canAction ? `Denied: ${reason}` : (u.is_blocked ? 'Activate Node' : 'Sever Node')}
                                        className={`p-2.5 rounded-xl border transition-all active:scale-90 ${
                                          !canAction 
                                            ? 'bg-slate-900 border-white/5 text-slate-800 cursor-not-allowed opacity-40' 
                                            : u.is_blocked 
                                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20' 
                                              : 'bg-rose-500/10 border-rose-500/20 text-rose-400 hover:bg-rose-500/20 shadow-lg shadow-rose-950/20'
                                        }`}
                                      >
                                        {!canAction ? <Lock size={16} /> : u.is_blocked ? <Unlock size={16} /> : <Ban size={16} />}
                                      </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-32 space-y-6 opacity-40">
                         <Ghost size={60} className="text-slate-600" />
                         <div className="text-center space-y-2">
                           <p className="text-sm font-black italic text-white uppercase tracking-widest">No Matches Found</p>
                           <p className="text-[10px] font-mono text-slate-500 uppercase">Search criteria yielded zero results in Subject Registry.</p>
                         </div>
                      </div>
                    )}
                  </div>
                </GlassCard>
              </div>
            )}

            {actionError && (
              <div className="p-6 bg-rose-600/10 border border-rose-500/20 rounded-[2rem] flex items-center gap-4 mx-2">
                 <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                 <p className="text-[11px] font-bold text-rose-400 italic uppercase tracking-wider">Exception Protocol: {actionError}</p>
                 <button onClick={() => setActionError(null)} className="ml-auto p-2 text-rose-400 hover:text-white transition-colors"><X size={16} /></button>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};