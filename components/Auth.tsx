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
  const t = translations[lang].auth;
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
    const timer = setTimeout(() => {
      if (!turnstileToken) setIsTurnstileStuck(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [turnstileToken]);

  useEffect(() => {
    setError(null);
    setSuccess(null);
    setTurnstileToken(null);
    
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
          callback: (token: string) => {
            setTurnstileToken(token);
            setIsTurnstileStuck(false);
          },
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => {
            setTurnstileToken(null);
            setIsTurnstileStuck(true);
          }
        });
      }
    } catch (e) { 
      setIsTurnstileStuck(true);
    }
  };

  const handleInitialAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    if (!turnstileToken && !isTurnstileStuck) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMode === 'password') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (authMode === 'register') {
        const { data: signUpData, error: signUpErr } = await authApi.signUp(email, password);
        
        if (signUpErr) {
          if (signUpErr.message.includes('already registered')) {
            throw new Error(lang === 'zh' ? '该邮箱已注册，请直接登录。' : 'Email already registered. Please login directly.');
          }
          throw signUpErr;
        }
        
        if (signUpData?.session) {
          onLogin();
        } else {
          setSuccess(lang === 'zh' ? '注册请求已提交，请输入邮箱中的 6 位验证码。' : 'Registry requested! Enter the 6-digit code from your email.');
          setStep('verify');
          setCooldown(60);
        }
      } else {
        const { error: otpErr } = await authApi.sendOTP(email);
        if (otpErr) throw otpErr;
        setSuccess(lang === 'zh' ? '验证码已发送，请检查收件箱。' : 'Verification code sent! Please check your inbox.');
        setStep('verify');
        setCooldown(60);
      }
    } catch (err: any) {
      console.error("[Auth] Initial Action Error:", err);
      setError(err.message || "AUTHENTICATION_STREAM_ERROR");
      if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 在 Supabase 中，注册验证类型通常是 'signup' 或 'email'
      const type = authMode === 'register' ? 'signup' : 'email';
      const { error: verifyErr } = await authApi.verifyOTP(email, token, type);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError(err.message || "VERIFICATION_FAILURE");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans selection:bg-indigo-500/30">
      <m.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-2"
      >
        <Logo size={80} animated={true} className="mx-auto mb-6" />
        <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase leading-none">
          SomnoAI Digital Sleep Lab
        </h1>
        <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em]">NEURAL GATEWAY</p>
      </m.div>

      <div className="w-full max-w-[420px] space-y-8">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <m.div 
              key="input-step"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="bg-black/40 p-1.5 rounded-[2rem] border border-white/5 relative flex shadow-2xl">
                {(['otp', 'password', 'register'] as AuthMode[]).map((mode) => (
                  <button 
                    key={mode}
                    onClick={() => {
                      setAuthMode(mode);
                      setError(null);
                      setSuccess(null);
                    }} 
                    className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === mode ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {mode === 'otp' ? 'OTP' : mode === 'password' ? 'LOGIN' : 'JOIN'}
                  </button>
                ))}
                <m.div 
                  className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-slate-900 border border-white/10 rounded-full shadow-lg" 
                  animate={{ x: authMode === 'otp' ? '0%' : authMode === 'password' ? '100%' : '200%' }}
                  transition={{ type: "spring", stiffness: 400, damping: 35 }}
                />
              </div>

              <form onSubmit={handleInitialAction} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Email Identifier" 
                      className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold italic" 
                      required 
                    />
                  </div>

                  {(authMode === 'password' || authMode === 'register') && (
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder={authMode === 'register' ? "Create Security Key" : "Security Key"} 
                        className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-16 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold italic" 
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3">
                   <div ref={turnstileRef} className="cf-turnstile min-h-[65px]"></div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing || cooldown > 0 || (!turnstileToken && !isTurnstileStuck)}
                  className={`w-full py-6 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl ${cooldown > 0 ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500'}`}
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (authMode === 'register' ? <UserPlus size={18} /> : <Zap size={18} fill="currentColor" />)}
                  <span>
                    {!turnstileToken && !isTurnstileStuck ? 'WAITING FOR VALIDATION' : 
                     isProcessing ? 'SYNCHRONIZING...' : 
                     cooldown > 0 ? `RETRY IN ${cooldown}S` : 
                     authMode === 'register' ? 'INITIALIZE REGISTRY' : 'AUTHORIZE ACCESS'}
                  </span>
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => authApi.signInWithGoogle()} className="py-5 bg-[#0a0f25] border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest active:scale-95">
                    <Shield size={16} /> GOOGLE
                  </button>
                  <button type="button" onClick={onGuest} className="py-5 bg-[#0a0f25] border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest active:scale-95">
                    <Fingerprint size={18} className="text-indigo-400" /> SANDBOX
                  </button>
                </div>
              </form>
            </m.div>
          ) : (
            <m.div 
              key="verify-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <button onClick={() => setStep('input')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase flex items-center gap-2 mx-auto transition-colors">
                  <ChevronLeft size={14} /> {lang === 'zh' ? '返回修改' : 'Back to Input'}
                </button>
                <div className="space-y-1">
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">
                    {lang === 'zh' ? '输入验证令牌' : 'Verify Security Token'}
                  </h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic truncate px-4">
                    Sent to: {email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-10">
                <div className="flex justify-between gap-2 px-4">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx} 
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text" 
                      inputMode="numeric" 
                      maxLength={1} 
                      value={digit}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-10 h-14 bg-slate-950/60 border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing || otp.some(d => !d)} 
                  className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-2xl active:scale-95"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                  <span>{isProcessing ? 'VERIFYING...' : 'CONFIRM IDENTITY'}</span>
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => handleInitialAction({ preventDefault: () => {} } as any)}
                    disabled={cooldown > 0 || isProcessing}
                    className="text-[10px] font-black text-indigo-400 hover:text-white uppercase tracking-widest disabled:opacity-30 transition-all"
                  >
                    {cooldown > 0 ? `Resend Token in ${cooldown}s` : 'Request New Token'}
                  </button>
                </div>
              </form>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {(error || success) && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }} 
              className={`p-5 rounded-3xl border flex items-start gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic text-left">{error || success}</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">
          SomnoAI Digital Sleep Lab • ongyuze1401@gmail.com
        </p>
      </footer>
    </div>
  );
};