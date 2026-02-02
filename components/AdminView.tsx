
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
  ExternalLink as LinkIcon, HelpCircle, Bug, FileJson
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system' | 'automation';
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
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  
  // 诊断与支持
  const [serverEnvStatus, setServerEnvStatus] = useState<Record<string, boolean>>({});
  const [envFingerprints, setEnvFingerprints] = useState<Record<string, string>>({});
  const [saEmail, setSaEmail] = useState<string>("");
  const [isEnvLoading, setIsEnvLoading] = useState(false);
  const [lastRawError, setLastRawError] = useState<any>(null);
  const [isSecretMismatch, setIsSecretMismatch] = useState(false);

  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";

  const fetchServerPulse = useCallback(async () => {
    setIsEnvLoading(true);
    setIsSecretMismatch(false);
    try {
      const response = await fetch(`/api/monitor-pulse?secret=${CRON_SECRET}&silent=true`);
      if (response.status === 401) {
        setIsSecretMismatch(true);
        return;
      }
      if (response.ok) {
        const data = await response.json();
        if (data.env) setServerEnvStatus(data.env);
        if (data.fingerprints) setEnvFingerprints(data.fingerprints);
        if (data.service_account_email) setSaEmail(data.service_account_email);
      }
    } catch (e) {
      console.warn("Pulse fetch failed.");
    } finally {
      setIsEnvLoading(false);
    }
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      const [sRes, uRes] = await Promise.allSettled([
        adminApi.getSecurityEvents(50),
        adminApi.getUsers()
      ]);

      setSignals(sRes.status === 'fulfilled' ? sRes.value : []);
      setUsers(uRes.status === 'fulfilled' ? uRes.value : []);
      
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

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
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
        if (response.status === 403 || data.is_permission_denied) setSyncState('FORBIDDEN');
        else if (response.status === 404 || data.is_not_found) setSyncState('NOT_FOUND');
        else setSyncState('ERROR');
        
        throw new Error(data.detail || data.error || "Sync gateway error.");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
  };

  const handleToggleBlock = async (user: any) => {
    try {
      const { error } = await adminApi.toggleBlock(user.id, user.email, user.is_blocked);
      if (!error) fetchData();
    } catch (e) {}
  };

  const generateDiagnosticReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      admin_node: currentAdmin?.email,
      env_status: serverEnvStatus,
      fingerprints: envFingerprints,
      last_sync_error: lastRawError,
      service_account: saEmail
    };
    handleCopy(JSON.stringify(report, null, 2), 'diag_report');
    alert("Diagnostic Report copied to clipboard. Send this to technical support.");
  };

  const isGlobalOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;

  return (
    <div className="space-y-8 md:space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 md:gap-8 pt-8">
        <div className="flex items-center gap-4 md:gap-6">
          {onBack && (
            <button onClick={onBack} className="p-3 md:p-4 bg-white/5 hover:bg-white/10 rounded-2xl md:rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={20} md:size={24} /></button>
          )}
          <div className="space-y-1 md:space-y-2 text-left">
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-3 md:gap-4">
              Command <span style={{ color: isGlobalOwner ? '#f59e0b' : '#6366f1' }}>Bridge</span>
            </h1>
            <p className="text-[8px] md:text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] md:tracking-[0.5em] italic leading-none">Telemetry Active • Secure Node</p>
          </div>
        </div>
        
        <nav className="flex p-1 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar max-w-[95vw]">
          {['overview', 'automation', 'registry', 'explorer', 'signals', 'system'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as AdminTab)} className={`flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
               {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-500" size={60} md:size={80} />
            <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-slate-500 italic">Syncing Data Mesh...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {activeTab === 'overview' && (
              <div className="space-y-8 md:space-y-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                  {DATABASE_SCHEMA.slice(0, 4).map((stat, i) => (
                    <GlassCard key={i} className="p-6 md:p-8 rounded-[2.5rem] md:rounded-[3rem] border-white/5">
                      <div className="flex justify-between items-start mb-4 md:mb-6">
                        <div className="p-2.5 bg-indigo-500/10 rounded-xl text-indigo-400"><stat.icon size={18} md:size={20} /></div>
                        <span className="text-[7px] md:text-[8px] font-black text-slate-700 uppercase tracking-widest italic">DB_ENTRY</span>
                      </div>
                      <p className="text-3xl md:text-4xl font-black text-white italic tracking-tighter leading-none">{tableCounts[stat.id] || 0}</p>
                      <p className="text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 md:mt-3">{stat.group}</p>
                    </GlassCard>
                  ))}
                </div>

                <GlassCard className={`p-6 md:p-10 rounded-[3rem] md:rounded-[4rem] border-white/5 transition-all duration-700 ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10">
                      <div className="flex items-center gap-6 md:gap-8 text-left">
                         <div className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-white/5 ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400' : ['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'bg-rose-600/10 text-rose-500' : 'bg-indigo-600/10 text-indigo-400'}`}>
                            {['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? <ShieldAlert size={28} md:size={32} /> : <ActivitySquare size={28} md:size={32} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />}
                         </div>
                         <div>
                            <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Sync</h3>
                            <p className={`text-[8px] md:text-[10px] font-black uppercase tracking-widest mt-1 italic ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'text-rose-400' : 'text-slate-500'}`}>
                              Status: {syncState}
                            </p>
                         </div>
                      </div>
                      <div className="w-full md:w-auto">
                        <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[10px] md:text-[12px] uppercase tracking-[0.3em] md:tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl italic">
                          {syncState === 'SYNCING' ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} SYNC NOW
                        </button>
                      </div>
                   </div>

                   <AnimatePresence>
                     {syncState === 'FORBIDDEN' && (
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-6 text-left">
                          <div className="flex items-center gap-3 text-rose-400">
                             <AlertCircle size={16} />
                             <span className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] italic">Access Denied: 403 Forbidden</span>
                          </div>
                          
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                             <div className="p-5 md:p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 space-y-4">
                               <p className="text-[10px] md:text-xs text-slate-300 font-bold italic">Checklist:</p>
                               <ol className="space-y-2 md:space-y-3 text-[9px] md:text-[10px] text-slate-400 list-decimal pl-5 italic font-medium">
                                  <li>进入 GA4 后台 &rarr; 媒体资源设置 &rarr; 账号管理。</li>
                                  <li>点击 "+" 号 &rarr; "添加用户"。</li>
                                  <li>粘贴 Service Account 邮箱。</li>
                                  <li>分配角色为 "查看者 (Viewer)" 并保存。</li>
                               </ol>
                             </div>
                             <div className="p-5 md:p-6 bg-black/40 border border-indigo-500/20 rounded-[2rem] flex flex-col justify-center gap-3">
                                <span className="text-[7px] md:text-[8px] font-black text-indigo-500 uppercase tracking-widest">Service Account</span>
                                <code className="text-[10px] font-mono text-indigo-300 font-bold break-all select-all leading-tight">{saEmail || 'ID_PENDING'}</code>
                                <button onClick={() => handleCopy(saEmail, 'sa_copy')} className="flex items-center gap-2 text-[8px] md:text-[9px] font-black text-white bg-indigo-600/20 px-4 py-2 rounded-full w-fit hover:bg-indigo-600/40 transition-all uppercase">
                                  {copiedKey === 'sa_copy' ? <Check size={10} /> : <Copy size={10} />} Copy Identifier
                                </button>
                             </div>
                          </div>
                       </m.div>
                     )}
                   </AnimatePresence>
                </GlassCard>
              </div>
            )}

            {activeTab === 'automation' && (
              <div className="space-y-8">
                 <GlassCard className="p-10 rounded-[3rem] border-white/5">
                    <div className="flex items-center gap-4 mb-10">
                       <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><RefreshCw size={24} /></div>
                       <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Active Automations</h2>
                    </div>
                    <div className="space-y-4">
                       {[
                         { name: 'Daily Analytics Sync', status: 'Operational', trigger: 'Every 24h', icon: Radio },
                         { name: 'Infrastructure Pulse', status: 'Operational', trigger: 'Every 15m', icon: Activity },
                         { name: 'Registry Maintenance', status: 'Manual Only', trigger: 'On-demand', icon: Database }
                       ].map((task, i) => (
                         <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-between">
                            <div className="flex items-center gap-5">
                               <div className="p-3 bg-white/5 rounded-xl text-slate-500"><task.icon size={18} /></div>
                               <div>
                                  <p className="text-sm font-black text-white italic">{task.name}</p>
                                  <p className="text-[9px] text-slate-600 uppercase tracking-widest">{task.trigger}</p>
                               </div>
                            </div>
                            <span className="px-4 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase rounded-full">{task.status}</span>
                         </div>
                       ))}
                    </div>
                 </GlassCard>
              </div>
            )}

            {activeTab === 'registry' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center px-4">
                   <h2 className="text-xl font-black italic text-white uppercase">Subject Registry</h2>
                   <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{users.length} Nodes Active</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {users.map((u) => (
                     <GlassCard key={u.id} className="p-6 rounded-[2.5rem] border-white/5 hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-start justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center text-indigo-400 font-black italic">
                                 {u.full_name?.[0] || u.email[0].toUpperCase()}
                              </div>
                              <div className="space-y-0.5">
                                 <p className="text-sm font-black text-white italic">{u.full_name || 'Unidentified Node'}</p>
                                 <p className="text-[10px] text-slate-500 italic opacity-60">{u.email}</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                              <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${u.role === 'owner' ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-slate-400'}`}>
                                 {u.role}
                              </span>
                              <button onClick={() => handleToggleBlock(u)} className={`p-2 rounded-xl transition-all ${u.is_blocked ? 'bg-rose-500/20 text-rose-500' : 'bg-white/5 text-slate-700 hover:text-rose-400'}`}>
                                 {u.is_blocked ? <Unlock size={14} /> : <Ban size={14} />}
                              </button>
                           </div>
                        </div>
                     </GlassCard>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'explorer' && (
              <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {DATABASE_SCHEMA.map((table) => (
                      <GlassCard key={table.id} className="p-8 rounded-[3rem] border-white/5">
                         <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><table.icon size={20} /></div>
                            <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10">{tableCounts[table.id] || 0} ROWS</span>
                         </div>
                         <h3 className="text-base font-black italic text-white uppercase tracking-tight mb-2">{table.name}</h3>
                         <p className="text-[10px] text-slate-500 italic leading-relaxed">{table.desc}</p>
                      </GlassCard>
                    ))}
                 </div>
              </div>
            )}

            {activeTab === 'signals' && (
              <div className="space-y-6">
                 <GlassCard className="p-10 rounded-[4rem] border-white/5">
                    <div className="flex justify-between items-center mb-10">
                       <h2 className="text-xl font-black italic text-white uppercase">Security Signals</h2>
                       <RefreshCw size={16} onClick={fetchData} className="text-slate-700 cursor-pointer hover:text-indigo-400 transition-colors" />
                    </div>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 scrollbar-hide">
                       {signals.map((s, i) => (
                         <div key={s.id || i} className="p-5 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                            <div className="flex items-center gap-5">
                               <div className={`p-2 rounded-lg ${s.event_type.includes('FAIL') ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                  <Shield size={14} />
                               </div>
                               <div>
                                  <p className="text-[11px] font-black text-white italic tracking-tight">{s.event_type}</p>
                                  <p className="text-[9px] text-slate-600 italic">{s.email || 'System'}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-[9px] font-mono text-slate-700 uppercase">{new Date(s.created_at).toLocaleTimeString()}</p>
                               <p className="text-[8px] font-black text-slate-800 tracking-tighter italic">{s.event_reason || 'Link established'}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </GlassCard>
              </div>
            )}
            
            {activeTab === 'system' && (
              <div className="max-w-4xl mx-auto space-y-10 md:space-y-12">
                 <div className="text-center space-y-4">
                    <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-500/10 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20"><Cpu size={40} md:size={48} /></div>
                    <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase tracking-tighter">System Infrastructure</h2>
                    <p className="text-[8px] md:text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] md:tracking-[0.8em] italic">Root Node Clearance</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <GlassCard className="p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] border-white/5 space-y-4 md:space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-emerald-500/10 rounded-xl md:rounded-2xl text-emerald-400"><Bug size={20} md:size={24} /></div>
                         <h3 className="text-base md:text-lg font-black italic text-white uppercase">Diagnostics</h3>
                       </div>
                       <p className="text-[10px] md:text-xs text-slate-500 italic leading-relaxed">
                         Generate an encrypted bundle for engineering support.
                       </p>
                       <button onClick={generateDiagnosticReport} className="w-full py-4 md:py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center justify-center gap-2 md:gap-3">
                         <FileJson size={14} /> {copiedKey === 'diag_report' ? 'COPIED' : 'GENERATE BUNDLE'}
                       </button>
                    </GlassCard>

                    <GlassCard className="p-8 md:p-10 rounded-[3rem] md:rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02] space-y-4 md:space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-rose-500/10 rounded-xl md:rounded-2xl text-rose-400"><Mail size={20} md:size={24} /></div>
                         <h3 className="text-base md:text-lg font-black italic text-white uppercase">Direct Support</h3>
                       </div>
                       <p className="text-[10px] md:text-xs text-slate-500 italic leading-relaxed">
                         Report critical vulnerabilities to SomnoAI.
                       </p>
                       <button onClick={() => window.open('mailto:ongyuze1401@gmail.com')} className="w-full py-4 md:py-5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-[0.2em] md:tracking-[0.3em] transition-all flex items-center justify-center gap-2 md:gap-3">
                         <Send size={14} /> CONTACT LAB
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
