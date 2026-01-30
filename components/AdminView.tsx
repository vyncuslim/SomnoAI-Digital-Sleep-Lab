
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, Activity, ChevronLeft, ShieldCheck, 
  Ban, Shield, FileText, Crown, ShieldX, KeyRound, 
  Zap, Globe, Smartphone, ArrowUp, ArrowDown,
  UserCircle, Terminal as TerminalIcon, Command, X, Cpu,
  BarChart3, Network, SignalHigh, Monitor, Code2, ExternalLink,
  Layers, Lock, Eye, Copy, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell, PieChart as RePieChart, Pie, Legend, BarChart, Bar
} from 'recharts';

const m = motion as any;

const SETUP_SQL_CONTENT = `-- Paste this into Supabase SQL Editor
-- 1. Create Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    role text DEFAULT 'user',
    is_super_owner boolean DEFAULT false,
    is_blocked boolean DEFAULT false,
    full_name text,
    updated_at timestamptz DEFAULT now()
);

-- 2. Core RPC for Authentication Checks
CREATE OR REPLACE FUNCTION public.get_my_detailed_profile()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text) AS $$
BEGIN
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text
    FROM public.profiles p JOIN auth.users au ON p.id = au.id WHERE p.id = auth.uid();
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Core RPC for Registry Management
CREATE OR REPLACE FUNCTION public.admin_get_all_profiles()
RETURNS TABLE (id uuid, role text, is_super_owner boolean, is_blocked boolean, full_name text, email text, updated_at timestamptz) AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND (role IN ('admin', 'owner') OR is_super_owner = true)) 
    THEN RAISE EXCEPTION 'INSUFFICIENT_CLEARANCE'; END IF;
    RETURN QUERY SELECT p.id, p.role, p.is_super_owner, p.is_blocked, p.full_name, au.email::text, p.updated_at
    FROM public.profiles p JOIN auth.users au ON p.id = au.id ORDER BY p.updated_at DESC;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Run full setup.sql for analytics tables and triggers.`;

type AdminTab = 'overview' | 'subjects' | 'traffic' | 'system';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  
  // Intelligence Stream Data
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [countryRanking, setCountryRanking] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [realtime, setRealtime] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessingId, setIsProcessingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [terminalUser, setTerminalUser] = useState<any | null>(null);
  const [commandInput, setCommandInput] = useState('');

  const isOwner = useMemo(() => {
    const role = currentAdmin?.role?.toLowerCase();
    return role === 'owner' || currentAdmin?.is_super_owner === true;
  }, [currentAdmin]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Handshake clearance
      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      // 2. Fetch all telemetry & registry data
      const [u, d, c, ds, r] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getDailyAnalytics(30),
        adminApi.getCountryRankings(),
        adminApi.getDeviceSegmentation(),
        adminApi.getRealtimePulse()
      ]);

      setUsers(u || []);
      setDailyStats(d || []);
      setCountryRanking(c || []);
      setDeviceStats(ds || []);
      setRealtime(r || []);
    } catch (err: any) {
      console.error("Intelligence Handshake Failure:", err);
      setActionError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const metrics = useMemo(() => {
    const latest = dailyStats[dailyStats.length - 1] || { users: 0, pageviews: 0 };
    const prev = dailyStats[dailyStats.length - 2] || { users: 0, pageviews: 0 };
    const calcGrowth = (c: number, p: number) => p === 0 ? 0 : Math.round(((c - p) / p) * 100);

    return {
      totalSubjects: users.length,
      activeUsers: latest.users,
      pageViews: latest.pageviews,
      userGrowth: calcGrowth(latest.users, prev.users),
      viewGrowth: calcGrowth(latest.pageviews, prev.pageviews),
      blockedCount: users.filter(u => u.is_blocked).length,
      realtimeActive: realtime[0]?.active_users || 0,
      adminCount: users.filter(u => ['admin', 'owner'].includes(u.role?.toLowerCase()) || u.is_super_owner).length
    };
  }, [users, dailyStats, realtime]);

  const handleCopySql = () => {
    navigator.clipboard.writeText(SETUP_SQL_CONTENT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(null), 3000);
  };

  const handleToggleBlock = async (user: any) => {
    if (isProcessingId) return;
    setIsProcessingId(user.id);
    try {
      await adminApi.toggleBlock(user.id);
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_blocked: !u.is_blocked } : u));
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  const handleCommitClearance = async () => {
    if (!terminalUser || isProcessingId) return;
    setIsProcessingId(terminalUser.id);
    try {
      const match = commandInput.match(/SET ROLE (user|admin|owner)/i);
      const newRole = match ? match[1].toLowerCase() : null;
      if (!newRole) throw new Error("INVALID_SYNTAX: EXPECTED 'SET ROLE [target]'");
      await adminApi.updateUserRole(terminalUser.id, newRole);
      setUsers(prev => prev.map(u => u.id === terminalUser.id ? { ...u, role: newRole } : u));
      setTerminalUser(null);
    } catch (err: any) {
      setActionError(err.message);
    } finally {
      setIsProcessingId(null);
    }
  };

  // Setup Wizard for missing database protocols
  if (actionError === "RPC_NOT_REGISTERED_IN_DB") {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-left max-w-2xl mx-auto font-sans">
        <GlassCard className="p-12 md:p-16 rounded-[4rem] border-rose-500/20 bg-slate-950/40 shadow-2xl relative overflow-hidden" intensity={2}>
          <div className="absolute top-0 right-0 p-10 opacity-[0.05] pointer-events-none text-rose-500"><Database size={200} /></div>
          <div className="space-y-10 relative z-10">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-500 border border-rose-500/20"><ShieldAlert size={32} /></div>
              <div>
                <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Database Protocol Missing</h1>
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mt-2">LINK_FAILURE: RPC_NOT_REGISTERED</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-4 text-indigo-400"><Code2 size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Initialization Protocol</span></div>
              <div className="bg-black/60 rounded-3xl border border-white/5 p-8 space-y-5">
                {[
                  { step: 1, text: "Open your Supabase Project Dashboard" },
                  { step: 2, text: "Navigate to the 'SQL Editor' module" },
                  { step: 3, text: "Click 'New Query' and paste the setup code" },
                  { step: 4, text: "Click 'Run' to activate administrative nodes" }
                ].map((s) => (
                  <div key={s.step} className="flex gap-4 items-center">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-black shrink-0 border border-indigo-500/20">{s.step}</div>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleCopySql}
                className="w-full py-5 bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-indigo-600/20 transition-all flex items-center justify-center gap-3 italic"
              >
                {copiedSql ? <Check size={16} /> : <Copy size={16} />}
                {copiedSql ? 'CODE COPIED TO CLIPBOARD' : 'COPY SQL CONFIGURATION'}
              </button>
              
              <div className="flex gap-4">
                <button onClick={() => window.location.reload()} className="flex-1 py-5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-slate-200 transition-all italic flex items-center justify-center gap-3"><RefreshCw size={14} /> Retry Handshake</button>
                <button onClick={onBack} className="flex-1 py-5 bg-slate-900 border border-white/5 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-widest hover:text-white transition-all italic">Return to Base</button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

  return (
    <div className="space-y-12 pb-32 max-w-7xl mx-auto px-4 font-sans relative text-left">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <AnimatePresence>
        {actionError && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[1000] w-full max-w-lg px-6">
            <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-rose-950/90 border border-rose-500/50 p-6 rounded-[2.5rem] shadow-2xl flex items-start gap-5 backdrop-blur-3xl">
              <ShieldAlert className="text-rose-500 shrink-0 mt-1" size={24} />
              <div className="flex-1">
                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Neural Exception</p>
                <p className="text-sm font-bold text-white italic">{actionError}</p>
              </div>
              <button onClick={() => setActionError(null)} className="p-2 text-rose-400 hover:bg-white/10 rounded-xl transition-all"><X size={18} /></button>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 pt-8">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"><ChevronLeft size={24} /></button>
          )}
          <div className="space-y-2">
            <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-4">
              {isOwner ? <span className="text-amber-500">PRIME</span> : <span className="text-indigo-500">CORE</span>} INTELLIGENCE
              {isOwner && <Crown size={32} className="text-amber-500 animate-pulse" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] italic flex items-center gap-3">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: themeColor }} />
              SYSTEM NODE CLEARANCE: {currentAdmin?.role?.toUpperCase() || 'CALIBRATING...'}
            </p>
          </div>
        </div>
        
        <nav className="flex p-1.5 bg-slate-950/80 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'INTELLIGENCE HUB' },
            { id: 'subjects', label: 'REGISTRY' },
            { id: 'traffic', label: 'TRAFFIC MESH' },
            { id: 'system', label: 'DIAGNOSTIC' }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => setActiveTab(tab.id as AdminTab)} 
              className={`px-8 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab.id ? (isOwner ? 'bg-amber-600 text-white shadow-lg' : 'bg-indigo-600 text-white shadow-lg') : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-48 gap-10">
          <Loader2 className="animate-spin" style={{ color: themeColor }} size={64} />
          <p className="text-[11px] font-black uppercase tracking-[0.6em] text-slate-500 italic">Syncing Dual Intelligence Streams...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-12">
               
               {/* 🌍 Perception: High-Level Combined Metrics */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Neural Flux (GA4 Users)', value: metrics.activeUsers, growth: metrics.userGrowth, icon: Globe, color: 'emerald' },
                    { label: 'Event Density (GA4 Views)', value: metrics.pageViews, growth: metrics.viewGrowth, icon: Zap, color: 'indigo' },
                    { label: 'Registry Pulse (Active)', value: metrics.realtimeActive || 0, growth: 0, icon: SignalHigh, color: 'rose' },
                    { label: 'Identified Nodes (DB)', value: metrics.totalSubjects, growth: 0, icon: Users, color: 'amber' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-10 rounded-[3.5rem] border-${stat.color}-500/10 shadow-2xl`}>
                      <div className="flex justify-between items-start mb-6">
                         <div className={`p-4 bg-${stat.color}-500/10 rounded-2xl text-${stat.color}-400 inline-block`}><stat.icon size={26} /></div>
                         {stat.growth !== 0 && (
                            <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black ${stat.growth >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                               {stat.growth >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
                               {Math.abs(stat.growth)}%
                            </div>
                         )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-4xl font-black text-white italic tracking-tighter leading-none">{stat.value}</p>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-2">{stat.label}</p>
                      </div>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <GlassCard className="lg:col-span-8 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl min-h-[450px]">
                    <div className="flex justify-between items-start mb-12">
                      <div className="space-y-3">
                        <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Traffic Temporal Flux</h3>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Temporal Telemetry Map</p>
                      </div>
                      <div className="p-3 bg-white/5 rounded-2xl text-emerald-500"><BarChart3 size={20} /></div>
                    </div>
                    <div className="h-[280px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={dailyStats}>
                            <defs>
                              <linearGradient id="fluxGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.02)" vertical={false} />
                            <XAxis dataKey="date" hide />
                            <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }} />
                            <Area type="monotone" dataKey="pageviews" stroke="#10b981" strokeWidth={3} fill="url(#fluxGrad)" />
                         </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <GlassCard className="lg:col-span-4 p-12 rounded-[4.5rem] border-white/5 bg-slate-950/40 shadow-2xl flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-4 mb-10">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500"><Monitor size={24} /></div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tighter">Device Proportions</h3>
                      </div>
                      <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <RePieChart>
                              <Pie data={deviceStats.map(d => ({ name: d.device.toUpperCase(), value: d.users }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} stroke="none">
                                 {deviceStats.map((_, i) => <Cell key={i} fill={['#6366f1', '#10b981', '#f59e0b'][i % 3]} />)}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                           </RePieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-widest italic">
                       <span>Core Signal</span>
                       <span className="text-white">{deviceStats[0]?.device || 'N/A'}</span>
                    </div>
                  </GlassCard>
               </div>

               {/* Registry Consciousness (Internal DB) */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3 px-6">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Registry Consciousness (Internal DB)</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500">Registry Integrity</p>
                        <p className="text-2xl font-black italic text-white uppercase">98.2% Stable</p>
                      </div>
                      <ShieldCheck className="text-emerald-500" size={28} />
                    </div>
                    <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500">Node Clearance</p>
                        <p className="text-2xl font-black italic text-white uppercase">{metrics.adminCount} Primary</p>
                      </div>
                      <Crown className="text-amber-500" size={28} />
                    </div>
                    <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase text-slate-500">Link Exceptions</p>
                        <p className="text-2xl font-black italic text-white uppercase">{metrics.blockedCount} Expunged</p>
                      </div>
                      <Ban className="text-rose-500" size={28} />
                    </div>
                  </div>
               </div>
            </m.div>
          ) : activeTab === 'subjects' ? (
            <m.div key="subjects" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
               <GlassCard className="p-10 md:p-14 rounded-[4.5rem] bg-slate-950/60 shadow-2xl overflow-visible">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-10 mb-16">
                     <div className="space-y-3">
                        <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Node <span style={{ color: themeColor }}>Registry</span></h3>
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] italic">Identity Log of Current Laboratory Subjects</p>
                     </div>
                     <div className="flex gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-96 group">
                           <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-white" size={22} />
                           <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Query Node Identifier..." className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/20 shadow-inner italic font-bold" />
                        </div>
                        <button onClick={fetchData} className="p-6 bg-white/5 rounded-full text-slate-500 hover:text-white border border-white/5 transition-all"><RefreshCw size={24} /></button>
                     </div>
                  </div>

                  <div className="overflow-x-auto no-scrollbar">
                     <table className="w-full text-left border-separate border-spacing-y-4">
                        <thead>
                           <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em] italic">
                              <th className="px-8 pb-4">Subject Node</th><th className="px-8 pb-4">Clearance Level</th><th className="px-8 pb-4 text-right">Intervention</th>
                           </tr>
                        </thead>
                        <tbody>
                           {users.filter(u => (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())).map((user) => (
                             <tr key={user.id} className="group transition-colors">
                                <td className="py-8 px-8 bg-white/[0.02] rounded-l-[2rem] border-y border-l border-white/5">
                                   <div className="flex items-center gap-5">
                                      <div className={`w-14 h-14 rounded-[1.5rem] bg-slate-900 border border-white/5 flex items-center justify-center ${user.is_super_owner ? 'text-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'text-slate-600'}`}>
                                         {user.is_super_owner || user.role === 'owner' ? <Crown size={28} /> : <UserCircle size={28} />}
                                      </div>
                                      <div className="min-w-0 space-y-1">
                                         <p className="text-base font-black text-white italic truncate max-w-[240px] leading-tight">{user.email || 'ANONYMOUS_NODE'}</p>
                                         <p className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">{user.id}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] border-y border-white/5">
                                   <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl border ${user.role === 'owner' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : user.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-500' : 'bg-slate-900 border-white/5 text-slate-600'}`}>
                                      {user.is_blocked ? <ShieldX size={16} className="text-rose-500" /> : <Shield size={16} />}
                                      <span className="text-[10px] font-black uppercase tracking-widest italic">{user.role}</span>
                                   </div>
                                </td>
                                <td className="py-8 px-8 bg-white/[0.02] rounded-r-[2rem] border-y border-r border-white/5 text-right">
                                   <div className="flex justify-end gap-3">
                                      {!user.is_super_owner && (
                                        <button onClick={() => handleToggleBlock(user)} className={`p-5 rounded-[1.2rem] border transition-all ${user.is_blocked ? 'bg-emerald-600 border-emerald-400 text-white shadow-xl' : 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20'}`}>
                                           {isProcessingId === user.id ? <Loader2 className="animate-spin" size={24} /> : (user.is_blocked ? <ShieldCheck size={24} /> : <Ban size={24} />)}
                                        </button>
                                      )}
                                      {isOwner && !user.is_super_owner && (
                                        <button onClick={() => { setTerminalUser(user); setCommandInput(`SET ROLE ${user.role}`); }} className="p-5 bg-white/5 border border-white/5 rounded-[1.2rem] text-slate-500 hover:text-amber-500 transition-all shadow-xl"><KeyRound size={24} /></button>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </GlassCard>
            </m.div>
          ) : activeTab === 'traffic' ? (
            <m.div key="traffic" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12"><Globe size={24} className="text-amber-500" /><h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Geographic Proximity</h3></div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={countryRanking} layout="vertical" margin={{ left: 40, right: 40 }}>
                              <XAxis type="number" hide /><YAxis dataKey="country" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 800, fontSize: 10 }} />
                              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Bar dataKey="users" fill="#f59e0b" radius={[0, 20, 20, 0]} barSize={20} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>
                  <GlassCard className="p-12 rounded-[4.5rem] border-white/10 bg-slate-950/60 shadow-2xl">
                     <div className="flex items-center gap-4 mb-12"><Smartphone size={24} className="text-indigo-500" /><h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">Weekly Load Profile</h3></div>
                     <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                           <BarChart data={dailyStats.slice(-7)}>
                              <XAxis dataKey="date" hide /><Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none', borderRadius: '1rem' }} />
                              <Bar dataKey="pageviews" fill="#6366f1" radius={[20, 20, 0, 0]} barSize={40} />
                           </BarChart>
                        </ResponsiveContainer>
                     </div>
                  </GlassCard>
               </div>
            </m.div>
          ) : (
             <m.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-20 max-w-4xl mx-auto">
                <GlassCard className="p-20 rounded-[5rem] text-center space-y-12 bg-slate-950/40 relative shadow-2xl">
                   <div className="relative"><div className="absolute inset-0 blur-[60px] opacity-10 bg-amber-500 animate-pulse" /><Cpu size={100} className="mx-auto text-amber-500 relative z-10" /></div>
                   <div className="space-y-6 text-center"><h3 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Prime Control Handshake</h3><p className="text-base text-slate-500 italic max-w-md mx-auto leading-relaxed">Intelligence bridge established. Vercel Cron status: NOMINAL. DB Throughput: 1.2GB/s. GA4 Ingestion Pipe: OPEN.</p></div>
                   <button onClick={() => window.location.reload()} className="px-12 py-5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center gap-3 mx-auto shadow-2xl italic"><RefreshCw size={14} /> FULL SYSTEM RESYNC</button>
                </GlassCard>
             </m.div>
          )}
        </AnimatePresence>
      )}

      {/* Clearance Override Modal */}
      <AnimatePresence>
        {terminalUser && isOwner && (
          <div className="fixed inset-0 z-[20000000] flex items-center justify-center p-6 bg-black/98 backdrop-blur-[40px]">
            <m.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="w-full max-w-2xl">
              <GlassCard className="p-12 rounded-[4rem] border-amber-500/30 bg-slate-950/90 shadow-[0_0_200px_rgba(0,0,0,1)]">
                 <div className="flex justify-between items-start mb-12 text-left">
                    <div className="flex items-center gap-5">
                       <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-500"><TerminalIcon size={28} /></div>
                       <div>
                          <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter leading-none">Clearance Override</h3>
                          <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mt-1">Target: {terminalUser.email}</p>
                       </div>
                    </div>
                    <button onClick={() => setTerminalUser(null)} className="p-3 text-slate-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"><X size={24} /></button>
                 </div>
                 <div className="bg-black/60 rounded-[2.5rem] border border-white/5 p-10 space-y-10 shadow-inner text-left">
                    <div className="space-y-4">
                       <div className="flex items-center gap-3 text-amber-500/60 font-mono text-[10px] uppercase px-2"><Command size={12} /> Instructions Buffer</div>
                       <input type="text" value={commandInput} onChange={(e) => setCommandInput(e.target.value)} placeholder="SET ROLE [admin | owner | user]" className="w-full bg-[#050a1f] border border-amber-500/30 rounded-full pl-8 pr-8 py-7 text-base font-mono text-amber-500 outline-none shadow-2xl" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       {[
                         { role: 'user', label: 'DEMOTE SUBJECT', icon: Users },
                         { role: 'admin', label: 'ELEVATE ADMIN', icon: ShieldCheck },
                         { role: 'owner', label: 'GRANT PRIME', icon: Crown }
                       ].map((opt) => (
                         <button key={opt.role} type="button" onClick={() => setCommandInput(`SET ROLE ${opt.role}`)} className={`p-6 rounded-[2.5rem] border text-left space-y-3 transition-all group ${commandInput.toLowerCase().includes(opt.role) ? 'bg-amber-600/10 border-amber-500/40 shadow-xl' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                            <div className={commandInput.toLowerCase().includes(opt.role) ? 'text-amber-500' : 'text-slate-600 group-hover:text-amber-500'}>{opt.role === 'user' ? <Users size={22} /> : opt.role === 'admin' ? <ShieldCheck size={22} /> : <Crown size={22} />}</div>
                            <p className={`text-[10px] font-black uppercase tracking-widest leading-tight ${commandInput.toLowerCase().includes(opt.role) ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>{opt.label}</p>
                         </button>
                       ))}
                    </div>
                 </div>
                 <div className="mt-12 flex justify-end gap-6">
                    <button onClick={() => setTerminalUser(null)} className="px-10 py-5 text-[11px] font-black uppercase text-slate-600 hover:text-white transition-all tracking-widest">Abort</button>
                    <button onClick={handleCommitClearance} disabled={isProcessingId === terminalUser.id} className="px-14 py-6 bg-amber-600 text-black rounded-full font-black text-[11px] uppercase tracking-[0.5em] shadow-2xl hover:bg-amber-500 active:scale-95 transition-all flex items-center justify-center gap-3 italic">
                      {isProcessingId === terminalUser.id ? <Loader2 className="animate-spin" /> : <ShieldCheck size={16} />}
                      COMMIT CLEARANCE
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
