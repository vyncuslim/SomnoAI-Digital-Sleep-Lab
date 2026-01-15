import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Loader2, ChevronLeft, ArrowRight, Mail, ShieldCheck, Zap, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';
import { adminApi, signInWithEmailOTP, verifyOtp } from '../../../services/supabaseService.ts';

const m = motion as any;

/**
 * Restricted Portal for Laboratory Administrators.
 * Implements hardened Passwordless OTP with zero-trust role auditing.
 */
export default function AdminLoginPage() {
  const [step, setStep] = useState<'initial' | 'otp-verify'>('initial');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Normalization utility to prevent case-sensitivity issues
  const getNormalizedEmail = () => email.trim().toLowerCase();

  // Cooldown timer for OTP requests
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0 || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const targetEmail = getNormalizedEmail();
      if (!targetEmail) throw new Error("Identifier required.");
      
      // CRITICAL: shouldCreateUser = false ensures we only target existing admins.
      // If the email is not in Auth, Supabase will reject the sign-in attempt.
      await signInWithEmailOTP(targetEmail, false);
      
      setStep('otp-verify');
      setCooldown(60); 
      setOtp(['', '', '', '', '', '']); 
      
      // Allow DOM to render before focus
      setTimeout(() => otpRefs.current[0]?.focus(), 500);
    } catch (err: any) {
      setError(err.message || "Laboratory Handshake Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value) || isProcessing) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    
    // Predictive focus
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify on completion
    if (newOtp.every(d => d !== '') && index === 5) {
      executeVerify(newOtp.join(''));
    }
  };

  const executeVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const targetEmail = getNormalizedEmail();
      
      // For Admin OTP restricted login, the type in verifyOtp must be 'email'
      const session = await verifyOtp(targetEmail, token, 'email');

      if (!session) throw new Error("Link Rejected: Node denied session creation.");

      // Post-Auth Clearance Gate (The Firewall)
      const isAdmin = await adminApi.checkAdminStatus(session.user.id);

      if (!isAdmin) {
        // Purge unauthorized session immediately
        await supabase.auth.signOut();
        throw new Error("Access Denied: Subject lacks Administrative Clearance (Level 0).");
      }

      // Successful Handshake
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError(err.message || "Neural override verification failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 space-y-12 font-sans overflow-hidden relative">
      {/* Bio-Atmosphere Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center space-y-6 relative z-10">
        <button 
          onClick={() => window.location.hash = '#/'}
          className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 mx-auto mb-12 transition-all group"
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
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Clearance Level 0 Only</p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-10 md:p-14 rounded-[4.5rem] border-rose-500/20 relative z-10 shadow-3xl">
        <AnimatePresence mode="wait">
          {step === 'initial' ? (
            <m.form 
              key="initial"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleRequestOtp} 
              className="space-y-8"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
                  <input 
                    type="email" 
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Admin Identifier"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white font-medium outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-800"
                    required
                  />
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={isProcessing || cooldown > 0}
                className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all hover:bg-rose-500 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                {isProcessing ? 'HANDSHAKING...' : (cooldown > 0 ? `COOLDOWN ACTIVE (${cooldown}S)` : 'REQUEST LAB TOKEN')}
              </button>
            </m.form>
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
                  onClick={() => { setStep('initial'); setError(null); }} 
                  className="text-[10px] font-black text-slate-600 hover:text-rose-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors"
                >
                  <ChevronLeft size={14} /> Back to Identifier
                </button>
                <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">Neural Handshake</h2>
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
                    className="w-11 h-14 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-rose-500 outline-none transition-all disabled:opacity-50"
                  />
                ))}
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => executeVerify()}
                  disabled={isProcessing || otp.some(d => !d)}
                  className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isProcessing ? 'AUTHORIZING...' : 'INITIALIZE OVERRIDE'}
                </button>

                <button 
                  onClick={handleRequestOtp}
                  disabled={isProcessing || cooldown > 0}
                  className="w-full py-4 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} className={isProcessing ? 'animate-spin' : ''} />
                  {cooldown > 0 ? `WAIT ${cooldown}S FOR RETRY` : 'RESEND LAB TOKEN'}
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
                {(error.includes('Expired') || error.includes('Invalid')) && (
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                    Wait for the cooldown to clear before requesting again.
                  </p>
                )}
              </div>
            </m.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-10 border-t border-white/5 text-center space-y-6">
           <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest leading-relaxed italic">
            Neural activity within this terminal is cryptographically logged. Access attempts are audited in real-time.
          </p>
          <a href="/" className="inline-flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
            Return to Public Dashboard <ArrowRight size={12} />
          </a>
        </div>
      </GlassCard>

      <footer className="text-center text-slate-800 font-black uppercase text-[8px] tracking-[0.6em] pointer-events-none pb-12">
        SomnoAI Digital Sleep Lab • Secure Grid Infrastructure
      </footer>
    </div>
  );
}