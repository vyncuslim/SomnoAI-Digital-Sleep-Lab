
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';
import { Logo } from './Logo.tsx';

interface AuthProps {
  onLogin: () => void;
  onGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      setLocalError(error.message || "Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <motion.div animate={{ scale: [1, 1.05, 1] }} className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)]">
          <Logo size={120} animated />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white italic">Somno <span className="text-indigo-400">Lab</span></h1>
          <p className="text-slate-400 font-medium uppercase text-sm tracking-widest">Digital Sleep & Physiological Projections</p>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-10 border-white/10 bg-slate-900/40 space-y-8 relative z-10">
        <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 text-left space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-indigo-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Security Statement</p>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">Data synced locally. Zero backend storage. Sensitive metrics cleared upon session termination.</p>
        </div>

        {localError && (
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold">
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </div>
        )}

        <div className="space-y-4">
          <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all">
            {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-indigo-600 text-indigo-600" />}
            Connect Google Fit
          </button>
          <button onClick={onGuest} className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] transition-all">
            Browse Guest Lab <ArrowRight size={12} />
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
