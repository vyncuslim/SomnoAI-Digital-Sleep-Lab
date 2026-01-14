import React, { useState, useRef } from 'react';
import { 
  Loader2, Mail, Lock, Zap, UserPlus, LogIn, 
  ChevronLeft, Eye, EyeOff, TriangleAlert, 
  ShieldCheck, Fingerprint, Info, ArrowRight
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

/**
 * High-precision RFC 5322 compliant regex for email validation.
 */
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
  const [error, setError] = useState<{ message: string; type?: 'auth_fail' | 'default' } | null>(null);
  
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
    
    // CRITICAL: Normalize email to prevent "Invalid Email" errors caused by trailing/leading whitespace
    const cleanEmail = email.trim().toLowerCase();
    
    if (!cleanEmail || !validateEmailFormat(cleanEmail)) {
      setError({
        message: "Invalid identity signature. Please check the email format for errors or hidden spaces.",
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
        setTimeout(() => otpRefs.current[0]?.focus(), 500);
      } else {
        if (mode === 'login') {
          await signInWithPassword(cleanEmail, password);
          onLogin();
        } else {
          await signUpWithPassword(cleanEmail, password);
          setError({ 
            message: "Initialization protocol sent. Verify your link via email before authentication.",
            type: 'default'
          });
        }
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      const rawMsg = err.message || "";
      
      if (rawMsg === "Invalid login credentials") {
        setError({
          message: "Authorization Failed: Credentials mismatch. If this is a new identity, please switch to 'Register'.",
          type: 'auth_fail'
        });
      } else if (rawMsg.toLowerCase().includes("invalid") && rawMsg.toLowerCase().includes("email")) {
        setError({
          message: `The laboratory gateway rejected the email "${cleanEmail}". Check for typos or provider restrictions.`,
          type: 'default'
        });
      } else {
        setError({
          message: rawMsg || "Network instability detected. Signal handshake failed.",
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
      await verifyOtp(cleanEmail, token);
      onLogin();
    } catch (err: any) {
      setError({
        message: "Verification Failed: Token mismatch or session timeout.",
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

      <m.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px] z-10">
        <header className="text-center mb-12 space-y-4">
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

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-14 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'initial' ? (
              <m.div key="initial" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                <div className="flex flex-col gap-5">
                  <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5 shadow-inner">
                    <button 
                      onClick={() => { setMethod('otp'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'otp' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      OTP Access
                    </button>
                    <button 
                      onClick={() => { setMethod('password'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'password' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      Credentials
                    </button>
                  </div>

                  {method === 'password' && (
                    <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-8">
                      <button onClick={() => setMode('login')} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'login' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <LogIn size={14} /> Login
                      </button>
                      <button onClick={() => setMode('register')} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'register' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <UserPlus size={14} /> Register
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
                        autoCapitalize="none"
                        spellCheck="false"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email Address"
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
                          placeholder="Access Key"
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
                    {method === 'otp' ? 'Request Access Token' : (mode === 'login' ? 'Authorize Access' : 'Establish Identity')}
                  </button>
                </form>

                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <button onClick={() => signInWithGoogle()} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                      <img src="https://img.icons8.com/color/18/google-logo.png" alt="G" /> Google
                    </button>
                    <button onClick={onGuest} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                      <Fingerprint size={16} className="text-indigo-400" /> Sandbox Mode
                    </button>
                  </div>
                  <p className="text-[9px] text-slate-600 font-bold text-center uppercase tracking-widest leading-relaxed">
                    No email? Check spam or use 'Sandbox Mode' to explore immediately.
                  </p>
                </div>
              </m.div>
            ) : (
              <m.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('initial')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                    <ChevronLeft size={14} /> Change Info
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    Verify Lab Token
                  </h2>
                  <p className="text-xs text-slate-500 font-medium italic">
                    Token sent to {email}
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
                    Confirm Identity
                  </button>
                  <div className="p-4 bg-indigo-500/5 rounded-2xl flex gap-3 items-start border border-indigo-500/10">
                    <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed italic">
                      Due to link limits, email may delay. Check block list if it never arrives.
                    </p>
                  </div>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {error && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex flex-col gap-4 text-rose-400 text-[11px] font-bold">
              <div className="flex items-center gap-4">
                <TriangleAlert size={18} className="shrink-0" />
                <p className="flex-1">{error.message}</p>
              </div>
              
              {error.type === 'auth_fail' && (
                <div className="flex flex-col gap-2 pt-2 border-t border-rose-500/10">
                   <button 
                    onClick={() => { setMethod('password'); setMode('register'); setError(null); }}
                    className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-300 text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                   >
                     <UserPlus size={12} /> Switch to Register
                   </button>
                   <button 
                    onClick={onGuest}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                   >
                     <Fingerprint size={12} /> Try Sandbox Mode Instead <ArrowRight size={10} />
                   </button>
                </div>
              )}
            </m.div>
          )}
        </div>
      </m.div>
      <footer className="absolute bottom-10 left-0 right-0 text-center text-slate-600 font-black uppercase text-[8px] tracking-[0.5em] pointer-events-none">
        SomnoAI Digital Sleep Lab • Neural Infrastructure
      </footer>
    </div>
  );
};