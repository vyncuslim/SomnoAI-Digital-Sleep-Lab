
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, Loader2, TriangleAlert } from 'lucide-react';
import { signInWithPassword, signInWithGoogle } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SomnoAI Lab</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Subject Terminal</p>
        </div>
        
        <GlassCard className="p-10 rounded-[3.5rem] border-white/10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Subject Email" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500 outline-none" required />
            </div>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500 outline-none" required />
            </div>
            <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
              Initialize Session
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5">
            <button onClick={() => signInWithGoogle()} className="w-full py-4 bg-white text-black rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3">
              <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
              Sign in with Google
            </button>
          </div>
          
          {error && (
            <div className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center uppercase tracking-widest">
              {error}
            </div>
          )}
        </GlassCard>
      </m.div>
    </div>
  );
}
