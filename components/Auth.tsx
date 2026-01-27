import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, ShieldCheck, 
  Zap, Info, Fingerprint, Timer, Lock, Eye, EyeOff, UserPlus, ArrowRight, User, KeyRound, ChevronLeft, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { translations, Language } from '../services/i18n.ts';
import { authApi, profileApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const t = translations[lang].auth;
  
  // States
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [method, setMethod] = useState<'password' | 'otp'>('otp');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    setIsProcessing(true);
    setError(null);
    try {
      const { error: otpErr } = await authApi.sendOTP(email);
      if (otpErr) throw otpErr;
      setStep('verify');
      setCooldown(60);
      setSuccess(lang === 'zh' ? '验证码已发送' : 'Code dispatched');
    } catch (err: any) {
      setError(err.message || "SIGNAL_TRANSMISSION_FAILED");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      const verifyType = mode === 'register' ? 'signup' : 'email';
      const { data, error: verifyErr } = await authApi.verifyOTP(email, token, verifyType);
      if (verifyErr) throw verifyErr;
      
      if (mode === 'register' && fullName.trim()) {
        await profileApi.updateProfile({ full_name: fullName.trim() });
      }
      
      onLogin();
    } catch (err: any) {
      setError(err.message || "TOKEN_VALIDATION_ERROR");
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      if (mode === 'register') {
        const { error: signUpErr } = await authApi.signUp(email, password, { full_name: fullName.trim() });
        if (signUpErr) throw signUpErr;
        setStep('verify');
        setSuccess(lang === 'zh' ? '记录已创建。请输入邮箱验证码。' : 'Registry created. Enter code.');
      } else {
        const { error: signInErr } = await authApi.signIn(email, password);
        if (signInErr) throw signInErr;
        onLogin();
      }
    } catch (err: any) {
      setError(err.message || "AUTH_FAILED");
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

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans selection:bg-indigo-500/30">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-4">
        <Logo size={85} animated={true} className="mx-auto" />
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
            SomnoAI Digital Sleep <span className="text-indigo-500">Lab</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.5em] italic">Neural Access Protocol</p>
        </div>
      </m.div>

      <div className="w-full max-w-[400px] space-y-8">
        {step === 'request' && (
          <button 
            onClick={() => authApi.signInWithGoogle()}
            className="w-full py-6 bg-white text-slate-950 rounded-[2.2rem] flex items-center justify-center gap-4 text-[13px] font-black uppercase tracking-widest active:scale-[0.97] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] hover:bg-slate-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {lang === 'zh' ? '使用 Google 登录' : 'Continue with Google'}
          </button>
        )}

        {step === 'request' && (
          <div className="flex items-center gap-4 px-8 opacity-40">
             <div className="h-px flex-1 bg-white/20" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">or Terminal Ingress</span>
             <div className="h-px flex-1 bg-white/20" />
          </div>
        )}

        {step === 'request' && (
          <div className="bg-slate-900/60 p-1.5 rounded-full border border-white/5 flex relative">
            {['otp', 'password'].map((m) => (
              <button 
                key={m} 
                onClick={() => { setMethod(m as any); setError(null); setSuccess(null); }}
                className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-all ${method === m ? 'text-white' : 'text-slate-500'}`}
              >
                {m === 'otp' ? (lang === 'zh' ? '验证码' : 'Code') : (lang === 'zh' ? '密码' : 'Password')}
              </button>
            ))}
            <m.div 
              className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-3px)] bg-indigo-600 rounded-full shadow-lg"
              animate={{ x: method === 'password' ? '100%' : '0%' }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        )}

        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 'request' ? (
              <m.form key="request" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} onSubmit={method === 'otp' ? handleRequestOtp : handlePasswordAction} className="space-y-6">
                <div className="space-y-4">
                  {mode === 'register' && (
                    <div className="relative group">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input 
                        type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} 
                        placeholder={lang === 'zh' ? '受试者真实姓名' : 'Subject Full Name'}
                        className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic"
                        required
                      />
                    </div>
                  )}
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                    <input 
                      type="email" value={email} onChange={(e) => setEmail(e.target.value)} 
                      placeholder="Email Identifier"
                      className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic"
                      required
                    />
                  </div>
                  {method === 'password' && (
                    <div className="relative group">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors" size={20} />
                      <input 
                        type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Access Key"
                        className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-20 py-6 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex justify-center">
                  <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); setSuccess(null); }} className="text-[10px] font-black text-indigo-500 hover:text-white uppercase tracking-widest italic flex items-center gap-2">
                    {mode === 'login' ? (lang === 'zh' ? '创建新受试者节点' : 'Create New Subject Node') : (lang === 'zh' ? '返回核心终端' : 'Return to Core Terminal')} <ChevronRight size={10} />
                  </button>
                </div>

                <button 
                  type="submit" disabled={isProcessing || (method === 'otp' && cooldown > 0)}
                  className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-indigo-500 shadow-indigo-600/20 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                  <span className="ml-3">
                    {isProcessing ? 'SYNCHRONIZING...' : method === 'otp' ? (cooldown > 0 ? `RETRY IN ${cooldown}S` : 'REQUEST CODE') : (mode === 'register' ? 'COMMIT REGISTRY' : 'EXECUTE ACCESS')}
                  </span>
                </button>
              </m.form>
            ) : (
              <m.div key="verify" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8" >
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-black italic text-white uppercase">{lang === 'zh' ? '验证身份' : 'Verify Token'}</h3>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate px-4">
                    {lang === 'zh' ? '安全令牌已发送至注册标识符' : 'SECURITY TOKEN DISPATCHED TO IDENTIFIER'}
                  </p>
                </div>
                
                <div className="flex justify-between gap-2 px-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx} 
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text" inputMode="numeric" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-16 bg-[#050a1f] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={handleVerifyOtp} disabled={isProcessing || otp.some(d => !d)}
                    className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all disabled:opacity-30"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                    <span className="ml-3">{lang === 'zh' ? '验证并激活' : 'AUTHENTICATE & ACTIVATE'}</span>
                  </button>
                  <button onClick={() => { setStep('request'); setOtp(['','','','','','']); }} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                    <ChevronLeft size={12} /> {lang === 'zh' ? '重填身份信息' : 'Re-enter Identifier'}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(error || success) && (
              <m.div 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className={`p-5 rounded-3xl border flex items-start gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}
              >
                {error ? <ShieldAlert size={18} className="shrink-0 mt-0.5" /> : <ShieldCheck size={18} className="shrink-0 mt-0.5" />}
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed italic">{error || success}</p>
              </m.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-center pt-2">
          <button 
            type="button" onClick={onGuest} 
            className="px-10 py-4 bg-white/5 border border-white/10 rounded-full flex items-center justify-center gap-3 text-slate-600 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest active:scale-95"
          >
            <Fingerprint size={16} className="text-indigo-400" />
            RUN SANDBOX SIMULATION
          </button>
        </div>
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">
          SOMNOAI DIGITAL SLEEP LAB • SECURE INFRASTRUCTURE
        </p>
      </footer>
    </div>
  );
};