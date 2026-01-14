
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, ShieldCheck, ChevronLeft, TriangleAlert, Lock, Key, UserPlus, LogIn, Github } from 'lucide-react';
import { signInWithEmailOTP, verifyOtp, signInWithGoogle, signInWithPassword, signUpWithPassword } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

type AuthMode = 'password' | 'otp' | 'signup';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [mode, setMode] = useState<AuthMode>('password');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const spaNavigate = (path: string) => {
    try {
      window.history.pushState({}, '', path);
    } catch (e) {
      console.warn("Internal navigation failed to update URL. Redirecting view via popstate trigger.", e);
    }
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (mode === 'password') {
        await signInWithPassword(email, password);
        // App.tsx contains the actual logic for redirection via onAuthStateChange
      } else if (mode === 'signup') {
        await signUpWithPassword(email, password);
        setSuccess('Laboratory invitation sent. Please check your neural link (email).');
      } else if (mode === 'otp') {
        if (step === 'input') {
          await signInWithEmailOTP(email);
          setStep('verify');
        } else {
          await verifyOtp(email, otp);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Identity verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-12">
          <Logo size={80} animated={true} className="mx-auto mb-8" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none mb-3">SomnoAI Lab</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Digital Biometric Access Protocol</p>
        </div>
        
        <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/10 shadow-3xl space-y-10">
          <div className="flex bg-slate-950/60 p-1.5 rounded-full border border-white/5">
            {(['password', 'otp', 'signup'] as AuthMode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setStep('input'); setError(null); }}
                className={`flex-1 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {m}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <m.form 
              key={`${mode}-${step}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onSubmit={handleAuth} 
              className="space-y-6"
            >
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                  <input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="Terminal Email" 
                    className="w-full bg-slate-950/80 border border-white/10 rounded-[1.8rem] pl-16 pr-6 py-6 text-sm text-white outline-none focus:border-indigo-500/50" 
                    required 
                  />
                </div>

                {mode !== 'otp' && (
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder="Security Passkey" 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[1.8rem] pl-16 pr-6 py-6 text-sm text-white outline-none focus:border-indigo-500/50" 
                      required 
                    />
                  </div>
                )}

                {mode === 'otp' && step === 'verify' && (
                  <div className="relative group">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <input 
                      type="text" 
                      value={otp} 
                      onChange={e => setOtp(e.target.value)} 
                      placeholder="Neural Verification Code" 
                      className="w-full bg-slate-950/80 border border-white/10 rounded-[1.8rem] pl-16 pr-6 py-6 text-sm text-white font-mono tracking-[0.5em] outline-none focus:border-indigo-500/50 text-center" 
                      required 
                    />
                  </div>
                )}
              </div>

              <button disabled={loading} className="w-full py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3">
                {loading ? <Loader2 className="animate-spin" size={18} /> : mode === 'signup' ? <UserPlus size={18}/> : <Zap size={18} />}
                {loading ? 'Decrypting...' : step === 'verify' ? 'Confirm Identity' : `Authorize ${mode}`}
              </button>
            </m.form>
          </AnimatePresence>

          <div className="relative flex items-center py-2 opacity-10">
            <div className="flex-grow border-t border-white"></div>
            <span className="flex-shrink mx-4 text-[9px] font-black uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white"></div>
          </div>

          <button 
             onClick={() => signInWithGoogle()}
             className="w-full py-5 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl"
          >
             <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
             Google Neural Link
          </button>

          <p className="text-[9px] text-center text-slate-500 italic uppercase tracking-wider">
            Clearance required for laboratory interaction.
          </p>
          
          {error && <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose-500 text-[11px] text-center font-bold italic tracking-tight">{error}</m.p>}
          {success && <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-500 text-[11px] text-center font-bold italic tracking-tight">{success}</m.p>}
        </GlassCard>
      </m.div>
    </div>
  );
}
