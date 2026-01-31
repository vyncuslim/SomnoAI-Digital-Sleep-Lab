
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldX, RefreshCw, AlertCircle, Home, Radio, LockKeyhole, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { safeNavigateHash, safeReload } from '../services/navigation.ts';
// Fix: Added missing import for authApi to enable session termination
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface ProtectedRouteProps {
  children: React.ReactNode;
  level: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner, profile } = useAuth();
  const [showFailsafe, setShowFailsafe] = useState(false);

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
          
          {showFailsafe && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-8 space-y-8 max-w-xs mx-auto">
              <div className="flex flex-col items-center gap-3 text-amber-500 bg-amber-500/5 p-6 rounded-[2rem] border border-amber-500/20">
                <AlertCircle size={24} />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Identity Handshake Latency Detected</p>
              </div>
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => safeReload()}
                  className="px-8 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                >
                  <RefreshCw size={14} /> Force Protocol Resync
                </button>
                <button 
                  onClick={() => safeNavigateHash('/')}
                  className="px-8 py-4 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest"
                >
                  Return to Base
                </button>
              </div>
            </m.div>
          )}
        </div>
      </div>
    );
  }

  const hasAccess = 
    (level === 'admin' && isAdmin) || 
    (level === 'owner' && isOwner) || 
    (level === 'super' && isSuperOwner);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.05)_0%,transparent_70%)]" />
           <div className="h-full w-full bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px]" />
        </div>

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
          <div className="flex items-center justify-center gap-4 mb-2">
             <div className="h-px w-8 bg-rose-500/20" />
             <ShieldAlert size={18} className="text-rose-500 animate-pulse" />
             <div className="h-px w-8 bg-rose-500/20" />
          </div>
          <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">Security<br/><span className="text-rose-600">Exception</span></h2>
          <div className="space-y-4 pt-4">
            <p className="text-slate-400 text-sm font-medium italic leading-relaxed">
              Subject node <span className="text-white font-bold">{profile?.email}</span> lacks the required clearance protocol for this sector.
            </p>
            <div className="px-6 py-2 bg-rose-500/5 border border-rose-500/20 rounded-full inline-block">
               <p className="text-[9px] font-mono text-rose-400 uppercase tracking-widest font-black">
                 Error Code: ERR_CLEARANCE_INSUFFICIENT_X01
               </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs pt-8 relative z-10">
          <button onClick={() => safeNavigateHash('dashboard')} className="py-6 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] active:scale-95 transition-all italic">
             <Home size={18} /> Restore Neural Bridge
          </button>
          <button onClick={() => authApi.signOut().then(() => safeReload())} className="py-5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:text-rose-400 hover:border-rose-500/20 transition-all italic">
            Terminate Session
          </button>
        </div>

        <footer className="absolute bottom-12 opacity-10">
           <p className="text-[8px] font-mono font-black uppercase tracking-[1em] text-slate-500 italic">Neural Laboratory Security Protocol v4.0</p>
        </footer>
      </div>
    );
  }

  return <>{children}</>;
};
