import React, { useState, useRef, useEffect } from 'react';
// Added Zap to the imports
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

  // Verification Code Input Management
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      // Handle bulk paste
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }

    // Auto-commit on full code entry
    if (newOtp.every(d => d !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  // Step 1: Send Neural Token
  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);
    try {
      await signInWithEmailOTP(email);
      setStep('otp');
      // Set focus to first input
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
    } catch (err: any) {
      setLocalError(err.message || (isZh ? "协议握手失败：无法发送验证码" : "Protocol Handshake Failed: Unable to send code"));
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Synchronize Identity
  const handleVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setLocalError(null);
    try {
      await verifyOtp(email, token);
      onLogin();
    } catch (err: any) {
      setLocalError(isZh ? "令牌无效或已过期，请检查邮件" : "Token invalid or expired. Check your laboratory email.");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <m.div 
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.2, 1] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[160px]" 
        />
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
            <m.h2 layout className="text-3xl font-light text-indigo-400/80 tracking-widest uppercase italic leading-tight">
              Identity Lab
            </m.h2>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] p-8 md:p-12 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <m.div 
                key="email" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                className="space-y-10"
              >
                <div className="space-y-4">
                  <m.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => signInWithGoogle()}
                    className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 transition-all shadow-2xl relative overflow-hidden group"
                  >
                    <m.div 
                      className="absolute inset-0 bg-slate-100/0 group-hover:bg-slate-100/10 transition-colors"
                    />
                    <img src="https://img.icons8.com/color/24/google-logo.png" alt="G" className="z-10" />
                    <span className="z-10">{isZh ? '使用 Google 账号继续' : 'Continue with Google'}</span>
                  </m.button>
                  
                  <div className="relative flex items-center py-4 opacity-30">
                    <div className="flex-grow border-t border-white"></div>
                    <span className="flex-shrink mx-6 text-[9px] text-white font-black uppercase tracking-[0.4em]">OR</span>
                    <div className="flex-grow border-t border-white"></div>
                  </div>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-8">
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isZh ? "输入实验室电子邮箱" : "Laboratory Email"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                        required
                      />
                    </div>
                    <p className="px-6 text-[10px] text-slate-500 font-bold italic">
                      {isZh ? '我们将通过此邮箱发送一次性验证码。' : 'We will transmit a unique access token to this address.'}
                    </p>
                  </div>

                  <button 
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-[0_15px_45px_-10px_rgba(79,70,229,0.5)] flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {/* Fixed missing Zap icon reference */}
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {isZh ? '发送安全令牌' : 'Request Access Token'}
                  </button>
                </form>

                <div className="text-center">
                  <button onClick={onGuest} className="text-[10px] font-black text-slate-700 hover:text-slate-400 transition-colors uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto group">
                    {isZh ? '接入虚拟实验沙盒' : 'Enter Virtual Sandbox'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </m.div>
            ) : (
              <m.div 
                key="otp" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-10"
              >
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('email')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto group">
                    <ChevronLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> {isZh ? '返回修改邮箱' : 'Change Identity'}
                  </button>
                  <div className="space-y-1">
                    <m.h2 layout className="text-xl font-black text-white uppercase italic tracking-tight">
                      {isZh ? '请输入 6 位令牌' : 'Enter 6-Digit Token'}
                    </m.h2>
                    <p className="text-[11px] text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                      {isZh ? '验证码已同步至' : 'Token synchronized to'} <span className="text-indigo-400">{email}</span>
                    </p>
                  </div>
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
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all shadow-inner focus:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                    />
                  ))}
                </div>

                <div className="space-y-6 text-center">
                  <button 
                    onClick={() => handleVerify()}
                    disabled={isProcessing || otp.some(d => !d)}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {isZh ? '建立加密链接' : 'Synchronize Identity'}
                  </button>
                  <button onClick={() => handleSendOTP()} className="text-[10px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 mx-auto">
                    <RefreshCw size={12} /> {isZh ? '重发验证码' : 'Resend Token'}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-8 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-400 text-[11px] font-bold shadow-inner"
            >
              <TriangleAlert size={18} className="shrink-0" />
              <p className="leading-relaxed">{localError}</p>
            </m.div>
          )}
        </div>

        <m.footer layout className="mt-12 text-center opacity-30 hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-black text-slate-800 uppercase tracking-[0.5em] mb-4 italic">Neural Core Security • Session Encryption Enabled</p>
          <div className="flex justify-center gap-10">
            <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Privacy</button>
            <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest transition-colors">Terms</button>
          </div>
        </m.footer>
      </m.div>
    </div>
  );
};