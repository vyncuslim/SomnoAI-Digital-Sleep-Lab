import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, Loader2, ChevronLeft, Mail, Zap, RefreshCw, ShieldAlert, Fingerprint, Cpu, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { signInWithEmailOTP, verifyOtp } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest?: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [step, setStep] = useState<'email' | 'verify'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const t = translations[lang].auth;
  const d = translations[lang].dashboard;

  // Strict Cooldown Management
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
      // Trigger: Explicit User Action
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
    
    // Auto-verify ONLY if we aren't already processing to prevent double-consumption
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
      // Direct Call: No redundant checks
      const session = await verifyOtp(email.trim().toLowerCase(), token);
      if (session) {
        onLogin(); // Success -> End Flow
      }
    } catch (err: any) {
      setLocalError(err.message || "Neural Token Invalid");
      setIsProcessing(false); 
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Background Aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-indigo-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      
      {/* Branding Header matching the screenshot */}
      <m.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-10 space-y-3 relative z-10"
      >
        <div className="mb-6 flex justify-center">
          <Logo size={80} animated={true} />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
          SOMNOAI <span className="text-indigo-400">LAB</span>
        </h1>
        <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em]">
          {t.tagline}
        </p>
      </m.div>

      {/* Main Auth Terminal */}
      <GlassCard className="w-full max-w-md p-2 rounded-[3.5rem] bg-[#0c1021] border-white/5 shadow-2xl relative z-10 overflow-hidden">
        {/* Mode Indicator (Locked to OTP for "One Method" rule) */}
        <div className="flex p-2 gap-2 bg-black/40 rounded-[3rem] m-2">
          <div className="flex-1 py-3 px-4 rounded-full text-[10px] font-black uppercase tracking-widest bg-indigo-600 text-white shadow-lg text-center">
            {t.handshake || 'NEURAL HANDSHAKE'}
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-400 leading-relaxed font-medium italic px-4">
              {d.manifesto}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <m.form 
                key="email-step"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onSubmit={handleRequestToken}
                className="space-y-6"
              >
                <div className="space-y-3">
                  <label className="text-[9px] font-black uppercase text-slate-600 tracking-widest px-4">Subject Identifier</label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t.emailLabel}
                      className="w-full bg-[#05070e] border border-white/5 rounded-full px-16 py-5 text-sm text-white placeholder:text-slate-800 outline-none focus:border-indigo-500/30 transition-all font-medium"
                      required
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
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <button 
                    onClick={() => { if(!isProcessing) { setStep('email'); setLocalError(null); } }} 
                    className="text-[10px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
                  >
                    <ChevronLeft size={14} /> Back to Identifier
                  </button>
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Handshake Token</h2>
                    <p className="text-[10px] text-slate-500 font-bold italic truncate max-w-[200px] mx-auto">Sent to {email}</p>
                  </div>
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
                    {isProcessing ? 'AUTHORIZING...' : 'INITIALIZE OVERRIDE'}
                  </button>

                  <button 
                    onClick={() => handleRequestToken()}
                    disabled={isProcessing || cooldown > 0}
                    className="w-full py-4 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                    {cooldown > 0 ? `WAIT ${cooldown}S FOR RETRY` : 'RESEND TOKEN'}
                  </button>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {/* Alternative Methods (Keep UI but only Sandbox active) */}
          <div className="grid grid-cols-1 gap-4 pt-2">
            <button 
              onClick={onGuest} 
              className="flex items-center justify-center gap-3 py-4 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <Cpu size={14} className="text-indigo-400" />
              {t.sandboxMode || 'SANDBOX MODE'}
            </button>
          </div>
        </div>

        {/* Error Notification */}
        <AnimatePresence>
          {localError && (
            <m.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="px-8 pb-8"
            >
              <div className="p-4 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-300 text-[11px] font-bold flex gap-3">
                <ShieldAlert size={18} className="shrink-0" />
                <div className="space-y-1">
                  <p className="italic">{localError}</p>
                  {cooldown > 0 && <p className="text-[9px] text-slate-500 uppercase tracking-widest">{t.policyNotice}</p>}
                </div>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </GlassCard>

      {/* Footer Links */}
      <footer className="mt-12 flex flex-col items-center gap-8 relative z-10 pb-12">
        <button type="button" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 hover:text-indigo-400 transition-colors">
          CANNOT ACTIVATE ACCOUNT?
        </button>
        <div className="flex items-center gap-8">
          <button type="button" onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Privacy Protocol</button>
          <div className="w-1 h-1 rounded-full bg-slate-800" />
          <button type="button" onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase tracking-widest text-slate-700 hover:text-slate-400 transition-colors">Legal Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-800">© 2025 Somno Lab • Neural Grid Access</p>
      </footer>
    </div>
  );
};