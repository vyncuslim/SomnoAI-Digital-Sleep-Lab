
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Terminal, Copy, CheckCircle } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';

/**
 * Enhanced Admin Dashboard with specific error handling for permissions.
 */
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

        // Verify admin status
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isMounted) return;

        if (!isAdmin) {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
        } else {
          setIsAuthorized(true);
        }
      } catch (e: any) {
        if (isMounted) setError(e.message || "Registry unreachable.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    protectAdmin();
    return () => { isMounted = false; };
  }, []);

  const promoteSql = email ? `UPDATE public.profiles SET role = 'admin' WHERE email = '${email}';` : "";

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
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed italic">
            Your account is authenticated, but your node has not been granted 'admin' level privileges in the registry.
          </p>
        </div>

        <div className="w-full max-w-md bg-slate-900/60 border border-rose-500/20 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex items-center gap-3 text-rose-400">
             <Terminal size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">Promotion Protocol</span>
           </div>
           <p className="text-[11px] text-slate-400 text-left italic">Run this command in your Supabase SQL Editor to elevate this account:</p>
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
        </div>

        <div className="flex gap-4">
          <button onClick={() => window.location.reload()} className="px-10 py-5 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-rose-600/20 active:scale-95 transition-all">RECHECK STATUS</button>
          <button onClick={() => window.location.hash = '#/'} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">EXIT TERMINAL</button>
        </div>
      </div>
    );
  }

  if (error || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6">
        <ShieldAlert size={64} className="text-rose-600 mb-4" />
        <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Access Terminal Issue</h2>
        <p className="text-slate-500 text-sm max-w-md mx-auto italic leading-relaxed">{error || "Failed to verify administrator status."}</p>
        <button onClick={() => window.location.hash = '#/'} className="px-10 py-5 bg-rose-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">RETURN TO BASE</button>
      </div>
    );
  }

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
