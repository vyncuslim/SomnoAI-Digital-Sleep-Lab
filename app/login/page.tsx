
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, ShieldCheck, ChevronLeft, TriangleAlert, Fingerprint } from 'lucide-react';
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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: { 
          emailRedirectTo: window.location.origin + '/admin',
          shouldCreateUser: true
        }
      });
      if (error) throw error;
      setStep('otp');
      setSuccessMsg('Identity token dispatched to your inbox.');
    } catch (err: any) {
      setError(err.message || 'Verification sequence failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error, data } = await supabase.auth.verifyOtp({ 
        email, 
        token: otp, 
        type: 'email' 
      });
      if (error) throw error;
      // Force navigation to admin to trigger role check
      window.location.href = '/admin';
    } catch (err: any) {
      setError(err.message || 'Invalid access token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-12 space-y-4">
          <m.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="inline-block p-6 bg-slate-900/50 rounded-[2.5rem] border border-white/5 backdrop-blur-sm shadow-2xl"
          >
            <Logo size={80} animated={true} />
          </m.div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SomnoAI Portal</h1>
            <p className="text-[10px] font-black text-indigo-400/60 uppercase tracking-[0.4em]">Administrative Access Node</p>
          </div>
        </div>

        <GlassCard className="p-10 rounded-[4rem] border-white/10 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'email' ? (
              <m.form 
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleSendOtp} 
                className="space-y-8"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-xl font-black italic text-white uppercase">Identity Request</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Decrypt portal access via email</p>
                </div>
                
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="authorized@somno.lab"
                    className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                    required
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  Transmit Token
                </button>
                
                <button 
                  type="button"
                  onClick={() => window.location.href = '/'}
                  className="w-full text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <ChevronLeft size={14} /> Return to Dashboard
                </button>
              </m.form>
            ) : (
              <m.form 
                key="otp"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleVerifyOtp} 
                className="space-y-8"
              >
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('email')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto">
                    <ChevronLeft size={14} /> Modify Identity
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tight">Verify Fragment</h2>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Enter 6-digit biometric token</p>
                </div>

                <div className="relative">
                  <Fingerprint className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={20} />
                  <input 
                    type="text" 
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full bg-slate-950/60 border border-white/5 rounded-[1.5rem] px-16 py-5 text-center text-2xl font-black tracking-[0.8em] text-indigo-400 outline-none focus:border-indigo-500/50 transition-all"
                    maxLength={6}
                    required
                  />
                </div>

                <button 
                  disabled={loading}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-xl flex items-center justify-center gap-4 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  Synchronize Identity
                </button>
              </m.form>
            )}
          </AnimatePresence>

          {(error || successMsg) && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className={`mt-8 p-5 rounded-[1.5rem] flex items-center gap-4 text-[11px] font-bold ${error ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'}`}
            >
              {error ? <TriangleAlert size={18} className="shrink-0" /> : <Zap size={18} className="shrink-0" />}
              <p>{error || successMsg}</p>
            </m.div>
          )}
        </GlassCard>
      </m.div>
    </div>
  );
}
