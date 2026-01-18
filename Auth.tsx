
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ChevronLeft, Mail, ShieldAlert, ShieldCheck, 
  Lock, Fingerprint, Eye, EyeOff, LogIn as LoginIcon, 
  UserPlus as RegisterIcon, Key, Hexagon, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { authApi } from './services/supabaseService.ts';
import { trackEvent } from './services/analytics.ts';

const m = motion as any;

/**
 * 紧凑型生物识别开关 (Biometric Switch)
 */
const BiometricSwitch = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-10 h-6 rounded-full border border-white/10 flex items-center px-0.5 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]' : ''}`}>
      <m.div 
        animate={{ opacity: active ? 0.35 : 0 }}
        className="absolute inset-0 bg-[#00f2fe]"
      />
      <m.div 
        animate={{ x: active ? 16 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={`w-4 h-4 rounded-full relative z-10 flex items-center justify-center ${active ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' : 'bg-slate-700'}`}
      >
        {active && <div className="w-2 h-2 bg-[#00f2fe] rounded-full blur-[1px]" />}
      </m.div>
    </div>
  </div>
);

/**
 * 装饰性六角秘钥 (Hex Key)
 */
const HexKeyIcon = ({ active }: { active: boolean }) => (
  <div className={`p-1.5 rounded-lg border border-white/5 bg-[#0f121e] flex items-center justify-center transition-all duration-700 ${active ? 'text-indigo-400 border-indigo-500/30 shadow-[0_0_10px_rgba(79,70,229,0.15)]' : 'text-slate-800'}`}>
    <div className="relative">
      <Hexagon size={14} strokeWidth={2.5} />
      <Key size={7} strokeWidth={3} className="absolute inset-0 m-auto" />
    </div>
  </div>
);

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const t = translations[lang].auth;
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('password');
  const [formType, setFormType] = useState<'login' | 'register' | 'reset'>('login');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGoogleProcessing, setIsGoogleProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPasswordValid = password.length >= 6;

  const handleMainAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || isGoogleProcessing) return;
    setError(null);
    setMessage(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setIsProcessing(true);
    try {
      if (formType === 'reset') {
        const { error: resetErr } = await authApi.resetPassword(targetEmail);
        if (resetErr) throw resetErr;
        setMessage(lang === 'zh' ? "密码重置请求已发送。" : "Password reset request sent.");
      } else if (authMode === 'otp') {
        if (cooldown > 0) return;
        const { error: otpErr } = await authApi.sendOTP(targetEmail);
        if (otpErr) throw otpErr;
        setStep('verify');
        setCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 400);
      } else {
        if (formType === 'register') {
          const { data, error: signUpErr } = await authApi.signUp(targetEmail, password);
          if (signUpErr) throw signUpErr;
          
          if (data?.session) {
            onLogin();
          } else {
            // 自动跳转到 OTP 验证界面
            setAuthMode('otp');
            setStep('verify');
            setMessage(lang === 'zh' ? "账户创建成功，验证令牌已发送至您的邮箱。" : "Account created. Verification token dispatched to your email.");
            // 延迟聚焦以确保 DOM 已切换
            setTimeout(() => otpRefs.current[0]?.focus(), 500);
          }
          trackEvent('auth_signup');
        } else {
          const { error: signInErr } = await authApi.signIn(targetEmail, password);
          if (signInErr) throw signInErr;
          onLogin();
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication Sequence Interrupted.");
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
    setError(null);
    try {
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw verifyErr;
      if (data.session) onLogin();
    } catch (err: any) {
      setError(err.message || "Neural Token Invalid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (isProcessing || isGoogleProcessing) return;
    setError(null);
    setIsGoogleProcessing(true);
    try {
      const { error: gErr } = await authApi.signInWithGoogle();
      if (gErr) throw gErr;
    } catch (err: any) {
      setError(err.message || "Google Handshake Failed.");
      setIsGoogleProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-[#020617] font-sans">
      <m.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-8 space-y-4"
      >
        <Logo size={70} animated={true} />
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">{t.lab}</h1>
          <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em] opacity-80">{t.tagline}</p>
        </div>
      </m.div>

      <div className="w-full max-w-[420px]">
        <div className="bg-[#050a1f]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[3rem] p-1 shadow-2xl overflow-hidden">
          <div className="p-8 md:p-10 space-y-8">
            
            {/* Mode Switches */}
            <div className="flex bg-black/40 p-1 rounded-full border border-white/5 relative">
              <button 
                onClick={() => { setAuthMode('otp'); setStep('input'); setFormType('login'); }}
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-colors ${authMode === 'otp' ? 'text-white' : 'text-slate-500'}`}
              >
                OTP MODE
              </button>
              <button 
                onClick={() => { setAuthMode('password'); setStep('input'); setFormType('login'); }}
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-colors ${authMode === 'password' ? 'text-white' : 'text-slate-500'}`}
              >
                PASSWORD MODE
              </button>
              <m.div 
                className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]"
                animate={{ x: authMode === 'password' ? '100%' : '0%' }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                  
                  {/* Action Tabs */}
                  <div className="flex justify-center gap-10">
                    <button 
                      onClick={() => setFormType('login')} 
                      className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest pb-1.5 border-b-2 transition-all ${formType === 'login' ? 'text-indigo-400 border-indigo-400' : 'text-slate-800 border-transparent hover:text-slate-600'}`}
                    >
                      <LoginIcon size={14} /> LOGIN
                    </button>
                    <button 
                      onClick={() => setFormType('register')} 
                      className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-widest pb-1.5 border-b-2 transition-all ${formType === 'register' ? 'text-indigo-400 border-indigo-400' : 'text-slate-800 border-transparent hover:text-slate-600'}`}
                    >
                      <RegisterIcon size={14} /> REGISTER
                    </button>
                  </div>

                  <form onSubmit={handleMainAction} className="space-y-6">
                    <p className="text-[11px] text-slate-500 text-center leading-relaxed italic px-4 font-medium">
                      {translations[lang].dashboard.manifesto}
                    </p>

                    <div className="space-y-4">
                      <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500" size={18} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder={t.emailLabel}
                          className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-14 pr-28 py-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-900 font-bold"
                          required
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                           <HexKeyIcon active={isEmailValid} />
                           <BiometricSwitch active={isEmailValid} />
                        </div>
                      </div>

                      {authMode === 'password' && (
                        <div className="relative group">
                          <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400" size={18} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t.passwordLabel}
                            className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-14 pr-28 py-4 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-900 font-bold"
                            required
                          />
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-800 hover:text-slate-400 transition-colors mr-1">
                               {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                             </button>
                             <HexKeyIcon active={isPasswordValid} />
                             <BiometricSwitch active={isPasswordValid} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-2">
                      <button 
                        type="submit" 
                        disabled={isProcessing || isGoogleProcessing}
                        className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-xl hover:bg-indigo-500 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={16} fill="currentColor" />}
                        {isProcessing ? 'SYNCHRONIZING...' : formType === 'register' ? t.confirmRegister : t.authorize}
                      </button>

                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button" 
                          onClick={handleGoogleLogin} 
                          disabled={isProcessing || isGoogleProcessing}
                          className="py-4 bg-[#0f121e] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                        >
                          {isGoogleProcessing ? <Loader2 className="animate-spin" size={16} /> : <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>}
                          {t.google}
                        </button>
                        <button 
                          type="button" 
                          onClick={onGuest} 
                          disabled={isProcessing || isGoogleProcessing}
                          className="py-4 bg-[#0f121e] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest disabled:opacity-30"
                        >
                          <Fingerprint size={20} className="text-indigo-400" /> {t.sandbox}
                        </button>
                      </div>
                    </div>
                  </form>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 mx-auto hover:text-indigo-300">
                      <ChevronLeft size={16} /> Back
                    </button>
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">{t.handshake}</h2>
                    <p className="text-[11px] text-slate-600 font-medium italic truncate px-6">{t.dispatched} {email}</p>
                  </div>
                  <div className="flex justify-between gap-2.5 px-4">
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
                        className="w-10 h-14 bg-slate-950/60 border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-600 outline-none transition-all"
                      />
                    ))}
                  </div>
                  <div className="space-y-4">
                    <button 
                      onClick={() => executeOtpVerify()} 
                      disabled={isProcessing || otp.some(d => !d)} 
                      className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-indigo-500 active:scale-[0.97] transition-all disabled:opacity-50 shadow-2xl"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                      VERIFY NEURAL TOKEN
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {(error || message) && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-5 border rounded-[2rem] flex items-start gap-4 text-[11px] font-bold italic leading-relaxed shadow-lg ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                <div className="mt-0.5">
                  {error ? <ShieldAlert size={18} /> : <ShieldCheck size={18} />}
                </div>
                <div className="space-y-1">
                  <p>{error || message}</p>
                </div>
              </m.div>
            )}
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center space-y-4 opacity-30 hover:opacity-100 transition-all duration-700 pb-8">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">@2026 SomnoAI Digital Sleep Lab • Neural Infrastructure</p>
      </footer>
    </div>
  );
};
