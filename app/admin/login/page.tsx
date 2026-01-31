
import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Shield, Lock, AlertCircle, RefreshCw, Terminal, Info, Clock, Zap, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../../components/Logo.tsx';
import { adminApi, authApi } from '../../../services/supabaseService.ts';

const m = motion as any;

const StatusIndicator = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-12 h-7 rounded-full border border-white/10 flex items-center px-1 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : ''}`}>
      <div className={`absolute inset-0 bg-indigo-600 transition-opacity duration-500 ${active ? 'opacity-20' : 'opacity-0'}`} />
      <div className={`w-5 h-5 rounded-full relative z-10 flex items-center justify-center transition-all duration-300 transform ${active ? 'translate-x-5 bg-white shadow-[0_0_10px_white]' : 'translate-x-0 bg-slate-800'}`}>
        {active && <div className="w-2 h-2 bg-indigo-600 rounded-full blur-[0.5px]" />}
      </div>
    </div>
  </div>
);

export default function AdminLoginPage() {
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{ message: string; isRateLimit?: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setIsProcessing(true);

    const targetEmail = email.trim().toLowerCase();
    
    // 防御性跳转：即便请求失败，我们也尝试进入下一步，因为验证码可能之前已经发过
    const transitionTimer = setTimeout(() => {
      setStep('verify');
      setIsProcessing(false);
    }, 2000);
    
    try {
      const { error: otpErr } = await authApi.sendOTP(targetEmail);
      
      if (otpErr) {
        if (otpErr.status === 429 || otpErr.message?.toLowerCase().includes('rate limit')) {
           setCooldown(60);
           setError({ message: "EMAIL_THROTTLED: Waiting 60s. Moving to entry terminal anyway...", isRateLimit: true });
           // 不抛出错误，而是让 transitionTimer 正常工作
           return;
        }
        throw otpErr;
      }
      
      clearTimeout(transitionTimer);
      setStep('verify');
      setCooldown(60); 
    } catch (err: any) {
      clearTimeout(transitionTimer);
      setError({ message: err.message || "Protocol link severed." });
    } finally {
      setIsProcessing(false);
      setTimeout(() => { otpRefs.current[0]?.focus(); }, 1000);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const val = value.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);
    if (val !== '' && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && index === 5) executeOtpVerify(newOtp.join(''));
  };

  const executeOtpVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);
    try {
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw new Error(verifyErr.message || "Invalid biometric token.");
      
      const isAdmin = await adminApi.checkAdminStatus();
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("ACCESS_DENIED: Identity lacks ADMIN clearance.");
      }
      
      window.location.replace('/#admin');
    } catch (err: any) {
      setError({ message: err.message || "Authorization failed." });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden text-left">
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/20 blur-[180px] rounded-full" />
      </div>

      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 space-y-6 relative z-10">
        <Logo size={100} animated={true} />
        <h1 className="text-4xl font-black tracking-tighter text-white italic uppercase leading-none">SomnoAI <span className="text-indigo-400">Lab</span></h1>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.8em] mt-3 opacity-60 italic">RESTRICTED COMMAND INTERFACE</p>
      </m.div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-1.5 shadow-[0_100px_150px_-50px_rgba(0,0,0,1)] overflow-hidden">
          <div className="p-10 md:p-14 space-y-10">
            <div className="flex items-center gap-3 justify-center">
              <Key size={18} className="text-indigo-500" />
              <h2 className="text-lg font-black italic text-white uppercase tracking-widest leading-none">Command Link</h2>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                  <form onSubmit={handleRequestToken} className="space-y-8">
                    <div className="relative group">
                      <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700" size={24} />
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Admin Identifier"
                        className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-indigo-600/40 outline-none transition-all font-bold italic"
                        required
                      />
                      <div className="absolute right-7 top-1/2 -translate-y-1/2"><StatusIndicator active={isEmailValid} /></div>
                    </div>
                    <button 
                      type="submit" disabled={isProcessing || !isEmailValid}
                      className="w-full py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-20 italic transition-all"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                      <span>{cooldown > 0 ? `COOLING (${cooldown}S)` : 'REQUEST LAB TOKEN'}</span>
                    </button>
                  </form>
                  <button 
                    onClick={() => setStep('verify')}
                    className="w-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-indigo-400 transition-colors text-center italic"
                  >
                    Bypass to Verify Token →
                  </button>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-3 mx-auto hover:text-white tracking-widest"><ChevronLeft size={16} /> RE-SPECIFY IDENTIFIER</button>
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 inline-block"><p className="text-[11px] text-indigo-400 font-bold italic truncate uppercase tracking-widest">{email}</p></div>
                  </div>
                  <div className="flex justify-between gap-3 px-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                        className="w-12 h-16 bg-black border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-indigo-600 outline-none transition-all"
                      />
                    ))}
                  </div>
                  <button onClick={() => executeOtpVerify()} disabled={isProcessing || otp.some(d => !d)} className="w-full py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-indigo-500 disabled:opacity-30 italic transition-all shadow-2xl">
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />} AUTHORIZE HANDSHAKE
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            {error && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 border rounded-[2.5rem] text-[10px] font-bold italic transition-all ${error.isRateLimit ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' : 'border-rose-500/30 bg-rose-500/5 text-rose-400'}`}>
                <div className="flex gap-4 items-start">
                  <AlertCircle size={18} className="shrink-0" />
                  <p className="leading-relaxed">{error.message}</p>
                </div>
              </m.div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="mt-20 opacity-20">
        <p className="text-[8px] font-mono font-black uppercase tracking-[0.8em] text-slate-600 italic">SECURE ACCESS NODE • v4.8.0</p>
      </footer>
    </div>
  );
}
