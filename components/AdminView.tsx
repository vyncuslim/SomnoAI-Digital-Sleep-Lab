
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
  ShieldQuestion, LockKeyhole, ArrowUp, ArrowDown
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

  // 核心视觉配置：完全对齐 Owner > Admin 逻辑
  const isOwner = role === 'owner';
  const themeColor = isOwner ? 'amber-500' : 'rose-600';
  const themeHex = isOwner ? '#f59e0b' : '#e11d48';
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // [修复逻辑]：优先从数据库 Profile 获取实时角色，防止 JWT 延迟导致 Owner 变成 Admin
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        setRole(profile?.role || session.user.app_metadata?.role || 'admin');
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
      console.error("[Registry Access Error]:", err);
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
    if (targetUser.id === currentUserId) {
      alert("COMMAND REJECTED: Self-suspension is blocked.");
      return;
    }
    
    // 权限压制：Admin 不能动 Owner 或 其他 Admin
    if (role === 'admin' && (targetUser.role === 'owner' || targetUser.role === 'admin')) {
      alert("AUTHORITY VIOLATION: Insufficient clearance to modify restricted node.");
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

  const handleRoleModification = async (targetUser: any) => {
    if (!isOwner) {
      alert("RESTRICTED COMMAND: Only the Master Registry Owner can modify authority levels.");
      return;
    }

    if (targetUser.id === currentUserId) {
      alert("COMMAND REJECTED: Cannot modify own sovereignty.");
      return;
    }

    const currentTargetRole = targetUser.role;
    const nextRole = currentTargetRole === 'admin' ? 'user' : 'admin';
    
    const confirmMsg = currentTargetRole === 'admin' 
      ? `[PROTOCOL DOWNGRADE] Demote node ${targetUser.email} to Subject?`
      : `[PROTOCOL UPGRADE] Promote node ${targetUser.email} to Staff Admin?`;

    if (!confirm(confirmMsg)) return;

    try {
      await adminApi.updateUserRole(targetUser.id, nextRole);
      fetchAllData();
    } catch (err) {
      alert("MODIFICATION FAILED.");
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

  const RoleBadge = ({ r }: { r: string }) => {
    if (r === 'owner') return <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[9px] font-black uppercase rounded-lg italic shadow-[0_0_15px_rgba(245,158,11,0.2)] animate-pulse"><Crown size={10}/> Master</span>;
    if (r === 'admin') return <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[9px] font-black uppercase rounded-lg italic"><Shield size={10}/> Staff</span>;
    return <span className="px-3 py-1 bg-white/5 border border-white/10 text-slate-500 text-[9px] font-black uppercase rounded-lg">Subject</span>;
  };

  return (
    <div className={`space-y-12 pb-40 max-w-7xl mx-auto animate-in fade-in duration-1000 font-sans ${isOwner ? 'selection:bg-amber-500/30' : 'selection:bg-rose-500/30'}`}>
      
      {/* 层级视觉顶栏 - 金色/红玫瑰色动态切换 */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8 px-6 relative overflow-hidden p-10 rounded-[4rem]">
        {/* Owner 专属金色数字沙漏背景流光 */}
        {isOwner && (
          <div className="absolute inset-0 -z-10 opacity-20">
             <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 via-transparent to-amber-600/20 animate-pulse" />
             <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent blur-sm" />
             <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-amber-500/50 to-transparent blur-sm" />
          </div>
        )}

        <div className="flex items-center gap-8 relative z-10">
          <button onClick={onBack} className={`p-5 bg-${themeColor}/10 hover:bg-${themeColor}/20 rounded-[2.5rem] text-${themeColor} transition-all border border-${themeColor}/20 active:scale-90 shadow-2xl group`}>
            <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
               {isOwner ? <Crown className="text-amber-500 drop-shadow-[0_0_20px_rgba(245,158,11,0.8)]" size={44} /> : <ShieldCheck className="text-rose-500" size={44} />}
               <h1 className="text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
                 {isOwner ? 'Master' : 'Command'} <span className={`text-${themeColor}`}>{isOwner ? 'Registry' : 'Center'}</span>
               </h1>
            </div>
            <div className="flex items-center gap-5">
               <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-${themeColor}/20 border border-${themeColor}/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]`}>
                  <div className={`w-2 h-2 rounded-full animate-pulse bg-${themeColor}`} />
                  <span className={`text-[11px] font-black uppercase tracking-[0.3em] text-${themeColor}`}>
                    Clearance: {isOwner ? 'SOVEREIGN_OWNER' : 'STAFF_ADMIN'}
                  </span>
               </div>
               <div className="h-px w-12 bg-white/10" />
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.4em] italic">Active Node Registry v5.2</span>
            </div>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-950/90 p-2.5 rounded-[3rem] border border-white/5 backdrop-blur-3xl shadow-2xl relative z-10">
          {(['overview', 'users', 'records', 'security', 'infrastructure'] as AdminTab[]).map((tab) => {
            if (tab === 'infrastructure' && !isOwner) return null;
            return (
              <button 
                key={tab}
                onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
                className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-[0.25em] transition-all flex items-center gap-3 relative overflow-hidden ${activeTab === tab ? `bg-${themeColor} text-white shadow-lg` : 'text-slate-500 hover:text-slate-300'}`}
              >
                {activeTab === tab && <m.div layoutId="nav-glow" className="absolute inset-0 bg-white/20" />}
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
               {/* 核心指标 */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                    { label: 'Registry Nodes', val: data.users.length, icon: Users, color: `text-${themeColor}` },
                    { label: 'Neural Throughput', val: '51.8 GB', icon: Activity, color: 'text-indigo-400' },
                    { label: 'Telemetry Link', val: data.records.length, icon: Radio, color: 'text-emerald-400' },
                    { label: 'Logic Anomalies', val: data.security.length, icon: ShieldAlert, color: 'text-rose-500' }
                  ].map((stat, i) => (
                    <GlassCard key={i} className={`p-8 rounded-[4rem] border-white/5 group hover:border-${themeColor}/30 transition-all duration-1000 shadow-2xl`} intensity={1.8}>
                       <div className="flex justify-between items-start mb-8">
                          <div className={`p-5 bg-white/5 ${stat.color} rounded-[1.8rem] border border-white/5 group-hover:scale-110 transition-transform shadow-lg`}>
                            <stat.icon size={26} />
                          </div>
                          {isOwner && <Fingerprint size={16} className="text-amber-500/40" />}
                       </div>
                       <p className="text-5xl font-black text-white italic tracking-tighter mb-2">{loading ? '...' : stat.val}</p>
                       <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.3em]">{stat.label}</p>
                    </GlassCard>
                  ))}
               </div>
               {/* 监控图表 (保持逻辑不变) */}
            </m.div>
          ) : (
            <m.div key="table" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10">
               <GlassCard className="p-12 rounded-[5rem] border-white/5 shadow-2xl relative overflow-hidden" intensity={1.5}>
                  <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-10 mb-20 relative z-10">
                    <div className="space-y-3">
                       <h3 className="text-4xl font-black italic text-white uppercase tracking-tighter">
                         {activeTab.toUpperCase()} Registry
                       </h3>
                       <div className="flex items-center gap-4 text-slate-600">
                          <Terminal size={16} className={`text-${themeColor}`} />
                          <span className="text-[11px] font-black uppercase tracking-[0.4em] italic">Neural surveillance mode active</span>
                       </div>
                    </div>

                    <div className="flex gap-6 w-full xl:w-auto">
                      <div className="relative flex-1 xl:w-[420px] group">
                        <Search className={`absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-${themeColor} transition-colors`} size={22} />
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="FILTER NODE METRICS..."
                          className={`w-full bg-[#030712]/90 border border-white/10 rounded-full pl-18 pr-12 py-6 text-sm font-bold italic text-white outline-none focus:border-${themeColor}/50 transition-all shadow-inner`}
                        />
                      </div>
                      <button onClick={fetchAllData} className="p-6 bg-white/5 rounded-full text-slate-600 hover:text-white transition-all border border-white/5 shadow-xl active:scale-90">
                        <RefreshCw size={28} className={loading ? 'animate-spin' : ''} />
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto scrollbar-hide relative z-10">
                    <table className="w-full text-left border-separate border-spacing-y-6">
                      <thead>
                        <tr className="text-[12px] font-black uppercase text-slate-700 tracking-[0.5em] px-8">
                          <th className="pb-8 px-10">Neural Identifier</th>
                          <th className="pb-8 px-10">Clearance Status</th>
                          <th className="pb-8 px-10 text-right">Command Override</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredItems.map((item: any) => {
                          const isSelf = item.id === currentUserId;
                          // 权限核心逻辑：
                          // 1. Owner 可以管理除了自己以外的任何人。
                          // 2. Admin 只能管理 role === 'user' 的人。
                          const canManage = isOwner ? !isSelf : (item.role === 'user' && !isSelf);
                          const canChangeRole = isOwner && !isSelf;
                          
                          return (
                            <tr key={item.id} className={`hover:bg-${themeColor}/10 transition-all group rounded-[2.5rem]`}>
                              <td className="py-12 px-10">
                                 <div className="flex items-center gap-8">
                                   <div className={`w-20 h-20 rounded-[2.5rem] bg-gradient-to-br from-slate-900 to-black border border-white/5 flex items-center justify-center text-white text-3xl font-black italic transition-all group-hover:border-${themeColor}/40 group-hover:scale-105 shadow-2xl`}>
                                     {item.full_name?.[0]?.toUpperCase() || <User size={32} className="text-slate-800" />}
                                   </div>
                                   <div>
                                     <span className="text-xl font-black italic text-white block leading-none mb-3">
                                       {item.email || item.event_type || 'SYSTEM_NODE'}
                                       {isSelf && <span className={`ml-4 text-[10px] text-${themeColor} not-italic uppercase tracking-widest`}>[HOST]</span>}
                                     </span>
                                     <span className="text-[11px] font-mono text-slate-700 uppercase tracking-tighter">UID: {item.id?.slice(0, 20)}...</span>
                                   </div>
                                 </div>
                              </td>
                              <td className="py-12 px-10">
                                 <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-3 h-3 rounded-full ${item.is_blocked ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.7)]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'}`} />
                                       <RoleBadge r={item.role} />
                                       {item.is_blocked && <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic">Suspended</span>}
                                    </div>
                                    <div className="flex items-center gap-4 text-slate-700 font-bold">
                                       <Clock size={14} />
                                       <span className="text-[11px] font-black uppercase tracking-[0.2em]">{new Date(item.created_at || item.attempt_at).toLocaleString()}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="py-12 px-10 text-right">
                                 <div className="flex justify-end gap-4 opacity-0 group-hover:opacity-100 transition-all translate-x-8 group-hover:translate-x-0">
                                    {canManage ? (
                                      <>
                                        <button 
                                          onClick={() => handleToggleBlock(item)}
                                          className={`p-5 rounded-3xl border transition-all ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-rose-500 border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10'}`}
                                          title={item.is_blocked ? 'Activate Node' : 'Suspend Node'}
                                        >
                                          {item.is_blocked ? <ShieldCheck size={26}/> : <Ban size={26}/>}
                                        </button>
                                        <button className="p-5 bg-white/5 border border-white/10 rounded-3xl text-slate-500 hover:text-white transition-all shadow-lg">
                                          <Edit3 size={26} />
                                        </button>
                                      </>
                                    ) : (
                                      <div className="p-5 text-slate-800 flex items-center gap-3 bg-white/5 rounded-3xl border border-white/5 cursor-not-allowed">
                                         <LockKeyhole size={20} />
                                         <span className="text-[10px] font-black uppercase tracking-[0.3em]">Protected</span>
                                      </div>
                                    )}

                                    {/* 三个点按钮：仅 Owner 可用于角色提拔/降级 */}
                                    <button 
                                      onClick={() => handleRoleModification(item)}
                                      disabled={!canChangeRole}
                                      className={`p-5 rounded-3xl transition-all flex items-center justify-center ${
                                        canChangeRole 
                                          ? `bg-white/5 border border-white/10 text-${themeColor} hover:bg-${themeColor}/10 hover:border-${themeColor}/30 active:scale-90` 
                                          : 'text-slate-800 cursor-not-allowed opacity-20'
                                      }`}
                                      title={canChangeRole ? (item.role === 'admin' ? 'DEMOTE' : 'PROMOTE') : 'LOCKED'}
                                    >
                                      {canChangeRole ? (
                                        item.role === 'admin' ? <ArrowDown size={28} /> : <ArrowUp size={28} />
                                      ) : (
                                        <MoreHorizontal size={28} />
                                      )}
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

      <footer className="mt-32 flex flex-col items-center gap-8 opacity-40 text-center">
         <div className="flex items-center gap-5">
           <DatabaseZap size={18} className={`text-${themeColor}`} />
           <span className="text-[11px] font-mono tracking-[0.6em] uppercase font-black text-white">Quantum Registry v5.2 // SOVEREIGN_ID_{role.toUpperCase()}</span>
         </div>
      </footer>
    </div>
  );
};
