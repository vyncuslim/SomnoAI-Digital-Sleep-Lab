
import React, { useState } from 'react';
import { 
  Loader2, Mail, ShieldAlert, 
  Lock, Fingerprint, Zap, Info, Moon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest?: () => void; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin }) => {
  const t = translations[lang].auth;
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (authMode === 'password') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      } else {
        const { error: otpErr } = await authApi.sendOTP(email);
        if (otpErr) throw otpErr;
        setError("SECURITY TOKEN DISPATCHED TO EMAIL");
      }
    } catch (err: any) {
      setError(err.message || "FAILED TO ESTABLISH NEURAL LINK");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const { error } = await authApi.signInWithGoogle();
      if (error) throw error;
      // Note: Redirect will happen automatically
    } catch (err: any) {
      setError(err.message || "GOOGLE HANDSHAKE FAILED");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#020617] font-sans relative overflow-hidden">
      {/* Dynamic Background Moon Aura */}
      <div className="absolute top-[-20%] right-[-10%] opacity-[0.05] pointer-events-none rotate-12">
        <Moon size={800} fill="currentColor" className="text-indigo-400 blur-3xl" />
      </div>
      
      <m.div 
        animate={{ 
          background: [
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)",
            "radial-gradient(circle at 30% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)"
          ] 
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Brand Header */}
      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-4 z-10"
      >
        <div className="relative inline-block p-1 bg-white/5 rounded-[2.5rem] border border-white/10 shadow-2xl backdrop-blur-xl mb-4">
           <Logo size={100} animated={true} threeD={true} />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase flex items-center justify-center gap-4">
            SOMNO<span className="text-indigo-500">LAB</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.6em] mt-3 italic opacity-60">
            DIGITAL IDENTITY TELEMETRY • SECURE NODES
          </p>
        </div>
      </m.div>

      {/* Auth Card */}
      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        <div className="bg-slate-900/40 backdrop-blur-3xl p-1.5 rounded-[2.5rem] border border-white/5 relative flex shadow-2xl">
          <button 
            type="button"
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'otp' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
          >
            OTP TOKEN
          </button>
          <button 
            type="button"
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'password' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
          >
            PASSWORD
          </button>
          <m.div 
            className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-3px)] bg-indigo-600/20 border border-indigo-500/30 rounded-full shadow-lg"
            animate={{ x: authMode === 'password' ? '100%' : '0%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        <form onSubmit={handleAction} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                <Mail size={20} />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Lab Identifier Email"
                className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-700 font-bold italic shadow-inner"
                required
              />
            </div>

            {authMode === 'password' && (
              <m.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="relative group overflow-hidden"
              >
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Access Key"
                  className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-700 font-bold italic shadow-inner"
                  required
                />
              </m.div>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] hover:bg-indigo-500 disabled:opacity-50 relative overflow-hidden group"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
            <span className="relative z-10">
              {isProcessing ? 'SYNCHRONIZING...' : authMode === 'password' ? 'AUTHORIZE ACCESS' : 'REQUEST TOKEN'}
            </span>
          </button>

          <div className="grid grid-cols-1 gap-4">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="py-5 bg-slate-900/60 border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-lg active:scale-95"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
              AUTHORIZE VIA GOOGLE
            </button>
          </div>
        </form>

        <AnimatePresence>
          {error && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-start gap-4"
            >
              <ShieldAlert size={20} className="text-rose-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-black uppercase tracking-widest text-rose-400 leading-relaxed italic">{error}</p>
            </m.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <button className="text-[10px] font-black uppercase text-slate-600 hover:text-indigo-400 tracking-[0.3em] flex items-center justify-center gap-2 mx-auto transition-colors italic">
            <Info size={12} />
            CANNOT ACTIVATE ACCOUNT?
          </button>
        </div>
      </div>

      <footer className="mt-20 text-center space-y-3 opacity-20 z-10">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-400 italic font-black">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
};
