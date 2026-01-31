
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, MapPin, Layers, 
  CheckCircle, UserCircle, CheckCircle2, WifiOff, Info, Key, AlertCircle, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { trackConversion } from '../services/analytics.ts';
import { notifyAdmin } from '../services/telegramService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'traffic' | 'registry' | 'signals' | 'system';
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingUserIds, setProcessingUserIds] = useState<Set<string>>(new Set());
  const [successUserIds, setSuccessUserIds] = useState<Set<string>>(new Set());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const fetchData = useCallback(async (isManual = false) => {
    setLoading(true);
    setSyncStatus('syncing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);
      
      trackConversion('admin_access');

      const [u, d, s, r] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDailyAnalytics(30),
        adminApi.getSecurityEvents(30),
        adminApi.getRealtimePulse()
      ]);

      setUsers(u || []);
      setDailyStats(d || []);
      setSignals(s || []);
      setRealtime(r || []);
      
      setSyncStatus('synced');
      if (isManual) notifyAdmin(`📊 ADMIN_PULSE: Manual Registry Sync Executed by ${profile?.email}`);
    } catch (err: any) {
      setActionError(err.message || "Database synchronization failure.");
      setSyncStatus('error');
    } finally {
      setLoading(false);
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  const handleToggleBlock = async (id: string) => {
    if (processingUserIds.has(id)) return;
    setProcessingUserIds(prev => new Set(prev).add(id));
    try {
      await adminApi.toggleBlock(id);
      const updated = await adminApi.getUsers();
      setUsers(updated);
      setSuccessUserIds(prev => new Set(prev).add(id));
      setTimeout(() => setSuccessUserIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 3000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessingUserIds(prev => { const n = new Set(prev); n.delete(id); return n; });
    }
  };

  const handleToggleRole = async (id: string, currentRole: string) => {
    if (!isOwner || processingUserIds.has(id)) return;
    setProcessingUserIds(prev => new Set(prev).add(id));
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await adminApi.updateUserRole(id, newRole);
      const updated = await adminApi.getUsers();
      setUsers(updated);
      setSuccessUserIds(prev => new Set(prev).add(id));
      setTimeout(() => setSuccessUserIds(prev => { const n = new Set(prev); n.delete(id); return n; }), 3000);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setProcessingUserIds(prev => { const n = new Set(prev); n.delete(id); return n; });
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
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Intelligence <span style={{ color: themeColor }}>Command</span>
            </h1>
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-500" />
               <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry G-3F9KVPNYLR</p>
            </div>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'OVERVIEW', icon: LayoutDashboard },
            { id: 'registry', label: 'REGISTRY', icon: Users },
            { id: 'signals', label: 'SIGNALS (LOGS)', icon: Radio },
            { id: 'system', label: 'DIAGNOSTICS', icon: Cpu }
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

      {loading && syncStatus === 'syncing' ? (
        <div className="flex flex-col items-center justify-center py-48 gap-8">
          <div className="relative"><Loader2 className="animate-spin text-indigo-500" size={64} /></div>
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Synthesizing Registry...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-16">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Identified Nodes', value: users.length, icon: Users },
                    { label: 'Recent Signals', value: signals.length, icon: Radio },
                    { label: 'Realtime Link', value: realtime[0]?.active_users || 0, icon: Zap }
                  ].map((stat, i) => (
                    <GlassCard key={i} className="p-10 rounded-[3.5rem] border-white/5">
                      <div className="flex justify-between items-start mb-8">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><stat.icon size={26} /></div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>
            </m.div>
          )}

          {activeTab === 'registry' && (
            <m.div key="registry" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="space-y-3 w-full">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Node <span style={{ color: themeColor }}>Registry</span></h3>
                     </div>
                     <div className="relative w-full md:w-96">
                        <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700" size={22} />
                        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Query ID..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-white/20 font-bold italic" />
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em] italic px-8">
                              <th className="px-8 pb-4">Identifier</th><th className="px-8 pb-4 text-right">Intervention</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.filter(u => (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((user) => {
                             const isProc = processingUserIds.has(user.id);
                             const isSucc = successUserIds.has(user.id);
                             return (
                             <tr key={user.id} className="group">
                                <td className="py-8 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center ${isSucc ? 'text-emerald-500' : 'text-slate-600'}`}>
                                         {isSucc ? <CheckCircle size={28} /> : (user.is_super_owner ? <Crown size={28} className="text-amber-500" /> : <UserCircle size={28} />)}
                                      </div>
                                      <div>
                                         <p className="text-base font-black text-white italic leading-tight">{user.email || 'ANONYMOUS'}</p>
                                         <span className={`text-[9px] font-black uppercase tracking-widest ${user.role === 'admin' ? 'text-indigo-400' : 'text-slate-600'}`}>{user.role}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-right">
                                   <div className="flex justify-end gap-3 opacity-20 group-hover:opacity-100 transition-opacity">
                                      {isOwner && !user.is_super_owner && (
                                        <button onClick={() => handleToggleRole(user.id, user.role)} disabled={isProc} className="p-5 bg-white/5 rounded-2xl text-slate-500 hover:text-amber-500">
                                          {isProc ? <Loader2 size={24} className="animate-spin" /> : <KeyRound size={24} />}
                                        </button>
                                      )}
                                      {!user.is_super_owner && (
                                        <button onClick={() => handleToggleBlock(user.id)} disabled={isProc} className={`p-5 rounded-2xl transition-all border ${user.is_blocked ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                          {isProc ? <Loader2 size={24} className="animate-spin" /> : user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />}
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

          {activeTab === 'signals' && (
            <m.div key="signals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60">
                  <div className="flex items-center gap-4 mb-16 px-4">
                     <Radio className="text-indigo-400 animate-pulse" size={24} />
                     <div className="space-y-1">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Security <span className="text-indigo-500">Signals</span></h3>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] italic">Realtime Authentication Audit</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     {signals.length === 0 ? (
                       <div className="py-32 text-center opacity-30 italic"><p className="text-slate-500 font-black tracking-widest uppercase">No recent signal detections.</p></div>
                     ) : (
                       signals.map((sig, idx) => (
                         <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                            <div className="flex items-center gap-6">
                               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${
                                 sig.event_type.includes('SUCCESS') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                                 sig.event_type.includes('FAIL') ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                                 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                               }`}>
                                 {sig.event_type.includes('FAIL') ? <ShieldX size={20} /> : <Radio size={20} />}
                               </div>
                               <div className="space-y-1">
                                  <p className="text-base font-black text-white italic tracking-tight uppercase leading-none">{sig.event_type}</p>
                                  <p className="text-[10px] font-bold text-slate-600 tracking-wider italic">{sig.user_email || 'ANONYMOUS_HANDSHAKE'} • {sig.details}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="flex items-center gap-2 justify-end text-slate-700 group-hover:text-slate-400 transition-colors">
                                 <Clock size={12} />
                                 <p className="text-[9px] font-mono font-black">{new Date(sig.created_at).toLocaleString()}</p>
                               </div>
                            </div>
                         </div>
                       ))
                     )}
                  </div>
               </GlassCard>
            </m.div>
          )}

          {activeTab === 'system' && (
            <m.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <GlassCard className="p-12 rounded-[4rem] flex flex-col items-center text-center gap-8">
                  <div className="p-6 bg-indigo-500/10 rounded-[2.5rem] text-indigo-400"><RefreshCw size={48} /></div>
                  <div>
                    <h4 className="text-2xl font-black italic uppercase tracking-tight text-white">Manual Handshake</h4>
                    <p className="text-[11px] text-slate-500 italic mt-2">Force synchronize external telemetry records with the local node.</p>
                  </div>
                  <button onClick={() => fetchData(true)} className="w-full py-6 bg-white text-black font-black text-[10px] uppercase tracking-[0.4em] rounded-full active:scale-95 transition-all">Execute Pulse</button>
               </GlassCard>
               
               <GlassCard className="p-12 rounded-[4rem] flex flex-col gap-10">
                  <div className="flex items-center gap-4">
                     <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500"><ShieldAlert size={24} /></div>
                     <h3 className="text-xl font-black italic text-white uppercase">System Integrity</h3>
                  </div>
                  <div className="space-y-4">
                     <div className="flex justify-between p-5 bg-black/40 rounded-3xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">TELEGRAM_UPLINK</span>
                        <span className="text-indigo-400 font-black text-[10px]">SYNCED</span>
                     </div>
                     <div className="flex justify-between p-5 bg-black/40 rounded-3xl border border-white/5">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">LOGGING_PROTOCOL</span>
                        <span className="text-emerald-400 font-black text-[10px]">ACTIVE</span>
                     </div>
                  </div>
               </GlassCard>
            </m.div>
          )}
        </AnimatePresence>
      )}

      <AnimatePresence>
        {actionError && (
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
            <div className="bg-rose-950/90 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-5 backdrop-blur-3xl">
              <ShieldAlert className="text-rose-500 shrink-0" size={24} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Critical Exception</p>
                <p className="text-sm font-bold text-white italic">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400"><X size={18} /></button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
