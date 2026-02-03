
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, ShieldCheck, ArrowLeft, Mail, Lock, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';

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
  const [error, setError] = useState<{message: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  const isZh = lang === 'zh';
  const isLogin = activeTab === 'login';

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
    setTimeout(initTurnstile, 500);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
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
        setError({ message: isZh ? "注册成功！请检查邮箱中的验证链接。" : "Welcome! Please check your email to verify your registry." });
      }
    } catch (err: any) {
      setError({ message: err.message || (isZh ? "无法建立连接，请稍后再试。" : "Connection failed. Please retry.") });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-x-hidden text-left">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-12 space-y-6">
        <button onClick={() => window.location.href = '/'} className="p-3 rounded-full bg-white/5 border border-white/10 text-slate-500 hover:text-white transition-all mb-4">
           <ArrowLeft size={18} />
        </button>
        <Logo size={80} animated={true} />
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
            {isLogin ? (isZh ? '登录实验室' : 'Welcome Back') : (isZh ? '创建账号' : 'Join SomnoAI')}
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] mt-4 italic">
            {isZh ? '数字化睡眠实验室 • 安全加密访问' : 'Secure Digital Laboratory Access'}
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[420px] space-y-10 relative z-10">
        <button 
          onClick={() => authApi.signInWithGoogle()}
          className="w-full py-6 rounded-full bg-white text-black font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-4 shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
        >
          <Chrome size={20} />
          {isLogin ? (isZh ? '使用 Google 登录' : 'Continue with Google') : (isZh ? '使用 Google 注册' : 'Sign up with Google')}
        </button>

        <div className="flex items-center gap-4 opacity-20">
          <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black text-white">OR</span><div className="h-px flex-1 bg-white" />
        </div>

        <form onSubmit={handleAuthAction} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isZh ? "真实姓名" : "Your Full Name"} className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-16 pr-10 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isZh ? "电子邮箱" : "Email Address"} className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-16 pr-10 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isZh ? "访问密码" : "Password"} className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div ref={turnstileRef} className="flex justify-center min-h-[65px]"></div>

          <button 
            type="submit" disabled={isProcessing}
            className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all hover:bg-indigo-500 disabled:opacity-40 italic"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
            <span>{isLogin ? (isZh ? '进入实验室' : 'Login to Lab') : (isZh ? '完成注册' : 'Create Registry')}</span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-6 pt-4">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
            {isLogin ? (isZh ? "还没有账号？" : "New to SomnoAI? ") : (isZh ? "已有账号？" : "Already registered? ")}
            <button type="button" onClick={() => {
              setActiveTab(isLogin ? 'signup' : 'login');
              window.history.pushState(null, '', isLogin ? '/signup' : '/login');
            }} className="text-indigo-400 underline underline-offset-4 ml-2">
              {isLogin ? (isZh ? '立即注册' : 'Sign Up') : (isZh ? '去登录' : 'Sign In')}
            </button>
          </p>
          <button onClick={onGuest} className="text-slate-800 text-[10px] font-black uppercase tracking-[0.5em] hover:text-slate-500 transition-colors italic">Sandbox Override</button>
        </div>

        {error && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[2.5rem] flex items-start gap-4">
            <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
            <p className="text-[10px] font-bold text-rose-400 uppercase italic leading-relaxed">{error.message}</p>
          </m.div>
        )}
      </div>

      <footer className="mt-24 opacity-20 flex items-center gap-3">
         <ShieldCheck size={14} className="text-emerald-500" />
         <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600">End-to-End Encrypted Secure Link</span>
      </footer>
    </div>
  );
};
