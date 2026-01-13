
import React, { useState } from 'react';
import { Loader2, ArrowRight, Cpu, TriangleAlert, Lock, ShieldCheck, Mail, Key, Sparkles, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { healthConnect } from './services/healthConnectService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { supabase, sendEmailOTP, verifyEmailOTP } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
  isAdminFlow?: boolean; 
}

/**
 * AUTHENTICATION COMMAND CENTER
 * Implements a state-machine driven passwordless flow:
 * State 1: Identity Extraction (Email Input)
 * State 2: Neural Verification (OTP Input)
 * State 3: Session Initialization (Success)
 */
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
      setLocalError(err.message || "Protocol Error: Failed to dispatch verification link.");
    } finally {
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
        throw new Error("Handshake Failed: Invalid session data received.");
      }
    } catch (err: any) {
      setLocalError(err.message || "Verification Failed: Code is invalid or expired.");
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
      {/* Bio-Digital Background Element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] bg-indigo-500/[0.03] rounded-full blur-[180px] pointer-events-none animate-pulse" />
      
      <m.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        {/* Branding Cluster */}
        <div className="flex flex-col items-center gap-8">
          <m.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
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
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] ml-2">
              Neural Data Gateway
            </p>
          </div>
        </div>

        {/* Auth Interface */}
        <GlassCard className={`p-10 rounded-[4.5rem] border-white/10 ${isAdminFlow ? 'shadow-2xl shadow-rose-950/30' : ''}`}>
          <AnimatePresence mode="wait">
            {authState === 'email' ? (
              <m.div 
                key="email-state" 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: 20 }} 
                className="space-y-10"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-center gap-2 text-indigo-400 mb-2">
                    <ShieldCheck size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Passwordless Identification</span>
                  </div>
                  <p className="text-xs text-slate-500 italic leading-relaxed px-6">
                    Enter your research identity to synchronize with the lab ecosystem.
                  </p>
                </div>

                <form onSubmit={handleSendOTP} className="space-y-6">
                  <div className="relative group">
                    <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="researcher@lab.com"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white font-bold outline-none focus:border-indigo-500/50 transition-all"
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={isProcessing} 
                    className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isAdminFlow ? 'bg-rose-600 hover:bg-rose-500' : 'bg-white text-slate-950 hover:bg-slate-100'}`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isAdminFlow ? 'ACCESS ADMIN NODE' : 'INITIALIZE SESSION'}
                  </button>
                </form>

                <div className="pt-4 border-t border-white/5">
                   <button onClick={onGuest} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-all">
                      Access Local Virtual Sandbox <ArrowRight size={14} className="inline ml-2" />
                   </button>
                </div>
              </m.div>
            ) : (
              <m.div 
                key="otp-state" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                className="space-y-10"
              >
                <div className="space-y-3">
                  <button onClick={resetFlow} className="text-[9px] font-black text-slate-600 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto mb-4 transition-colors">
                    <ChevronLeft size={14} /> Back to Identity
                  </button>
                  <div className="flex items-center justify-center gap-2 text-emerald-400 mb-2">
                    <Key size={16} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Verification</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">
                    Verification code dispatched to: <br/>
                    <span className="text-white font-bold">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleVerifyOTP} className="space-y-6">
                  <div className="relative">
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
                  </div>
                  <button 
                    type="submit" 
                    disabled={isProcessing || otp.length < 6} 
                    className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${isAdminFlow ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
                    VERIFY & DECRYPT
                  </button>
                </form>

                <p className="text-[9px] text-slate-600 uppercase tracking-widest italic">
                  Link expires in 5 minutes.
                </p>
              </m.div>
            )}
          </AnimatePresence>

          {localError && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mt-8 p-5 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest flex items-start gap-4 text-left leading-relaxed"
            >
              <TriangleAlert size={18} className="shrink-0 mt-0.5" />
              <span>{localError}</span>
            </m.div>
          )}
        </GlassCard>

        {/* Footer Navigation */}
        <div className="flex flex-col items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-8">
            <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Privacy Protocol</button>
            <div className="w-1 h-1 bg-slate-800 rounded-full" />
            <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Laboratory Terms</button>
          </div>
          {isAdminFlow ? (
            <button 
              onClick={() => { window.location.href = '/'; }} 
              className="px-6 py-2 border border-white/10 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-all"
            >
              Exit Secure Node
            </button>
          ) : (
            <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-700">© 2026 Somno Lab • Biological Data Security Ensured</p>
          )}
        </div>
      </m.div>
    </div>
  );
};
