import React, { useState, useRef, useEffect } from 'react';
import { Loader2, ChevronLeft, Mail, Zap, RefreshCw, ShieldAlert, ShieldCheck, Lock, Fingerprint, Globe, Cpu, Eye, EyeOff, LogIn as LoginIcon, UserPlus as RegisterIcon, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle, supabase } from './services/supabaseService.ts';
import { trackEvent } from './services/analytics.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  // 核心状态控制
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  // 表单数据
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  // 状态反馈
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const isMounted = useRef(true);

  const t = translations[lang].auth;

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleMainAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing) return;
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) {
      setError(lang === 'zh' ? "请输入身份标识 (Email)" : "Identifier required.");
      return;
    }

    if (authMode === 'otp') {
      // OTP 发送逻辑
      if (cooldown > 0) return;
      setIsProcessing(true);
      try {
        await signInWithEmailOTP(targetEmail, true);
        if (isMounted.current) {
          setStep('verify');
          setCooldown(60);
          setTimeout(() => otpRefs.current[0]?.focus(), 300);
        }
        trackEvent('auth_otp_request');
      } catch (err: any) {
        if (isMounted.current) setError(err.message || "OTP Dispatch Failed");
      } finally {
        if (isMounted.current) setIsProcessing(false);
      }
    } else {
      // 密码逻辑
      setIsProcessing(true);
      try {
        if (formType === 'register') {
          const { error: signUpErr } = await (supabase as any).auth.signUp({ email: targetEmail, password });
          if (signUpErr) throw signUpErr;
          setError(lang === 'zh' ? "注册成功！请查收验证邮件。" : "Registration successful! Check your email.");
        } else {
          const { error: signInErr } = await (supabase as any).auth.signInWithPassword({ email: targetEmail, password });
          if (signInErr) throw signInErr;
          onLogin();
        }
      } catch (err: any) {
        if (isMounted.current) setError(err.message || "Authentication Failed");
      } finally {
        if (isMounted.current) setIsProcessing(false);
      }
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
    setError(null);
    try {
      const session = await verifyOtp(email.trim().toLowerCase(), token);
      if (session) onLogin();
    } catch (err: any) {
      if (isMounted.current) setError(err.message || "Token Verification Failed");
    } finally {
      if (isMounted.current) setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* Top Header */}
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-6 relative z-10">
        <Logo size={96} animated={true} className="mx-auto" />
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">SOMNOAILAB</h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">DIGITAL IDENTITY TELEMETRY</p>
        </div>
      </m.div>

      {/* Main Terminal Card */}
      <GlassCard className="w-full max-w-[420px] p-2 border-white/5 bg-slate-900/40 relative z-10 rounded-[3.5rem] shadow-3xl">
        <div className="p-8 space-y-10">
          
          {/* Top Primary Toggle: OTP vs Password */}
          <div className="flex bg-slate-950/60 p-1.5 rounded-full border border-white/5">
            <button 
              onClick={() => { setAuthMode('otp'); setStep('input'); setError(null); }}
              className={`flex-1 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'otp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              OTP MODE
            </button>
            <button 
              onClick={() => { setAuthMode('password'); setStep('input'); setError(null); }}
              className={`flex-1 py-3.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${authMode === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              PASSWORD MODE
            </button>
          </div>

          <AnimatePresence mode="wait">
            {step === 'input' ? (
              <m.div key="input" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                
                {/* Secondary Toggle: Login vs Register */}
                <div className="flex justify-center gap-12 pt-2">
                   <button onClick={() => setFormType('login')} className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${formType === 'login' ? 'text-white border-indigo-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
                      <LoginIcon size={12} /> LOGIN
                   </button>
                   <button onClick={() => setFormType('register')} className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] transition-all pb-2 border-b-2 ${formType === 'register' ? 'text-white border-indigo-500' : 'text-slate-600 border-transparent hover:text-slate-400'}`}>
                      <RegisterIcon size={12} /> REGISTER
                   </button>
                </div>

                <form onSubmit={handleMainAction} className="space-y-6">
                  <div className="space-y-4">
                    {/* Email Input */}
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-semibold placeholder:text-slate-800"
                        required
                      />
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2 opacity-50 group-focus-within:opacity-100 transition-opacity">
                         <Key size={14} className="text-slate-700" />
                         <div className="w-10 h-6 bg-emerald-500/10 rounded-full flex items-center px-1 border border-emerald-500/20">
                            <div className="w-4 h-4 bg-emerald-400 rounded-full ml-auto shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                         </div>
                      </div>
                    </div>

                    {/* Password Input (Only in Password Mode) */}
                    {authMode === 'password' && (
                      <div className="relative group">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                          placeholder="Access Password"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-semibold placeholder:text-slate-800"
                          required
                          minLength={6}
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                           <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-700 hover:text-slate-400 transition-colors">
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                           </button>
                           <div className="w-10 h-6 bg-indigo-500/10 rounded-full flex items-center px-1 border border-indigo-500/20">
                              <div className="w-4 h-4 bg-indigo-400 rounded-full ml-auto shadow-[0_0_10px_rgba(129,140,248,0.5)]" />
                           </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Main Action Button */}
                  <button 
                    type="submit" disabled={isProcessing || (authMode === 'otp' && cooldown > 0)}
                    className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <LoginIcon size={18} />}
                    {isProcessing ? 'SYNCHRONIZING...' : (authMode === 'otp' ? (cooldown > 0 ? `WAIT ${cooldown}S` : 'REQUEST LAB TOKEN') : 'AUTHORIZE ACCESS')}
                  </button>

                  {/* Grid Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => signInWithGoogle()} className="py-4 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      <Globe size={14} className="text-slate-500" /> GOOGLE
                    </button>
                    <button type="button" onClick={onGuest} className="py-4 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-center gap-3 text-slate-400 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest">
                      <Fingerprint size={14} className="text-slate-500" /> SANDBOX MODE
                    </button>
                  </div>
                </form>
              </m.div>
            ) : (
              <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('input')} className="text-[10px] font-black text-indigo-400 hover:text-white uppercase flex items-center gap-2 mx-auto transition-colors">
                    <ChevronLeft size={14} /> Back to Identifier
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Neural Verification</h2>
                  <p className="text-[11px] text-slate-500 font-medium italic truncate px-4">Token dispatched to {email}</p>
                </div>
                
                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus(); }}
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>
                
                <button onClick={() => executeOtpVerify()} disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95 transition-all">
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isProcessing ? 'AUTHORIZING...' : 'VERIFY HANDSHAKE'}
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {/* Global Feedback (Errors/Success) */}
          {error && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] flex items-start gap-4 text-rose-400 text-[10px] font-bold italic leading-relaxed">
              <ShieldAlert size={16} className="shrink-0" />
              {error}
            </m.div>
          )}
        </div>
        
        {/* Card Footer Link */}
        <div className="pb-10 text-center">
           <button className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2 mx-auto justify-center group">
              <RefreshCw size={12} className="group-hover:rotate-180 transition-transform duration-700" /> CANNOT ACTIVATE ACCOUNT?
           </button>
        </div>
      </GlassCard>

      {/* Footer Branding */}
      <footer className="mt-16 text-center space-y-4 opacity-30 hover:opacity-100 transition-all pb-12">
        <div className="flex items-center gap-8 justify-center">
          <button onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-indigo-400 transition-colors">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-indigo-400 transition-colors">Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.6em] text-slate-700">© 2025 SOMNO LAB • NEURAL INFRASTRUCTURE</p>
      </footer>
    </div>
  );
};