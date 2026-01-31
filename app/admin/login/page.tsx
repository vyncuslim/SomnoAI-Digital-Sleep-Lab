
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
  const [error, setError] = useState<{ message: string; code?: string; isRateLimit?: boolean } | null>(null);
  const [cooldown, setCooldown] = useState(0);
  
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const requestLock = useRef(false);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const handleRequestToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // 物理锁定：如果正在处理、冷却中或已锁定，则拦截
    if (isProcessing || requestLock.current || !isEmailValid || cooldown > 0) return;
    
    setError(null);
    setIsProcessing(true);
    requestLock.current = true;

    const targetEmail = email.trim().toLowerCase();
    
    try {
      const { error: otpErr } = await authApi.sendOTP(targetEmail);
      
      // 处理 Supabase 特有的 429 节流
      if (otpErr) {
        if (otpErr.status === 429 || otpErr.message?.toLowerCase().includes('rate limit')) {
           throw { status: 429, message: "EMAIL_THROTTLED: Global mail server is resting. Project limit: 1 request per 60s." };
        }
        throw otpErr;
      }
      
      setStep('verify');
      setCooldown(60); // 发送成功后也强制进入 60s 冷却，防止重复发送
      setTimeout(() => { otpRefs.current[0]?.focus(); }, 400);
    } catch (err: any) {
      const isRateLimit = err.status === 429 || err.message?.includes('EMAIL_THROTTLED');
      if (isRateLimit) {
        setError({ 
          message: "NODE_THROTTLED: Access gateway cooling down. Please wait 60 seconds to avoid project lockout.", 
          code: "RATE_LIMIT",
          isRateLimit: true
        });
        setCooldown(60);
      } else {
        setError({ message: err.message || "Protocol Handshake failed. Connection unstable." });
      }
    } finally {
      setIsProcessing(false);
      requestLock.current = false;
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
      if (verifyErr) throw new Error(verifyErr.message || "Security token incorrect or has expired.");
      if (!data?.user) throw new Error("Neural identity not established.");
      
      const isAdmin = await adminApi.checkAdminStatus();
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("ACCESS_DENIED: Your identifier lacks ADMIN clearance level.");
      }
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError({ message: err.message || "Critical Access Violation." });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#010409] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 blur-[180px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-600/5 blur-[180px] rounded-full" />
      </div>

      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16 space-y-6 relative z-10">
        <div className="relative inline-block">
           <Logo size={120} animated={true} />
           <m.div animate={{ opacity: [0.1, 0.4, 0.1] }} transition={{ repeat: Infinity, duration: 4 }} className="absolute -inset-6 border border-white/5 rounded-full" />
        </div>
        <div className="space-y-1 text-center flex flex-col items-center">
          <h1 className="text-4xl font-black tracking-tighter text-white italic leading-none uppercase">SomnoAI Digital <span className="text-indigo-400">Lab</span></h1>
          <p className="text-slate-600 font-black uppercase text-[10px] tracking-[0.8em] mt-3 opacity-60">RESTRICTED COMMAND INTERFACE</p>
        </div>
      </m.div>

      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/5 rounded-[4rem] p-1.5 shadow-2xl overflow-hidden relative">
          <div className="p-10 md:p-14 space-y-12">
            <div className="flex items-center gap-3 justify-center">
              <Key size={18} className="text-indigo-500" />
              <h2 className="text-lg font-black italic text-white uppercase tracking-widest leading-none">Command Handshake</h2>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-10">
                  <form onSubmit={handleRequestToken} className="space-y-8">
                    <div className="relative group">
                      <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={24} />
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Admin Identifier"
                        className="w-full bg-black/60 border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-indigo-600/40 outline-none transition-all font-bold italic shadow-inner"
                        required
                      />
                      <div className="absolute right-7 top-1/2 -translate-y-1/2"><StatusIndicator active={isEmailValid} /></div>
                    </div>
                    <button 
                      type="submit" disabled={isProcessing || !isEmailValid || cooldown > 0}
                      className="w-full py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl hover:bg-indigo-500 active:scale-[0.98] disabled:opacity-20 italic transition-all relative overflow-hidden"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : (cooldown > 0 ? <Clock size={18} /> : <Zap size={20} fill="currentColor" />)}
                      <span>{cooldown > 0 ? `COOLING (${cooldown}S)` : 'EXECUTE HANDSHAKE'}</span>
                      {isProcessing && <m.div animate={{ x: ['-100%', '100%'] }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-white/10" />}
                    </button>
                  </form>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[9px] font-black text-slate-500 uppercase flex items-center gap-3 mx-auto hover:text-white tracking-widest"><ChevronLeft size={16} /> RE-SPECIFY IDENTIFIER</button>
                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/5 inline-block"><p className="text-[11px] text-slate-400 font-bold italic truncate uppercase tracking-widest">{email}</p></div>
                  </div>
                  <div className="flex justify-between gap-3 px-2">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} ref={(el) => { otpRefs.current[idx] = el; }}
                        type="text" inputMode="numeric" maxLength={1} value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                        className="w-12 h-16 bg-black border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-indigo-600 outline-none transition-all shadow-inner"
                      />
                    ))}
                  </div>
                  <button onClick={() => executeOtpVerify()} disabled={isProcessing || otp.some(d => !d)} className="w-full py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-indigo-500 disabled:opacity-30 italic transition-all shadow-2xl">
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />} VERIFY PROTOCOL
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            {error && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 border rounded-[2.5rem] flex flex-col items-start gap-3 text-[10px] font-bold italic transition-all ${error.code === 'RATE_LIMIT' ? 'border-amber-500/30 bg-amber-500/5 text-amber-400' : 'border-rose-500/30 bg-rose-500/5 text-rose-400'}`}>
                <div className="flex gap-4 items-start text-left">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="space-y-1">
                     <p className="uppercase tracking-widest text-[8px] opacity-60">System Security Log:</p>
                     <p className="leading-relaxed">{error.message}</p>
                  </div>
                </div>
              </m.div>
            )}
          </div>
        </div>
      </div>
      
      <footer className="mt-20 opacity-20">
        <p className="text-[8px] font-mono font-black uppercase tracking-[0.8em] text-slate-600 italic">SECURE ACCESS NODE • v4.4.0</p>
      </footer>
    </div>
  );
}
