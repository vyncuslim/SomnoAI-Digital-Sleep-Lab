import React, { useState, useEffect } from 'react';
import { 
  Users, User, RefreshCw, ChevronLeft, 
  List, MessageSquare,
  AlertTriangle, Search, Lightbulb, Sparkles,
  Activity, Shield, Clock, Moon, BarChart3, Save,
  TrendingUp, Globe, MousePointer2
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase } from '../services/supabaseService.ts';
import { Language, getTranslation } from '../services/i18n.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type AdminTab = 'overview' | 'registry' | 'signals' | 'system' | 'feedback' | 'analytics';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: Shield },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users },
  { id: 'sleep_records', name: 'Sleep Matrix', group: 'Biometrics', icon: Moon },
  { id: 'feedback', name: 'User Feedback', group: 'Support', icon: MessageSquare },
  { id: 'app_settings', name: 'App Settings', group: 'Config', icon: BarChart3 }
];

interface MarketingData {
  date: string;
  datasource: string;
  source: string;
  active_users: number;
  clicks: number;
  active1_day_users: number;
  active7_day_users: number;
}

interface AdminViewProps {
  lang: Language;
  onBack: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ lang, onBack }) => {
  const { profile, isAdmin, isOwner, isSuperOwner, loading: authLoading } = useAuth();
  const t = getTranslation(lang, 'admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [securityEvents, setSecurityEvents] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  const [marketingData, setMarketingData] = useState<MarketingData[]>([]);
  const [loadingMarketing, setLoadingMarketing] = useState(false);
  
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [showAllData, setShowAllData] = useState(false);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchMarketingData();
    }
  }, [activeTab]);

  const fetchMarketingData = async () => {
    setLoadingMarketing(true);
    try {
      const response = await fetch('https://connectors.windsor.ai/all?api_key=aa3204e4ef7d0c86362b3131645f629093b2&date_preset=last_14d&fields=account_id,account_name,achievement_id,active1_day_users,active7_day_users,active_users,clicks,datasource,date,source&select_accounts=googleanalytics4__380909155,searchconsole__sc-domain%3Asleepsomno.com');
      const data = await response.json();
      if (data && data.data) {
        setMarketingData(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch marketing data:", error);
    } finally {
      setLoadingMarketing(false);
    }
  };

  const canManage = (targetUser: any) => {
    if (!profile) return false;
    
    // Self management is usually allowed but here we focus on admin actions
    if (profile.id === targetUser.id) return false;

    const myRole = isSuperOwner ? 'super_owner' : (isOwner ? 'owner' : (isAdmin ? 'admin' : 'user'));
    const targetRole = targetUser.is_super_owner ? 'super_owner' : (targetUser.role || 'user');

    if (myRole === 'super_owner') {
      // Super owner can manage everyone except other super owners (optional constraint, but safer)
      return targetRole !== 'super_owner'; 
    }
    if (myRole === 'owner') {
      // Owner can manage user and admin, but NOT super_owner or other owners (usually)
      return ['user', 'admin'].includes(targetRole);
    }
    if (myRole === 'admin') {
      // Admin can only manage user
      return targetRole === 'user';
    }
    return false;
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      if (newRole === 'super_owner') {
        await supabase.from('profiles').update({ role: 'owner', is_super_owner: true }).eq('id', userId);
      } else {
        await supabase.from('profiles').update({ role: newRole, is_super_owner: false }).eq('id', userId);
      }
      fetchData();
    } catch (error) {
      console.error("Failed to update role:", error);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      await Promise.all(Object.entries(settings).map(([key, value]) => 
        adminApi.updateSetting(key, value)
      ));
      alert('Settings saved successfully');
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-[#01040a] flex items-center justify-center text-white">Authenticating...</div>;
  if (!isAdmin) return <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-6 text-center">
    <Shield size={48} className="text-rose-500 mb-4" />
    <h1 className="text-2xl font-black uppercase tracking-widest mb-2">Access Denied</h1>
    <p className="text-slate-500 max-w-md mb-8">You do not have the required clearance to access the Neural Admin Console.</p>
    <button onClick={onBack} className="px-8 py-3 bg-indigo-600 rounded-full font-bold uppercase tracking-widest">Return to Base</button>
  </div>;

  const fetchData = async () => {
    setIsSyncing(true);
    try {
      const { data: { user }, error } = await (supabase.auth as any).getUser();
      if (error) throw error;
      if (!user) return;

      const [uRes, fRes, aRes, sRes, setRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents(),
        adminApi.getSettings()
      ]);

      setUsers(uRes.status === 'fulfilled' ? (uRes as any).value.data : []);
      setFeedback(fRes.status === 'fulfilled' ? (fRes as any).value.data : []);
      setAuditLogs(aRes.status === 'fulfilled' ? (aRes as any).value.data : []);
      setSecurityEvents(sRes.status === 'fulfilled' ? (sRes as any).value.data : []);
      
      if (setRes.status === 'fulfilled' && (setRes as any).value.data) {
        const settingsMap: Record<string, string> = {};
        (setRes as any).value.data.forEach((s: any) => settingsMap[s.key] = s.value);
        setSettings(settingsMap);
      }
      
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
          <div>
            <h1 className="text-2xl font-black uppercase tracking-widest">{t.title || 'Admin Console'}</h1>
            {isSuperOwner && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">Super Owner Access</span>}
            {isOwner && !isSuperOwner && <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wider">Owner Access</span>}
            {!isOwner && !isSuperOwner && <span className="text-[10px] font-bold bg-slate-500/20 text-slate-500 px-2 py-0.5 rounded border border-slate-500/30 uppercase tracking-wider">Admin Access</span>}
          </div>
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
        {['overview', 'registry', 'signals', 'system', 'feedback', 'analytics'].map((tab) => (
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
                    <select 
                      value={user.is_super_owner ? 'super_owner' : (user.role || 'user')}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      disabled={!canManage(user)}
                      className={`bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-xs font-bold uppercase tracking-wider outline-none focus:border-indigo-500 transition-colors ${!canManage(user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <option value="user">User</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                      <option value="owner">Owner</option>
                      {isSuperOwner && <option value="super_owner">Super Owner</option>}
                    </select>
                    <button 
                      onClick={async () => {
                        const newStatus = !user.is_blocked;
                        await supabase.from('profiles').update({ is_blocked: newStatus }).eq('id', user.id);
                        if (newStatus) {
                          await supabase.rpc('block_user', { target_email: user.email });
                        } else {
                          await supabase.rpc('reset_login_attempts', { target_email: user.email });
                        }
                        fetchData();
                      }}
                      disabled={!canManage(user)}
                      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${user.is_blocked ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'} ${!canManage(user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={user.is_blocked ? "Unblock User" : "Block User"}
                    >
                      {user.is_blocked ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {securityEvents.map((event) => (
                <GlassCard key={event.id} className="p-6 flex items-center justify-between border-l-4 border-l-rose-500">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-rose-500/10 text-rose-500 rounded-full">
                      <Shield size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-rose-400 uppercase tracking-wider text-xs">{event.type}</h4>
                      <p className="text-sm text-slate-300 mt-1">{event.details}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-mono">{new Date(event.created_at).toLocaleString()}</p>
                    <p className="text-xs text-slate-600 font-mono mt-1">{event.ip_address}</p>
                  </div>
                </GlassCard>
              ))}
              {securityEvents.length === 0 && (
                <div className="text-center py-20 text-slate-500">No security events detected.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              {auditLogs.map((log) => (
                <GlassCard key={log.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white/5 rounded-lg text-slate-400">
                      <List size={16} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{log.action}</h4>
                      <p className="text-xs text-slate-500 font-mono">User: {log.user_id}</p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-600 font-mono">{new Date(log.created_at).toLocaleString()}</span>
                </GlassCard>
              ))}
              {auditLogs.length === 0 && (
                <div className="text-center py-20 text-slate-500">No audit logs available.</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8 px-2 max-w-5xl mx-auto">
            {/* ... (existing feedback content) ... */}
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

        {activeTab === 'analytics' && (
          <div className="max-w-3xl mx-auto space-y-8">
            <div className="flex items-center gap-6 mb-8">
               <div className="p-5 bg-indigo-500/10 rounded-[2rem] text-indigo-400 border border-indigo-500/20 shadow-xl">
                 <BarChart3 size={32} />
               </div>
               <div>
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Analytics & SEO</h2>
                 <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black italic mt-1.5">
                    Configure external tracking signals
                 </p>
               </div>
            </div>

            {(isOwner || isSuperOwner) && (
              <GlassCard className="p-8 rounded-[2rem] border-white/5 space-y-6">
                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">Google Analytics Measurement ID</label>
                  <div className="relative group">
                    <Activity className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="G-XXXXXXXXXX"
                      value={settings.ga_measurement_id || ''}
                      onChange={(e) => setSettings({...settings, ga_measurement_id: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600">Enter your GA4 Measurement ID to enable traffic tracking.</p>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">Google Search Console Verification</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="HTML Tag Content (e.g., google-site-verification=...)"
                      value={settings.google_site_verification || ''}
                      onChange={(e) => setSettings({...settings, google_site_verification: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-600">Enter the content of the meta tag for ownership verification.</p>
                </div>

                <div className="pt-8 flex justify-end">
                  <button 
                    onClick={handleSaveSettings}
                    disabled={savingSettings}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-full font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {savingSettings ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                    Save Configuration
                  </button>
                </div>
              </GlassCard>
            )}

            <div className="flex items-center gap-6 pt-8 mb-8">
               <div className="p-5 bg-emerald-500/10 rounded-[2rem] text-emerald-400 border border-emerald-500/20 shadow-xl">
                 <TrendingUp size={32} />
               </div>
               <div>
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Marketing Insights</h2>
                 <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black italic mt-1.5">
                    Live data from Windsor.ai
                 </p>
               </div>
            </div>

            {loadingMarketing ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="animate-spin text-indigo-500" size={32} />
              </div>
            ) : marketingData.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Users size={16} className="text-indigo-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Active Users</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {marketingData.reduce((acc, curr) => acc + (parseInt(curr.active_users as any) || 0), 0)}
                    </p>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <MousePointer2 size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Total Clicks</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {marketingData.reduce((acc, curr) => acc + (parseInt(curr.clicks as any) || 0), 0)}
                    </p>
                  </GlassCard>
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <Globe size={16} className="text-amber-400" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Sources</span>
                    </div>
                    <p className="text-2xl font-black text-white">
                      {new Set(marketingData.map(d => d.source)).size}
                    </p>
                  </GlassCard>
                </div>

                <GlassCard className="p-6 rounded-[2rem] border-white/5 overflow-hidden">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Traffic Trend (Last 14 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={marketingData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month:'short', day:'numeric'})} />
                        <YAxis stroke="#64748b" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                          itemStyle={{ color: '#fff', fontSize: '12px' }}
                        />
                        <Legend />
                        <Line type="monotone" dataKey="active_users" stroke="#818cf8" strokeWidth={2} dot={false} name="Active Users" />
                        <Line type="monotone" dataKey="clicks" stroke="#34d399" strokeWidth={2} dot={false} name="Clicks" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Date</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Source</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Platform</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Active Users</th>
                        <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Clicks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(showAllData ? marketingData : marketingData.slice(0, 10)).map((row, i) => (
                        <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="p-4 text-sm font-mono text-slate-300">{row.date}</td>
                          <td className="p-4 text-sm font-bold text-white">{row.source}</td>
                          <td className="p-4 text-xs font-mono text-slate-500 uppercase">{row.datasource}</td>
                          <td className="p-4 text-sm font-mono text-indigo-400 text-right">{row.active_users || '-'}</td>
                          <td className="p-4 text-sm font-mono text-emerald-400 text-right">{row.clicks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {marketingData.length > 10 && (
                    <div className="flex justify-center mt-4">
                      <button 
                        onClick={() => setShowAllData(!showAllData)}
                        className="text-xs font-bold uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        {showAllData ? 'Show Less' : `Show All (${marketingData.length})`}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                No marketing data available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
