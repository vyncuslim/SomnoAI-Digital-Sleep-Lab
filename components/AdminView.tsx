
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, Activity,
  ChevronRight, Send, Smartphone, BarChart3, Fingerprint,
  Lock, Table, List, Clock, TrendingUp,
  CheckCircle2, Unlock, WifiOff, Mail, ExternalLink, ActivitySquare, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { trackConversion } from '../services/analytics.ts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'TIMEOUT';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', group: 'Traffic (GA4)', icon: Activity },
  { id: 'analytics_country', group: 'Traffic (GA4)', icon: Globe },
  { id: 'analytics_device', group: 'Traffic (GA4)', icon: Smartphone },
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
  
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);

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
    } catch (err: any) {
      setActionError(err.message || "Mesh synchronization failure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { label: 'Daily Users (GA4)', value: dailyStats[dailyStats.length - 1]?.users || 0, icon: Globe, source: 'GA4' },
                    { label: 'Audit Records', value: tableCounts['audit_logs'] || 0, icon: List, source: 'DB' },
                    { label: 'Subject Profiles', value: tableCounts['profiles'] || 0, icon: Users, source: 'DB' },
                    { label: 'Security Pulses', value: tableCounts['security_events'] || 0, icon: ShieldAlert, source: 'DB' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><stat.icon size={22} /></div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest">{stat.source}</span>
                      </div>
                      <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{stat.label}</p>
                    </GlassCard>
                  ))}
               </div>

               <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-indigo-500/[0.01]">
                 <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="flex items-center gap-6 text-left">
                     <div className={`p-5 rounded-[1.8rem] ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-600/10 text-rose-400 border-rose-500/20'} border`}>
                       <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin text-indigo-400' : ''} />
                     </div>
                     <div>
                       <h3 className="text-xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Hub</h3>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">
                         Status: {syncState === 'SYNCED' ? 'DATA FLOW ACTIVE' : syncState === 'SYNCING' ? 'HANDSHAKING...' : 'LINK INTERRUPTED'}
                       </p>
                     </div>
                   </div>
                   
                   <div className="flex flex-wrap gap-4 items-center justify-center">
                     <div className="px-6 py-4 bg-black/40 rounded-2xl border border-white/5 text-center min-w-[140px]">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Mirror Integrity</p>
                        <p className={`text-xs font-black italic uppercase ${syncState === 'SYNCED' ? 'text-emerald-400' : 'text-rose-400'}`}>{syncState}</p>
                     </div>
                     <div className="px-6 py-4 bg-black/40 rounded-2xl border border-white/5 text-center min-w-[140px]">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">Last Ingress</p>
                        <p className="text-xs font-black italic text-white uppercase">{lastSyncTime || 'VOID'}</p>
                     </div>
                     <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-3 shadow-xl">
                       {syncState === 'SYNCING' ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Manual Sync
                     </button>
                   </div>
                 </div>
               </GlassCard>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8 space-y-6 text-left">
                     <h3 className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.4em] italic px-6 flex items-center gap-2"><TrendingUp size={14} /> Traffic Velocity (30D)</h3>
                     <GlassCard className="p-10 rounded-[4rem] border-white/5 h-[400px] flex items-center justify-center relative">
                        {dailyStats.length > 0 ? (
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={dailyStats}>
                                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                 <XAxis dataKey="date" hide />
                                 <YAxis hide domain={['auto', 'auto']} />
                                 <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem', color: '#fff' }} />
                                 <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={5} fillOpacity={0.1} fill="#6366f1" />
                              </AreaChart>
                           </ResponsiveContainer>
                        ) : (
                          <div className="text-center space-y-4 opacity-30">
                            <WifiOff size={48} className="mx-auto" />
                            <p className="text-[10px] font-black uppercase tracking-widest">No mirror data resident in registry</p>
                          </div>
                        )}
                     </GlassCard>
                  </div>
                  <div className="lg:col-span-4 space-y-6 text-left">
                     <h3 className="text-[11px] font-black uppercase text-rose-400 tracking-[0.4em] italic px-6 flex items-center gap-2"><Activity size={14} /> Critical Signals</h3>
                     <div className="space-y-4 max-h-[400px] overflow-y-auto no-scrollbar">
                        {signals.slice(0, 8).map((sig, i) => (
                           <div key={i} className="p-5 bg-white/[0.02] border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                              <div className="flex items-center gap-4 text-left">
                                 <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${sig.event_type.includes('SUCCESS') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                                    {sig.event_type.includes('SUCCESS') ? <ShieldCheck size={20} /> : <ShieldAlert size={20} />}
                                 </div>
                                 <div className="space-y-0.5 text-left">
                                    <p className="text-xs font-black text-white italic uppercase tracking-tight truncate w-32">{sig.event_type}</p>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase">{new Date(sig.created_at).toLocaleTimeString()}</p>
                                 </div>
                              </div>
                              <ChevronRight size={14} className="text-slate-800" />
                           </div>
                        ))}
                     </div>
                  </div>
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
