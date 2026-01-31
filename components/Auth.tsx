
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Zap, Lock, Eye, EyeOff, User, 
  ChevronLeft, Info, FlaskConical, AlertTriangle, ShieldCheck,
  Chrome, RefreshCw, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';
import { notifyAdmin } from '../services/telegramService.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh';
  onLogin: () => void;
  onGuest: () => void; 
  initialTab?: 'login' | 'join' | 'otp';
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'join' | 'otp'>(initialTab);
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<{message: string, isRateLimit?: boolean, code?: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<'pending' | 'ready' | 'error' | 'unavailable'>('pending');
  
  const turnstileRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (initialTab && initialTab !== activeTab) {
      setActiveTab(initialTab);
      setError(null);
    }
  }, [initialTab]);

  useEffect(() => {
    const initTurnstile = () => {
      if (step === 'request' && turnstileRef.current) {
        if (!(window as any).turnstile) {
          // 如果 2秒后脚本还没加载，标记为不可用以解锁按钮
          setTurnstileStatus('unavailable');
          return;
        }
        
        try {
          (window as any).turnstile.render(turnstileRef.current, {
            sitekey: '0x4AAAAAACNi1FM3bbfW_VsI',
            theme: 'dark',
            callback: (token: string) => {
              setTurnstileToken(token);
              setTurnstileStatus('ready');
            },
            'expired-callback': () => setTurnstileToken(null),
            'error-callback': () => setTurnstileStatus('error')
          });
        } catch (e) {
          setTurnstileStatus('error');
        }
      }
    };

    const timer = setTimeout(initTurnstile, 800);
    return () => clearTimeout(timer);
  }, [step, activeTab]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'otp') {
        const { error: otpErr } = await authApi.sendOTP(email.trim(), turnstileToken || undefined);
        if (otpErr) throw otpErr;
        setStep('verify');
        notifyAdmin(`✉️ OTP REQUESTed from ${email}`);
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken || undefined);
        if (signInErr) throw signInErr;
        notifyAdmin(`🔑 SUCCESSFUL LOGIN: ${email}`);
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken || undefined);
        if (signUpErr) throw signUpErr;
        notifyAdmin(`🆕 NEW SIGNUP INITIATED: ${email} (${fullName})`);
        setStep('verify');
        setActiveTab('otp');
      }
    } catch (err: any) {
      const isRateLimit = err.status === 429;
      setError({ 
        message: isRateLimit ? "Node Throttled. Please wait 60s." : (err.message || "Handshake Failure."),
        isRateLimit
      });
      setIsProcessing(false);
      notifyAdmin(`⚠️ AUTH_EXCEPTION: ${email}\nError: ${err.message}`);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      await authApi.signInWithGoogle();
    } catch (e) {
      setIsGoogleLoading(false);
    }
  };

  // 核心改动：如果验证码不可用或出错，不再禁用按钮，而是让用户尝试提交
  const isSubmitDisabled = isProcessing || (turnstileStatus === 'pending' && !turnstileToken);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-hidden">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-12 space-y-6">
        <Logo size={80} animated={true} />
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">SomnoAI <span className="text-indigo-500">Sleep Lab</span></h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[9px] tracking-[0.8em] italic">SECURE ACCESS TERMINAL</p>
        </div>
      </m.div>

      <div className="w-full max-w-[400px] space-y-8 relative z-10">
        {step === 'request' ? (
          <>
            <button 
              onClick={handleGoogleLogin} disabled={isGoogleLoading}
              className="w-full py-5 rounded-full bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} />}
              Continue with Google
            </button>

            <div className="flex items-center gap-4 py-2 opacity-30">
              <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black text-white uppercase tracking-widest">OR</span><div className="h-px flex-1 bg-white" />
            </div>

            <div className="bg-slate-900/60 p-1 rounded-full border border-white/5 flex relative shadow-inner">
              {['login', 'join', 'otp'].map((tab) => (
                <button key={tab} onClick={() => { setActiveTab(tab as any); setTurnstileToken(null); }} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>{tab === 'join' ? 'SIGNUP' : tab.toUpperCase()}</button>
              ))}
              <m.div className="absolute top-1 left-1 bottom-1 w-[calc(33.33%-2px)] bg-indigo-600 rounded-full shadow-lg" animate={{ x: activeTab === 'login' ? '0%' : activeTab === 'join' ? '100%' : '200%' }} />
            </div>

            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="space-y-4">
                {activeTab === 'join' && (
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                {activeTab !== 'otp' && (
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center min-h-[65px] gap-2">
                <div ref={turnstileRef} className="cf-turnstile"></div>
                {turnstileStatus === 'error' && (
                  <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest italic">
                    Verification Error. Try bypass or refresh.
                  </p>
                )}
                {turnstileStatus === 'unavailable' && (
                  <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest italic">
                    Security Shield Offline. Manual entry allowed.
                  </p>
                )}
              </div>

              <button 
                type="submit" disabled={isSubmitDisabled}
                className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all hover:bg-indigo-500 disabled:opacity-40 active:scale-95"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                <span>
                  {isProcessing 
                    ? "SYNCHRONIZING" 
                    : (turnstileToken || turnstileStatus === 'ready' || turnstileStatus === 'error' || turnstileStatus === 'unavailable' 
                        ? "ESTABLISH LINK" 
                        : "PENDING VERIFICATION")}
                </span>
              </button>
            </form>

            <div className="flex flex-col items-center gap-4 pt-4">
              {activeTab === 'login' ? (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  No account? <button onClick={() => { setActiveTab('join'); window.history.pushState(null, '', '/signup'); }} className="text-indigo-400 hover:text-white underline underline-offset-4">Create one</button>
                </p>
              ) : (
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Already registered? <button onClick={() => { setActiveTab('login'); window.history.pushState(null, '', '/login'); }} className="text-indigo-400 hover:text-white underline underline-offset-4">Sign in</button>
                </p>
              )}
              
              <button onClick={onGuest} className="w-full py-4 border border-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all mt-2">
                <FlaskConical size={14} /> Sandbox Mode
              </button>
            </div>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10" >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Verify Identity</h3>
              <div className="px-6 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full inline-block"><p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest">{email}</p></div>
            </div>
            <div className="flex justify-between gap-3 px-2">
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const newOtp = [...otp]; newOtp[idx] = e.target.value.slice(-1); setOtp(newOtp);
                  if (e.target.value && idx < 5) otpRefs.current[idx + 1]?.focus();
                }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} className="w-12 h-16 bg-[#050a1f] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all" />
              ))}
            </div>
            <div className="space-y-4">
              <button onClick={() => handleAuthAction({ preventDefault: () => {} } as any)} disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />} AUTHORIZE
              </button>
              <button onClick={() => { setStep('request'); setIsProcessing(false); }} className="w-full text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3">
                <ChevronLeft size={14} /> Back to Terminal
              </button>
            </div>
          </m.div>
        )}
      </div>
    </div>
  );
};
