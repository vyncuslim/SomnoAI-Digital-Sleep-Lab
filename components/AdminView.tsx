
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, Globe, Terminal as TerminalIcon, X, Cpu,
  LayoutDashboard, Activity, ChevronRight, Send, Fingerprint, Lock, 
  List, Unlock, Mail, ExternalLink, ActivitySquare, Copy, Clock, Check, 
  AlertTriangle, AlertCircle, Database, Search, ShieldX, Plus, MailPlus, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'automation' | 'registry' | 'explorer' | 'signals' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'STALLED' | 'FORBIDDEN' | 'NOT_FOUND';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity, desc: 'Stores aggregated daily traffic metrics from Google Analytics.' },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List, desc: 'Central log for all administrative and automated actions.' },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: ShieldAlert, desc: 'Tracks authentication attempts and potential breach indicators.' },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users, desc: 'Main identity table mapping users to roles and permissions.' },
  { id: 'user_data', name: 'Biological Metrics', group: 'Core', icon: Fingerprint, desc: 'Subject-specific biometric data and physiological metadata.' }
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  
  const [users, setUsers] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  
  const syncTimeoutRef = useRef<any>(null);
  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [sRes, uRes, rRes] = await Promise.allSettled([
        adminApi.getSecurityEvents(100),
        adminApi.getUsers(),
        adminApi.getNotificationRecipients()
      ]);

      setSignals(sRes.status === 'fulfilled' ? sRes.value : []);
      setUsers(uRes.status === 'fulfilled' ? uRes.value : []);
      setRecipients(rRes.status === 'fulfilled' ? rRes.value.data : []);
      
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
    if (syncState === 'SYNCING') return;
    
    setSyncState('SYNCING');
    setActionError(null);

    // Watchdog timer to catch "Stalled" state
    syncTimeoutRef.current = setTimeout(() => {
      setSyncState(prev => prev === 'SYNCING' ? 'STALLED' : prev);
    }, 15000);

    try {
      const response = await fetch(`/api/sync-analytics?secret=${CRON_SECRET}`);
      const data = await response.json();
      
      clearTimeout(syncTimeoutRef.current);

      if (response.ok && data.success) {
        setSyncState('SYNCED');
        fetchData();
        setTimeout(() => setSyncState('IDLE'), 4000);
      } else {
        if (response.status === 403 || data.is_permission_denied) setSyncState('FORBIDDEN');
        else if (response.status === 404) setSyncState('NOT_FOUND');
        else setSyncState('ERROR');
        throw new Error(data.error || "Handshake violation.");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const getStatusDisplay = () => {
    switch(syncState) {
      case 'IDLE': return { label: 'IDLE', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: ShieldCheck, pulse: true };
      case 'SYNCING': return { label: 'RUNNING', color: 'text-indigo-400', bg: 'bg-indigo-600/20', icon: RefreshCw, spin: true };
      case 'SYNCED': return { label: 'SYNCED', color: 'text-emerald-400', bg: 'bg-emerald-600/20', icon: Check, pulse: false };
      case 'STALLED': return { label: 'STALLED', color: 'text-amber-500', bg: 'bg-amber-600/20', icon: Clock, pulse: true };
      case 'ERROR':
      case 'FORBIDDEN':
      case 'NOT_FOUND': return { label: 'ERRORED', color: 'text-rose-500', bg: 'bg-rose-600/20', icon: ShieldX, pulse: true };
      default: return { label: 'IDLE', color: 'text-slate-500', bg: 'bg-white/5', icon: ShieldCheck, pulse: false };
    }
  };

  const status = getStatusDisplay();

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-1 md:space-y-2 text-left">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none">Command <span className="text-indigo-500">Bridge</span></h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry Active</p>
          </div>
        </div>
        
        <nav className="flex p-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {['overview', 'automation', 'registry', 'explorer', 'signals', 'system'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as AdminTab)} 
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
               {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-500" size={60} />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Data Mesh...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-10">
            {activeTab === 'overview' && (
              <div className="space-y-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DATABASE_SCHEMA.slice(0, 4).map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5">
                      <div className="flex justify-between items-start mb-6">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><stat.icon size={20} /></div>
                        <span className="text-[8px] font-black text-slate-700 uppercase tracking-widest italic">DB_ENTRY</span>
                      </div>
                      <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{tableCounts[stat.id] || 0}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-3">{stat.group}</p>
                    </GlassCard>
                  ))}
                </div>

                {/* GA4 Sync Protocol Panel */}
                <GlassCard className={`p-10 rounded-[4rem] border-white/5 transition-all duration-700 ${['ERROR', 'FORBIDDEN', 'STALLED'].includes(syncState) ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 text-left">
                         <div className={`p-6 rounded-[2rem] border border-white/5 ${status.bg} ${status.color}`}>
                            <ActivitySquare size={32} className={status.spin ? 'animate-spin' : ''} />
                         </div>
                         <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Hub</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1 italic text-slate-500">
                              Target Property: <code>380909155</code>
                            </p>
                         </div>
                      </div>

                      <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-6">
                        {/* Persistent Status Indicator */}
                        <div className={`flex items-center gap-3 px-6 py-3 rounded-full border border-white/5 ${status.bg} transition-all duration-500 min-w-[140px] justify-center shadow-lg shadow-black/20`}>
                           <div className={`w-2 h-2 rounded-full ${status.color} ${status.pulse ? 'animate-pulse' : ''} shadow-[0_0_10px_currentColor]`} />
                           <span className={`text-[10px] font-black uppercase tracking-[0.2em] italic ${status.color}`}>
                             {status.label}
                           </span>
                        </div>

                        <button 
                          onClick={handleManualSync} 
                          disabled={syncState === 'SYNCING'}
                          className="w-full md:w-auto px-12 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 shadow-xl italic active:scale-95"
                        >
                          {syncState === 'SYNCING' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} 
                          EXECUTE SYNC
                        </button>
                      </div>
                   </div>

                   {actionError && (
                     <div className="mt-8 p-6 bg-rose-600/10 border border-rose-500/20 rounded-[2rem] flex items-center gap-4">
                        <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                        <p className="text-[11px] font-bold text-rose-400 italic">GATEWAY_FAULT: {actionError}</p>
                     </div>
                   )}
                </GlassCard>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
