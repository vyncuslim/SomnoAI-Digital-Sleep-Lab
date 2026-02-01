
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Users, Database, ShieldAlert, Search, RefreshCw, 
  Loader2, ChevronLeft, ShieldCheck, 
  Ban, Shield, Crown, ShieldX, KeyRound, 
  Zap, Globe, Monitor, Terminal as TerminalIcon, X, Cpu,
  MessageSquare, LayoutDashboard, Radio, Activity,
  ChevronRight, Send, Smartphone, BarChart3, Fingerprint,
  Lock, Table, List, Clock, TrendingUp,
  CheckCircle2, Unlock, WifiOff, Mail, ExternalLink, ActivitySquare, AlertCircle,
  HeartPulse, ShieldQuestion, UserPlus, Info as InfoIcon, Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { adminApi, supabase, logAuditLog } from '../services/supabaseService.ts';
import { systemMonitor, DiagnosticResult } from '../services/systemMonitor.ts';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const m = motion as any;

type AdminTab = 'overview' | 'explorer' | 'signals' | 'registry' | 'system';
type SyncState = 'IDLE' | 'SYNCING' | 'SYNCED' | 'ERROR' | 'DATA_RESIDENT' | 'STALE' | 'TIMEOUT' | 'FORBIDDEN';

const DATABASE_SCHEMA = [
  { id: 'analytics_daily', group: 'Traffic (GA4)', icon: Activity },
  { id: 'audit_logs', group: 'System Audit', icon: List },
  { id: 'security_events', group: 'Security', icon: ShieldAlert },
  { id: 'profiles', group: 'Core Registry', icon: Users },
  { id: 'user_data', group: 'Core Registry', icon: Fingerprint },
  { id: 'feedback', group: 'Lab Data', icon: Send },
];

export const AdminView: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<any | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('IDLE');
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseResult, setPulseResult] = useState<DiagnosticResult | null>(null);
  
  const [users, setUsers] = useState<any[]>([]);
  const [dailyStats, setDailyStats] = useState<any[]>([]);
  const [signals, setSignals] = useState<any[]>([]);
  const [tableCounts, setTableCounts] = useState<Record<string, number>>({});
  const [actionError, setActionError] = useState<string | null>(null);
  const [permissionFixEmail, setPermissionFixEmail] = useState<string | null>(null);

  // Table Explorer Specific
  const [activeTable, setActiveTable] = useState('analytics_daily');
  const [tableData, setTableData] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  const checkSyncStatus = async () => {
    try {
      const { data: logs } = await supabase
        .from('audit_logs')
        .select('action, created_at')
        .in('action', ['GA4_SYNC_SUCCESS', 'GA4_SYNC_ERROR'])
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (logs?.[0]) {
        const syncDate = new Date(logs[0].created_at);
        setLastSyncTime(syncDate.toLocaleString());
        const isStale = (new Date().getTime() - syncDate.getTime()) > 1000 * 60 * 60 * 24; 
        setSyncState(logs[0].action === 'GA4_SYNC_SUCCESS' ? (isStale ? 'STALE' : 'SYNCED') : 'ERROR');
      } else {
        const count = await adminApi.getTableCount('analytics_daily');
        setSyncState(count > 0 ? 'DATA_RESIDENT' : 'IDLE');
      }
    } catch (e) { setSyncState('IDLE'); }
  };

  const executePulse = async () => {
    setIsPulsing(true);
    const res = await systemMonitor.executeGlobalPulseCheck();
    setPulseResult(res);
    setIsPulsing(false);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user) return;

      const profile = await adminApi.getAdminClearance(user.id);
      setCurrentAdmin(profile);

      // 并行请求，允许部分失败而不阻塞全局加载
      const [dRes, sRes, uRes] = await Promise.allSettled([
        adminApi.getDailyAnalytics(30),
        adminApi.getSecurityEvents(40),
        adminApi.getUsers()
      ]);

      setDailyStats(dRes.status === 'fulfilled' ? dRes.value : []);
      setSignals(sRes.status === 'fulfilled' ? sRes.value : []);
      setUsers(uRes.status === 'fulfilled' ? uRes.value : []);
      
      const counts: Record<string, number> = {};
      await Promise.all(DATABASE_SCHEMA.map(async (t) => {
        try { counts[t.id] = await adminApi.getTableCount(t.id); } catch(e) { counts[t.id] = 0; }
      }));
      setTableCounts(counts);
      await checkSyncStatus();
      executePulse();
    } catch (err: any) {
      setActionError(err.message || "Mesh synchronization failure.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Handle Table Explorer Refresh
  useEffect(() => {
    if (activeTab === 'explorer') {
      const loadTable = async () => {
        setTableLoading(true);
        try {
          const data = await adminApi.getTableData(activeTable, 100);
          setTableData(data);
        } catch (e) {} finally {
          setTableLoading(false);
        }
      };
      loadTable();
    }
  }, [activeTab, activeTable]);

  const handleManualSync = async () => {
    setSyncState('SYNCING');
    setActionError(null);
    setPermissionFixEmail(null);
    try {
      const secret = "9f3ks8dk29dk3k2kd93kdkf83kd9dk2"; 
      const response = await fetch('/api/sync-analytics', {
        headers: { 'Authorization': `Bearer ${secret}` }
      });
      const resData = await response.json();
      if (response.ok) {
        await logAuditLog('ADMIN_MANUAL_SYNC', `GA4 synchronization protocol executed successfully.`);
        fetchData();
      } else {
        if (resData.error === 'PERMISSION_DENIED') {
          setSyncState('FORBIDDEN');
          setPermissionFixEmail(resData.required_email);
          throw new Error("7 PERMISSION_DENIED: GA4 Access restricted.");
        }
        throw new Error(resData.error || "GATEWAY_REJECTION: Check Vercel logs.");
      }
    } catch (e: any) {
      setActionError(e.message);
      if (syncState !== 'FORBIDDEN') setSyncState('ERROR');
    }
  };

  const handleToggleBlock = async (user: any) => {
    try {
      const { error } = await adminApi.toggleBlock(user.id, user.email, user.is_blocked);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRoleChange = async (user: any, newRole: string) => {
    if (user.is_super_owner) {
      setActionError("SECURITY_VIOLATION: Cannot modify super owner clearance.");
      return;
    }
    try {
      const { error } = await adminApi.updateUserRole(user.id, user.email, newRole);
      if (error) throw error;
      fetchData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const copyEmail = () => {
    if (permissionFixEmail) {
      navigator.clipboard.writeText(permissionFixEmail);
      setActionError("Service email copied to clipboard.");
      setTimeout(() => setActionError(null), 2000);
    }
  };

  const isOwner = currentAdmin?.role === 'owner' || currentAdmin?.is_super_owner;
  const themeColor = isOwner ? '#f59e0b' : '#6366f1';

  // 渲染逻辑分发器
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <m.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} className="space-y-16">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
               <GlassCard className="lg:col-span-1 p-8 rounded-[3.5rem] border-white/5 relative overflow-hidden group">
                  {isPulsing && (
                    <m.div animate={{ opacity: [0.1, 0.3, 0.1], scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-indigo-500/10 rounded-full blur-[80px]" />
                  )}
                  <div className="flex items-center justify-between mb-8 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${pulseResult?.isSuccess ? 'bg-emerald-500/10 text-emerald-400