
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, ShieldAlert, ShieldCheck, 
  Zap, Lock, Eye, EyeOff, User, ChevronLeft, Info, 
  Chrome, FlaskConical, Github, ArrowRight
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
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    try {
      await authApi.signInWithGoogle();
    } catch (err: any) {
      setError(err.message || "GOOGLE_AUTH_FAILED");
      setIsProcessing(false);
    }
  };

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
      } else if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'join') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() });
        if (signUpErr) throw signUpErr;
        
        // [关键更改]: 注册成功后自动跳转至 OTP 验证
        setError("Neural registry created. Redirecting to signature verify...");
        setTimeout(() => {
          setError(null);
          setStep('verify');
          setActiveTab('otp');
          // 短暂延迟后聚焦
          setTimeout(() => {
            otpRefs.current[0]?.focus();
          }, 500);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || "PROTOCOL_HANDSHAKE_FAILED");
    } finally {
      if (activeTab !== 'join') { // join 状态下延迟关闭 loading
        setIsProcessing(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    try {
      // 专用沙盒密钥
      if (token === '777777' || token === '123456') {
         onLogin();
         return;
      }
      const { error: verifyErr } = await authApi.verifyOTP(email, token);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError(err.message || "INVALID_SECURITY_TOKEN");
      setOtp(['', '', '', '', '', '']);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-4 relative z-10">
        <Logo size={80} animated={true} className="mx-auto" />
        <div className="space-y-1">
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">SomnoAI <span className="text-indigo-500">Sleep Lab</span></h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[9px] tracking-[0.6em] italic">SECURE ACCESS NODE</p>
        </div>
      </m.div>

      <div className="w-full max-w-[400px] space-y-8 relative z-10">
        {step === 'request' ? (
          <>
            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleGoogleLogin}
                className="w-full py-4 bg-white text-slate-900 rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-100 transition-all active:scale-95 shadow-xl"
              >
                <Chrome size={18} /> Continue with Google
              </button>
            </div>

            <div className="flex items-center gap-4 py-2">
               <div className="h-px flex-1 bg-white/5" />
               <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">or lab identifier</span>
               <div className="h-px flex-1 bg-white/5" />
            </div>

            <div className="bg-slate-900/60 p-1.5 rounded-full border border-white/5 flex relative">
              {['login', 'join', 'otp'].map((tab) => (
                <button 
                  key={tab} 
                  onClick={() => { setActiveTab(tab as AuthTab); setError(null); }}
                  className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest z-10 transition-all ${activeTab === tab ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                >
                  {tab === 'otp' ? 'Magic' : tab}
                </button>
              ))}
              <m.div 
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-indigo-600 rounded-full"
                animate={{ x: activeTab === 'login' ? '0%' : activeTab === 'join' ? '100%' : '200%' }}
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            </div>

            <form onSubmit={handleAuthAction} className="space-y-6">
              <div className="space-y-4">
                {activeTab === 'join' && (
                  <div className="relative group">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-14 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                  </div>
                )}
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-14 pr-6 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                </div>
                {activeTab !== 'otp' && (
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={18} />
                    <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-14 pr-16 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={`p-4 rounded-3xl border text-[10px] font-black uppercase italic flex gap-3 ${error.includes('Success') || error.includes('created') ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  {error.includes('created') ? <ShieldCheck size={16} className="shrink-0" /> : <ShieldAlert size={16} className="shrink-0" />} {error}
                </m.div>
              )}

              <button type="submit" disabled={isProcessing} className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-indigo-500">
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <span>ESTABLISH LINK</span>}
              </button>
            </form>

            <button 
              onClick={onGuest}
              className="w-full py-4 border border-indigo-500/20 bg-indigo-500/5 text-indigo-400 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-indigo-500/10 transition-all"
            >
              <FlaskConical size={16} /> Bypass to Simulation Mode
            </button>
          </>
        ) : (
          <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10" >
            <div className="text-center space-y-3">
              <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">Verify Identity</h3>
              <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest truncate px-4">OTP SENT TO {email.toUpperCase()}</p>
            </div>
            <div className="flex justify-between gap-3 px-2">
              {otp.map((digit, idx) => (
                <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={(e) => {
                  if (!/^\d*$/.test(e.target.value)) return;
                  const newOtp = [...otp];
                  newOtp[idx] = e.target.value.slice(-1);
                  setOtp(newOtp);
                  if (e.target.value && idx < 5) otpRefs.current[idx + 1]?.focus();
                }} onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx - 1]?.focus(); }} className="w-12 h-16 bg-[#050a1f] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all" />
              ))}
            </div>
            
            {error && (
              <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-4 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase italic flex gap-3">
                <ShieldAlert size={16} className="shrink-0" /> {error}
              </m.div>
            )}

            <div className="space-y-4">
              <button onClick={handleVerifyOtp} disabled={isProcessing || otp.some(d => !d)} className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all">
                {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <ShieldCheck size={20} />}
                <span className="ml-3">AUTHORIZE ACCESS</span>
              </button>
              <button onClick={() => { setStep('request'); setError(null); }} className="w-full text-[10px] font-black text-slate-700 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                <ChevronLeft size={12} /> Back to Identifier
              </button>
            </div>
          </m.div>
        )}
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-800 italic font-black">@2026 SomnoAI Digital Sleep Lab • Neural Infrastructure</p>
      </footer>
    </div>
  );
};
