import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, Command, X, Cpu,
  TrendingUp, MessageSquare, BookOpen,
  CloudLightning, Cloud, CloudOff, Radio, Server,
  History, BarChart as BarChartIcon,
  ArrowUp, ArrowDown, UserCircle, Code2, AlertCircle, CheckCircle2,
  PieChart as PieIcon, MapPin, Gauge, Layers, Wifi, WifiOff, HardDrive,
  CheckCircle, Signal, SignalLow, SignalHigh, Info, LayoutDashboard,
  ActivitySquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell, PieChart as RePieChart, Pie, BarChart, Bar
} from 'recharts';
import { COLORS } from '../constants.tsx';
import { trackConversion } from '../services/analytics.ts';

const m = motion as any;

type AdminTab = 'overview' | 'traffic' | 'registry' | 'system';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [countryRanking, setCountryRanking] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingUserIds, setProcessingUserIds] = useState<Set<string>>(new Set());
  const [successUserIds, setSuccessUserIds] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setSyncStatus('syncing');
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);
      
      trackConversion('admin_access');

      const [u, d, c, ds, r, fb] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDailyAnalytics(30),
        adminApi.getCountryRankings(),
        adminApi.getDeviceSegmentation(),
        adminApi.getRealtimePulse(),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      setUsers(u || []);
      setDailyStats(d || []);
      setCountryRanking(c || []);
      setDeviceStats(ds || []);
      setRealtime(r || []);
      setFeedback(fb.data || []);
      
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Intelligence Bridge Failure:", err);
      setActionError(err.message || "Failed to synchronize with Laboratory Database.");
      setSyncStatus('error');
    } finally {
      setLoading(false);
      // Automatically reset Synced status to Idle after 5s
      if (syncStatus !== 'error') {
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleToggleBlock = async (id: string) => {
    if (processingUserIds.has(id)) return;
    setProcessingUserIds(prev => new Set(prev).add(id));
    setActionError(null);

    try {
      await adminApi.toggleBlock(id);
      const updatedUsers = await adminApi.getUsers();
      setUsers(updatedUsers);
      setSuccessUserIds(prev => new Set(prev).add(id));
      setTimeout(() => setSuccessUserIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }), 3000);
    } catch (err: any) {
      setActionError(`Intervention Protocol Failed: ${err.message}`);
    } finally {
      setProcessingUserIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const metrics = useMemo(() => {
    const latest = dailyStats[dailyStats.length - 1] || { users: 0, pageviews: 0 };
    return {
      totalSubjects: users.length,
      activeUsers: latest.users,
      pageViews: latest.pageviews,
      realtimePulse: realtime[0]?.active_users || 0,
    };
  }, [users, dailyStats, realtime]);

  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

  /**
   * GA4 Telemetry Status Hub Component
   */
  const SyncStatusHub = () => {
    const config: Record<SyncStatus, { label: string; color: string; icon: any; bg: string; pulse: boolean; border: string }> = {
      idle: { 
        label: 'TELEMETRY STANDBY', 
        color: 'text-slate-500', 
        icon: Radio, 
        bg: 'bg-slate-500/5', 
        pulse: false,
        border: 'border-white/5'
      },
      syncing: { 
        label: 'HANDSHAKE IN PROGRESS', 
        color: 'text-indigo-400', 
        icon: RefreshCw, 
        bg: 'bg-indigo-500/10', 
        pulse: true,
        border: 'border-indigo-500/20'
      },
      synced: { 
        label: 'TELEMETRY OPTIMIZED', 
        color: 'text-emerald-400', 
        icon: CheckCircle2, 
        bg: 'bg-emerald-500/10', 
        pulse: false,
        border: 'border-emerald-500/20'
      },
      error: { 
        label: 'LINK SEVERED', 
        color: 'text-rose-500', 
        icon: WifiOff, 
        bg: 'bg-rose-500/10', 
        pulse: false,
        border: 'border-rose-500/20'
      }
    };
    
    const current = config[syncStatus];

    return (
      <GlassCard className={`p-8 rounded-[3rem] ${current.border} ${current.bg} transition-all duration-700 overflow-hidden relative`}>
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-2xl bg-black/40 border border-white/5 ${current.color}`}>
               <current.icon size={32} className={current.pulse ? 'animate-spin' : ''} />
            </div>
            <div className="text-left space-y-1">
              <h4 className={`text-lg font-black italic tracking-tight uppercase leading-none ${current.color}`}>{current.label}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
                GA4 External Unified Intelligence Loop
              </p>
              {lastSyncTime && (
                <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-2">Last Pulse: {lastSyncTime}</p>
              )}
            </div>
          </div>

          <button 
            onClick={() => fetchData()}
            disabled={syncStatus === 'syncing'}
            className="w-full md:w-auto px-8 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-30 italic flex items-center justify-center gap-3"
          >
            <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
            {syncStatus === 'syncing' ? 'RESYNCING...' : 'SYNC TELEMETRY'}
          </button>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Intelligence <span style={{ color: themeColor }}>Command</span>
            </h1>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-500" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">System Status: Sovereign Unified</p>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'DASHBOARD', icon: LayoutDashboard },
            { id: 'traffic', label: 'TRAFFIC (GA4)', icon: Globe },
            { id: 'registry', label: 'REGISTRY (DB)', icon: Users },
            { id: 'system', label: 'SYSTEM DIAG', icon: Cpu }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading && syncStatus === 'syncing' ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <div className="relative">
             <div className="absolute inset-0 bg-indigo-500/20 blur-[80px] rounded-full animate-pulse" />
             <Loader2 className="animate-spin text-indigo-500 relative z-10" size={64} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Synthesizing Core Data Streams...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
               
               {/* EXTERNAL TRAFFIC SEGMENT */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4 px-6">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">External Traffic (GA4)</h2>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Synced Telemetry Node G-3F9KVPNYLR</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { label: 'Network Flux (Daily)', value: metrics.activeUsers, icon: Globe, source: 'GA4' },
                      { label: 'Screen Interactions', value: metrics.pageViews, icon: Monitor, source: 'GA4' },
                      { label: 'Live Neural Pulse', value: metrics.realtimePulse, icon: Zap, source: 'GA4 LIVE' }
                    ].map((stat, i) => (
                      <GlassCard key={i} className="p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-8 relative z-10">
                           <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400">
                             <stat.icon size={26} className={i === 2 ? 'animate-pulse' : ''} />
                           </div>
                           <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{stat.source}</span>
                        </div>
                        <div className="space-y-1 relative z-10">
                          <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
               </section>

               {/* INTERNAL REGISTRY SEGMENT */}
               <section className="space-y-8">
                  <div className="flex items-center gap-4 px-6">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                      <Database size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Internal System Registry (DB)</h2>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Direct Supabase Sovereign Access</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex items-center justify-between group">
                       <div className="space-y-2">
                          <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{metrics.totalSubjects}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Identified Nodes</p>
                       </div>
                       <div className="p-6 bg-amber-500/10 rounded-3xl text-amber-400">
                          <Users size={32} />
                       </div>
                    </GlassCard>
                    <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex items-center justify-between group">
                       <div className="space-y-2">
                          <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{feedback.length}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Neural Signal Logs</p>
                       </div>
                       <div className="p-6 bg-emerald-500/10 rounded-3xl text-emerald-400">
                          <MessageSquare size={32} />
                       </div>
                    </GlassCard>
                  </div>
               </section>
            </m.div>
          )}

          {activeTab === 'traffic' && (
            <m.div key="traffic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {/* Visual Indicator Hub */}
               <SyncStatusHub />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5 relative overflow-hidden group">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400"><MapPin size={24} /></div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Geographic Mesh</h3>
                     </div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={countryRanking} layout="vertical" margin={{ left: 40, right: 40 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Bar dataKey="users" fill="#f59e0b" radius={[0, 20, 20, 0]} barSize={24} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5 relative overflow-hidden group">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Layers size={24} /></div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Impact Flow</h3>
                     </div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={dailyStats.slice(-14)}>
                              <XAxis dataKey="date" hide />
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Bar dataKey="pageviews" fill="#6366f1" radius={[20, 20, 0, 0]} barSize={32} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}

          {activeTab === 'registry' && (
            <m.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Identified <span style={{ color: themeColor }}>Nodes</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Direct Supabase Sovereignty Log</p>
                     </div>
                     <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white" size={22} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Query Subject ID..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-white/20 font-bold italic" />
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em] italic px-8">
                              <th className="px-8 pb-4">Subject Identifier</th><th className="px-8 pb-4">Clearance</th><th className="px-8 pb-4 text-right">Intervention</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.filter(u => (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((user) => {
                             const isProcessing = processingUserIds.has(user.id);
                             const isSuccess = successUserIds.has(user.id);
                             return (
                             <tr key={user.id} className="group">
                                <td className="py-8 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center transition-all duration-500 ${isSuccess ? 'text-emerald-500 border-emerald-500/30' : user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'text-slate-600'}`}>
                                         {isSuccess ? <CheckCircle size={28} className="animate-in zoom-in duration-300" /> : (user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />)}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-white italic leading-tight">{user.email || 'ANONYMOUS_NODE'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 mt-1">{user.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] border-y border-white/5">
                                   <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border transition-all ${user.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                      {user.is_blocked ? <ShieldX size={16} className="text-rose-500" /> : <Shield size={16} />}
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-right">
                                   <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                      {!user.is_super_owner && (
                                        <button 
                                          onClick={() => handleToggleBlock(user.id)} 
                                          disabled={isProcessing || isSuccess}
                                          className={`p-5 rounded-2xl transition-all border ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20'} ${isSuccess ? 'opacity-50' : ''}`}
                                        >
                                          {isProcessing ? <Loader2 size={24} className="animate-spin" /> : user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />}
                                        </button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           )})}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </m.div>
          )}

          {activeTab === 'system' && (
            <m.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-10">
                     <div className="relative">
                        <div className={`absolute inset-0 blur-[40px] opacity-10 rounded-full bg-emerald-500`} />
                        <CheckCircle2 size={80} className="text-emerald-500" />
                     </div>
                     <div className="space-y-4">
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">System Handshake</h4>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed max-w-xs font-medium">
                          Laboratory neural interface is operating within standard parameters. Link integrity 99.8%.
                        </p>
                     </div>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col gap-10">
                     <div className="flex items-center justify-between w-full border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                             <Cpu size={28} />
                           </div>
                           <div className="text-left">
                              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Diagnostic Interface</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2 italic">TELEMETRY INGRESS V2.2</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6 flex-1">
                        {[
                           { k: 'GA_ID', v: 'G-3F9KVPNYLR', icon: Globe },
                           { k: 'DB_ENDPOINT', v: 'ojcvvtyaebdodmegwqan', icon: Database },
                           { k: 'AUTH', v: 'Lockless Implicit', icon: KeyRound }
                        ].map((item) => (
                          <div key={item.k} className="group flex justify-between items-center gap-6 p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all">
                             <div className="flex items-center gap-4">
                                <item.icon size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                <span className="font-black text-slate-600 uppercase text-[10px] tracking-widest">{item.k}</span>
                             </div>
                             <span className="font-mono text-indigo-400 text-[11px] font-bold tracking-tight bg-indigo-500/5 px-4 py-2 rounded-xl border border-indigo-500/10">{item.v}</span>
                          </div>
                        ))}
                     </div>

                     <div className="flex items-center gap-3 p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
                        <Info size={18} className="text-indigo-400 shrink-0" />
                        <p className="text-[10px] text-slate-500 italic leading-relaxed text-left">Internal protocols utilize de-identified telemetry payloads to maintain node sovereignty.</p>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {actionError && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
            <div className="bg-rose-950/90 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-5 backdrop-blur-3xl text-left">
              <ShieldAlert className="text-rose-500 shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Neural Exception</p>
                <p className="text-sm font-bold text-white italic">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400 hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};