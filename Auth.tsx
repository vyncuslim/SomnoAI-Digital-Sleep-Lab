
import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronLeft, Mail, Zap, RefreshCw, ShieldAlert, ShieldCheck, Lock, Fingerprint, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle } from './services/supabaseService.ts';
import { supabase } from './lib/supabaseClient.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || cooldown > 0) return;

    setIsProcessing(true);
    setError(null);
    try {
      await signInWithEmailOTP(email.trim().toLowerCase());
      setStep('verify');
      setCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 300);
    } catch (err: any) {
      setError(err.message || "Failed to dispatch token.");
    } finally {
      setIsProcessing(false);
    }
  };

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

  const executeVerify = async (fullOtp?: string) => {
    if (isProcessing) return;
    const token = fullOtp || otp.join('');
    if (token.length < 6) return;

    setIsProcessing(true);
    setError(null);
    try {
      const session = await verifyOtp(email.trim().toLowerCase(), token);
      if (session) onLogin();
    } catch (err: any) {
      setError(err.message || "Verification failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });
      if (error) throw error;
      onLogin();
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "Google handshake failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <Logo size={80} animated={true} className="mx-auto" />
        <div className="space-y-2">
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">{t.lab}</h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em]">{t.tagline}</p>
        </div>
      </m.div>

      <GlassCard className="w-full max-w-md p-10 border-white/10 relative z-10">
        <AnimatePresence mode="wait">
          {step === 'input' ? (
            <m.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <form onSubmit={authMode === 'otp' ? handleRequestOtp : handlePasswordLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                    <input 
                      type="email" 
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailLabel}
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-14 py-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                      required
                    />
                  </div>

                  {authMode === 'password' && (
                    <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={16} />
                      <input 
                        type="password" 
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-full px-14 py-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all"
                        required
                      />
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={isProcessing || (authMode === 'otp' && cooldown > 0)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-3"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  {isProcessing ? 'PROCESSING...' : (authMode === 'otp' ? (cooldown > 0 ? `WAIT ${cooldown}S` : t.sendCode) : 'SIGN IN')}
                </button>

                <div className="flex items-center gap-4 py-2">
                  <div className="h-[1px] flex-1 bg-white/5" />
                  <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">OR</span>
                  <div className="h-[1px] flex-1 bg-white/5" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={handleGoogleLogin} 
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Globe size={14} /> Google
                  </button>
                  <button 
                    type="button"
                    onClick={() => setAuthMode(authMode === 'otp' ? 'password' : 'otp')} 
                    className="py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    <Fingerprint size={14} /> {authMode === 'otp' ? 'Password' : 'OTP'}
                  </button>
                </div>
              </form>
            </m.div>
          ) : (
            <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
              <div className="text-center space-y-2">
                <button onClick={() => setStep('input')} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase flex items-center gap-2 mx-auto transition-colors">
                  <ChevronLeft size={14} /> {t.back}
                </button>
                <h2 className="text-xl font-black text-white uppercase italic">{t.handshake}</h2>
                <p className="text-[10px] text-slate-500 font-medium italic">{t.dispatched} {email}</p>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpInput(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus();
                    }}
                    className="w-12 h-14 bg-white/5 border border-white/10 rounded-2xl text-xl text-center text-white font-mono focus:border-indigo-500 outline-none transition-all"
                  />
                ))}
              </div>

              <button 
                onClick={() => executeVerify()}
                disabled={isProcessing || otp.some(d => !d)}
                className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                {isProcessing ? 'AUTHORIZING...' : t.initialize}
              </button>
            </m.div>
          )}
        </AnimatePresence>

        {error && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3 text-rose-400 text-[10px] font-bold">
            <ShieldAlert size={14} className="shrink-0 mt-0.5" />
            <p className="italic leading-relaxed">{error}</p>
          </m.div>
        )}
      </GlassCard>

      <footer className="mt-12 text-center space-y-4 opacity-40 hover:opacity-100 transition-all">
        <div className="flex items-center gap-6 justify-center">
          <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400">Terms</button>
          <button onClick={onGuest} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-400">Sandbox Mode</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2025 Somno Lab • Neural Infrastructure</p>
      </footer>
    </div>
  );
};
