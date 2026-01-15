import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronLeft, Mail, Zap, RefreshCw, ShieldAlert, ShieldCheck, Lock, Fingerprint, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle } from './services/supabaseService.ts';
import { supabase } from './lib/supabaseClient.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');
  const [authType, setAuthType] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handlePasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);

    try {
      if (authType === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setLocalError(lang === 'zh' ? "注册成功，请检查邮箱验证。" : "Registration successful. Please check your email.");
        setIsProcessing(false);
        return;
      }
      onLogin();
    } catch (err: any) {
      setLocalError(err.message || "Authentication Failed");
      setIsProcessing(false);
    }
  };

  const handleOtpHandshake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    
    setIsProcessing(true);
    setLocalError(null);
    
    try {
      await signInWithEmailOTP(email.trim().toLowerCase(), true);
      setStep('verify');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setLocalError(err.message || "Laboratory Handshake Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await signInWithGoogle();
      // OAuth redirects, so processing state is handled by the redirect
    } catch (err: any) {
      setLocalError(err.message || "OAuth Handshake Failed");
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || isProcessing) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(digit => digit !== '') && index === 5 && !isProcessing) {
      executeVerify(newOtp.join(''));
    }
  };

  const executeVerify = async (fullOtp?: string) => {
    if (isProcessing) return;
    const token = fullOtp || otp.join('');
    if (token.length < 6) return;
    setIsProcessing(true);
    setLocalError(null);
    try {
      const session = await verifyOtp(email.trim().toLowerCase(), token);
      if (session) onLogin();
    } catch (err: any) {
      setLocalError(err.message || "Neural Token Invalid");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 space-y-3 relative z-10">
        <div className="mb-6 flex justify-center scale-110">
          <Logo size={90} animated={true} />
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
          SOMNOAI <span className="text-indigo-500">LAB</span>
        </h1>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.5em] opacity-80">
          {t.tagline}
        </p>
      </m.div>

      <GlassCard className="w-full max-w-[420px] p-2 rounded-[4.5rem] bg-[#0c1021] border-[#312e81] border-[3px] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.9)] relative z-10 overflow-hidden">
        <div className="flex p-2 bg-black/40 rounded-full m-2 border border-white/5">
          <button 
            onClick={() => { setAuthMode('otp'); setStep('input'); setLocalError(null); }}
            className={`flex-1 py-3 px-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'otp' ? 'bg-[#1e1b4b] text-indigo-400 shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}
          >
            OTP MODE
          </button>
          <button 
            onClick={() => { setAuthMode('password'); setStep('input'); setLocalError(null); }}
            className={`flex-1 py-3 px-4 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${authMode === 'password' ? 'bg-[#1e1b4b] text-indigo-400 shadow-lg border border-white/5' : 'text-slate-600 hover:text-slate-400'}`}
          >
            PASSWORD MODE
          </button>
        </div>

        <div className="flex justify-center gap-10 mt-6 mb-8 border-b border-white/5 pb-4">
          <button onClick={() => { setAuthType('login'); setLocalError(null); }} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${authType === 'login' ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}>
            <Zap size={14} className={authType === 'login' ? 'fill-indigo-400' : ''} /> LOGIN
          </button>
          <button onClick={() => { setAuthType('register'); setLocalError(null); }} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all ${authType === 'register' ? 'text-indigo-400' : 'text-slate-700 hover:text-slate-500'}`}>
            <Fingerprint size={14} className={authType === 'register' ? 'fill-indigo-400' : ''} /> REGISTER
          </button>
        </div>

        <div className="px-10 py-4 space-y-8">
          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <m.form key="input-form" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} onSubmit={authMode === 'otp' ? handleOtpHandshake : handlePasswordAuth} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-[#05070e] border border-white/10 rounded-full pl-16 pr-8 py-6 text-[13px] text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/40 transition-all font-semibold tracking-wide" required />
                </div>

                {authMode === 'password' && (
                  <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group">
                    <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Password" className="w-full bg-[#05070e] border border-white/10 rounded-full pl-16 pr-8 py-6 text-[13px] text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/40 transition-all font-semibold tracking-wide" required />
                  </m.div>
                )}

                <button type="submit" disabled={isProcessing || (authMode === 'otp' && cooldown > 0)} className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full flex items-center justify-center gap-4 font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] active:scale-[0.98] transition-all disabled:opacity-50">
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  {authMode === 'otp' ? (cooldown > 0 ? `WAIT ${cooldown}S` : 'REQUEST LAB TOKEN') : 'AUTHORIZE ACCESS'}
                </button>
              </m.form>
            ) : (
              <m.div key="verify-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10 py-4">
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('input')} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                    <ChevronLeft size={14} /> BACK TO IDENTIFIER
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Identity Audit</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-xs mx-auto">TOKEN DISPATCHED TO {email}</p>
                </div>

                <div className="flex justify-between gap-2.5 px-1">
                  {otp.map((digit, idx) => (
                    <m.input key={idx} ref={(el: any) => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} animate={digit ? { scale: [1, 1.1, 1] } : {}} onChange={(e: any) => handleOtpInput(idx, e.target.value)} onKeyDown={(e: any) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} disabled={isProcessing} className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all disabled:opacity-50" />
                  ))}
                </div>

                <button onClick={() => executeVerify()} disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  AUTHORIZE ACCESS
                </button>
              </m.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-5 pt-4 pb-4">
             <button onClick={handleGoogleLogin} disabled={isProcessing} className="flex items-center justify-center gap-3 py-5 px-6 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/10 transition-all group disabled:opacity-50">
                <Globe size={16} className="group-hover:text-indigo-400 transition-colors" /> GOOGLE
             </button>
             <button onClick={onGuest} className="flex items-center justify-center gap-3 py-5 px-6 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase text-slate-500 hover:text-white hover:bg-white/10 transition-all group">
                <Fingerprint size={16} className="group-hover:text-indigo-400 transition-colors" /> SANDBOX MODE
             </button>
          </div>
        </div>

        <AnimatePresence>
          {localError && (
            <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-8 pb-10">
              <div className="p-5 bg-rose-500/10 rounded-[2rem] border border-rose-500/20 text-rose-300 text-[11px] font-bold flex gap-4 items-center">
                <ShieldAlert size={20} className="shrink-0 text-rose-500" />
                <p className="italic leading-snug">{localError}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <footer className="mt-16 flex flex-col items-center gap-6 relative z-10 pb-12 opacity-50">
        <div className="text-center px-12 max-w-sm">
          <p className="text-[9px] text-slate-800 font-bold uppercase tracking-[0.3em] leading-relaxed italic">
            Neural activity within this terminal is cryptographically logged. Access attempts are audited in real-time.
          </p>
        </div>
      </footer>
    </div>
  );
};