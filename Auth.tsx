
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight, TriangleAlert, ShieldCheck, Mail, Key, Sparkles, Chrome, Eye, EyeOff, ChevronLeft, RefreshCw, UserPlus, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailPassword, signUpWithEmailPassword, sendEmailOTP, verifyEmailOTP, signInWithGoogle } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

type AuthMode = 'login' | 'signup' | 'otp';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate, isAdminFlow = false }) => {
  const isZh = lang === 'zh';
  const [mode, setMode] = useState<AuthMode>('login');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;

  // 验证码倒计时
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // OTP 界面自动对焦
  useEffect(() => {
    if (mode === 'otp') {
      const timer = setTimeout(() => otpRefs.current[0]?.focus(), 500);
      return () => clearTimeout(timer);
    }
  }, [mode]);

  const handleGoogleSignIn = async () => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setLocalError(err.message || "Google Handshake failed.");
      setIsProcessing(false);
    }
  };

  const handleInitialAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || isProcessing) return;

    setIsProcessing(true);
    setLocalError(null);
    try {
      if (mode === 'signup') {
        // 注册流：保存 Email/Password 并发送激活邮件
        await signUpWithEmailPassword(email, password);
        setLocalError(isZh ? "注册成功！请前往邮箱查收确认邮件以激活实验室身份。" : "Signup successful! Please check your email and confirm your identity.");
        setMode('login');
      } else {
        // 登录流第一步：验证密码
        await signInWithEmailPassword(email, password);
        // 登录流第二步：密码正确后发送二次验证码
        await sendEmailOTP(email);
        setMode('otp');
        setResendTimer(60);
      }
    } catch (err: any) {
      setLocalError(err.message || (mode === 'signup' ? "Registration failed." : "Authentication denied: Check your key and identity."));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async (providedOtp?: string) => {
    const otpValue = providedOtp || otp.join('');
    if (otpValue.length < 6 || isProcessing) return;

    setIsProcessing(true);
    setLocalError(null);
    try {
      const session = await verifyEmailOTP(email, otpValue);
      if (session) {
        onLogin();
      }
    } catch (err: any) {
      setLocalError(err.message || "Digital handshake failed: Invalid or expired code.");
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
      const nextFocus = Math.min(index + pasted.length, 5);
      otpRefs.current[nextFocus]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }
    if (newOtp.every(d => d !== '')) handleVerifyOTP(newOtp.join(''));
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* 动态光影底色 */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md space-y-10 text-center relative z-10"
      >
        <div className="flex flex-col items-center gap-6">
          <m.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className={`p-6 rounded-[3rem] border flex items-center justify-center transition-all duration-700 ${isAdminFlow ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]' : 'bg-indigo-600/10 border-indigo-500/10 shadow-[0_0_80px_rgba(79,70,229,0.15)]'}`}
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
              SomnoAI <br/>
              <span className={isAdminFlow ? "text-rose-500" : "text-indigo-400"}>
                {isAdminFlow ? "Admin Node" : "Digital Lab"}
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">{mode === 'otp' ? 'Second Handshake Required' : 'Secure Biometric Auth'}</p>
          </div>
        </div>

        <GlassCard className="p-8 md:p-10 rounded-[4rem] border-white/10 shadow-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            {mode !== 'otp' ? (
              <m.div key="credentials" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={isProcessing}
                  className="w-full py-4.5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} className="text-indigo-600" />}
                  {t.googleSign}
                </button>

                <div className="flex items-center gap-4 opacity-10">
                  <div className="h-[1px] flex-1 bg-white" />
                  <span className="text-[8px] font-black uppercase text-white tracking-widest">ENCRYPTED PORTAL</span>
                  <div className="h-[1px] flex-1 bg-white" />
                </div>

                <form onSubmit={handleInitialAction} className="space-y-5">
                  <div className="space-y-2 text-left px-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">{isZh ? '实验室 ID (Email)' : 'Laboratory ID (Email)'}</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)}
                        placeholder="researcher.01@lab.com"
                        className="w-full bg-slate-950/60 border border-white/5 rounded-full px-14 py-4.5 text-sm text-white font-bold outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 text-left px-1">
                    <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest ml-4">{isZh ? '访问密钥 (Password)' : 'Access Key (Password)'}</label>
                    <div className="relative group">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={16} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={password} 
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-slate-950/60 border border-white/5 rounded-full px-14 py-4.5 text-sm text-white font-bold outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-800"
                        required
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className={`w-full mt-4 py-4.5 rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50 ${mode === 'signup' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (mode === 'signup' ? <UserPlus size={18} /> : <ShieldCheck size={18} />)}
                    {mode === 'signup' ? (isZh ? '申请身份' : 'Request Identity') : (isZh ? '验证凭证' : 'Authorize Phase I')}
                  </button>
                </form>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setLocalError(null); }} 
                    className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 transition-all"
                  >
                    {mode === 'login' ? (isZh ? '没有账号？申请新身份' : 'No Access? Register Identity') : (isZh ? '已有账号？返回登录' : 'Have ID? Return to Login')}
                  </button>
                  <button onClick={onGuest} className="text-[10px] font-black uppercase text-slate-700 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto">
                    {translations[lang].auth.guest} <ArrowRight size={14} />
                  </button>
                </div>
              </m.div>
            ) : (
              <m.div key="handshake" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="space-y-6">
                  <button onClick={() => setMode('login')} className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto group">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {isZh ? '返回凭证验证' : 'Back to Credentials'}
                  </button>
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                      <Fingerprint size={28} />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-sm font-black text-slate-200 uppercase tracking-widest">{isZh ? '执行二次握手' : 'Phase II Verification'}</h3>
                       <p className="text-[10px] text-slate-500 font-mono tracking-tighter opacity-60">Handshake code sent to {email}</p>
                    </div>
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
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-11 h-14 sm:w-12 sm:h-16 bg-slate-950/80 border border-white/5 rounded-2xl text-xl text-center text-white font-black focus:border-emerald-500/50 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="space-y-6">
                  <button 
                    onClick={() => handleVerifyOTP()}
                    disabled={isProcessing || otp.some(d => !d)} 
                    className="w-full py-4.5 rounded-full font-black text-xs uppercase tracking-[0.3em] bg-emerald-600 text-white transition-all flex items-center justify-center gap-3 shadow-2xl active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {isZh ? '最终授权' : 'Execute Final Access'}
                  </button>

                  <div className="h-4">
                    {resendTimer > 0 ? (
                      <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">{t.resendIn} {resendTimer}s</span>
                    ) : (
                      <button onClick={handleInitialAction} className="text-[9px] font-black text-indigo-400 uppercase hover:text-white transition-colors flex items-center gap-2 mx-auto">
                        <RefreshCw size={12} /> {t.resendCode}
                      </button>
                    )}
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-8 p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-400 text-[9px] font-black uppercase flex items-center gap-4 text-left leading-relaxed"
            >
              <TriangleAlert size={18} className="shrink-0" />
              <span>{localError}</span>
            </m.div>
          )}
        </GlassCard>

        <footer className="opacity-30 hover:opacity-100 transition-opacity flex flex-col items-center gap-4">
          <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-700">© 2026 Somno Lab • Neural Infrastructure</p>
          <div className="flex gap-6">
             <button onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase text-slate-600 hover:text-indigo-400 transition-colors">Privacy</button>
             <button onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase text-slate-600 hover:text-indigo-400 transition-colors">Terms</button>
          </div>
        </footer>
      </m.div>
    </div>
  );
};
