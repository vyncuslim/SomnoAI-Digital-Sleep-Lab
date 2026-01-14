
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Loader2, Key, TriangleAlert, Lock, ArrowLeft } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp } from '../../../services/supabaseService.ts';
import { Logo } from '../../../components/Logo.tsx';
import { GlassCard } from '../../../components/GlassCard.tsx';

const m = motion as any;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      // Admin check logic usually happens after session is established
      await signInWithEmailOTP(email);
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Authorization failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    setLoading(true);
    try {
      await verifyOtp(email, token);
      window.location.href = '/admin';
    } catch (err: any) {
      setError('Invalid token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <m.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Admin Portal</h1>
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.4em] mt-2">Classified Access Only</p>
        </div>
        
        <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 shadow-2xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <form onSubmit={handleAdminAuth} className="space-y-6">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400 transition-colors" size={18} />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-rose-500/50" required />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400 transition-colors" size={18} />
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Admin Cipher" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white outline-none focus:border-rose-500/50" required />
                </div>
                <button disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl transition-all flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Execute Auth
                </button>
              </form>
            ) : (
              <m.div className="space-y-8">
                <h2 className="text-xl font-black text-white text-center uppercase tracking-widest italic">Verification Required</h2>
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input key={idx} ref={el => { otpRefs.current[idx] = el; }} type="text" maxLength={1} value={digit} onChange={(e) => {
                      const newOtp = [...otp]; newOtp[idx] = e.target.value; setOtp(newOtp);
                      if (e.target.value && idx < 5) otpRefs.current[idx+1]?.focus();
                    }} className="w-12 h-16 bg-slate-950/80 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-rose-500 outline-none transition-all" />
                  ))}
                </div>
                <button onClick={handleOtpVerify} disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
                  Authorize Admin
                </button>
              </m.div>
            )}
          </AnimatePresence>
          {error && <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center italic uppercase">{error}</div>}
        </GlassCard>
      </m.div>
    </div>
  );
}
