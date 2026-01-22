import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, ShieldCheck, 
  Zap, Info, Fingerprint, Timer, RefreshCw,
  Lock, Eye, EyeOff, AlertTriangle, Shield, UserPlus
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

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const t = translations[lang].auth;
  const [authMode, setAuthMode] = useState<AuthMode>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isTurnstileStuck, setIsTurnstileStuck] = useState(false);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  // 监控验证码加载情况
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!turnstileToken) {
        setIsTurnstileStuck(true);
      }
    }, 6000);
    return () => clearTimeout(timer);
  }, [turnstileToken]);

  useEffect(() => {
    // 切换模式时重置状态
    setError(null);
    setSuccess(null);
    setTurnstileToken(null);
    
    const timer = setTimeout(() => {
      if (turnstileRef.current && window.turnstile) {
        initTurnstile();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [authMode]);

  const initTurnstile = () => {
    try {
      if (widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
      }
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
      console.warn("Turnstile init error:", e);
      setIsTurnstileStuck(true);
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    
    // 强制验证码校验
    if (!turnstileToken && !isTurnstileStuck) {
      setError(lang === 'zh' ? "请等待安全验证完成" : "Please wait for security validation");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      if (authMode === 'register') {
        const { data: signUpData, error: signUpErr } = await authApi.signUp(email, password);
        if (signUpErr) throw signUpErr;
        
        if (signUpData?.session) {
          onLogin();
        } else {
          setSuccess(lang === 'zh' ? '注册成功！请检查您的邮箱以确认账户。' : 'Registry created! Please check your email for confirmation.');
          setCooldown(60);
        }
      } else if (authMode === 'password') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      } else {
        const { error: otpErr } = await authApi.sendOTP(email);
        if (otpErr) throw otpErr;
        setSuccess(lang === 'zh' ? '验证令牌已发送至您的邮箱。' : 'Security token dispatched to your email.');
        setCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || "FAILED TO ESTABLISH NEURAL LINK");
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
      setTurnstileToken(null);
    } finally {
      setIsProcessing(false);
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
        <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase">
          SOMNOAI<span className="text-indigo-500">LAB</span>
        </h1>
        <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em]">NEURAL GATEWAY</p>
      </m.div>

      <div className="w-full max-w-[420px] space-y-8">
        {/* 三段式切换器 */}
        <div className="bg-black/40 p-1.5 rounded-[2rem] border border-white/5 relative flex shadow-2xl">
          <button 
            onClick={() => setAuthMode('otp')} 
            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'otp' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            OTP
          </button>
          <button 
            onClick={() => setAuthMode('password')} 
            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'password' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            LOGIN
          </button>
          <button 
            onClick={() => setAuthMode('register')} 
            className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'register' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
          >
            JOIN
          </button>
          <m.div 
            className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-slate-900 border border-white/10 rounded-full shadow-lg" 
            animate={{ x: authMode === 'otp' ? '0%' : authMode === 'password' ? '100%' : '200%' }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
          />
        </div>

        <form onSubmit={handleAction} className="space-y-6">
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
             {isTurnstileStuck && !turnstileToken && (
               <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3 w-full">
                  <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
                    <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest leading-relaxed">
                      Security validation slow? You can try to proceed or reload.
                    </p>
                  </div>
                  <button type="button" onClick={initTurnstile} className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest hover:text-white transition-all">
                    <RefreshCw size={12} /> Reload Security Node
                  </button>
               </m.div>
             )}
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

        <AnimatePresence>
          {(error || success) && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`p-5 rounded-3xl border flex items-start gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{error || success}</p>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">
          SOMNOAI LAB • ongyuze1401@gmail.com
        </p>
      </footer>
    </div>
  );
};
