
import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { LockKeyhole, Home } from 'lucide-react';
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

  // 如果账号已被封禁，立即在此层级进行物理切断
  if (profile?.is_blocked) {
     return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
        <div className="w-24 h-24 bg-rose-600/10 rounded-full flex items-center justify-center text-rose-600 mb-8">
          <LockKeyhole size={48} />
        </div>
        <h2 className="text-2xl font-black text-white uppercase italic mb-4">Neural Link Severed</h2>
        <p className="text-slate-500 text-xs italic max-w-xs mb-10 text-center">Your account status prevents access to restricted laboratory sectors. Contact the command bridge.</p>
        <button onClick={() => window.location.href = '/'} className="px-8 py-3 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest">RE-SYNC HUB</button>
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
