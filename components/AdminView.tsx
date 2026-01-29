
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldQuestion,
  User, UserCircle, ShieldX, KeyRound, ArrowUpRight,
  Clock, Mail, Fingerprint, Calendar, Zap, AlertTriangle, Cpu,
  Lock as LockIcon, BarChart3, PieChart, Info, Waves, Heart, Brain,
  Network, SignalHigh, X, Terminal as TerminalIcon, Command
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'subjects' | 'security' | 'diagnostics';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  const [data, setData] = useState<{ 
    users: any[], 
    security: SecurityEvent[], 
    stats: any 
  }>({ users: [], security: [], stats: {} });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [terminalUser, setTerminalUser] = useState<any | null>(null);
  const [commandInput, setCommandInput] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);
  const terminalInputRef = useRef<HTMLInputElement>(null);

  const isOwner = useMemo(() => {
    return currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const themeColor = isOwner ? 'amber' : 'indigo';
  const themeHex = isOwner ? '#f59e0b' : '#6366f1';

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profile = await adminApi.getAdminClearance(user.id);
        if (profile) {
          setCurrentAdmin(profile);
        }
      }

      // If user is owner or admin, proceed to fetch statistics and registry
      const [users, security, stats] = await Promise.all([
        adminApi.getUsers().catch(() => []),
        adminApi.getSecurityEvents().catch(() => []),
        adminApi.getStats().catch(() => ({ total_subjects: 0, admin_nodes: 0, blocked_nodes: 0, active_24h: 0 }))
      ]);
      
      setData({ users, security, stats });
    } catch (err: any) {
      console.error("Registry sync failure:", err);
      setActionError("REGISTRY_DENIED: Critical authentication failure or missing RPC permissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  useEffect(() => {
    if (terminalUser && terminalInputRef.current) {
      setTimeout(() => terminalInputRef.current?.focus(), 250);
    }
  }, [terminalUser]);

  const handleToggleBlock = async (e: React.MouseEvent, targetUser: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isProcessingId) return;
    setIsProcessingId(targetUser.id);
    setActionError(null);
    
    try {
      await adminApi.toggleBlock(targetUser.id);
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === targetUser.id ? { ...u, is_blocked: !u.is_blocked } : u)
      }));
    } catch (err: any) {
      setActionError(err.message || "BLOCK_PROTOCOL_FAILED");
    } finally { 
      setIsProcessingId(null); 
    }
  };

  const handleExecuteCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!terminalUser || !commandInput.trim() || isProcessingId) return;

    const cmd = commandInput.toLowerCase().trim();
    setIsProcessingId(terminalUser.id);
    setActionError(null);

    try {
      let newRole = '';
      if (cmd.includes('role admin')) newRole = 'admin';
      else if (cmd.includes('role user')) newRole = 'user';
      else if (cmd.includes('role owner')) newRole = 'owner';
      else throw new Error("COMMAND_NOT_RECOGNIZED: Try 'SET ROLE [admin|user|owner]'");

      await adminApi.updateUserRole(terminalUser.id, newRole);
      
      setData(prev => ({
        ...prev,
        users: prev.users.map(u => u.id === terminalUser.id ? { ...u, role: newRole } : u)
      }));
      
      setTerminalUser(null);
      setCommandInput('');
    } catch (err: any) {
      setActionError(err.message || "CLEARANCE_SYNC_FAILED");
    } finally {
      setIsProcessingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return data.users;
    return data.users.filter(u => 
      (u.email || '').toLowerCase().includes(q) || 
      (u.full_name || '').toLowerCase().includes(q) ||
      (u.id || '').toLowerCase().includes(q)
    );
  }, [searchQuery, data.users]);

  return (
    <div className={`space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans relative`}>
      <AnimatePresence>
        {actionError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[999999] w-full max-w-md px-6">
            <m.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-rose-950 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,1)] flex items-center gap-4 backdrop-blur-3xl"
            >
              <ShieldAlert className="text-rose-500 shrink-0" size={24} />
              <div className="min-w-0">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none mb-1">Administrative Alert</p>
                <p className="text-sm font-bold text-white italic truncate">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors"><X size={16} /></button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="text-left space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">PRIME</span> : <span className="text-indigo-500">CORE</span>} CONTROL
              {isOwner && <Crown size={32} className="text-amber-500 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full animate-pulse bg-${themeColor}-500 shadow-[0_0_10px_${themeHex}]`} />
              PROTOCOL: {currentAdmin?.role?.toUpperCase() || 'SYNCING'} • NODE: {currentAdmin?.id?.slice(0, 8) || 'IDENTIFYING'}
            </p>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {(['overview', 'subjects', 'security', 'diagnostics'] as AdminTab[]).map((tab) => (
            <button 
              key={tab} 
              onClick={() => setActiveTab(tab)} 
              className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeTab === tab 
                ? (isOwner ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-indigo-600 text-white shadow-lg') 
                : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-10">
          <div className="relative">
            <div className={`absolute inset-0 blur-3xl opacity-20 bg-${themeColor}-500 animate-pulse`} />
            <Loader2 className={`animate-spin text-${themeColor}-500 relative z-10`} size={64} />
          </div>
          <div className="space-y-2 text-center">
            <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Core Databanks...</p>
          </div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Global Subjects', value: data.stats.total_subjects || 0, icon: Users, color: themeColor },
                    { label: 'Admin Nodes', value: data.stats.admin_nodes || 0, icon: ShieldCheck, color: 'emerald' },
                    { label: 'Blocked Nodes', value: data.stats.blocked_nodes || 0, icon: ShieldX, color: 'rose' },
                    { label: 'Active (24H)', value: data.stats.active_24h || 0, icon: Zap, color: isOwner ? 'amber' : 'indigo' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-10 rounded-[3.5rem] text-left border-${stat.color}-500/10 shadow-2xl`}>
                      <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400 mb-6 inline-block`}>
                        <stat.icon size={26} />
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-8">
                    <GlassCard className="p-12 rounded-[4.5rem] h-full border-white/5 bg-slate-950/40 overflow-hidden group shadow-2xl">
                      <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity"><Network size={200} /></div>
                      <div className="flex justify-between items-start mb-16 relative z-10">
                        <div className="space-y-3 text-left">
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Biological Load</h3>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Global Node Cluster Activity</p>
                        </div>
                        <div className={`p-4 bg-${themeColor}-500/10 rounded-2xl text-${themeColor}-500`}><BarChart3 size={24} /></div>
                      </div>
                      <div className="h-[280px] flex items-end justify-between gap-5 relative z-10 px-2">
                         {[45, 75, 55, 90, 65, 30, 85, 45, 60, 50, 95, 40].map((h, i) => (
                           <m.div 
                             key={i} 
                             initial={{ height: 0 }} animate={{ height: `${h}%` }}
                             transition={{ delay: i * 0.05, duration: 1.2 }}
                             className={`flex-1 rounded-t-2xl bg-${themeColor}-500/20 border-t border-${themeColor}-500/40 relative group/bar`}
                           />
                         ))}
                      </div>
                    </GlassCard>
                  </div>
                  <div className="lg:col-span-4">
                    <GlassCard className="p-10 rounded-[4.5rem] h-full border-rose-500/10 bg-rose-500/[0.02] shadow-2xl">
                       <div className="space-y-10">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-500/10 rounded-2xl text-rose-500"><ShieldAlert size={20} /></div>
                            <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Security Pulse</h3>
                          </div>
                          <div className="space-y-6">
                             {data.security.length > 0 ? data.security.slice(0, 4).map((event, i) => (
                               <div key={i} className="flex gap-4 items-center p-5 bg-white/5 rounded-3xl border border-white/5 group hover:border-rose-500/20 transition-all">
                                  <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                                  <div className="min-w-0 text-left">
                                     <p className="text-[11px] font-black text-white uppercase italic truncate">{event.event_type}</p>
                                     <p className="text-[9px] text-slate-600 italic truncate font-mono uppercase mt-1">{event.email || 'ANONYMOUS'}</p>
                                  </div>
                               </div>
                             )) : (
                               <div className="py-12 text-center opacity-30 italic text-[10px] font-black uppercase tracking-widest">No Alerts Detected</div>
                             )}
                          </div>
                          <button onClick={() => setActiveTab('security')} className="w-full py-5 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all">Audit Logs</button>
                       </div>
                    </GlassCard>
                  </div>
               </div>
            </m.div>
          ) : activeTab === 'subjects' ? (
            <m.div key="subjects" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-[0_80px_150px_rgba(0,0,0,1)] overflow-visible">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="text-left space-y-3">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Global <span className={`text-${themeColor}-500`}>Registry</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Authorized Personnel Node Management</p>
                     </div>
                     <div className="flex flex-wrap gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                           <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white transition-colors" size={22} />
                           <input 
                             type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                             placeholder="Search Node IDs / Aliases..."
                             className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm font-bold italic text-white outline-none focus:border-white/20 shadow-inner"
                           />
                        </div>
                        <m.button whileTap={{ scale: 0.9 }} onClick={fetchAllData} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5 transition-all active:scale-95"><RefreshCw size={24} /></m.button>
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em] border-b border-white/5 italic">
                              <th className="pb-10 px-8">Identifier</th>
                              <th className="pb-10 px-8">Clearance</th>
                              <th className="pb-10 px-8">Synchronization</th>
                              <th className="pb-10 px-8 text-right">Command</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                           {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                             <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group relative overflow-visible">
                                <td className="py-10 px-8">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center transition-all group-hover:scale-105 ${user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.3)]' : user.role === 'owner' ? 'text-amber-400' : 'text-slate-600'}`}>
                                         {user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />}
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                         <p className="text-base font-black text-white italic truncate max-w-[240px] leading-tight">{user.email || 'ANON_NODE'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">{user.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-10 px-8">
                                   <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${
                                     user.role === 'owner' || user.is_super_owner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' :
                                     user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' :
                                     'bg-slate-900 border-white/5 text-slate-600'
                                   }`}>
                                      {user.is_blocked ? <ShieldX size={16} className="text-rose-500" /> : <Shield size={16} />}
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
                                   </div>
                                </td>
                                <td className="py-10 px-8">
                                   <div className="flex items-center gap-3 text-slate-500 font-mono text-[10px]">
                                      <Clock size={16} className="opacity-50" />
                                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'NEVER'}
                                   </div>
                                </td>
                                <td className="py-10 px-8 text-right">
                                   <div className="flex justify-end gap-4 relative z-40">
                                      {!user.is_super_owner && (
                                        <button 
                                          type="button"
                                          onClick={(e) => handleToggleBlock(e, user)}
                                          disabled={!!isProcessingId}
                                          className={`p-5 rounded-[1.2rem] border transition-all active:scale-95 ${user.is_blocked ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'}`}
                                        >
                                           {isProcessingId === user.id ? <Loader2 className="animate-spin" size={24} /> : (user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />)}
                                        </button>
                                      )}
                                      {isOwner && !user.is_super_owner && (
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setTerminalUser(user); setCommandInput(`SET ROLE ${user.role}`); }}
                                          disabled={!!isProcessingId}
                                          className="p-5 bg-white/5 border border-white/5 rounded-[1.2rem] text-slate-500 hover:text-white hover:bg-amber-600 transition-all active:scale-95 shadow-xl"
                                        >
                                          <KeyRound size={24} />
                                        </button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           )) : (
                             <tr>
                               <td colSpan={4} className="py-32 text-center">
                                  <div className="flex flex-col items-center gap-6 opacity-20">
                                    <Database size={64} strokeWidth={1} />
                                    <p className="text-[11px] font-black uppercase tracking-[0.8em]">Registry Null Response</p>
                                  </div>
                               </td>
                             </tr>
                           )}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </m.div>
          ) : (
             <m.div key="diagnostics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-4xl mx-auto">
                <GlassCard className="p-20 rounded-[5rem] text-center space-y-12 border-white/5 bg-slate-950/40 relative overflow-hidden shadow-2xl">
                   <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none"><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:20px_20px]" /></div>
                   <div className="relative">
                      <div className={`absolute inset-0 blur-[60px] opacity-10 bg-${themeColor}-500 animate-pulse`} />
                      <Cpu size={100} className={`mx-auto text-${themeColor}-500 relative z-10`} />
                   </div>
                   <div className="space-y-6 relative z-10">
                      <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">Diagnostics Atlas</h3>
                      <p className="text-base text-slate-500 italic max-w-md mx-auto leading-relaxed">System monitoring shows 99.9% uptime. Protocol handshake stable.</p>
                   </div>
                </GlassCard>
             </m.div>
          )}
        </AnimatePresence>
      )}

      {/* Global Terminal Overlay - Fixed Stacking and Visibility */}
      <AnimatePresence>
        {terminalUser && (
          <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-6 bg-black/98 backdrop-blur-[40px]">
            <m.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="w-full max-w-2xl relative"
            >
              <GlassCard className="p-12 rounded-[4rem] border-amber-500/30 relative overflow-hidden shadow-[0_0_200px_rgba(0,0,0,1)] bg-slate-950/90">
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                 <div className="flex justify-between items-start mb-12">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><TerminalIcon size={28} /></div>
                       <div className="text-left space-y-1">
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Command Interface</h3>
                          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">Node ID: {terminalUser.id}</p>
                       </div>
                    </div>
                    <button onClick={() => setTerminalUser(null)} className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
                 </div>

                 <div className="bg-black/60 rounded-[2.5rem] border border-white/5 p-10 space-y-10 shadow-inner">
                    <div className="space-y-4 text-left">
                       <div className="flex items-center gap-3 text-amber-500/60 font-mono text-[10px] uppercase px-2"><Command size={12} /> Execution Buffer</div>
                       <form onSubmit={handleExecuteCommand} className="relative group">
                          <div className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500 font-mono text-lg">{'>'}</div>
                          <input 
                            ref={terminalInputRef}
                            type="text"
                            value={commandInput}
                            onChange={(e) => setCommandInput(e.target.value)}
                            placeholder="SET ROLE [admin | owner | user]"
                            className="w-full bg-[#050a0f] border border-amber-500/30 rounded-full pl-12 pr-8 py-7 text-base font-mono text-amber-500 outline-none focus:border-amber-500/60 shadow-2xl"
                          />
                       </form>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { role: 'user', label: 'DEMOTE SUBJECT', icon: User },
                         { role: 'admin', label: 'ELEVATE ADMIN', icon: ShieldCheck },
                         { role: 'owner', label: 'GRANT PRIME', icon: Crown }
                       ].map((opt) => (
                         <button 
                           key={opt.role}
                           type="button"
                           onClick={() => setCommandInput(`SET ROLE ${opt.role}`)}
                           className={`p-6 rounded-[2.5rem] border text-left space-y-3 transition-all group ${
                             commandInput.includes(opt.role) 
                             ? 'bg-amber-600/10 border-amber-500/40 shadow-xl' 
                             : 'bg-white/5 border-white/5 hover:bg-white/10'
                           }`}
                         >
                            <opt.icon size={22} className={commandInput.includes(opt.role) ? 'text-amber-500' : 'text-slate-600 group-hover:text-amber-500'} />
                            <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${commandInput.includes(opt.role) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{opt.label}</p>
                         </button>
                       ))}
                    </div>
                 </div>

                 <div className="mt-12 flex justify-end gap-6">
                    <button type="button" onClick={() => setTerminalUser(null)} className="px-10 py-5 text-[11px] font-black uppercase text-slate-600 hover:text-white transition-all tracking-widest">Abort</button>
                    <button 
                      type="button"
                      onClick={() => handleExecuteCommand()}
                      disabled={!!isProcessingId}
                      className="px-14 py-6 bg-amber-600 text-black rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-amber-500 active:scale-95 transition-all flex items-center gap-3 italic"
                    >
                       {isProcessingId === terminalUser.id ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} fill="currentColor" />}
                       COMMIT CHANGES
                    </button>
                 </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
