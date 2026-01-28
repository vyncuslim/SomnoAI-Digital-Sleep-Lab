
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, User, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, BarChart3, Globe, Cpu, Zap,
  Crown, Server, HardDrive, Network, Radio, Key,
  ShieldQuestion
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, profileApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'records' | 'security' | 'infrastructure';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<'admin' | 'owner' | 'user'>('admin');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setRole(session.user.app_metadata?.role || session.user.user_metadata?.role || 'admin');
        setCurrentUserId(session.user.id);
      }

      const [users, records, feedback, logs, security] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents()
      ]);
      
      setData({ users, records, feedback, logs, security });
    } catch (err: any) {
      console.error("[Admin Registry Error]:", err);
      setError(err.message || "Registry unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 60000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  const handleToggleBlock = async (targetUser: any) => {
    // 权限检查逻辑：
    // 1. 不能 Block 自己
    // 2. Admin 不能 Block Owner
    // 3. Admin 不能 Block 其他 Admin
    if (targetUser.id === currentUserId) {
      alert("COMMAND REJECTED: Self-suspension is prohibited.");
      return;
    }
    
    if (role === 'admin' && (targetUser.role === 'owner' || targetUser.role === 'admin')) {
      alert("AUTHORITY VIOLATION: Insufficient clearance to modify this node.");
      return;
    }

    const action = targetUser.is_blocked ? 'RESTORE' : 'SUSPEND';
    if (!confirm(`[PROTOCOL OVERRIDE] ${action} NODE ${targetUser.email || targetUser.id}?`)) return;
    
    try {
      if (targetUser.is_blocked) await adminApi.unblockUser(targetUser.id);
      else await adminApi.blockUser(targetUser.id);
      fetchAllData();
    } catch (err) {
      alert("SYNC ERROR: Node state update failed.");
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const source = activeTab === 'users' ? data.users : 
                   activeTab === 'records' ? data.records : 
                   activeTab === 'security' ? data.security : [];
    
    if (!q) return source;
    return source.filter((item: any) => {
      const searchStr = `${item.email || ''} ${item.id || ''} ${item.role || ''} ${item.full_name || ''}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  // 勋章渲染组件
  const RoleBadge = ({ r }: { r: string }) => {
    if (r === 'owner') return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase rounded-lg italic shadow-[0_0_15px_rgba(245,158,11,0.1)]"><Crown size={10}/> Master</span>;
    if (r === 'admin') return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase rounded-lg italic"><Shield size={10}/> Staff</span>;
    return <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase rounded-lg">Subject</span>;
  };

  return (
    <div className={`space-y-12 pb-40 max-w-7xl mx-auto animate-in fade-in duration-1000 font-sans ${isOwner ? 'selection:bg-amber-500/30' : 'selection:bg-rose-500/30'}`}>
      
      {/* 层级感知顶栏 */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 px-6">
        <div className="flex items-center gap-8">
          <button onClick={onBack} className={`p-5 bg-${themeColor}/10 hover:bg-${themeColor}/20 rounded-[2rem] text-${themeColor} transition-all border border-${themeColor}/20 active:scale-90 shadow-2xl group`}>
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
               {isOwner ? <Crown className="text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" size={36} /> : <ShieldCheck className="text-rose-500" size={36} />}
               <h1 className="text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
                 {isOwner ? 'Master' : 'Command'} <span className={`text-${themeColor}`}>{isOwner ? 'Registry' : 'Center'}</span>
               </h1>
            </div>
            <div className="flex items-center gap-4">
               <div className={`flex items-center gap-2 px-3 py-1 rounded-full bg-${themeColor}/10 border border-${themeColor}/20`}>
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse bg-${themeColor}`} />
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] text-${themeColor}`}>Clearance: {role.toUpperCase()}</span>
               </div>
               <div className="h-px w-8 bg-white/10" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] italic">Encrypted Flux v4.2</span>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-950/80 p-2 rounded-[2.5rem] border border-white/5 backdrop-blur-3xl shadow-2xl">
          {(['overview', 'users', 'records', 'security', 'infrastructure'] as AdminTab[]).map((tab) => {
            if (tab === 'infrastructure' && !isOwner) return null;
            return (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className={`px-8 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 relative overflow-hidden ${activeTab === tab ? `bg-${themeColor} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
              >
                {activeTab === tab && <m.div layoutId="nav-active" className="absolute inset-0 bg-white/10" />}
                <span className="relative z-10">{tab === 'security' ? 'Threats' : tab}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <main className="px-6">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' ? (
            <m.div key="ov" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
               {/* 核心监控矩阵 */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Registry Nodes', val: data.users.length, icon: Users, color: `text-${themeColor}` },
                    { label: 'Neural Flux', val: '28.4 GB', icon: Activity, color: 'text-indigo-400' },
                    { label: 'Active Signals', val: data.records.length, icon: Radio, color: 'text-emerald-400' },
                    { label: 'Security Alerts', val: data.security.length, icon: ShieldAlert, color: 'text-rose-500' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-8 rounded-[3.5rem] border-white/5 group hover:border-${themeColor}/30 transition-all duration-700`} intensity={1.5}>
                       <div className="flex justify-between items-start mb-6">
                          <div className={`p-4 bg-white/5 ${stat.color} rounded-2xl border border-white/5 group-hover:scale-110 transition-transform`}>
                            <stat.icon size={24} />
                          </div>
                          {isOwner && <Fingerprint size={16} className="text-slate-800" />}
                       </div>
                       <p className="text-4xl font-black text-white italic tracking-tighter mb-1">{loading ? '...' : stat.val}</p>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                    </GlassCard>
                  ))}
               </div>

               {/* 图表展示 */}
               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <GlassCard className="lg:col-span-2 p-10 rounded-[4rem] border-white/5" intensity={1.2}>
                    <div className="flex justify-between items-center mb-10 px-4">
                       <div className="flex items-center gap-3">
                         <BarChart3 size={20} className={`text-${themeColor}`} />
                         <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Network Pulse Ingress</span>
                       </div>
                       <div className="flex items-center gap-2">
                         <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                         <span className="text-[10px] font-mono text-emerald-500 font-black">NODE_STABLE</span>
                       </div>
                    </div>
                    <div className="h-[320px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[
                            {t:'00:00', v:20}, {t:'04:00', v:55}, {t:'08:00', v:30}, {t:'12:00', v:90}, {t:'16:00', v:45}, {t:'20:00', v:25}, {t:'23:59', v:10}
                          ]}>
                             <defs>
                                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                                   <stop offset="5%" stopColor={themeHex} stopOpacity={0.3}/>
                                   <stop offset="95%" stopColor={themeHex} stopOpacity={0}/>
                                </linearGradient>
                             </defs>
                             <XAxis dataKey="t" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10, fontWeight: 800}} dy={10} />
                             <YAxis hide domain={[0, 100]} />
                             <Area type="monotone" dataKey="v" stroke={themeHex} strokeWidth={5} fillOpacity={1} fill="url(#primaryGrad)" animationDuration={2000} />
                          </AreaChart>
                       </ResponsiveContainer>
                    </div>
                  </GlassCard>

                  <div className="space-y-8">
                    <GlassCard className="p-10 rounded-[4rem] border-white/5 bg-indigo-500/[0.02] flex flex-col gap-8" intensity={1.5}>
                       <div className="flex items-center gap-3">
                          <Server size={18} className="text-indigo-400" />
                          <span className="text-[11px] font-black uppercase text-slate-400 tracking-widest">Registry Health</span>
                       </div>
                       <div className="space-y-8">
                          <div className="space-y-3">
                             <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                <span>Binary Capacity</span>
                                <span className="text-indigo-400">42%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <m.div animate={{ width: '42%' }} className="h-full bg-indigo-500" />
                             </div>
                          </div>
                          <div className="space-y-3">
                             <div className="flex justify-between text-[10px] font-black uppercase italic text-slate-500">
                                <span>Signal Integrity</span>
                                <span className="text-emerald-400">99.8%</span>
                             </div>
                             <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <m.div animate={{ width: '99.8%' }} className="h-full bg-emerald-500" />
                             </div>
                          </div>
                       </div>
                    </GlassCard>
                    
                    <GlassCard className={`p-10 rounded-[4rem] border-${themeColor}/20 bg-${themeColor}/5`} intensity={2}>
                       <p className="text-sm font-bold text-white italic leading-relaxed mb-6">
                         "Protocol {role.toUpperCase()} active. You are supervising the neural architecture of the laboratory."
                       </p>
                       <button className={`w-full py-5 bg-${themeColor} text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-${themeColor}/20 transition-all active:scale-95`}>Initialize Audit</button>
                    </GlassCard>
                  </div>
               </div>
            </m.div>
          ) : (
            <m.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
               <GlassCard className="p-12 rounded-[5rem] border-white/5 shadow-2xl relative overflow-hidden" intensity={1.5}>
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 mb-16 relative z-10">
                    <div className="space-y-2">
                       <h3 className="text-3xl font-black italic text-white uppercase tracking-tighter">
                         {activeTab.toUpperCase()} Registry
                       </h3>
                       <div className="flex items-center gap-3 text-slate-500">
                          <Terminal size={14} className={`text-${themeColor}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest italic">Encrypted Surveillance Mode</span>
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
                          className={`w-full bg-[#050a1f]/80 border border-white/5 rounded-full pl-16 pr-12 py-5 text-sm font-bold italic text-white outline-none focus:border-${themeColor}/40 transition-all shadow-inner`}
                        />
                      </div>
                      <button onClick={fetchAllData} className="p-5 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5 shadow-lg active:scale-90">
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide relative z-10">
                    <table className="w-full text-left border-separate border-spacing-y-4">
                      <thead>
                        <tr className="text-[11px] font-black uppercase text-slate-700 tracking-[0.4em]">
                          <th className="pb-8 px-8">Identifier</th>
                          <th className="pb-8 px-8">Authority Status</th>
                          <th className="pb-8 px-8 text-right">Command</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item: any) => {
                          const isSelf = item.id === currentUserId;
                          // 权限判断：如果当前是 Admin，目标是 Owner 或 Admin，则不可操作
                          const canManage = isOwner ? !isSelf : (item.role === 'user' && !isSelf);
                          
                          return (
                            <tr key={item.id} className={`hover:bg-${themeColor}/5 transition-all group rounded-3xl`}>
                              <td className="py-10 px-8">
                                 <div className="flex items-center gap-6">
                                   <div className={`w-16 h-16 rounded-[2.2rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 flex items-center justify-center text-white text-xl font-black italic transition-colors group-hover:border-${themeColor}/30 shadow-inner`}>
                                     {item.full_name?.[0]?.toUpperCase() || <User size={24} className="text-slate-700" />}
                                   </div>
                                   <div>
                                     <span className="text-lg font-black italic text-white block leading-none mb-2">
                                       {item.email || item.event_type || 'SYSTEM_NODE'}
                                       {isSelf && <span className="ml-3 text-[10px] text-indigo-400 not-italic uppercase">(You)</span>}
                                     </span>
                                     <span className="text-[10px] font-mono text-slate-700 uppercase tracking-tighter">HASH: {item.id?.slice(0, 16)}...</span>
                                   </div>
                                 </div>
                              </td>
                              <td className="py-10 px-8">
                                 <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                                       <RoleBadge r={item.role} />
                                       {item.is_blocked && <span className="text-[9px] font-black text-rose-500 uppercase italic">Suspended</span>}
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-700">
                                       <Clock size={12} />
                                       <span className="text-[10px] font-black uppercase tracking-widest">{new Date(item.created_at || item.attempt_at).toLocaleString()}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-10 px-8 text-right">
                                 <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                    {canManage ? (
                                      <>
                                        <button 
                                          onClick={() => handleToggleBlock(item)}
                                          className={`p-4 rounded-2xl border transition-all ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'}`}
                                          title={item.is_blocked ? 'Activate Node' : 'Suspend Node'}
                                        >
                                          {item.is_blocked ? <ShieldCheck size={22}/> : <Ban size={22}/>}
                                        </button>
                                        <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-500 hover:text-white transition-all">
                                          <Edit3 size={22} />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="p-4 text-slate-800 flex items-center gap-2 cursor-not-allowed">
                                         <Lock size={18} />
                                         <span className="text-[9px] font-black uppercase tracking-widest">Protected</span>
                                      </div>
                                    )}
                                    <button className="p-4 text-slate-700 hover:text-white transition-colors">
                                      <MoreHorizontal size={22} />
                                    </button>
                                 </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
               </GlassCard>
            </m.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="mt-20 flex flex-col items-center gap-6 opacity-30 text-center">
         <div className="flex items-center gap-4">
           <DatabaseZap size={14} className={`text-${themeColor}`} />
           <span className="text-[9px] font-mono tracking-[0.5em] uppercase font-black text-white">Quantum Registry v4.6 // SECURITY_LEVEL_{role.toUpperCase()}</span>
         </div>
      </footer>
    </div>
  );
};
