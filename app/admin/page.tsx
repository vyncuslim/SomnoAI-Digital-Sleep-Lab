
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

        // [V14 KERNEL CHECK] 核心鉴权逻辑，走 RPC 避开 RLS 递归
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

  const promoteSql = email ? `-- 1. 强制部署 V14 RPC 核能函数\nCREATE OR REPLACE FUNCTION public.get_my_role() RETURNS text AS $$ BEGIN RETURN (SELECT role FROM public.profiles WHERE id = auth.uid()); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;\n\nCREATE OR REPLACE FUNCTION public.is_super_owner() RETURNS boolean AS $$ BEGIN RETURN EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_super_owner = true); END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;\n\nCREATE OR REPLACE FUNCTION public.can_manage_user(target_user_id uuid) RETURNS boolean AS $$ DECLARE c_role text; c_super boolean; t_role text; t_super boolean; c_w int; t_w int; BEGIN SELECT role, is_super_owner INTO c_role, c_super FROM public.profiles WHERE id = auth.uid(); SELECT role, is_super_owner INTO t_role, t_super FROM public.profiles WHERE id = target_user_id; IF auth.uid() = target_user_id THEN RETURN false; END IF; c_w := CASE WHEN c_super THEN 4 WHEN c_role = 'owner' THEN 3 WHEN c_role = 'admin' THEN 2 ELSE 1 END; t_w := CASE WHEN t_super THEN 4 WHEN t_role = 'owner' THEN 3 WHEN t_role = 'admin' THEN 2 ELSE 1 END; RETURN c_w > t_w; END; $$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;\n\n-- 2. 清理旧政策并应用同步\nDO $$ DECLARE pol RECORD; BEGIN FOR pol IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles') LOOP EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol.policyname); END LOOP; END $$;\nCREATE POLICY "v14_self_access" ON public.profiles FOR ALL USING (auth.uid() = id);\n\n-- 3. 提权并触发物理同步\nUPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '${email}';` : "";

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

  if (error === "INSUFFICIENT_CLEARANCE" || error === "DB_RECURSION_DETECTED") {
    const isRecursion = error === "DB_RECURSION_DETECTED";
    
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-8">
        {isRecursion ? <AlertTriangle size={80} className="text-amber-500 mb-2 animate-pulse" /> : <ShieldAlert size={80} className="text-rose-600 mb-2" />}
        
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">
            {isRecursion ? "Kernel Recursion Fault" : "Access Forbidden"}
          </h2>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed italic uppercase font-black tracking-widest">
            {isRecursion ? "The database is caught in an RLS cycle. Deploying V14 Kernal functions via SQL Editor will break the loop." : "Identifier recognized, but your current clearance level is locked."}
          </p>
        </div>

        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-2xl bg-slate-900/60 border ${isRecursion ? 'border-amber-500/20' : 'border-rose-500/20'} rounded-[3rem] p-8 md:p-12 space-y-6 shadow-2xl backdrop-blur-3xl`}
        >
           <div className={`flex items-center justify-between ${isRecursion ? 'text-amber-400' : 'text-rose-400'}`}>
             <div className="flex items-center gap-3">
                <Terminal size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest italic">V14_KERNEL_PATCH</span>
             </div>
             <Crown size={16} className="text-amber-500" />
           </div>
           
           <p className="text-[11px] text-slate-400 text-left italic leading-relaxed">
             Deploy this RPC kernel. It shifts permission logic to the database engine level, bypassing recursive RLS filters:
           </p>

           <div className="bg-black/60 p-6 rounded-2xl border border-white/5 relative group">
              <code className={`text-[9px] md:text-[10px] font-mono ${isRecursion ? 'text-amber-300' : 'text-rose-300'} break-all block pr-8 leading-relaxed text-left whitespace-pre-wrap max-h-[200px] overflow-y-auto no-scrollbar`}>
                {promoteSql}
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-6 p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-lg"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
           </div>

           <div className="flex items-center gap-4 p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <LogOut size={24} className="text-indigo-400 shrink-0" />
              <div className="text-left space-y-1">
                 <p className="text-[10px] text-indigo-300 font-black uppercase tracking-widest italic">
                   KERNEL INITIALIZATION REQUIRED
                 </p>
                 <p className="text-[10px] text-slate-400 leading-tight">
                   Applying SQL functions creates the stable bridge. <span className="text-white font-bold">Logout & Re-log</span> is mandatory for your local node to sync.
                 </p>
              </div>
           </div>
        </m.div>

        <div className="flex flex-col gap-4">
          <button onClick={handleLogoutAndRetry} className="px-12 py-6 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
             <RefreshCw size={14} /> FLUSH NODE & RE-CONNECT
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert size={64} className="text-rose-600 mb-4" />
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">System Desync</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto italic leading-relaxed">{error}</p>
        <button onClick={handleLogoutAndRetry} className="px-10 py-5 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">FORCE REBOOT</button>
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
