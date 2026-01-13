
import React, { useState } from 'react';
import { Loader2, ArrowRight, Cpu, TriangleAlert, Lock, ShieldCheck, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { healthConnect } from './services/healthConnectService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { supabase, signInWithGoogle } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate, isAdminFlow = false }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const t = translations[lang].auth;

  const handleHealthConnectLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await healthConnect.ensureClientInitialized();
      const token = await healthConnect.authorize(true); 
      if (token) onLogin();
    } catch (error: any) {
      setLocalError(error.message || "Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onLogin();
    } catch (error: any) {
      setLocalError(error.message || "Admin Session Initialization Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleAdminGoogleLogin = async () => {
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      setLocalError(error.message || "Google OAuth Failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-10 text-center relative z-10">
        <div className="relative flex flex-col items-center">
          <m.div 
            animate={{ rotate: isAdminFlow ? 180 : 0 }}
            className={`w-32 h-32 rounded-full border flex items-center justify-center mb-10 transition-colors duration-700 ${isAdminFlow ? 'bg-rose-600/10 border-rose-500/20' : 'bg-indigo-600/10 border-indigo-500/10'}`}
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
              SomnoAI <br/>
              <span className={isAdminFlow ? "text-rose-500" : "text-indigo-400"}>
                {isAdminFlow ? "Admin Engine" : "Digital Sleep Lab"}
              </span>
            </h1>
          </div>
        </div>

        <GlassCard className={`p-10 rounded-[4rem] space-y-8 relative border-white/10 transition-all duration-700 ${isAdminFlow ? 'shadow-[0_0_100px_rgba(244,63,94,0.1)]' : ''}`} intensity={1.1}>
          <AnimatePresence mode="wait">
            {!isAdminFlow ? (
              <m.div key="user" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.securityStatement}</span>
                  </div>
                   <p className="text-[11px] text-slate-400 italic px-4">
                    Neural Link established. Synchronize with Health Connect to begin biometric analysis.
                  </p>
                </div>

                <div className="space-y-4">
                  <button onClick={handleHealthConnectLogin} disabled={isLoggingIn} className="w-full py-6 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                    {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
                    {t.connect}
                  </button>
                  <button onClick={onGuest} className="w-full py-4 bg-white/5 rounded-full flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all">
                    {t.guest} <ArrowRight size={14} />
                  </button>
                </div>
              </m.div>
            ) : (
              <m.div key="admin" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <form onSubmit={handleAdminEmailLogin} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Admin Email"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm outline-none focus:border-rose-500/50 text-white italic"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                      <input 
                        type="password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Secret Key"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm outline-none focus:border-rose-500/50 text-white italic"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={isLoggingIn} className="w-full py-6 rounded-[2.5rem] bg-rose-600 text-white font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-950/20">
                    {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} className="inline mr-2" />}
                    INITIALIZE ACCESS
                  </button>
                </form>

                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative bg-[#050a1f] px-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">OR</span>
                </div>

                <button 
                  onClick={handleAdminGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full py-4 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  ADMIN GOOGLE AUTH
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-300 text-[11px] font-bold">
              <p className="flex justify-center gap-3 italic"><TriangleAlert size={16} className="shrink-0" /> {localError}</p>
            </m.div>
          )}
        </GlassCard>
      </m.div>

      {isAdminFlow && (
        <button 
          onClick={() => {
            window.history.pushState({}, '', '/');
            window.location.reload();
          }}
          className="fixed bottom-10 text-[10px] font-black uppercase text-slate-600 tracking-widest hover:text-slate-400 transition-colors"
        >
          Return to Patient Portal
        </button>
      )}
    </div>
  );
};
