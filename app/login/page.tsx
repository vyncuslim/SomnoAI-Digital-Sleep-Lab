
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Zap, Loader2, ShieldCheck, ChevronLeft, TriangleAlert } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient.ts';
import { Logo } from '../../components/Logo.tsx';

const m = motion as any;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { emailRedirectTo: window.location.origin + '/admin' }
      });
      if (error) throw error;
      setStep('otp');
    } catch (err: any) {
      setError(err.message);
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
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md"
      >
        <div className="text-center mb-10 space-y-4">
          <div className="inline-block p-4 bg-slate-900/50 rounded-full border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">SomnoAI Portal</h1>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 md:p-10 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="space-y-2 text-center">
                <h2 className="text-xl font-bold text-white">Identity Access</h2>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Enter your administrative email</p>
              </div>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@sleepsomno.com"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-14 py-4 text-sm outline-none focus:border-indigo-500/50"
                  required
                />
              </div>
              <button 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                Send Access Token
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="text-center space-y-2">
                <button onClick={() => setStep('email')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
                  <ChevronLeft size={14} /> Change Email
                </button>
                <h2 className="text-xl font-bold text-white uppercase italic tracking-tight">Verify Token</h2>
              </div>
              <input 
                type="text" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-Digit Code"
                className="w-full bg-slate-950/60 border border-white/5 rounded-2xl px-6 py-4 text-center text-xl font-black tracking-[0.5em] outline-none focus:border-indigo-500/50"
                maxLength={6}
                required
              />
              <button 
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl flex items-center justify-center gap-3 transition-all"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                Synchronize Identity
              </button>
            </form>
          )}

          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-[11px] font-bold">
              <TriangleAlert size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </m.div>
    </div>
  );
}
