
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Terminal, Copy, CheckCircle, Crown, ChevronRight, AlertTriangle, LogOut } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { motion } from 'framer-motion';

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
      setLoading(true);
      setError(null);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) window.location.hash = '#/admin/login';
          return;
        }

        if (isMounted) setEmail(session.user.email || null);

        // 核心权限验证
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isMounted) return;

        if (!isAdmin) {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
      } catch (e: any) {
        if (isMounted) {
          // 捕获 500 递归错误或 403 拒绝
          if (e.message === "DB_CALIBRATION_REQUIRED") {
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

  // V11 强化版修复脚本：清理所有旧政策名称，重设触发器，并提升当前用户为 owner
  const promoteSql = email ? `-- 1. 清理所有旧版 RLS 政策 (预防递归残留)\nDROP POLICY IF EXISTS "allow_self_all_profiles" ON public.profiles;\nDROP POLICY IF EXISTS "admins_read_all_profiles" ON public.profiles;\nDROP POLICY IF EXISTS "allow_read_all" ON public.profiles;\nDROP POLICY IF EXISTS "profiles_admin_policy" ON public.profiles;\n\n-- 2. 部署权限同步引擎 (JWT 载荷化)\nCREATE OR REPLACE FUNCTION public.sync_user_privileges() RETURNS trigger AS $$\nBEGIN UPDATE auth.users SET raw_app_meta_data = raw_app_meta_data || jsonb_build_object('role', new.role, 'is_super_owner', new.is_super_owner, 'is_admin_node', (new.role IN ('admin', 'owner') OR new.is_super_owner = true)) WHERE id = new.id; RETURN new; END; $$ LANGUAGE plpgsql SECURITY DEFINER;\n\n-- 3. 部署零递归 RLS 政策\nCREATE POLICY "v11_admin_read_all" ON public.profiles FOR SELECT USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin_node')::boolean = true);\n\n-- 4. 提升当前用户权限并刷入标记 (角色设置为 owner 即可登录)\nUPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '${email}';` : "";

  const handleCopy = () => {
    if (!promoteSql) return;
    navigator.clipboard.writeText(promoteSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogoutAndRetry = async () => {
    await supabase.auth.signOut();
    window.location.hash = '#/admin/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-rose-500" size={48} />
        <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] animate-pulse italic">
          Verifying Command Clearance...
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
            {isRecursion ? "Neural Grid Recursion" : "Access Denied"}
          </h2>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed italic uppercase font-black tracking-widest">
            {isRecursion ? "A circular policy loop was detected. The system has automatically restricted access to prevent database overload." : "Standard node detected. Administrative terminal requires 'Owner' level clearance."}
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
                <span className="text-[10px] font-black uppercase tracking-widest italic">V11 SHIELD_SYNC Protocol</span>
             </div>
             <Crown size={16} className="text-amber-500" />
           </div>
           
           <p className="text-[11px] text-slate-400 text-left italic leading-relaxed">
             {isRecursion 
               ? "Recursion detected in RLS policies. Execute this V11 Emergency Patch in your Supabase SQL Editor to purge circular references and elevate your role:"
               : "Authorization failed. To initialize as the Lab Owner, execute this command in your Supabase SQL Editor:"}
           </p>

           <div className="bg-black/60 p-6 rounded-2xl border border-white/5 relative group">
              <code className={`text-[9px] md:text-[10px] font-mono ${isRecursion ? 'text-amber-300' : 'text-rose-300'} break-all block pr-8 leading-relaxed text-left whitespace-pre-wrap max-h-[250px] overflow-y-auto no-scrollbar`}>
                {promoteSql}
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-6 p-3 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all shadow-lg"
              >
                {copied ? <CheckCircle size={16} className="text-emerald-500" /> : <Copy size={16} />}
              </button>
           </div>

           <div className="flex items-center gap-3 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
              <AlertTriangle size={16} className="text-indigo-400 shrink-0" />
              <p className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest text-left italic">
                CRITICAL: YOU MUST RE-LOGIN AFTER APPLYING THIS PATCH TO UPDATE YOUR NEURAL TOKEN.
              </p>
           </div>
        </m.div>

        <div className="flex flex-col gap-4">
          <button onClick={handleLogoutAndRetry} className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3">
             <LogOut size={14} /> EXPEL & RE-IDENTIFY
          </button>
          <button onClick={() => { window.location.reload(); }} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">
            STAY & RECHECK
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert size={64} className="text-rose-600 mb-4" />
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">System Node Desync</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto italic leading-relaxed">{error}</p>
        <button onClick={() => window.location.reload()} className="px-10 py-5 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">RETRY HANDSHAKE</button>
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
          Expel Admin Session
        </button>
      </div>
    </div>
  );
}
