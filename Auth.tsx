
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ArrowRight, TriangleAlert, ShieldCheck, Mail, Key, Sparkles, ChevronLeft, Chrome, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { sendEmailOTP, verifyEmailOTP, signInWithGoogle } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate, isAdminFlow = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;

  // Resend cooldown logic
  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Focus management for OTP boxes
  useEffect(() => {
    if (authState === 'otp') {
      const timer = setTimeout(() => otpRefs.current[0]?.focus(), 200);
      return () => clearTimeout(timer);
    }
  }, [authState]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || isProcessing) return;
    
    setIsProcessing(true);
    setLocalError(null);
    try {
      // Explicitly calling the OTP send logic
      await sendEmailOTP(email);
      setAuthState('otp');
      setResendTimer(60);
    } catch (err: any) {
      setLocalError(err.message || "Laboratory handshake failed. Verify email syntax.");
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
      } else {
        throw new Error("Handshake aborted by server.");
      }
    } catch (err: any) {
      setLocalError(err.message || "The 6-digit code is incorrect or expired.");
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Handle digit entry and auto-tabbing
    if (value.length > 1) {
      // Handle paste of full code
      const pasted = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      const nextFocus = Math.min(index + pasted.length, 5);
      otpRefs.current[nextFocus]?.focus();
      if (newOtp.every(d => d !== '')) handleVerifyOTP(newOtp.join(''));
      return;
    }

    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(digit => digit !== '')) {
       handleVerifyOTP(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Dynamic Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-indigo-500/[0.02] rounded-full blur-[180px] pointer-events-none" />
      
      <m.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        <div className="flex flex-col items-center gap-6">
          <m.div 
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity }}
            className={`p-6 rounded-[3.5rem] border flex items-center justify-center transition-all ${isAdminFlow ? 'bg-rose-500/10 border-rose-500/20' : 'bg-indigo-600/10 border-indigo-500/10'}`}
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
              SomnoAI <br/>
              <span className={isAdminFlow ? "text-rose-500" : "text-indigo-400"}>
                {isAdminFlow ? "Admin Security" : "Biometric Lab"}
              </span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.5em]">Digit Verification Bridge</p>
          </div>
        </div>

        <GlassCard className="p-8 rounded-[4rem] border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            {authState === 'email' ? (
              <m.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <button 
                  onClick={async () => {
                    setIsProcessing(true);
                    try { await signInWithGoogle(); } catch (e) { setIsProcessing(false); }
                  }}
                  disabled={isProcessing}
                  className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:shadow-2xl transition-all active:scale-95 group"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} className="text-indigo-600" />}
                  {t.googleSign}
                </button>

                <div className="flex items-center gap-4 opacity-10">
                  <div className="h-[1px] flex-1 bg-white" />
                  <span className="text-[9px] font-black text-white uppercase tracking-widest">Protocol Selection</span>
                  <div className="h-[1px] flex-1 bg-white" />
                </div>

                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder={t.enterEmail}
                      className="w-full bg-slate-950/60 border border-white/5 rounded-full px-14 py-5 text-sm text-white font-bold outline-none focus:border-indigo-500/40 transition-all text-center"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className="w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={16} />}
                    {t.sendCode}
                  </button>
                </form>

                <button onClick={onGuest} className="text-[10px] font-black uppercase text-slate-600 hover:text-white transition-all flex items-center justify-center gap-2 mx-auto">
                  {translations[lang].auth.guest} <ArrowRight size={14} />
                </button>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-2">
                  <button onClick={() => setAuthState('email')} className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-1 mx-auto transition-colors">
                    <ChevronLeft size={14} /> Change Email
                  </button>
                  <div className="flex flex-col items-center gap-2 pt-2">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Key size={18} />
                    </div>
                    <p className="text-[11px] text-slate-300 font-bold uppercase tracking-tight">
                      Check your inbox for the 6-digit code
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">{email}</span>
                  </div>
                </div>

                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      onFocus={(e) => e.target.select()}
                      className="w-12 h-16 bg-slate-950/60 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-400 focus:bg-indigo-500/5 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={() => handleVerifyOTP()}
                    disabled={isProcessing || otp.some(d => !d)} 
                    className="w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.2em] bg-emerald-600 text-white transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/20 active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    {t.verifyCode}
                  </button>

                  <div className="flex flex-col items-center gap-3">
                    {resendTimer > 0 ? (
                      <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Resend possible in {resendTimer}s</span>
                    ) : (
                      <button onClick={handleSendOTP} className="text-[9px] font-black text-indigo-400 uppercase hover:text-white transition-colors flex items-center gap-2 group">
                        <RefreshCw size={12} className="group-hover:rotate-180 transition-transform" /> {t.resendCode}
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
              className="mt-6 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase flex items-center gap-3"
            >
              <TriangleAlert size={16} className="shrink-0" />
              <span>{localError}</span>
            </m.div>
          )}
        </GlassCard>

        <footer className="opacity-40 hover:opacity-100 transition-opacity flex flex-col items-center gap-4">
          <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-700">© 2026 Somno Lab • Biometric Identity Link</p>
          <div className="flex gap-4">
             <button onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase text-slate-600 hover:text-indigo-400 transition-colors">Privacy</button>
             <button onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase text-slate-600 hover:text-indigo-400 transition-colors">Terms</button>
          </div>
        </footer>
      </m.div>
    </div>
  );
};
