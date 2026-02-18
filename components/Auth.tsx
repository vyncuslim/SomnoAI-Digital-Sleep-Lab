import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, Mail, Lock, User, Clock, Info, ShieldCheck, RefreshCw, Terminal, ArrowRight, ShieldAlert
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
    const secure = window.isSecureContext && window.location.protocol === 'https:';
    setIsSecure(secure || window.location.hostname === 'localhost');
    if (!secure && window.location.hostname !== 'localhost') {
      setError({ message: isZh ? "连接不安全：Google 登录需要 HTTPS。请点击修复按钮。" : "Insecure Protocol: Google Login requires HTTPS. Use the restore button." });
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
        setError({ message: isZh ? "注册成功！请检查邮箱验证。" : "Success! Verify your email to activate lab access." });
      }
    } catch (err: any) {
      const msg = err.message || "";
      if (msg.toLowerCase().includes('rate limit') || err.status === 429) {
        setCooldown(60);
        setError({ message: isZh ? "频率过高。请 60s 后重试。" : "Rate limit. Retry in 60s.", isRateLimit: true });
      } else {
        setError({ message: msg || (isZh ? "验证失败。请重试。" : "Auth failed. Please retry.") });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#01040a] font-sans relative overflow-hidden w-full">
      {/* Dynamic Left Panel */}
      <div className="hidden lg:flex flex-col justify-center items-start p-24 w-5/12 relative bg-[#020617] border-r border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.2]" />
        <m.div 
          animate={{ opacity: [0.05, 0.1, 0.05] }} 
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-0 left-0 w-full h-full bg-indigo-600/10 blur-[150px] rounded-full" 
        />
        
        <m.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="space-y-16 relative z-10">
          <Logo size={140} animated={true} />
          <div className="space-y-6">
             <div className="inline-flex items-center gap-3 px-5 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase text-indigo-400 tracking-[0.4em] italic">Laboratory Protocol Ingress</span>
             </div>
             <h1 className="text-8xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
               Engineer<br/><span className="text-indigo-600">Recovery</span>
             </h1>
          </div>
          <p className="text-2xl text-slate-400 font-bold italic max-w-xl leading-relaxed border-l-4 border-indigo-600/30 pl-10">
             {isZh ? "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体。" : "Synthesize biological telemetry into actionable recovery architecture."}
          </p>
          <div className="flex items-center gap-10 opacity-30 pt-10">
             <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-emerald-500" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">E2E_ENCRYPTED</span>
             </div>
             <div className="flex items-center gap-3">
                <Terminal size={20} className="text-indigo-400" />
                <span className="text-[11px] font-black text-white uppercase tracking-widest">SIGNAL_STABLE</span>
             </div>
          </div>
        </m.div>
      </div>

      {/* Right Form Side */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-16 relative overflow-y-auto">
        <div className="lg:hidden mb-16"><Logo size={80} animated={true} /></div>
        
        <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-[480px] space-y-12">
          {!isSecure && window.location.hostname !== 'localhost' && (
            <m.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-6 bg-rose-600/10 border border-rose-500/40 rounded-3xl flex items-center gap-4 shadow-xl">
               <ShieldAlert className="text-rose-500 shrink-0" size={32} />
               <div className="space-y-1">
                  <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Security Warning</p>
                  <p className="text-xs text-rose-200 italic font-bold">Unsecured Handshake. Redirecting to HTTPS...</p>
               </div>
               <button onClick={() => window.location.href = window.location.href.replace('http:', 'https:')} className="ml-auto p-2 bg-rose-600 text-white rounded-xl"><RefreshCw size={16} /></button>
            </m.div>
          )}

          <div className="text-center lg:text-left space-y-3">
             <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter">{isLogin ? 'Access Hub' : 'Bind Node'}</h2>
             <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] italic">Establish Neural Link Protocol</p>
          </div>

          <div className="space-y-12">
            {/* Google Login Enhanced */}
            <button 
              onClick={async () => await authApi.signInWithGoogle()}
              className="w-full py-7 rounded-full bg-white/5 border border-white/10 text-white font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-6 hover:bg-white/10 hover:scale-[1.02] active:scale-95 transition-all italic shadow-2xl"
            >
              <Chrome size={22} className="text-indigo-400" />
              {isLogin ? (isZh ? '使用 Google 执行会话' : 'EXECUTE VIA GOOGLE') : (isZh ? '通过 Google 绑定' : 'BIND VIA GOOGLE')}
            </button>

            <div className="flex items-center gap-8 opacity-10">
               <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black uppercase tracking-[0.3em] italic">Direct Relay</span><div className="h-px flex-1 bg-white" />
            </div>

            {error && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                 <AlertCircle className="text-rose-500 shrink-0" size={18} />
                 <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest italic">{error.message}</p>
              </m.div>
            )}

            <form onSubmit={handleAuthAction} className="space-y-8">
               {!isLogin && (
                 <div className="relative group">
                   <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><User size={20} /></div>
                   <input 
                     type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                     placeholder={isZh ? "受试者呼号" : "Subject Callsign"} 
                     className="w-full bg-slate-950/80 border border-white/5 rounded-full pl-18 pr-10 py-7 text-sm text-white focus:border-indigo-500/40 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required 
                   />
                 </div>
               )}
               <div className="relative group">
                 <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Mail size={20} /></div>
                 <input 
                   type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                   placeholder={isZh ? "节点标识符 (Email)" : "Node Identifier (Email)"} 
                   className="w-full bg-slate-950/80 border border-white/5 rounded-full pl-18 pr-10 py-7 text-sm text-white focus:border-indigo-500/40 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required 
                 />
               </div>
               <div className="relative group">
                 <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Lock size={20} /></div>
                 <input 
                   type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} 
                   placeholder={isZh ? "通行令牌 (Password)" : "Access Token (Password)"} 
                   className="w-full bg-slate-950/80 border border-white/5 rounded-full pl-18 pr-20 py-7 text-sm text-white focus:border-indigo-500/40 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required 
                 />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">
                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                 </button>
               </div>

               <div ref={turnstileRef} className="flex justify-center opacity-80" />

               <button 
                 type="submit" disabled={isProcessing || cooldown > 0}
                 className={`w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.5em] shadow-2xl flex items-center justify-center gap-5 transition-all italic ${cooldown > 0 ? 'bg-slate-900 text-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]'}`}
               >
                 {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <Zap size={24} fill="currentColor" />}
                 <span>{cooldown > 0 ? `COOLDOWN (${cooldown}S)` : isLogin ? 'Execute Session' : 'Bind Node'}</span>
               </button>
            </form>

            <div className="text-center space-y-10">
               <p className="text-[12px] font-bold text-slate-600 uppercase tracking-widest italic">
                 {isLogin ? (isZh ? "没有准入权限？" : "NEW SUBJECT? ") : (isZh ? "已有标识符？" : "LEGACY NODE? ")}
                 <button type="button" onClick={() => setActiveTab(isLogin ? 'signup' : 'login')} className="text-indigo-400 underline underline-offset-8 ml-4 hover:text-white transition-colors font-black">
                   {isLogin ? (isZh ? '创建准入' : 'CREATE ACCESS') : (isZh ? '同步会话' : 'SYNC SESSION')}
                 </button>
               </p>
               <button onClick={() => safeNavigatePath('about')} className="text-[9px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-[0.5em] italic flex items-center justify-center gap-3 mx-auto">
                 <Info size={14} /> Documentation & Infrastructure Archive
               </button>
            </div>
          </div>
        </m.div>
      </div>
    </div>
  );
};