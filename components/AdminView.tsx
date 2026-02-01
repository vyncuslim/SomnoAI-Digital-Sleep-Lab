
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, KeyRound, Zap, Globe, 
  Monitor, Terminal as TerminalIcon, X, Cpu,
  LayoutDashboard, Radio, Activity, ChevronRight, 
  Send, Fingerprint, Lock, Table, List, 
  Unlock, Mail, ExternalLink, ActivitySquare,
  HeartPulse, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';
import { systemMonitor, DiagnosticResult } from '../services/systemMonitor.ts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'FORBIDDEN';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', group: 'Traffic (GA4)', icon: Activity },
  { id: 'audit_logs', group: 'System Audit', icon: List },
  { id: 'security_events', group: 'Security', icon: ShieldAlert },
  { id: 'profiles', group: 'Core Registry', icon: Users },
  { id: 'user_data', group: 'Core Registry', icon: Fingerprint },
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [pulseResult, setPulseResult] = useState<DiagnosticResult | null>(null);
  const [isPulsing, setIsPulsing] = useState(false);
  
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [dRes, sRes, uRes] = await Promise.allSettled([
        adminApi.getDailyAnalytics(30),
        adminApi.getSecurityEvents(40),
        adminApi.getUsers()
      ]);

      setDailyStats(dRes.status === 'fulfilled' ? dRes.value : []);
      setSignals(sRes.status === 'fulfilled' ? sRes.value : []);
      setUsers(uRes.status === 'fulfilled' ? uRes.value : []);
      
      const counts: Record<string, number> = {};
      for (const t of DATABASE_SCHEMA) {
        try { counts[t.id] = await adminApi.getTableCount(t.id); } catch(e) { counts[t.id] = 0; }
      }
      setTableCounts(counts);
    } catch (err: any) {
      setActionError(err.message);
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
      const data = await response.json();
      if (response.ok) {
        setSyncState('SYNCED');
        fetchData();
      } else {
        if (response.status === 403) {
          setSyncState('FORBIDDEN');
          throw new Error(`GA4 PERMISSION DENIED: Please add ${data.required_email} to your GA4 property.`);
        }
        throw new Error(data.error || "Sync gateway error.");
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
    } catch (err: any) { setActionError(err.message); }
  };

  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Command <span style={{ color: isOwner ? '#f59e0b' : '#6366f1' }}>Bridge</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry Active • Secure Node</p>
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

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-500" size={80} />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic animate-pulse">Syncing Data Mesh...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DATABASE_SCHEMA.map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><stat.icon size={20} /></div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">DB_ENTRY</span>
                      </div>
                      <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{tableCounts[stat.id] || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">{stat.group}</p>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className="p-10 rounded-[4rem] border-white/5">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 text-left">
                         <div className={`p-6 rounded-[2rem] ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400' : 'bg-rose-600/10 text-rose-400'} border border-white/5`}>
                            <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Sync</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Internal Processor Status: {syncState}</p>
                         </div>
                      </div>
                      <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center gap-3 shadow-xl italic">
                        {syncState === 'SYNCING' ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} EXECUTE MANUAL SYNC
                      </button>
                   </div>
                </GlassCard>
              </div>
            )}
            
            {activeTab === 'registry' && (
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
                              {u.is_blocked && <span className="px-3 py-1 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-full text-[8px] font-black uppercase tracking-widest">RESTRICTED</span>}
                           </div>
                        </div>
                      </div>
                      <button onClick={() => handleToggleBlock(u)} className={`p-4 rounded-xl border transition-all ${u.is_blocked ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-500'}`}>
                        {u.is_blocked ? <Unlock size={20} /> : <Ban size={20} />}
                      </button>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}

            {activeTab === 'system' && (
              <div className="max-w-2xl mx-auto space-y-12">
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20"><Cpu size={48} /></div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">System Infrastructure</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Root Node Clearance</p>
                 </div>
                 <GlassCard className="p-10 rounded-[4rem] border-white/5 text-left space-y-6">
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase italic">Identifier</span>
                       <span className="text-xs font-bold text-white">{currentAdmin?.email}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                       <span className="text-[10px] font-black text-slate-500 uppercase italic">Clearance</span>
                       <span className="text-xs font-bold text-emerald-400 uppercase">{currentAdmin?.role}</span>
                    </div>
                 </GlassCard>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {actionError && (
          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }} className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-xl px-6">
            <div className="border p-7 rounded-[3rem] shadow-2xl flex items-start gap-6 backdrop-blur-3xl text-left bg-rose-950/90 border-rose-600/50">
              <div className="p-3 rounded-2xl bg-rose-600/20 text-rose-500"><ShieldAlert size={28} /></div>
              <div className="flex-1">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] italic mb-1 text-rose-400">Handshake Exception</p>
                <p className="text-sm font-bold text-white italic leading-tight">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-slate-400 hover:bg-white/10 rounded-xl transition-all"><X size={20} /></button>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
