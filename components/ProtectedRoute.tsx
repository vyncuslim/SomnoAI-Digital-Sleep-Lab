import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldX, RefreshCw, AlertCircle, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface ProtectedRouteProps {
  children: React.ReactNode;
  level: 'admin' | 'owner' | 'super';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, level }) => {
  const { loading, isAdmin, isOwner, isSuperOwner } = useAuth();
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
                  onClick={() => window.location.reload()}
                  className="px-8 py-5 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                >
                  <RefreshCw size={14} /> Force Protocol Resync
                </button>
                <button 
                  onClick={() => window.location.hash = '#/'}
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
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-12">
        <div className="relative">
          <div className="w-40 h-40 bg-rose-600/10 border-2 border-rose-600/30 rounded-full flex items-center justify-center text-rose-600 shadow-[0_0_50px_rgba(225,29,72,0.2)]">
            <ShieldX size={80} strokeWidth={1.5} />
          </div>
          <div className="absolute -top-4 -right-4 bg-amber-500 text-black w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl">
            ⚠️
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter leading-none">Access<br/>Denied</h2>
          <p className="text-slate-500 text-[11px] uppercase tracking-[0.4em] font-black italic">Insufficient Clearance</p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-xs pt-8">
          <button onClick={() => window.location.reload()} className="py-5 bg-white text-slate-950 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl">
             <RefreshCw size={16} /> Retry Handshake
          </button>
          <button onClick={() => window.location.hash = '#/'} className="py-5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
            <Home size={16} /> Return to Base
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};