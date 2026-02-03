import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, KeyRound, Zap, Globe, 
  Monitor, Terminal as TerminalIcon, X, Cpu,
  LayoutDashboard, Radio, Activity, ChevronRight, 
  Send, Fingerprint, Lock, Table, List, 
  Unlock, Mail, ExternalLink, ActivitySquare,
  HeartPulse, Copy, Clock, Settings2, Check, AlertTriangle, Info,
  Rocket, MousePointer2, Trash2, Database, Search, Shield, AlertCircle, Key,
  ExternalLink as LinkIcon, HelpCircle, Bug, FileJson, User, Flame, Activity as MonitoringIcon, Eye, ChevronDown,
  Calendar, ShieldX, Plus, MailPlus, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'automation' | 'registry' | 'explorer' | 'signals' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'FORBIDDEN' | 'NOT_FOUND';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity, desc: 'Stores aggregated daily traffic metrics from Google Analytics.' },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List, desc: 'Central log for all administrative and automated actions.' },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: ShieldAlert, desc: 'Tracks authentication attempts and potential breach indicators.' },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users, desc: 'Main identity table mapping users to roles and permissions.' },
  { id: 'user_data', name: 'Biological Metrics', group: 'Core', icon: Fingerprint, desc: 'Subject-specific biometric data and physiological metadata.' },
  { id: 'diary_entries', name: 'Subject Journals', group: 'Engagement', icon: List, desc: 'User-submitted sleep logs and mood annotations.' },
  { id: 'feedback', name: 'Nexus Feedback', group: 'Engagement', icon: Mail, desc: 'Consolidated report logs from user terminal interactions.' }
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [recipients, setRecipients] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastRawError, setLastRawError] = useState<any>(null);
  
  const [newEmail, setNewEmail] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isAddingRecipient, setIsAddingRecipient] = useState(false);

  const [serverPulse, setServerPulse] = useState<any>(null);
  const [saEmail, setSaEmail] = useState<string>("");

  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  const fetchServerPulse = useCallback(async () => {
    try {
      const response = await fetch(`/api/monitor-pulse?secret=${CRON_SECRET}`);
      if (response.ok) {
        const data = await response.json();
        setServerPulse(data);
        if (data.service_account_email) setSaEmail(data.service_account_email);
      }
    } catch (e) {
      console.warn("Pulse fetch failed.");
    }
  }, []);

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
      
      fetchServerPulse();
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, [fetchServerPulse]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || isAddingRecipient) return;
    setIsAddingRecipient(true);
    try {
      const { error } = await adminApi.addNotificationRecipient(newEmail, newLabel || 'Standard Recipient');
      if (error) throw error;
      setNewEmail('');
      setNewLabel('');
      fetchData();
    } catch (err: any) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setIsAddingRecipient(false);
    }
  };

  const handleRemoveRecipient = async (id: string, email: string) => {
    if (!window.confirm(`Sever notification link for ${email}?`)) return;
    try {
      const { error } = await adminApi.removeNotificationRecipient(id, email);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`Severance failed: ${err.message}`);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRoleUpdate = async (userId: string, email: string, newRole: string) => {
    if (!window.confirm(`Escalate node ${email} to ${newRole.toUpperCase()}?`)) return;
    try {
      const { error } = await adminApi.updateUserRole(userId, email, newRole);
      if (error) throw error;
      fetchData(); 
    } catch (err: any) {
      alert(`Role transition failed: ${err.message}`);
    }
  };

  const handleToggleBlock = async (id: string, email: string, currentlyBlocked: boolean) => {
    const action = currentlyBlocked ? 'UNBLOCK' : 'BLOCK';
    if (!window.confirm(`${action} access for node ${email}?`)) return;
    try {
      const { error } = await adminApi.toggleBlock(id, email, currentlyBlocked);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      alert(`${action} protocol failed: ${err.message}`);
    }
  };

  const handleManualSync = async () => {
    setSyncState('SYNCING');
    setActionError(null);
    setLastRawError(null);
    try {
      const response = await fetch(`/api/sync-analytics?secret=${CRON_SECRET}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setSyncState('SYNCED');
        fetchData();
      } else {
        setLastRawError(data);
        if (data.is_permission_denied || response.status === 403) {
          setSyncState('FORBIDDEN');
          if (data.service_account) setSaEmail(data.service_account);
        }
        else if (data.is_not_found || response.status === 404) setSyncState('NOT_FOUND');
        else setSyncState('ERROR');
        throw new Error(data.error || "Sync gateway protocol violation.");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const getSyncBadgeConfig = () => {
    switch(syncState) {
      case 'SYNCING': return { label: 'RUNNING', color: 'bg-indigo-600/20 text-indigo-400', animate: true, icon: RefreshCw };
      case 'SYNCED': return { label: 'SYNCED', color: 'bg-emerald-600/20 text-emerald-400', animate: false, icon: Check };
      case 'ERROR':
      case 'FORBIDDEN':
      case 'NOT_FOUND': return { label: 'BLOCKER', color: 'bg-rose-600/20 text-rose-500', animate: true, icon: AlertTriangle };
      case 'STALE': return { label: 'STALLED', color: 'bg-amber-600/20 text-amber-500', animate: false, icon: Clock };
      default: return { label: 'READY', color: 'bg-white/5 text-slate-500', animate: false, icon: ShieldCheck };
    }
  };

  const syncBadge = getSyncBadgeConfig();
  const isGlobalOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;

  // Validate Property ID format (Should be a string of digits, e.g. 345678901)
  const isProperIdFormat = (id: string) => {
    const cleanId = id.replace(/^properties\//, '');
    return /^\d+$/.test(cleanId);
  };

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      <AnimatePresence>
        {(syncState === 'FORBIDDEN' || syncState === 'ERROR') && (
          <m.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="bg-rose-600/15 border-b border-rose-600/30 overflow-hidden sticky top-0 z-[100] backdrop-blur-xl shadow-2xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-left">
                <div className="p-2.5 bg-rose-600 rounded-xl text-white animate-pulse">
                  <ShieldAlert size={20} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none italic">Action Required</p>
                  <p className="text-sm font-black text-white italic">
                    {syncState === 'FORBIDDEN' ? '403 Forbidden: Google Analytics Link Severed.' : `Sync Failed: ${lastRawError?.failed_at || 'Handshake Error'}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => {
                  const el = document.getElementById('resolution-anchor');
                  el?.scrollIntoView({ behavior: 'smooth' });
                  setActiveTab('overview');
                }} 
                className="px-6 py-2.5 bg-white text-rose-600 rounded-full font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all italic shadow-lg hover:bg-rose-50"
              >
                ACCESS PROTOCOL FIX
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-1 md:space-y-2 text-left">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Command <span style={{ color: isGlobalOwner ? '#f59e0b' : '#6366f1' }}>Bridge</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic leading-none">Telemetry Active • Secure Node</p>
          </div>
        </div>
        
        <nav className="flex p-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar max-w-full">
          {['overview', 'automation', 'registry', 'explorer', 'signals', 'system'].map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab as AdminTab)} 
              className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
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
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {activeTab === 'overview' && (
              <div className="space-y-10">
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

                <GlassCard id="resolution-anchor" className={`p-10 rounded-[4rem] border-white/5 transition-all duration-700 ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'border-rose-500/40 bg-rose-500/[0.03]' : ''}`}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 text-left">
                         <div className={`p-6 rounded-[2rem] border border-white/5 ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400' : ['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'bg-rose-600/10 text-rose-500' : 'bg-indigo-600/10 text-indigo-400'}`}>
                            {['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? <ShieldAlert size={32} /> : <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Sync</h3>
                            <p className="text-[10px] font-black uppercase tracking-widest mt-1 italic text-slate-500">
                              Active monitoring for subject traffic nodes
                            </p>
                         </div>
                      </div>
                      <div className="w-full md:w-auto flex flex-col md:flex-row items-center gap-6">
                        <div className={`px-4 py-2 rounded-full border border-white/5 flex items-center gap-3 transition-all duration-500 ${syncBadge.color} ${syncBadge.animate ? 'animate-pulse' : ''}`}>
                           <syncBadge.icon size={12} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />
                           <span className="text-[9px] font-black uppercase tracking-[0.2em] italic">{syncBadge.label}</span>
                        </div>

                        <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="w-full md:w-auto px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl italic">
                          {syncState === 'SYNCING' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} SYNC NOW
                        </button>
                      </div>
                   </div>
                   
                   <AnimatePresence>
                     {(syncState === 'FORBIDDEN' || (lastRawError?.property_id && !isProperIdFormat(lastRawError.property_id))) && (
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-6 text-left">
                          <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-5">
                             <AlertCircle className="text-rose-500 shrink-0 mt-1" size={24} />
                             <div className="space-y-1">
                                <h4 className="text-sm font-black text-white uppercase italic">Infrastructure Protocol Disruption</h4>
                                <p className="text-[11px] text-slate-400 italic leading-relaxed">
                                  Access to Google Analytics is being blocked. Either the Service Account is not authorized, or the Property ID format is incorrect.
                                </p>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="p-8 bg-slate-900/60 rounded-[2.5rem] border border-white/5 space-y-6">
                               <p className="text-xs text-white font-black italic flex items-center gap-3">
                                 <TerminalIcon size={14} className="text-indigo-400" /> Resolution Logic:
                               </p>
                               <ol className="space-y-4 text-[11px] text-slate-400 list-decimal pl-5 italic font-medium leading-relaxed">
                                  <li>Access the <a href="https://analytics.google.com/analytics/web/#/admin" target="_blank" rel="noreferrer" className="text-indigo-400 font-bold underline">GA Admin Console</a>.</li>
                                  <li>Check <b>Property ID</b>: It should be numeric (e.g., <code>4567890</code>), not a G-ID or UA-ID. Current: <code className="text-indigo-300 font-bold">{lastRawError?.property_id || 'UNKNOWN'}</code></li>
                                  <li>Go to <b>Property Access Management</b>.</li>
                                  <li>Add a new user with the <b>Service Email</b> shown on the right.</li>
                                  <li>Assign role: <span className="text-white font-bold bg-indigo-600/20 px-2 py-0.5 rounded">Viewer</span>.</li>
                                  <li>Verify <b>GA_SERVICE_ACCOUNT_KEY</b> in Vercel is a valid JSON string without extra wrapping quotes.</li>
                               </ol>
                             </div>
                             
                             <div className="space-y-4 flex flex-col justify-center">
                               <div className="p-8 bg-black/60 border border-indigo-500/30 rounded-[3rem] flex flex-col gap-4 relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-6 opacity-5"><Mail size={80} /></div>
                                  <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest italic flex items-center gap-2">
                                     <Mail size={12} /> Service Account Email
                                  </span>
                                  <code className="text-[12px] font-mono text-indigo-100 font-black break-all select-all leading-tight bg-white/5 p-4 rounded-2xl border border-white/5">
                                    {lastRawError?.service_account || saEmail || 'SYNC_REQUIRED'}
                                  </code>
                                  <button 
                                    onClick={() => handleCopy(lastRawError?.service_account || saEmail, 'sa_copy_err')} 
                                    className="flex items-center gap-3 text-[10px] font-black text-white bg-indigo-600 px-6 py-4 rounded-full w-full justify-center hover:bg-indigo-500 transition-all uppercase mt-2 shadow-xl shadow-indigo-600/20 italic"
                                  >
                                    {copiedKey === 'sa_copy_err' ? <Check size={16} /> : <Copy size={16} />} 
                                    {copiedKey === 'sa_copy_err' ? 'Copied' : 'Copy Service Email'}
                                  </button>
                               </div>

                               <div className="p-5 bg-slate-900/40 rounded-[2rem] border border-white/5 flex items-center justify-between px-8">
                                  <span className="text-[9px] font-black text-slate-500 uppercase italic">Active Property ID</span>
                                  <div className="flex items-center gap-3">
                                    <span className={`text-xs font-mono font-black ${isProperIdFormat(lastRawError?.property_id || '') ? 'text-white' : 'text-rose-500'}`}>
                                      {lastRawError?.property_id || 'UNDEFINED'}
                                    </span>
                                    {lastRawError?.property_id && !isProperIdFormat(lastRawError.property_id) && (
                                      <div className="group relative">
                                        <AlertTriangle size={14} className="text-rose-500 animate-pulse" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-rose-600 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none font-bold italic shadow-xl z-50">
                                          Format Violation: ID must be numeric. Remove 'properties/' or 'G-' prefixes.
                                        </div>
                                      </div>
                                    )}
                                  </div>
                               </div>
                             </div>
                          </div>
                       </m.div>
                     )}
                   </AnimatePresence>
                </GlassCard>
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <Users size={24} className="text-indigo-400" />
                    <h2 className="text-2xl font-black italic text-white uppercase">Subject Registry</h2>
                  </div>
                  <button onClick={fetchData} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><RefreshCw size={18} /></button>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {users.length > 0 ? users.map((user) => (
                    <GlassCard key={user.id} className="p-6 md:p-8 rounded-[2.5rem] border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 group">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 font-black italic text-xl shadow-inner relative">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                          {user.is_super_owner && (
                             <div className="absolute -top-2 -right-2 bg-amber-500 text-black p-1 rounded-lg shadow-lg">
                                <Crown size={12} />
                             </div>
                          )}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-black text-white italic">{user.full_name || 'Anonymous Node'}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${user.is_super_owner ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]' : user.role === 'owner' ? 'bg-amber-500/20 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                              {user.is_super_owner ? 'SUPER OWNER' : user.role}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="flex gap-2">
                           <button 
                             onClick={() => handleRoleUpdate(user.id, user.email, 'admin')} 
                             disabled={user.is_super_owner}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-600 hover:text-white disabled:opacity-10 disabled:grayscale'}`}
                           >ADMIN</button>
                           <button 
                             onClick={() => handleRoleUpdate(user.id, user.email, 'user')} 
                             disabled={user.is_super_owner}
                             className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.role === 'user' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 text-slate-600 hover:text-white disabled:opacity-10 disabled:grayscale'}`}
                           >USER</button>
                        </div>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <button 
                          onClick={() => handleToggleBlock(user.id, user.email, !!user.is_blocked)} 
                          disabled={user.is_super_owner}
                          className={`p-3 rounded-xl transition-all ${user.is_blocked ? 'bg-rose-600/20 text-rose-500 shadow-lg shadow-rose-600/20' : 'bg-white/5 text-slate-600 hover:text-rose-500 disabled:opacity-10 disabled:cursor-not-allowed'}`}
                        >
                          {user.is_blocked ? <Unlock size={18} /> : <Ban size={18} />}
                        </button>
                      </div>
                    </GlassCard>
                  )) : (
                    <div className="py-32 text-center italic text-slate-600">No identity nodes synchronized.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <MonitoringIcon size={24} className="text-rose-500" />
                    <h2 className="text-2xl font-black italic text-white uppercase">Security Signals</h2>
                  </div>
                  <button onClick={fetchData} className="p-3 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><RefreshCw size={18} /></button>
                </div>
                <div className="space-y-4">
                  {signals.length > 0 ? signals.map((sig) => (
                    <GlassCard key={sig.id} className="p-6 rounded-[2rem] border-white/5 flex gap-6 items-start group">
                      <div className={`p-4 rounded-2xl shrink-0 ${sig.event_type.includes('FAIL') || sig.event_type.includes('ERROR') || sig.event_type.includes('DENIED') ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                         {sig.event_type.includes('FAIL') || sig.event_type.includes('DENIED') ? <ShieldX size={20} /> : <Activity size={20} />}
                      </div>
                      <div className="space-y-2 flex-1 text-left">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                           <div className="flex items-center gap-3">
                              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white italic">{sig.event_type}</span>
                              <span className="text-[9px] font-mono text-slate-600 uppercase">{new Date(sig.created_at).toLocaleString()}</span>
                           </div>
                           <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{sig.email || 'SYSTEM'}</span>
                        </div>
                        <div className="p-4 bg-black/40 rounded-2xl border border-white/5">
                           <code className="text-[11px] font-mono text-slate-400 leading-relaxed block break-all whitespace-pre-wrap">{sig.event_reason || 'No detailed reason provided.'}</code>
                        </div>
                      </div>
                    </GlassCard>
                  )) : (
                    <div className="py-32 text-center italic text-slate-600">Signal grid quiet. No exceptions detected.</div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'explorer' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="flex items-center gap-4 px-4">
                  <Database size={24} className="text-emerald-400" />
                  <h2 className="text-2xl font-black italic text-white uppercase">Data Shards</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {DATABASE_SCHEMA.map((table) => (
                     <GlassCard key={table.id} className="p-8 rounded-[3rem] border-white/5 space-y-6 flex flex-col justify-between hover:bg-white/[0.02] transition-all">
                        <div className="space-y-4">
                           <div className="flex justify-between items-start">
                              <div className="p-3 bg-white/5 rounded-2xl text-emerald-400"><table.icon size={20} /></div>
                              <div className="text-right">
                                 <p className="text-3xl font-black text-white italic">{tableCounts[table.id] || 0}</p>
                                 <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TOTAL_RECORDS</p>
                              </div>
                           </div>
                           <div className="space-y-1">
                              <h3 className="text-sm font-black text-white uppercase italic tracking-tight">{table.name}</h3>
                              <p className="text-[10px] text-slate-500 italic leading-relaxed">{table.desc}</p>
                           </div>
                        </div>
                        <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                           <span className="text-[8px] font-mono text-slate-700 uppercase tracking-widest">ID: {table.id}</span>
                           <Search size={14} className="text-slate-800" />
                        </div>
                     </GlassCard>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'automation' && (
               <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl"><Zap size={36} /></div>
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Automation Engine</h2>
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Background Ops Terminal</p>
                  </div>

                  {/* Recipient Matrix Section */}
                  <GlassCard className="p-10 rounded-[4rem] border-emerald-500/20 bg-emerald-500/[0.02] space-y-10">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><MailPlus size={24} /></div>
                           <h3 className="text-xl font-black italic text-white uppercase">Recipient Matrix</h3>
                        </div>
                        <div className="px-4 py-1.5 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">{recipients.length} ACTIVE</div>
                     </div>

                     <form onSubmit={handleAddRecipient} className="flex flex-col md:flex-row gap-4">
                        <input 
                          type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="New Email Target..."
                          className="flex-1 bg-black/40 border border-white/5 rounded-full px-8 py-4 text-xs text-white outline-none focus:border-emerald-500/40 transition-all font-bold italic"
                          required
                        />
                        <input 
                          type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)}
                          placeholder="Label (e.g. CRO)"
                          className="md:w-40 bg-black/40 border border-white/5 rounded-full px-8 py-4 text-xs text-white outline-none focus:border-emerald-500/40 transition-all font-bold italic"
                        />
                        <button type="submit" disabled={isAddingRecipient} className="px-8 py-4 bg-emerald-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500 active:scale-95 transition-all flex items-center justify-center gap-2">
                           {isAddingRecipient ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} ADD LINK
                        </button>
                     </form>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recipients.map((rec) => (
                           <div key={rec.id} className="p-5 bg-black/20 border border-white/5 rounded-3xl flex items-center justify-between group">
                              <div className="space-y-0.5">
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{rec.label}</p>
                                 <p className="text-xs font-bold text-white italic">{rec.email}</p>
                              </div>
                              <button onClick={() => handleRemoveRecipient(rec.id, rec.email)} className="p-2.5 text-slate-700 hover:text-rose-500 transition-colors bg-white/5 rounded-xl opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                           </div>
                        ))}
                     </div>
                  </GlassCard>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <GlassCard className="p-10 rounded-[4rem] border-white/5 space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><RefreshCw size={24} /></div>
                           <h3 className="text-lg font-black italic text-white uppercase">Sync Scheduling</h3>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                              <div className="space-y-0.5">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GA4 Telemetry</p>
                                 <p className="text-xs font-bold text-white italic">Automatic Pulse (Cron)</p>
                              </div>
                              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase">Active</div>
                           </div>
                        </div>
                        <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:bg-indigo-500 flex items-center justify-center gap-3">
                           {syncState === 'SYNCING' ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} FORCE FULL SYNC
                        </button>
                     </GlassCard>
                     <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 bg-rose-500/[0.02] space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400"><Send size={24} /></div>
                           <h3 className="text-lg font-black italic text-white uppercase">Alerting Hub</h3>
                        </div>
                        <div className="space-y-4">
                           <div className="flex justify-between items-center p-4 bg-black/40 rounded-2xl border border-white/5">
                              <div className="space-y-0.5">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Critical Alerting</p>
                                 <p className="text-xs font-bold text-white italic">Dual-Channel (TG+Email)</p>
                              </div>
                              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase">Established</div>
                           </div>
                        </div>
                        <button onClick={() => window.open('https://t.me/somno_lab_bot')} className="w-full py-5 bg-white/5 text-slate-400 border border-white/10 rounded-full font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:text-white flex items-center justify-center gap-3">
                           <ExternalLink size={16} /> VIEW BOT TERMINAL
                        </button>
                     </GlassCard>
                  </div>
               </div>
            )}

            {activeTab === 'system' && (
              <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl"><Cpu size={48} /></div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Infrastructure Management</h2>
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Root Sector Configuration</p>
                 </div>
                 <GlassCard className="p-10 rounded-[4rem] border-white/5">
                    <div className="flex justify-between items-center mb-8">
                       <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Activity size={24} /></div>
                          <h3 className="text-xl font-black italic text-white uppercase tracking-tight">Environmental Handshake</h3>
                       </div>
                       <button onClick={fetchServerPulse} className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-indigo-400 transition-all"><RefreshCw size={16} /></button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                       {serverPulse?.env ? Object.entries(serverPulse.env).map(([key, active]) => (
                         <div key={key} className="p-5 bg-black/40 border border-white/5 rounded-3xl flex items-center justify-between">
                            <div className="space-y-1">
                               <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{key}</p>
                               <p className={`text-xs font-bold italic ${active ? 'text-emerald-400' : 'text-rose-500'}`}>{active ? 'ESTABLISHED' : 'MISSING'}</p>
                            </div>
                            {active ? <Check size={16} className="text-emerald-500" /> : <X size={16} className="text-rose-500" />}
                         </div>
                       )) : (
                         <div className="col-span-full py-12 text-center italic text-slate-500">Node telemetry unreachable. Check CRON_SECRET.</div>
                       )}
                    </div>
                    <div className="mt-8 p-6 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex flex-col md:flex-row items-center justify-between gap-4">
                       <div className="flex items-center gap-4">
                          <Database size={18} className="text-indigo-400" />
                          <p className="text-xs font-bold text-white uppercase italic">DB Link: <span className={serverPulse?.db === 'ONLINE' ? 'text-emerald-500' : 'text-rose-500'}>{serverPulse?.db || 'UNKNOWN'}</span></p>
                       </div>
                       <p className="text-[10px] font-mono text-slate-600">Runtime: {serverPulse?.vercel_runtime || 'n/a'} • Node {serverPulse?.node_version || 'n/a'}</p>
                    </div>
                 </GlassCard>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-10 rounded-[3.5rem] border-white/5 space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Bug size={24} /></div>
                         <h3 className="text-lg font-black italic text-white uppercase tracking-widest">Diagnostics</h3>
                       </div>
                       <p className="text-[11px] text-slate-500 italic leading-relaxed">Generate an encrypted telemetry bundle for engineering review.</p>
                       <button onClick={() => {
                         const report = { timestamp: new Date().toISOString(), pulse: serverPulse };
                         handleCopy(JSON.stringify(report, null, 2), 'diag');
                         alert("Diagnostic bundle ready for dispatch.");
                       }} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                         <FileJson size={16} /> {copiedKey === 'diag' ? 'COPIED TO CLIPBOARD' : 'GENERATE BUNDLE'}
                       </button>
                    </GlassCard>
                    <GlassCard className="p-10 rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02] space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400"><Mail size={24} /></div>
                         <h3 className="text-lg font-black italic text-white uppercase tracking-widest">Support Portal</h3>
                       </div>
                       <p className="text-[11px] text-slate-500 italic leading-relaxed">Direct priority link to laboratory engineering for mission-critical anomalies.</p>
                       <button onClick={() => window.open('mailto:ongyuze1401@gmail.com')} className="w-full py-5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                         <Send size={16} /> DISPATCH MESSAGE
                       </button>
                    </GlassCard>
                 </div>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};