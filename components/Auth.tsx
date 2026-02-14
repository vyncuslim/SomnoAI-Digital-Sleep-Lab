
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, Mail, Lock, User, Link2, Clock, Info, ShieldCheck, Sparkles, Microscope, Cpu
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
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const isZh = lang === 'zh';
  const isLogin = activeTab === 'login';

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
        setError({ 
          message: isZh 
            ? "请求过于频繁。请 60 秒后再试。" 
            : "Rate limit exceeded. Please retry in 60 seconds.",
          isRateLimit: true 
        });
      } else {
        setError({ message: msg || (isZh ? "登录失败。请重试。" : "Authentication failed. Please retry.") });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#01040a] font-sans relative overflow-x-hidden text-center w-full">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] bg-indigo-600/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay pointer-events-none" />

      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col items-center mb-10 space-y-12 max-w-xl relative z-10 w-full"
      >
        <div className="space-y-10 w-full">
          <Logo size={100} animated={true} className="mx-auto" />
          
          {/* Mission Brief Card - Redesigned for impact */}
          <div className="bg-slate-950/60 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-12 space-y-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden group text-left">
            <div className="absolute top-0 right-0 p-10 opacity-[0.03] text-indigo-400 group-hover:rotate-12 transition-transform duration-1000">
              <Microscope size={180} />
            </div>
            
            <div className="space-y-8">
              <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                 <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500 shadow-inner">
                    <Cpu size={18} className="animate-pulse" />
                 </div>
                 <h3 className="text-[12px] font-black uppercase text-white tracking-[0.4em] italic">{isZh ? '实验室使命' : 'Mission Brief'}</h3>
              </div>
              <p className="text-2xl md:text-3xl text-slate-200 italic leading-[1.2] font-black uppercase tracking-tighter drop-shadow-xl">
                {isZh 
                  ? "它将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验室体验。" 
                  : "Integrating physiological monitoring, deep AI insights, and tailored health protocols into a unified digital laboratory."}
              </p>
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Neural Ingress Protocol: Nominal</span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-emerald-500" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Secure Ingress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Neural Link</span>
                  </div>
               </div>
               
               <button 
                onClick={() => safeNavigatePath('about')}
                className="group/btn flex items-center gap-2 px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest hover:bg-white/10 transition-all italic shadow-2xl"
              >
                <Info size={16} className="text-indigo-400 group-hover/btn:rotate-12 transition-transform" />
                {isZh ? '查看文档' : 'Documentation'}
              </button>
            </div>
          </div>
        </div>
      </m.div>

      {/* Auth Entry Interface */}
      <div className="w-full max-w-[440px] space-y-12 relative z-10">
        <button 
          onClick={() => authApi.signInWithGoogle()}
          className="w-full py-7 rounded-full bg-white text-black font-black text-[13px] uppercase tracking-widest flex items-center justify-center gap-5 shadow-[0_30px_60px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all italic"
        >
          <Chrome size={24} />
          {isLogin ? (isZh ? '使用 Google 登录' : 'Sign in with Google') : (isZh ? '使用 Google 注册' : 'Sign up with Google')}
        </button>

        <div className="flex items-center gap-6 opacity-10 px-8">
          <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black text-white uppercase tracking-widest italic">Direct Terminal</span><div className="h-px flex-1 bg-white" />
        </div>

        <form onSubmit={handleAuthAction} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative group">
                <User className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={22} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isZh ? "受试者姓名" : "Subject Name"} className="w-full bg-slate-900/40 border border-white/5 rounded-full pl-16 pr-10 py-7 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner" required />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={22} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isZh ? "识别码 (邮箱)" : "Identifier (Email)"} className="w-full bg-slate-900/40 border border-white/5 rounded-full pl-16 pr-10 py-7 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={22} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isZh ? "实验室通行证" : "Laboratory Access Pass"} className="w-full bg-slate-900/40 border border-white/5 rounded-full pl-16 pr-24 py-7 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors">
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <div ref={turnstileRef} className="flex justify-center min-h-[65px] opacity-80"></div>

          <button 
            type="submit" disabled={isProcessing || cooldown > 0}
            className={`w-full py-8 rounded-full font-black text-[14px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-5 transition-all italic ${cooldown > 0 ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20 active:scale-[0.98]'}`}
          >
            {isProcessing ? <Loader2 className="animate-spin" size={24} /> : cooldown > 0 ? <Clock size={24} /> : <Zap size={24} fill="currentColor" />}
            <span>
              {cooldown > 0 
                ? (isZh ? `系统冷却 (${cooldown}S)` : `COOLDOWN (${cooldown}S)`)
                : isLogin ? (isZh ? '初始化连接' : 'Initiate Session') : (isZh ? '注册节点' : 'Register Node')
              }
            </span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-8 pt-4">
          <p className="text-[12px] font-bold text-slate-600 uppercase tracking-widest italic">
            {isLogin ? (isZh ? "首次接入？" : "New Node? ") : (isZh ? "已有标识符？" : "Legacy Identity? ")}
            <button type="button" onClick={() => {
              const nextTab = isLogin ? 'signup' : 'login';
              setActiveTab(nextTab);
              setError(null);
              window.history.pushState(null, '', `/${nextTab}`);
            }} className="text-indigo-400 underline underline-offset-4 ml-3 hover:text-indigo-300 font-black">
              {isLogin ? (isZh ? '立即注册' : 'Sign Up') : (isZh ? '立即登录' : 'Sign In')}
            </button>
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className={`p-10 border rounded-[3.5rem] text-left flex items-start gap-8 ${error.isRateLimit ? 'bg-amber-500/5 border-amber-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}
            >
              <AlertCircle className={error.isRateLimit ? 'text-amber-500 shrink-0 mt-1' : 'text-rose-500 shrink-0 mt-1'} size={28} />
              <div className="space-y-3">
                <p className={`text-[12px] font-black uppercase italic leading-relaxed ${error.isRateLimit ? 'text-amber-400' : 'text-rose-400'}`}>{error.message}</p>
                <button onClick={() => window.location.reload()} className={`text-[11px] font-black underline uppercase tracking-widest ${error.isRateLimit ? 'text-amber-300' : 'text-rose-300'}`}>Refresh Gateway</button>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-24 flex flex-col items-center gap-5 opacity-30 text-[10px] font-black uppercase tracking-[0.6em] text-slate-600 italic">
         <div className="flex items-center gap-4 px-8 py-3 bg-indigo-500/5 border border-indigo-500/10 rounded-full text-indigo-400/70">
            <Link2 size={14} /> Encrypted Node Bridge Active
         </div>
         <p>@2026 SomnoAI Laboratory Hub</p>
      </footer>
    </div>
  );
};
