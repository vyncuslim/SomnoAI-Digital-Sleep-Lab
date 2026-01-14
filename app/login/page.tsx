
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, Key, Fingerprint, TriangleAlert, LogIn, UserPlus, RefreshCcw } from 'lucide-react';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

interface LoginPageProps {
  isAdminPortal?: boolean;
}

export default function LoginPage({ isAdminPortal = false }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (step === 'input') {
        // Validation check
        if (!email || !email.includes('@')) throw new Error("Please enter a valid laboratory email.");
        
        await signInWithEmailOTP(email, mode === 'signup');
        setStep('verify');
        setResendTimer(60);
        setSuccess('Access Token transmitted. Check your email for the 6-digit passcode.');
      } else {
        if (otp.length < 6) throw new Error("Identity token must be 6 digits.");
        await verifyOtp(email, otp);
        // App.tsx onAuthStateChange will handle navigation after session is established
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message || 'Identity verification failed.';
      
      if (msg.toLowerCase().includes('failed to fetch')) {
        msg = "Laboratory Node Unreachable. Please check your internet connection or proxy settings.";
      } else if (msg.toLowerCase().includes('expired') || msg.toLowerCase().includes('invalid')) {
        msg = "The token has expired or is invalid. Please request a new code or try again.";
        setOtp(''); // Clear invalid OTP
      } else if (msg.toLowerCase().includes('rate limit')) {
        msg = "Rate limit reached. Please wait a few minutes before requesting a new token.";
      }
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || loading) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await signInWithEmailOTP(email, mode === 'signup');
      setResendTimer(60);
      setSuccess('A new Access Token has been transmitted to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Logo size={80} animated={true} className="mx-auto mb-8" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">
            {isAdminPortal ? 'Admin Command' : 'SomnoAI Lab'}
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">
            {isAdminPortal ? 'Secure Administrator Access' : 'Digital Biometric Access Protocol'}
          </p>
        </div>
        
        <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/10 shadow-3xl space-y-10">
          {step === 'input' && !isAdminPortal && (
            <div className="flex bg-slate-950/60 p-1.5 rounded-full border border-white/5">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <LogIn size={14} /> Login
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <UserPlus size={14} /> Register
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <m.form 
              key={`${mode}-${step}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleAuth} 
              className="space-y-6"
            >
              <div className="space-y-4">
                {step === 'input' && (
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="Terminal Email" 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[1.8rem] pl-16 pr-6 py-6 text-sm text-white outline-none focus:border-indigo-500/50" 
                      required 
                    />
                  </div>
                )}

                {step === 'verify' && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-4">
                       <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                       <span className="text-[9px] font-black uppercase text-indigo-400 tracking-widest">Awaiting Neural Token...</span>
                    </div>
                    <div className="relative group">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="text" 
                        value={otp} 
                        onChange={e => setOtp(e.target.value)} 
                        placeholder="6-Digit Passcode" 
                        autoFocus
                        className="w-full bg-slate-950/80 border border-white/10 rounded-[1.8rem] pl-16 pr-6 py-6 text-sm text-white font-mono tracking-[0.5em] outline-none focus:border-indigo-500/50 text-center" 
                        required 
                      />
                    </div>
                  </div>
                )}
              </div>

              <button disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={18} /> : step === 'verify' ? <Fingerprint size={18} /> : <Zap size={18} />}
                {loading ? 'Processing...' : step === 'verify' ? 'Authorize Identity' : mode === 'signup' ? 'Initiate Registration' : 'Request Access'}
              </button>

              {step === 'verify' && (
                <div className="flex flex-col gap-4">
                  <button 
                    type="button" 
                    onClick={handleResend}
                    disabled={resendTimer > 0 || loading}
                    className="w-full flex items-center justify-center gap-2 text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors tracking-widest disabled:opacity-30"
                  >
                    <RefreshCcw size={12} className={loading ? 'animate-spin' : ''} />
                    {resendTimer > 0 ? `Resend Token in ${resendTimer}s` : 'Resend Token'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => { setStep('input'); setSuccess(null); setError(null); }}
                    className="w-full text-[9px] font-black uppercase text-slate-600 hover:text-slate-400 transition-colors tracking-widest"
                  >
                    Edit Email Address
                  </button>
                </div>
              )}
            </m.form>
          </AnimatePresence>

          <div className="relative flex items-center py-2 opacity-10">
            <div className="flex-grow border-t border-white"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white"></div>
          </div>

          <button 
             onClick={() => signInWithGoogle()}
             className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl"
          >
             <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
             Google Neural Link
          </button>

          <p className="text-[9px] text-center text-slate-500 italic uppercase tracking-wider">
            Clearance required for laboratory interaction.
          </p>
          
          <AnimatePresence>
            {error && (
              <m.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0 }}
                className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-[11px] font-bold italic"
              >
                <div className="shrink-0 pt-0.5"><TriangleAlert size={16} /></div>
                <p className="leading-snug">{error}</p>
              </m.div>
            )}
            {success && (
              <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-[11px] text-center font-bold italic tracking-tight">
                {success}
              </m.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </m.div>
    </div>
  );
}
