
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, MapPin, Layers, 
  CheckCircle, UserCircle, CheckCircle2, WifiOff, Info, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar
} from 'recharts';
import { trackConversion } from '../services/analytics.ts';
import { notifyAdmin } from '../services/telegramService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'traffic' | 'registry' | 'system';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [countryRanking, setCountryRanking] = useState<any[]>([]);
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

  const fetchData = useCallback(async (isManual = false) => {
    setLoading(true);
    setSyncStatus('syncing');
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);
      
      trackConversion('admin_access');

      const [u, d, c, r, fb] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDailyAnalytics(30),
        adminApi.getCountryRankings(),
        adminApi.getRealtimePulse(),
        supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(10)
      ]);

      setUsers(u || []);
      setDailyStats(d || []);
      setCountryRanking(c || []);
      setRealtime(r || []);
      setFeedback(fb.data || []);
      
      setSyncStatus('synced');
      setLastSyncTime(new Date().toLocaleTimeString());

      if (isManual) {
        notifyAdmin(`📊 ADMIN PULSE\nBy: ${profile?.email}\nNodes: ${u.length}\nAction: Diagnostic Manual Sync`);
      }
    } catch (err: any) {
      console.error("Intelligence Bridge Failure:", err);
      setActionError(err.message || "Failed to synchronize with Laboratory Database.");
      setSyncStatus('error');
      notifyAdmin(`🚨 CRITICAL: Admin Registry Error\nLOG: ${err.message}`);
    } finally {
      setLoading(false);
      if (syncStatus !== 'error') {
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }
  }, [syncStatus]);

  useEffect(() => { fetchData(); }, []);

  const handleToggleBlock = async (id: string) => {
    if (processingUserIds.has(id)) return;
    setProcessingUserIds(prev => new Set(prev).add(id));
    
    try {
      const targetUser = users.find(u => u.id === id);
      await adminApi.toggleBlock(id);
      const updatedUsers = await adminApi.getUsers();
      setUsers(updatedUsers);
      
      const newStatus = !targetUser?.is_blocked ? 'BLOCKED' : 'UNBLOCKED';
      notifyAdmin(`🛡️ INTERVENTION: Node ${id} set to ${newStatus}\nBy: ${currentAdmin?.email}`);
      
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

    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      const targetUser = users.find(u => u.id === id);
      
      await adminApi.updateUserRole(id, newRole);
      const updatedUsers = await adminApi.getUsers();
      setUsers(updatedUsers);
      
      notifyAdmin(`🔑 ROLE SHIFT: ${targetUser?.email}\nNew Rank: ${newRole.toUpperCase()}\nAuthorized By: ${currentAdmin?.email}`);
      
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
    return {
      totalSubjects: users.length,
      activeUsers: latest.users,
      pageViews: latest.pageviews,
      realtimePulse: realtime[0]?.active_users || 0,
    };
  }, [users, dailyStats, realtime]);

  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

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
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry Protocol: G-3F9KVPNYLR</p>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
            { id: 'traffic', label: 'TRAFFIC (GA4)', icon: Globe },
            { id: 'registry', label: 'REGISTRY (DB)', icon: Users },
            { id: 'system', label: 'DIAGNOSTICS', icon: Cpu }
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
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Synchronizing Neural Pulse...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
               <section className="space-y-8">
                  <div className="flex items-center gap-4 px-6">
                    <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400 border border-indigo-500/20">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Traffic Atlas (GA4)</h2>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Handshake ID: {lastSyncTime || 'PENDING'}</p>
                    </div>
                  </div>
                  
                  {dailyStats.length === 0 ? (
                    <GlassCard className="p-20 text-center rounded-[3.5rem] border-white/5 opacity-50">
                       <WifiOff size={48} className="mx-auto mb-4 text-slate-700" />
                       <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 italic">No GA4 data identified. Wait for daily sync or force pull.</p>
                       <button onClick={() => fetchData(true)} className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-white hover:bg-white/10">Force Neural Pull</button>
                    </GlassCard>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {[
                        { label: 'Network Flux (Daily)', value: metrics.activeUsers, icon: Globe, source: 'GA4' },
                        { label: 'Visual Intersections', value: metrics.pageViews, icon: Monitor, source: 'GA4' },
                        { label: 'Live Node Pulse', value: metrics.realtimePulse, icon: Zap, source: 'LIVE' }
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
                  )}
               </section>

               <section className="space-y-8">
                  <div className="flex items-center gap-4 px-6">
                    <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400 border border-amber-500/20">
                      <Database size={18} />
                    </div>
                    <div>
                      <h2 className="text-xl font-black italic text-white uppercase tracking-tight leading-none">Internal Registry (Supabase)</h2>
                      <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1 italic">Sovereign Data Storage</p>
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
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Neural Signals (Logs)</p>
                       </div>
                       <div className="p-6 bg-emerald-500/10 rounded-3xl text-emerald-400">
                          <MessageSquare size={32} />
                       </div>
                    </GlassCard>
                  </div>
               </section>
            </m.div>
          )}

          {activeTab === 'registry' && (
            <m.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="space-y-3 text-left w-full">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Node <span style={{ color: themeColor }}>Registry</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Database Clearance Terminal</p>
                     </div>
                     <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-white" size={22} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Filter Identifier..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-white/20 font-bold italic" />
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em] italic px-8">
                              <th className="px-8 pb-4">Identifier</th><th className="px-8 pb-4">Clearance</th><th className="px-8 pb-4 text-right">Handshake</th>
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
                                         {isSuccess ? <CheckCircle size={28} className="animate-in zoom-in" /> : (user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />)}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-white italic leading-tight">{user.email || 'ANONYMOUS'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 mt-1">{user.id.slice(0, 18)}...</p>
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
                                      {isOwner && !user.is_super_owner && (
                                        <button 
                                          onClick={() => handleToggleRole(user.id, user.role)}
                                          disabled={isProcessing || isSuccess}
                                          className={`p-5 bg-white/5 border border-white/5 rounded-2xl text-slate-500 hover:text-amber-500 transition-all ${isProcessing || isSuccess ? 'opacity-50' : ''}`}
                                          title="Modify Rank"
                                        >
                                          {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <KeyRound size={24} />}
                                        </button>
                                      )}
                                      {!user.is_super_owner && (
                                        <button 
                                          onClick={() => handleToggleBlock(user.id)} 
                                          disabled={isProcessing || isSuccess}
                                          className={`p-5 rounded-2xl transition-all border ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20'}`}
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
                  <GlassCard className={`p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col items-center text-center gap-10 transition-all duration-700 ${syncStatus === 'synced' ? 'bg-emerald-500/[0.02]' : ''}`}>
                     <div className="relative">
                        <AnimatePresence mode="wait">
                          <m.div key={syncStatus} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative z-10">
                             {syncStatus === 'syncing' ? (
                               <RefreshCw size={80} className="text-indigo-500 animate-spin" />
                             ) : syncStatus === 'error' ? (
                               <ShieldX size={80} className="text-rose-500" />
                             ) : (
                               <CheckCircle2 size={80} className={syncStatus === 'synced' ? 'text-emerald-500' : 'text-slate-700'} />
                             )}
                          </m.div>
                        </AnimatePresence>
                     </div>
                     <div className="space-y-4">
                        <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${syncStatus === 'synced' ? 'text-emerald-400' : 'text-white'}`}>Handshake Status</h4>
                        <p className="text-[11px] text-slate-500 italic leading-relaxed max-w-xs font-medium">
                          {syncStatus === 'syncing' 
                            ? 'Negotiating handshake with external GA4 stream...' 
                            : `Network bridge stable. Last pulse detected at ${lastSyncTime || 'UNKNOWN'}. Registry and GA4 are synchronized.`}
                        </p>
                     </div>
                     <button onClick={() => fetchData(true)} className="w-full py-6 rounded-full bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] italic shadow-2xl hover:bg-slate-200 transition-all">Manual Handshake</button>
                  </GlassCard>

                  <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col gap-10">
                     <div className="flex items-center justify-between w-full border-b border-white/5 pb-6">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400">
                             <ShieldAlert size={28} />
                           </div>
                           <div className="text-left w-full">
                              <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Alert Dispatch</h3>
                              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.5em] mt-2 italic">TELEGRAM BOT SYNCED</p>
                           </div>
                        </div>
                     </div>
                     
                     <div className="space-y-6 flex-1 text-left w-full">
                        {[
                           { k: 'NOTIFICATIONS', v: 'ACTIVE (TELEGRAM)', icon: Radio },
                           { k: 'SYSTEM_LOGS', v: 'REMOTE ARCHIVE', icon: Database },
                           { k: 'AUTH_GATE', v: 'IMPLICIT IMPERVIOUS', icon: Key }
                        ].map((item) => (
                          <div key={item.k} className="group flex justify-between items-center gap-6 p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-indigo-500/30 transition-all">
                             <div className="flex items-center gap-4">
                                <item.icon size={16} className="text-slate-700 group-hover:text-indigo-500 transition-colors" />
                                <span className="font-black text-slate-600 uppercase text-[10px] tracking-widest">{item.k}</span>
                             </div>
                             <span className="font-mono text-indigo-400 text-[11px] font-bold tracking-tight">{item.v}</span>
                          </div>
                        ))}
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
