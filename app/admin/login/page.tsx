import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../../components/Logo.tsx';
import { adminApi, authApi } from '../../../services/supabaseService.ts';

const m = motion as any;

const StatusIndicator = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-10 h-6 rounded-full border border-white/10 flex items-center px-0.5 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : ''}`}>
      <div className={`absolute inset-0 bg-rose-600 transition-opacity duration-500 ${active ? 'opacity-20' : 'opacity-0'}`} />
      <div className={`w-4 h-4 rounded-full relative z-10 flex items-center justify-center transition-all duration-300 transform ${active ? 'translate-x-4 bg-white shadow-[0_0_8px_white]' : 'translate-x-0 bg-slate-700'}`}>
        {active && <div className="w-2 h-2 bg-rose-600 rounded-full blur-[0.5px]" />}
      </div>
    </div>
  </div>
);

export default function AdminLoginPage() {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  // Use a ref to strictly prevent concurrent verification calls (fixes 403 race condition)
  const verificationLock = useRef(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRequestToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || !isEmailValid) return;
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    setIsProcessing(true);
    
    try {
      if (cooldown > 0) return;
      
      const { error: otpErr } = await authApi.sendOTP(targetEmail);
      if (otpErr) throw otpErr;
      
      setStep('verify');
      setCooldown(60);
      
      setTimeout(() => {
        const firstInput = otpRefs.current[0];
        if (firstInput) firstInput.focus();
      }, 300);
    } catch (err: any) {
      setError(err.message || "Identity synchronization failed. Terminal unreachable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const val = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    if (val !== '' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }

    // Only auto-verify if all digits are filled and we aren't already verifying
    if (newOtp.every(d => d !== '') && index === 5 && !verificationLock.current) {
      executeOtpVerify(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const executeOtpVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing || verificationLock.current) return;
    
    verificationLock.current = true;
    setIsProcessing(true);
    setError(null);
    
    try {
      const targetEmail = email.trim().toLowerCase();
      const { data, error: verifyErr } = await authApi.verifyOTP(targetEmail, token);
      
      if (verifyErr) {
        if (verifyErr.status === 403) {
          throw new Error("Handshake Rejected: The code is invalid or this identity lacks administrative clearance.");
        }
        throw verifyErr;
      }
      
      if (!data?.user) throw new Error("Verification failed: Neural session corrupted.");

      const isAdmin = await adminApi.checkAdminStatus(data.user.id);
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("Access Denied: Subject level insufficient for Lab Command.");
      }
      
      window.location.hash = '#/admin';
    } catch (err: any) {
      console.warn("OTP verification attempt failed:", err.message);
      setError(err.message || "Neural handshake invalid.");
      // Reset OTP to allow retry
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => {
        const firstInput = otpRefs.current[0];
        if (firstInput) firstInput.focus();
      }, 100);
    } finally {
      setIsProcessing(false);
      verificationLock.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <m.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="text-center mb-10 flex flex-col items-center gap-4 z-10"
      >
        <Logo size={80} animated={true} />
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
            SOMNOAI <span className="text-rose-600">LAB</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.5em] mt-2">
            RESTRICTED INFRASTRUCTURE
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[440px] z-10">
        <div className="bg-[#050a1f]/95 backdrop-blur-3xl border border-rose-600/10 rounded-[3rem] p-1 shadow-2xl relative">
          <div className="p-8 md:p-10 space-y-10 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Command Authentication</h2>
              <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.2em]">OTP-Only Restricted Access</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div 
                  key="input" 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-8"
                >
                  <p className="text-[11px] text-slate-500 text-center leading-relaxed italic px-4">
                    Enter your administrator identifier to request a secure access token.
                  </p>

                  <form onSubmit={handleRequestToken} className="space-y-6">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={20} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Identifier"
                        className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-14 pr-24 py-5 text-sm text-white focus:border-rose-600/40 outline-none transition-all font-bold"
                        required
                        autoComplete="email"
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        <StatusIndicator active={isEmailValid} />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      disabled={isProcessing || !isEmailValid}
                      className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl hover:bg-rose-500 active:scale-[0.98] transition-all disabled:opacity-30"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Shield size={16} fill="currentColor" />}
                      {isProcessing ? 'SYNCHRONIZING...' : 'REQUEST LAB TOKEN'}
                    </button>
                  </form>
                </m.div>
              ) : (
                <m.div 
                  key="verify" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-10"
                >
                  <div className="text-center space-y-4">
                    <button 
                      onClick={() => setStep('input')} 
                      className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-2 mx-auto hover:text-rose-400"
                    >
                      <ChevronLeft size={14} /> Back
                    </button>
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">Identity Handshake</h3>
                      <p className="text-[11px] text-slate-600 font-medium italic px-4 truncate">Sent to {email}</p>
                    </div>
                  </div>

                  <div className="flex justify-between gap-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text" 
                        inputMode="numeric" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className="w-10 h-14 bg-slate-950/60 border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-rose-600 outline-none transition-all"
                      />
                    ))}
                  </div>

                  <button 
                    onClick={() => executeOtpVerify()} 
                    disabled={isProcessing || otp.some(d => !d)} 
                    className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-rose-500 active:scale-[0.97] transition-all disabled:opacity-50 shadow-2xl"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    VERIFY NEURAL TOKEN
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            {error && (
              <m.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-5 border border-rose-500/20 bg-rose-500/10 rounded-[2rem] flex items-start gap-4 text-[11px] font-bold italic text-rose-400"
              >
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </m.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}