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
  PieChart as PieIcon, MapPin, Gauge, Layers
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
  const [diaries, setDiaries] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);
      
      // Track authorized admin ingress
      trackConversion('admin_access');

      // Simultaneous ingestion from GA4-synced tables and core system tables
      const [u, d, c, ds, r, fb, dr] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDailyAnalytics(30),
        adminApi.getCountryRankings(),
        adminApi.getDeviceSegmentation(),
        adminApi.getRealtimePulse(),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('diary_entries').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(10)
      ]);

      setUsers(u || []);
      setDailyStats(d || []);
      setCountryRanking(c || []);
      setDeviceStats(ds || []);
      setRealtime(r || []);
      setFeedback(fb.data || []);
      setDiaries(dr.data || []);
    } catch (err: any) {
      console.error("Intelligence Bridge Failure:", err);
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      {/* Dynamic Strategic Header */}
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

      {loading ? (
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
               {/* Pulse Stat Mesh */}
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

               {/* Unified Activity Canvas */}
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
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400"><MapPin size={24} /></div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Geographic Mesh (GA4)</h3>
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

                  <GlassCard className="p-12 rounded-[4.5rem] border-white/5">
                     <div className="flex items-center gap-4 mb-12">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Layers size={24} /></div>
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Daily Impact Flow</h3>
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
                           {users.filter(u => (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                             <tr key={user.id} className="group">
                                <td className="py-8 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center ${user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'text-slate-600'}`}>
                                         {user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-white italic leading-tight">{user.email || 'ANONYMOUS_NODE'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 mt-1">{user.id}</p>
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
                                   <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                      {!user.is_super_owner && (
                                        <button onClick={() => adminApi.toggleBlock(user.id).then(fetchData)} className="p-5 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20"><Ban size={24} /></button>
                                      )}
                                      {isOwner && (
                                        <button className="p-5 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-amber-500 transition-all"><KeyRound size={24} /></button>
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
          )}

          {activeTab === 'system' && (
            <m.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-8">
                     <div className="relative">
                        <div className="absolute inset-0 blur-[40px] opacity-10 bg-emerald-500 animate-pulse" />
                        <CheckCircle2 size={64} className="text-emerald-500 relative z-10" />
                     </div>
                     <div className="space-y-3">
                        <h4 className="text-lg font-black italic text-white uppercase tracking-tight">Sync Handshake Status</h4>
                        <p className="text-[10px] text-slate-500 italic leading-relaxed max-w-xs">Laboratory bridge synchronized with GA4. Last successful data pulse identified on {metrics.lastSyncDate || 'STANDBY'}.</p>
                     </div>
                     <button onClick={() => window.location.reload()} className="w-full py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 italic"><RefreshCw size={14} /> System Resync</button>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-8">
                     <Cpu size={64} className="text-indigo-500" />
                     <div className="space-y-3">
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Diagnostic Interface</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">TELEMETRY INGRESS V2.1</p>
                        <div className="pt-4 space-y-2">
                           {[
                              { k: 'GA_ID', v: 'G-3F9KVPNYLR' },
                              { k: 'DB_ENDPOINT', v: 'ojcvvtyaebdodmegwqan' },
                              { k: 'AUTH', v: 'Lockless Implicit' }
                           ].map((item) => (
                             <div key={item.k} className="flex justify-between items-center gap-10 text-[9px] border-b border-white/5 pb-2">
                                <span className="font-black text-slate-600 uppercase">{item.k}</span>
                                <span className="font-mono text-indigo-400">{item.v}</span>
                             </div>
                           ))}
                        </div>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          )}
        </AnimatePresence>
      )}

      {/* Action Error Toast */}
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