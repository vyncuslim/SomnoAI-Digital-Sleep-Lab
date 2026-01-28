
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Users, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, 
  Loader2, AlertCircle, Terminal, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, 
  Ban, Edit3, X, Save, Shield, MoreHorizontal,
  Bell, Lock, History, AlertTriangle, Fingerprint,
  FileText, Clock, Crown, ShieldQuestion,
  User, UserCircle
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
  'super_owner': 4 // 特殊逻辑：is_super_owner 标志
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
      // 1. 获取当前管理员详细权限
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const clearance = await adminApi.getAdminClearance(user.id);
        setCurrentAdmin({ id: user.id, ...clearance });
      }

      // 2. 并行获取所有管理数据
      const [users, records, feedback, logs, security] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents()
      ]);
      setData({ users, records, feedback, logs, security });
    } catch (err: any) {
      setError(err.message || "Sync Error: Laboratory Node unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, [fetchAllData]);

  // 核心权限检查逻辑：当前操作者是否能控制目标
  const canControlTarget = (target: any) => {
    if (!currentAdmin) return false;
    if (target.id === currentAdmin.id) return false; // 不能控制自己

    const myWeight = currentAdmin.is_super_owner ? ROLE_WEIGHTS.super_owner : ROLE_WEIGHTS[currentAdmin.role] || 1;
    const targetWeight = target.is_super_owner ? ROLE_WEIGHTS.super_owner : ROLE_WEIGHTS[target.role] || 1;

    // 阶梯规则：权重必须严格大于目标
    return myWeight > targetWeight;
  };

  const handleToggleBlock = async (user: any) => {
    if (!canControlTarget(user)) {
      alert("Clearance Violation: Insufficient privileges to manipulate this node.");
      return;
    }

    const action = user.is_blocked ? 'Restore' : 'Suspend';
    if (!confirm(`${action} subject ${user.email || user.id}? Suspended subjects are immediately expelled from the grid.`)) return;
    
    try {
      if (user.is_blocked) await adminApi.unblockUser(user.id);
      else await adminApi.blockUser(user.id);
      fetchAllData();
    } catch (err) {
      alert("Command failure: Registry authority rejected the request.");
    }
  };

  const filteredItems = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) {
      if (activeTab === 'users') return data.users;
      if (activeTab === 'records') return data.records;
      if (activeTab === 'security') return data.security;
      if (activeTab === 'logs') return data.logs;
      return [];
    }
    if (activeTab === 'users') return data.users.filter(u => (u.email || u.id).toLowerCase().includes(q));
    if (activeTab === 'records') return data.records.filter(r => r.id?.toLowerCase().includes(q) || r.user_id?.toLowerCase().includes(q));
    if (activeTab === 'security') return data.security.filter(s => (s.email || '').toLowerCase().includes(q) || (s.event_type || '').toLowerCase().includes(q));
    if (activeTab === 'logs') return data.logs.filter((l: any) => (l.action || '').toLowerCase().includes(q) || (l.message || '').toLowerCase().includes(q) || (l.user_id || '').toLowerCase().includes(q));
    return [];
  }, [searchQuery, activeTab, data]);

  const unreadAlerts = data.security.filter(s => !s.notified).length;

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-3xl text-rose-500 transition-all border border-rose-500/20 active:scale-95 shadow-lg">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none flex items-center gap-3">
              Lab <span className="text-rose-500">Command</span>
              {currentAdmin?.is_super_owner && <Crown size={28} className="text-amber-400" />}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Clearance: {currentAdmin?.is_super_owner ? 'ROOT / SUPER_OWNER' : currentAdmin?.role?.toUpperCase()} // Grid Status: Active
            </p>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'records', 'security', 'logs'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab === 'security' && unreadAlerts > 0 && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
              {tab === 'security' ? 'Security Pulse' : tab.replace('_', ' ')}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <m.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-8 px-2">
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
                <ShieldCheck size={32} className="text-emerald-400" />
                <p className="text-3xl font-black text-white">{currentAdmin?.is_super_owner ? 'ROOT' : 'LVL 0'}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Your Clearance</p>
             </GlassCard>
          </m.div>
        ) : (
          <m.div key={activeTab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mx-2">
             <GlassCard className="p-12 rounded-[5rem] border-white/10 shadow-2xl">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16 px-4">
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
                      <tr className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">
                        <th className="pb-8 px-8">Identifier</th>
                        <th className="pb-8 px-8">Context & Logic</th>
                        <th className="pb-8 px-8 text-right">Command</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems.map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="py-8 px-8">
                             <div className="flex items-center gap-4">
                               {activeTab === 'users' && (
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${item.is_super_owner ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-800 border-white/5 text-slate-500'}`}>
                                    {item.is_super_owner ? <Crown size={16}/> : <User size={16}/>}
                                 </div>
                               )}
                               <div>
                                 <span className="text-white font-bold italic block leading-none mb-1">
                                   {activeTab === 'logs' ? (item.action || 'SYSTEM_EVENT') : (item.email || item.id?.slice(0, 16) || 'Unknown')}
                                 </span>
                                 <span className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
                                   {item.role ? item.role.toUpperCase() : 'SUBJECT'} {item.is_super_owner && '/ ROOT'}
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
                                   <span className="text-[11px] font-medium text-slate-400 italic">{item.message || item.event_reason || 'Recorded Operation'}</span>
                                 )}
                               </div>
                             </div>
                          </td>
                          <td className="py-8 px-8 text-right">
                             <div className="flex justify-end gap-3">
                               {activeTab === 'users' && (
                                 canControlTarget(item) ? (
                                   <button 
                                      onClick={() => handleToggleBlock(item)}
                                      className={`p-3 rounded-xl border transition-all ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20 bg-emerald-500/5 hover:bg-emerald-500/10' : 'text-rose-400 border-rose-400/20 bg-rose-500/5 hover:bg-rose-500/10'}`}
                                      title={item.is_blocked ? 'Restore Subject' : 'Suspend Subject'}
                                   >
                                      {item.is_blocked ? <ShieldCheck size={18}/> : <Ban size={18}/>}
                                   </button>
                                 ) : (
                                   <div className="p-3 bg-slate-900 border border-white/5 rounded-xl text-slate-700" title="Clearance insufficient to modify this node">
                                      {item.id === currentAdmin?.id ? <UserCircle className="text-indigo-500" size={18}/> : <Lock size={18}/>}
                                   </div>
                                 )
                               )}
                               <button className="p-3 text-slate-700 hover:text-white transition-colors">
                                 <MoreHorizontal size={18} />
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
    </div>
  );
};
