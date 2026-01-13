
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Cpu, TriangleAlert, Database, Lock, ShieldCheck, Mail, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { healthConnect } from './services/healthConnectService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { supabase } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'user' | 'admin'>('user');
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onLogin();
    } catch (error: any) {
      setLocalError(error.message || "Admin Login Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg space-y-10 text-center relative z-10">
        <div className="relative flex flex-col items-center">
          <m.div className="w-32 h-32 rounded-full bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center mb-10">
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
              SomnoAI <br/><span className="text-indigo-400">Digital Sleep Lab</span>
            </h1>
          </div>
        </div>

        <div className="flex justify-center gap-4 mb-8">
           <button 
             onClick={() => setAuthMode('user')}
             className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${authMode === 'user' ? 'bg-indigo-600 text-white' : 'bg-white/5 text-slate-500'}`}
           >
             Patient Portal
           </button>
           <button 
             onClick={() => setAuthMode('admin')}
             className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${authMode === 'admin' ? 'bg-rose-600 text-white' : 'bg-white/5 text-slate-500'}`}
           >
             Admin Engine
           </button>
        </div>

        <GlassCard className="p-10 rounded-[4rem] space-y-8 relative border-white/10" intensity={1.1}>
          <AnimatePresence mode="wait">
            {authMode === 'user' ? (
              <m.div key="user" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-indigo-400">
                    <ShieldCheck size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.securityStatement}</span>
                  </div>
                   <p className="text-[11px] text-slate-400 italic px-4">
                    Connecting to Health Connect for biometric extraction. No login required.
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
              <m.form key="admin" onSubmit={handleAdminLogin} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Admin Email"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm outline-none focus:border-rose-500/50"
                      required
                    />
                  </div>
                  <div className="relative">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Encryption Key"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm outline-none focus:border-rose-500/50"
                      required
                    />
                  </div>
                </div>
                <button type="submit" disabled={isLoggingIn} className="w-full py-6 rounded-[2.5rem] bg-rose-600 text-white font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-rose-950/20">
                  {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Lock size={20} className="inline mr-2" />}
                  INITIALIZE ADMIN SESSION
                </button>
              </m.form>
            )}
          </AnimatePresence>

          {localError && (
            <m.div className="mt-4 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-300 text-[11px] font-bold">
              <p className="flex justify-center gap-3 italic"><TriangleAlert size={16} className="shrink-0" /> {localError}</p>
            </m.div>
          )}
        </GlassCard>
      </m.div>
    </div>
  );
};
