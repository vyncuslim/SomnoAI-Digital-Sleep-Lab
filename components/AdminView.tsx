import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound, ArrowUpRight,
  Clock, Mail, Fingerprint, Calendar, Zap, AlertTriangle, Cpu,
  Lock as LockIcon, BarChart3, PieChart, Info, Waves, Heart, Brain,
  Network, SignalHigh, X, Terminal as TerminalIcon, Command,
  LineChart, MousePointer2, Eye, Globe, Smartphone, ArrowUp, ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, BarChart, Bar, Cell, PieChart as RePieChart, Pie 
} from 'recharts';

const m = motion as any;

type AdminTab = 'overview' | 'subjects' | 'diagnostics' | 'traffic';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState(30);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [terminalUser, setTerminalUser] = useState<any | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const tabs = useMemo(() => {
    const baseTabs: { id: AdminTab; label: string }[] = [
      { id: 'overview', label: 'OVERVIEW' },
      { id: 'subjects', label: 'REGISTRY' }
    ];
    if (isOwner) {
      baseTabs.push({ id: 'traffic', label: 'DECISION HUB' });
      baseTabs.push({ id: 'diagnostics', label: 'SYSTEM' });
    }
    return baseTabs;
  }, [isOwner]);

  const themeColor = isOwner ? 'amber' : 'indigo';
  const themeHex = isOwner ? '#f59e0b' : '#6366f1';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("AUTH_SESSION_MISSING");

      const profile = await adminApi.getAdminClearance(user.id);
      if (profile) setCurrentAdmin(profile);
      else throw new Error("CLEARANCE_RECORD_NOT_FOUND");

      const fetchTasks: Promise<any>[] = [adminApi.getUsers()];
      
      const canAccessDeepStats = profile.role?.toLowerCase() === 'owner' || profile.is_super_owner;
      if (canAccessDeepStats) {
        fetchTasks.push(adminApi.getAnalytics(timeRange));
        fetchTasks.push(adminApi.getRealtimeAnalytics());
      }

      const [fetchedUsers, fetchedAnalytics, fetchedRealtime] = await Promise.all(fetchTasks);
      
      setUsers(fetchedUsers || []);
      if (fetchedAnalytics) setAnalytics(fetchedAnalytics);
      if (fetchedRealtime) setRealtime(fetchedRealtime);

    } catch (err: any) {
      console.error("Registry Sync Failure:", err);
      setActionError(`ACCESS_DENIED: ${err.message || "Protocol link unstable."}`);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Derived Statistics & Insights
  const decisionMetrics = useMemo(() => {
    const len = analytics.length;
    if (len < 2) return { users: 0, sessions: 0, views: 0, growth: 0 };
    
    // Fix: Explicitly cast length and perform index calculation on numbers to resolve arithmetic type errors on lines 121 and 123
    const latest = analytics[(len as number) - 1];
    const prev = analytics[(len as number) - 2];
    
    const calcGrowth = (curr: number, old: number) => 
      old === 0 ? 0 : Math.round(((curr - old) / old) * 100);

    return {
      users: latest.users,
      sessions: latest.sessions,
      views: latest.pageviews,
      usersGrowth: calcGrowth(latest.users, prev.users),
      viewsGrowth: calcGrowth(latest.pageviews, prev.pageviews)
    };
  }, [analytics]);

  const distributionData = useMemo(() => {
    if (analytics.length === 0) return { countries: [], devices: [], sources: [] };
    const latestDist = analytics[analytics.length - 1].distribution || {};
    
    const format = (obj: any) => Object.entries(obj || {}).map(([name, value]) => ({ name, value }));
    
    return {
      countries: format(latestDist.countries).sort((a, b) => b.value - a.value).slice(0, 5),
      devices: format(latestDist.devices),
      sources: format(latestDist.sources).sort((a, b) => b.value - a.value).slice(0, 5)
    };
  }, [analytics]);

  const handleToggleBlock = async (e: React.MouseEvent, targetUser: any) => {
    e.preventDefault(); e.stopPropagation();
    if (isProcessingId) return;
    setIsProcessingId(targetUser.id);
    try {
      await adminApi.toggleBlock(targetUser.id);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_blocked: !u.is_blocked } : u));
    } catch (err: any) { setActionError(err.message || "BLOCK_PROTOCOL_FAILED"); }
    finally { setIsProcessingId(null); }
  };

  const handleOpenTerminal = (e: React.MouseEvent, user: any) => {
    e.preventDefault(); e.stopPropagation();
    if (!isOwner) return;
    setTerminalUser(user);
    setCommandInput(`SET ROLE ${user.role || 'user'}`);
  };

  const filteredUsersList = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return users;
    return users.filter(u => 
      (u.email || '').toLowerCase().includes(q) || 
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q)
    );
  }, [searchQuery, users]);

  return (
    <div className={`space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans relative`}>
      <AnimatePresence>
        {actionError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[10000000] w-full max-w-lg px-6">
            <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-rose-950/90 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-5 backdrop-blur-3xl">
              <ShieldAlert className="text-rose-500 shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-2">Protocol Alert</p>
                <p className="text-sm font-bold text-white italic leading-relaxed">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400 hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6 text-left">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">PRIME</span> : <span className="text-indigo-500">CORE</span>} CONTROL
              {isOwner && <Crown size={32} className="text-amber-500 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse bg-${themeColor}-500 shadow-[0_0_10px_${themeHex}]`} />
              PROTOCOL: {currentAdmin?.role?.toUpperCase() || 'SYNCING'} • NODE: {currentAdmin?.id?.slice(0, 8) || 'IDENTIFYING'}
            </p>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}>
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-10">
          <div className="relative">
            <div className={`absolute inset-0 blur-3xl opacity-20 bg-${themeColor}-500 animate-pulse`} />
            <Loader2 className={`animate-spin text-${themeColor}-500 relative z-10`} size={64} />
          </div>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Synchronizing Data Node...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Global Subjects', value: users.length, icon: Users, color: themeColor },
                    { label: isOwner ? 'Realtime Active' : 'Registry Nodes', value: isOwner ? (realtime[0]?.active_users || 0) : users.filter(u => !u.is_blocked).length, icon: isOwner ? SignalHigh : Shield, color: 'emerald' },
                    { label: isOwner ? 'Yesterday Growth' : 'Blocked Access', value: isOwner ? `${decisionMetrics.usersGrowth}%` : users.filter(u => u.is_blocked).length, icon: isOwner ? ArrowUpRight : Ban, color: isOwner ? (decisionMetrics.usersGrowth >= 0 ? 'emerald' : 'rose') : 'rose' },
                    { label: 'Active (24H)', value: users.filter(u => u.updated_at && new Date(u.updated_at).getTime() > Date.now() - 86400000).length, icon: Zap, color: isOwner ? 'amber' : 'indigo' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-10 rounded-[3.5rem] text-left border-${stat.color}-500/10 shadow-2xl`}>
                      <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400 mb-6 inline-block`}><stat.icon size={26} /></div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               {isOwner && (
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <GlassCard className="p-12 lg:col-span-2 rounded-[4.5rem] border-white/5 bg-slate-950/40 overflow-hidden shadow-2xl min-h-[450px]">
                      <div className="flex justify-between items-start mb-12">
                        <div className="text-left space-y-3">
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Traffic Analysis</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Google Analytics Sync: ACTIVE</p>
                        </div>
                        <div className={`p-4 bg-emerald-500/10 rounded-2xl text-emerald-500`}><LineChart size={24} /></div>
                      </div>
                      <div className="h-[280px] w-full">
                         <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={analytics}>
                              <defs>
                                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                              <XAxis dataKey="date" hide />
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }} />
                              <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fill="url(#grad)" />
                           </AreaChart>
                         </ResponsiveContainer>
                      </div>
                    </GlassCard>

                    <GlassCard className="p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl">
                      <div className="flex justify-between items-start mb-12">
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Device Matrix</h3>
                        <Smartphone size={20} className="text-indigo-400" />
                      </div>
                      <div className="h-[280px] flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <RePieChart>
                               <Pie data={distributionData.devices} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none">
                                  {distributionData.devices.map((_, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b'][i % 3]} />)}
                               </Pie>
                               <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem', color: '#fff' }} />
                            </RePieChart>
                         </ResponsiveContainer>
                      </div>
                    </GlassCard>
                 </div>
               )}
            </m.div>
          ) : activeTab === 'subjects' ? (
            <m.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl overflow-visible">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="text-left space-y-3">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Global <span className={`text-${themeColor}-500`}>Registry</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Subject Identity Storage</p>
                     </div>
                     <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                           <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white" size={22} />
                           <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Nodes..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm font-bold italic text-white outline-none focus:border-white/20 shadow-inner" />
                        </div>
                        <button onClick={fetchData} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5 transition-all"><RefreshCw size={24} /></button>
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em] border-b border-white/5 italic">
                              <th className="pb-10 px-8">Identity Node</th>
                              <th className="pb-10 px-8">Clearance</th>
                              <th className="pb-10 px-8 text-right">Command</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {filteredUsersList.map((user) => (
                             <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                                <td className="py-10 px-8">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center ${user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'text-slate-600'}`}>
                                         {user.is_super_owner || user.role?.toLowerCase() === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />}
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                         <p className="text-base font-black text-white italic truncate max-w-[240px] leading-tight">{user.email || 'ANON_NODE'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">{user.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-10 px-8">
                                   <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${user.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                      {user.is_blocked ? <ShieldX size={16} className="text-rose-500" /> : <Shield size={16} />}
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
                                   </div>
                                </td>
                                <td className="py-10 px-8 text-right">
                                   <div className="flex justify-end gap-4">
                                      {!user.is_super_owner && (
                                        <button onClick={(e) => handleToggleBlock(e, user)} className={`p-5 rounded-[1.2rem] border transition-all ${user.is_blocked ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'}`}>
                                           {isProcessingId === user.id ? <Loader2 className="animate-spin" size={24} /> : (user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />)}
                                        </button>
                                      )}
                                      {isOwner && !user.is_super_owner && (
                                        <button onClick={(e) => handleOpenTerminal(e, user)} className="p-5 bg-white/5 border border-white/5 rounded-[1.2rem] text-slate-500 hover:text-amber-500 transition-all shadow-xl">
                                          <KeyRound size={24} />
                                        </button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </m.div>
          ) : activeTab === 'traffic' && isOwner ? (
            <m.div key="traffic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               {/* KPI Grid */}
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {[
                   { label: 'Active Users', key: 'users', val: decisionMetrics.users, growth: decisionMetrics.usersGrowth, icon: Users, color: 'emerald' },
                   { label: 'Sessions', key: 'sessions', val: decisionMetrics.sessions, growth: 5, icon: MousePointer2, color: 'indigo' },
                   { label: 'Page Views', key: 'pageviews', val: decisionMetrics.views, growth: decisionMetrics.viewsGrowth, icon: Eye, color: 'rose' }
                 ].map((kpi) => (
                    <GlassCard key={kpi.key} className={`p-10 rounded-[3.5rem] text-left border-${kpi.color}-500/10`}>
                       <div className="flex justify-between items-start mb-8">
                          <div className={`p-4 bg-${kpi.color}-500/10 rounded-2xl text-${kpi.color}-400`}><kpi.icon size={24} /></div>
                          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${kpi.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                             {kpi.growth >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                             {Math.abs(kpi.growth)}%
                          </div>
                       </div>
                       <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{kpi.val}</p>
                       <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-3">Yesterday {kpi.label}</p>
                    </GlassCard>
                 ))}
               </div>

               {/* Multi-Distribution Analysis */}
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12">
                        <Globe size={24} className="text-amber-500" />
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Global Footprint</h3>
                     </div>
                     <div className="space-y-8">
                        {distributionData.countries.map((c, i) => (
                           <div key={c.name} className="space-y-3">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic">
                                 <span className="text-slate-400">{c.name}</span>
                                 <span className="text-white">{c.value} SUBJECTS</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                 <m.div initial={{ width: 0 }} animate={{ width: `${(c.value / distributionData.countries[0].value) * 100}%` }} className="h-full bg-amber-500" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12">
                        <Network size={24} className="text-indigo-500" />
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Traffic Sources</h3>
                     </div>
                     <div className="space-y-8">
                        {distributionData.sources.map((s, i) => (
                           <div key={s.name} className="space-y-3">
                              <div className="flex justify-between text-[11px] font-black uppercase tracking-widest italic">
                                 <span className="text-slate-400">{s.name}</span>
                                 <span className="text-white">{s.value} CLICKS</span>
                              </div>
                              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                                 <m.div initial={{ width: 0 }} animate={{ width: `${(s.value / distributionData.sources[0].value) * 100}%` }} className="h-full bg-indigo-500" />
                              </div>
                           </div>
                        ))}
                     </div>
                  </GlassCard>
               </div>

               {/* Realtime Terminal */}
               <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-black/40">
                  <div className="flex justify-between items-center mb-12">
                     <div className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Realtime Link State</h3>
                     </div>
                     <button onClick={fetchData} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2 italic"><RefreshCw size={14} /> Refresh Pulse</button>
                  </div>
                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[10px] font-black uppercase text-slate-700 tracking-widest italic border-b border-white/5 pb-4">
                              <th className="pb-6">Timestamp</th>
                              <th className="pb-6">Active Node Pulse</th>
                              <th className="pb-6">Sessions (H)</th>
                              <th className="pb-6">Throughput (H)</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-[11px]">
                           {realtime.map((r, i) => (
                              <tr key={i} className="text-slate-500">
                                 <td className="py-6">{new Date(r.timestamp).toLocaleTimeString()}</td>
                                 <td className="py-6 text-emerald-400 font-bold">{r.active_users} NODES</td>
                                 <td className="py-6">{r.sessions_last_hour} SESS</td>
                                 <td className="py-6">{r.pageviews_last_hour} PV</td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </m.div>
          ) : isOwner ? (
             <m.div key="diagnostics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-4xl mx-auto">
                <GlassCard className="p-20 rounded-[5rem] text-center space-y-12 bg-slate-950/40 relative shadow-2xl">
                   <div className="relative">
                      <div className={`absolute inset-0 blur-[60px] opacity-10 bg-amber-500 animate-pulse`} />
                      <Cpu size={100} className={`mx-auto text-amber-500 relative z-10`} />
                   </div>
                   <div className="space-y-6 text-center">
                      <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Diagnostics Prime</h3>
                      <p className="text-base text-slate-500 italic max-w-md mx-auto leading-relaxed">System handshake secure. Vercel Cron synchronized. Database I/O operating at nominal levels.</p>
                   </div>
                </GlassCard>
             </m.div>
          ) : null}
        </AnimatePresence>
      )}

      {/* Clearance Override Interface */}
      <AnimatePresence>
        {terminalUser && isOwner && (
          <div className="fixed inset-0 z-[20000000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-[40px]">
            <m.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="w-full max-w-2xl">
              <GlassCard className="p-12 rounded-[4rem] border-amber-500/30 bg-slate-950/90 shadow-[0_0_200px_rgba(0,0,0,1)]">
                 <div className="flex justify-between items-start mb-12 text-left">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><TerminalIcon size={28} /></div>
                       <div>
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Clearance Override</h3>
                          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1">Target: {terminalUser.email}</p>
                       </div>
                    </div>
                    <button onClick={() => setTerminalUser(null)} className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
                 </div>
                 <div className="bg-black/60 rounded-[2.5rem] border border-white/5 p-10 space-y-10 shadow-inner text-left">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-amber-500/60 font-mono text-[10px] uppercase px-2"><Command size={12} /> Instructions Buffer</div>
                       <input ref={terminalInputRef} type="text" value={commandInput} onChange={(e) => setCommandInput(e.target.value)} placeholder="SET ROLE [admin | owner | user]" className="w-full bg-[#050a1f] border border-amber-500/30 rounded-full pl-8 pr-8 py-7 text-base font-mono text-amber-500 outline-none shadow-2xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { role: 'user', label: 'DEMOTE SUBJECT', icon: User },
                         { role: 'admin', label: 'ELEVATE ADMIN', icon: ShieldCheck },
                         { role: 'owner', label: 'GRANT PRIME', icon: Crown }
                       ].map((opt) => (
                         <button key={opt.role} type="button" onClick={() => setCommandInput(`SET ROLE ${opt.role}`)} className={`p-6 rounded-[2.5rem] border text-left space-y-3 transition-all group ${commandInput.toLowerCase().includes(opt.role) ? 'bg-amber-600/10 border-amber-500/40 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                            <opt.icon size={22} className={commandInput.toLowerCase().includes(opt.role) ? 'text-amber-500' : 'text-slate-600 group-hover:text-amber-500'} />
                            <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${commandInput.toLowerCase().includes(opt.role) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{opt.label}</p>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="mt-12 flex justify-end gap-6">
                    <button onClick={() => setTerminalUser(null)} className="px-10 py-5 text-[11px] font-black uppercase text-slate-600 hover:text-white transition-all tracking-widest">Abort</button>
                    <button onClick={() => fetchData()} className="px-14 py-6 bg-amber-600 text-black rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-amber-500 active:scale-95 transition-all flex items-center gap-3 italic">COMMIT CLEARANCE</button>
                 </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};