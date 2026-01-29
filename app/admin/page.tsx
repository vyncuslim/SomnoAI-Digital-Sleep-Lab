
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Terminal, Copy, CheckCircle, Crown, ChevronRight, AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { motion } from 'framer-motion';
import { Logo } from '../../components/Logo.tsx';

const m = motion as any;

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
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

        if (isMounted) setEmail(session.user.email || null);

        // 核心鉴权逻辑：检查角色是否为 admin, owner 或 super_owner
        const isAdmin = await adminApi.checkAdminStatus();
        
        if (!isMounted) return;

        if (!isAdmin) {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
      } catch (e: any) {
        if (isMounted) {
          if (e.message?.includes('recursion') || e.message === "DB_CALIBRATION_REQUIRED") {
            setError("DB_RECURSION_DETECTED");
          } else if (e.message === "RPC_MISSING_DEPLOY_SQL") {
            setError("RPC_MISSING");
          } else {
            setError(e.message || "Neural Handshake Failure.");
          }
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    protectAdmin();
    return () => { isMounted = false; };
  }, []);

  const promoteSql = email ? `-- 提权脚本：将当前账号设为最高所有者\nUPDATE public.profiles SET role = 'owner' WHERE email = '${email}';` : "";

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
        <Logo size={100} animated={true} />
        <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em] animate-pulse italic">
          Syncing Kernel Node...
        </p>
      </div>
    );
  }

  // 错误处理 UI
  if (error) {
    const isRecursion = error === "DB_RECURSION_DETECTED";
    const isRpcMissing = error === "RPC_MISSING";
    const isClearanceIssue = error === "INSUFFICIENT_CLEARANCE";
    
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-8">
        {isRecursion ? <AlertTriangle size={80} className="text-amber-500 mb-2 animate-pulse" /> : 
         isRpcMissing ? <RefreshCw size={80} className="text-indigo-500 mb-2 animate-spin" /> :
         <ShieldAlert size={80} className="text-rose-600 mb-2" />}
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">
            {isRecursion ? "Kernel Recursion Fault" : 
             isRpcMissing ? "RPC Kernel Missing" : "Access Forbidden"}
          </h2>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed italic uppercase font-black tracking-widest">
            {isRecursion ? "The database is caught in an RLS cycle. Deploy V16.1 SQL Kernel." : 
             isRpcMissing ? "The function 'get_profile_status' was not found. Please deploy SQL script." :
             "Your account clearance level is insufficient for this terminal."}
          </p>
        </div>

        {isClearanceIssue && (
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-slate-900/60 border border-rose-500/20 rounded-[3rem] p-8 md:p-12 space-y-6 shadow-2xl backdrop-blur-3xl"
          >
             <div className="flex items-center justify-between text-rose-400">
               <div className="flex items-center gap-3">
                  <Terminal size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">SQL_ADMIN_PATCH</span>
               </div>
               <Crown size={16} className="text-amber-500" />
             </div>
             
             <p className="text-[11px] text-slate-400 text-left italic leading-relaxed">
               If you are the laboratory architect, run this SQL command in Supabase Editor to promote your node:
             </p>

             <div className="bg-black/60 p-6 rounded-2xl border border-white/5 relative group">
                <code className="text-[10px] font-mono text-rose-300 break-all block pr-8 leading-relaxed text-left whitespace-pre-wrap">
                  {promoteSql}
                </code>
                <button 
                  onClick={handleCopy}
                  className="absolute right-4 top-6 p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-lg"
                >
                  {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
             </div>
          </m.div>
        )}

        <div className="flex flex-col gap-4">
          <button onClick={handleLogoutAndRetry} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
             <RefreshCw size={14} /> FLUSH NODE & RE-CONNECT
          </button>
          <button onClick={() => window.location.hash = '#/'} className="text-[10px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all">Back to Subject Terminal</button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 animate-in fade-in duration-1000 relative">
      <AdminView onBack={() => window.location.hash = '#/'} />
      
      <div className="fixed top-8 right-8 z-[100]">
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.hash = '#/'; }}
          className="px-6 py-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full font-black text-[9px] uppercase tracking-widest border border-rose-500/20 transition-all active:scale-95"
        >
          Terminate Console
        </button>
      </div>
    </div>
  );
}
