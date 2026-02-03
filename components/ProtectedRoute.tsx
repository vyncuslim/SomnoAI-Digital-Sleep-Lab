
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldX, RefreshCw, AlertCircle, Home, LockKeyhole, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { safeNavigateHash, safeReload } from '../services/navigation.ts';
import { authApi, logAuditLog } from '../services/supabaseService.ts';

const m = motion as any;

interface ProtectedRouteProps {
  children: React.ReactNode;
  level: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner, profile } = useAuth();
  const [showFailsafe, setShowFailsafe] = useState(false);
  const attackLogged = useRef(false);

  // 10s Failsafe Trigger
  useEffect(() => {
    let timer: any;
    if (loading) {
      timer = setTimeout(() => setShowFailsafe(true), 10000);
    } else {
      setShowFailsafe(false);
    }
    return () => clearTimeout(timer);
  }, [loading]);

  const hasAccess = 
    (level === 'admin' && isAdmin) || 
    (level === 'owner' && isOwner) || 
    (level === 'super' && isSuperOwner);

  // 拦截未授权访问并发送攻击告警
  useEffect(() => {
    if (!loading && !hasAccess && profile && !attackLogged.current) {
      attackLogged.current = true;
      logAuditLog('SECURITY_BREACH', 
        `INTRUSION ATTEMPT: Node ${profile.email} attempted accessing level ${level.toUpperCase()}.\nPath: ${window.location.hash}\nAgent: ${navigator.userAgent}`, 
        'CRITICAL'
      );
    }
  }, [loading, hasAccess, profile, level]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 space-y-12">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full animate-pulse" />
          <Logo size={120} animated={true} className="mx-auto" />
        </div>
        <div className="text-center space-y-6">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.8em] animate-pulse italic">
            Verifying Clearance Level...
          </p>
        </div>
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
          <div className="absolute -top-4 -right-4 bg-rose-600 text-white p-3 rounded-2xl flex items-center justify-center font-black text-xs shadow-2xl z-20 uppercase tracking-widest italic">
            Access Restricted
          </div>
        </div>
        <div className="space-y-6 relative z-10 max-w-md">
          <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">Security<br/><span className="text-rose-600">Exception</span></h2>
          <p className="text-slate-400 text-sm font-medium italic leading-relaxed">
            Unauthorized sector access. Incident logged and dispatched to laboratory command.
          </p>
        </div>
        <button onClick={() => safeNavigateHash('dashboard')} className="py-6 px-12 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-95 transition-all italic">
           <Home size={18} /> Restore Neural Bridge
        </button>
      </div>
    );
  }

  return <>{children}</>;
};
