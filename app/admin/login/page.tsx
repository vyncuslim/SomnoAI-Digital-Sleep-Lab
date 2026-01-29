import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Shield, Lock, AlertCircle, RefreshCw, Terminal, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../../components/Logo.tsx';
import { adminApi, authApi } from '../../../services/supabaseService.ts';

const m = motion as any;

const StatusIndicator = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-12 h-7 rounded-full border border-white/10 flex items-center px-1 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-rose-500/40 shadow-[0_0_15px_rgba(225,29,72,0.3)]' : ''}`}>
      <div className={`absolute inset-0 bg-rose-600 transition-opacity duration-500 ${active ? 'opacity-20' : 'opacity-0'}`} />
      <div className={`w-5 h-5 rounded-full relative z-10 flex items-center justify-center transition-all duration-300 transform ${active ? 'translate-x-5 bg-white shadow-[0_0_10px_white]' : 'translate-x-0 bg-slate-800'}`}>
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
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const verificationLock = useRef(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRequestToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || !isEmailValid) return;
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    setIsProcessing(true);
    
    try {
      const { error: otpErr } = await authApi.sendOTP(targetEmail);
      if (otpErr) throw otpErr;
      
      setStep('verify');
      setCooldown(60);
      
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 400);
    } catch (err: any) {
      console.error("OTP Error:", err);
      if (err.message?.includes('rate limit')) {
        setError({ 
          message: "Command rate limit reached. The neural bridge needs time to recalibrate. Please try again in 15-30 minutes.", 
          code: "RATE_LIMIT" 
        });
      } else {
        setError({ message: err.message || "Laboratory Handshake failed. Connection unstable." });
      }
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

    if (newOtp.every(d => d !== '') && index === 5 && !verificationLock.current) {
      executeOtpVerify(newOtp.join(''));
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
        throw new Error("Security token incorrect or has expired. Request a new handshake.");
      }
      
      if (!data?.user) throw new Error("Sync Error: Neural identity not established.");

      // Check Administrative status
      const isAdmin = await adminApi.checkAdminStatus();
      
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("Identity verified but your clearance is INSUFFICIENT for command access.");
      }
      
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError({ message: err.message || "Critical Access Violation." });
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsProcessing(false);
      verificationLock.current = false;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-16 space-y-6 relative z-10"
      >
        <Logo size={100} animated={true} />
        <div className="space-y-2 text-center flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tighter text-white italic leading-none uppercase">
            SomnoAI Digital <span className="text-rose-600">Lab</span>
          </h1>
          <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.8em] mt-2 opacity-80">RESTRICTED COMMAND INTERFACE</p>
        </div>
      </m.div>

      <div className="w-full max-w-[480px] relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-rose-600/20 rounded-[4rem] p-1.5 shadow-[0_100px_150px_-50px_rgba(0,0,0,0.8)] overflow-hidden">
          <div className="p-10 md:p-14 space-y-12">
            <div className="flex items-center gap-3 justify-center mb-4">
              <Terminal size={18} className="text-rose-500" />
              <h2 className="text-lg font-black italic text-white uppercase tracking-widest leading-none">Command Handshake</h2>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                  <form onSubmit={handleRequestToken} className="space-y-8">
                    <div className="relative group">
                      <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={24} />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Admin Identifier"
                        className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-rose-600/40 outline-none transition-all font-bold italic shadow-inner"
                        required
                      />
                      <div className="absolute right-7 top-1/2 -translate-y-1/2">
                        <StatusIndicator active={isEmailValid} />
                      </div>
                    </div>
                    
                    <button 
                      type="submit" 
                      disabled={isProcessing || !isEmailValid}
                      className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4 shadow-2xl hover:bg-rose-500 active:scale-[0.98] disabled:opacity-20 transition-all italic"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Shield size={20} fill="currentColor" />}
                      REQUEST ACCESS TOKEN
                    </button>
                  </form>
                  
                  <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl flex gap-4">
                    <Info size={18} className="text-rose-500/60 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 italic leading-relaxed font-medium uppercase tracking-widest">
                      Session data is audited and bound to node ID. Access violation will trigger kernel lock.
                    </p>
                  </div>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[10px] font-black text-rose-500 uppercase flex items-center gap-3 mx-auto hover:text-rose-400 transition-colors tracking-widest">
                      <ChevronLeft size={16} /> RE-SPECIFY IDENTIFIER
                    </button>
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 inline-block">
                      <p className="text-[11px] text-slate-400 font-bold italic truncate uppercase tracking-widest">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between gap-3 px-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text" 
                        inputMode="numeric" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                        className="w-12 h-16 bg-black border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-rose-600 outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-4">
                    <button 
                      onClick={() => executeOtpVerify()} 
                      disabled={isProcessing || otp.some(d => !d)} 
                      className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-4 hover:bg-rose-500 active:scale-[0.98] disabled:opacity-30 transition-all shadow-2xl italic"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                      VERIFY COMMAND TOKEN
                    </button>
                    
                    <div className="text-center">
                      <button 
                        onClick={() => handleRequestToken()} 
                        disabled={cooldown > 0 || isProcessing}
                        className="text-[10px] font-black text-slate-500 uppercase hover:text-white transition-all tracking-[0.3em] disabled:opacity-30"
                      >
                        {cooldown > 0 ? `RE-REQUEST IN ${cooldown}S` : 'RESEND HANDSHAKE'}
                      </button>
                    </div>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <m.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  className={`p-6 border rounded-[2.5rem] flex items-start gap-5 text-[11px] font-bold italic tracking-wide transition-all ${
                    error.code === 'RATE_LIMIT' ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                  }`}
                >
                  <AlertCircle size={22} className="shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{error.message}</p>
                </m.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
      <footer className="mt-20 text-center opacity-40 pointer-events-none">
        <p className="text-[10px] font-black uppercase tracking-[0.6em] text-slate-800 italic">@2026 SomnoAI DIGITAL LABORATORY • COMMAND NODE</p>
      </footer>
    </div>
  );
}