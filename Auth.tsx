
import React, { useState } from 'react';
import { Loader2, ArrowRight, Cpu, TriangleAlert, Lock, ShieldCheck, Mail, Key, Sparkles, ChevronLeft, Chrome, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { supabase, sendEmailOTP, verifyEmailOTP, signInWithGoogle } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate, isAdminFlow = false }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [authState, setAuthState] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const t = translations[lang].auth;

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsProcessing(true);
    setLocalError(null);
    try {
      await sendEmailOTP(email);
      setAuthState('otp');
    } catch (err: any) {
      setLocalError(err.message || "Failed to dispatch verification link.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    setLocalError(null);
    try {
      await signInWithGoogle();
      // Supabase OAuth redirects the window, so we don't need onLogin() here immediately
    } catch (err: any) {
      setLocalError(err.message || "Google Authentication Failed.");
      setIsProcessing(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;

    setIsProcessing(true);
    setLocalError(null);
    try {
      const session = await verifyEmailOTP(email, otp);
      if (session) {
        onLogin();
      } else {
        throw new Error("Invalid session data received.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Invalid or expired code.");
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setAuthState('email');
    setOtp('');
    setLocalError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-indigo-500/[0.03] rounded-full blur-[180px] pointer-events-none animate-pulse" />
      
      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        <div className="flex flex-col items-center gap-8">
          <m.div 
            animate={{ scale: [1, 1.05, 1] }}
            className={`p-8 rounded-[3.5rem] border flex items-center justify-center transition-all duration-700 ${isAdminFlow ? 'bg-rose-600/10 border-rose-500/30' : 'bg-indigo-600/10 border-indigo-500/10'}`}
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
              SomnoAI <br/>
              <span className={isAdminFlow ? "text-rose-500" : "text-indigo-400"}>
                {isAdminFlow ? "Admin Node" : "Digital Lab"}
              </span>
            </h1>
          </div>
        </div>

        <GlassCard className={`p-10 rounded-[4.5rem] border-white/10 ${isAdminFlow ? 'shadow-2xl shadow-rose-950/30' : ''}`}>
          <AnimatePresence mode="wait">
            {authState === 'email' ? (
              <m.div key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isProcessing}
                  className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-100 transition-all shadow-xl active:scale-95"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Chrome size={18} className="text-indigo-600" />}
                  Continue with Google
                </button>

                <div className="flex items-center gap-4 opacity-20">
                  <div className="h-[1px] flex-1 bg-white" />
                  <span className="text-[10px] font-black text-white uppercase">OR</span>
                  <div className="h-[1px] flex-1 bg-white" />
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="relative group">
                    <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Enter Laboratory Email"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${isAdminFlow ? 'bg-rose-600 text-white' : 'bg-indigo-600 text-white'}`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    Initialize OTP
                  </button>
                </form>

                <button onClick={onGuest} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                  Access Local Virtual Sandbox <ArrowRight size={14} className="inline ml-2" />
                </button>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="space-y-3">
                  <button onClick={resetFlow} className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto mb-4 transition-colors">
                    <ChevronLeft size={14} /> Back to Identity
                  </button>
                  <div className="flex items-center justify-center gap-2 text-emerald-400">
                    <Key size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    A 6-digit code was sent to <span className="text-white font-bold">{email}</span>. <br/>
                    Please check your <span className="text-emerald-400">Inbox</span> or <span className="text-emerald-400">Spam</span> folder.
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <input 
                    type="text" 
                    maxLength={6}
                    value={otp} 
                    onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="000000"
                    className="w-full bg-slate-950/60 border border-white/10 rounded-full py-6 text-2xl text-center text-white font-black tracking-[0.8em] outline-none focus:border-emerald-500/50"
                    required
                    autoFocus
                  />
                  <button 
                    type="submit" 
                    disabled={isProcessing || otp.length < 6} 
                    className="w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl bg-emerald-600 text-white transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                    Verify Code
                  </button>
                </form>

                <div className="flex items-center gap-2 justify-center p-4 bg-white/5 rounded-2xl border border-white/5">
                  <Info size={14} className="text-slate-500" />
                  <p className="text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
                    Code not received? Try resending in 60s or contact laboratory support.
                  </p>
                </div>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-5 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-4">
              <TriangleAlert size={18} className="shrink-0" />
              <span>{localError}</span>
            </m.div>
          )}
        </GlassCard>

        <footer className="opacity-40 hover:opacity-100 transition-opacity">
          <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-700">© 2026 Somno Lab • Secure Authentication Bridge</p>
        </footer>
      </m.div>
    </div>
  );
};
