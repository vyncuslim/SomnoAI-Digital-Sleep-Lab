
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Loader2, Key, TriangleAlert, Lock, ArrowLeft, Zap, ShieldAlert } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp, adminApi } from '../../../services/supabaseService.ts';
import { Logo } from '../../../components/Logo.tsx';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';

const m = motion as any;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'credentials' | 'otp-verify'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Stage 1: Password Verification
      const session = await signInWithPassword(email, password);
      
      // Stage 2: Database Role Verification
      const isAdmin = await adminApi.checkAdminStatus(session.user.id);
      
      if (!isAdmin) {
        // Immediate expulsion for non-admin credentials
        await supabase.auth.signOut();
        throw new Error('Access Denied: Administrative clearance not detected for this subject.');
      }

      // Stage 3: Initiate MFA (OTP)
      await signInWithEmailOTP(email);
      setStep('otp-verify');
    } catch (err: any) {
      setError(err.message || 'Identity verification failed. Protocol mismatch.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    try {
      await verifyOtp(email, token);
      // Secondary Check - Ensure user is still admin after OTP
      const { data: { session } } = await supabase.auth.getSession();
      const isAdmin = await adminApi.checkAdminStatus(session?.user.id || '');
      if (!isAdmin) {
         await supabase.auth.signOut();
         throw new Error("Clearance revoked during synchronization.");
      }
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Token synchronization failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-rose-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Somno <span className="text-rose-500">Admin</span></h1>
          <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em] mt-2">Classified Terminal Access</p>
        </div>
        
        <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <m.div key="creds" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                <div className="text-center">
                  <h2 className="text-sm font-black text-white uppercase tracking-widest">Privileged Authentication</h2>
                </div>

                <form onSubmit={handleAdminAuth} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-rose-500/50" required />
                  </div>
                  
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400" size={18} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Access Password" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-rose-500/50" required />
                  </div>

                  <button disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95">
                    {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                    Execute Clearance Check
                  </button>
                </form>
                
                <div className="text-center">
                  <a href="/" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                    <ArrowLeft size={12} /> Return to Subject Terminal
                  </a>
                </div>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Identity Confirmation</h2>
                   <p className="text-[9px] text-rose-400 mt-2 font-bold tracking-widest uppercase">MFA Token Transmitted To: {email}</p>
                </div>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()} className="w-12 h-16 bg-slate-950/80 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-rose-500 outline-none transition-all" />
                  ))}
                </div>
                <button onClick={handleOtpVerify} disabled={loading || otp.some(d => !d)} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3 active:scale-95">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  Synchronize Administrator
                </button>
              </m.div>
            )}
          </AnimatePresence>
          {error && <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center italic uppercase flex items-center justify-center gap-3"><ShieldAlert size={16} /> {error}</m.div>}
        </GlassCard>
      </m.div>
    </div>
  );
}
