
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Key, Cpu, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEngineActive, setIsEngineActive] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      const manualKey = localStorage.getItem('somno_manual_gemini_key');
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineActive(hasKey || !!process.env.API_KEY || !!manualKey);
      } else {
        setIsEngineActive(!!process.env.API_KEY || !!manualKey);
      }
    };
    checkKey();
  }, []);

  const handleActivateEngine = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setIsEngineActive(true);
    }
  };

  const handleGoogleLogin = async () => {
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md space-y-12 text-center"
      >
        <div className="relative flex flex-col items-center">
          <m.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 12, repeat: Infinity }}
            className="w-32 h-32 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center shadow-[0_0_100px_rgba(79,70,229,0.1)] mb-10"
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-4">
            <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase leading-none">
              SomnoAI <br/>
              <span className="text-indigo-400">Digital Sleep Lab</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.6em] opacity-60">
              Neural Biometric Mapping
            </p>
          </div>
        </div>

        <GlassCard className="p-10 rounded-[5rem] space-y-10">
          <div className="space-y-6">
            <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3">
                <Key size={14} className="text-indigo-400" />
                AI Engine
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isEngineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEngineActive ? 'Ready' : 'Offline'}
              </span>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn} 
                className="w-full py-6 rounded-full flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-2xl active:scale-95"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
                Sync Biometrics
              </button>
              
              {!isEngineActive && (
                <button 
                  onClick={handleActivateEngine}
                  className="w-full py-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600 hover:text-white"
                >
                  Activate Neural Core
                </button>
              )}

              <button 
                onClick={onGuest} 
                className="w-full py-4 bg-white/5 border border-white/5 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                Virtual Guest <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {localError && (
            <m.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-rose-500/10 rounded-full border border-rose-500/20 text-rose-300 text-[10px] font-bold"
            >
              <p className="flex justify-center gap-2"><TriangleAlert size={14} className="shrink-0" /> {localError}</p>
            </m.div>
          )}
        </GlassCard>

        <footer className="mt-8 flex flex-col items-center gap-5 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-10">
            <a href="/privacy.html" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Privacy</a>
            <a href="/terms.html" target="_blank" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Terms</a>
          </div>
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-slate-700">© 2026 SOMNOAI LAB</p>
        </footer>
      </m.div>
    </div>
  );
};
