import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, Terminal as TerminalIcon, X, Cpu,
  Activity, Fingerprint, Lock, CheckCircle2,
  List, Unlock, Mail, ActivitySquare, 
  AlertTriangle, Database, Search, ShieldX, 
  TrendingUp, Server, Plus, Clock, Terminal, ChevronDown, Copy, Check, Radio, Shield, Key, Smartphone, Monitor, Globe
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

const ROLES = ['user', 'admin', 'owner'];

// Helper to parse security telemetry strings for structured display
const parseSecurityTelemetry = (details: string) => {
  if (!details) return null;
  const data: Record<string, string> = {};
  const lines = details.split('\n');
  lines.forEach(line => {
    if (line.includes(': ')) {
      const [key, ...rest] = line.split(': ');
      data[key.trim().toLowerCase()] = rest.join(': ').trim();
    }
  });
  return Object.keys(data).length > 0 ? data : null;
};

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [pulseData, setPulseData] = useState<any | null>(null);
  
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [registrySearch, setRegistrySearch] = useState('');
  const [modifyingUserId, setModifyingUserId] = useState<string | null>(null);
  
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);
  
  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [uRes, tRes, aRes, rRes] = await Promise.allSettled([
        adminApi.getUsers(),
        supabase.from('analytics_daily').select('*').order('date', { ascending: true }).limit(14),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(100),
        adminApi.getNotificationRecipients()
      ]);

      setUsers(uRes.status === 'fulfilled' ? (uRes as any).value : []);
      setTrafficData(tRes.status === 'fulfilled' && (tRes as any).value.data ? (tRes as any).value.data : []);
      setAuditLogs(aRes.status === 'fulfilled' && (aRes as any).value.data ? (aRes as any).value.data : []);
      setRecipients(rRes.status === 'fulfilled' ? (rRes as any).value.data : []);
      
      const counts: Record<string, number> = {};
      for (const t of DATABASE_SCHEMA) {
        try { counts[t.id] = await adminApi.getTableCount(t.id); } catch(e) { counts[t.id] = 0; }
      }
      setTableCounts(counts);

      const pRes = await fetch(`/api/monitor-pulse?secret=${CRON_SECRET}`);
      if (pRes.ok) setPulseData(await pRes.json());

    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
        const is403 = response.status === 403 || (data.error && data.error.includes('permission'));
        setSyncState(is403 ? 'FORBIDDEN' : 'ERRORED');
        setActionError(data.error || "Sync protocol violation.");
        
        if (data.diagnostic) {
          setPulseData((prev: any) => ({ 
            ...prev, 
            service_account_email: data.diagnostic.service_account, 
            property_id: data.diagnostic.property_id 
          }));
        }
      }
    } catch (e: any) {
      setSyncState('ERRORED');
      setActionError(e.message);
    }
  };

  const getActionPermission = (target: any): { canAction: boolean; reason?: string } => {
    if (!currentAdmin) return { canAction: false, reason: 'PENDING_AUTH' };
    if (target.is_super_owner) return { canAction: false, reason: 'ROOT_IMMUNITY' };
    if (target.id === currentAdmin.id) return { canAction: false, reason: 'SELF_PRESERVATION' };

    const myRole = currentAdmin.is_super_owner ? 'super' : currentAdmin.role;
    const targetRole = target.role;

    if (myRole === 'super') return { canAction: true };
    if (myRole === 'owner') {
      const allowed = targetRole === 'admin' || targetRole === 'user';
      return { canAction: allowed, reason: allowed ? undefined : 'LEVEL_INSUFFICIENT' };
    }
    if (myRole === 'admin') {
      const allowed = targetRole === 'user';
      return { canAction: allowed, reason: allowed ? undefined : 'LEVEL_INSUFFICIENT' };
    }

    return { canAction: false, reason: 'LEVEL_INSUFFICIENT' };
  };

  const handleRoleChange = async (userId: string, email: string, newRole: string) => {
    setModifyingUserId(userId);
    try {
      const { error } = await adminApi.updateUserRole(userId, email, newRole);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e: any) { setActionError(e.message); } finally { setModifyingUserId(null); }
  };

  const handleToggleBlock = async (userId: string, email: string, currentlyBlocked: boolean) => {
    setModifyingUserId(userId);
    try {
      const { error } = await adminApi.toggleBlock(userId, email, currentlyBlocked);
      if (error) throw error;
      setUsers(users.map(u => u.id === userId ? { ...u, is_blocked: !currentlyBlocked } : u));
    } catch (e: any) { setActionError(e.message); } finally { setModifyingUserId(null); }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipientEmail.trim() || isAddingRecipient) return;
    setIsAddingRecipient(true);
    try {
      const { error } = await adminApi.addNotificationRecipient(newRecipientEmail, 'Custom Node');
      if (error) throw error;
      setNewRecipientEmail('');
      const rRes = await adminApi.getNotificationRecipients();
      setRecipients(rRes.data);
    } catch (e: any) { setActionError(e.message); } finally { setIsAddingRecipient(false); }
  };

  const status = (() => {
    switch(syncState) {
      case 'IDLE': return { label: 'CONNECTED', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck, pulse: true };
      case 'RUNNING': return { label: 'SYNCHRONIZING', color: 'text-indigo-400', bg: 'bg-indigo-600/20', icon: RefreshCw, spin: true };
      case 'SYNCED': return { label: 'UP TO DATE', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: CheckCircle2 };
      case 'FORBIDDEN': return { label: 'ACCESS_DENIED', color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldX, pulse: true };
      default: return { label: 'ERRORED', color: 'text-rose-500', bg: 'bg-rose-600/20', icon: AlertTriangle };
    }
  })();

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-white transform rotate-12">
        <TerminalIcon size={400} strokeWidth={0.5} />
      </div>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8 relative z-10">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-1 text-left">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Bridge <span className="text-indigo-500">Terminal</span></h1>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full border text-[8px] font-black uppercase tracking-widest ${currentAdmin?.is_super_owner ? 'bg-amber-500/20 border-amber-500/40 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>
                ACCESS: {currentAdmin?.is_super_owner ? 'ROOT_SUPER_OWNER' : currentAdmin?.role?.toUpperCase() || 'SYNCHRONIZING'}
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
               {tab === 'signals' ? 'Security Signals' : tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full animate-pulse" />
              <Loader2 className="animate-spin text-indigo-500 relative z-10" size={64} />
            </div>
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Authority Matrix...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-12">
            
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DATABASE_SCHEMA.map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5 hover:border-indigo-500/20 transition-all duration-500">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20"><stat.icon size={20} /></div>
                        <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest italic">DB_PTR</span>
                      </div>
                      <p className="text-5xl font-black text-white italic tracking-tighter leading-none">{tableCounts[stat.id] || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-4 flex items-center gap-2">
                        {stat.name}
                      </p>
                    </GlassCard>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8">
                    <GlassCard className="p-10 rounded-[4rem] border-white/5 h-full relative overflow-hidden" intensity={1.1}>
                      <div className="flex justify-between items-center mb-12">
                         <div className="flex items-center gap-4">
                           <TrendingUp size={20} className="text-indigo-400" />
                           <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Traffic Telemetry</h3>
                         </div>
                      </div>
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={trafficData}>
                            <defs>
                              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'rgba(148, 163, 184, 0.4)', fontSize: 9, fontWeight: 900 }} dy={15} />
                            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#chartGrad)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </GlassCard>
                  </div>

                  <div className="lg:col-span-4">
                    <GlassCard className="p-10 rounded-[4rem] border-white/5 h-full flex flex-col justify-between gap-10 bg-indigo-600/[0.02]">
                       <div className="space-y-6 text-left">
                          <div className={`w-16 h-16 rounded-3xl border border-white/5 flex items-center justify-center ${status.bg} ${status.color} shadow-2xl`}>
                             <ActivitySquare size={28} className={status.spin ? 'animate-spin' : ''} />
                          </div>
                          <div>
                             <h3 className="text-xl font-black italic text-white uppercase tracking-tight leading-tight">GA4 Synchronizer</h3>
                             <div className={`inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full border border-white/5 ${status.bg}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''}`} />
                                <span className={`text-[9px] font-black uppercase tracking-widest ${status.color}`}>{status.label}</span>
                             </div>
                          </div>
                       </div>
                       <button onClick={handleManualSync} disabled={syncState === 'RUNNING'} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl italic active:scale-95 disabled:opacity-30">
                         {syncState === 'RUNNING' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} REFRESH GRID
                       </button>
                    </GlassCard>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-8 px-2">
                <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                  <div className="relative w-full max-w-xl">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                     <input 
                        type="text" 
                        value={registrySearch} 
                        onChange={(e) => setRegistrySearch(e.target.value)} 
                        placeholder="Search Identity Registry..." 
                        className="w-full bg-slate-950 border border-white/10 rounded-full pl-16 pr-14 py-5 text-sm text-white focus:border-indigo-500/50 outline-none italic font-bold placeholder:text-slate-700 transition-all shadow-2xl" 
                     />
                  </div>
                </div>

                <GlassCard className="rounded-[3rem] border-white/5 overflow-hidden shadow-2xl bg-black/20">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-white/5 bg-white/[0.01]">
                          <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest italic whitespace-nowrap">Identity Node</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest italic whitespace-nowrap">Clearance Level</th>
                          <th className="px-8 py-6 text-[9px] font-black text-slate-600 uppercase tracking-widest italic whitespace-nowrap text-right">Channel Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredUsers.map((u) => {
                          const actionAuth = getActionPermission(u);
                          const canAction = actionAuth.canAction;
                          const roleStyle = u.is_super_owner ? { label: 'ROOT', color: 'text-amber-500', bg: 'bg-amber-500/10' } : u.role === 'owner' ? { label: 'OWNER', color: 'text-indigo-400', bg: 'bg-indigo-400/10' } : u.role === 'admin' ? { label: 'ADMIN', color: 'text-slate-200', bg: 'bg-white/10' } : { label: 'USER', color: 'text-slate-500', bg: 'bg-white/5' };
                          
                          return (
                            <tr key={u.id} className="hover:bg-white/[0.01] transition-colors group">
                              <td className="px-8 py-7">
                                <div className="flex items-center gap-5">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white italic font-black shrink-0 border ${u.is_super_owner ? 'bg-amber-500 border-amber-400' : 'bg-slate-900 border-white/10'}`}>
                                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm font-black italic text-white uppercase tracking-tight flex items-center gap-2">{u.full_name || 'ANONYMOUS'}{u.is_super_owner && <Crown size={12} className="text-amber-500" />}</p>
                                    <p className="text-[10px] font-mono text-slate-700">{u.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-8 py-7">
                                {canAction && !u.is_super_owner ? (
                                  <div className="relative inline-block">
                                    <select 
                                      value={u.role}
                                      onChange={(e) => handleRoleChange(u.id, u.email, e.target.value)}
                                      className={`appearance-none bg-slate-900 border border-white/10 rounded-full px-6 py-2 text-[10px] font-black uppercase tracking-widest text-white outline-none cursor-pointer hover:border-indigo-500/50 transition-all pr-10`}
                                    >
                                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                    </select>
                                    <ChevronDown size={12} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                                  </div>
                                ) : (
                                  <div className={`inline-block px-4 py-1.5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest italic ${roleStyle.color} ${roleStyle.bg}`}>{roleStyle.label}</div>
                                )}
                              </td>
                              <td className="px-8 py-7 text-right">
                                <div className="flex items-center justify-end gap-6">
                                    <div className={`w-2 h-2 rounded-full ${u.is_blocked ? 'bg-rose-600' : 'bg-emerald-500'} animate-pulse`} />
                                    <button 
                                      disabled={!canAction} 
                                      onClick={() => handleToggleBlock(u.id, u.email, !!u.is_blocked)} 
                                      className={`p-3 rounded-2xl border transition-all ${!canAction ? 'opacity-10 cursor-not-allowed' : 'hover:bg-rose-500/10 hover:border-rose-500/30 text-slate-500 hover:text-rose-500'}`}
                                      title={actionAuth.reason || 'Execute Protocol'}
                                    >
                                      {u.is_blocked ? <Unlock size={18} /> : <Ban size={18} />}
                                    </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="space-y-8 px-2 max-w-5xl mx-auto">
                <div className="flex items-center justify-between px-2 text-left">
                   <div className="flex items-center gap-5">
                      <div className="p-4 bg-indigo-500/10 rounded-3xl text-indigo-400 border border-indigo-500/20 shadow-xl shadow-indigo-900/10">
                        <Shield size={28} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Security Signal Archive</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold italic mt-1">Telemetry Monitoring: Active Node</p>
                      </div>
                   </div>
                   <div className="flex gap-4">
                      <div className="flex items-center gap-2 px-5 py-2 bg-rose-500/10 border border-rose-500/20 rounded-full text-rose-500">
                         <Radio size={10} className="animate-pulse" />
                         <span className="text-[8px] font-black uppercase tracking-widest">Real-time Feed</span>
                      </div>
                   </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {auditLogs.filter(l => l.action === 'USER_LOGIN' || l.level === 'CRITICAL' || l.action === 'SECURITY_BREACH').length > 0 ? (
                    auditLogs.filter(l => l.action === 'USER_LOGIN' || l.level === 'CRITICAL' || l.action === 'SECURITY_BREACH').map((log) => {
                      const isLogin = log.action === 'USER_LOGIN';
                      const parsed = isLogin ? parseSecurityTelemetry(log.details) : null;
                      const deviceType = parsed?.device?.toLowerCase();
                      const isMobile = deviceType?.includes('mobile') || deviceType?.includes('android') || deviceType?.includes('iphone');
                      
                      return (
                        <GlassCard key={log.id} className="p-8 rounded-[3rem] border-white/5 hover:bg-white/[0.02] transition-all group overflow-hidden relative">
                          {log.level === 'CRITICAL' && <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-600 animate-pulse shadow-[0_0_15px_rgba(225,29,72,0.5)]" />}
                          {isLogin && <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/40" />}
                          
                          <div className="flex items-start gap-8">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${log.level === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-indigo-500/5 border-indigo-500/20 text-indigo-400'} shadow-inner`}>
                               {log.level === 'CRITICAL' ? <ShieldAlert size={28} className="animate-pulse" /> : isLogin ? <Key size={28} /> : <List size={28} />}
                            </div>
                            
                            <div className="flex-1 space-y-6">
                              <div className="flex flex-wrap items-center justify-between">
                                 <div className="flex flex-wrap items-center gap-3">
                                   <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border italic ${isLogin ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' : 'bg-slate-950 border-white/10 text-slate-500'}`}>
                                     {log.action.replace('_', ' ')}
                                   </span>
                                   <span className="text-[10px] font-mono text-slate-600 flex items-center gap-2 bg-black/40 px-3 py-1 rounded-lg border border-white/5">
                                     <Clock size={12} className="text-slate-700" /> {new Date(log.created_at).toLocaleString()}
                                   </span>
                                   {log.level === 'CRITICAL' && <span className="px-3 py-1 bg-rose-600 text-white text-[8px] font-black uppercase rounded-full tracking-widest animate-pulse">Critical Alert</span>}
                                 </div>
                              </div>
                              
                              <div className="bg-black/40 p-8 rounded-[2.5rem] border border-white/5 group-hover:border-white/10 transition-colors">
                                 {isLogin && parsed ? (
                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                      <div className="space-y-5">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400"><Fingerprint size={18} /></div>
                                            <div className="space-y-0.5">
                                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Target Node</p>
                                               <p className="text-sm font-bold text-white italic truncate max-w-[200px]">{parsed.subject || 'UNREGISTERED'}</p>
                                               <p className="text-[10px] font-mono text-slate-500">{parsed.identity}</p>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><Crown size={18} /></div>
                                            <div className="space-y-0.5">
                                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Clearance Level</p>
                                               <p className="text-xs font-black text-amber-400 uppercase italic tracking-widest">{parsed.clearance}</p>
                                            </div>
                                         </div>
                                      </div>
                                      <div className="space-y-5">
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                               {isMobile ? <Smartphone size={18} /> : <Monitor size={18} />}
                                            </div>
                                            <div className="space-y-0.5 flex-1 min-w-0">
                                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Origin Terminal</p>
                                               <p className="text-[10px] font-mono text-emerald-400/80 break-all leading-tight italic line-clamp-2">{parsed.device || 'Inferred Client'}</p>
                                            </div>
                                         </div>
                                         <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400"><Globe size={18} /></div>
                                            <div className="space-y-0.5">
                                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Channel Status</p>
                                               <div className="flex items-center gap-2">
                                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                                                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Access Verified</span>
                                               </div>
                                            </div>
                                         </div>
                                      </div>
                                   </div>
                                 ) : (
                                   <p className="text-sm font-bold italic text-slate-300 leading-relaxed whitespace-pre-wrap font-mono">
                                     {log.details}
                                   </p>
                                 )}
                              </div>

                              <div className="flex items-center gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                 <Terminal size={12} className="text-slate-500" />
                                 <span className="text-[8px] font-mono text-slate-600 uppercase tracking-[0.2em]">Signal Reference: {log.id.slice(0, 16).toUpperCase()}</span>
                              </div>
                            </div>
                          </div>
                        </GlassCard>
                      );
                    })
                  ) : (
                    <div className="py-32 flex flex-col items-center justify-center opacity-20 gap-6 border-2 border-dashed border-white/5 rounded-[4rem]">
                       <Radio size={48} className="text-slate-500" />
                       <p className="text-[11px] font-black uppercase tracking-[0.5em] italic">No active security signals detected</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="space-y-12 px-2">
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 space-y-10 text-left">
                       <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/5 bg-slate-900/10 relative overflow-hidden">
                          <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8 relative z-10">
                             <Mail size={24} className="text-indigo-400" />
                             <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Alert Node Matrix</h3>
                          </div>
                          
                          <div className="space-y-8 relative z-10">
                             <form onSubmit={handleAddRecipient} className="flex flex-col sm:flex-row gap-4 bg-black/60 p-2.5 rounded-full border border-white/10 shadow-2xl">
                                <input type="email" value={newRecipientEmail} onChange={(e) => setNewRecipientEmail(e.target.value)} placeholder="Node Registry Email..." className="flex-1 bg-transparent px-8 py-4 outline-none text-sm text-white font-bold italic" required />
                                <button type="submit" disabled={isAddingRecipient} className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-4 rounded-full font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
                                   {isAddingRecipient ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} className="inline mr-2" />} BIND NODE
                                </button>
                             </form>

                             <div className="grid grid-cols-1 gap-4 pt-4">
                                {recipients.map((r) => (
                                  <div key={r.id} className="flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-3xl hover:border-indigo-500/20 transition-all group">
                                     <div className="flex items-center gap-5">
                                        <div className="p-2.5 bg-slate-900 rounded-xl"><Server size={18} className="text-slate-600" /></div>
                                        <p className="text-sm font-black italic text-white leading-none">{r.email}</p>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                       </GlassCard>
                    </div>

                    <div className="lg:col-span-5 space-y-10 text-left">
                       <GlassCard className="p-10 md:p-14 rounded-[4rem] border-indigo-500/20 h-full relative overflow-hidden" intensity={1.5}>
                          <div className="flex items-center gap-4 mb-10 border-b border-white/5 pb-8">
                             <Cpu size={24} className="text-indigo-400" />
                             <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Core Diagnostics</h3>
                          </div>

                          <div className="space-y-10 relative z-10">
                             <div className="space-y-6">
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest flex items-center gap-2 italic">
                                  <div className="w-1 h-1 rounded-full bg-indigo-500" /> Service Account Email
                                </p>
                                <div className="px-6 py-5 bg-black/60 rounded-3xl border border-white/5 shadow-inner">
                                  <p className="text-[10px] font-black text-indigo-400 italic break-all leading-relaxed">
                                    {pulseData?.service_account_email || 'PROBING...'}
                                  </p>
                                </div>
                             </div>

                             <div className="pt-10 border-t border-white/5 space-y-5">
                                <div className="flex justify-between items-center">
                                   <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Database Link</span>
                                   <div className="flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[9px] font-black uppercase">
                                     ONLINE
                                   </div>
                                </div>
                             </div>
                          </div>
                       </GlassCard>
                    </div>
                 </div>
              </div>
            )}

            {actionError && (
              <div className="p-8 bg-rose-600/10 border border-rose-500/30 rounded-[3rem] flex items-center gap-6 mx-2">
                 <div className="p-4 bg-rose-600 text-white rounded-2xl shadow-lg"><AlertTriangle size={24} /></div>
                 <div className="space-y-1 flex-1 text-left">
                   <p className="text-xs font-black text-rose-500 uppercase tracking-widest italic">Exception Protocol</p>
                   <p className="text-sm font-bold text-rose-400 italic">{actionError}</p>
                 </div>
                 <button onClick={() => setActionError(null)} className="p-3 text-rose-400 hover:text-white transition-colors bg-white/5 rounded-xl"><X size={20} /></button>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};