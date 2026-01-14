
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight, TriangleAlert, ShieldCheck, Mail, Key, Eye, EyeOff, ChevronLeft, Shield, Lock, Zap, UserPlus, LogIn, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle, signInWithPassword, signUpWithPassword } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
}

type AuthMethod = 'otp' | 'password';
type AuthMode = 'login' | 'register';
type AuthStep = 'initial' | 'otp-verify';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const isZh = lang === 'zh';
  const [method, setMethod] = useState<AuthMethod>('otp');
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('initial');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (newOtp.every(d => d !== '') && index === 5) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);

    try {
      if (method === 'otp') {
        await signInWithEmailOTP(email);
        setStep('otp-verify');
        setTimeout(() => otpRefs.current[0]?.focus(), 400);
      } else {
        if (mode === 'login') {
          await signInWithPassword(email, password);
          onLogin();
        } else {
          await signUpWithPassword(email, password);
          setLocalError(isZh ? "注册成功！请检查邮箱以确认您的账户。" : "Registration successful! Check your email to confirm.");
        }
      }
    } catch (err: any) {
      setLocalError(err.message || (isZh ? "身份验证请求失败" : "Authentication request failed"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);
    try {
      await verifyOtp(email, token);
      onLogin();
    } catch (err: any) {
      setLocalError(isZh ? "验证码无效或已过期" : "Token invalid or expired");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] font-sans overflow-hidden relative">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <m.div animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.2, 1] }} transition={{ duration: 15, repeat: Infinity }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[160px]" />
      </div>

      <m.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[480px] z-10">
        <header className="text-center mb-10 space-y-4">
          <m.div layout className="inline-block p-4 bg-slate-900/50 rounded-full shadow-inner border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </m.div>
          <div className="space-y-1">
            <m.h1 layout className="text-4xl font-extrabold text-white tracking-tighter uppercase italic leading-none">
              SomnoAI
            </m.h1>
            <m.h2 layout className="text-[10px] font-black text-indigo-400/80 tracking-[0.4em] uppercase italic">
              {isZh ? '数字化身份实验室' : 'Digital Identity Laboratory'}
            </m.h2>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative">
          <AnimatePresence mode="wait">
            {step === 'initial' ? (
              <m.div key="initial" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                {/* Method & Mode Toggles */}
                <div className="flex flex-col gap-4">
                  <div className="flex bg-slate-950/80 p-1 rounded-full border border-white/5">
                    <button 
                      onClick={() => setMethod('otp')}
                      className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'otp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      OTP Code
                    </button>
                    <button 
                      onClick={() => setMethod('password')}
                      className={`flex-1 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Password
                    </button>
                  </div>

                  {method === 'password' && (
                    <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-6">
                      <button 
                        onClick={() => setMode('login')}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'login' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <LogIn size={12} /> {isZh ? '登录' : 'Login'}
                      </button>
                      <button 
                        onClick={() => setMode('register')}
                        className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${mode === 'register' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}
                      >
                        <UserPlus size={12} /> {isZh ? '注册' : 'Register'}
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
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isZh ? "实验室账号 (Email)" : "Lab Identity (Email)"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50"
                        required
                      />
                    </div>
                    
                    {method === 'password' && (
                      <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group overflow-hidden">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={isZh ? "安全访问密钥" : "Access Secret"}
                          className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50"
                          required
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </m.div>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (method === 'otp' ? <Zap size={18} /> : (mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />))}
                    {method === 'otp' 
                      ? (isZh ? '发送接入代码' : 'Send Access Token') 
                      : (mode === 'login' ? (isZh ? '授权接入' : 'Authorize Access') : (isZh ? '创建身份' : 'Create Identity'))
                    }
                  </button>
                </form>

                <div className="relative flex items-center py-2 opacity-20">
                  <div className="flex-grow border-t border-white"></div>
                  <span className="flex-shrink mx-6 text-[9px] text-white font-black uppercase tracking-[0.4em]">External Links</span>
                  <div className="flex-grow border-t border-white"></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => signInWithGoogle()}
                    className="py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
                  >
                    <img src="https://img.icons8.com/color/20/google-logo.png" alt="G" />
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Google</span>
                  </button>
                  <button 
                    onClick={onGuest}
                    className="py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all group"
                  >
                    <Fingerprint size={16} className="text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-widest">Sandbox</span>
                  </button>
                </div>
              </m.div>
            ) : (
              <m.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="text-center space-y-2">
                  <button onClick={() => setStep('initial')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
                    <ChevronLeft size={14} /> {isZh ? '返回修改信息' : 'Change Identity'}
                  </button>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
                    {isZh ? '核验接入令牌' : 'Verify Lab Token'}
                  </h2>
                </div>

                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <button 
                  onClick={() => handleVerifyOtp()}
                  disabled={isProcessing || otp.some(d => !d)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isZh ? '同步身份' : 'Synchronize Identity'}
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-400 text-[11px] font-bold">
              <TriangleAlert size={18} className="shrink-0" />
              <p className="flex-1">{localError}</p>
            </m.div>
          )}
        </div>
      </m.div>
    </div>
  );
};
