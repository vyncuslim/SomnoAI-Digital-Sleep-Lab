
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ShieldCheck, Loader2, Zap, ArrowLeft, ShieldAlert } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp, adminApi } from '../../../services/supabaseService.ts';
import { Logo } from '../../../components/Logo.tsx';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';

const m = motion as any;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'creds' | 'otp'>('creds');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCreds = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const session = await signInWithPassword(email, password);
      const isAdmin = await adminApi.checkAdminStatus(session.user.id);
      
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Lacks Admin Clearance.');
      }

      await signInWithEmailOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Verification Failed.');
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

  const handleVerify = async () => {
    setLoading(true);
    try {
      await verifyOtp(email, otp.join(''));
      window.location.href = '/admin';
    } catch (err: any) {
      setError('Invalid Token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617]">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-rose-500/5 rounded-full blur-[120px]" />
      </div>

      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Somno <span className="text-rose-500">Admin</span></h1>
          <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-[0.4em] mt-2">Classified Terminal Access</p>
        </div>

        <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 'creds' ? (
              <m.form key="creds" onSubmit={handleCreds} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-rose-500 outline-none" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Secure Key" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-rose-500 outline-none" required />
                </div>
                <button disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
                  Authorize Command
                </button>
                <div className="text-center">
                  <a href="/" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2">
                    <ArrowLeft size={12} /> Exit to Lab
                  </a>
                </div>
              </m.form>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-black text-white uppercase italic tracking-tight">Identity Token</h2>
                  <p className="text-[9px] text-rose-400 font-bold uppercase tracking-widest">Sent to: {email}</p>
                </div>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => handleOtpChange(idx, e.target.value)} onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()} className="w-12 h-16 bg-slate-950/80 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-rose-500 outline-none transition-all" />
                  ))}
                </div>
                <button onClick={handleVerify} disabled={loading || otp.some(d => !d)} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                  Confirm Access
                </button>
              </m.div>
            )}
          </AnimatePresence>
          {error && <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest flex items-center justify-center gap-2"><ShieldAlert size={14}/> {error}</div>}
        </GlassCard>
      </m.div>
    </div>
  );
}
