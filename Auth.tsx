import React, { useState, useRef } from 'react';
import { 
  Loader2, Mail, Lock, Zap, UserPlus, LogIn, 
  ChevronLeft, Eye, EyeOff, TriangleAlert, 
  ShieldCheck, Fingerprint, Info, ArrowRight,
  HelpCircle, CheckCircle2, Shield, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
import { 
  signInWithEmailOTP, verifyOtp, signInWithGoogle, 
  signInWithPassword, signUpWithPassword 
} from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
}

type AuthMethod = 'otp' | 'password';
type AuthMode = 'login' | 'register';
type AuthStep = 'initial' | 'otp-verify';

const validateEmailFormat = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const isZh = lang === 'zh';
  const [method, setMethod] = useState<AuthMethod>('otp');
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('initial');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; type?: 'auth_fail' | 'default' | 'success' } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(d => d !== '') && index === 5) {
      executeVerify(newOtp.join(''));
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !validateEmailFormat(cleanEmail)) {
      setError({
        message: isZh ? "无效的邮箱地址，请检查拼写。" : "Invalid identity signature. Please check the email format.",
        type: 'default'
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      if (method === 'otp') {
        await signInWithEmailOTP(cleanEmail);
        setStep('otp-verify');
        setError({
          message: isZh ? "令牌已发出！请检查收件箱。" : "Token sent! Please check your inbox.",
          type: 'success'
        });
        setTimeout(() => otpRefs.current[0]?.focus(), 500);
      } else {
        if (mode === 'login') {
          await signInWithPassword(cleanEmail, password);
          onLogin();
        } else {
          await signUpWithPassword(cleanEmail, password);
          setStep('otp-verify');
          setError({ 
            message: isZh ? "注册成功！请输入发送至邮箱的 6 位验证码以激活账号。" : "Registration successful! Enter the 6-digit code sent to your email to activate.",
            type: 'success'
          });
          setTimeout(() => otpRefs.current[0]?.focus(), 500);
        }
      }
    } catch (err: any) {
      const rawMsg = err.message || "";
      if (rawMsg === "Invalid login credentials") {
        setError({
          message: isZh ? "验证失败：账号或密码错误。新用户请切换到“注册”。" : "Authorization Failed: Credentials mismatch. Switch to 'Register' for new accounts.",
          type: 'auth_fail'
        });
      } else {
        setError({
          message: rawMsg || "Network instability detected.",
          type: 'default'
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const executeVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6) return;
    setIsProcessing(true);
    setError(null);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const verificationType = (method === 'password' && mode === 'register') ? 'signup' : 'email';
      await verifyOtp(cleanEmail, token, verificationType);
      onLogin();
    } catch (err: any) {
      setError({
        message: isZh ? "验证码错误或已过期。" : "Verification Failed: Token mismatch or expired.",
        type: 'default'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <m.div 
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-500/10 rounded-full blur-[180px]" 
        />
      </div>

      <m.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[480px] z-10">
        <header className="text-center mb-10 space-y-4">
          <m.div layout className="inline-block p-4 bg-slate-900/50 rounded-full shadow-inner border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </m.div>
          <div className="space-y-1">
            <m.h1 layout className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
              SomnoAI Lab
            </m.h1>
            <m.p layout className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              Digital Identity Telemetry
            </m.p>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 md:p-12 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'initial' ? (
              <m.div key="initial" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <div className="flex flex-col gap-5">
                  <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-inner">
                    <button 
                      onClick={() => { setMethod('otp'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'otp' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {isZh ? '验证码模式' : 'OTP Only'}
                    </button>
                    <button 
                      onClick={() => { setMethod('password'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'password' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {isZh ? '密码模式' : 'Password'}
                    </button>
                  </div>

                  {method === 'password' && (
                    <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-8">
                      <button onClick={() => { setMode('login'); setError(null); }} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'login' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <LogIn size={14} /> {isZh ? '登录' : 'Login'}
                      </button>
                      <button onClick={() => { setMode('register'); setError(null); }} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'register' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <UserPlus size={14} /> {isZh ? '注册' : 'Register'}
                      </button>
                    </m.div>
                  )}
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        autoComplete="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isZh ? "电子邮箱" : "Email Address"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.8rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                    
                    {method === 'password' && (
                      <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group overflow-hidden">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          autoComplete="current-password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={isZh ? "访问密码" : "Access Password"}
                          className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.8rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </m.div>
                    )}
                  </div>

                  <button 
                    disabled={isProcessing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (method === 'otp' ? <Zap size={18} /> : (mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />))}
                    {method === 'otp' ? (isZh ? '获取实验室令牌' : 'Request Lab Token') : (mode === 'login' ? (isZh ? '授权登录' : 'Authorize Access') : (isZh ? '确认注册' : 'Confirm Registration'))}
                  </button>
                </form>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => signInWithGoogle()} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                      <img src="https://img.icons8.com/color/18/google-logo.png" alt="G" /> Google
                    </button>
                    <button onClick={onGuest} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                      <Fingerprint size={16} className="text-indigo-400" /> {isZh ? '沙盒模式' : 'Sandbox'}
                    </button>
                  </div>
                </div>
              </m.div>
            ) : (
              <m.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('initial')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                    <ChevronLeft size={14} /> {isZh ? '返回修改' : 'Change Info'}
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {isZh ? '输入 6 位验证码' : 'Enter 6-Digit Code'}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium italic">
                    {isZh ? `验证码已发送至 ${email}` : `Token sent to ${email}`}
                  </p>
                </div>

                <div className="flex justify-between gap-3 px-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-11 h-14 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => executeVerify()}
                    disabled={isProcessing || otp.some(d => !d)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {isZh ? '完成验证' : 'Complete Verification'}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {error && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-8 p-5 border rounded-3xl flex flex-col gap-4 text-[11px] font-bold ${error.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              <div className="flex items-start gap-4">
                {error.type === 'success' ? <CheckCircle2 size={18} className="shrink-0" /> : <TriangleAlert size={18} className="shrink-0" />}
                <p className="flex-1 leading-relaxed">{error.message}</p>
              </div>
            </m.div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5">
            <button 
              onClick={() => setShowHelp(!showHelp)}
              className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
            >
              <HelpCircle size={14} /> {isZh ? '无法激活账户？' : 'Cannot activate account?'}
            </button>
            
            <AnimatePresence>
              {showHelp && (
                <m.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="pt-4 space-y-3">
                    {[
                      { icon: Shield, text: isZh ? "1. 检查垃圾邮件 (Spam) 文件夹。" : "1. Check your Spam folder." },
                      { icon: Activity, text: isZh ? "2. 验证码发送频率限制为每小时 3 次。" : "2. Token limit is 3 requests per hour." },
                      { icon: Fingerprint, text: isZh ? "3. 推荐使用 Sandbox 模式快速体验。" : "3. Try Sandbox mode for instant access." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 items-center text-[10px] text-slate-500 italic">
                        <item.icon size={12} className="shrink-0" />
                        <span>{item.text}</span>
                      </div>
                    ))}
                  </div>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </m.div>
      <footer className="absolute bottom-10 left-0 right-0 text-center text-slate-800 font-black uppercase text-[8px] tracking-[0.5em] pointer-events-none">
        SomnoAI Digital Sleep Lab • Neural Grid Access
      </footer>
    </div>
  );
};