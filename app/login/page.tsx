import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, Key, TriangleAlert, LogIn, Lock, ShieldCheck, ChevronRight, ArrowLeft } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp, signInWithGoogle, signUpWithPassword } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!email || !password) throw new Error("Please provide complete laboratory credentials.");
      
      if (authMode === 'signup') {
        await signUpWithPassword(email, password);
        setSuccess('Registration successful. Secure link sent to your email.');
      } else {
        await signInWithPassword(email, password);
        // Protocol escalation: Request OTP
        await signInWithEmailOTP(email);
        setStep('otp');
        setSuccess('Credentials verified. Multi-factor identity token transmitted.');
      }
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
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'The token is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-2">SomnoAI Lab</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Neural Biometric Access</p>
        </div>
        
        <GlassCard className="p-10 rounded-[4rem] border-white/10 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <m.div key="credentials" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <div className="flex bg-slate-950/60 p-1 rounded-full border border-white/5">
                  <button onClick={() => setAuthMode('login')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Sign In</button>
                  <button onClick={() => setAuthMode('signup')} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>Register</button>
                </div>

                <form onSubmit={handleCredentialsAuth} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Laboratory Email" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50" required />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Security Cipher" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50" required />
                  </div>
                  <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : (authMode === 'login' ? <Zap size={18} /> : <ShieldCheck size={18} />)}
                    {loading ? 'Processing Node...' : (authMode === 'login' ? 'Initialize Uplink' : 'Create Registry')}
                  </button>
                </form>

                <div className="relative flex items-center py-2 opacity-30">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-black uppercase tracking-widest">Neural Link</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <button type="button" onClick={() => signInWithGoogle()} className="w-full py-4 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-100 active:scale-[0.98] transition-all shadow-xl">
                  <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
                  Continue with Google
                </button>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                   <button onClick={() => setStep('credentials')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2 mx-auto mb-6 transition-colors"><ArrowLeft size={14} /> Return to Terminal</button>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Identity Token</h2>
                   <p className="text-[10px] font-bold text-indigo-400 mt-2 tracking-widest uppercase">Transmitted to node: {email.slice(0,3)}***{email.slice(email.indexOf('@'))}</p>
                </div>
                
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx} 
                      ref={el => { otpRefs.current[idx] = el; }} 
                      type="text" 
                      maxLength={1} 
                      inputMode="numeric"
                      value={digit} 
                      onChange={(e) => handleOtpChange(idx, e.target.value)} 
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-12 h-16 bg-slate-950/80 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all shadow-inner" 
                    />
                  ))}
                </div>
                
                <button onClick={() => handleOtpVerify()} disabled={loading || otp.some(d => !d)} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Synchronize Identity
                </button>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(error || success) && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-8 p-5 rounded-3xl border text-[10px] font-bold flex items-center gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {error ? <TriangleAlert size={18} className="shrink-0" /> : <ShieldCheck size={18} className="shrink-0" />}
                <p className="leading-relaxed italic">{error || success}</p>
              </m.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </m.div>
    </div>
  );
}