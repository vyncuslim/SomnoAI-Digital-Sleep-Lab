import React, { useState, useEffect } from 'react';
import { 
  Users, User, RefreshCw, ChevronLeft, 
  List, MessageSquare,
  AlertTriangle, Search, Lightbulb, Sparkles,
  Activity, Shield, Clock
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { Language } from '../services/i18n.ts';

type AdminTab = 'overview' | 'registry' | 'signals' | 'system' | 'feedback';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: Shield },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users },
  { id: 'feedback', name: 'User Feedback', group: 'Support', icon: MessageSquare }
];

interface AdminViewProps {
  lang: Language;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const [uRes, fRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getFeedback()
      ]);

      setUsers(uRes.status === 'fulfilled' ? (uRes as any).value.data : []);
      setFeedback(fRes.status === 'fulfilled' ? (fRes as any).value.data : []);
      
      const counts: Record<string, number> = {};
      for (const t of DATABASE_SCHEMA) {
        const { count } = await supabase.from(t.id).select('*', { count: 'exact', head: true });
        counts[t.id] = count || 0;
      }
      setTableCounts(counts);

    } catch (error) {
      console.error("Admin sync failed:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans p-6">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-2xl font-black uppercase tracking-widest">Admin Console</h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={fetchData} 
            disabled={isSyncing}
            className={`p-2 bg-indigo-600 rounded-full hover:bg-indigo-500 transition-colors ${isSyncing ? 'animate-spin' : ''}`}
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      <div className="flex gap-8 mb-8 overflow-x-auto pb-4">
        {['overview', 'registry', 'signals', 'system', 'feedback'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as AdminTab)}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {DATABASE_SCHEMA.map((item) => (
              <GlassCard key={item.id} className="p-6 flex items-center gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-indigo-400">
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{item.name}</p>
                  <h3 className="text-2xl font-black">{tableCounts[item.id] || 0}</h3>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {activeTab === 'registry' && (
          <div className="space-y-6">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
              <Search size={20} className="text-slate-500" />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-white w-full font-mono"
              />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {users.filter(u => u.email?.includes(searchQuery) || u.id?.includes(searchQuery)).map((user) => (
                <GlassCard key={user.id} className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center font-bold">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold">{user.email}</h4>
                      <p className="text-xs text-slate-500 font-mono">{user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {user.role || 'user'}
                    </span>
                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                      <Shield size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8 px-2 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-2 text-left border-b border-white/5 pb-8">
               <div className="flex items-center gap-6">
                  <div className="p-5 bg-indigo-500/10 rounded-[2rem] text-indigo-400 border border-indigo-500/20 shadow-xl">
                    <MessageSquare size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">User Feedback</h2>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black italic mt-1.5 flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /> Community Signals
                    </p>
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 gap-6">
              {feedback.length > 0 ? (
                feedback.map((item) => (
                  <GlassCard key={item.id} className="p-10 rounded-[3rem] border-white/5 hover:bg-white/[0.02] transition-all group overflow-hidden relative">
                    <div className="flex flex-col md:flex-row items-start gap-8">
                      <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 border shadow-inner ${
                        item.type === 'report' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 
                        item.type === 'suggestion' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 
                        'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                      }`}>
                         {item.type === 'report' ? <AlertTriangle size={28} /> : item.type === 'suggestion' ? <Lightbulb size={28} /> : <Sparkles size={28} />}
                      </div>
                      
                      <div className="flex-1 space-y-4 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                           <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase border italic ${
                             item.type === 'report' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                             item.type === 'suggestion' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                             'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                           }`}>
                             {item.type.toUpperCase()}
                           </span>
                           <span className="text-[10px] font-mono text-slate-600 flex items-center gap-2">
                             <Clock size={12} /> {new Date(item.created_at).toLocaleString()}
                           </span>
                        </div>
                        
                        <p className="text-sm font-medium text-slate-300 italic leading-relaxed bg-black/40 p-6 rounded-2xl border border-white/5">
                          "{item.content}"
                        </p>

                        <div className="flex items-center gap-3 opacity-60 pt-2">
                           <User size={12} className="text-slate-500" />
                           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.email}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="py-40 flex flex-col items-center justify-center opacity-20 gap-8 border-2 border-dashed border-white/5 rounded-[5rem]">
                   <MessageSquare size={64} className="text-slate-700" />
                   <p className="text-[12px] font-black uppercase tracking-[0.6em] italic text-slate-600">No feedback signals received</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
