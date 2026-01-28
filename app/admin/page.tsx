
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Terminal, Copy, CheckCircle, Crown, ChevronRight } from 'lucide-react';
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

        // 核心权限验证：包含 Super Owner 检查
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isMounted) return;

        if (!isAdmin) {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
          return;
        }

        setIsAuthorized(true);
      } catch (e: any) {
        if (isMounted) setError(e.message || "Registry unreachable.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    protectAdmin();
    return () => { isMounted = false; };
  }, []);

  // 提供的提升脚本同时涵盖 role 和超级标志位
  const promoteSql = email ? `UPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE email = '${email}';` : "";

  const handleCopy = () => {
    if (!promoteSql) return;
    navigator.clipboard.writeText(promoteSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  if (error === "INSUFFICIENT_CLEARANCE") {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-8">
        <ShieldAlert size={80} className="text-rose-600 mb-2" />
        <div className="space-y-4">
          <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">Access Denied</h2>
          <p className="text-slate-500 text-[11px] max-w-sm mx-auto leading-relaxed italic uppercase font-black tracking-widest">
            Identification failed: Standard node detected.
          </p>
        </div>

        <m.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-slate-900/60 border border-rose-500/20 rounded-[2.5rem] p-8 space-y-6"
        >
           <div className="flex items-center justify-between text-rose-400">
             <div className="flex items-center gap-3">
                <Terminal size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sovereignty Protocol</span>
             </div>
             <Crown size={16} className="text-amber-500" />
           </div>
           
           <p className="text-[11px] text-slate-400 text-left italic">
             If you are the laboratory owner, execute this command in your Supabase SQL Editor to bypass restrictions:
           </p>

           <div className="bg-black/40 p-5 rounded-2xl border border-white/5 relative group">
              <code className="text-[10px] font-mono text-rose-300 break-all block pr-8 leading-relaxed">
                {promoteSql}
              </code>
              <button 
                onClick={handleCopy}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/5 rounded-lg text-slate-500 hover:text-white transition-all"
              >
                {copied ? <CheckCircle size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
           </div>
        </m.div>

        <div className="flex flex-col gap-4">
          <button onClick={() => window.location.reload()} className="px-12 py-5 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all">RECHECK STATUS</button>
          <button onClick={() => window.location.hash = '#/'} className="px-12 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-2">
            EXIT TERMINAL <ChevronRight size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert size={64} className="text-rose-600 mb-4" />
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Security Block Active</h2>
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
