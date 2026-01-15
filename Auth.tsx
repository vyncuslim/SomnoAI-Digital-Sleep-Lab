import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Loader2, ChevronLeft, Mail, Zap, RefreshCw, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onNavigate }) => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;
  const d = translations[lang].dashboard;

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestToken = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing || cooldown > 0) return;
    
    setIsProcessing(true);
    setLocalError(null);
    
    try {
      await signInWithEmailOTP(email.trim().toLowerCase(), true);
      setStep('verify');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 150);
    } catch (err: any) {
      setLocalError(err.message || "Laboratory Handshake Failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || isProcessing) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    if (newOtp.every(d => d !== '') && index === 5 && !isProcessing) {
      executeVerify(newOtp.join(''));
    }
  };

  const executeVerify = async (fullOtp?: string) => {
    if (isProcessing) return; 
    
    const token = fullOtp || otp.join('');
    if (token.length < 6) return;
    
    setIsProcessing(true);
    setLocalError(null);

    try {
      const session = await verifyOtp(email.trim().toLowerCase(), token);
      if (session) {
        onLogin();
      } else {
        throw new Error("Handshake signature rejected.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Neural Token Invalid");
      setIsProcessing(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <m.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 space-y-3 relative z-10">
        <div className="mb-6 flex justify-center">
          <Logo size={80} animated={true} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
          SOMNO <span className="text-indigo-400">LAB</span>
        </h1>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
          {t.tagline}
        </p>
      </m.div>

      <GlassCard className="w-full max-w-md p-10 md:p-14 rounded-[4.5rem] bg-[#0c1021] border-white/5 shadow-2xl relative z-10 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'email' ? (
            <m.form 
              key="email-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleRequestToken}
              className="space-y-8"
            >
              <div className="text-center">
                <p className="text-xs text-slate-400 leading-relaxed font-medium italic px-4">
                  {d.manifesto}
                </p>
              </div>

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.emailLabel}
                    className="w-full bg-[#05070e] border border-white/5 rounded-full px-16 py-5 text-sm text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/30 transition-all font-medium"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || cooldown > 0}
                className="w-full py-5 bg-indigo-600 text-white rounded-full flex items-center justify-center gap-4 font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-500 active:scale-95 transition-all shadow-[0_15px_30px_rgba(79,70,229,0.3)] disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {cooldown > 0 ? `${t.wait} ${cooldown}S` : t.sendCode}
              </button>
            </m.form>
          ) : (
            <m.div 
              key="verify-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <button 
                  onClick={() => { if(!isProcessing) { setStep('email'); setLocalError(null); } }} 
                  disabled={isProcessing}
                  className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> {t.back}
                </button>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{t.handshake}</h2>
                <p className="text-[10px] text-slate-500 font-bold italic truncate">{t.dispatched} {email}</p>
              </div>

              <div className="flex justify-between gap-3 px-2">
                {otp.map((digit, idx) => (
                  <m.input
                    key={idx}
                    ref={(el: HTMLInputElement | null) => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    animate={digit ? { scale: [1, 1.1, 1] } : {}}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpInput(idx, e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                        otpRefs.current[idx - 1]?.focus();
                      }
                    }}
                    disabled={isProcessing}
                    className="w-11 h-14 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-mono font-black focus:border-indigo-500 outline-none transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeVerify()}
                  disabled={isProcessing || otp.some(d => !d)}
                  className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isProcessing ? 'AUTHORIZING...' : t.initialize}
                </button>

                <button 
                  onClick={() => handleRequestToken()}
                  disabled={isProcessing || cooldown > 0}
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  {cooldown > 0 ? `${t.wait} ${cooldown}S ${t.retry}` : t.resend}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {localError && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 text-rose-400 text-[11px] font-bold"
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="italic font-bold text-rose-400 leading-relaxed">{localError}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-snug">
                  {t.policyNotice}
                </p>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-10 border-t border-white/5 text-center">
           <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest leading-relaxed italic">
            {t.auditNotice}
          </p>
        </div>
      </GlassCard>

      <footer className="mt-12 flex flex-col items-center gap-8 relative z-10 pb-12">
        <div className="flex items-center gap-8">
          <button type="button" onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Privacy Protocol</button>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <button type="button" onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Legal Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-800">SomnoAI Digital Sleep Lab • Secure Grid Infrastructure</p>
      </footer>
    </div>
  );
};
