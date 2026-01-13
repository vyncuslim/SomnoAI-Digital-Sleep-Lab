
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, ShieldCheck, ChevronLeft, TriangleAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const spaNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { shouldCreateUser: true }
      });
      if (error) throw error;
      setStep('otp');
      setSuccessMsg('Identity token dispatched.');
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      spaNavigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SomnoAI Portal</h1>
        </div>
        <GlassCard className="p-10 rounded-[4rem] border-white/10 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <m.form key="email" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleSendOtp} className="space-y-8">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] px-8 py-5 text-white outline-none focus:border-indigo-500/50" required />
                <button disabled={loading} className="w-full py-5 bg-indigo-600 rounded-full font-black text-xs uppercase tracking-[0.3em] text-white">
                  {loading ? <Loader2 className="animate-spin inline mr-2" /> : <Zap className="inline mr-2" />} Transmit
                </button>
                <button type="button" onClick={() => spaNavigate('/')} className="w-full text-[10px] font-black text-slate-600 uppercase flex items-center justify-center gap-2">
                  <ChevronLeft size={14} /> Back
                </button>
              </m.form>
            ) : (
              <m.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleVerifyOtp} className="space-y-8">
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="000000" className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] px-8 py-5 text-center text-2xl font-black tracking-widest text-indigo-400 outline-none" required />
                <button disabled={loading} className="w-full py-5 bg-indigo-600 rounded-full font-black text-xs uppercase tracking-[0.3em] text-white">
                  Verify
                </button>
              </m.form>
            )}
          </AnimatePresence>
          {error && <p className="mt-4 text-rose-500 text-xs text-center font-bold">{error}</p>}
        </GlassCard>
      </m.div>
    </div>
  );
}
