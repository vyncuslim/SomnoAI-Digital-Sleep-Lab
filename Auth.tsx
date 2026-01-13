
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight, TriangleAlert, ShieldCheck, Mail, Key, Eye, EyeOff, ChevronLeft, RefreshCw, Fingerprint, Lock, Shield, Atom, CircleCheck, Info, Send, Scan, Terminal, Hash, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
}

type AuthStep = 'email' | 'otp';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const isZh = lang === 'zh';
  const [step, setStep] = useState<AuthStep>('email');
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Check if specifically on a portal entry route
  const isCommandPortal = window.location.pathname === '/login' || window.location.pathname === '/admin';

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
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);
    try {
      await signInWithEmailOTP(email);
      setStep('otp');
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (err: any) {
      setLocalError(err.message || (isZh ? "无法发送验证码，请检查邮箱格式" : "Unable to send code, check email format"));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (fullOtp?: string) => {
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

      <m.div layout initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px] z-10">
        <header className="text-center mb-10 space-y-4">
          <m.div layout className="inline-block p-4 bg-slate-900/50 rounded-full shadow-inner border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </m.div>
          <div className="space-y-1">
            <m.h1 layout className="text-4xl font-extrabold text-white tracking-tighter uppercase italic leading-none">
              SomnoAI
            </m.h1>
            <m.h2 layout className="text-xl font-black text-indigo-400/80 tracking-widest uppercase italic">
              {isCommandPortal ? (isZh ? '控制台入口' : 'Command Portal') : (isZh ? '身份实验室' : 'Identity Lab')}
            </m.h2>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <m.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                <div className="space-y-4">
                  <button 
                    onClick={() => signInWithGoogle()}
                    className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl"
                  >
                    <img src="https://img.icons8.com/color/24/google-logo.png" alt="G" />
                    <span>{isZh ? '使用 Google 继续' : 'Continue with Google'}</span>
                  </button>
                  <div className="relative flex items-center py-4 opacity-30">
                    <div className="flex-grow border-t border-white"></div>
                    <span className="flex-shrink mx-6 text-[9px] text-white font-black uppercase tracking-[0.4em]">OR</span>
                    <div className="flex-grow border-t border-white"></div>
                  </div>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-8">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder={isZh ? "输入您的电子邮箱" : "Enter Your Email"}
                      className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50"
                      required
                    />
                  </div>
                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {isZh ? '发送接入令牌' : 'Send Access Token'}
                  </button>
                </form>

                {!isCommandPortal && (
                  <div className="text-center">
                    <button onClick={onGuest} className="text-[10px] font-black text-slate-700 hover:text-slate-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto">
                      {isZh ? '接入虚拟实验沙盒' : 'Enter Virtual Sandbox'} <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="text-center space-y-2">
                  <button onClick={() => setStep('email')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
                    <ChevronLeft size={14} /> {isZh ? '返回修改邮箱' : 'Change Identity'}
                  </button>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">
                    {isZh ? '核验身份令牌' : 'Verify Token'}
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
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <button 
                  onClick={() => handleVerify()}
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
              <p>{localError}</p>
            </m.div>
          )}
        </div>
      </m.div>
    </div>
  );
};
