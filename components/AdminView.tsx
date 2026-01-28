
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, User, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, BarChart3, Globe, Cpu, Zap,
  Crown, Server, HardDrive, Network, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, BarChart, Bar } from 'recharts';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, profileApi } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';
import { COLORS } from '../constants.tsx';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'records' | 'security' | 'infrastructure';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'owner' | 'user'>('admin');
  const [data, setData] = useState<{ 
    users: any[], 
    records: any[], 
    feedback: any[], 
    logs: any[], 
    security: SecurityEvent[] 
  }>({ 
    users: [], records: [], feedback: [], logs: [], security: []
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const isOwner = role === 'owner';
  const themeColor = isOwner ? 'amber-500' : 'rose-600';
  const themeHex = isOwner ? '#f59e0b' : '#e11d48';
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, users, records, feedback, logs, security] = await Promise.all([
        profileApi.getMyProfile(),
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents()
      ]);
      
      if (profile) setRole(profile.role);
      setData({ users, records, feedback, logs, security });
    } catch (err: any) {
      console.error("[Admin Registry Error]:", err);
      setError(err.message || "Sync Error: Laboratory Node unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 45000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleToggleBlock = async (user: any) => {
    const action = user.is_blocked ? 'RESTORE' : 'SUSPEND';
    if (!confirm(`[PROTOCOL OVERRIDE] ${action} NODE ${user.email || user.id}?`)) return;
    
    try {
      if (user.is_blocked) await adminApi.unblockUser(user.id);
      else await adminApi.blockUser(user.id);
      fetchAllData();
    } catch (err) {
      alert("COMMAND REJECTED: Authority violation.");
    }
  };

  // 模拟 Owner 级系统数据
  const infraStats = useMemo(() => [
    { name: 'Core DB', val: '1.2 GB', icon: HardDrive, load: 45 },
    { name: 'Neural Nodes', val: '248 Active', icon: Cpu, load: 78 },
    { name: 'API Latency', val: '12ms', icon: Radio, load: 12 },
    { name: 'Encrypted Flux', val: '8.4 GB/s', icon: Network, load: 60 }
  ], []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const source = activeTab === 'users' ? data.users : 
                   activeTab === 'records' ? data.records : 
                   activeTab === 'security' ? data.security : [];
    
    if (!q) return source;
    return source.filter((item: any) => {
      const searchStr = `${item.email || ''} ${item.id || ''} ${item.event_type || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  return (
    <div className={`space-y-12 pb-40 max-w-7xl mx-auto animate-in fade-in duration-1000 font-sans ${isOwner ? 'selection:bg-amber-500/30' : ''}`}>
      {/* 顶部指挥部导航 */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 px-6">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className={`p-5 bg-${themeColor}/10 hover:bg-${themeColor}/20 rounded-[2rem] text-${themeColor} transition-all border border-${themeColor}/20 active:scale-90 shadow-2xl group`}>
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
               {isOwner && <Crown className="text-amber-500 animate-bounce" size={32} />}
               <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                 {isOwner ? 'Master' : 'Command'} <span className={`text-${themeColor}`}>{isOwner ? 'Registry' : 'Center'}</span>
               </h1>
            </div>
            <div className="flex items-center gap-4">
               <span className={`text-[10px] font-black uppercase tracking-[0.4em] ${isOwner ? 'text-amber-500/60' : 'text-slate-500'}`}>Clearance: {role.toUpperCase()}</span>
               <div className="h-px w-12 bg-white/10" />
               <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOwner ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] italic">System Integrity: Nominal</span>
               </div>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-950/80 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)]">
          {(['overview', 'users', 'records', 'security', 'infrastructure'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 relative overflow-hidden ${activeTab === tab ? `bg-${themeColor} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
            >
              {activeTab === tab && <m.div layoutId="tab-highlight" className="absolute inset-0 bg-white/10" />}
              {tab === 'infrastructure' && !isOwner ? null : tab}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-6 space-y-12">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="ov" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
               {/* 核心矩阵 */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Registry Nodes', val: data.users.length, icon: Users, color: isOwner ? 'text-amber-400' : 'text-rose-400' },
                    { label: 'Laboratory Load', val: '18%', icon: Cpu, color: 'text-indigo-400' },
                    { label: 'Neural Signals', val: data.records.length, icon: Radio, color: 'text-emerald-400' },
                    { label: 'Anomalies', val: data.security.length, icon: ShieldAlert, color: 'text-rose-500' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-8 rounded-[3.5rem] border-white/5 group hover:border-${themeColor}/30 transition-all duration-1000`} intensity={1.5}>
                       <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 bg-white/5 ${stat.color} rounded-2xl border border-white/5 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                          </div>
                          {isOwner && <Fingerprint size={16} className="text-slate-800" />}
                       </div>
                       <p className="text-4xl font-black text-white italic tracking-tighter mb-1">{stat.val}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </GlassCard>
                  ))}
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <GlassCard className="lg:col-span-2 p-10 rounded-[4rem] border-white/5" intensity={1.2}>
                    <div className="flex justify-between items-center mb-10">
                       <div className="flex items-center gap-3">
                         <Activity size={20} className={`text-${themeColor}`} />
                         <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Global Neural Pulse</span>
                       </div>
                       <span className="text-[10px] font-mono text-emerald-500 font-black">STABLE_LINK</span>
                    </div>
                    <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            {t:'00:00', v:10}, {t:'04:00', v:45}, {t:'08:00', v:20}, {t:'12:00', v:80}, {t:'16:00', v:40}, {t:'20:00', v:15}, {t:'23:59', v:5}
                          ]}>
                             <defs>
                                <linearGradient id="ownerGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={themeHex} stopOpacity={0.4}/>
                                   <stop offset="95%" stopColor={themeHex} stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                             <YAxis hide domain={[0, 100]} />
                             <Area type="monotone" dataKey="v" stroke={themeHex} strokeWidth={5} fillOpacity={1} fill="url(#ownerGrad)" />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <div className="space-y-8">
                    <GlassCard className="p-8 rounded-[3.5rem] border-white/5 bg-indigo-500/[0.02]" intensity={2}>
                       <div className="flex items-center gap-3 mb-8">
                          <Server size={18} className="text-indigo-400" />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Storage Registry</span>
                       </div>
                       <div className="space-y-6">
                          <div className="space-y-2">
                             <div className="flex justify-between text-[10px] font-black uppercase">
                                <span className="text-slate-600">Database Utilization</span>
                                <span className="text-indigo-400">42.8%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <m.div initial={{ width: 0 }} animate={{ width: '42.8%' }} className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                             </div>
                          </div>
                          <div className="flex justify-between items-end">
                             <div className="space-y-1">
                                <p className="text-2xl font-black text-white italic tracking-tighter">1.28 GB</p>
                                <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">Total Binary Mass</p>
                             </div>
                             <button className="p-4 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><History size={16}/></button>
                          </div>
                       </div>
                    </GlassCard>

                    <GlassCard className={`p-8 rounded-[3.5rem] border-${themeColor}/20 bg-${themeColor}/5`} intensity={2}>
                       <div className="flex items-center gap-3 mb-6">
                          <Crown size={18} className={`text-${themeColor}`} />
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">Owner Clearance</span>
                       </div>
                       <p className="text-sm font-bold text-white italic leading-relaxed mb-6">"You are viewing the core system architecture. All neural links are sovereign and encrypted."</p>
                       <button className={`w-full py-4 bg-${themeColor} text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-${themeColor}/20 active:scale-95 transition-all`}>System Wide Sync</button>
                    </GlassCard>
                  </div>
               </div>
            </m.div>
          ) : activeTab === 'infrastructure' && isOwner ? (
            <m.div key="infra" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                  {infraStats.map((stat, i) => (
                    <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5" intensity={1.5}>
                       <div className="flex items-center gap-4 mb-6">
                          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-xl">
                             <stat.icon size={20} />
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{stat.name}</span>
                       </div>
                       <p className="text-3xl font-black text-white italic tracking-tighter mb-4">{stat.val}</p>
                       <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <m.div animate={{ width: `${stat.load}%` }} className={`h-full ${stat.load > 70 ? 'bg-rose-500' : 'bg-amber-500'}`} />
                       </div>
                    </GlassCard>
                  ))}
               </div>

               <GlassCard className="p-12 rounded-[5rem] border-white/5 bg-black/40" intensity={2}>
                  <div className="flex items-center gap-4 mb-12">
                     <ShieldCheck size={28} className="text-amber-500" />
                     <div>
                        <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Security Firewall Logs</h3>
                        <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mt-1">Deep Packet Inspection Protocol</p>
                     </div>
                  </div>
                  <div className="space-y-6">
                     {data.logs.slice(0, 5).map((log, i) => (
                       <div key={i} className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                          <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center text-slate-500">
                             <History size={20} />
                          </div>
                          <div className="flex-1">
                             <p className="text-sm font-bold text-white italic uppercase tracking-tight">{log.action || 'AUTH_CHALLENGE'}</p>
                             <p className="text-[10px] text-slate-600 font-mono mt-1">SOURCE: {log.ip_address || 'REDACTED'} • STAMP: {new Date(log.attempt_at).toISOString()}</p>
                          </div>
                          <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-black text-emerald-400 uppercase tracking-widest">Success</div>
                       </div>
                     ))}
                  </div>
               </GlassCard>
            </m.div>
          ) : (
            <m.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <GlassCard className="p-12 rounded-[5rem] border-white/5 shadow-2xl relative overflow-hidden" intensity={1.5}>
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16 relative z-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                         {activeTab.toUpperCase()} Registry
                       </h3>
                       <div className="flex items-center gap-3">
                          <Terminal size={14} className={`text-${themeColor}`} />
                          <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Live Surveillance Active</span>
                       </div>
                    </div>

                    <div className="flex gap-4 w-full xl:w-auto">
                      <div className="relative flex-1 xl:w-96 group">
                        <Search className={`absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-${themeColor} transition-colors`} size={20} />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="SCAN NODE DATA..."
                          className={`w-full bg-[#050a1f]/80 border border-white/5 rounded-full pl-16 pr-12 py-5 text-sm font-bold italic text-white outline-none focus:border-${themeColor}/40 transition-all placeholder:text-slate-800 shadow-inner`}
                        />
                      </div>
                      <button onClick={fetchAllData} className="p-5 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5 shadow-lg active:scale-90">
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide relative z-10">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em] border-b border-white/5">
                          <th className="pb-10 px-8">Node Identifier</th>
                          <th className="pb-10 px-8">Telemetry Logic</th>
                          <th className="pb-10 px-8 text-right">Command Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item: any) => (
                          <tr key={item.id} className={`hover:bg-${themeColor}/5 transition-all group`}>
                            <td className="py-10 px-8">
                               <div className="flex items-center gap-6">
                                 <div className={`w-16 h-16 rounded-[2rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 flex items-center justify-center text-white text-xl font-black italic group-hover:border-${themeColor}/40 transition-colors`}>
                                   {/* Fix: Added missing User icon to imports and used it here */}
                                   {item.full_name?.[0]?.toUpperCase() || <User size={24} className="text-slate-700" />}
                                 </div>
                                 <div>
                                   <span className="text-lg font-black italic text-white block leading-none mb-2 group-hover:translate-x-1 transition-transform">
                                     {item.email || item.event_type || 'SYSTEM_NODE'}
                                   </span>
                                   <span className="text-[10px] font-mono text-slate-700 uppercase">HASH: {item.id?.slice(0, 14)}...</span>
                                 </div>
                               </div>
                            </td>
                            <td className="py-10 px-8">
                               <div className="space-y-2">
                                  <div className="flex items-center gap-3">
                                     <div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                                     <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.is_blocked ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'}`}>
                                       {item.is_blocked ? 'Suspended' : 'Operational'}
                                     </span>
                                     {item.role === 'owner' && <span className="px-3 py-1 bg-amber-500 text-black text-[8px] font-black uppercase rounded-lg">Master</span>}
                                  </div>
                                  <div className="flex items-center gap-4 text-slate-700">
                                     <Clock size={12} />
                                     <span className="text-[10px] font-black uppercase tracking-widest">{new Date(item.created_at || item.attempt_at).toLocaleString()}</span>
                                  </div>
                               </div>
                            </td>
                            <td className="py-10 px-8 text-right">
                               <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                  {activeTab === 'users' && item.role !== 'owner' && (
                                    <button 
                                      onClick={() => handleToggleBlock(item)}
                                      className={`p-4 rounded-2xl border transition-all ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20 hover:bg-emerald-500/10' : 'text-rose-500 border-rose-500/20 hover:bg-rose-500/10'}`}
                                    >
                                      {item.is_blocked ? <ShieldCheck size={22}/> : <Ban size={22}/>}
                                    </button>
                                  )}
                                  <button className={`p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all`}>
                                    <Edit3 size={22} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </GlassCard>
            </m.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 flex flex-col items-center gap-4 opacity-20 text-center">
         <div className="flex items-center gap-3">
           <DatabaseZap size={14} className={`text-${themeColor}`} />
           <span className="text-[9px] font-mono tracking-[0.5em] uppercase font-black text-white">Quantum Registry v4.5.2 // SOMNOAI LAB</span>
         </div>
      </footer>
    </div>
  );
};
