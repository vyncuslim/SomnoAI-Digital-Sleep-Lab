
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight, TriangleAlert, ShieldCheck, Mail, Key, Eye, EyeOff, ChevronLeft, RefreshCw, Sparkles, CheckCircle2, Zap, Lock, Fingerprint, Send, Inbox, HelpCircle, Shield, BookmarkCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
import { signInWithEmailPassword, signUpWithEmailPassword, sendLoginOTP, verifyLoginOTP, signInWithGoogle, supabase } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

type AuthMode = 'login' | 'signup' | 'otp' | 'success_signup' | 'email_confirmed';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate, isAdminFlow = false }) => {
  const isZh = lang === 'zh';
  const [mode, setMode] = useState<AuthMode>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const passwordValid = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);

  // 监听 URL 变化，捕获从确认邮件跳转回来的状态
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('access_token') || hash.includes('type=signup')) {
      setMode('email_confirmed');
    }
  }, []);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    if (mode === 'otp') {
      const timer = setTimeout(() => otpRefs.current[0]?.focus(), 400);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleInitialAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isProcessing) return;

    if (mode === 'signup' && !passwordValid) {
      setLocalError(isZh ? "密码必须包含大小写字母和数字" : "Complexity: A-Z, a-z, 0-9 required");
      return;
    }

    setIsProcessing(true);
    setLocalError(null);
    try {
      if (mode === 'signup') {
        // 第一阶段：注册并发送确认邮件
        await signUpWithEmailPassword(email, password);
        setMode('success_signup');
      } else {
        // 第二阶段：登录流程（必须已 Confirm 邮箱）
        // 1. 验证密码
        await signInWithEmailPassword(email, password);
        // 2. 发送 6 位数字验证码 (OTP)
        await sendLoginOTP(email);
        setMode('otp');
        setResendTimer(60);
      }
    } catch (err: any) {
      if (err.message?.includes('Email not confirmed')) {
        setLocalError(isZh ? "邮箱尚未确认。请检查您的收件箱并点击确认链接。" : "Email not confirmed. Please click the link in your email first.");
        setMode('success_signup');
      } else {
        setLocalError(err.message || (isZh ? "认证失败，请检查实验室凭证" : "Access Denied: Invalid Credentials"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendSignup = async () => {
    setIsResending(true);
    try {
      await signUpWithEmailPassword(email, password);
      alert(isZh ? "确认邮件已重新发送，请查收。" : "Confirmation email re-transmitted.");
    } catch (e) {
      setLocalError(isZh ? "发送频率过快，请稍后再试。" : "Rate limit exceeded. Try again later.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async (providedOtp?: string) => {
    const otpValue = providedOtp || otp.join('');
    if (otpValue.length < 6 || isProcessing) return;

    setIsProcessing(true);
    setLocalError(null);
    try {
      const session = await verifyLoginOTP(email, otpValue);
      if (session) onLogin();
    } catch (err: any) {
      setLocalError(isZh ? "验证码错误或已失效" : "OTP Handshake Failed");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== '')) handleVerifyOTP(newOtp.join(''));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <m.div 
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[160px]" 
        />
      </div>

      <m.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[440px] z-10">
        <header className="text-center mb-10 space-y-4">
          <m.div layout className="inline-block p-4 bg-slate-900/50 rounded-full shadow-inner border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </m.div>
          <div className="space-y-1">
            <m.h1 layout className="text-4xl font-extrabold text-white tracking-tighter uppercase italic leading-none">
              SomnoAI
            </m.h1>
            <m.h2 layout className="text-3xl font-light text-indigo-400/80 tracking-widest uppercase italic leading-tight">
              Digital Lab
            </m.h2>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative">
          <AnimatePresence mode="wait">
            {mode === 'success_signup' ? (
              <m.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center space-y-10 py-2"
              >
                <div className="relative mx-auto w-24 h-24">
                  <m.div 
                    animate={{ scale: [1, 1.2, 1], rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border border-emerald-500/30 border-dashed rounded-full"
                  />
                  <div className="absolute inset-2 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                    <Inbox size={40} />
                  </div>
                </div>

                <div className="space-y-4">
                  <h2 className="text-2xl font-black text-white italic tracking-tight">{isZh ? '等待链路确认' : 'Awaiting Confirmation'}</h2>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">
                    {isZh ? '我们已向您的邮箱发送了确认链接。点击链接后，请返回此处进行登录以获取 6 位安全验证码。' : 'A confirmation link has been sent. After clicking it, return here to log in and receive your 6-digit secure code.'}
                  </p>
                </div>

                <div className="space-y-4">
                  <button onClick={handleResendSignup} disabled={isResending} className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
                    {isResending ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                    {isZh ? '重新发送确认邮件' : 'Resend Confirmation'}
                  </button>
                  <button onClick={() => setMode('login')} className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                    {isZh ? '已确认？前往登录' : 'Confirmed? Go to Login'}
                  </button>
                </div>
              </m.div>
            ) : mode === 'email_confirmed' ? (
              <m.div 
                key="confirmed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-10 py-4"
              >
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                  <BookmarkCheck size={40} />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-black text-white italic tracking-tight">{isZh ? '邮箱验证成功' : 'Email Confirmed'}</h2>
                  <p className="text-sm text-slate-400 font-medium">{isZh ? '您的第一阶段身份验证已完成。请登录以获取最终安全令牌。' : 'Phase I verification complete. Please log in to receive your final security token.'}</p>
                </div>
                <button onClick={() => setMode('login')} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl">
                  {isZh ? '立即登录' : 'Login Now'}
                </button>
              </m.div>
            ) : mode === 'otp' ? (
              <m.div 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="text-center space-y-4">
                  <button onClick={() => setMode('login')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto group">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {isZh ? '返回修改凭证' : 'Modify Credentials'}
                  </button>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tight">{isZh ? '安全链路握手' : 'Phase II Handshake'}</h2>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                      {isZh ? '请输入发送至您邮箱的 6 位数字验证码' : 'Enter the 6-digit code sent to your email'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx-1]?.focus()}
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="space-y-6 text-center">
                  <button 
                    onClick={() => handleVerifyOTP()}
                    disabled={isProcessing || otp.some(d => !d)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {isZh ? '建立加密链接' : 'Authorize Entry'}
                  </button>
                  <div className="h-4">
                    {resendTimer > 0 ? (
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Resend in {resendTimer}s</span>
                    ) : (
                      <button onClick={handleInitialAction} className="text-[9px] font-black text-indigo-400 uppercase hover:text-white transition-colors flex items-center gap-2 mx-auto">
                        <RefreshCw size={12} /> {isZh ? '重新发送' : 'Resend Code'}
                      </button>
                    )}
                  </div>
                </div>
              </m.div>
            ) : (
              <m.div 
                key="credentials"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <m.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signInWithGoogle()}
                    className="w-full py-5 bg-white text-[#1c1b1f] rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl relative overflow-hidden"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span>{isZh ? '使用 Google 账号继续' : 'Continue with Google'}</span>
                  </m.button>
                  
                  <div className="relative flex items-center py-4">
                    <div className="flex-grow border-t border-white/[0.05]"></div>
                    <span className="flex-shrink mx-6 text-[9px] text-slate-700 font-black uppercase tracking-[0.4em]">OR</span>
                    <div className="flex-grow border-t border-white/[0.05]"></div>
                  </div>
                </div>

                <form onSubmit={handleInitialAction} className="space-y-8">
                  <div className="space-y-5">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isZh ? "输入实验室电子邮箱" : "Enter Laboratory Email"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>

                    <div className="relative group">
                      <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder={isZh ? "访问密钥" : "Laboratory Access Key"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-[0.98] shadow-[0_15px_45px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {mode === 'signup' ? (isZh ? '记录新身份' : 'Log Identity') : (isZh ? '初始化验证码' : 'Initialize OTP')}
                  </button>
                </form>

                <div className="flex flex-col gap-6 text-center">
                  <button 
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setLocalError(null); }}
                    className="text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-[0.2em]"
                  >
                    {mode === 'login' ? (isZh ? '没有授权？注册身份' : 'No Access? Request Identity') : (isZh ? '已有身份？返回登录' : 'Authorized? Back to Login')}
                  </button>
                  <button onClick={onGuest} className="text-[10px] font-black text-slate-700 hover:text-slate-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto group">
                    {isZh ? '接入本地虚拟沙盒' : 'Access Local Virtual Sandbox'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-400 text-[11px] font-bold"
            >
              <TriangleAlert size={18} className="shrink-0" />
              <p className="leading-relaxed">{localError}</p>
            </m.div>
          )}
        </div>

        <m.footer layout className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.5em] mb-4 italic">Neural Core Security • Phase II Handshake</p>
          <div className="flex justify-center gap-10">
            <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Privacy</button>
            <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Terms</button>
          </div>
        </m.footer>
      </m.div>
    </div>
  );
};
