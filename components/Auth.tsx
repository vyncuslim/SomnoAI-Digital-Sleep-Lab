import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, Mail, Lock, User, Clock, Info, ShieldCheck, RefreshCw, Terminal, ArrowRight, ShieldAlert, Key, CheckCircle2, Send, Fingerprint, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi, logAuditLog } from '../services/supabaseService.ts';
import { safeNavigatePath } from '../services/navigation.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh' | 'es';
  onLogin: () => void;
  onGuest: () => void; 
  initialTab?: 'login' | 'signup' | 'otp';
}

const LabVisualSide = ({ isZh }: { isZh: boolean }) => (
  <div className="hidden lg:flex flex-col justify-center items-start p-24 w-6/12 relative bg-[#01040a] border-r border-white/5 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:60px_60px] opacity-[0.2]" />
    <m.div 
      animate={{ 
        scale: [1, 1.15, 1],
        opacity: [0.1, 0.25, 0.1]
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 blur-[200px] rounded-full" 
    />
    
    <m.div initial={{ opacity: 0, x: -60 }} animate={{ opacity: 1, x: 0 }} className="space-y-16 relative z-10">
      <div className="relative group">
         <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity" />
         <Logo size={200} animated={true} className="relative z-10" />
      </div>
      
      <div className="space-y-8">
         <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
            <Activity size={16} className="text-indigo-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase text-indigo-400 tracking-[0.5em] italic">Identity Calibration Ingress</span>
         </div>
         <h1 className="text-[7rem] md:text-[10rem] font-black italic tracking-tighter text-white uppercase leading-[0.78] drop-shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
           Code is<br/><span className="text-indigo-600">The Ring</span>
         </h1>
      </div>
      
      <p className="text-3xl text-slate-500 font-bold italic max-w-xl leading-relaxed border-l-8 border-indigo-600/40 pl-12 py-6">
         {isZh ? "SomnoAI 解构生物遥测。我们认为，最强大的戒指是不存在的戒指。" : "Decoding biological telemetry. We believe the most powerful ring is the one you don't have to wear."}
      </p>
      
      <div className="flex items-center gap-16 opacity-20 pt-10">
         <div className="flex items-center gap-4 group">
            <ShieldCheck size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">QUANTUM_SECURE</span>
         </div>
         <div className="flex items-center gap-4 group">
            <Terminal size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">PROTO_NODE_v4.8</span>
         </div>
      </div>
    </m.div>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'otp'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{message: string; isRateLimit?: boolean} | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [otpCooldown, setOtpCooldown] = useState(0);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isZh = lang === 'zh';
  const isLogin = activeTab === 'login';
  const isOTP = activeTab === 'otp';

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  useEffect(() => {
    if (otpCooldown > 0) {
      const timer = setTimeout(() => setOtpCooldown(otpCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpCooldown]);

  useEffect(() => {
    const SITE_KEY = '0x4AAAAAACNi1FM3bbfW_VsI'; 
    const initTurnstile = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (token: string) => setTurnstileToken(token)
        });
      }
    };
    const timer = setTimeout(initTurnstile, 600);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken || undefined);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'signup') {
        const { data, error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken || undefined);
        if (signUpErr) throw signUpErr;
        setSuccessMsg(isZh ? `同步码已发送至：${email}` : `Sync token dispatched to: ${email}`);
        setActiveTab('otp');
        setOtpCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
        setCooldown(60);
        setError({ message: isZh ? "请求过于频繁。请 60 秒后再试。" : "Rate limit exceeded. Retry in 60s.", isRateLimit: true });
      } else {
        setError({ message: msg || (isZh ? "通信故障。请重试。" : "Handshake failure. Please retry.") });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendOTP = async () => {
    if (otpCooldown > 0 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: resendErr } = await (authApi as any).resend(email.trim(), 'signup');
      if (resendErr) throw resendErr;
      setSuccessMsg(isZh ? "验证信号已重新发射。" : "Verification signal re-dispatched.");
      setOtpCooldown(60);
      logAuditLog('OTP_RESEND_REQUEST', `Node: ${email}`, 'INFO');
    } catch (err: any) {
      setError({ message: err.message || "Dispatch failed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: verifyErr } = await authApi.verifyOTP(email.trim(), token, 'signup');
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError({ message: err.message || (isZh ? "验证码无效或已过期。" : "Verification token void or expired.") });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#01040a] font-sans relative overflow-hidden w-full selection:bg-indigo-500/40 selection:text-white">
      <LabVisualSide isZh={isZh} />

      <div className="flex-1 flex flex-col items-center justify-center p-12 md:p-24 relative overflow-y-auto bg-slate-950/40 backdrop-blur-3xl">
        <div className="lg:hidden mb-20"><Logo size={100} animated={true} /></div>
        
        <m.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full max-w-[540px] space-y-16">
          <div className="text-center lg:text-left space-y-4">
             <h2 className="text-6xl font-black italic text-white uppercase tracking-tighter drop-shadow-2xl">
               {isOTP ? (isZh ? '验证节点' : 'Verify Node') : isLogin ? (isZh ? '访问终端' : 'Access Hub') : (isZh ? '注册受试者' : 'Register Subject')}
             </h2>
             <p className="text-xs font-black text-slate-600 uppercase tracking-[0.8em] italic">
               {isOTP ? (isZh ? '输入发送至邮箱的验证令牌' : 'INPUT DISPATCHED TOKEN') : 'SOMNOAI NEURAL GRID ADMISSION'}
             </p>
          </div>

          <div className="space-y-14">
            {!isOTP && (
              <>
                <button 
                  onClick={() => authApi.signInWithGoogle()}
                  className="w-full py-10 rounded-[2.5rem] bg-white/5 border border-white/10 text-white font-black text-[13px] uppercase tracking-[0.4em] flex items-center justify-center gap-8 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all italic shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] group relative overflow-hidden"
                >
                  <Chrome size={32} className="text-indigo-400 relative z-10 group-hover:rotate-12 transition-transform" />
                  <span className="relative z-10">{isLogin ? (isZh ? '通过 GOOGLE 执行' : 'EXECUTE VIA GOOGLE') : (isZh ? '绑定 GOOGLE 身份' : 'BIND GOOGLE IDENTITY')}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </button>

                <div className="flex items-center gap-10 opacity-10">
                   <div className="h-px flex-1 bg-white" /><span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Secure Relay</span><div className="h-px flex-1 bg-white" />
                </div>
              </>
            )}

            <AnimatePresence mode="wait">
              {successMsg && (
                <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={32} />
                  <p className="text-sm font-black text-emerald-400 uppercase tracking-widest italic">{successMsg}</p>
                </m.div>
              )}
              {error && (
                <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] flex items-center gap-5 shadow-2xl">
                   <AlertCircle className="text-rose-500 shrink-0" size={32} />
                   <p className="text-sm font-bold text-rose-400 uppercase tracking-widest italic">{error.message}</p>
                </m.div>
              )}
            </AnimatePresence>

            {isOTP ? (
              <form onSubmit={handleVerifyOTP} className="space-y-16">
                <div className="flex justify-between gap-4 md:gap-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => otpRefs.current[idx] = el}
                      type="text" maxLength={1} value={digit}
                      onChange={(e) => {
                        if (!/^\d*$/.test(e.target.value)) return;
                        const newOtp = [...otp];
                        newOtp[idx] = e.target.value.slice(-1);
                        setOtp(newOtp);
                        if (e.target.value && idx < 5) otpRefs.current[idx + 1]?.focus();
                      }}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-14 h-20 md:w-16 md:h-24 bg-slate-950 border border-white/10 rounded-3xl text-center text-4xl font-black text-white focus:border-indigo-500 outline-none transition-all shadow-inner hover:border-indigo-500/50"
                      required
                    />
                  ))}
                </div>
                
                <div className="space-y-8">
                  <button type="submit" disabled={isProcessing || otp.join('').length < 6} className={`w-full py-10 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl flex items-center justify-center gap-6 transition-all italic ${otp.join('').length < 6 ? 'bg-slate-900 text-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}>
                    {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <ShieldCheck size={32} />}
                    <span>{isZh ? '建立同步' : 'ESTABLISH LINK'}</span>
                  </button>
                  <button type="button" onClick={handleResendOTP} disabled={otpCooldown > 0 || isProcessing} className={`w-full text-center text-[11px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-3 ${otpCooldown > 0 ? 'text-slate-800 cursor-not-allowed' : 'text-indigo-400 hover:text-white'}`}>
                    <Send size={14} /> {otpCooldown > 0 ? `${isZh ? '冷却' : 'COOLDOWN'} (${otpCooldown}S)` : (isZh ? '重发令牌' : 'RE-DISPATCH')}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuthAction} className="space-y-10">
                 {!isLogin && (
                   <div className="relative group">
                     <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><User size={24} /></div>
                     <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isZh ? "受试者代号" : "Subject Callsign"} className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-10 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                   </div>
                 )}
                 
                 <div className="relative group">
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Mail size={24} /></div>
                   <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isZh ? "节点标识 (Email)" : "Node ID (Email)"} className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-10 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                 </div>

                 <div className="relative group">
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Lock size={24} /></div>
                   <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isZh ? "通行密匙" : "Access Token"} className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-24 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors">
                     {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                   </button>
                 </div>

                 <div ref={turnstileRef} className="flex justify-center py-4 opacity-70 hover:opacity-100 transition-opacity" />

                 <button type="submit" disabled={isProcessing || cooldown > 0} className={`w-full py-10 rounded-full font-black text-sm uppercase tracking-[0.6em] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-6 italic ${cooldown > 0 ? 'bg-slate-900 text-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}>
                   {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Zap size={32} fill="currentColor" />}
                   <span>{cooldown > 0 ? `COOLDOWN (${cooldown}S)` : isLogin ? 'START SESSION' : 'REGISTER NODE'}</span>
                 </button>
              </form>
            )}

            {!isOTP && (
              <div className="text-center lg:text-left pt-6">
                 <p className="text-sm font-bold text-slate-600 uppercase tracking-widest italic">
                   {isLogin ? (isZh ? "尚未获得实验室准入？" : "NEW SUBJECT? ") : (isZh ? "已有注册节点？" : "LEGACY NODE? ")}
                   <button type="button" onClick={() => setActiveTab(isLogin ? 'signup' : 'login')} className="text-indigo-400 underline underline-offset-8 ml-6 hover:text-white transition-all font-black">
                     {isLogin ? (isZh ? '申请入口' : 'APPLY FOR ACCESS') : (isZh ? '执行会话' : 'EXECUTE SESSION')}
                   </button>
                 </p>
              </div>
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
};