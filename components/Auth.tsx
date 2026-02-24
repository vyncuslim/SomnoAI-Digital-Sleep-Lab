import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle, Mail, Lock, User, Clock, Info, ShieldCheck, RefreshCw, Terminal, ArrowRight, ShieldAlert, Key, CheckCircle2, Send, Fingerprint, Activity, Radio
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
         <h1 className="text-[6.5rem] md:text-[9rem] font-black italic tracking-tighter text-white uppercase leading-[0.78] drop-shadow-[0_20px_80px_rgba(0,0,0,0.8)]">
           SomnoAI<br/><span className="text-indigo-600">Sleep Lab</span>
         </h1>
      </div>
      
      <p className="text-2xl text-slate-500 font-bold italic max-w-xl leading-relaxed border-l-8 border-indigo-600/40 pl-12 py-6">
         {isZh ? "解构生物遥测。我们认为，最强大的戒指是不存在的戒指。代码即是我们的核心。" : "Decoding biological telemetry. We believe the most powerful ring is the one you don't have to wear. Code is our core."}
      </p>
      
      <div className="flex items-center gap-16 opacity-20 pt-10">
         <div className="flex items-center gap-4 group">
            <ShieldCheck size={32} className="text-emerald-500 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">QUANTUM_SECURE</span>
         </div>
         <div className="flex items-center gap-4 group">
            <Terminal size={32} className="text-indigo-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">PROTO_NODE_v4.2</span>
         </div>
      </div>
    </m.div>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, initialTab = 'login' }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'otp' | 'magic_link'>(initialTab);
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
  const [authFlow, setAuthFlow] = useState<'signup' | 'magic_link' | null>(null);
  
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (!password) return 0;
    if (password.length >= 8) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^a-zA-Z0-9]/.test(password)) score += 1;
    return score;
  };

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const isZh = lang === 'zh';
  const isLogin = activeTab === 'login';
  const isOTP = activeTab === 'otp';
  const isMagicLink = activeTab === 'magic_link';

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



  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    
    if (!isValidEmail(email)) {
      setError({ message: isZh ? "邮箱格式无效。" : "Invalid email format." });
      return;
    }
    
    if (!isMagicLink && password.length < 6) {
      setError({ message: isZh ? "密码长度至少为 6 个字符。" : "Password must be at least 6 characters." });
      return;
    }
    
    setError(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    try {
      const token = await (window as any).grecaptcha.enterprise.execute('6Lean3UsAAAAAE4VcnRN95_r4bLK6wrYnduAFBDx', { action: activeTab });

      if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, token);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'signup') {
        const { data, error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, token);
        if (signUpErr) {
          if (signUpErr.message.includes('User already registered')) {
            throw new Error(isZh ? "该邮箱已注册。请直接登录。" : "Email already registered. Please login.");
          }
          throw signUpErr;
        }
        
        setSuccessMsg(isZh ? `验证令牌已分发至：${email}` : `Validation token dispatched to: ${email}`);
        setActiveTab('otp');
        setAuthFlow('signup');
        setOtpCooldown(90);
        setTimeout(() => otpRefs.current[0]?.focus(), 150);
      } else if (activeTab === 'magic_link') {
        const { error: magicErr } = await authApi.sendOTP(email.trim(), token);
        if (magicErr) throw magicErr;
        
        setSuccessMsg(isZh ? `魔法链接已分发至：${email}` : `Magic link dispatched to: ${email}`);
        setActiveTab('otp');
        setAuthFlow('magic_link');
        setOtpCooldown(90);
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
    setSuccessMsg(null);
    try {
      const token = await (window as any).grecaptcha.enterprise.execute('6Lean3UsAAAAAE4VcnRN95_r4bLK6wrYnduAFBDx', { action: 'resend_otp' });
      
      let resendErr;
      // Use authFlow if available, otherwise fallback to state-based detection
      const effectiveFlow = authFlow || (email && password ? 'signup' : 'magic_link');
      
      if (effectiveFlow === 'signup') {
        const res = await authApi.resend(email.trim(), 'signup');
        resendErr = res.error;
      } else {
        const res = await authApi.sendOTP(email.trim(), token);
        resendErr = res.error;
      }

      if (resendErr) throw resendErr;
      
      setSuccessMsg(isZh ? "令牌已重新分发。请检查您的收件箱（及垃圾邮件）。" : "Token re-dispatched. Please check your inbox (and spam).");
      setOtpCooldown(90); // Increased cooldown for safety
      logAuditLog('OTP_RESEND_REQUEST', `Node: ${email} | Flow: ${effectiveFlow}`, 'INFO');
    } catch (err: any) {
      console.error("OTP Resend Error:", err);
      setError({ message: err.message || (isZh ? "分发失败。请稍后再试。" : "Dispatch failed. Please try again later.") });
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
      // If it's magic link (no password/fullName provided during the flow), the type is 'email'
      // If it's signup, the type is 'signup'
      const isMagicLinkFlow = !password && !fullName;
      const type = isMagicLinkFlow ? 'email' : 'signup';
      
      const { error: verifyErr } = await authApi.verifyOTP(email.trim(), token, type);
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
               {isOTP ? (isZh ? '验证节点' : 'Verify Node') : isLogin ? (isZh ? '访问终端' : 'Access Hub') : isMagicLink ? (isZh ? '无密码访问' : 'Passwordless') : (isZh ? '注册受试者' : 'Register Subject')}
             </h2>
             <p className="text-xs font-black text-slate-600 uppercase tracking-[0.8em] italic">
               {isOTP ? (isZh ? '输入发送至邮箱的验证令牌' : 'INPUT DISPATCHED TOKEN') : isMagicLink ? (isZh ? '通过邮箱获取一次性令牌' : 'GET ONE-TIME TOKEN VIA EMAIL') : 'SOMNOAI NEURAL GRID ADMISSION'}
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
                  <span className="relative z-10">{isLogin ? (isZh ? '使用 Google 账号快捷登录' : 'LOGIN WITH GOOGLE') : isMagicLink ? (isZh ? '使用 Google 账号快捷登录' : 'LOGIN WITH GOOGLE') : (isZh ? '使用 Google 账号快捷注册' : 'SIGNUP WITH GOOGLE')}</span>
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Radio className="text-emerald-500 animate-pulse" size={24} />
                  </div>
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
                <div className="text-center space-y-4">
                  <h3 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                    {isZh ? '输入验证令牌' : 'INPUT AUTH TOKEN'}
                  </h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] italic">
                    {isZh ? '令牌已分发至您的神经节点' : 'TOKEN DISPATCHED TO YOUR NEURAL NODE'}
                  </p>
                </div>

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
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                          otpRefs.current[idx - 1]?.focus();
                        }
                      }}
                      className="w-14 h-20 md:w-16 md:h-24 bg-slate-950/80 border border-white/10 rounded-3xl text-center text-4xl font-black text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.8)] hover:border-indigo-500/50"
                      required
                    />
                  ))}
                </div>
                
                <div className="space-y-8">
                  <button type="submit" disabled={isProcessing || otp.join('').length < 6} className={`w-full py-12 rounded-full font-black text-sm uppercase tracking-[0.6em] shadow-[0_20px_50px_-10px_rgba(79,70,229,0.4)] flex items-center justify-center gap-6 transition-all italic ${otp.join('').length < 6 ? 'bg-slate-900 text-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}>
                    {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <ShieldCheck size={32} />}
                    <span>{isZh ? '建立同步' : 'ESTABLISH LINK'}</span>
                  </button>
                  <div className="flex flex-col gap-4">
                    <button type="button" onClick={handleResendOTP} disabled={otpCooldown > 0 || isProcessing} className={`w-full text-center text-[11px] font-black uppercase tracking-widest transition-all italic flex items-center justify-center gap-3 ${otpCooldown > 0 ? 'text-slate-800 cursor-not-allowed' : 'text-indigo-400 hover:text-white'}`}>
                      <Send size={14} /> {otpCooldown > 0 ? `${isZh ? '冷却' : 'COOLDOWN'} (${otpCooldown}S)` : (isZh ? '重新分发信号' : 'RE-DISPATCH SIGNAL')}
                    </button>
                    <button 
                      type="button" 
                      onClick={() => {
                        setActiveTab(authFlow === 'signup' ? 'signup' : 'login');
                        setAuthFlow(null);
                        setError(null);
                        setSuccessMsg(null);
                      }} 
                      className="w-full text-center text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all italic"
                    >
                      {isZh ? '← 返回修改邮箱' : '← BACK TO CORRECT EMAIL'}
                    </button>
                    <p className="text-center text-[10px] text-slate-500 italic">
                      {isZh ? '未收到邮件？请务必检查垃圾邮件文件夹。' : 'No email? Please ensure to check your spam folder.'}
                    </p>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAuthAction} className="space-y-10">
                 {(!isLogin && !isMagicLink) && (
                   <div className="relative group">
                     <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><User size={24} /></div>
                     <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={isZh ? "姓名 (Full Name)" : "Full Name"} className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-10 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                   </div>
                 )}
                 
                 <div className="relative group">
                   <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Mail size={24} /></div>
                   <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isZh ? "邮箱 (Email)" : "Email"} autoComplete="username" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-10 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                 </div>

                 {!isMagicLink && (
                   <div className="space-y-3">
                     {/* Hidden username field for accessibility/password managers */}
                     <input type="text" name="username" value={email} readOnly className="hidden" autoComplete="username" />
                     <div className="relative group">
                       <div className="absolute left-10 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors"><Lock size={24} /></div>
                       <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isZh ? "密码 (Password)" : "Password"} autoComplete={isLogin ? "current-password" : "new-password"} className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-22 pr-24 py-8 text-base text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800" required />
                       <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-10 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors">
                         {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                       </button>
                     </div>
                     {!isLogin && password && (
                       <div className="flex gap-2 px-6">
                         {[1, 2, 3, 4].map((level) => {
                           const strength = calculatePasswordStrength(password);
                           let colorClass = 'bg-white/10';
                           if (strength >= level) {
                             if (strength <= 2) colorClass = 'bg-rose-500';
                             else if (strength === 3) colorClass = 'bg-amber-500';
                             else colorClass = 'bg-emerald-500';
                           }
                           return <div key={level} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${colorClass}`} />;
                         })}
                       </div>
                     )}
                   </div>
                 )}



                 <m.button 
                   whileHover={{ scale: 1.02 }}
                   whileTap={{ scale: 0.98 }}
                   type="submit" 
                   disabled={isProcessing || cooldown > 0} 
                   className={`w-full py-10 rounded-full font-black text-sm uppercase tracking-[0.6em] shadow-[0_40px_100px_-20px_rgba(79,70,229,0.3)] transition-all flex items-center justify-center gap-6 italic ${cooldown > 0 ? 'bg-slate-900 text-slate-700' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'}`}
                 >
                   {isProcessing ? <Loader2 className="animate-spin" size={32} /> : <Zap size={32} fill="currentColor" />}
                   <span>{cooldown > 0 ? `COOLDOWN (${cooldown}S)` : isLogin ? (isZh ? '登录账号' : 'LOGIN / START SESSION') : isMagicLink ? (isZh ? '发送魔法链接' : 'SEND MAGIC LINK') : (isZh ? '注册账号' : 'SIGNUP / REGISTER NODE')}</span>
                 </m.button>
              </form>
            )}

            {!isOTP && (
              <div className="text-center lg:text-left pt-6 space-y-4">
                 <p className="text-sm font-bold text-slate-600 uppercase tracking-widest italic">
                   {isLogin ? (isZh ? "尚未获得实验室准入？" : "NEW SUBJECT? ") : isMagicLink ? (isZh ? "已有注册节点？" : "LEGACY NODE? ") : (isZh ? "已有注册节点？" : "LEGACY NODE? ")}
                   <m.button type="button" whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(isLogin ? 'signup' : 'login')} className="text-indigo-400 underline underline-offset-8 ml-6 hover:text-white transition-all font-black">
                     {isLogin ? (isZh ? '立即注册' : 'CREATE ACCOUNT') : (isZh ? '登录终端' : 'LOGIN TO TERMINAL')}
                   </m.button>
                 </p>
                 <p className="text-sm font-bold text-slate-600 uppercase tracking-widest italic">
                   {isMagicLink ? (isZh ? "使用密码登录？" : "USE PASSWORD? ") : (isZh ? "忘记密码？" : "FORGOT PASSWORD? ")}
                   <m.button type="button" whileHover={{ x: 5 }} whileTap={{ scale: 0.95 }} onClick={() => setActiveTab(isMagicLink ? 'login' : 'magic_link')} className="text-indigo-400 underline underline-offset-8 ml-6 hover:text-white transition-all font-black">
                     {isMagicLink ? (isZh ? '密码登录' : 'PASSWORD LOGIN') : (isZh ? '无密码登录' : 'PASSWORDLESS LOGIN')}
                   </m.button>
                 </p>
              </div>
            )}
          </div>
        </m.div>
      </div>
    </div>
  );
};