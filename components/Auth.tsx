
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Zap, Lock, Eye, EyeOff, User, 
  ChevronLeft, Info, FlaskConical, AlertTriangle, ShieldCheck,
  Chrome, RefreshCw, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh';
  onLogin: () => void;
  onGuest: () => void; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'join' | 'otp'>('login');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState<{message: string, isRateLimit?: boolean, code?: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Turnstile 状态
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 初始化 Turnstile
  useEffect(() => {
    if (step === 'request' && turnstileRef.current && (window as any).turnstile) {
      (window as any).turnstile.render(turnstileRef.current, {
        sitekey: (process.env as any).CLOUDFLARE_TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        'expired-callback': () => {
          setTurnstileToken(null);
        },
        'error-callback': () => {
          setTurnstileToken(null);
          setError({ message: "人机验证服务异常，请刷新重试 (Turnstile Error)", code: "T_ERR" });
        }
      });
    }
  }, [step, activeTab]);

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError(null);
    try {
      const { error: googleErr } = await authApi.signInWithGoogle();
      if (googleErr) throw googleErr;
    } catch (err: any) {
      setError({ message: err.message || "GOOGLE_HANDSHAKE_ERROR", code: "G_FAIL" });
      setIsGoogleLoading(false);
    }
  };

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || !turnstileToken) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'otp') {
        const { error: otpErr } = await authApi.sendOTP(email.trim(), turnstileToken);
        if (otpErr) throw otpErr;
        setStep('verify');
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken);
        if (signUpErr) throw signUpErr;
        setStep('verify');
        setActiveTab('otp');
      }
    } catch (err: any) {
      const isRateLimit = err.status === 429 || err.message?.toLowerCase().includes('rate limit');
      const isProviderError = err.message?.toLowerCase().includes('provider');
      
      let msg = err.message || "PROTOCOL_SYNC_FAILED";
      if (isRateLimit) {
        msg = lang === 'zh' 
          ? "节点频率限制：邮件服务器正在冷却。请等待 60 秒或使用 Google/沙盒模式。" 
          : "NODE THROTTLED: Mail server is cooling down. Please wait 60s or use Google/Sandbox.";
      } else if (isProviderError) {
        msg = lang === 'zh'
          ? "邮件网关不可用：请尝试使用 Google 登录。"
          : "MAIL GATEWAY OFFLINE: Please attempt Google Authorization.";
      }

      setError({ 
        message: msg,
        isRateLimit,
        code: err.status?.toString()
      });
      setIsProcessing(false);
      
      // 出错时重置 Turnstile
      if ((window as any).turnstile) (window as any).turnstile.reset();
      setTurnstileToken(null);
    } finally {
      if (step === 'request' && activeTab !== 'otp' && activeTab !== 'join') {
        setIsProcessing(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: verifyErr } = await authApi.verifyOTP(email, token);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError({ message: err.message || "INVALID_SECURITY_TOKEN", code: "V_ERR" });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-hidden">
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col items-center text-center mb-8 space-y-6"
      >
        <div className="relative p-6 bg-indigo-500/5 rounded-[3rem] border border-white/5 shadow-2xl">
          <Logo size={80} animated={true} className="mx-auto" />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">SomnoAI <span className="text-indigo-500">Sleep Lab</span></h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[9px] tracking-[0.8em] italic">SECURE ACCESS NODE • V3.3</p>
        </div>
      </m.div>

      <div className="w-full max-w-[420px] space-y-6 relative z-10">
        {step === 'request' ? (
          <>
            <button 
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className={`w-full py-5 rounded-full bg-white text-black font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-200 transition-all active:scale-95 disabled:opacity-50 group ${error?.isRateLimit ? 'ring-2 ring-indigo-500 animate-pulse' : ''}`}
            >
              {isGoogleLoading ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} className="group-hover:rotate-12 transition-transform" />}
              {error?.isRateLimit ? "BYPASS TO GOOGLE LOGIN" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-white/5" />
              <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">OR USE TERMINAL</span>
              <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="bg-slate-900/60 p-1.5 rounded-full border border-white/5 flex relative shadow-inner">
              {['login', 'join', 'otp'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab as any); setError(null); setTurnstileToken(null); }}
                  className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'otp' ? 'Magic' : tab}
                </button>
              ))}
              <m.div 
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-indigo-600 rounded-full shadow-lg"
                animate={{ x: activeTab === 'login' ? '0%' : activeTab === 'join' ? '100%' : '200%' }}
              />
            </div>

            <form onSubmit={handleAuthAction} className="space-y-4">
              <div className="space-y-3">
                {activeTab === 'join' && (
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner" required />
                {activeTab !== 'otp' && (
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}
              </div>

              {/* Turnstile Widget */}
              <div className="flex justify-center py-2 min-h-[65px]">
                <div ref={turnstileRef} className="cf-turnstile"></div>
              </div>

              <AnimatePresence>
                {error && (
                  <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className={`p-5 rounded-[2rem] border flex flex-col gap-3 ${error.isRateLimit ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    <div className="flex gap-4 items-start">
                      <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                      <p className="text-[10px] font-black uppercase italic tracking-wide leading-relaxed">{error.message}</p>
                    </div>
                    {error.isRateLimit && (
                      <button 
                        type="button" 
                        onClick={() => setError(null)}
                        className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors self-end"
                      >
                        <RefreshCw size={10} /> Reset Connection
                      </button>
                    )}
                  </m.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={isProcessing || !turnstileToken} 
                className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:opacity-40"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (turnstileToken ? <Zap size={18} fill="currentColor" /> : <Shield size={18} />)}
                <span>{isProcessing ? "SYNCHRONIZING" : (turnstileToken ? "ESTABLISH LINK" : "PENDING VERIFICATION")}</span>
              </button>
            </form>

            <button onClick={onGuest} className="w-full py-4 border border-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/5 transition-all">
              <FlaskConical size={14} /> Bypass to Sandbox Mode
            </button>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10" >
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Verify Identity</h3>
              <div className="inline-block px-6 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full">
                <p className="text-[9px] text-indigo-400 font-black uppercase tracking-widest truncate max-w-[200px]">{email.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex justify-between gap-3 px-2">
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value.slice(-1);
                  setOtp(newOtp);
                  if (e.target.value && idx < 5) otpRefs.current[idx + 1]?.focus();
                }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} className="w-12 h-16 bg-[#050a1f] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all shadow-inner" />
              ))}
            </div>
            
            <div className="space-y-4">
              <button onClick={handleVerifyOtp} disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all hover:bg-indigo-500">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                <span>AUTHORIZE ACCESS</span>
              </button>
              <button onClick={() => { setStep('request'); setError(null); setIsProcessing(false); setTurnstileToken(null); }} className="w-full text-[9px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3 transition-colors">
                <ChevronLeft size={14} /> Back to Terminal
              </button>
            </div>
          </m.div>
        )}
      </div>
    </div>
  );
};
