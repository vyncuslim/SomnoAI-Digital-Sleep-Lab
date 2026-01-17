import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Shield, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../../components/Logo.tsx';
import { adminApi, authApi } from '../../../services/supabaseService.ts';

const m = motion as any;

/**
 * Robust Status Indicator for the restricted portal
 */
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
        if (otpRefs.current[0]) otpRefs.current[0].focus();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Token Request Failed. Grid Unreachable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && index === 5) executeOtpVerify(newOtp.join(''));
  };

  const executeOtpVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw verifyErr;
      
      if (!data?.user) throw new Error("Verification failed.");

      const isAdmin = await adminApi.checkAdminStatus(data.user.id);
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("Access Denied: Subject lacks administrative clearance.");
      }
      
      // Clean redirect to dashboard
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError(err.message || "Verification Token Invalid.");
      setOtp(['', '', '', '', '', '']);
      if (otpRefs.current[0]) otpRefs.current[0].focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Centered Logo & Branding */}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 flex flex-col items-center gap-4 z-10">
        <div className="w-24 h-24 mb-2 flex items-center justify-center">
          <Logo size={96} animated={true} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            SOMNOAI <span className="text-rose-600">LAB</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] mt-2">
            DIGITAL IDENTITY TELEMETRY
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[460px] z-10">
        <div className="bg-[#050a1f]/90 backdrop-blur-3xl border border-rose-600/10 rounded-[3.5rem] p-1 shadow-[0_0_80px_rgba(225,29,72,0.15)]">
          <div className="p-10 md:p-12 space-y-10">
            
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Restricted Portal</h2>
              <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.3em]">Command Deck Clearance Only</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-10">
                  <p className="text-[12px] text-slate-500 text-center leading-relaxed italic px-2 font-medium">
                    It integrates physiological indicator monitoring, AI deep insights and health advice into one, providing users with a full range of digital sleep experiments.
                  </p>

                  <form onSubmit={handleRequestToken} className="space-y-8">
                    <div className="space-y-6">
                      <div className="relative group">
                        <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={20} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Administrator Identifier"
                          className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-rose-600/40 outline-none transition-all placeholder:text-slate-900 font-bold shadow-inner"
                          required
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                           <StatusIndicator active={isEmailValid} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <button 
                        type="submit" 
                        disabled={isProcessing || !isEmailValid}
                        className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl hover:bg-rose-500 disabled:opacity-30"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Shield size={18} fill="currentColor" />}
                        {isProcessing ? 'SYNCHRONIZING...' : 'REQUEST ACCESS TOKEN'}
                      </button>
                    </div>
                  </form>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[11px] font-black text-rose-500 uppercase flex items-center gap-2 mx-auto hover:text-rose-400">
                      <ChevronLeft size={16} /> Back to Identifier
                    </button>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Handshake</h2>
                    <p className="text-[12px] text-slate-600 font-medium italic truncate px-8">Token dispatched to {email}</p>
                  </div>
                  <div className="flex justify-between gap-3 px-8">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        ref={el => { otpRefs.current[idx] = el; }} 
                        type="text" 
                        inputMode="numeric" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus(); }}
                        className="w-12 h-16 bg-slate-950/60 border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-rose-600 outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => executeOtpVerify()} 
                    disabled={isProcessing || otp.some(d => !d)} 
                    className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-rose-500 active:scale-[0.97] transition-all disabled:opacity-50 shadow-2xl"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                    VERIFY NEURAL TOKEN
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            {error && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border border-rose-500/20 bg-rose-500/10 rounded-[2rem] flex items-start gap-4 text-[11px] font-bold italic text-rose-400 leading-relaxed shadow-lg">
                <ShieldAlert size={18} className="shrink-0 mt-0.5" />
                <p>{error}</p>
              </m.div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center space-y-4 opacity-40 hover:opacity-100 transition-all duration-700 pb-12">
        <div className="flex flex-col items-center gap-2">
           <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-800 italic font-black">
             SomnoAI Digital Sleep Lab • Secure Grid Infrastructure
           </p>
           <p className="text-[9px] font-mono uppercase tracking-[0.8em] text-slate-800 italic font-black">
             @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
           </p>
        </div>
      </footer>
    </div>
  );
}
