import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock, Mail, Eye, EyeOff, UserPlus, LogIn, Chrome } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, signInWithPassword, signUpWithPassword } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const t = translations[lang].auth;
  const d = translations[lang].dashboard;

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });
  }, []);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setLocalError(null);

    try {
      if (authMode === 'otp') {
        await signInWithEmailOTP(email);
        setLocalError(translations[lang].auth.checkEmail);
      } else {
        if (formType === 'login') {
          await signInWithPassword(email, password);
          onLogin();
        } else {
          await signUpWithPassword(email, password);
          setLocalError("Registration successful. Please verify email if required.");
        }
      }
    } catch (error: any) {
      setLocalError(error.message || "Authentication Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      setLocalError(error.message || "Google Authentication Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Dynamic Aura Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      {/* Branding Header */}
      <m.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-10 space-y-3 relative z-10"
      >
        <div className="mb-6 flex justify-center">
          <Logo size={80} animated={true} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
          {t.lab.split(' ')[0]} <span className="text-indigo-400">{t.lab.split(' ')[1]}</span>
        </h1>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
          {t.tagline}
        </p>
      </m.div>

      {/* Main Auth Terminal */}
      <GlassCard className="w-full max-w-md p-2 rounded-[3.5rem] bg-[#0c1021] border-white/5 shadow-2xl relative z-10 overflow-hidden">
        {/* Mode Switcher Tabs */}
        <div className="flex p-2 gap-2 bg-black/40 rounded-[3rem] m-2">
          <button 
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'otp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t.otpMode || 'OTP MODE'}
          </button>
          <button 
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {t.passwordMode || 'PASSWORD'}
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic px-4">
              {d.manifesto}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Sub-Tabs for Password Mode (Login/Register) */}
          <AnimatePresence mode="wait">
            {authMode === 'password' && (
              <m.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-6 px-2"
              >
                <button 
                  onClick={() => setFormType('login')}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${formType === 'login' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <LogIn size={14} className={formType === 'login' ? 'text-indigo-400' : 'text-slate-600'} />
                  {t.login}
                </button>
                <button 
                  onClick={() => setFormType('register')}
                  className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${formType === 'register' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                >
                  <UserPlus size={14} className={formType === 'register' ? 'text-indigo-400' : 'text-slate-600'} />
                  {t.register}
                </button>
              </m.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAction} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest px-4">{t.emailLabel}</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@lab.somno"
                  className="w-full bg-[#05070e] border border-white/5 rounded-full px-16 py-5 text-sm text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/30 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Input (Only for Password Mode) */}
            <AnimatePresence>
              {authMode === 'password' && (
                <m.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="space-y-3 overflow-hidden"
                >
                  <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest px-4">{t.passwordLabel}</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#05070e] border border-white/5 rounded-full px-16 py-5 text-sm text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/30 transition-all font-medium"
                      required
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Main Action Button */}
            <button 
              type="submit" 
              disabled={isProcessing}
              className="w-full py-5 bg-indigo-600 text-white rounded-full flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 active:scale-95 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (formType === 'login' ? <Zap size={18} /> : <UserPlus size={18} />)}
              {formType === 'login' ? t.authorize : t.confirmRegister}
            </button>
          </form>

          {/* Alternative Methods */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isProcessing}
              className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all group"
            >
              <Chrome size={14} className="text-amber-500" />
              {t.google}
            </button>
            <button 
              onClick={onGuest} 
              className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Cpu size={14} className="text-indigo-400" />
              {t.sandboxMode}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {localError && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-8 pb-8"
            >
              <div className="p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-300 text-[11px] font-bold flex gap-3">
                <TriangleAlert size={18} className="shrink-0" />
                <p>{localError}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Footer Links */}
      <footer className="mt-12 flex flex-col items-center gap-8 relative z-10 pb-12">
        <button className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-colors">
          {t.cannotActivate}
        </button>
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Privacy Protocol</button>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <button onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Legal Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-800">© 2025 Somno Lab • Neural Grid Access</p>
      </footer>
    </div>
  );
};