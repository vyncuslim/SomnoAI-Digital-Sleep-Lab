import React, { useState, useEffect } from 'react';
import { 
  Users, User, RefreshCw, ChevronLeft, 
  List, MessageSquare,
  AlertTriangle, Search,
  Activity, Shield, Clock, Moon, BarChart3, Save,
  TrendingUp, ShieldOff, Mail, Bell,
  Star, Unlock, Lock
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { adminApi, supabase, logError } from '../services/supabaseService';
import { securityService } from '../services/securityService';
import { Language, getTranslation } from '../services/i18n';
import { useAuth } from '../context/AuthContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { emailService } from '../services/emailService';
import { UserProfile, Feedback, AuditLog, SecurityEvent, Review } from '../types';

import { FounderDashboard } from './FounderDashboard';

type AdminTab = 'overview' | 'founder' | 'logins' | 'registry' | 'signals' | 'system' | 'feedback' | 'analytics' | 'communications' | 'reviews' | 'errors';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', name: 'Traffic Records', group: 'GA4 Telemetry', icon: Activity },
  { id: 'audit_logs', name: 'System Audits', group: 'Maintenance', icon: List },
  { id: 'security_events', name: 'Security Signals', group: 'Security', icon: Shield },
  { id: 'profiles', name: 'Subject Registry', group: 'Core', icon: Users },
  { id: 'logins', name: 'Login History', group: 'Security', icon: Shield },
  { id: 'sleep_records', name: 'Sleep Matrix', group: 'Biometrics', icon: Moon },
  { id: 'feedback', name: 'User Feedback', group: 'Support', icon: MessageSquare },
  { id: 'app_settings', name: 'App Settings', group: 'Config', icon: BarChart3 },
  { id: 'error_logs', name: 'Error Logs', group: 'System', icon: AlertTriangle },
  { id: 'communications', name: 'Comms Center', group: 'System', icon: Mail },
  { id: 'reviews', name: 'Product Reviews', group: 'Sentiment', icon: Star }
];

interface AdminDashboardProps {
  lang: Language;
  onBack: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ lang, onBack }) => {
  const { profile, isAdmin, isOwner, isSuperOwner, loading: authLoading } = useAuth();
  const t = getTranslation(lang, 'admin');
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [errorLogs, setErrorLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  const [marketingData, setMarketingData] = useState<any[]>([]);
  const [loadingMarketing, setLoadingMarketing] = useState(false);
  const [marketingError, setMarketingError] = useState<string | null>(null);
  
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    console.log('AdminDashboard: authLoading=', authLoading, 'isAdmin=', isAdmin);
    if (!authLoading && isAdmin) {
      fetchData();
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      // fetchMarketingData();
    }
  }, [activeTab]);

  const fetchMarketingData = async () => {
    setLoadingMarketing(true);
    setMarketingError(null);
    try {
      // Updated domain to digitalsleeplab.com
      const response = await fetch('https://connectors.windsor.ai/all?api_key=aa3204e4ef7d0c86362b3131645f629093b2&date_preset=last_14d&fields=account_id,account_name,achievement_id,active1_day_users,active7_day_users,active_users,clicks,sessions,datasource,date,source&select_accounts=googleanalytics4__380909155,searchconsole__sc-domain%3Adigitalsleeplab.com');
      
      const text = await response.text();
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${text}`);
      }
      
      try {
        const data = JSON.parse(text);
        if (data && data.data) {
          setMarketingData(data.data);
        } else {
          console.error("Marketing data format invalid:", data);
          setMarketingError("Marketing data format invalid");
        }
      } catch (e) {
        console.error("Failed to parse marketing data as JSON. Response text:", text);
        setMarketingError("Failed to parse marketing data as JSON");
        throw new Error("Invalid JSON response from marketing API");
      }
    } catch (error) {
      console.error("Failed to fetch marketing data:", error);
      setMarketingError(error instanceof Error ? error.message : "Failed to fetch marketing data");
    } finally {
      setLoadingMarketing(false);
    }
  };

  const canManage = (targetUser: UserProfile) => {
    if (!profile) return false;
    
    if (profile.id === targetUser.id) return false;

    const myRole = isSuperOwner ? 'super_owner' : (isOwner ? 'owner' : (isAdmin ? 'admin' : 'user'));
    const targetRole = targetUser.is_super_owner ? 'super_owner' : (targetUser.role || 'user');

    if (myRole === 'super_owner') {
      return targetRole !== 'super_owner'; 
    }
    if (myRole === 'owner') {
      return ['user', 'admin'].includes(targetRole);
    }
    if (myRole === 'admin') {
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

  const handleSaveSettings = async (updates?: Record<string, any>) => {
    setSavingSettings(true);
    try {
      const newSettings = { ...settings, ...updates };
      const stringSettings: Record<string, string> = {};
      Object.entries(newSettings).forEach(([k, v]) => stringSettings[k] = String(v));
      
      if (updates) setSettings(stringSettings);

      const targetSettings = updates ? updates : settings;
      await Promise.all(Object.entries(targetSettings).map(([key, value]) => 
        adminApi.updateSetting(key, String(value))
      ));
      
      if (!updates) alert('Settings saved successfully');
    } catch (error) {
      console.error("Failed to save settings:", error);
      alert('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !isAdmin && profile) {
      const triggerBlock = async () => {
        try {
          const blockCode = Math.floor(Math.random() * 1e12).toString().padStart(12, '0');
          await supabase.from('profiles').update({ is_blocked: true, block_code: blockCode }).eq('id', profile.id);
          
          await securityService.handleSecurityViolation(
            profile.id, 
            profile.email, 
            'UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT', 
            'CRITICAL'
          );

          await emailService.sendBlockNotification(
            profile.email, 
            'Attempted unauthorized access to Admin Console. This is a restricted area.',
            blockCode
          );
          
          setTimeout(async () => {
            await supabase.auth.signOut();
            window.location.href = '/';
          }, 5000);
          
        } catch (e) {
          console.error("Failed to trigger security block:", e);
        }
      };
      triggerBlock();
    }
  }, [isAdmin, authLoading, profile]);

  if (authLoading) return <div className="min-h-screen bg-[#01040a] flex items-center justify-center text-white">Authenticating...</div>;
  
  if (!isAdmin) return (
    <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white p-6 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-rose-900/10 animate-pulse pointer-events-none" />
      <ShieldOff size={80} className="text-rose-500 mb-8 drop-shadow-[0_0_30px_rgba(225,29,72,0.5)]" />
      <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-tight">
        Restricted <span className="text-rose-500">Area</span>
      </h1>
      <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl max-w-xl mb-8 backdrop-blur-sm">
        <h3 className="text-rose-400 font-bold uppercase tracking-widest mb-2 flex items-center justify-center gap-2">
          <AlertTriangle size={18} /> Security Alert
        </h3>
        <p className="text-lg text-slate-300 leading-relaxed mb-4">
          This is the <strong>Admin Console</strong>. You do not have permission to be here.
        </p>
        <p className="text-sm text-rose-300 font-bold">
          Your account has been automatically blocked due to unauthorized access attempt.
        </p>
      </div>
      <p className="text-sm text-slate-500 max-w-xl mb-12">
        System has logged this incident. If this was a mistake, please contact admin@sleepsomno.com immediately.
      </p>
      <button onClick={onBack} className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full font-bold uppercase tracking-widest transition-all">
        Return to Safety
      </button>
    </div>
  );

  const fetchData = async () => {
    setIsSyncing(true);
    console.log('AdminDashboard: fetchData started');
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      console.log('AdminDashboard: getUser result:', { user, error });
      if (error) throw error;
      if (!user) {
        console.log('AdminDashboard: No user found');
        return;
      }

      const [uRes, fRes, aRes, sRes, setRes, rRes, eRes] = await Promise.allSettled([
        adminApi.getUsers(),
        adminApi.getFeedback(),
        adminApi.getAuditLogs(),
        adminApi.getSecurityEvents(),
        adminApi.getSettings(),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
        supabase.from('error_logs').select('*, profiles:user_id(email)').order('created_at', { ascending: false }).limit(100)
      ]);
      console.log('AdminDashboard: fetchData results:', { uRes, fRes, aRes, sRes, setRes, rRes, eRes });

      setUsers(uRes.status === 'fulfilled' ? (uRes as any).value.data || [] : []);
      setFeedback(fRes.status === 'fulfilled' ? (fRes as any).value.data || [] : []);
      setAuditLogs(aRes.status === 'fulfilled' ? (aRes as any).value.data || [] : []);
      setSecurityEvents(sRes.status === 'fulfilled' ? (sRes as any).value.data || [] : []);
      setReviews(rRes.status === 'fulfilled' ? (rRes as any).value.data || [] : []);
      setErrorLogs(eRes.status === 'fulfilled' ? (eRes as any).value.data || [] : []);
      
      if (setRes.status === 'fulfilled' && (setRes as any).value.data) {
        const settingsMap: Record<string, string> = {};
        const settingsData = (setRes as any).value.data;
        if (Array.isArray(settingsData)) {
          settingsData.forEach((s: any) => {
            if (s && s.key) settingsMap[s.key] = s.value;
          });
        }
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
      logError(profile?.id || 'ADMIN', error, 'AdminDashboard: fetchData');
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
            <h1 className="text-2xl font-black uppercase tracking-widest">{t.title}</h1>
            {isSuperOwner && <span className="text-[10px] font-bold bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded border border-amber-500/30 uppercase tracking-wider">{t.superOwner}</span>}
            {isOwner && !isSuperOwner && <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-500 px-2 py-0.5 rounded border border-indigo-500/30 uppercase tracking-wider">{t.owner}</span>}
            {!isOwner && !isSuperOwner && <span className="text-[10px] font-bold bg-slate-500/20 text-slate-500 px-2 py-0.5 rounded border border-slate-500/30 uppercase tracking-wider">{t.admin}</span>}
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
        {['overview', 'founder', 'logins', 'registry', 'signals', 'system', 'feedback', 'analytics', 'communications', 'reviews', 'errors']
          .filter(tab => {
            if (tab === 'analytics' || tab === 'system' || tab === 'communications' || tab === 'founder') return isOwner || isSuperOwner;
            if (tab === 'signals') return isAdmin || isOwner || isSuperOwner;
            return true;
          })
          .map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as AdminTab)}
            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors whitespace-nowrap ${
              activeTab === tab ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
            }`}
          >
            {tab === 'founder' ? 'Founder' : t.tabs[tab as keyof typeof t.tabs]}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {activeTab === 'founder' && <FounderDashboard />}
        {activeTab === 'logins' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Event</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User ID</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Details</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {[...auditLogs.filter(l => l.action === 'USER_LOGIN' || l.action === 'USER_LOGIN_OTP' || l.action === 'USER_SIGNUP' || l.action === 'FAILED_LOGIN_ATTEMPT' || l.action === 'BLOCKED_LOGIN_ATTEMPT'), ...securityEvents.filter(e => e.type === 'BLOCKED_CODE_SUBMISSION')]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .map((log: any) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className={log.action === 'USER_LOGIN' || log.action === 'USER_LOGIN_OTP' || log.action === 'USER_SIGNUP' ? 'text-emerald-500' : 'text-rose-500'} />
                          <span className={`text-xs font-bold uppercase tracking-wider ${log.action === 'USER_LOGIN' || log.action === 'USER_LOGIN_OTP' || log.action === 'USER_SIGNUP' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {log.action || log.type}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-white">{log.profiles?.email || 'System'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.user_id || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-xs text-slate-400 max-w-xs truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500 text-right">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {DATABASE_SCHEMA
                .filter(item => {
                  if (item.id === 'audit_logs' || item.id === 'security_events') return isOwner || isSuperOwner;
                  return true;
                })
                .map((item) => (
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Activity size={20} className="text-emerald-400" />
                  <h3 className="text-lg font-bold uppercase tracking-widest text-white">System Health</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold text-slate-300">API Status</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Operational</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-sm font-bold text-slate-300">Database Connection</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Connected</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      <span className="text-sm font-bold text-slate-300">AI Inference Engine</span>
                    </div>
                    <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Ready</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Clock size={20} className="text-amber-400" />
                  <h3 className="text-lg font-bold uppercase tracking-widest text-white">Recent Activity</h3>
                </div>
                <div className="space-y-4">
                  {[...auditLogs, ...securityEvents]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 3)
                    .map((item, i) => {
                      const isSecurity = 'type' in item;
                      const title = isSecurity ? (item as SecurityEvent).type : (item as AuditLog).action;
                      const details = typeof item.details === 'string' ? item.details : JSON.stringify(item.details);
                      
                      return (
                        <div key={i} className="flex items-start gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                          <div className={`mt-1 w-1.5 h-1.5 rounded-full ${isSecurity ? 'bg-rose-500' : 'bg-slate-500'}`} />
                          <div>
                            <p className="text-sm font-bold text-white mb-1">
                              {title || 'System Event'}
                            </p>
                            <p className="text-xs text-slate-400 mb-2 line-clamp-1">
                              {details}
                            </p>
                            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </GlassCard>
            </div>
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
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Role</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Subscription</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Country</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Provider</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Last Sign In</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.email?.includes(searchQuery) || u.id?.includes(searchQuery)).map((user) => (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 bg-indigo-600/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-xs">
                              {user.email?.[0].toUpperCase()}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-sm text-white">{user.full_name || user.email}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <select 
                          value={user.is_super_owner ? 'super_owner' : (user.role || 'user')}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={!canManage(user)}
                          className={`bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-indigo-500 transition-colors ${!canManage(user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          <option value="user">User</option>
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                          <option value="owner">Owner</option>
                          {isSuperOwner && <option value="super_owner">Super Owner</option>}
                        </select>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            {user.is_blocked ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-500/20 text-rose-500 border border-rose-500/30">Blocked</span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">Active</span>
                            )}
                          </div>
                          {user.block_code && <span className="text-[9px] text-rose-400 font-mono uppercase">{user.block_code}</span>}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          <select
                            value={user.subscription_plan || 'Free'}
                            onChange={async (e) => {
                              const newPlan = e.target.value;
                              await supabase.from('profiles').update({ 
                                subscription_plan: newPlan,
                                is_paying: newPlan !== 'Free'
                              }).eq('id', user.id);
                              fetchData();
                            }}
                            disabled={!canManage(user)}
                            className={`bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-wider outline-none focus:border-indigo-500 transition-colors ${!canManage(user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          >
                            <option value="Free">Free</option>
                            <option value="Pro">Pro</option>
                            <option value="Elite">Elite</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                          {user.subscription_status && (
                            <span className="text-[9px] text-slate-600 font-mono uppercase">{user.subscription_status}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-400">
                        {user.country || '-'}
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{user.provider || 'email'}</span>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500">
                        {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={async () => {
                            const newStatus = !user.is_blocked;
                            if (newStatus) {
                              await securityService.handleSecurityViolation(user.id, user.email, 'Admin Manual Block', 'HIGH');
                            } else {
                              await securityService.unblockUser(user.id, user.email, 'Admin Manual Unblock');
                            }
                            fetchData();
                          }}
                          disabled={!canManage(user)}
                          className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors ${user.is_blocked ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30' : 'bg-rose-500/20 text-rose-500 hover:bg-rose-500/30'} ${!canManage(user) ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user.is_blocked ? <Unlock size={14} /> : <Lock size={14} />}
                          <span className="ml-1">{user.is_blocked ? 'Unblock' : 'Block'}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Type</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Details</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">IP Address</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {securityEvents.map((event: any) => (
                    <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-rose-500" />
                          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">{event.type}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs font-bold text-white">{event.profiles?.email || 'System'}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{event.user_id || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-300">{event.details}</td>
                      <td className="p-4 text-xs font-mono text-slate-500">{event.ip_address}</td>
                      <td className="p-4 text-xs font-mono text-slate-500 text-right">{new Date(event.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-6">
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Action</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User ID</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Details</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <List size={14} className="text-slate-400" />
                          <span className="text-sm font-bold text-white">{log.action}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500">{log.user_id}</td>
                      <td className="p-4 text-xs text-slate-400 max-w-xs truncate">
                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500 text-right">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'feedback' && (
          <div className="space-y-8 px-2 max-w-6xl mx-auto">
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
            
            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Type</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Content</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {feedback.map((item) => (
                    <tr key={item.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase border italic ${
                           item.type === 'report' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 
                           item.type === 'suggestion' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 
                           'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                         }`}>
                           {item.type}
                         </span>
                      </td>
                      <td className="p-4 text-sm text-slate-300 italic max-w-md">"{item.content}"</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                           <User size={12} className="text-slate-500" />
                           <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-mono text-slate-500 text-right">
                        {new Date(item.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                      value={settings.ga_measurement_id || 'G-1WM4RE66ER'}
                      onChange={(e) => setSettings({...settings, ga_measurement_id: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-400">Google Search Console Verification</label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" 
                      placeholder="HTML Tag Content"
                      value={settings.google_site_verification || ''}
                      onChange={(e) => setSettings({...settings, google_site_verification: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 outline-none focus:border-indigo-500 transition-colors text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <button 
                    onClick={() => handleSaveSettings()}
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
            ) : marketingError ? (
              <div className="text-center py-12 text-rose-500 border-2 border-dashed border-rose-500/20 rounded-2xl bg-rose-500/5">
                <p className="font-bold mb-2">Error Loading Analytics</p>
                <p className="text-xs font-mono">{marketingError}</p>
                <button onClick={fetchMarketingData} className="mt-4 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 rounded-full text-xs font-bold uppercase tracking-widest">Retry</button>
              </div>
            ) : marketingData.length > 0 ? (
              <div className="space-y-6">
                <GlassCard className="p-6 rounded-[2rem] border-white/5 overflow-hidden">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-6">Traffic Trend (Last 14 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%" debounce={50}>
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
                        <Line type="monotone" dataKey="sessions" stroke="#f472b6" strokeWidth={2} dot={false} name="Sessions" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </GlassCard>
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500 border-2 border-dashed border-white/5 rounded-2xl">
                No marketing data available.
              </div>
            )}
          </div>
        )}

        {activeTab === 'communications' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <GlassCard className="p-8 border-l-4 border-l-rose-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-rose-500/20 text-rose-500 rounded-xl">
                    <Shield size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Security Alerts</h3>
                    <p className="text-xs text-rose-400 font-mono uppercase tracking-wider">Transactional System</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                      <Mail size={14} /> Security Team Email
                    </label>
                    <input 
                      type="email" 
                      value={settings.email_recipient_security || 'admin@sleepsomno.com'}
                      onChange={(e) => handleSaveSettings({ email_recipient_security: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none transition-colors font-mono"
                      placeholder="admin@sleepsomno.com"
                    />
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-8 border-l-4 border-l-indigo-500">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-500/20 text-indigo-500 rounded-xl">
                    <Bell size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Broadcast Center</h3>
                    <p className="text-xs text-indigo-400 font-mono uppercase tracking-wider">Audience System</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                      <User size={14} /> Sender Name
                    </label>
                    <input 
                      type="text" 
                      value={settings.email_sender_name || 'SomnoAI Digital Sleep Lab Team'}
                      onChange={(e) => handleSaveSettings({ email_sender_name: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors"
                      placeholder="SomnoAI Digital Sleep Lab Team"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-slate-500 flex items-center gap-2">
                      <Mail size={14} /> Support Email
                    </label>
                    <input 
                      type="email" 
                      value={settings.email_recipient_support || 'support@sleepsomno.com'}
                      onChange={(e) => handleSaveSettings({ email_recipient_support: e.target.value })}
                      className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-indigo-500 outline-none transition-colors font-mono"
                      placeholder="support@sleepsomno.com"
                    />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
               <div className="p-5 bg-amber-500/10 rounded-[2rem] text-amber-400 border border-amber-500/20 shadow-xl">
                 <Star size={32} />
               </div>
               <div>
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Product Reviews</h2>
                 <p className="text-[10px] text-slate-600 uppercase tracking-widest font-black italic mt-1.5">
                    User sentiment and ratings
                 </p>
               </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Rating</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">Comment</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500">User</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={12} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'} />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-slate-300 italic max-w-md">"{review.comment}"</td>
                      <td className="p-4 text-xs font-mono text-slate-500">{review.user_email || 'Anonymous'}</td>
                      <td className="p-4 text-xs font-mono text-slate-500 text-right">{new Date(review.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'errors' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <AlertTriangle className="text-rose-500" />
                System Error Logs
              </h2>
              <button onClick={fetchData} className="p-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] uppercase tracking-widest font-bold text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Context</th>
                    <th className="px-6 py-4">Message</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {errorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono">
                        {log.profiles?.email || log.user_id || 'SYSTEM'}
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-indigo-400">
                        {log.context}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-rose-300 mb-1">{log.error_message}</div>
                        {log.details && (
                          <div className="text-[10px] text-slate-500 font-mono truncate max-w-md">
                            {log.details}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {errorLogs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                        No errors logged yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
