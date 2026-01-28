
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, Crown, ShieldQuestion,
  User, UserCircle, ShieldX
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { SecurityEvent } from '../types.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'records' | 'security' | 'logs';

// 权限权重定义
const ROLE_WEIGHTS: Record<string, number> = {
  'user': 1,
  'admin': 2,
  'owner': 3,
  'super_owner': 4 // 对应 is_super_owner 为 true 的情况
};

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<{ id: string, role: string, is_super_owner: boolean } | null>(null);
  const [data, setData] = useState<{ users: any[], records: any[], feedback: any[], logs: any[], security: SecurityEvent[] }>({ 
    users: [], records: [], feedback: [], logs: [], security: []
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. 获取当前登录者的特权等级
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const clearance = await adminApi.getAdminClearance(user.id);
        setCurrentAdmin({ id: user.id, ...clearance });
      }

      // 2. 并行同步管理端数据
      const [users, records, feedback, logs, security] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents()
      ]);
      setData({ users, records, feedback, logs, security });
    } catch (err: any) {
      setError(err.message || "Sync Error: Neural Registry node unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // 核心阶梯判断逻辑：只有权重更高的人能管理权重更低的人
  const canControlTarget = (target: any) => {
    if (!currentAdmin) return false;
    
    // 严禁操作自己
    if (target.id === currentAdmin.id) return false;

    // 计算操作者权重
    const myWeight = currentAdmin.is_super_owner ? ROLE_WEIGHTS.super_owner : (ROLE_WEIGHTS[currentAdmin.role] || 1);
    
    // 计算目标权重
    const targetWeight = target.is_super_owner ? ROLE_WEIGHTS.super_owner : (ROLE_WEIGHTS[target.role] || 1);

    // 只有严格大于对方权重时才有管理权
    return myWeight > targetWeight;
  };

  const handleToggleBlock = async (user: any) => {
    if (!canControlTarget(user)) {
      notificationAlert("Clearance Denied", "Your neural rank is insufficient to manipulate this node.");
      return;
    }

    const action = user.is_blocked ? 'Restore' : 'Suspend';
    const warning = user.role === 'admin' || user.role === 'owner' 
      ? `ATTENTION: You are about to ${action.toLowerCase()} a high-clearance node (${user.role.toUpperCase()}).` 
      : `Subject ${user.email || user.id} will be ${user.is_blocked ? 'restored to' : 'expelled from'} the grid.`;

    if (!confirm(`${warning}\n\nProceed with ${action}?`)) return;
    
    try {
      if (user.is_blocked) await adminApi.unblockUser(user.id);
      else await adminApi.blockUser(user.id);
      fetchAllData();
    } catch (err) {
      notificationAlert("Protocol Failure", "Registry authority rejected the instruction.");
    }
  };

  const notificationAlert = (title: string, msg: string) => {
    alert(`[${title.toUpperCase()}]\n${msg}`);
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    const currentList = (() => {
      switch(activeTab) {
        case 'users': return data.users;
        case 'records': return data.records;
        case 'security': return data.security;
        case 'logs': return data.logs;
        default: return [];
      }
    })();

    if (!q) return currentList;
    
    return currentList.filter((item: any) => {
      const searchStr = `${item.email} ${item.id} ${item.action} ${item.message} ${item.event_type}`.toLowerCase();
      return searchStr.includes(q);
    });
  }, [searchQuery, activeTab, data]);

  const unreadAlerts = data.security.filter(s => !s.notified).length;

  return (
    <div className="space-y-12 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-white/5 hover:bg-rose-500/10 rounded-3xl text-slate-400 hover:text-rose-500 transition-all border border-white/5 shadow-lg active:scale-95">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-3">
              Lab <span className="text-rose-500">Command</span>
              {currentAdmin?.is_super_owner && (
                <m.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                  <Crown size={28} className="text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.4)]" />
                </m.div>
              )}
            </h1>
            <div className="flex items-center gap-3">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
                 Clearance: {currentAdmin?.is_super_owner ? 'ROOT / SUPER_OWNER' : currentAdmin?.role?.toUpperCase()}
               </span>
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'records', 'security', 'logs'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'security' && unreadAlerts > 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              {tab === 'security' ? 'Security Pulse' : tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <m.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-6 px-2">
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <Users size={32} className="text-rose-400" />
                <p className="text-3xl font-black text-white">{loading ? '...' : data.users.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registry Subjects</p>
             </GlassCard>
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <ShieldAlert size={32} className={`transition-colors ${unreadAlerts > 0 ? 'text-rose-500 animate-pulse' : 'text-amber-400'}`} />
                <p className="text-3xl font-black text-white">{loading ? '...' : data.security.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Security Events</p>
             </GlassCard>
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <FileText size={32} className="text-indigo-400" />
                <p className="text-3xl font-black text-white">{loading ? '...' : data.logs.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audit Trails</p>
             </GlassCard>
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                {currentAdmin?.is_super_owner ? <Crown size={32} className="text-amber-400" /> : <ShieldCheck size={32} className="text-emerald-400" />}
                <p className="text-3xl font-black text-white">{currentAdmin?.is_super_owner ? 'ROOT' : currentAdmin?.role?.toUpperCase().slice(0, 3)}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Your Clearance</p>
             </GlassCard>
          </m.div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mx-2">
             <GlassCard className="p-10 md:p-12 rounded-[5rem] border-white/10 shadow-2xl overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 px-4">
                  <div>
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">
                      {activeTab === 'security' ? 'Security Monitoring Pulse' : activeTab === 'logs' ? 'System Audit Trails' : `${activeTab} Registry`}
                    </h3>
                    <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">Live Endpoint Visualization</p>
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-80">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                      <input 
                        type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="SCAN REGISTRY..."
                        className="w-full bg-slate-950/60 border border-white/10 rounded-full pl-10 pr-12 py-4 text-[11px] font-black uppercase text-white outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-800"
                      />
                    </div>
                    <button onClick={fetchAllData} className="p-4 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all border border-white/5">
                      <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-black uppercase text-slate-600 tracking-[0.4em] border-b border-white/5">
                        <th className="pb-8 px-8">Identifier</th>
                        <th className="pb-8 px-8">Context & Logic</th>
                        <th className="pb-8 px-8 text-right">Command</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map((item: any) => {
                        const hasClearance = canControlTarget(item);
                        const isSelf = item.id === currentAdmin?.id;

                        return (
                          <tr key={item.id} className={`transition-colors group ${isSelf ? 'bg-indigo-500/[0.03]' : 'hover:bg-white/[0.01]'}`}>
                            <td className="py-8 px-8">
                               <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
                                   item.is_super_owner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.15)]' : 
                                   item.role === 'owner' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' :
                                   item.role === 'admin' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' :
                                   'bg-slate-800 border-white/5 text-slate-600'
                                 }`}>
                                    {item.is_super_owner ? <Crown size={20}/> : item.role === 'owner' ? <ShieldCheck size={20}/> : <User size={20}/>}
                                 </div>
                                 <div>
                                   <div className="flex items-center gap-2 mb-1">
                                      <span className="text-white font-black italic block leading-none truncate max-w-[180px]">
                                        {activeTab === 'logs' ? (item.action || 'SYSTEM_EVENT') : (item.email || item.id?.slice(0, 16) || 'Unknown')}
                                      </span>
                                      {isSelf && <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase">YOU</span>}
                                   </div>
                                   <span className="text-[9px] font-mono text-slate-500 uppercase tracking-tighter flex items-center gap-1.5">
                                     {item.role?.toUpperCase() || 'SUBJECT'} 
                                     {item.is_super_owner && <span className="text-amber-500 font-black">/ ROOT AUTHORITY</span>}
                                   </span>
                                 </div>
                               </div>
                            </td>
                            <td className="py-8 px-8">
                               <div className="flex flex-col gap-1">
                                 <div className="flex items-center gap-3">
                                   {activeTab === 'security' ? (
                                     <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${item.event_type === 'AUTO_BLOCK' ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}`}>
                                        {item.event_type}
                                     </span>
                                   ) : activeTab === 'users' ? (
                                     <>
                                       <div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-rose-500' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} />
                                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border transition-colors ${item.is_blocked ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-emerald-500/5 border-emerald-500/20 text-emerald-500'}`}>
                                         {item.is_blocked ? 'Suspended' : 'Validated'}
                                       </span>
                                     </>
                                   ) : (
                                     <span className="text-[11px] font-medium text-slate-400 italic leading-relaxed">{item.message || item.event_reason || 'Recorded Operation'}</span>
                                   )}
                                 </div>
                               </div>
                            </td>
                            <td className="py-8 px-8 text-right">
                               <div className="flex justify-end gap-3">
                                 {activeTab === 'users' && (
                                   hasClearance ? (
                                     <button 
                                        onClick={() => handleToggleBlock(item)}
                                        className={`p-3.5 rounded-2xl border transition-all active:scale-90 ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-rose-400 border-rose-400/20 bg-rose-500/5 hover:bg-rose-500/10'}`}
                                        title={item.is_blocked ? 'Restore Subject' : 'Suspend Subject'}
                                     >
                                        {item.is_blocked ? <ShieldCheck size={20}/> : <Ban size={20}/>}
                                     </button>
                                   ) : (
                                     <div 
                                        className="p-3.5 bg-slate-900/80 border border-white/5 rounded-2xl text-slate-700 cursor-help group/lock relative" 
                                        title={isSelf ? "Self-manipulation restricted" : "Access Violation: Insufficient clearance"}
                                     >
                                        {isSelf ? <UserCircle className="text-indigo-600/50" size={20}/> : <Lock size={20}/>}
                                        {/* 悬浮提示 */}
                                        <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-slate-950 border border-white/10 rounded-lg text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap opacity-0 group-hover/lock:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                                          {isSelf ? "Action Locked: Self" : `Clearance Rank Required: > ${item.is_super_owner ? 'SUPER' : item.role?.toUpperCase()}`}
                                        </div>
                                     </div>
                                   )
                                 )}
                                 <button className="p-3.5 text-slate-700 hover:text-white transition-colors">
                                   <MoreHorizontal size={20} />
                                 </button>
                               </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                {filteredItems.length === 0 && (
                  <div className="py-20 text-center space-y-4 opacity-30">
                    <ShieldX size={48} className="mx-auto" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">No matching signals identified</p>
                  </div>
                )}
             </GlassCard>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
