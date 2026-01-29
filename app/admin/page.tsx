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
  const [userProfile, setUserProfile] = useState<{ email: string | null; role: string | null } | null>(null);
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

        // Parallel fetch for status and profile
        const { data: status, error: statusError } = await supabase.rpc('get_profile_status');
        
        if (statusError) throw statusError;

        if (isMounted) {
          setUserProfile({
            email: session.user.email || null,
            role: status?.role || 'user'
          });
        }

        // Enhanced Role Check
        const adminRoles = ['admin', 'owner', 'super_owner'];
        const hasAccess = adminRoles.includes(status?.role || 'user');
        
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
          if (e.message?.includes('recursion') || e.message === "DB_CALIBRATION_REQUIRED") {
            setError("DB_RECURSION_DETECTED");
          } else if (e.message === "RPC_MISSING_DEPLOY_SQL" || e.code === 'PGRST202') {
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

  const promoteSql = userProfile?.email ? `-- Promote current node to Owner status\nUPDATE public.profiles SET role = 'owner' WHERE email = '${userProfile.email}';` : "";

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
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
          <Logo size={120} animated={true} />
        </div>
        <div className="space-y-3 text-center">
          <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.6em] animate-pulse italic">
            Synchronizing Command Kernel...
          </p>
          <div className="flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <m.div key={i} animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isRecursion = error === "DB_RECURSION_DETECTED";
    const isRpcMissing = error === "RPC_MISSING";
    const isClearanceIssue = error === "INSUFFICIENT_CLEARANCE";
    
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="relative">
          {isClearanceIssue ? <ShieldAlert size={100} className="text-rose-600 mb-2" /> : 
           isRecursion ? <AlertTriangle size={100} className="text-amber-500 mb-2 animate-pulse" /> : 
           <RefreshCw size={100} className="text-indigo-500 mb-2 animate-spin" />}
        </div>
        
        <div className="space-y-4 max-w-xl">
          <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-tight">
            {isRecursion ? "Kernel Recursion Fault" : 
             isRpcMissing ? "RPC Gateway Offline" : "Access Forbidden"}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed italic uppercase font-black tracking-[0.2em]">
            {isRecursion ? "The database is trapped in an infinite RLS evaluation loop. Deployment of V16 SQL Kernel required." : 
             isRpcMissing ? "Function 'get_profile_status' not identified. Deploy the required SQL kernel in your project dashboard." :
             `Your node clearance [${userProfile?.role?.toUpperCase() || 'USER'}] is insufficient for this terminal.`}
          </p>
        </div>

        {isClearanceIssue && (
          <m.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-slate-950 border border-rose-500/20 rounded-[3rem] p-10 space-y-8 shadow-[0_50px_100px_-20px_rgba(244,63,94,0.15)] backdrop-blur-3xl"
          >
             <div className="flex items-center justify-between text-rose-400">
               <div className="flex items-center gap-4">
                  <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                    <Terminal size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">ROOT_OVERRIDE_PATCH</span>
               </div>
               <Crown size={20} className="text-amber-500" />
             </div>
             
             <p className="text-xs text-slate-400 text-left italic leading-relaxed font-medium">
               To authorize this node for administrative command, execute the following SQL instruction in your laboratory database terminal:
             </p>

             <div className="bg-black border border-white/5 rounded-3xl p-8 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-[50px] -z-10" />
                <code className="text-[11px] font-mono text-rose-300 break-all block pr-12 leading-relaxed text-left whitespace-pre-wrap">
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
        )}

        <div className="flex flex-col gap-5">
          <button onClick={handleLogoutAndRetry} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 transition-all flex items-center justify-center gap-3">
             <RefreshCw size={16} /> FLUSH SESSION & RE-CONNECT
          </button>
          <button onClick={() => window.location.hash = '#/'} className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] hover:text-indigo-400 transition-all flex items-center justify-center gap-2">
            <ChevronRight size={12} className="rotate-180" /> RETURN TO SUBJECT INTERFACE
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-[#020617] p-4 md:p-12 animate-in fade-in duration-1000 relative">
      {/* Super Owner Glow */}
      {userProfile?.role === 'owner' && (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-500 rounded-full blur-[200px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500 rounded-full blur-[200px]" />
        </div>
      )}
      
      <AdminView onBack={() => window.location.hash = '#/'} />
      
      <div className="fixed top-8 right-8 z-[200]">
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.hash = '#/'; }}
          className="group flex items-center gap-3 px-8 py-4 bg-rose-500/10 hover:bg-rose-600 text-rose-500 hover:text-white rounded-full font-black text-[10px] uppercase tracking-widest border border-rose-500/20 transition-all active:scale-95 shadow-xl"
        >
          <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
          TERMINATE CONSOLE
        </button>
      </div>
    </div>
  );
}