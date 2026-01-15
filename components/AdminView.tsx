import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, MessageSquare, Database, ShieldAlert, 
  Trash2, Search, RefreshCw, CheckCircle, 
  Loader2, AlertCircle, Terminal, Zap, Activity, 
  DatabaseZap, ChevronLeft, ShieldCheck, UserCheck, 
  Ban, Edit3, X, Save, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi } from '../services/supabaseService.ts';

const m = motion as any;

type AdminTab = 'overview' | 'users' | 'records' | 'feedback' | 'audit_logs';

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{ users: any[], records: any[], feedback: any[], logs: any[] }>({ 
    users: [], records: [], feedback: [], logs: [] 
  });
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [users, records, feedback, logs] = await Promise.all([
        adminApi.getUsers(),
        adminApi.getSleepRecords(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs()
      ]);
      setData({ users, records, feedback, logs });
    } catch (err: any) {
      setError(err.message || "Sync Error: Laboratory Node unreachable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleToggleBlock = async (user: any) => {
    const action = user.is_blocked ? 'Unblock' : 'Block';
    if (!confirm(`${action} subject ${user.email || user.id}? This will immediately expel them from the neural grid.`)) return;
    
    try {
      if (user.is_blocked) await adminApi.unblockUser(user.id);
      else await adminApi.blockUser(user.id);
      fetchAllData();
    } catch (err) {
      alert("Command failure: Registry rejection.");
    }
  };

  const filteredItems = () => {
    const q = searchQuery.toLowerCase();
    if (activeTab === 'users') return data.users.filter(u => (u.email || u.id).toLowerCase().includes(q));
    if (activeTab === 'records') return data.records.filter(r => r.id?.toLowerCase().includes(q) || r.user_id?.toLowerCase().includes(q));
    return [];
  };

  return (
    <div className="space-y-10 pb-32 max-w-6xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-6">
          {onBack && (
            <button onClick={onBack} className="p-4 bg-rose-500/10 hover:bg-rose-500/20 rounded-3xl text-rose-500 transition-all border border-rose-500/20 active:scale-95 shadow-lg">
              <ChevronLeft size={24} />
            </button>
          )}
          <div className="space-y-2">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Lab <span className="text-rose-500">Command</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Clearance: Superuser // Protocol: Secure</p>
          </div>
        </div>
        
        <nav className="flex gap-2 bg-slate-900/60 p-1.5 rounded-full border border-white/5 backdrop-blur-3xl shadow-2xl overflow-x-auto no-scrollbar">
          {(['overview', 'users', 'records'] as AdminTab[]).map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.15em] transition-all ${activeTab === tab ? 'bg-rose-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <m.div key="overview" className="grid grid-cols-1 md:grid-cols-3 gap-8 px-2">
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <Users size={32} className="text-rose-400" />
                <p className="text-3xl font-black text-white">{data.users.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registry Subjects</p>
             </GlassCard>
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <Database size={32} className="text-indigo-400" />
                <p className="text-3xl font-black text-white">{data.records.length}</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Biometric Streams</p>
             </GlassCard>
             <GlassCard className="p-10 rounded-[3.5rem] border-white/5 flex flex-col items-center gap-4 text-center">
                <Terminal size={32} className="text-emerald-400" />
                <p className="text-3xl font-black text-white">LVL 0</p>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">System Clearance</p>
             </GlassCard>
          </m.div>
        ) : (
          <m.div key={activeTab} className="mx-2">
             <GlassCard className="p-12 rounded-[5rem] border-white/10 shadow-2xl">
                <div className="flex justify-between items-center mb-16">
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{activeTab} Registry</h3>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SCANNING NODE..." 
                    className="bg-slate-950/60 border border-white/10 rounded-full px-8 py-4 text-[11px] font-black uppercase text-white outline-none focus:border-rose-500/50 w-64"
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[11px] font-black uppercase text-slate-500 tracking-[0.4em] border-b border-white/5">
                        <th className="pb-8 px-8">Identity</th>
                        <th className="pb-8 px-8">Status</th>
                        <th className="pb-8 px-8 text-right">Command</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredItems().map((item: any) => (
                        <tr key={item.id} className="hover:bg-white/[0.02]">
                          <td className="py-8 px-8">
                             <span className="text-white font-bold italic block">{item.email || item.id.slice(0, 16)}</span>
                             <span className="text-[9px] font-mono text-slate-600">HASH: {item.id}</span>
                          </td>
                          <td className="py-8 px-8">
                             <div className="flex items-center gap-2">
                               <div className={`w-2 h-2 rounded-full ${item.is_blocked ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                               <span className={`text-[10px] font-black uppercase tracking-widest ${item.is_blocked ? 'text-rose-400' : 'text-emerald-400'}`}>
                                 {item.is_blocked ? 'Suspended' : 'Validated'}
                               </span>
                             </div>
                          </td>
                          <td className="py-8 px-8 text-right">
                             {activeTab === 'users' && (
                               <button 
                                onClick={() => handleToggleBlock(item)}
                                className={`p-3 rounded-xl border transition-all ${item.is_blocked ? 'text-emerald-400 border-emerald-400/20' : 'text-rose-400 border-rose-400/20'}`}
                               >
                                {item.is_blocked ? <ShieldCheck size={18}/> : <Ban size={18}/>}
                               </button>
                             )}
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
