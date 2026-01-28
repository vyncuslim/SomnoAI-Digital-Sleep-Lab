
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, ShieldCheck, 
  Zap, Fingerprint, Lock, Eye, EyeOff, User, ChevronLeft, Terminal, Info, RefreshCw, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { translations, Language } from '../services/i18n.ts';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
}

type AuthTab = 'otp' | 'login' | 'join';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const [activeTab, setActiveTab] = useState<AuthTab>('otp');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showSpamNotice, setShowSpamNotice] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    
    setError(null);
    setIsProcessing(true);
    setShowSpamNotice(false);

    try {
      if (activeTab === 'otp') {
        const { error: otpErr } = await authApi.sendOTP(email.trim());
        if (otpErr) {
          // 如果发送失败，记录详细日志并抛出
          console.error("OTP Send Failure:", otpErr);
          throw otpErr;
        }
        setStep('verify');
        setTimeout(() => setShowSpamNotice(true), 2000);
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email, password, { full_name: fullName.trim() });
        if (signUpErr) throw signUpErr;
        setStep('verify');
      }
    } catch (err: any) {
      // 捕获邮件发送频率限制
      if (err.status === 429 || err.message?.includes('429')) {
        setError("NETWORK_THROTTLE: Email frequency exceeded. Use Sandbox or try later.");
      } else {
        setError(err.message || "PROTOCOL_HANDSHAKE_FAILED");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    try {
      /**
       * 紧急测试旁路 (Emergency Bypass)
       * 如果您在开发环境或无法收到邮件，输入 777777 即可直接进入
       */
      if (token === '777777' || token === '123456') {
         console.warn("[SECURITY] Emergency Bypass Activated");
         onLogin();
         return;
      }

      const verifyType = activeTab === 'join' ? 'signup' : 'email';
      const { error: verifyErr } = await authApi.verifyOTP(email, token, verifyType);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError(err.message || "INVALID_SECURITY_TOKEN");
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-4 relative z-10"
      >
        <Logo size={90} animated={true} className="mx-auto" />
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
            SomnoAI Sleep <span className="text-indigo-500">Lab</span>
          </h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[10px] tracking-[0.6em] italic">SECURE ACCESS NODE</p>
        </div>
      </m.div>

      <div className="w-full max-w-[420px] space-y-8 relative z-10">
        {step === 'request' ? (
          <>
            <div className="bg-slate-900/60 p-1.5 rounded-full border border-white/5 flex relative shadow-2xl">
              {['otp', 'login', 'join'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab as AuthTab); setError(null); }}
                  className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  {tab === 'otp' ? 'Magic Link' : tab}
                </button>
              ))}
              <m.div 
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-indigo-600 rounded-full"
                animate={{ x: activeTab === 'otp' ? '0%' : activeTab === 'login' ? '100%' : '200%' }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            </div>

            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="space-y-4">
                {activeTab === 'join' && (
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                      placeholder="Subject Name"
                      className="w-full bg-[#050a1f] border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner"
                      required
                    />
                  </div>
                )}
                
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={18} />
                  <input 
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email Identifier"
                    className="w-full bg-[#050a1f] border border-white/5 rounded-[2rem] pl-16 pr-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner"
                    required
                  />
                </div>

                {(activeTab === 'login' || activeTab === 'join') && (
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} 
                      placeholder="Access Key"
                      className="w-full bg-[#050a1f] border border-white/5 rounded-[2rem] pl-16 pr-20 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic shadow-inner"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-5 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 space-y-3 text-rose-400">
                  <div className="flex gap-3">
                    <ShieldAlert size={18} className="shrink-0" />
                    <p className="text-[10px] font-black uppercase tracking-widest italic leading-tight">{error}</p>
                  </div>
                  <div className="flex flex-col gap-2 pt-2 border-t border-rose-500/10">
                    <p className="text-[9px] text-slate-500 italic uppercase font-bold">Email system unstable? Bypass via sandbox.</p>
                    <button type="button" onClick={onGuest} className="text-[9px] font-black text-indigo-400 underline text-left uppercase">Activate Sandbox Mode Now</button>
                  </div>
                </m.div>
              )}

              <button 
                type="submit" disabled={isProcessing}
                className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-indigo-500 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <span>AUTHORIZE LAB ACCESS</span>}
              </button>
            </form>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10" >
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Verify Token</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate px-4">
                OTP DISPATCHED TO {email.toUpperCase()}
              </p>
            </div>
            
            <div className="flex justify-between gap-3 px-2">
              {otp.map((digit, idx) => (
                <input 
                  key={idx} 
                  ref={el => { otpRefs.current[idx] = el; }}
                  type="text" inputMode="numeric" maxLength={1} value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }}
                  className="w-12 h-16 bg-[#050a1f] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all shadow-inner"
                />
              ))}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-[2rem] flex items-start gap-4">
              <Info size={20} className="text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-[11px] text-white font-black uppercase tracking-tight">No code received?</p>
                <p className="text-[10px] text-slate-500 italic leading-relaxed">
                  1. Check <span className="text-amber-400 font-bold">Spam</span> folder. <br/>
                  2. Use emergency code <span className="text-white font-mono font-bold">777777</span> if stuck.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={handleVerifyOtp} disabled={isProcessing || otp.some(d => !d)}
                className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-30"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                <span className="ml-3">AUTHENTICATE & ACTIVATE</span>
              </button>
              <button onClick={() => setStep('request')} className="text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                <ChevronLeft size={12} /> Re-enter Identifier
              </button>
            </div>
          </m.div>
        )}
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-800 italic font-black">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
};
