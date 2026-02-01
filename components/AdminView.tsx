
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, Activity,
  ChevronRight, Send, Smartphone, BarChart3, Fingerprint,
  Lock, Table, List, Clock, TrendingUp,
  CheckCircle2, Unlock, WifiOff, Mail, ExternalLink, ActivitySquare, AlertCircle,
  HeartPulse, ShieldQuestion, UserPlus, Info as InfoIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';
import { systemMonitor, DiagnosticResult } from '../services/systemMonitor.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'TIMEOUT';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', group: 'Traffic (GA4)', icon: Activity },
  { id: 'audit_logs', group: 'System Audit', icon: List },
  { id: 'security_events', group: 'Security', icon: ShieldAlert },
  { id: 'profiles', group: 'Core Registry', icon: Users },
  { id: 'user_data', group: 'Core Registry', icon: Fingerprint },
  { id: 'feedback', group: 'Lab Data', icon: Send },
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseResult, setPulseResult] = useState<DiagnosticResult | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  // Table Explorer Specific
  const [activeTable, setActiveTable] = useState('analytics_daily');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const checkSyncStatus = async () => {
    try {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('action, created_at')
        .in('action', ['GA4_SYNC_SUCCESS', 'GA4_SYNC_ERROR'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (logs?.[0]) {
        const syncDate = new Date(logs[0].created_at);
        setLastSyncTime(syncDate.toLocaleString());
        const isStale = (new Date().getTime() - syncDate.getTime()) > 1000 * 60 * 60 * 24; 
        setSyncState(logs[0].action === 'GA4_SYNC_SUCCESS' ? (isStale ? 'STALE' : 'SYNCED') : 'ERROR');
      } else {
        const count = await adminApi.getTableCount('analytics_daily');
        setSyncState(count > 0 ? 'DATA_RESIDENT' : 'IDLE');
      }
    } catch (e) { setSyncState('IDLE'); }
  };

  const executePulse = async () => {
    setIsPulsing(true);
    const res = await systemMonitor.executeGlobalPulseCheck();
    setPulseResult(res);
    setIsPulsing(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [d, s, u] = await Promise.all([
        adminApi.getDailyAnalytics(30),
        adminApi.getSecurityEvents(40),
        adminApi.getUsers()
      ]);

      setDailyStats(d || []);
      setSignals(s || []);
      setUsers(u || []);
      
      const counts: Record<string, number> = {};
      await Promise.all(DATABASE_SCHEMA.map(async (t) => {
        counts[t.id] = await adminApi.getTableCount(t.id);
      }));
      setTableCounts(counts);
      await checkSyncStatus();
      executePulse();
    } catch (err: any) {
      setActionError(err.message || "Mesh synchronization failure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handle Table Explorer Refresh
  useEffect(() => {
    if (activeTab === 'explorer') {
      const loadTable = async () => {
        setTableLoading(true);
        try {
          const data = await adminApi.getTableData(activeTable, 100);
          setTableData(data);
        } catch (e) {} finally {
          setTableLoading(false);
        }
      };
      loadTable();
    }
  }, [activeTab, activeTable]);

  const handleManualSync = async () => {
    setSyncState('SYNCING');
    setActionError(null);
    try {
      const secret = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2"; 
      const response = await fetch('/api/sync-analytics', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      const resData = await response.json();
      if (response.ok) {
        await logAuditLog('ADMIN_MANUAL_SYNC', `GA4 synchronization protocol executed successfully.`);
        fetchData();
      } else {
        throw new Error(resData.error || "GATEWAY_REJECTION: Check Vercel logs.");
      }
    } catch (e: any) {
      setActionError(e.message);
      setSyncState('ERROR');
    }
  };

  const handleToggleBlock = async (user: any) => {
    try {
      const { error } = await adminApi.toggleBlock(user.id, user.email, user.is_blocked);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    if (user.is_super_owner) {
      setActionError("SECURITY_VIOLATION: Cannot modify super owner clearance.");
      return;
    }
    try {
      const { error } = await adminApi.updateUserRole(user.id, user.email, newRole);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;
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
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Mesh Status Stable • TELEMETRY ACTIVE</p>
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
            <button key={tab.id} onClick={() => setActiveTab(tab.id as AdminTab)} className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <Loader2 className="animate-spin text-indigo-500" size={80} />
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic animate-pulse">Syncing Data Mesh...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <GlassCard className="lg:col-span-1 p-8 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                    {isPulsing && (
                      <m.div animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[80px]" />
                    )}
                    <div className="flex items-center justify-between mb-8 relative z-10">
                       <div className="flex items-center gap-4">
                          <div className={`p-4 rounded-2xl ${pulseResult?.isSuccess ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            <HeartPulse size={24} className={isPulsing ? 'animate-pulse' : ''} />
                          </div>
                          <div className="space-y-0.5 text-left">
                             <h3 className="text-sm font-black italic text-white uppercase tracking-tight">Neural Pulse</h3>
                             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Diagnostic Stream</p>
                          </div>
                       </div>
                       <button onClick={executePulse} disabled={isPulsing} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500 hover:text-indigo-400">
                         {isPulsing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                       </button>
                    </div>
                    <div className="space-y-6 relative z-10">
                       <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Status</span>
                          <span className={`text-xs font-black italic uppercase ${pulseResult?.isSuccess ? 'text-emerald-400' : 'text-rose-400'}`}>{isPulsing ? 'Scanning...' : pulseResult?.isSuccess ? 'STABLE' : 'ANOMALY'}</span>
                       </div>
                       <div className="flex justify-between items-end border-b border-white/5 pb-4">
                          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Latency</span>
                          <span className="text-xs font-black italic text-white">{pulseResult?.latency || '--'} <span className="text-[8px] not-italic text-slate-600">ms</span></span>
                       </div>
                    </div>
                 </GlassCard>
                 <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { label: 'Daily Users (GA4)', value: dailyStats[dailyStats.length - 1]?.users || 0, icon: Globe, source: 'GA4' },
                      { label: 'Audit Records', value: tableCounts['audit_logs'] || 0, icon: List, source: 'DB' },
                      { label: 'Subject Profiles', value: tableCounts['profiles'] || 0, icon: Users, source: 'DB' },
                      { label: 'Security Pulses', value: tableCounts['security_events'] || 0, icon: ShieldAlert, source: 'DB' }
                    ].map((stat, i) => (
                      <GlassCard key={i} className="p-6 rounded-[3rem] border-white/5">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><stat.icon size={18} /></div>
                          <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest">{stat.source}</span>
                        </div>
                        <p className="text-3xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                      </GlassCard>
                    ))}
                 </div>
               </div>
               <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-indigo-500/[0.01]">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-6 text-left">
                     <div className={`p-5 rounded-[1.8rem] ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-600/10 text-rose-400 border-rose-500/20'} border`}>
                       <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin text-indigo-400' : ''} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Hub</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Status: {syncState === 'SYNCED' ? 'DATA FLOW ACTIVE' : syncState === 'SYNCING' ? 'HANDSHAKING...' : 'LINK INTERRUPTED'}</p>
                     </div>
                   </div>
                   <div className="flex flex-wrap gap-4 items-center justify-center">
                     <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl">{syncState === 'SYNCING' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Manual Sync</button>
                   </div>
                 </div>
               </GlassCard>
            </m.div>
          )}

          {activeTab === 'registry' && (
            <m.div key="registry" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-3"><Users className="text-indigo-400" /> Subject Registry</h2>
                  <div className="px-4 py-2 bg-slate-900 border border-white/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">{users.length} Nodes Registered</div>
               </div>
               <div className="grid grid-cols-1 gap-4">
                 {users.map((u) => (
                   <GlassCard key={u.id} className="p-8 rounded-[3rem] border-white/5 group hover:border-indigo-500/30 transition-all">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6 text-left">
                           <div className="w-16 h-16 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-white font-black italic text-2xl shadow-inner">{u.full_name?.[0] || '?'}</div>
                           <div className="space-y-1">
                              <p className="text-lg font-black italic text-white uppercase tracking-tight">{u.full_name || 'Anonymous Node'}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Mail size={10} /> {u.email}</p>
                              <div className="flex gap-2 pt-2">
                                 <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${u.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'}`}>ROLE: {u.role}</span>
                                 {u.is_blocked && <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full text-[8px] font-black uppercase tracking-widest">ACCESS_RESTRICTED</span>}
                              </div>
                           </div>
                        </div>
                        <div className="flex gap-3">
                           <select value={u.role} onChange={(e) => handleRoleChange(u, e.target.value)} className="bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-[10px] font-black text-white uppercase outline-none focus:border-indigo-500 transition-all">
                              <option value="user">USER</option>
                              <option value="admin">ADMIN</option>
                              <option value="owner">OWNER</option>
                           </select>
                           <button onClick={() => handleToggleBlock(u)} className={`p-4 rounded-xl border transition-all ${u.is_blocked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                             {u.is_blocked ? <Unlock size={18} /> : <Ban size={18} />}
                           </button>
                        </div>
                      </div>
                   </GlassCard>
                 ))}
               </div>
            </m.div>
          )}

          {activeTab === 'explorer' && (
            <m.div key="explorer" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="grid grid-cols-1 lg:grid-cols-4 gap-8">
               <div className="lg:col-span-1 space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 px-4 italic">Registry Map</h2>
                  {DATABASE_SCHEMA.map((s) => (
                    <button key={s.id} onClick={() => setActiveTable(s.id)} className={`w-full p-6 rounded-[2.5rem] border text-left transition-all flex items-center justify-between ${activeTable === s.id ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl' : 'bg-slate-900 border-white/5 text-slate-500 hover:border-white/10'}`}>
                       <div className="flex items-center gap-4">
                          <s.icon size={18} />
                          <div className="space-y-0.5">
                             <p className="text-[10px] font-black uppercase tracking-tight truncate w-32">{s.id.replace('_', ' ')}</p>
                             <p className={`text-[8px] font-bold uppercase ${activeTable === s.id ? 'text-indigo-200' : 'text-slate-700'}`}>{s.group}</p>
                          </div>
                       </div>
                       <ChevronRight size={14} className={activeTable === s.id ? 'text-white' : 'text-slate-800'} />
                    </button>
                  ))}
               </div>
               <GlassCard className="lg:col-span-3 p-10 rounded-[4rem] border-white/5 overflow-hidden">
                  <div className="flex justify-between items-center mb-10">
                     <h3 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-3"><TerminalIcon className="text-indigo-400" /> Data Explorer: {activeTable}</h3>
                     <div className="px-4 py-2 bg-indigo-500/10 rounded-xl text-[10px] font-black text-indigo-400 uppercase tracking-widest">{tableData.length} records resident</div>
                  </div>
                  <div className="overflow-x-auto no-scrollbar max-h-[600px]">
                    {tableLoading ? (
                      <div className="flex justify-center py-24"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>
                    ) : (
                      <table className="w-full text-[10px] font-bold text-left border-collapse">
                        <thead>
                           <tr className="border-b border-white/5 text-slate-500 uppercase tracking-widest italic">
                              {tableData[0] && Object.keys(tableData[0]).map((k) => <th key={k} className="p-4">{k}</th>)}
                           </tr>
                        </thead>
                        <tbody className="text-slate-400">
                           {tableData.map((row, i) => (
                             <tr key={i} className="border-b border-white/[0.02] hover:bg-white/[0.01]">
                                {Object.values(row).map((v: any, j) => <td key={j} className="p-4 truncate max-w-[200px]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</td>)}
                             </tr>
                           ))}
                        </tbody>
                      </table>
                    )}
                  </div>
               </GlassCard>
            </m.div>
          )}

          {activeTab === 'signals' && (
            <m.div key="signals" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
               <div className="flex justify-between items-center px-4">
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tight flex items-center gap-3"><Radio className="text-rose-500 animate-pulse" /> Security Signals</h2>
                  <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-slate-500"><RefreshCw size={16} /></button>
               </div>
               <div className="space-y-4 max-h-[800px] overflow-y-auto no-scrollbar px-2">
                 {signals.map((sig, i) => (
                   <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5 hover:bg-white/[0.02] transition-all">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-6 text-left">
                           <div className={`p-4 rounded-2xl ${sig.event_type.includes('SUCCESS') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'} border`}>
                              {sig.event_type.includes('SUCCESS') ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
                           </div>
                           <div className="space-y-1">
                              <p className="text-lg font-black italic text-white uppercase tracking-tight">{sig.event_type}</p>
                              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2"><Fingerprint size={10} /> Node: {sig.email || 'System_Auto'}</p>
                              <p className="text-[11px] text-slate-400 italic pt-2 max-w-xl">{sig.event_reason || 'No metadata provided'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{new Date(sig.created_at).toLocaleDateString()}</p>
                           <p className="text-xs font-black italic text-white">{new Date(sig.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                   </GlassCard>
                 ))}
               </div>
            </m.div>
          )}

          {activeTab === 'system' && (
            <m.div key="system" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="max-w-3xl mx-auto space-y-12">
               <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20"><Cpu size={48} /></div>
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">System Infrastructure</h2>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Root Node Clearance</p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <GlassCard className="p-10 rounded-[4rem] border-white/5 text-left space-y-8">
                     <div className="flex items-center gap-3 text-indigo-400 border-b border-white/5 pb-4"><Crown size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Clearance Data</span></div>
                     <div className="space-y-4">
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">Administrator</p><p className="text-sm font-bold text-white italic truncate">{currentAdmin?.email}</p></div>
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">Assigned Role</p><p className="text-sm font-bold text-emerald-400 italic uppercase">{currentAdmin?.role}</p></div>
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">Super Owner Protocol</p><p className="text-sm font-bold text-white italic">{currentAdmin?.is_super_owner ? 'ENABLED' : 'DISABLED'}</p></div>
                     </div>
                  </GlassCard>
                  <GlassCard className="p-10 rounded-[4rem] border-white/5 text-left space-y-8">
                     <div className="flex items-center gap-3 text-indigo-400 border-b border-white/5 pb-4"><Monitor size={18} /><span className="text-[10px] font-black uppercase tracking-widest">Environment Info</span></div>
                     <div className="space-y-4">
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">Host Domain</p><p className="text-sm font-bold text-white italic">sleepsomno.com</p></div>
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">AI Neural Core</p><p className="text-sm font-bold text-indigo-400 italic">Gemini 2.5 Pro</p></div>
                        <div className="space-y-1"><p className="text-[9px] font-black text-slate-600 uppercase">Mirror Status</p><p className="text-sm font-bold text-emerald-400 italic">MIRRORED_ACTIVE</p></div>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {actionError && (
          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-6">
            <div className="bg-rose-950/90 border border-rose-600/50 p-7 rounded-[3rem] shadow-2xl flex items-start gap-6 backdrop-blur-3xl text-left">
              <div className="p-3 bg-rose-600/20 rounded-2xl text-rose-500"><ShieldAlert size={28} /></div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.4em] italic mb-1">Handshake Exception</p>
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
