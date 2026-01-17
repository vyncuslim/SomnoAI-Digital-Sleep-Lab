import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';
import { adminApi, signInWithEmailOTP, verifyOtp } from '../../../services/supabaseService.ts';
import { trackEvent } from '../../../services/analytics.ts';

const m = motion as any;

export default function AdminLoginPage() {
  const [step, setStep] = useState<'initial' | 'otp-verify'>('initial');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const getNormalizedEmail = () => email.trim().toLowerCase();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (cooldown > 0 || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    const targetEmail = getNormalizedEmail();
    
    trackEvent('admin_login_attempt', {
      user_email: targetEmail || 'anonymous',
      step: 'request_otp'
    });

    try {
      if (!targetEmail) throw new Error("Identifier required for terminal access.");
      
      await signInWithEmailOTP(targetEmail);
      
      setStep('otp-verify');
      setCooldown(60); 
      setOtp(['', '', '', '', '', '']); 
      setTimeout(() => otpRefs.current[0]?.focus(), 200);
    } catch (err: any) {
      setError(err.message || "Laboratory Handshake Synchronous Error.");
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
    setError(null);

    const targetEmail = getNormalizedEmail();

    try {
      const session = await verifyOtp(targetEmail, token);

      if (!session) throw new Error("Link Rejected: Security layer denied session creation.");

      const isAdmin = await adminApi.checkAdminStatus(session.user.id);
      if (!isAdmin) {
        trackEvent('admin_login_failure', { user_email: targetEmail, reason: 'insufficient_clearance' });
        await supabase.auth.signOut();
        throw new Error("Access Denied: Subject lacks Administrative Clearance Level 0.");
      }

      trackEvent('admin_login_success', { user_email: targetEmail });
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError(err.message || "Neural override authentication failure.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 space-y-12 font-sans overflow-hidden relative">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center space-y-6 relative z-10">
        <button 
          onClick={() => { if(!isProcessing) window.location.hash = '#/'; }}
          disabled={isProcessing}
          className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 mx-auto mb-12 transition-all group disabled:opacity-30"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> ABORT OVERRIDE
        </button>
        
        <m.div 
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-24 h-24 bg-rose-500/5 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 mx-auto mb-6 shadow-[0_0_80px_rgba(225,29,72,0.1)]"
        >
          <ShieldCheck size={40} strokeWidth={1.5} />
        </m.div>
        
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Restricted <span className="text-rose-500">Portal</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Command Deck Clearance Only</p>
        </div>
      </div>

      <GlassCard className="w-full max-w-lg p-12 md:p-16 rounded-[4.5rem] border-rose-500/20 relative z-10 shadow-3xl">
        <AnimatePresence mode="wait">
          {step === 'initial' ? (
            <m.div 
              key="initial"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <form onSubmit={handleRequestOtp} className="space-y-8">
                <div className="space-y-4">
                  <div className="relative group">
                    <Mail className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-800 transition-colors group-focus-within:text-rose-500" size={22} />
                    <input 
                      type="email" 
                      autoComplete="username email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Administrator Identifier"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full pl-16 pr-10 py-7 text-base text-white font-bold outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-900 shadow-inner"
                      required
                      autoFocus
                    />
                  </div>
                </div>
                
                <button 
                  type="submit"
                  disabled={isProcessing || cooldown > 0}
                  className="w-full py-7 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all hover:bg-rose-500 flex items-center justify-center gap-4 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {isProcessing ? 'AUTHORIZING...' : (cooldown > 0 ? `COOLING (${cooldown}S)` : 'REQUEST ACCESS TOKEN')}
                </button>
              </form>
            </m.div>
          ) : (
            <m.div 
              key="otp-verify"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <button 
                  onClick={() => { if(!isProcessing) { setStep('initial'); setError(null); } }} 
                  disabled={isProcessing}
                  className="text-[10px] font-black text-slate-600 hover:text-rose-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Back to Identifier
                </button>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Verification</h2>
                <p className="text-xs text-slate-500 font-medium italic truncate max-w-full">Token dispatched to {email}</p>
              </div>

              <div className="flex justify-between gap-3 px-2">
                {otp.map((digit, idx) => (
                  <m.input
                    key={idx}
                    ref={el => { otpRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    animate={digit ? { scale: [1, 1.1, 1] } : {}}
                    onChange={(e) => handleOtpInput(idx, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
                        otpRefs.current[idx - 1]?.focus();
                      }
                    }}
                    disabled={isProcessing}
                    className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-rose-500 outline-none transition-all disabled:opacity-50 shadow-inner"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeVerify()}
                  disabled={isProcessing || otp.some(d => !d)}
                  className="w-full py-7 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                  {isProcessing ? 'SYNCHRONIZING...' : 'INITIALIZE OVERRIDE'}
                </button>

                <button 
                  onClick={() => handleRequestOtp()}
                  disabled={isProcessing || cooldown > 0}
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  {cooldown > 0 ? `RETRY IN ${cooldown}S` : 'RESEND LAB TOKEN'}
                </button>
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 text-rose-400 text-[11px] font-bold"
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="italic font-bold text-rose-400 leading-relaxed">{error}</p>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest italic text-left">
                  Command registry requires specific admin credentials.
                </p>
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <footer className="text-center text-slate-800 font-black uppercase text-[8px] tracking-[0.6em] pointer-events-none pb-12">
        SomnoAI Digital Sleep Lab • Secure Grid Infrastructure
      </footer>
    </div>
  );
}