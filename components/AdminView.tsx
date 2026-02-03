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
      if (response.ok) {
        setSyncState('SYNCED');
        fetchData();
      } else {
        setLastRawError(data);
        if (response.status === 403 || data.is_permission_denied) {
          setSyncState('FORBIDDEN');
          if (data.service_account) setSaEmail(data.service_account);
        }
        else if (response.status === 404 || data.is_not_found) setSyncState('NOT_FOUND');
        else setSyncState('ERROR');
        throw new Error(data.message || data.error || "Sync gateway protocol violation.");
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
      case 'NOT_FOUND': return { label: 'ERRORED', color: 'bg-rose-600/20 text-rose-500', animate: true, icon: AlertTriangle };
      case 'STALE': return { label: 'STALLED', color: 'bg-amber-600/20 text-amber-500', animate: false, icon: Clock };
      default: return { label: 'READY', color: 'bg-white/5 text-slate-500', animate: false, icon: ShieldCheck };
    }
  };

  const syncBadge = getSyncBadgeConfig();
  const isGlobalOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left relative">
      {/* Incident Alert Bar */}
      <AnimatePresence>
        {(syncState === 'FORBIDDEN' || syncState === 'ERROR') && (
          <m.div 
            initial={{ height: 0, opacity: 0 }} 
            animate={{ height: 'auto', opacity: 1 }} 
            className="bg-rose-600/10 border-b border-rose-600/30 overflow-hidden sticky top-0 z-[100] backdrop-blur-xl"
          >
            <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-600 rounded-lg text-white animate-pulse">
                  <Flame size={18} />
                </div>
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest leading-none italic">Ongoing Incident detected</p>
                  <p className="text-sm font-black text-white italic">
                    {syncState === 'FORBIDDEN' ? '403 Forbidden: Telemetry Access Denied (Permissions Required)' : `500 Server Error: Failed at ${lastRawError?.failed_at || 'Handshake'}`}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab('system')} 
                className="px-6 py-2 bg-rose-600 text-white rounded-full font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all italic shadow-lg shadow-rose-600/20"
              >
                Inspect Infrastructure
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

                <GlassCard className={`p-10 rounded-[4rem] border-white/5 transition-all duration-700 ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}>
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
                        {/* 动态同步状态徽章 */}
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
                     {(syncState === 'FORBIDDEN' || syncState === 'ERROR') && (
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-6 text-left">
                          <div className="flex items-center gap-3 text-rose-400">
                             <AlertCircle size={16} />
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">
                                {syncState === 'FORBIDDEN' ? 'Access Denied: Permission Optimization Required' : `Diagnostic: Sync failed at ${lastRawError?.failed_at || 'Handshake'}`}
                             </span>
                          </div>
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                             <div className="p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 space-y-4">
                               <p className="text-xs text-slate-300 font-bold italic">Resolution Protocol:</p>
                               <ol className="space-y-3 text-[10px] text-slate-400 list-decimal pl-5 italic font-medium leading-relaxed">
                                  {syncState === 'FORBIDDEN' ? (
                                    <>
                                      <li>Log into the <a href="https://analytics.google.com/" target="_blank" className="text-indigo-400 underline decoration-indigo-500/30">Google Analytics Console</a>.</li>
                                      <li>Navigate to <b>Admin &rarr; Property Settings &rarr; Property Access Management</b>.</li>
                                      <li>Confirm you are in Property ID: <code>{process.env.GA_PROPERTY_ID || 'UNSET'}</code></li>
                                      <li>Add the Service Account (below) as a <span className="text-white font-black">"Viewer"</span>.</li>
                                      <li>Ensure there are no domain restrictions blocking the service account.</li>
                                    </>
                                  ) : lastRawError?.failed_at === 'ENV_VAR_CAPTURE' ? (
                                    <>
                                      <li>Check Vercel Project Settings &rarr; Environment Variables.</li>
                                      <li>Ensure <b>GA_SERVICE_ACCOUNT_KEY</b> is present and correctly formatted.</li>
                                      <li>Redeploy if changes were made recently.</li>
                                    </>
                                  ) : (
                                    <>
                                      <li>Verify the JSON format of the Service Account Key.</li>
                                      <li>Check for hidden characters or improper escaping in Vercel ENV.</li>
                                      <li>Confirm network egress is not restricted.</li>
                                    </>
                                  )}
                               </ol>
                             </div>
                             <div className="space-y-4">
                               <div className="p-6 bg-black/40 border border-indigo-500/20 rounded-[2rem] flex flex-col justify-center gap-3">
                                  <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Target Service Account Identity</span>
                                  <code className="text-[10px] font-mono text-indigo-300 font-bold break-all select-all leading-tight">{saEmail || 'PROBING_NODES...'}</code>
                                  <button onClick={() => handleCopy(saEmail, 'sa_copy')} className="flex items-center gap-2 text-[9px] font-black text-white bg-indigo-600/20 px-4 py-2 rounded-full w-fit hover:bg-indigo-600/40 transition-all uppercase mt-2">
                                    {copiedKey === 'sa_copy' ? <Check size={10} /> : <Copy size={10} />} Copy Identifier
                                  </button>
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
                        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-indigo-400 font-black italic text-xl shadow-inner">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-base font-black text-white italic">{user.full_name || 'Anonymous Node'}</h3>
                            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${user.role === 'owner' ? 'bg-amber-500/20 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                              {user.role}
                            </span>
                          </div>
                          <p className="text-[10px] font-mono text-slate-500 uppercase">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                        <div className="flex gap-2">
                           <button onClick={() => handleRoleUpdate(user.id, user.email, 'admin')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-600 hover:text-white'}`}>ADMIN</button>
                           <button onClick={() => handleRoleUpdate(user.id, user.email, 'user')} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${user.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-600 hover:text-white'}`}>USER</button>
                        </div>
                        <div className="h-8 w-px bg-white/5 mx-2" />
                        <button onClick={() => handleToggleBlock(user.id, user.email, !!user.is_blocked)} className={`p-3 rounded-xl transition-all ${user.is_blocked ? 'bg-rose-600/20 text-rose-500' : 'bg-white/5 text-slate-600 hover:text-rose-500'}`}>{user.is_blocked ? <Unlock size={18} /> : <Ban size={18} />}</button>
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
                      <div className={`p-4 rounded-2xl shrink-0 ${sig.event_type.includes('FAIL') || sig.event_type.includes('ERROR') ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-400'}`}>
                         {sig.event_type.includes('FAIL') ? <ShieldX size={20} /> : <Activity size={20} />}
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