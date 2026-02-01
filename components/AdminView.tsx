
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ShieldAlert, RefreshCw, Loader2, ChevronLeft, 
  ShieldCheck, Ban, Crown, KeyRound, Zap, Globe, 
  Monitor, Terminal as TerminalIcon, X, Cpu,
  LayoutDashboard, Radio, Activity, ChevronRight, 
  Send, Fingerprint, Lock, Table, List, 
  Unlock, Mail, ExternalLink, ActivitySquare,
  HeartPulse, Copy, Clock, Settings2, Check, AlertTriangle, Info,
  Rocket, MousePointer2, Trash2, Database, Search, Shield, AlertCircle, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system' | 'automation';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'FORBIDDEN';

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
  const [missingKeys, setMissingKeys] = useState<string[]>([]);
  
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [processingUser, setProcessingUser] = useState<string | null>(null);
  
  // 环境变量状态
  const [serverEnvStatus, setServerEnvStatus] = useState<Record<string, boolean>>({});
  const [saEmail, setSaEmail] = useState<string>("somnoai-digital-sleep-lab@gen-lang-client-0694195176.iam.gserviceaccount.com");
  const [isEnvLoading, setIsEnvLoading] = useState(false);
  const [isSecretMismatch, setIsSecretMismatch] = useState(false);

  const CRON_SECRET = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2";
  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://sleepsomno.com';

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
    setMissingKeys([]);
    try {
      const response = await fetch(`/api/sync-analytics?secret=${CRON_SECRET}`);
      const data = await response.json();
      
      if (response.ok) {
        setSyncState('SYNCED');
        fetchData();
      } else {
        if (data.error === "ENV_MISCONFIGURED" && data.missing) setMissingKeys(data.missing);
        if (response.status === 403 || data.is_permission_denied) setSyncState('FORBIDDEN');
        else setSyncState('ERROR');
        throw new Error(data.detail || data.error || "Sync gateway error.");
      }
    } catch (e: any) {
      setActionError(e.message);
    }
    
    if (syncState !== 'FORBIDDEN') {
      setTimeout(() => setSyncState('IDLE'), 4000);
    }
  };

  const handleTableInspect = (tableId: string) => {
    if (tableId === 'profiles') setActiveTab('registry');
    else if (tableId === 'security_events' || tableId === 'audit_logs') setActiveTab('signals');
    else if (tableId === 'analytics_daily') setActiveTab('overview');
    else setActionError(`ACCESS_RESTRICTED: Please use SQL Editor for raw data management.`);
  };

  const handleToggleBlock = async (user: any) => {
    if (user.is_super_owner) return;
    setProcessingUser(user.id);
    try {
      const { error } = await adminApi.toggleBlock(user.id, user.email, user.is_blocked);
      if (error) throw error;
      await fetchData();
    } catch (err: any) { setActionError(err.message); }
    finally { setProcessingUser(null); }
  };

  const handleCycleRole = async (targetUser: any) => {
    if (targetUser.is_super_owner) return;
    setProcessingUser(targetUser.id);
    try {
      const isSuper = currentAdmin?.is_super_owner === true;
      const nextRole = targetUser.role === 'admin' ? (isSuper ? 'owner' : 'user') : (targetUser.role === 'owner' ? 'user' : 'admin');
      const { error } = await adminApi.updateUserRole(targetUser.id, targetUser.email, nextRole);
      if (error) throw error;
      await fetchData();
    } catch (err: any) { setActionError(err.message); }
    finally { setProcessingUser(null); }
  };

  const isGlobalOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans text-left">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2 text-left">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              Command <span style={{ color: isGlobalOwner ? '#f59e0b' : '#6366f1' }}>Bridge</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic">Telemetry Active • Secure Node</p>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {['overview', 'automation', 'registry', 'explorer', 'signals', 'system'].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab as AdminTab)} className={`flex items-center gap-3 px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
               {tab.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {loading ? (
          <div key="loading" className="flex flex-col items-center justify-center py-48 gap-8">
            <Loader2 className="animate-spin text-indigo-500" size={80} />
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Data Mesh...</p>
          </div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
            {activeTab === 'overview' && (
              <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {DATABASE_SCHEMA.slice(0, 4).map((stat, i) => (
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

                <GlassCard className={`p-10 rounded-[4rem] border-white/5 transition-all duration-700 ${syncState === 'FORBIDDEN' || syncState === 'ERROR' || missingKeys.length > 0 ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 text-left">
                         <div className={`p-6 rounded-[2rem] border border-white/5 ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400' : (syncState === 'FORBIDDEN' || syncState === 'ERROR' || missingKeys.length > 0) ? 'bg-rose-600/10 text-rose-500' : 'bg-indigo-600/10 text-indigo-400'}`}>
                            {syncState === 'FORBIDDEN' || syncState === 'ERROR' || missingKeys.length > 0 ? <ShieldAlert size={32} /> : <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Sync</h3>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 italic ${syncState === 'ERROR' || missingKeys.length > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                              Internal Processor Status: {syncState}
                            </p>
                         </div>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={handleManualSync} disabled={syncState === 'SYNCING'} className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl italic">
                          {syncState === 'SYNCING' ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />} EXECUTE MANUAL SYNC
                        </button>
                      </div>
                   </div>

                   <AnimatePresence>
                     {syncState === 'FORBIDDEN' && (
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-4 text-left">
                          <div className="flex items-center gap-3 text-rose-400">
                             <AlertCircle size={18} />
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Access Denied: Authorization Violation</span>
                          </div>
                          <p className="text-sm text-slate-400 italic leading-relaxed">
                            Google Analytics 拒绝了连接 (403 Forbidden)。这通常意味着下面的服务帐号没有 GA4 媒体资源的 **“查看者 (Viewer)”** 权限。请在 Google Analytics 后台添加：
                          </p>
                          <div className="p-5 bg-black/40 border border-white/5 rounded-2xl flex items-center justify-between">
                             <code className="text-xs font-mono text-indigo-300 font-bold select-all">{saEmail}</code>
                             <button onClick={() => handleCopy(saEmail, 'sa_copy')} className="text-indigo-400 hover:text-white p-2">
                               {copiedKey === 'sa_copy' ? <Check size={16} /> : <Copy size={16} />}
                             </button>
                          </div>
                       </m.div>
                     )}
                   </AnimatePresence>
                </GlassCard>
              </div>
            )}

            {activeTab === 'system' && (
              <div className="max-w-4xl mx-auto space-y-12">
                 <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20"><Cpu size={48} /></div>
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">System Infrastructure</h2>
                 </div>

                 {isSecretMismatch && (
                    <div className="p-8 bg-rose-600/10 border border-rose-600/30 rounded-[2.5rem] space-y-4 text-left">
                       <div className="flex items-center gap-3 text-rose-500">
                          <ShieldAlert size={24} />
                          <h3 className="text-lg font-black uppercase italic">Secret Protocol Mismatch</h3>
                       </div>
                       <p className="text-sm text-slate-400 leading-relaxed italic">
                         前端使用的 `CRON_SECRET` 与 Vercel 环境变量中的配置不一致 (401 Unauthorized)。请确保环境变量中的 Secret 与前端硬编码的值同步，或更新 Vercel 配置。
                       </p>
                    </div>
                 )}

                 <GlassCard className="p-10 rounded-[3.5rem] border-white/5 text-left space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Key size={20} /></div>
                        <h3 className="text-lg font-black italic text-white uppercase">Key Registry</h3>
                      </div>
                      <button onClick={fetchServerPulse} disabled={isEnvLoading} className="p-3 bg-white/5 rounded-xl text-indigo-400 hover:bg-white/10 transition-all">
                        {isEnvLoading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'GA_PROPERTY_ID', label: 'GA4 Telemetry ID' },
                        { key: 'GA_SERVICE_ACCOUNT_KEY', label: 'GA4 Auth Key' },
                        { key: 'SUPABASE_URL', label: 'DB Cluster URL' },
                        { key: 'SUPABASE_SERVICE_ROLE_KEY', label: 'DB Root Access' },
                        { key: 'API_KEY', label: 'Gemini Neural Link' },
                        { key: 'SMTP_USER', label: 'SMTP Mail Relay' }
                      ].map(item => {
                        const isSet = serverEnvStatus[item.key] === true;
                        return (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5">
                            <div>
                               <p className="text-[8px] font-black uppercase text-slate-600 tracking-widest">{item.label}</p>
                               <code className="text-[10px] font-mono text-slate-400">{item.key}</code>
                            </div>
                            <div className="flex items-center gap-2">
                               <span className={`text-[8px] font-black uppercase ${isSet ? 'text-emerald-500' : 'text-rose-500'}`}>
                                 {isSet ? 'DEFINED' : 'VOID'}
                               </span>
                               {isSet ? <Check size={12} className="text-emerald-500" /> : <X size={12} className="text-rose-500" />}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                 </GlassCard>
              </div>
            )}
            {/* ... 其他 Tab 保持原样 ... */}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
