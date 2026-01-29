import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ShieldAlert, Zap, Lock, Eye, EyeOff, User, 
  ChevronLeft, Info, FlaskConical, AlertTriangle, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh';
  onLogin: () => void;
  onGuest: () => void; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'join' | 'otp'>('login');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{message: string, isRateLimit?: boolean} | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'otp') {
        const { error: otpErr } = await authApi.sendOTP(email.trim());
        if (otpErr) throw otpErr;
        setStep('verify');
        setTimeout(() => otpRefs.current[0]?.focus(), 200);
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() });
        if (signUpErr) throw signUpErr;
        setStep('verify');
        setActiveTab('otp');
      }
    } catch (err: any) {
      const isRateLimit = err.message?.toLowerCase().includes('rate limit') || err.status === 429;
      setError({ 
        message: isRateLimit 
          ? "SYSTEM THROTTLE: Email limit reached. Please wait 60 seconds or use Sandbox Mode." 
          : (err.message || "PROTOCOL_HANDSHAKE_FAILED"),
        isRateLimit 
      });
      // CRITICAL: Ensure loader stops on error to prevent "spinning forever"
      setIsProcessing(false);
    } finally {
      // Only clear processing if we haven't successfully moved to verify step
      if (step === 'request' && activeTab !== 'otp' && activeTab !== 'join') {
        setIsProcessing(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: verifyErr } = await authApi.verifyOTP(email, token);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError({ message: err.message || "INVALID_SECURITY_TOKEN" });
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-hidden">
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col items-center text-center mb-12 space-y-8"
      >
        <div className="relative p-6 bg-indigo-500/5 rounded-[3rem] border border-white/5">
          <Logo size={100} animated={true} className="mx-auto" />
        </div>
        <div className="space-y-3">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SomnoAI <span className="text-indigo-500">Sleep Lab</span></h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[10px] tracking-[0.8em] italic">SECURE ACCESS NODE • V3.2</p>
        </div>
      </m.div>

      <div className="w-full max-w-[480px] space-y-8">
        {step === 'request' ? (
          <>
            <div className="bg-slate-900/60 p-2 rounded-full border border-white/5 flex relative shadow-2xl">
              {['login', 'join', 'otp'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab as any); setError(null); }}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {tab === 'otp' ? 'Magic' : tab}
                </button>
              ))}
              <m.div 
                className="absolute top-2 left-2 bottom-2 w-[calc(33.33%-4px)] bg-indigo-600 rounded-full shadow-lg"
                animate={{ x: activeTab === 'login' ? '0%' : activeTab === 'join' ? '100%' : '200%' }}
              />
            </div>

            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="space-y-4">
                {activeTab === 'join' && (
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                )}
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                {activeTab !== 'otp' && (
                  <div className="relative">
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-6 rounded-[2rem] border flex gap-4 items-start ${error.isRateLimit ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {error.isRateLimit ? <AlertTriangle size={20} className="shrink-0 mt-0.5" /> : <ShieldAlert size={20} className="shrink-0 mt-0.5" />}
                  <p className="text-[11px] font-black uppercase italic tracking-wide leading-relaxed">{error.message}</p>
                </m.div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] flex items-center justify-center gap-4 active:scale-[0.98] transition-all hover:bg-indigo-500">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <span>ESTABLISH LINK</span>}
              </button>
            </form>

            <button onClick={onGuest} className="w-full py-5 border border-indigo-500/20 text-indigo-400 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-500/5 transition-all">
              <FlaskConical size={16} /> Bypass to Sandbox Mode
            </button>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-12" >
            <div className="text-center space-y-4">
              <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Verify Identity</h3>
              <div className="inline-block px-6 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full">
                <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">{email.toUpperCase()}</p>
              </div>
            </div>
            <div className="flex justify-between gap-4 px-2">
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value.slice(-1);
                  setOtp(newOtp);
                  if (e.target.value && idx < 5) otpRefs.current[idx + 1]?.focus();
                }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} className="w-14 h-20 bg-[#050a1f] border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all" />
              ))}
            </div>
            
            <div className="space-y-6">
              <button onClick={handleVerifyOtp} disabled={isProcessing || otp.some(d => !d)} className="w-full py-7 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.5em] shadow-[0_20px_40px_rgba(79,70,229,0.3)] active:scale-[0.98] transition-all hover:bg-indigo-500">
                {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <span>AUTHORIZE ACCESS</span>}
              </button>
              <button onClick={() => { setStep('request'); setError(null); setIsProcessing(false); }} className="w-full text-[11px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-3 transition-colors">
                <ChevronLeft size={16} /> Back to Identifier
              </button>
            </div>
          </m.div>
        )}
      </div>
    </div>
  );
};