
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Zap, Lock, Eye, EyeOff, User, 
  ChevronLeft, Info, FlaskConical, AlertTriangle, ShieldCheck,
  Chrome, RefreshCw, Shield, AlertCircle, KeyRound, Mail
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
  const [step, setStep] = useState<'request' | 'verify' | 'recovery'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<{message: string, isRateLimit?: boolean, code?: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  
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
        const ts = (window as any).turnstile;
        
        if (!ts) {
          setTurnstileStatus('unavailable');
          return;
        }
        
        try {
          if (turnstileRef.current) turnstileRef.current.innerHTML = '';
          ts.render(turnstileRef.current, {
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
          setTurnstileStatus('unavailable');
          console.debug("Turnstile restricted by sandbox policy.");
        }
      }
    };

    const timer = setTimeout(initTurnstile, 600);
    const failsafe = setTimeout(() => {
      if (turnstileStatus === 'pending') setTurnstileStatus('unavailable');
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(failsafe);
    };
  }, [step, activeTab]);

  const handleAuthAction = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'otp') {
        const { error: otpErr } = await authApi.sendOTP(email.trim(), turnstileToken || undefined);
        if (otpErr) throw otpErr;
        setStep('verify');
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken || undefined);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken || undefined);
        if (signUpErr) throw signUpErr;
        setStep('verify');
        setActiveTab('otp');
      }
    } catch (err: any) {
      const isRateLimit = err.status === 429;
      setError({ 
        message: isRateLimit ? "Protocol Throttled. Please wait 60s." : (err.message || "Handshake Failure."),
        isRateLimit
      });
      setIsProcessing(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !email) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const { error: resetErr } = await authApi.resetPassword(email.trim());
      if (resetErr) throw resetErr;
      setResetSent(true);
    } catch (err: any) {
      setError({ message: err.message || "Recovery handshake failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const canClick = email.length > 3 && (activeTab === 'otp' || password.length >= 6);
  const isSubmitDisabled = isProcessing || !canClick;

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
        <AnimatePresence mode="wait">
          {step === 'request' ? (
            <m.div key="request" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
              <button 
                onClick={() => authApi.signInWithGoogle()} disabled={isGoogleLoading}
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
                  <button key={tab} onClick={() => { setActiveTab(tab as any); setTurnstileToken(null); setError(null); }} className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500'}`}>{tab === 'join' ? 'SIGNUP' : tab.toUpperCase()}</button>
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
                    <div className="space-y-2">
                      <div className="relative">
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                      </div>
                      {activeTab === 'login' && (
                        <div className="px-6 flex justify-end">
                           <button 
                             type="button" 
                             onClick={() => { setStep('recovery'); setError(null); }}
                             className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors italic"
                           >
                             Forgot Key?
                           </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center min-h-[50px] gap-2">
                  <div ref={turnstileRef} className="cf-turnstile"></div>
                </div>

                <div className="space-y-4">
                  <button 
                    type="submit" disabled={isSubmitDisabled}
                    className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all hover:bg-indigo-500 disabled:opacity-40 active:scale-95"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} fill="currentColor" />}
                    <span>{isProcessing ? "SYNCHRONIZING" : "ESTABLISH LINK"}</span>
                  </button>

                  <AnimatePresence>
                    {error && (
                      <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-3">
                        <AlertCircle className="text-rose-500 shrink-0" size={16} />
                        <p className="text-[10px] font-bold text-rose-400 uppercase leading-relaxed italic">{error.message}</p>
                      </m.div>
                    )}
                  </AnimatePresence>
                </div>
              </form>

              <div className="flex flex-col items-center gap-4 pt-4">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {activeTab === 'login' ? "No account? " : "Already registered? "}
                  <button onClick={() => setActiveTab(activeTab === 'login' ? 'join' : 'login')} className="text-indigo-400 hover:text-white underline underline-offset-4">{activeTab === 'login' ? 'Create one' : 'Sign in'}</button>
                </p>
                
                <button onClick={onGuest} className="w-full py-4 border border-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all mt-2">
                  <FlaskConical size={14} /> Sandbox Mode
                </button>
              </div>
            </m.div>
          ) : step === 'verify' ? (
            <m.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10" >
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
          ) : (
            <m.div key="recovery" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
               <div className="text-center space-y-4">
                 <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20">
                    <KeyRound size={32} />
                 </div>
                 <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Recover Access</h3>
                 <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Identity Recovery Protocol</p>
               </div>

               <form onSubmit={handleResetPassword} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[9px] font-black uppercase text-slate-600 px-6 tracking-widest italic flex items-center gap-2">
                       <Mail size={10} /> Authorized Node Email
                    </label>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Enter identifier..." 
                      className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" 
                      required 
                    />
                  </div>

                  <AnimatePresence>
                    {resetSent ? (
                      <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[2rem] flex flex-col items-center text-center gap-3">
                         <ShieldCheck className="text-emerald-500" size={24} />
                         <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest italic">Recovery Dispatched. Check your node inbox.</p>
                      </m.div>
                    ) : (
                      <div className="space-y-4">
                        <button 
                          type="submit" 
                          disabled={isProcessing || !email}
                          className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-40"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                          <span>SEND RESET LINK</span>
                        </button>
                        
                        <AnimatePresence>
                          {error && (
                            <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-3">
                              <AlertCircle className="text-rose-500 shrink-0" size={16} />
                              <p className="text-[10px] font-bold text-rose-400 uppercase leading-relaxed italic">{error.message}</p>
                            </m.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </AnimatePresence>

                  <button 
                    type="button" 
                    onClick={() => { setStep('request'); setResetSent(false); setError(null); }} 
                    className="w-full text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3 transition-colors"
                  >
                    <ChevronLeft size={14} /> Return to Login
                  </button>
               </form>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
