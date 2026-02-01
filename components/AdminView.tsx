
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
        adminApi.getSecurityEvents(30),
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

                <GlassCard className={`p-10 rounded-[4rem] border-white/5 transition-all duration-700 ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'border-rose-500/30 bg-rose-500/[0.02]' : ''}`}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                      <div className="flex items-center gap-8 text-left">
                         <div className={`p-6 rounded-[2rem] border border-white/5 ${syncState === 'SYNCED' ? 'bg-emerald-600/10 text-emerald-400' : ['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'bg-rose-600/10 text-rose-500' : 'bg-indigo-600/10 text-indigo-400'}`}>
                            {['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? <ShieldAlert size={32} /> : <ActivitySquare size={32} className={syncState === 'SYNCING' ? 'animate-spin' : ''} />}
                         </div>
                         <div>
                            <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">GA4 Telemetry Sync</h3>
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 italic ${['FORBIDDEN', 'ERROR', 'NOT_FOUND'].includes(syncState) ? 'text-rose-400' : 'text-slate-500'}`}>
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
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-6 text-left">
                          <div className="flex items-center gap-3 text-rose-400">
                             <AlertCircle size={18} />
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Access Denied: 403 Forbidden Protocol</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="p-6 bg-slate-900/60 rounded-[2rem] border border-white/5 space-y-4">
                               <p className="text-xs text-slate-300 font-bold italic">故障排查步骤 (Checklist):</p>
                               <ol className="space-y-3 text-[10px] text-slate-400 list-decimal pl-5 italic font-medium">
                                  <li>进入 GA4 后台 -> <b>媒体资源设置</b> -> <b>账号管理</b>。</li>
                                  <li>点击 "+" 号并选择 <b>"添加用户"</b>。</li>
                                  <li>粘贴下方的 Service Account 邮箱。</li>
                                  <li>分配角色为 <b>"查看者 (Viewer)"</b> 并保存。</li>
                               </ol>
                             </div>
                             <div className="p-6 bg-black/40 border border-indigo-500/20 rounded-[2rem] flex flex-col justify-center gap-3">
                                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Service Account to Authorize</span>
                                <code className="text-xs font-mono text-indigo-300 font-bold break-all select-all">{saEmail || 'ID_PENDING'}</code>
                                <button onClick={() => handleCopy(saEmail, 'sa_copy')} className="flex items-center gap-2 text-[9px] font-black text-white bg-indigo-600/20 px-4 py-2 rounded-full w-fit hover:bg-indigo-600/40 transition-all uppercase">
                                  {copiedKey === 'sa_copy' ? <Check size={10} /> : <Copy size={10} />} Copy Identifier
                                </button>
                             </div>
                          </div>

                          {lastRawError?.raw_google_error && (
                            <div className="p-4 bg-rose-950/20 border border-rose-500/10 rounded-2xl">
                               <p className="text-[8px] font-mono text-rose-500 uppercase font-black mb-1">Raw Upstream Pulse:</p>
                               <code className="text-[10px] font-mono text-rose-400/80 leading-tight block">{lastRawError.raw_google_error}</code>
                            </div>
                          )}
                       </m.div>
                     )}

                     {syncState === 'NOT_FOUND' && (
                       <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-8 pt-8 border-t border-rose-500/20 space-y-4 text-left">
                          <div className="flex items-center gap-3 text-amber-500">
                             <AlertTriangle size={18} />
                             <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">Resource Missing: 404 Not Found</span>
                          </div>
                          <p className="text-sm text-slate-400 italic">
                            Google Analytics 未能找到请求的媒体资源 ID。这通常意味着环境变量 <code>GA_PROPERTY_ID</code> 配置错误。请确保该值是 <b>纯数字 ID</b>（例如 46892...），而不是以 G- 开头的追踪代码。
                          </p>
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
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Root Node Clearance</p>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <GlassCard className="p-10 rounded-[3.5rem] border-white/5 space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Bug size={24} /></div>
                         <h3 className="text-lg font-black italic text-white uppercase">Diagnostic Tools</h3>
                       </div>
                       <p className="text-xs text-slate-500 italic leading-relaxed">
                         遭遇无法解决的 403 或系统异常？生成一个加密的诊断包以获得开发者支持。
                       </p>
                       <button onClick={generateDiagnosticReport} className="w-full py-5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                         <FileJson size={14} /> {copiedKey === 'diag_report' ? 'REPORT COPIED' : 'GENERATE SUPPORT BUNDLE'}
                       </button>
                    </GlassCard>

                    <GlassCard className="p-10 rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02] space-y-6">
                       <div className="flex items-center gap-4">
                         <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-400"><Mail size={24} /></div>
                         <h3 className="text-lg font-black italic text-white uppercase">Direct Support</h3>
                       </div>
                       <p className="text-xs text-slate-500 italic leading-relaxed">
                         通过加密通道直接向 SomnoAI 实验室工程师报告严重的架构崩溃或漏洞。
                       </p>
                       <button onClick={() => window.open('mailto:ongyuze1401@gmail.com')} className="w-full py-5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3">
                         <Send size={14} /> CONTACT ENGINEER
                       </button>
                    </GlassCard>
                 </div>

                 {isSecretMismatch && (
                    <div className="p-8 bg-rose-600/10 border border-rose-600/30 rounded-[2.5rem] space-y-4 text-left">
                       <div className="flex items-center gap-3 text-rose-500">
                          <ShieldAlert size={24} />
                          <h3 className="text-lg font-black uppercase italic">Secret Protocol Mismatch</h3>
                       </div>
                       <p className="text-sm text-slate-400 leading-relaxed italic">
                         警告：前端 hardcoded 的 `CRON_SECRET` 与 Vercel 云端环境变量不一致。这会导致 `monitor-pulse` 返回 401 错误，使面板显示 VOID。请核对 Vercel 设置。
                       </p>
                    </div>
                 )}

                 <GlassCard className="p-10 rounded-[3.5rem] border-white/5 text-left space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Key size={20} /></div>
                        <h3 className="text-lg font-black italic text-white uppercase tracking-tight">Environment Pulse</h3>
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
                        const fingerprint = envFingerprints[item.key];
                        return (
                          <div key={item.key} className="p-5 bg-black/20 rounded-2xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between">
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
                            {isSet && fingerprint && (
                              <div className="pt-2 border-t border-white/5">
                                 <span className="text-[7px] font-black text-slate-700 uppercase tracking-widest block mb-1">Runtime Fingerprint</span>
                                 <code className="text-[9px] font-mono text-indigo-500/80">{fingerprint}</code>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-5">
                       <HelpCircle size={24} className="text-indigo-400 shrink-0" />
                       <div className="space-y-1">
                          <p className="text-[11px] font-black text-white uppercase italic">Deployment Required</p>
                          <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            若您刚刚在 Vercel 控制台修改了变量，但此处显示 VOID 或指纹不符，请务必在 Vercel 重新进行一次 <b>Production Deployment</b>。环境变量在部署后才会生效。
                          </p>
                       </div>
                    </div>
                 </GlassCard>
              </div>
            )}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
