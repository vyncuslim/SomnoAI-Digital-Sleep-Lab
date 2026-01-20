
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, 
  Lock, Zap, Info, Moon, Eye, EyeOff, UserPlus, Fingerprint,
  ChevronLeft, ShieldCheck, Timer
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

type AuthMode = 'otp' | 'password' | 'register';

declare global {
  interface Window {
    turnstile: any;
  }
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const t = translations[lang].auth;
  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Detect errors from URL hash (e.g. otp_expired)
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('error=')) {
      const params = new URLSearchParams(hash.replace('#', ''));
      const errorMsg = params.get('error_description') || params.get('error') || 'Authentication failed';
      const errorCode = params.get('error_code');
      
      if (errorCode === 'otp_expired') {
        setError(lang === 'zh' ? '验证链接已过期，请重新请求令牌。' : 'Verification link expired. Please request a new token.');
      } else if (errorCode === 'invalid_credentials' || errorMsg.includes('Invalid login credentials')) {
        setError(lang === 'zh' ? '登录凭据无效：请检查邮箱验证或密码是否正确。' : 'Invalid login credentials: Check your email verification or password.');
      } else {
        setError(errorMsg.replace(/\+/g, ' '));
      }
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, [lang]);

  useEffect(() => {
    if (!otpSent && turnstileRef.current && window.turnstile) {
      try {
        if (widgetIdRef.current) {
          window.turnstile.remove(widgetIdRef.current);
        }
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: '0x4AAAAAACNi1FM3bbfW_VsI',
          theme: 'dark',
          callback: (token: string) => setTurnstileToken(token),
          'expired-callback': () => setTurnstileToken(null),
          'error-callback': () => setTurnstileToken(null),
        });
      } catch (e) {
        console.warn("Turnstile initialization failed:", e);
      }
    }
  }, [authMode, otpSent]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0 || !turnstileToken) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMode === 'register') {
        const { data: signUpData, error: signUpErr } = await authApi.signUp(email, password);
        if (signUpErr) throw signUpErr;
        
        if (signUpData?.session) {
          onLogin();
          return;
        }
        
        setSuccess(lang === 'zh' ? "账户已创建！请检查邮箱以进行验证。" : "Registry created! Please check your email for verification.");
        setCooldown(60);
      } else if (authMode === 'password') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) {
          if (signInErr.message.includes('Invalid login credentials')) {
            throw new Error(lang === 'zh' ? "登录凭据无效。如果您刚注册，请务必先点击邮件中的验证链接。" : "Invalid credentials. If you just registered, please verify your email first.");
          }
          throw signInErr;
        }
        onLogin();
      } else {
        const { error: otpErr } = await authApi.sendOTP(email);
        if (otpErr) throw otpErr;
        setSuccess("SECURITY TOKEN DISPATCHED.");
        setOtpSent(true);
      }
    } catch (err: any) {
      setError(err.message || "NEURAL LINK ESTABLISHMENT FAILED");
      if (window.turnstile && widgetIdRef.current) window.turnstile.reset(widgetIdRef.current);
      setTurnstileToken(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpCode.join('');
    if (code.length < 6 || isProcessing) return;

    setIsProcessing(true);
    setError(null);
    try {
      const { error: verifyErr } = await authApi.verifyOTP(email, code);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError(err.message || "TOKEN VERIFICATION FAILED");
      setOtpCode(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newOtp = [...otpCode];
    newOtp[index] = val;
    setOtpCode(newOtp);

    if (val !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(d => d !== '') && index === 5) {
      setTimeout(handleVerifyOtp, 200);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setError(null);
    try {
      const { error } = await authApi.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      setError(err.message || "GOOGLE HANDSHAKE FAILED.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#020617] font-sans relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-[40%] right-[20%] w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
        <div className="absolute bottom-[15%] left-[30%] w-1 h-1 bg-white rounded-full animate-pulse delay-1000" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-4 z-10"
      >
        <div className="relative inline-block mb-4">
           <Logo size={120} animated={true} threeD={true} />
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase flex items-center justify-center gap-3">
            SOMNOAI <span className="text-indigo-500">LAB</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] italic opacity-80">
            DIGITAL SLEEP LAB • NEURAL INFRASTRUCTURE
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        {!otpSent ? (
          <>
            <div className="bg-slate-900/40 backdrop-blur-3xl p-1.5 rounded-[2.2rem] border border-white/5 relative flex shadow-2xl">
              {['otp', 'password', 'register'].map((mode) => (
                <button 
                  key={mode}
                  type="button"
                  onClick={() => { 
                    setAuthMode(mode as AuthMode); 
                    setError(null); 
                    setSuccess(null);
                    setTurnstileToken(null);
                  }}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === mode ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  {mode}
                </button>
              ))}
              <m.div 
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-white/5 border border-white/10 rounded-full shadow-lg"
                animate={{ x: authMode === 'otp' ? '0%' : authMode === 'password' ? '100%' : '200%' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            <form onSubmit={handleAction} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                    <Mail size={18} />
                  </div>
                  <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Lab Identifier Email"
                    className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-800 font-bold italic"
                    required
                  />
                </div>

                <AnimatePresence mode="wait">
                  {authMode !== 'otp' && (
                    <m.div 
                      key="password-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="relative group overflow-hidden"
                    >
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                        <Lock size={18} />
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={authMode === 'register' ? "Initialize New Key" : "Security Key"}
                        className="w-full bg-[#050a1f]/80 border border-white/5 rounded-3xl pl-16 pr-16 py-6 text-sm text-white focus:border-indigo-500/40 outline-none transition-all placeholder:text-slate-800 font-bold italic"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </m.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex justify-center">
                 <div ref={turnstileRef} className="cf-turnstile"></div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || cooldown > 0 || !turnstileToken}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl hover:bg-indigo-500 disabled:opacity-50 relative overflow-hidden"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : cooldown > 0 ? <Timer size={18} /> : authMode === 'register' ? <UserPlus size={16} /> : <Zap size={16} fill="currentColor" />}
                <span>
                  {isProcessing ? 'SYNCHRONIZING...' : cooldown > 0 ? `NEURAL COOLDOWN (${cooldown}s)` : !turnstileToken ? 'WAITING FOR VALIDATION' : authMode === 'register' ? 'INITIALIZE REGISTRY' : authMode === 'password' ? 'AUTHORIZE ACCESS' : 'REQUEST OTP TOKEN'}
                </span>
              </button>
            </form>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
            <div className="text-center space-y-4">
              <button 
                onClick={() => { setOtpSent(false); setOtpCode(['', '', '', '', '', '']); setTurnstileToken(null); }}
                className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 mx-auto hover:text-indigo-300 transition-colors"
              >
                <ChevronLeft size={14} /> REVERT TO TERMINAL
              </button>
              <div className="space-y-2">
                <h3 className="text-xl font-black italic text-white uppercase tracking-tighter leading-none">Neural Verification</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest italic truncate px-8">Dispatching token to {email}</p>
              </div>
            </div>

            <div className="flex justify-between gap-3 px-2">
              {otpCode.map((digit, idx) => (
                <input 
                  key={idx} 
                  ref={(el) => { otpRefs.current[idx] = el; }}
                  type="text" 
                  inputMode="numeric" 
                  maxLength={1} 
                  value={digit}
                  onChange={(e) => handleOtpInput(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-16 bg-slate-950/60 border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all shadow-xl"
                />
              ))}
            </div>

            <button 
              onClick={() => handleVerifyOtp()} 
              disabled={isProcessing || otpCode.some(d => !d)} 
              className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-2xl"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
              VALIDATE TOKEN
            </button>
          </m.div>
        )}

        {!otpSent && (
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={isProcessing}
              className="py-5 bg-slate-900/60 border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
              )}
              GOOGLE
            </button>
            <button 
              type="button" 
              onClick={onGuest}
              className="py-5 bg-slate-900/60 border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95"
            >
              <Fingerprint size={20} className="text-indigo-400" />
              SANDBOX
            </button>
          </div>
        )}

        <AnimatePresence>
          {(error || success) && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-6 rounded-[2.5rem] flex items-start gap-4 border ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
            >
              {error ? <ShieldAlert size={20} className="mt-0.5 shrink-0" /> : <Zap size={20} className="mt-0.5 shrink-0" />}
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{error || success}</p>
            </m.div>
          )}
        </AnimatePresence>

        <div className="text-center">
          <button className="text-[10px] font-black uppercase text-slate-700 hover:text-indigo-400 tracking-[0.3em] flex items-center justify-center gap-2 mx-auto transition-colors italic">
            <Info size={12} />
            DIFFICULTY ACCESSING TERMINAL?
          </button>
        </div>
      </div>

      <footer className="mt-20 text-center space-y-3 opacity-20 z-10">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-400 italic font-black">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
};
