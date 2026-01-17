
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ChevronLeft, Mail, ShieldAlert, ShieldCheck, 
  Lock, Fingerprint, Eye, EyeOff, LogIn as LoginIcon, 
  UserPlus as RegisterIcon, Key, Hexagon, Zap, ArrowRight, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { authApi } from '../services/supabaseService.ts';
import { trackEvent } from '../services/analytics.ts';

const m = motion as any;

/**
 * Biometric Glow Switch mimicking the design aesthetic.
 */
const BiometricSwitch = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-12 h-7 rounded-full border border-white/10 flex items-center px-1 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : ''}`}>
      <m.div 
        animate={{ opacity: active ? 0.4 : 0 }}
        className="absolute inset-0 bg-[#00f2fe]"
      />
      <m.div 
        animate={{ x: active ? 20 : 0 }}
        transition={{ type: "spring", stiffness: 450, damping: 25 }}
        className={`w-5 h-5 rounded-full relative z-10 flex items-center justify-center ${active ? 'bg-white shadow-[0_0_12px_rgba(255,255,255,1)]' : 'bg-slate-700'}`}
      >
        {active && <div className="w-3 h-3 bg-[#00f2fe] rounded-full blur-[2px]" />}
      </m.div>
      <div className="absolute right-1.5 top-1.5 opacity-20 pointer-events-none">
        <Lock size={12} className="text-white" />
      </div>
    </div>
  </div>
);

/**
 * Hex Key Icon for input field centers.
 */
const HexKeyIcon = ({ active }: { active: boolean }) => (
  <div className={`p-2 rounded-xl border border-white/5 bg-[#0f121e] flex items-center justify-center transition-all duration-700 ${active ? 'text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(79,70,229,0.15)] scale-105' : 'text-slate-800'}`}>
    <div className="relative">
      <Hexagon size={16} strokeWidth={2.5} />
      <Key size={8} strokeWidth={3} className="absolute inset-0 m-auto" />
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
  const [error, setError] = useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setMessage(null);
    setNeedsActivation(false);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setIsProcessing(true);
    try {
      if (formType === 'reset') {
        const { error: resetErr } = await authApi.resetPassword(targetEmail);
        if (resetErr) throw resetErr;
        setMessage(t.resetSuccess);
        trackEvent('auth_reset_request');
      } else if (authMode === 'otp') {
        if (cooldown > 0) return;
        const { error: otpErr } = await authApi.sendOTP(targetEmail);
        if (otpErr) throw otpErr;
        setStep('verify');
        setCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 400);
        trackEvent('auth_otp_request');
      } else {
        if (formType === 'register') {
          const { data, error: signUpErr } = await authApi.signUp(targetEmail, password);
          if (signUpErr) throw signUpErr;
          
          if (data?.session) {
            onLogin();
          } else {
            setMessage(lang === 'zh' ? "注册成功。系统需要激活。" : "Registration successful. Activation required.");
            setNeedsActivation(true);
          }
          trackEvent('auth_signup');
        } else {
          const { error: signInErr } = await authApi.signIn(targetEmail, password);
          if (signInErr) throw signInErr;
          trackEvent('auth_password_login');
          onLogin();
        }
      }
    } catch (err: any) {
      const errorMsg = err.message || "";
      if (errorMsg.toLowerCase().includes("email not confirmed") || errorMsg.toLowerCase().includes("account not yet active")) {
        setError(lang === 'zh' ? "账户尚未激活，请使用激活码完成验证。" : "Account not yet active. Use an activation code.");
        setNeedsActivation(true);
      } else {
        setError(errorMsg || "Identity link failed.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const sendActivationCode = async () => {
    if (isProcessing || cooldown > 0) return;
    setError(null);
    setMessage(null);
    setIsProcessing(true);
    try {
      const targetEmail = email.trim().toLowerCase();
      const { error: otpErr } = await authApi.sendOTP(targetEmail);
      if (otpErr) throw otpErr;
      
      // Immediately switch to verification UI
      setStep('verify');
      setCooldown(60);
      setNeedsActivation(false);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 400);
      trackEvent('auth_activation_request');
    } catch (err: any) {
      setError(err.message || "Failed to dispatch activation signal.");
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
      // Fix: Changed verifyOtp to verifyOTP to match authApi definition
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw verifyErr;
      if (data.session) onLogin();
    } catch (err: any) {
      setError(err.message || "Neural handshake failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md text-center mb-12 relative z-10 space-y-6"
      >
        <div className="inline-flex justify-center mb-2">
          <Logo size={85} animated={true} />
        </div>
        <div className="space-y-1">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase leading-none italic drop-shadow-2xl">
            {t.lab}
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[11px] tracking-[0.45em] mt-1 opacity-90">
            {t.tagline}
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[480px] relative z-20">
        <div className="bg-[#050a1f]/90 backdrop-blur-3xl border border-white/[0.08] rounded-[3.5rem] p-1 shadow-[0_80px_160px_-40px_rgba(0,0,0,1)]">
          <div className="p-10 md:p-12 space-y-10">
            
            {/* Mode Toggle Switch - Hidden when activation is needed */}
            {!needsActivation && step === 'input' && (
              <div className="flex bg-black/50 p-1.5 rounded-full border border-white/5 relative overflow-hidden">
                <button 
                  onClick={() => { setAuthMode('otp'); setStep('input'); setFormType('login'); setError(null); setMessage(null); }}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 relative z-10 ${authMode === 'otp' ? 'text-white' : 'text-slate-500'}`}
                >
                  OTP MODE
                </button>
                <button 
                  onClick={() => { setAuthMode('password'); setStep('input'); setFormType('login'); setError(null); setMessage(null); }}
                  className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-700 relative z-10 ${authMode === 'password' ? 'text-white' : 'text-slate-500'}`}
                >
                  PASSWORD MODE
                </button>
                <m.div 
                  className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#4f46e5] rounded-full shadow-[0_0_25px_rgba(79,70,229,0.5)]"
                  animate={{ x: authMode === 'password' ? '100%' : '0%' }}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-10">
                  
                  {needsActivation ? (
                    <div className="space-y-8 text-center">
                      <div className="w-20 h-20 bg-indigo-500/10 border border-indigo-500/20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                        <Shield size={32} />
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Activation Required</h2>
                        <p className="text-[12px] text-slate-400 leading-relaxed font-medium italic px-6">
                          {message || error}
                        </p>
                      </div>
                      
                      <div className="bg-white/5 border border-white/5 rounded-3xl p-6 text-left">
                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Target Account</p>
                        <p className="text-sm font-bold text-indigo-300 italic truncate">{email}</p>
                      </div>

                      <div className="space-y-4 pt-2">
                        <button 
                          onClick={sendActivationCode}
                          disabled={isProcessing || cooldown > 0}
                          className="w-full py-6 bg-indigo-600 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)]"
                        >
                          {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                          {cooldown > 0 ? `WAIT ${cooldown}S` : (lang === 'zh' ? "发送激活码" : "SEND ACTIVATION CODE")}
                        </button>
                        
                        <button 
                          onClick={() => { setNeedsActivation(false); setMessage(null); setError(null); }}
                          className="text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-colors"
                        >
                          Cancel Activation
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Internal Tabs: Login vs Register */}
                      <div className="flex justify-center gap-12">
                        {formType === 'reset' ? (
                          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400 border-b-2 border-indigo-400 pb-3">{t.resetHeading}</h2>
                        ) : (
                          <>
                            <button 
                              onClick={() => { setFormType('login'); setError(null); setMessage(null); }} 
                              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all pb-3 border-b-2 ${formType === 'login' ? 'text-indigo-400 border-indigo-400' : 'text-slate-800 border-transparent hover:text-slate-600'}`}
                            >
                              <LoginIcon size={14} strokeWidth={3} /> LOGIN
                            </button>
                            <button 
                              onClick={() => { setFormType('register'); setError(null); setMessage(null); }} 
                              className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all pb-3 border-b-2 ${formType === 'register' ? 'text-indigo-400 border-indigo-400' : 'text-slate-800 border-transparent hover:text-slate-600'}`}
                            >
                              <RegisterIcon size={14} strokeWidth={3} /> REGISTER
                            </button>
                          </>
                        )}
                      </div>

                      <form onSubmit={handleMainAction} className="space-y-8">
                        <div className="space-y-5">
                          <p className="text-[12px] text-slate-500 text-center leading-relaxed font-medium italic px-6 pb-2">
                            {translations[lang].dashboard.manifesto}
                          </p>

                          <div className="relative group">
                            <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
                              <Mail size={18} strokeWidth={2.5} />
                            </div>
                            <input 
                              type="email" 
                              value={email} 
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder={t.emailLabel}
                              className="w-full bg-[#0a0e1a] border border-white/5 rounded-[2.8rem] px-16 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-900 font-semibold"
                              required
                            />
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                               <HexKeyIcon active={isEmailValid} />
                               <BiometricSwitch active={isEmailValid} />
                            </div>
                          </div>

                          {authMode === 'password' && formType !== 'reset' && (
                            <div className="space-y-4">
                              <div className="relative group">
                                <div className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                                  <Lock size={18} strokeWidth={2.5} />
                                </div>
                                <input 
                                  type={showPassword ? "text" : "password"} 
                                  value={password} 
                                  onChange={(e) => setPassword(e.target.value)}
                                  placeholder={t.passwordLabel}
                                  className="w-full bg-[#0a0e1a] border border-white/5 rounded-[2.8rem] px-16 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-900 font-semibold"
                                  required={formType !== 'reset'}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                   <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-800 hover:text-slate-400 transition-colors p-1">
                                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                   </button>
                                   <HexKeyIcon active={isPasswordValid} />
                                   <BiometricSwitch active={isPasswordValid} />
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-6 pt-2">
                          <button 
                            type="submit" 
                            disabled={isProcessing}
                            className="w-full py-6 bg-[#4f46e5] text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-[0_20px_50px_-15px_rgba(79,70,229,0.5)] hover:bg-[#5a50f0] disabled:opacity-50"
                          >
                            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                            {isProcessing ? 'PROCESSING...' : formType === 'register' ? t.confirmRegister : formType === 'reset' ? t.sendReset : t.authorize}
                          </button>

                          {formType === 'login' && authMode === 'password' && (
                            <div className="text-center">
                              <button 
                                type="button" 
                                onClick={() => setFormType('reset')}
                                className="text-[10px] font-black text-slate-700 hover:text-indigo-400 uppercase tracking-widest transition-colors"
                              >
                                {t.forgotPassword}
                              </button>
                            </div>
                          )}

                          {formType === 'reset' && (
                            <button 
                              type="button" 
                              onClick={() => setFormType('login')}
                              className="w-full text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-all"
                            >
                              RETURN TO IDENTIFIER
                            </button>
                          )}
                        </div>

                        {formType !== 'reset' && (
                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                            <button 
                              type="button" 
                              onClick={() => authApi.signInWithGoogle()} 
                              className="py-5 bg-[#0f121e] border border-white/5 rounded-[2rem] flex items-center justify-center gap-4 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-xl group"
                            >
                              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                              </svg>
                              {t.google}
                            </button>
                            <button 
                              type="button" 
                              onClick={onGuest} 
                              className="py-5 bg-[#0f121e] border border-white/5 rounded-[2rem] flex items-center justify-center gap-4 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest shadow-xl group"
                            >
                              <Fingerprint size={20} className="text-indigo-400 group-hover:scale-110 transition-transform" strokeWidth={2.5} /> {t.sandbox}
                            </button>
                          </div>
                        )}
                      </form>
                    </>
                  )}
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="space-y-12">
                  <div className="text-center space-y-4">
                    <button onClick={() => { setStep('input'); setNeedsActivation(false); }} className="text-[10px] font-black text-indigo-400 uppercase flex items-center gap-2 mx-auto hover:text-indigo-300 transition-colors tracking-widest">
                      <ChevronLeft size={16} /> {t.back}
                    </button>
                    <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter leading-none">{t.handshake}</h2>
                    <p className="text-[12px] text-slate-500 font-medium italic truncate px-6 leading-relaxed">
                      {t.dispatched} <span className="text-indigo-400/80">{email}</span>
                    </p>
                  </div>
                  
                  <div className="flex justify-between gap-3 px-2">
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
                        className="w-12 h-18 bg-slate-950/60 border border-white/10 rounded-[1.5rem] text-3xl text-center text-white font-mono font-black focus:border-[#4f46e5] focus:shadow-[0_0_25px_rgba(79,70,229,0.3)] outline-none transition-all"
                      />
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <button 
                      onClick={() => executeOtpVerify()} 
                      disabled={isProcessing || otp.some(d => !d)} 
                      className="w-full py-7 bg-[#4f46e5] text-white rounded-full font-black text-xs uppercase tracking-[0.5em] shadow-[0_30px_60px_-15px_rgba(79,70,229,0.6)] flex items-center justify-center gap-4 hover:bg-[#5a50f0] active:scale-[0.97] transition-all disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="animate-spin" size={22} /> : <ShieldCheck size={22} strokeWidth={2.5} />}
                      VERIFY NEURAL TOKEN
                    </button>
                    
                    <button 
                      onClick={() => handleMainAction()}
                      disabled={isProcessing || cooldown > 0}
                      className="w-full text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest transition-all"
                    >
                      {cooldown > 0 ? `RETRY SIGNAL IN ${cooldown}S` : t.resend}
                    </button>
                  </div>
                </m.div>
              )}
            </AnimatePresence>

            {/* Error/Message Display (Only if not already in dedicated needsActivation view) */}
            {(error || message) && !needsActivation && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`p-6 border rounded-[2.5rem] flex items-start gap-4 text-[12px] font-bold italic leading-relaxed ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {error ? <ShieldAlert size={20} className="shrink-0 mt-0.5" /> : <ShieldCheck size={20} className="shrink-0 mt-0.5" />}
                <span>{error || message}</span>
              </m.div>
            )}
          </div>
          
          <div className="pb-10 text-center border-t border-white/5 pt-8">
             <button className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-800 hover:text-indigo-400 transition-colors flex items-center gap-2 mx-auto justify-center group">
                {t.help}
             </button>
          </div>
        </div>
      </div>

      <footer className="mt-16 text-center space-y-6 opacity-40 hover:opacity-100 transition-all duration-700 pb-12">
        <div className="flex items-center gap-10 justify-center">
          <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 hover:text-indigo-400 transition-colors">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 hover:text-indigo-400 transition-colors">Terms</button>
        </div>
        <div className="h-[1px] w-16 bg-slate-900 mx-auto" />
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800">© 2025 SOMNO LAB • NEURAL INFRASTRUCTURE CORE</p>
      </footer>
    </div>
  );
};
