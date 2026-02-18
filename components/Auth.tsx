
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, Mail, Lock, User, Link2, Clock, Info, ShieldCheck, Sparkles, Microscope, Cpu, ArrowRight, Command, ShieldAlert, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';
import { safeNavigatePath } from '../services/navigation.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh' | 'es';
  onLogin: () => void;
  onGuest: () => void; 
  initialTab?: 'login' | 'signup' | 'otp';
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'otp'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{message: string; isRateLimit?: boolean} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isSecure, setIsSecure] = useState(true);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const isZh = lang === 'zh';
  const isLogin = activeTab === 'login';

  useEffect(() => {
    // Protocol Guard: Validate Secure Context
    const secure = window.isSecureContext && window.location.protocol === 'https:';
    setIsSecure(secure);
    if (!secure && window.location.hostname !== 'localhost') {
      setError({ message: isZh ? "连接不安全：Google 登录需要 HTTPS 加密协议。请检查您的域名 SSL 配置。" : "Insecure Protocol: Google Login requires HTTPS. Check SSL configuration." });
    }
  }, [isZh]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

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
    const timer = setTimeout(initTurnstile, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken || undefined);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'signup') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken || undefined);
        if (signUpErr) throw signUpErr;
        setError({ message: isZh ? "注册成功！请检查邮箱中的验证链接。" : "Registry created! Please verify your email to activate your lab access." });
      }
    } catch (err: any) {
      const msg = err.message || "";
      const isRateLimit = msg.toLowerCase().includes('rate limit') || err.status === 429;
      
      if (isRateLimit) {
        setCooldown(60);
        setError({ message: isZh ? "请求过于频繁。请 60 秒后再试。" : "Rate limit exceeded. Retry in 60s.", isRateLimit: true });
      } else {
        setError({ message: msg || (isZh ? "登录失败。请重试。" : "Authentication failed. Please retry.") });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!isSecure && window.location.hostname !== 'localhost') {
      window.location.href = window.location.href.replace('http:', 'https:');
      return;
    }
    await authApi.signInWithGoogle();
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#01040a] font-sans relative overflow-hidden w-full">
      {/* Visual Side */}
      <div className="hidden lg:flex flex-col justify-center items-start p-24 w-1/2 relative bg-[#020617] border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.2]" />
        <div className="absolute top-0 left-0 w-full h-full bg-indigo-600/5 blur-[120px] rounded-full" />
        
        <m.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-12 relative z-10">
          <Logo size={120} animated={true} />
          <div className="space-y-4">
             <div className="inline-flex items-center gap-3 px-4 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.4em] italic">Neural Ingress v9.2</span>
             </div>
             <h1 className="text-[8rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
               Engineer<br/><span className="text-indigo-600">Recovery</span>
             </h1>
          </div>
          <p className="text-2xl text-slate-400 font-bold italic max-w-xl leading-relaxed border-l-4 border-indigo-600/30 pl-10">
             {isZh ? "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体。" : "Advanced sleep architecture analysis. Sync wearable telemetry with Google Gemini models."}
          </p>
          <div className="flex items-center gap-10 opacity-30 pt-10">
             <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">SECURE_AUTH</span>
             </div>
             <div className="flex items-center gap-3">
                <Zap size={20} className="text-indigo-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">REALTIME_SYNC</span>
             </div>
          </div>
        </m.div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-y-auto">
        <div className="lg:hidden mb-12"><Logo size={80} animated={true} /></div>
        
        <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[480px] space-y-12">
          {!isSecure && window.location.hostname !== 'localhost' && (
            <m.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-rose-600/10 border border-rose-500/40 rounded-3xl flex items-center gap-4 shadow-[0_0_40px_rgba(225,29,72,0.1)]">
               <ShieldAlert className="text-rose-500 shrink-0" size={32} />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Protocol Warning</p>
                  <p className="text-xs text-rose-200 italic font-bold">Unsecured Handshake. Redirecting to HTTPS node...</p>
               </div>
               <button onClick={() => window.location.href = window.location.href.replace('http:', 'https:')} className="ml-auto p-2 bg-rose-600 text-white rounded-xl active:scale-90 transition-all"><RefreshCw size={16} /></button>
            </m.div>
          )}

          <div className="text-center lg:text-left space-y-2">
             <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">{isLogin ? 'Access Terminal' : 'Register Node'}</h2>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Initialize Secure Neural Link</p>
          </div>

          <div className="space-y-10">
            <button 
              onClick={handleGoogleLogin}
              className="w-full py-7 rounded-full bg-white/5 border border-white/10 text-white font-black text-[13px] uppercase tracking-[0.2em] flex items-center justify-center gap-5 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all italic shadow-2xl"
            >
              <Chrome size={22} className="text-indigo-400" />
              {isLogin ? (isZh ? '使用 Google 登录' : 'Enter via Google') : (isZh ? '使用 Google 注册' : 'Sync via Google')}
            </button>

            <div className="flex items-center gap-8 opacity-10">
               <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black uppercase tracking-widest italic">Direct Ingress</span><div className="h-px flex-1 bg-white" />
            </div>

            {error && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                 <AlertCircle className="text-rose-500 shrink-0" size={18} />
                 <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest leading-relaxed italic">{error.message}</p>
              </m.div>
            )}

            <form onSubmit={handleAuthAction} className="space-y-6">
               {!isLogin && (
                 <div className="group relative">
                   <User className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                   <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isZh ? "受试者姓名" : "Subject Callsign"} className="w-full bg-slate-950 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/40 font-bold italic shadow-inner" required />
                 </div>
               )}
               <div className="group relative">
                 <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                 <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isZh ? "识别码 (邮箱)" : "Identifier (Email)"} className="w-full bg-slate-950 border border-white/5 rounded-full pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/40 font-bold italic shadow-inner" required />
               </div>
               <div className="group relative">
                 <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={20} />
                 <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isZh ? "实验室通行证" : "Access Pass"} className="w-full bg-slate-950 border border-white/5 rounded-full pl-16 pr-20 py-6 text-sm text-white outline-none focus:border-indigo-500/40 font-bold italic shadow-inner" required />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>

               <div ref={turnstileRef} className="flex justify-center min-h-[70px] opacity-80" />

               <button 
                 type="submit" disabled={isProcessing || cooldown > 0}
                 className={`w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-5 transition-all italic ${cooldown > 0 ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]'}`}
               >
                 {isProcessing ? <Loader2 className="animate-spin" size={22} /> : cooldown > 0 ? <Clock size={22} /> : <Zap size={22} fill="currentColor" />}
                 <span>{cooldown > 0 ? `COOLDOWN (${cooldown}S)` : isLogin ? 'Execute Session' : 'Bind Node'}</span>
               </button>
            </form>

            <div className="text-center space-y-8">
               <p className="text-[12px] font-bold text-slate-600 uppercase tracking-widest italic">
                 {isLogin ? (isZh ? "尚未注册？" : "New Node? ") : (isZh ? "已有标识符？" : "Legacy Identity? ")}
                 <button type="button" onClick={() => setActiveTab(isLogin ? 'signup' : 'login')} className="text-indigo-400 underline underline-offset-8 ml-4 hover:text-white transition-colors font-black">
                   {isLogin ? (isZh ? '创建实验室权限' : 'Register Access') : (isZh ? '连接终端' : 'Initiate Link')}
                 </button>
               </p>
               <button onClick={() => safeNavigatePath('about')} className="text-[9px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-[0.4em] italic flex items-center justify-center gap-3 mx-auto">
                 <Info size={14} /> Documentation & Protocol Archive
               </button>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
};
