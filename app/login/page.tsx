
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, Key, Fingerprint, TriangleAlert, LogIn, RefreshCcw, Lock, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp, signInWithGoogle } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

interface LoginPageProps {
  isAdminPortal?: boolean;
}

export default function LoginPage({ isAdminPortal = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (!email || !password) throw new Error("Credentials incomplete.");
      
      // Step 1: Validate Password Credentials
      await signInWithPassword(email, password);
      
      // Step 2: Protocol upgrade - Requesting Email OTP for 2FA
      await signInWithEmailOTP(email);
      setStep('otp');
      setResendTimer(60);
      setSuccess('Identity identified. Access token transmitted to your node.');
    } catch (err: any) {
      setError(err.message || 'Identity verification failed. Protocol mismatch.');
    } finally {
      setLoading(false);
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
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) return;
    
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(email, token);
      // App.tsx handles the actual redirect via session change listener
    } catch (err: any) {
      setError(err.message || 'The token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    try {
      await signInWithEmailOTP(email);
      setResendTimer(60);
      setSuccess('A new access token has been synchronized.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">
            {isAdminPortal ? 'Admin Command' : 'SomnoAI Lab'}
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
            {isAdminPortal ? 'Secure Administrator Portal' : 'Neural Biometric Access'}
          </p>
        </div>
        
        <GlassCard className="p-8 md:p-12 rounded-[4rem] border-white/10 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <m.div key="credentials" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <form onSubmit={handleCredentialsAuth} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="Laboratory Email" 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50" 
                      required 
                    />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="Security Cipher" 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50" 
                      required 
                    />
                  </div>
                  <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                    {loading ? 'Decrypting Credentials...' : 'Initialize Uplink'}
                  </button>
                </form>

                <div className="relative flex items-center py-2 opacity-30">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-black uppercase">SSO Channel</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <button 
                  type="button" 
                  onClick={() => signInWithGoogle()}
                  className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:bg-white/10"
                >
                  <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
                  Google Neural Link
                </button>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                  <button onClick={() => setStep('credentials')} className="text-[10px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2 mx-auto mb-6">
                    <ArrowLeft size={14} /> Back to Terminal
                  </button>
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Identity Token</h2>
                  <p className="text-[10px] text-indigo-400/80 font-bold uppercase mt-1 tracking-widest">Sent to: {email}</p>
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
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-full h-14 bg-slate-950/80 border border-white/10 rounded-xl text-xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <button 
                  onClick={() => handleOtpVerify()}
                  disabled={loading || otp.some(d => !d)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {loading ? 'Synchronizing...' : 'Authorize Node'}
                </button>

                <div className="text-center space-y-4">
                  <button 
                    type="button" 
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className="text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors tracking-widest disabled:opacity-30"
                  >
                    {resendTimer > 0 ? `Resend Token in ${resendTimer}s` : 'Resend Token'}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {(error || success) && (
              <m.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className={`mt-6 p-4 rounded-2xl border text-[10px] font-bold italic flex items-center gap-3 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'}`}
              >
                {error ? <TriangleAlert size={16} /> : <ShieldCheck size={16} />}
                <p className="leading-snug">{error || success}</p>
              </m.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </m.div>
    </div>
  );
}
