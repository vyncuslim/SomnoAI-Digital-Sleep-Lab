
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
  CheckCircle, Signal, SignalLow, SignalHigh, Info
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
      // Fixed: Avoid re-triggering logic if already in error state
      setTimeout(() => {
        setSyncStatus(prev => prev === 'synced' ? 'idle' : prev);
      }, 5000);
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

  const handleToggleRole = async (id: string, currentRole: string) => {
    if (!isOwner || processingUserIds.has(id)) return;
    setProcessingUserIds(prev => new Set(prev).add(id));
    setActionError(null);

    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminApi.updateUserRole(id, newRole);
      const updatedUsers = await adminApi.getUsers();
      setUsers(updatedUsers);
      setSuccessUserIds(prev => new Set(prev).add(id));
      setTimeout(() => setSuccessUserIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      }), 3000);
    } catch (err: any) {
      setActionError(`Clearance Update Failed: ${err.message}`);
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
    const prev = dailyStats[dailyStats.length - 2] || { users: 0, pageviews: 0 };
    const calcGrowth = (c: number, p: number) => p === 0 ? 0 : Math.round(((c - p) / p) * 100);

    return {
      totalSubjects: users.length,
      activeUsers: latest.users,
      pageViews: latest.pageviews,
      userGrowth: calcGrowth(latest.users, prev.users),
      viewGrowth: calcGrowth(latest.pageviews, prev.pageviews),
      realtimePulse: realtime[0]?.active_users || 0,
      lastSyncDate: latest.date || null
    };
  }, [users, dailyStats, realtime]);

  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

  /**
   * GA4 Telemetry Status Dashboard Component
   */
  const GA4StatusDashboard = () => {
    const config: Record<SyncStatus, { label: string; color: string; icon: any; bg: string; pulse: boolean; desc: string; glow: string }> = {
      idle: { 
        label: 'GA4 STANDBY', 
        color: 'text-slate-500', 
        icon: Radio, 
        bg: 'bg-slate-500/5', 
        pulse: false, 
        desc: 'Waiting for next telemetry cycle.',
        glow: 'shadow-slate-500/0'
      },
      syncing: { 
        label: 'SYNCHRONIZING', 
        color: 'text-indigo-400', 
        icon: RefreshCw, 
        bg: 'bg-indigo-500/10', 
        pulse: true, 
        desc: 'Establishing secure handshake with GA4.',
        glow: 'shadow-indigo-500/20'
      },
      synced: { 
        label: 'GA4 OPTIMIZED', 
        color: 'text-emerald-400', 
        icon: CheckCircle2, 
        bg: 'bg-emerald-500/10', 
        pulse: false, 
        desc: 'Telemetry data integrity verified.',
        glow: 'shadow-emerald-500/30'
      },
      error: { 
        label: 'SYNC SEVERED', 
        color: 'text-rose-500', 
        icon: WifiOff, 
        bg: 'bg-rose-500/10', 
        pulse: false, 
        desc: 'Critical exception in data ingress.',
        glow: 'shadow-rose-500/40'
      }
    };
    
    const current = config[syncStatus];

    return (
      <GlassCard className={`p-8 rounded-[3.5rem] border-white/5 transition-all duration-700 ${current.bg} ${current.glow} shadow-2xl overflow-hidden relative`}>
        {/* Animated Background Pulse */}
        <AnimatePresence>
          {syncStatus === 'synced' && (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.05, 0.15, 0.05] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-emerald-500"
            />
          )}
        </AnimatePresence>

        <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <div className={`p-5 rounded-[2rem] bg-black/40 border border-white/10 ${current.color} relative overflow-hidden`}>
               <current.icon size={32} className={`${current.pulse ? 'animate-spin' : ''} ${syncStatus === 'error' ? 'animate-pulse' : ''}`} />
               {syncStatus === 'syncing' && (
                 <m.div 
                   animate={{ x: ['-100%', '200%'] }} 
                   transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                   className="absolute bottom-0 left-0 w-full h-1 bg-indigo-500"
                 />
               )}
            </div>
            <div className="space-y-1 text-left">
              <h4 className={`text-xl font-black italic tracking-tight uppercase leading-none ${current.color}`}>{current.label}</h4>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{current.desc}</p>
              {lastSyncTime && (
                <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-2">Handshake: {lastSyncTime}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
                onClick={() => fetchData()}
                disabled={syncStatus === 'syncing'}
                className="flex-1 md:flex-none px-10 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-[0.3em] hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-30 italic flex items-center justify-center gap-3"
             >
               <RefreshCw size={14} className={syncStatus === 'syncing' ? 'animate-spin' : ''} />
               {syncStatus === 'syncing' ? 'SYNCING...' : 'RESYNC TELEMETRY'}
             </button>
             <div className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-black/40 border border-white/5 rounded-full">
                <div className={`w-1.5 h-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-600'}`} />
                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">GA4_LINK_V4</span>
             </div>
          </div>
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
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry Active: Unified Data Lake</p>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'OVERVIEW PULSE', icon: Activity },
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

      {loading && syncStatus === 'syncing' && activeTab === 'overview' ? (
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
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Neural Flux', value: metrics.activeUsers, icon: Globe, source: 'GA4' },
                    { label: 'Identified Nodes', value: metrics.totalSubjects, icon: Users, source: 'DB' },
                    { label: 'Input Signals', value: feedback.length, icon: MessageSquare, source: 'DB' },
                    { label: 'Live Pulse', value: metrics.realtimePulse, icon: Zap, source: 'GA4 LIVE' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className="p-10 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><stat.icon size={120} /></div>
                      <div className="flex justify-between items-start mb-8 relative z-10">
                         <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><stat.icon size={26} /></div>
                         <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{stat.source}</span>
                      </div>
                      <div className="space-y-1 relative z-10">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-8 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl relative min-h-[450px]">
                    <div className="flex justify-between items-start mb-12">
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Activity Temporal Flux</h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Combined Telemetry • Daily Pageviews</p>
                      </div>
                      <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><TrendingUp size={20} /></div>
                    </div>
                    <div className="h-[280px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dailyStats}>
                          <defs>
                            <linearGradient id="adminFlux" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                          <XAxis dataKey="date" hide />
                          <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }} />
                          <Area type="monotone" dataKey="pageviews" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#adminFlux)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <GlassCard className="lg:col-span-4 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Monitor size={24} /></div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Device Mesh</h3>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie data={deviceStats.map(d => ({ name: (d.device || 'Unknown').toUpperCase(), value: d.users }))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none">
                                 {deviceStats.map((_, i) => <Cell key={i} fill={[COLORS.deep, COLORS.rem, COLORS.light, COLORS.success][i % 4]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                           </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
                       <span>Primary Access Path</span>
                       <span className="text-white">{deviceStats[0]?.device || 'N/A'}</span>
                    </div>
                  </GlassCard>
               </div>
            </m.div>
          )}

          {activeTab === 'traffic' && (
            <m.div key="traffic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {/* GA4 Sync Status Indicator Card */}
               <GA4StatusDashboard />

               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5 relative overflow-hidden group">
                     <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity rotate-12">
                        <MapPin size={240} />
                     </div>
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
                     <div className="absolute -right-10 -top-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                        <Layers size={240} />
                     </div>
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
                                      {isOwner && !user.is_super_owner && (
                                        <button 
                                          onClick={() => handleToggleRole(user.id, user.role)}
                                          disabled={isProcessing || isSuccess}
                                          className={`p-5 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-amber-500 transition-all ${isProcessing || isSuccess ? 'opacity-50' : ''}`}
                                          title="Toggle Admin/User Role"
                                        >
                                          {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <KeyRound size={24} />}
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
                  {/* Sync Status Card - Synchronized with Telemetry logic */}
                  <GlassCard className={`p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-10 transition-all duration-700 ${syncStatus === 'synced' ? 'bg-emerald-500/[0.02]' : ''}`}>
                     <div className="relative">
                        <AnimatePresence mode="wait">
                          <m.div 
                             key={syncStatus}
                             initial={{ scale: 0.8, opacity: 0 }} 
                             animate={{ scale: 1, opacity: 1 }} 
                             className="relative z-10"
                          >
                             {syncStatus === 'syncing' ? (
                               <div className="relative">
                                  <div className="absolute inset-0 bg-indigo-500/20 blur-[40px] rounded-full animate-pulse" />
                                  <RefreshCw size={80} className="text-indigo-500 animate-spin" />
                               </div>
                             ) : syncStatus === 'error' ? (
                               <div className="relative">
                                  <div className="absolute inset-0 bg-rose-500/20 blur-[40px] rounded-full animate-pulse" />
                                  <ShieldX size={80} className="text-rose-500" />
                               </div>
                             ) : (
                               <div className="relative">
                                  <div className={`absolute inset-0 blur-[40px] opacity-10 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                  <CheckCircle2 size={80} className={syncStatus === 'synced' ? 'text-emerald-500' : 'text-slate-700'} />
                               </div>
                             )}
                          </m.div>
                        </AnimatePresence>
                     </div>
                     <div className="space-y-4">
                        <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${syncStatus === 'synced' ? 'text-emerald-400' : 'text-white'}`}>Sync Handshake Status</h4>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed max-w-xs font-medium">
                          {syncStatus === 'syncing' 
                            ? 'Establishing secure socket connection to GA4 neural grid...' 
                            : `Laboratory bridge synchronized with GA4. Last successful data pulse identified on ${lastSyncTime || 'STANDBY'}.`}
                        </p>
                     </div>
                     <button 
                       onClick={() => fetchData()} 
                       disabled={syncStatus === 'syncing'}
                       className={`w-full py-6 rounded-full font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 italic shadow-2xl ${syncStatus === 'syncing' ? 'bg-indigo-600/50 text-white cursor-not-allowed' : 'bg-white text-black hover:bg-slate-200 active:scale-95'}`}
                     >
                        <RefreshCw size={16} className={syncStatus === 'syncing' ? 'animate-spin' : ''} /> 
                        {syncStatus === 'syncing' ? 'RESYNCING...' : 'System Resync'}
                     </button>
                  </GlassCard>

                  {/* Diagnostic Interface Card - Terminal Aesthetics */}
                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col gap-10">
                     <div className="flex items-center justify-between w-full border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                             <Cpu size={28} />
                           </div>
                           <div className="text-left">
                              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Diagnostic Interface</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2 italic">TELEMETRY INGRESS V2.1</p>
                           </div>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/5 rounded-full">
                           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                           <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SECURE_LINK</span>
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
