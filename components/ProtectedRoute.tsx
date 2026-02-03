import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LockKeyhole, Home, ShieldAlert } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { logAuditLog } from '../services/supabaseService.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  level: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner, profile } = useAuth();
  const attackLogged = useRef(false);

  const hasAccess = 
    (level === 'admin' && isAdmin) || 
    (level === 'owner' && isOwner) || 
    (level === 'super' && isSuperOwner);

  useEffect(() => {
    if (!loading && !hasAccess && profile && !attackLogged.current) {
      attackLogged.current = true;
      logAuditLog('SECURITY_BREACH', 
        `INTRUSION ATTEMPT: Node ${profile.email} attempted accessing level ${level.toUpperCase()}. Path: ${window.location.pathname}`, 
        'CRITICAL'
      );
    }
  }, [loading, hasAccess, profile, level]);

  // 账号封禁强制物理隔离
  if (profile?.is_blocked) {
     return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="w-24 h-24 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-600 mb-8 border border-rose-600/30 shadow-[0_0_50px_rgba(225,29,72,0.2)]">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic mb-4">Neural Hub Locked</h2>
        <p className="text-slate-500 text-xs italic max-w-xs mb-10 text-center uppercase tracking-widest leading-loose">Your node status: [BLOCKED].<br/>Connection to restricted sectors is prohibited.</p>
        <button onClick={() => window.location.href = '/'} className="px-10 py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all">RE-SYNC HUB</button>
      </div>
     );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 space-y-12">
        <Logo size={120} animated={true} className="mx-auto" />
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse italic">Verifying Clearance...</p>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12 relative overflow-hidden">
        <div className="relative">
          <div className="absolute inset-0 bg-rose-500/10 blur-[100px] rounded-full animate-pulse" />
          <div className="w-40 h-40 bg-rose-600/10 border-2 border-rose-600/30 rounded-[3rem] flex items-center justify-center text-rose-600 shadow-[0_0_80px_rgba(225,29,72,0.15)] relative z-10">
            <LockKeyhole size={70} strokeWidth={1.5} />
          </div>
        </div>
        <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">Security<br/><span className="text-rose-600">Exception</span></h2>
        <button onClick={() => window.location.href = '/'} className="py-6 px-12 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all italic">
           <Home size={18} /> Restore Hub
        </button>
      </div>
    );
  }

  return <>{children}</>;
};