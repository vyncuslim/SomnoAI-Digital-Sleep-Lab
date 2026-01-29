
import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { Loader2, ShieldX, RefreshCw, Terminal, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface ProtectedRouteProps {
  children: React.ReactNode;
  level: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner, profile } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
          <Logo size={120} animated={true} />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.8em] animate-pulse italic">
          Verifying Neural Clearance...
        </p>
      </div>
    );
  }

  const hasAccess = 
    (level === 'admin' && isAdmin) || 
    (level === 'owner' && isOwner) || 
    (level === 'super' && isSuperOwner);

  if (!hasAccess) {
    const promoteSql = profile?.id ? `-- ESCALATE TO ROOT STATUS\nUPDATE public.profiles SET role = 'owner', is_super_owner = true WHERE id = '${profile.id}';` : "";
    
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="relative">
          <m.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-rose-600/30 blur-[120px] rounded-full" 
          />
          <div className="w-40 h-40 bg-rose-600/10 border-2 border-rose-600/30 rounded-full flex items-center justify-center text-rose-600 relative z-10 shadow-[0_0_50px_rgba(225,29,72,0.2)]">
            <ShieldX size={80} strokeWidth={1.5} />
          </div>
          <m.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }}
            className="absolute -top-6 -right-6 bg-amber-500 text-black w-16 h-16 rounded-2xl flex items-center justify-center font-black text-4xl shadow-2xl z-20"
          >
            ⚠️
          </m.div>
        </div>
        
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
            Access <span className="text-rose-600">Forbidden</span>
          </h2>
          <p className="text-slate-500 text-[12px] leading-relaxed italic uppercase font-black tracking-[0.4em]">
            Insufficient credentials for node override
          </p>
        </div>

        {promoteSql && (
           <div className="w-full max-w-2xl bg-slate-950 border border-white/5 rounded-[4rem] p-12 space-y-8">
             <div className="flex items-center gap-4 text-rose-400">
                <Terminal size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">ROOT_ESCALATION_PROTOCOL</span>
             </div>
             <div className="bg-black border border-white/10 rounded-[2.5rem] p-8">
                <code className="text-[11px] font-mono text-indigo-400 break-all block text-left whitespace-pre-wrap">
                  {promoteSql}
                </code>
             </div>
           </div>
        )}

        <div className="flex flex-col gap-6 w-full max-w-md">
          <button onClick={() => window.location.reload()} className="py-7 bg-white text-slate-950 rounded-full font-black text-[12px] uppercase tracking-[0.5em] flex items-center justify-center gap-4">
             <RefreshCw size={18} /> RETRY HANDSHAKE
          </button>
          <button onClick={() => window.location.hash = '#/'} className="py-6 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3">
            <ChevronRight size={18} className="rotate-180" /> RETURN TO INTERFACE
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
