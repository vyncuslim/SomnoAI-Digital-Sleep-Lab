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
          // 针对 Supabase 的频率限制 (429) 进行友好提示
          if (otpErr.status === 429) {
            throw new Error("RATE_LIMIT: Handshake frequency exceeded. Please wait 60s or use Sandbox.");
          }
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
      setError(err.message || "PROTOCOL_ERROR: HANDSHAKE_FAILED");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerifyOtp = async () => {
    const token = otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    try {
      // 演示/测试模式：如果后端邮件系统故障，允许使用 123456 进入
      if (token === '123456' && (window.location.hostname === 'localhost' || window.location.hostname.includes('webcontainer'))) {
         onLogin();
         return;
      }

      const verifyType = activeTab === 'join' ? 'signup' : 'email';
      const { error: verifyErr } = await authApi.verifyOTP(email, token, verifyType);
      if (verifyErr) throw verifyErr;
      onLogin();
    } catch (err: any) {
      setError(err.message || "INVALID_TOKEN_REJECTED");
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
      {/* 增强背景动态效果 */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-indigo-500/[0.04] to-transparent animate-pulse" />

      {/* 头部区域 */}
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-4 relative z-10"
      >
        <div className="relative inline-block">
          <Logo size={90} animated={true} className="mx-auto" />
          <m.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl -z-10"
          />
        </div>
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
            {/* 标签切换器 */}
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
                    <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
                  </div>
                  {error.includes('RATE_LIMIT') && (
                    <div className="flex flex-col gap-2 pt-2 border-t border-rose-500/10">
                      <p className="text-[9px] text-slate-500 italic uppercase font-bold">Try Sandbox Mode or check back in 1 hour.</p>
                      <button type="button" onClick={onGuest} className="text-[9px] font-black text-rose-500 underline text-left uppercase">Activate Sandbox Now</button>
                    </div>
                  )}
                </m.div>
              )}

              <button 
                type="submit" disabled={isProcessing}
                className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-[0.98] transition-all hover:bg-indigo-500 shadow-indigo-600/20 disabled:opacity-50"
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
                SECURITY TOKEN DISPATCHED TO {email.toUpperCase()}
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

            {showSpamNotice && (
              <m.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-indigo-500/5 border border-indigo-500/20 p-5 rounded-[2rem] flex items-start gap-4"
              >
                <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[11px] text-white font-black uppercase tracking-tight">No code received?</p>
                  <p className="text-[10px] text-slate-500 italic leading-relaxed">Check your <span className="text-indigo-400 font-bold">Spam/Junk</span> folder. Supabase email limits are active.</p>
                </div>
              </m.div>
            )}

            {error && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex gap-3 text-rose-400">
                <AlertCircle size={18} className="shrink-0" />
                <p className="text-[10px] font-black uppercase tracking-widest italic">{error}</p>
              </div>
            )}

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

        <div className="space-y-6">
          <div className="flex items-center gap-4 px-10 opacity-30">
             <div className="h-px flex-1 bg-white/20" />
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">protocol bypass</span>
             <div className="h-px flex-1 bg-white/20" />
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={() => authApi.signInWithGoogle()}
              className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-full flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#fff" opacity="0.6" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#fff" opacity="0.4" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#fff" opacity="0.8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              GOOGLE IDENTITY
            </button>
            
            <button 
              type="button" onClick={onGuest} 
              className="w-full py-5 bg-indigo-500/5 border border-indigo-500/10 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 transition-all text-[11px] font-black uppercase tracking-widest active:scale-95"
            >
              <Fingerprint size={16} />
              Enter Sandbox Mode
            </button>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-center opacity-30">
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-800 italic font-black">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
};