
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, MapPin, Layers, 
  CheckCircle, UserCircle, CheckCircle2, WifiOff, Info, Key, AlertCircle, Clock, TrendingUp, Activity,
  ChevronRight, Send, Smartphone, BarChart3, Fingerprint, PieChart,
  Lock, Table, List, Filter, Database as DbIcon, Code2, ExternalLink,
  ShieldQuestion, Unlock, User, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { trackConversion } from '../services/analytics.ts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE';

const DATABASE_SCHEMA = [
  { id: 'analytics_country', group: 'Traffic (GA4)', icon: Globe },
  { id: 'analytics_daily', group: 'Traffic (GA4)', icon: Activity },
  { id: 'analytics_device', group: 'Traffic (GA4)', icon: Smartphone },
  { id: 'analytics_realtime', group: 'Traffic (GA4)', icon: Zap },
  { id: 'audit_logs', group: 'System Audit', icon: List },
  { id: 'security_events', group: 'Security', icon: ShieldAlert },
  { id: 'login_attempts', group: 'Security', icon: KeyRound },
  { id: 'profiles', group: 'Core Registry', icon: UserCircle },
  { id: 'user_data', group: 'Core Registry', icon: Fingerprint },
  { id: 'user_app_status', group: 'Core Registry', icon: ShieldCheck },
  { id: 'diary_entries', group: 'Lab Data', icon: MessageSquare },
  { id: 'feedback', group: 'Lab Data', icon: Send },
  { id: 'health_raw_data', group: 'Lab Data', icon: Database },
  { id: 'sleep_records', group: 'Lab Data', icon: Monitor },
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  // Registry State
  const [users, setUsers] = useState<any[]>([]);
  const [registrySearch, setRegistrySearch] = useState('');
  const [processingUserId, setProcessingUserId] = useState<string | null>(null);
  const [roleSelectUserId, setRoleSelectUserId] = useState<string | null>(null);
  
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // Stats
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  
  // Table Editor State
  const [selectedTable, setSelectedTable] = useState<string>('profiles');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [tableSearch, setTableSearch] = useState('');
  
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setRoleSelectUserId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const checkSyncStatus = async () => {
    try {
      // 1. Check explicit sync logs
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('action, timestamp')
        .in('action', ['GA4_SYNC_SUCCESS', 'GA4_SYNC_ERROR'])
        .order('timestamp', { ascending: false })
        .limit(1);
      
      if (logs?.[0]) {
        const syncDate = new Date(logs[0].timestamp);
        setLastSyncTime(syncDate.toLocaleTimeString());
        const diffMs = new Date().getTime() - syncDate.getTime();
        const isStale = diffMs > 1000 * 60 * 60 * 24; 
        
        if (logs[0].action === 'GA4_SYNC_SUCCESS') {
          setSyncState(isStale ? 'STALE' : 'SYNCED');
          return;
        } else if (logs[0].action === 'GA4_SYNC_ERROR') {
          setSyncState('ERROR');
          return;
        }
      }

      // 2. Deep Scan for resident data if no logs found
      const { data: residentData } = await supabase
        .from('analytics_daily')
        .select('id')
        .limit(1);
      
      setSyncState(residentData && residentData.length > 0 ? 'DATA_RESIDENT' : 'IDLE');
    } catch (e) {
      setSyncState('IDLE');
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);
      trackConversion('admin_access');

      const [d, s, u] = await Promise.all([
        adminApi.getDailyAnalytics(30),
        adminApi.getSecurityEvents(30),
        adminApi.getUsers()
      ]);

      setDailyStats(d || []);
      setSignals(s || []);
      setUsers(u || []);
      
      const counts: Record<string, number> = {};
      await Promise.all(DATABASE_SCHEMA.map(async (t) => {
        try { counts[t.id] = await adminApi.getTableCount(t.id); } catch { counts[t.id] = 0; }
      }));
      setTableCounts(counts);
      await checkSyncStatus();
    } catch (err: any) {
      setActionError(err.message || "Registry synchronization failure.");
      setSyncState('ERROR');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);
  useEffect(() => {
    if (activeTab === 'explorer') fetchSelectedTableData(selectedTable);
  }, [activeTab, selectedTable]);

  const fetchSelectedTableData = async (tableName: string) => {
    setTableLoading(true);
    try {
      const data = await adminApi.getTableData(tableName);
      setTableData(data || []);
    } catch (e: any) {
      setActionError(`Explorer Error: ${e.message}`);
    } finally {
      setTableLoading(false);
    }
  };

  const handleManualSync = async () => {
    setSyncState('SYNCING');
    try {
      const secret = prompt("ENTER_SYNC_PROTOCOL_SECRET:");
      if (!secret) {
        setSyncState('IDLE');
        await checkSyncStatus();
        return;
      }
      const response = await fetch('/api/sync-analytics', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      if (response.ok) {
        alert("SYNC_SIGNAL_CONFIRMED: Telemetry grid refreshed.");
        fetchData();
      } else {
        throw new Error("GATEWAY_DENIED: Handshake verification failed.");
      }
    } catch (e: any) {
      setActionError(e.message);
      setSyncState('ERROR');
    }
  };

  const handleToggleBlock = async (user: any) => {
    if (user.is_super_owner) {
      logAuditLog('ROOT_NODE_PROTECTION_TRIGGER', `Attempted restriction of ROOT node: ${user.email} by ${currentAdmin?.email}`, 'CRITICAL');
      setActionError("SECURITY_VIOLATION: Root node is write-protected.");
      return;
    }
    if (!confirm(`CONFIRM_SECURITY_OVERRIDE: Restrict access for ${user.email}?`)) return;
    
    setProcessingUserId(user.id);
    try {
      const { error } = await adminApi.toggleBlock(user.id, user.email, user.is_blocked);
      if (error) throw error;
      await fetchData();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const handleSetRole = async (user: any, newRole: string) => {
    if (user.is_super_owner) {
      logAuditLog('SECURITY_BREACH_ATTEMPT', `CRITICAL: Attempted role modification of ROOT node: ${user.email} (Target: ${newRole}) by ${currentAdmin?.email}`, 'CRITICAL');
      setActionError("RESTRICTED_PROTOCOL: Root node clearance cannot be shifted.");
      setRoleSelectUserId(null);
      return;
    }

    if (!isOwner) return;
    if (user.role === newRole) {
      setRoleSelectUserId(null);
      return;
    }

    setProcessingUserId(user.id);
    setRoleSelectUserId(null);
    try {
      const { error } = await adminApi.updateUserRole(user.id, user.email, newRole);
      if (error) throw error;
      await fetchData();
    } catch (e: any) {
      setActionError(e.message);
    } finally {
      setProcessingUserId(null);
    }
  };

  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Command <span style={{ color: themeColor }}>Bridge</span>
            </h1>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Mesh Status Stable</p>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
            { id: 'registry', label: 'REGISTRY', icon: Users },
            { id: 'explorer', label: 'TABLE EDITOR', icon: Table },
            { id: 'signals', label: 'SIGNALS', icon: Radio },
            { id: 'system', label: 'SYSTEM', icon: Cpu }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading && syncState === 'SYNCING' && dailyStats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
             <Loader2 className="animate-spin text-indigo-500 relative z-10" size={80} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic animate-pulse">Querying Database Mesh...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Active Users (GA4)', value: dailyStats[dailyStats.length - 1]?.users || 0, icon: Globe, source: 'GA4' },
                    { label: 'Audit Logs (All)', value: tableCounts['audit_logs'] || 0, icon: List, source: 'DB' },
                    { label: 'Core Profiles', value: tableCounts['profiles'] || 0, icon: Users, source: 'DB' },
                    { label: 'Security Events', value: tableCounts['security_events'] || 0, icon: ShieldAlert, source: 'DB' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5 group hover:border-indigo-500/20 transition-all">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform"><stat.icon size={22} /></div>
                        <span className="text-[8px] font-black text-slate-700 border border-white/5 px-2 py-1 rounded-md uppercase tracking-widest">{stat.source}</span>
                      </div>
                      <div className="space-y-1 text-left">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6 text-left">
                     <div className="flex items-center justify-between px-6">
                        <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.4em] italic flex items-center gap-2">
                           <TrendingUp size={14} /> Traffic Reach (30D)
                        </h3>
                        <div className={`flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest italic transition-all group/sync relative overflow-hidden ${
                          syncState === 'SYNCED' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                          syncState === 'DATA_RESIDENT' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' :
                          syncState === 'ERROR' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 animate-pulse' :
                          'bg-slate-900/60 border-white/5 text-slate-500'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${syncState === 'SYNCED' || syncState === 'DATA_RESIDENT' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)]' : 'bg-slate-700 animate-pulse'}`} />
                          GA4 SYNC: {syncState.replace('_', ' ')}
                          {lastSyncTime && <span className="opacity-40 lowercase font-bold tracking-normal">[{lastSyncTime}]</span>}
                        </div>
                     </div>
                     <GlassCard className="p-10 rounded-[4rem] border-white/5 h-[400px] flex items-center justify-center">
                        {dailyStats.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={dailyStats}>
                                 <defs>
                                    <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                                       <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                       <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                 </defs>
                                 <XAxis dataKey="date" hide />
                                 <YAxis hide domain={['auto', 'auto']} />
                                 <Tooltip 
                                    contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', color: '#fff' }}
                                    itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                                    labelStyle={{ fontSize: '10px', color: '#475569', marginBottom: '8px' }}
                                 />
                                 <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={5} fillOpacity={1} fill="url(#fluxGrad)" animationDuration={2000} />
                              </AreaChart>
                           </ResponsiveContainer>
                        ) : (
                           <div className="text-center space-y-6 opacity-30">
                              <WifiOff size={48} className="mx-auto" />
                              <div className="space-y-1">
                                 <p className="text-[10px] font-black uppercase tracking-[0.4em]">Telemetry bridge void identified.</p>
                                 <p className="text-[8px] font-bold text-slate-500 uppercase">Initialize GA4 Sync from System Tab</p>
                              </div>
                           </div>
                        )}
                     </GlassCard>
                  </div>
                  <div className="lg:col-span-4 space-y-6 text-left">
                     <div className="flex items-center justify-between px-6">
                        <h3 className="text-[11px] font-black uppercase text-rose-400 tracking-[0.4em] italic flex items-center gap-2">
                           <Activity size={14} /> Security Pulse
                        </h3>
                     </div>
                     <div className="space-y-4">
                        {signals.length > 0 ? signals.slice(0, 5).map((sig, i) => (
                           <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${sig.event_type.includes('SUCCESS') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                    {sig.event_type.includes('SUCCESS') ? <ShieldCheck size={20} /> : <ShieldX size={20} />}
                                 </div>
                                 <div className="space-y-0.5 overflow-hidden text-left">
                                    <p className="text-xs font-black text-white italic truncate w-36 uppercase tracking-tight">{sig.event_type}</p>
                                    <p className="text-[9px] font-bold text-slate-600 tracking-wider truncate w-36 uppercase">{new Date(sig.created_at).toLocaleTimeString()}</p>
                                 </div>
                              </div>
                              <ChevronRight size={14} className="text-slate-800" />
                           </div>
                        )) : (
                          <div className="py-12 text-center opacity-20 border border-white/5 border-dashed rounded-[2.2rem]">
                            <p className="text-[9px] font-black uppercase tracking-widest italic">No pulse detected</p>
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </m.div>
          )}

          {activeTab === 'registry' && (
             <m.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-40">
                <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/5 bg-slate-950/60 shadow-2xl relative overflow-visible">
                   <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16 relative z-10 text-left">
                      <div className="space-y-2 text-left w-full">
                         <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Node <span className="text-indigo-400">Registry</span></h2>
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">Manage laboratory subjects and node clearances.</p>
                      </div>
                      <div className="relative w-full md:w-96 group">
                         <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                         <input 
                            type="text" value={registrySearch} onChange={(e) => setRegistrySearch(e.target.value)}
                            placeholder="Filter node identifiers..."
                            className="w-full bg-black/60 border border-white/5 rounded-full pl-14 pr-6 py-5 text-[11px] font-bold italic text-white outline-none focus:border-indigo-500/50 transition-all"
                         />
                      </div>
                   </div>

                   <div className="overflow-x-auto no-scrollbar relative z-10">
                      <table className="w-full text-left border-separate border-spacing-y-4">
                         <thead>
                            <tr className="text-[11px] font-black uppercase text-slate-700 tracking-widest italic px-8">
                               <th className="px-8 pb-4">Identity</th>
                               <th className="px-8 pb-4">Clearance</th>
                               <th className="px-8 pb-4">Status</th>
                               <th className="px-8 pb-4 text-right">Actions</th>
                            </tr>
                         </thead>
                         <tbody>
                            {users.filter(u => (u.email || '').toLowerCase().includes(registrySearch.toLowerCase())).map((user) => (
                               <tr key={user.id} className="group">
                                  <td className="py-6 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5 text-left">
                                     <div className="flex items-center gap-4 text-left">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${user.is_super_owner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-900 border-white/5 text-slate-500'}`}>
                                           {user.is_super_owner ? <Crown size={22} /> : <UserCircle size={22} />}
                                        </div>
                                        <div className="space-y-0.5 text-left">
                                           <p className="text-sm font-black italic text-white leading-none uppercase tracking-tight">{user.email || 'Anonymized'}</p>
                                           <p className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">{user.id.slice(0, 12)}</p>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="py-6 px-8 bg-white/[0.02] border-y border-white/5 text-left">
                                     <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest ${
                                        user.role === 'owner' ? 'bg-amber-600/10 border-amber-500/30 text-amber-500' : 
                                        user.role === 'admin' ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-400' : 
                                        'bg-slate-900 border-white/5 text-slate-600'
                                     }`}>
                                        <Shield size={10} /> {user.role}
                                     </div>
                                  </td>
                                  <td className="py-6 px-8 bg-white/[0.02] border-y border-white/5 text-left">
                                     {user.is_blocked ? (
                                        <span className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase italic animate-pulse">
                                           <Lock size={12} /> Restricted
                                        </span>
                                     ) : (
                                        <span className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase italic">
                                           <CheckCircle2 size={12} /> Authorized
                                        </span>
                                     )}
                                  </td>
                                  <td className="py-6 px-8 bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-right relative">
                                     <div className="flex justify-end gap-2">
                                        <div className="relative" ref={popoverRef}>
                                           <button 
                                              onClick={() => setRoleSelectUserId(roleSelectUserId === user.id ? null : user.id)}
                                              disabled={processingUserId === user.id}
                                              className={`p-3 rounded-xl transition-all border border-white/5 shadow-lg ${roleSelectUserId === user.id ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:text-indigo-400'}`}
                                              title="Access Hub: Set Node Clearance"
                                           >
                                              {processingUserId === user.id ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
                                           </button>

                                           <AnimatePresence>
                                             {roleSelectUserId === user.id && (
                                               <m.div 
                                                 initial={{ opacity: 0, scale: 0.95, y: 10, x: 20 }}
                                                 animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                 exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                 className="absolute bottom-full right-0 mb-6 z-[200] min-w-[240px]"
                                               >
                                                 <div className="bg-slate-950/98 backdrop-blur-[100px] border border-white/15 p-4 rounded-[2.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.9)] flex flex-col gap-2">
                                                   <div className="px-4 py-2 border-b border-white/5 mb-2 text-left">
                                                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Assign clearance</p>
                                                   </div>
                                                   
                                                   <button onClick={() => handleSetRole(user, 'owner')} className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group/opt border ${user.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'hover:bg-amber-500/10 border-transparent text-slate-400 hover:text-amber-500'}`}><div className="flex items-center gap-3"><Crown size={16} className="group-hover/opt:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-widest">Owner</span></div>{user.role === 'owner' && <CheckCircle2 size={12} />}</button>
                                                   <button onClick={() => handleSetRole(user, 'admin')} className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group/opt border ${user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'hover:bg-indigo-500/10 border-transparent text-slate-400 hover:text-indigo-400'}`}><div className="flex items-center gap-3"><Shield size={16} className="group-hover/opt:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-widest">Admin</span></div>{user.role === 'admin' && <CheckCircle2 size={12} />}</button>
                                                   <button onClick={() => handleSetRole(user, 'user')} className={`flex items-center justify-between w-full p-4 rounded-2xl transition-all group/opt border ${user.role === 'user' ? 'bg-slate-500/10 border-white/10 text-white' : 'hover:bg-white/5 border-transparent text-slate-400 hover:text-white'}`}><div className="flex items-center gap-3"><UserCircle size={16} className="group-hover/opt:scale-110 transition-transform" /><span className="text-[11px] font-black uppercase tracking-widest">User</span></div>{user.role === 'user' && <CheckCircle2 size={12} />}</button>
                                                 </div>
                                               </m.div>
                                             )}
                                           </AnimatePresence>
                                        </div>

                                        <button 
                                           onClick={() => handleToggleBlock(user)}
                                           disabled={processingUserId === user.id}
                                           className={`p-3 rounded-xl transition-all border shadow-lg ${
                                              user.is_blocked 
                                              ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-600/20' 
                                              : 'bg-rose-600/10 text-rose-500 border-rose-500/20 hover:bg-rose-600/20'
                                           }`}
                                           title={user.is_blocked ? "Unblock Node" : "Restrict Node"}
                                        >
                                           {processingUserId === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.is_blocked ? <Unlock size={16} /> : <Ban size={16} />)}
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </GlassCard>
             </m.div>
          )}

          {activeTab === 'explorer' && (
            <m.div key="explorer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 flex flex-col h-[calc(100vh-280px)]">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
                  <div className="lg:col-span-1 space-y-6 overflow-y-auto no-scrollbar pr-2 flex flex-col">
                     <div className="space-y-2 mb-4 px-4 text-left">
                        <div className="flex items-center justify-between mb-4">
                           <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Public Schema</h4>
                           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="relative group">
                           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                           <input type="text" value={tableSearch} onChange={(e) => setTableSearch(e.target.value)} placeholder="Filter mesh tables..." className="w-full bg-slate-950/60 border border-white/5 rounded-full pl-14 pr-6 py-5 text-[11px] font-bold italic text-white outline-none focus:border-indigo-500/50 transition-all" />
                        </div>
                     </div>
                     <div className="space-y-2 flex-1 overflow-y-auto no-scrollbar pb-10">
                        {DATABASE_SCHEMA.filter(t => t.id.toLowerCase().includes(tableSearch.toLowerCase())).map((t) => (
                           <button key={t.id} onClick={() => setSelectedTable(t.id)} className={`w-full p-6 rounded-[2.5rem] border flex items-center justify-between transition-all group ${selectedTable === t.id ? 'bg-indigo-600 border-indigo-400 shadow-xl' : 'bg-white/[0.02] border-white/5 hover:border-white/20'}`}><div className="flex items-center gap-4 text-left"><div className={`p-2.5 rounded-xl ${selectedTable === t.id ? 'bg-white/20 text-white' : 'bg-slate-900 text-slate-600'}`}><t.icon size={18} /></div><div className="space-y-0.5 text-left"><p className={`text-[11px] font-black uppercase tracking-tight ${selectedTable === t.id ? 'text-white' : 'text-slate-400'}`}>{t.id.replace(/_/g, ' ')}</p><p className={`text-[8px] font-bold uppercase tracking-widest ${selectedTable === t.id ? 'text-white/60' : 'text-slate-700'}`}>{t.group}</p></div></div><span className={`text-[10px] font-mono font-black ${selectedTable === t.id ? 'text-white' : 'text-slate-800'}`}>{tableCounts[t.id] || 0}</span></button>
                        ))}
                     </div>
                  </div>

                  <GlassCard className="lg:col-span-3 rounded-[4.5rem] border-white/5 flex flex-col relative overflow-hidden bg-slate-950/40">
                     <div className="p-10 border-b border-white/5 flex justify-between items-center bg-black/20 text-left">
                        <div className="flex items-center gap-5">
                           <div className="p-4 bg-indigo-500/10 rounded-[1.8rem] text-indigo-400"><Table size={24} /></div>
                           <div className="text-left">
                              <div className="flex items-center gap-3"><h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">{selectedTable.replace(/_/g, ' ')}</h3><span className="text-[8px] font-black text-slate-700 bg-white/5 px-2 py-0.5 rounded border border-white/5 uppercase tracking-widest italic">Live Node</span></div>
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] italic mt-2">REGISTRY_CAP: 100 RECORDS</p>
                           </div>
                        </div>
                        <button onClick={() => fetchSelectedTableData(selectedTable)} className="p-5 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-500 hover:text-white transition-all shadow-lg active:scale-95"><RefreshCw size={18} className={tableLoading ? 'animate-spin' : ''} /></button>
                     </div>

                     <div className="flex-1 overflow-auto no-scrollbar p-10">
                        {tableLoading ? (
                           <div className="h-full flex flex-col items-center justify-center gap-6 py-32 opacity-30"><Loader2 size={48} className="animate-spin text-indigo-500" /><p className="text-[11px] font-black uppercase tracking-widest italic">Interrogating Data Core...</p></div>
                        ) : tableData.length === 0 ? (
                           <div className="h-full flex flex-col items-center justify-center gap-6 py-32 opacity-20"><WifiOff size={48} /><p className="text-[11px] font-black uppercase tracking-widest italic">Null response from identifier.</p></div>
                        ) : (
                           <div className="min-w-full overflow-x-auto text-left">
                              <table className="w-full text-left border-collapse">
                                 <thead>
                                    <tr className="border-b border-white/5">{Object.keys(tableData[0]).map((key) => (<th key={key} className="pb-6 px-6 text-[10px] font-black uppercase text-slate-700 tracking-widest italic whitespace-nowrap">{key}</th>))}</tr>
                                 </thead>
                                 <tbody>
                                    {tableData.map((row, i) => (
                                       <tr key={i} className="group hover:bg-white/[0.02] transition-colors border-b border-white/[0.02]">{Object.values(row).map((val: any, j) => (<td key={j} className="py-6 px-6"><div className="max-w-[250px] truncate text-[11px] font-bold text-slate-500 group-hover:text-slate-300 transition-colors text-left">{val === null ? <span className="opacity-20 italic">null</span> : typeof val === 'object' ? JSON.stringify(val) : String(val)}</div></td>))}</tr>
                                    ))}
                                 </tbody>
                              </table>
                           </div>
                        )}
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}

          {activeTab === 'signals' && (
            <m.div key="signals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-40">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl border-white/5">
                  <div className="flex items-center gap-6 mb-16 px-4 text-left">
                     <div className="p-4 bg-indigo-600/10 rounded-[1.8rem] text-indigo-400"><Radio className="animate-pulse" size={32} /></div>
                     <div className="text-left space-y-1"><h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Security <span className="text-indigo-400">Pulse</span></h3><p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic">DB_TABLE: public.security_events</p></div>
                  </div>
                  <div className="space-y-4">
                     {signals.length === 0 ? (<div className="py-40 text-center opacity-30 flex flex-col items-center gap-6"><WifiOff size={64} className="text-slate-800" /><p className="text-[11px] text-slate-500 font-black tracking-[0.5em] uppercase italic">Registry signal void identified.</p></div>) : signals.map((sig, idx) => (<div key={idx} className="p-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                        <div className="flex items-center gap-8 text-left">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-xl ${sig.event_type.includes('SUCCESS') ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500' : sig.event_type.includes('FAIL') ? 'bg-rose-600/10 border-rose-500/20 text-rose-500' : 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400'}`}>
                              {sig.event_type.includes('FAIL') ? <ShieldX size={26} /> : <Zap size={26} />}
                           </div>
                           <div className="space-y-1 text-left">
                              <div className="flex items-center gap-3"><p className="text-xl font-black text-white italic tracking-tight uppercase leading-none">{sig.event_type}</p></div>
                              <p className="text-[11px] font-bold text-slate-500 tracking-wider italic text-left">{sig.user_email || 'ANONYMOUS_PULSE'} • {sig.details}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="flex flex-col items-end gap-1.5 text-slate-700 group-hover:text-slate-400 transition-colors">
                              <div className="flex items-center gap-2"><Clock size={12} /><p className="text-[10px] font-mono font-black">{new Date(sig.created_at).toLocaleTimeString()}</p></div>
                           </div>
                        </div>
                     </div>))}
                  </div>
               </GlassCard>
            </m.div>
          )}

          {activeTab === 'system' && (
            <m.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 pb-40">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-10">
                     <div className="relative"><div className="p-10 bg-indigo-500/10 rounded-[3.5rem] text-indigo-400"><RefreshCw size={80} className={syncState === 'SYNCING' ? 'animate-spin' : ''} /></div></div>
                     <div className="space-y-4"><h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">Manual GA4 Re-Sync</h4><p className="text-sm text-slate-500 italic leading-relaxed max-w-xs font-medium">Synchronize dashboard metrics with cloud-native GA4 telemetry. This protocol updates daily traffic records.</p></div>
                     <button onClick={handleManualSync} className="w-full py-8 bg-white text-black font-black text-[12px] uppercase tracking-[0.5em] rounded-full active:scale-95 transition-all shadow-2xl hover:bg-slate-200 italic">Execute Synchronization</button>
                  </GlassCard>
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col gap-10 text-left">
                     <div className="flex items-center gap-5 border-b border-white/5 pb-10 text-left"><div className="p-5 bg-rose-600/10 rounded-[1.8rem] text-rose-500"><ShieldAlert size={32} /></div><div className="text-left space-y-1"><h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Integrity Status</h3><p className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest italic">Infrastructure Diagnostics</p></div></div>
                     <div className="space-y-6">
                        {[
                           { label: 'Telemetric Bridge (GA4)', status: syncState === 'SYNCED' ? 'Sync Verified' : syncState === 'DATA_RESIDENT' ? 'Data Present' : syncState, color: (syncState === 'SYNCED' || syncState === 'DATA_RESIDENT') ? 'text-emerald-400' : syncState === 'ERROR' ? 'text-rose-400' : 'text-slate-500', icon: Globe },
                           { label: 'Security Handshake Hub', status: 'Active Bridge', color: 'text-rose-400', icon: Lock },
                           { label: 'Registry Synchronization', status: 'Mesh established', color: 'text-amber-400', icon: Database },
                           { label: 'Laboratory Signal Logs', status: 'Active (Direct)', color: 'text-cyan-400', icon: MessageSquare }
                        ].map((sys, idx) => (
                           <div key={idx} className="flex justify-between items-center p-7 bg-black/40 rounded-[2rem] border border-white/5 group hover:border-white/10 transition-all text-left"><div className="flex items-center gap-5"><sys.icon size={18} className="text-slate-600 group-hover:text-white" /><span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover:text-slate-300 transition-colors text-left">{sys.label}</span></div><span className={`font-black text-[11px] italic uppercase tracking-tighter ${sys.color}`}>{sys.status}</span></div>
                        ))}
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      )}

      {/* Global Toast for Errors */}
      <AnimatePresence>
        {actionError && (
          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-6">
            <div className="bg-rose-950/90 border border-rose-600/50 p-7 rounded-[3rem] shadow-2xl flex items-start gap-6 backdrop-blur-3xl text-left">
              <div className="p-3 bg-rose-600/20 rounded-2xl text-rose-500"><ShieldAlert size={28} /></div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.4em] italic mb-1">Handshake Exception Protocol</p>
                <p className="text-base font-bold text-white italic leading-tight">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
