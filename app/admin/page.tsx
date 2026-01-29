
import React, { useEffect, useState } from 'react';
import { 
  Loader2, ShieldAlert, Terminal, Copy, CheckCircle, 
  Crown, ChevronRight, AlertTriangle, LogOut, RefreshCw,
  Lock, ShieldX
} from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { motion } from 'framer-motion';
import { Logo } from '../../components/Logo.tsx';

const m = motion as any;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{ email: string | null; role: string | null; is_super: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const protectAdmin = async () => {
      if (!isMounted) return;
      setLoading(true);
      setError(null);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) window.location.hash = '#/admin/login';
          return;
        }

        // 调用更新后的 V19 RPC
        const { data: statusArray, error: statusError } = await supabase.rpc('get_profile_status');
        const status = statusArray && statusArray[0];
        
        if (statusError) throw statusError;

        if (isMounted) {
          setUserProfile({
            email: session.user.email || null,
            role: status?.role || 'user',
            is_super: !!status?.is_super_owner
          });
        }

        // 核心权限判断：只要是 admin/owner 或是 super_owner 均可进入
        const adminRoles = ['admin', 'owner'];
        const hasAccess = adminRoles.includes(status?.role || 'user') || status?.is_super_owner === true;
        
        if (!isMounted) return;

        if (!hasAccess) {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
      } catch (e: any) {
        console.error("Auth Exception:", e);
        if (isMounted) {
          setError(e.message || "Neural Handshake Failure.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    protectAdmin();
    return () => { isMounted = false; };
  }, []);

  const promoteSql = userProfile?.email ? `-- Promote current node to Super Owner status\nUPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '${userProfile.email}';` : "";

  const handleCopy = () => {
    if (!promoteSql) return;
    navigator.clipboard.writeText(promoteSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutAndRetry = async () => {
    await supabase.auth.signOut();
    localStorage.clear(); 
    window.location.hash = '#/admin/login';
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <Logo size={120} animated={true} />
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] animate-pulse italic">
          Verifying Clearance...
        </p>
      </div>
    );
  }

  if (error === "INSUFFICIENT_CLEARANCE") {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12">
        {/* ⚠️ 核心警告图标 */}
        <div className="relative">
          <div className="absolute inset-0 bg-rose-600/20 blur-[100px] rounded-full animate-pulse" />
          <div className="w-32 h-32 bg-rose-600/10 border-2 border-rose-600/50 rounded-full flex items-center justify-center text-rose-600 relative z-10">
            <ShieldX size={64} />
          </div>
          <div className="absolute -top-4 -right-4 bg-amber-500 text-black p-2 rounded-xl font-black text-2xl shadow-2xl">⚠️</div>
        </div>
        
        <div className="space-y-4 max-w-xl">
          <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-tight">
            Access <span className="text-rose-600">Forbidden</span>
          </h2>
          <p className="text-slate-500 text-[11px] leading-relaxed italic uppercase font-black tracking-[0.3em]">
            Your node clearance <span className="text-rose-500">[{userProfile?.role?.toUpperCase() || 'USER'}]</span> is insufficient for this terminal.
          </p>
        </div>

        {/* SQL 自动修复面板 */}
        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-slate-950 border border-white/5 rounded-[3rem] p-10 space-y-8 shadow-2xl backdrop-blur-3xl"
        >
             <div className="flex items-center justify-between text-rose-400">
               <div className="flex items-center gap-4">
                  <Terminal size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">ROOT_OVERRIDE_REQUIRED</span>
               </div>
               <Crown size={20} className="text-amber-500" />
             </div>
             
             <p className="text-[11px] text-slate-400 text-left italic leading-relaxed font-medium">
               This node is currently logged as a standard subject. To escalate to Owner status, execute this in your database console:
             </p>

             <div className="bg-black border border-white/10 rounded-3xl p-8 relative group overflow-hidden">
                <code className="text-[11px] font-mono text-indigo-400 break-all block pr-12 leading-relaxed text-left whitespace-pre-wrap">
                  {promoteSql}
                </code>
                <button 
                  onClick={handleCopy}
                  className="absolute right-6 top-8 p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-xl border border-white/5 active:scale-90"
                >
                  {copied ? <CheckCircle size={18} className="text-emerald-500" /> : <Copy size={18} />}
                </button>
             </div>
        </m.div>

        <div className="flex flex-col gap-5 w-full max-w-md">
          <button onClick={handleLogoutAndRetry} className="py-6 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
             <RefreshCw size={16} /> FLUSH SESSION & RE-CONNECT
          </button>
          <button onClick={() => window.location.hash = '#/'} className="py-6 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-2">
            <ChevronRight size={16} className="rotate-180" /> RETURN TO SUBJECT INTERFACE
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <AlertTriangle size={80} className="text-amber-500" />
        <h2 className="text-3xl font-black italic text-white uppercase">{error}</h2>
        <button onClick={() => window.location.reload()} className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest">RETRY HANDSHAKE</button>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-12 animate-in fade-in duration-1000">
      <AdminView onBack={() => window.location.hash = '#/'} />
    </div>
  );
}
