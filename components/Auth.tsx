import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, ShieldCheck, 
  Zap, Info, Fingerprint, Timer, RefreshCw,
  Lock, Eye, EyeOff, AlertTriangle, Shield, UserPlus, ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { translations, Language } from '../services/i18n.ts';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

declare global {
  interface Window {
    turnstile: any;
  }
}

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
}

type AuthMode = 'otp' | 'password' | 'register';
type Step = 'input' | 'verify';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [step, setStep] = useState<Step>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isTurnstileStuck, setIsTurnstileStuck] = useState(false);
  
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    if (step === 'input') {
      const timer = setTimeout(() => {
        if (turnstileRef.current && window.turnstile) initTurnstile();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [authMode, step]);

  const initTurnstile = () => {
    try {
      if (widgetIdRef.current) window.turnstile.remove(widgetIdRef.current);
      if (turnstileRef.current) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACNi1FM3bbfW_VsI',
          theme: 'dark',
          callback: (token: string) => { setTurnstileToken(token); setIsTurnstileStuck(false); },
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => { setTurnstileToken(null); setIsTurnstileStuck(true); }
        });
      }
    } catch (e) { setIsTurnstileStuck(true); }
  };

  const handleInitialAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMode === 'password') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (authMode === 'register') {
        const { error: signUpErr } = await authApi.signUp(email, password);
        if (signUpErr) throw signUpErr;
        setSuccess(lang === 'zh' ? '令牌已发送。' : 'Token dispatched.');
        setStep('verify');
        setCooldown(60);
      } else {
        const { error: otpErr } = await authApi.sendOTP(email);
        if (otpErr) throw otpErr;
        setSuccess(lang === 'zh' ? '验证码已发送。' : 'Code sent.');
        setStep('verify');
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || "AUTH_ERROR");
      if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
    } finally { setIsProcessing(false); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 智能重试逻辑：先尝试 signup 类型，如果 403 则尝试 email 类型
      const primaryType = authMode === 'register' ? 'signup' : 'email';
      const { error: verifyErr } = await authApi.verifyOTP(email, token, primaryType);
      
      if (verifyErr) {
        // 如果是 403 Forbidden 或特定的类型错误，尝试备用类型
        const secondaryType = primaryType === 'signup' ? 'email' : 'signup';
        const { error: retryErr } = await authApi.verifyOTP(email, token, secondaryType);
        
        if (retryErr) throw retryErr;
      }
      onLogin();
    } catch (err: any) {
      console.error("[Verify] Error:", err);
      setError(err.message || "VERIFICATION_FAILED");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally { setIsProcessing(false); }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val !== '' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans">
      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
        <Logo size={80} animated={true} className="mx-auto mb-6" />
        <h1 className="text-4xl font-black text-white italic uppercase leading-none">SomnoAI Sleep Lab</h1>
        <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em] mt-2">SECURE GATEWAY</p>
      </m.div>

      <div className="w-full max-w-[420px] space-y-8">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <m.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
              <div className="bg-black/40 p-1.5 rounded-[2rem] border border-white/5 relative flex">
                {(['otp', 'password', 'register'] as AuthMode[]).map((mode) => (
                  <button key={mode} onClick={() => setAuthMode(mode)} className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === mode ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}>
                    {mode === 'otp' ? 'OTP' : mode === 'password' ? 'LOGIN' : 'JOIN'}
                  </button>
                ))}
                <m.div className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-slate-900 border border-white/10 rounded-full" animate={{ x: authMode === 'otp' ? '0%' : authMode === 'password' ? '100%' : '200%' }} />
              </div>

              <form onSubmit={handleInitialAction} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                  </div>
                  {authMode !== 'otp' && (
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                      <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Security Key" className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-16 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                    </div>
                  )}
                </div>
                <div ref={turnstileRef} className="cf-turnstile min-h-[65px] flex justify-center"></div>
                <button type="submit" disabled={isProcessing || cooldown > 0} className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl ${cooldown > 0 ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}>
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                  <span>{isProcessing ? 'PROCESSING...' : cooldown > 0 ? `RETRY IN ${cooldown}S` : authMode === 'register' ? 'INITIALIZE JOIN' : 'AUTHORIZE'}</span>
                </button>
              </form>
            </m.div>
          ) : (
            <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
              <div className="text-center space-y-4">
                <button onClick={() => setStep('input')} className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2 mx-auto"><ChevronLeft size={14} /> Back</button>
                <h2 className="text-xl font-black text-white uppercase italic">Verify Token</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase italic">{email}</p>
              </div>
              <form onSubmit={handleVerifyOtp} className="space-y-10">
                <div className="flex justify-between gap-2 px-4">
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={(el) => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => handleOtpInput(idx, e.target.value)} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} className="w-10 h-14 bg-slate-950 border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black outline-none focus:border-indigo-500" />
                  ))}
                </div>
                <button type="submit" disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all shadow-2xl">
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  <span>{isProcessing ? 'VERIFYING...' : 'CONFIRM IDENTITY'}</span>
                </button>
              </form>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-5 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
              <div className="flex items-start gap-4">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{error}</p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};