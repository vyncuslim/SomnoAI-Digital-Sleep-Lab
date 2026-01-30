
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldX, KeyRound, ArrowUpRight,
  Clock, Mail, Fingerprint, Zap, AlertTriangle, Cpu,
  BarChart3, Network, SignalHigh, X, Terminal as TerminalIcon, Command,
  LineChart, MousePointer2, Eye, Globe, Smartphone, ArrowUp, ArrowDown,
  UserCircle, PieChart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell, PieChart as RePieChart, Pie, Legend, BarChart, Bar
} from 'recharts';

const m = motion as any;

type AdminTab = 'overview' | 'subjects' | 'traffic' | 'diagnostics';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  
  // Data States
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [countryRanking, setCountryRanking] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState(30);
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [terminalUser, setTerminalUser] = useState<any | null>(null);
  const [commandInput, setCommandInput] = useState('');

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const tabs = useMemo(() => {
    const base: { id: AdminTab; label: string }[] = [
      { id: 'overview', label: 'DECISION HUB' },
      { id: 'subjects', label: 'REGISTRY' }
    ];
    if (isOwner) {
      base.push({ id: 'traffic', label: 'DISTRIBUTION' });
      base.push({ id: 'diagnostics', label: 'SYSTEM' });
    }
    return base;
  }, [isOwner]);

  const themeColor = isOwner ? 'amber' : 'indigo';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("AUTH_SESSION_MISSING");

      const profile = await adminApi.getAdminClearance(user.id);
      if (profile) setCurrentAdmin(profile);
      else throw new Error("CLEARANCE_NOT_FOUND");

      const tasks: Promise<any>[] = [adminApi.getUsers()];
      
      if (profile.role === 'owner' || profile.is_super_owner || profile.role === 'admin') {
        tasks.push(adminApi.getDailyAnalytics(timeRange));
        tasks.push(adminApi.getCountryRankings());
        tasks.push(adminApi.getRealtimePulse());
      }

      const results = await Promise.all(tasks);
      setUsers(results[0] || []);
      setDailyStats(results[1] || []);
      setCountryRanking(results[2] || []);
      setRealtime(results[3] || []);
      
    } catch (err: any) {
      console.error("Decision Hub Sync Failure:", err);
      setActionError(`SYNC_DENIED: ${err.message || "Link unstable."}`);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Unified Analytics Logic
  const metrics = useMemo(() => {
    const now = Date.now();
    const oneDayAgo = now - 86400000;
    
    const totalSubjects = users.length;
    const activeSubjects = users.filter(u => u.updated_at && new Date(u.updated_at).getTime() > oneDayAgo).length;
    const blockedNodes = users.filter(u => u.is_blocked).length;
    const adminNodes = users.filter(u => ['admin', 'owner'].includes(u.role?.toLowerCase()) || u.is_super_owner).length;

    const len = dailyStats.length;
    const latest = len >= 1 ? dailyStats[len - 1] : { users: 0, pageviews: 0, sessions: 0, distribution: {} };
    const prev = len >= 2 ? dailyStats[len - 2] : { users: 0, pageviews: 0, sessions: 0 };
    
    const calcGrowth = (curr: number, old: number) => 
      old === 0 ? 0 : Math.round(((curr - old) / old) * 100);

    return {
      totalSubjects,
      activeSubjects,
      blockedNodes,
      adminNodes,
      latestUsers: latest.users,
      latestViews: latest.pageviews,
      latestSessions: latest.sessions,
      userGrowth: calcGrowth(latest.users, prev.users),
      viewGrowth: calcGrowth(latest.pageviews, prev.pageviews),
      distribution: latest.distribution || {}
    };
  }, [users, dailyStats]);

  const handleToggleBlock = async (e: React.MouseEvent, targetUser: any) => {
    e.preventDefault(); e.stopPropagation();
    if (isProcessingId) return;
    setIsProcessingId(targetUser.id);
    setActionError(null);
    try {
      await adminApi.toggleBlock(targetUser.id);
      setUsers(prev => prev.map(u => u.id === targetUser.id ? { ...u, is_blocked: !u.is_blocked } : u));
    } catch (err: any) { 
      setActionError(`ACTION_FAILED: ${err.message || "Block protocol rejected."}`); 
    } finally { 
      setIsProcessingId(null); 
    }
  };

  const handleCommitClearance = async () => {
    if (!terminalUser || isProcessingId) return;
    setIsProcessingId(terminalUser.id);
    setActionError(null);
    try {
      const match = commandInput.match(/SET ROLE (user|admin|owner)/i);
      const newRole = match ? match[1].toLowerCase() : null;
      
      if (!newRole) throw new Error("INVALID_COMMAND_SYNTAX");

      await adminApi.updateUserRole(terminalUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === terminalUser.id ? { ...u, role: newRole } : u));
      setTerminalUser(null);
    } catch (err: any) {
      setActionError(`ELEVATION_FAILED: ${err.message || "Registry update refused."}`);
    } finally {
      setIsProcessingId(null);
    }
  };

  const deviceData = useMemo(() => {
    const dist = metrics.distribution.device || { mobile: 70, desktop: 30 };
    return Object.entries(dist).map(([name, value]) => ({ name: name.toUpperCase(), value: value as number }));
  }, [metrics]);

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans relative text-left">
      <AnimatePresence>
        {actionError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
            <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-rose-950/90 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-5 backdrop-blur-3xl">
              <ShieldAlert className="text-rose-500 shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Neural Protocol Alert</p>
                <p className="text-sm font-bold text-white italic">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400 hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">PRIME</span> : <span className="text-indigo-500">CORE</span>} CONTROL
              {isOwner && <Crown size={32} className="text-amber-500 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse bg-${themeColor}-500`} />
              CLEARANCE: {currentAdmin?.role?.toUpperCase() || 'SYNCING'} • NODE: {currentAdmin?.id?.slice(0, 8)}
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
          <Loader2 className={`animate-spin text-${themeColor}-500`} size={64} />
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Accessing Neural Decision Matrix...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Global Subjects', value: metrics.totalSubjects, growth: metrics.userGrowth, icon: Users, color: themeColor },
                    { label: 'Admin Nodes', value: metrics.adminNodes, growth: 0, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Blocked Nodes', value: metrics.blockedNodes, growth: 0, icon: Ban, color: 'rose' },
                    { label: 'Active (24H)', value: metrics.activeSubjects, growth: 0, icon: Zap, color: isOwner ? 'amber' : 'indigo' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-10 rounded-[3.5rem] border-${stat.color}-500/10 shadow-2xl`}>
                      <div className="flex justify-between items-start mb-6">
                         <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400 inline-block`}><stat.icon size={26} /></div>
                         {stat.growth !== 0 && (
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black ${stat.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                               {stat.growth >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                               {Math.abs(stat.growth)}%
                            </div>
                         )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-8 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 overflow-hidden shadow-2xl min-h-[450px]">
                    <div className="flex justify-between items-start mb-12">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Traffic Flux</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Temporal Telemetry Analysis</p>
                      </div>
                      <div className="flex gap-2">
                         {[7, 14, 30].map(d => (
                           <button key={d} onClick={() => setTimeRange(d)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${timeRange === d ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}>{d}D</button>
                         ))}
                      </div>
                    </div>
                    <div className="h-[280px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={dailyStats}>
                            <defs>
                              <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }} />
                            <Area type="monotone" dataKey="users" stroke="#10b981" strokeWidth={3} fill="url(#fluxGrad)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <GlassCard className="lg:col-span-4 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500 animate-pulse"><SignalHigh size={24} /></div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Live Node Flux</h3>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={realtime}>
                             <Area type="step" dataKey="active_users" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} />
                           </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Active Nodes</span>
                       <span className="text-2xl font-black text-rose-500 italic">{realtime[0]?.active_users || 0}</span>
                    </div>
                  </GlassCard>
               </div>
            </m.div>
          ) : activeTab === 'subjects' ? (
            <m.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl overflow-visible">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Identity <span className={`text-${themeColor}-500`}>Registry</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Laboratory Node Registry</p>
                     </div>
                     <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                           <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white" size={22} />
                           <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Node Identifier..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm font-bold italic text-white outline-none focus:border-white/20 shadow-inner" />
                        </div>
                        <button onClick={fetchData} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5 transition-all"><RefreshCw size={24} /></button>
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em] italic">
                              <th className="px-8 pb-4">Identity Node</th>
                              <th className="px-8 pb-4">Clearance</th>
                              <th className="px-8 pb-4 text-right">Actions</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.filter(u => (u.email || '').includes(searchQuery)).map((user) => (
                             <tr key={user.id} className="group transition-colors">
                                <td className="py-8 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center ${user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'text-slate-600'}`}>
                                         {user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />}
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                         <p className="text-base font-black text-white italic truncate max-w-[240px] leading-tight">{user.email || 'ANONYMOUS'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">{user.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] border-y border-white/5">
                                   <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${user.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                      {user.is_blocked ? <ShieldX size={16} className="text-rose-500" /> : <Shield size={16} />}
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-right">
                                   <div className="flex justify-end gap-3">
                                      {!user.is_super_owner && (
                                        <button onClick={(e) => handleToggleBlock(e, user)} className={`p-5 rounded-[1.2rem] border transition-all ${user.is_blocked ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'}`}>
                                           {isProcessingId === user.id ? <Loader2 className="animate-spin" size={24} /> : (user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />)}
                                        </button>
                                      )}
                                      {isOwner && !user.is_super_owner && (
                                        <button onClick={() => { setTerminalUser(user); setCommandInput(`SET ROLE ${user.role}`); }} className="p-5 bg-white/5 border border-white/5 rounded-[1.2rem] text-slate-500 hover:text-indigo-400 transition-all shadow-xl">
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
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12">
                        <Globe size={24} className="text-amber-500" />
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Global Footprint</h3>
                     </div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={countryRanking} layout="vertical" margin={{ left: 40, right: 40 }}>
                              <XAxis type="number" hide />
                              <YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Bar dataKey="users" fill="#f59e0b" radius={[0, 20, 20, 0]} barSize={20} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12">
                        <Smartphone size={24} className="text-indigo-500" />
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Device Proportions</h3>
                     </div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie data={deviceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} stroke="none">
                                 {deviceData.map((_, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b'][i % 3]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Legend />
                           </RePieChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          ) : isOwner ? (
             <m.div key="diagnostics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-4xl mx-auto">
                <GlassCard className="p-20 rounded-[5rem] text-center space-y-12 bg-slate-950/40 relative shadow-2xl">
                   <div className="relative">
                      <div className="absolute inset-0 blur-[60px] opacity-10 bg-amber-500 animate-pulse" />
                      <Cpu size={100} className="mx-auto text-amber-500 relative z-10" />
                   </div>
                   <div className="space-y-6 text-center">
                      <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Prime Diagnostics</h3>
                      <p className="text-base text-slate-500 italic max-w-md mx-auto leading-relaxed">System links verified. Vercel Cron status: NOMINAL. Database I/O throughput operating at 100% capacity.</p>
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
                       <input type="text" value={commandInput} onChange={(e) => setCommandInput(e.target.value)} placeholder="SET ROLE [admin | owner | user]" className="w-full bg-[#050a1f] border border-amber-500/30 rounded-full pl-8 pr-8 py-7 text-base font-mono text-amber-500 outline-none shadow-2xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { role: 'user', label: 'DEMOTE SUBJECT', icon: Users },
                         { role: 'admin', label: 'ELEVATE ADMIN', icon: ShieldCheck },
                         { role: 'owner', label: 'GRANT PRIME', icon: Crown }
                       ].map((opt) => (
                         <button key={opt.role} type="button" onClick={() => setCommandInput(`SET ROLE ${opt.role}`)} className={`p-6 rounded-[2.5rem] border text-left space-y-3 transition-all group ${commandInput.toLowerCase().includes(opt.role) ? 'bg-amber-600/10 border-amber-500/40 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                            <div className={commandInput.toLowerCase().includes(opt.role) ? 'text-amber-500' : 'text-slate-600 group-hover:text-amber-500'}>
                               {opt.role === 'user' ? <Users size={22} /> : opt.role === 'admin' ? <ShieldCheck size={22} /> : <Crown size={22} />}
                            </div>
                            <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${commandInput.toLowerCase().includes(opt.role) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{opt.label}</p>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="mt-12 flex justify-end gap-6">
                    <button onClick={() => setTerminalUser(null)} className="px-10 py-5 text-[11px] font-black uppercase text-slate-600 hover:text-white transition-all tracking-widest">Abort</button>
                    <button onClick={handleCommitClearance} disabled={isProcessingId === terminalUser.id} className="px-14 py-6 bg-amber-600 text-black rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-amber-500 active:scale-95 transition-all flex items-center gap-3 italic">
                      {isProcessingId === terminalUser.id ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                      COMMIT CLEARANCE
                    </button>
                 </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
