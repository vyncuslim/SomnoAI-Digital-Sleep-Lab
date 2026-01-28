
import React, { useEffect, useState } from 'react';
import { Loader2, ShieldAlert, Terminal, Copy, CheckCircle, Crown } from 'lucide-react';
import { supabase, adminApi } from '../../services/supabaseService.ts';
import { AdminView } from '../../components/AdminView.tsx';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState<string | null>(null);
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

        // [核心修复]：直接查库，确保身份准确
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
        const currentRole = profile?.role || session.user.app_metadata?.role;
        
        if (!isMounted) return;
        setRole(currentRole);

        if (currentRole === 'admin' || currentRole === 'owner') {
          setIsAuthorized(true);
        } else {
          setError("INSUFFICIENT_CLEARANCE");
          setIsAuthorized(false);
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

  const promoteSql = email ? `UPDATE public.profiles SET role = 'owner' WHERE email = '${email}';` : "";

  const handleCopy = () => {
    if (!promoteSql) return;
    navigator.clipboard.writeText(promoteSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <Loader2 className="animate-spin text-amber-500" size={48} />
        <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.4em] animate-pulse italic">
          Synchronizing Master Registry...
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
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed italic uppercase tracking-widest font-bold">
            Identification failed: Standard node detected.
          </p>
        </div>

        <div className="w-full max-w-md bg-slate-900/60 border border-amber-500/20 rounded-[2.5rem] p-8 space-y-6">
           <div className="flex items-center gap-3 text-amber-500">
             <Crown size={20} />
             <span className="text-[10px] font-black uppercase tracking-widest">Sovereignty Protocol</span>
           </div>
           <p className="text-[11px] text-slate-400 text-left italic leading-relaxed">If you are the laboratory owner, execute this command in your Supabase SQL Editor to bypass restrictions:</p>
           <div className="bg-black/40 p-5 rounded-2xl border border-white/5 relative group">
              <code className="text-[10px] font-mono text-amber-300 break-all block pr-8 leading-relaxed">
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
          <button onClick={() => window.location.reload()} className="px-10 py-5 bg-amber-500 text-black font-black text-[10px] uppercase tracking-[0.4em] shadow-xl shadow-amber-500/20 active:scale-95 transition-all">RECHECK STATUS</button>
          <button onClick={() => window.location.hash = '#/'} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">EXIT TERMINAL</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-6 md:p-12 animate-in fade-in duration-1000 relative">
      <AdminView onBack={() => window.location.hash = '#/'} />
      
      <div className="fixed top-8 right-8 z-[100]">
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.hash = '#/'; }}
          className={`px-6 py-3 bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-500 rounded-full font-black text-[9px] uppercase tracking-widest border border-white/5 transition-all active:scale-95`}
        >
          Expel Session
        </button>
      </div>
    </div>
  );
}
