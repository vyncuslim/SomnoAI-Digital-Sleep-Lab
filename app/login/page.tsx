
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Zap, Loader2, TriangleAlert, ArrowLeft } from 'lucide-react';
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
      setError(err.message || 'Authentication failed. Access denied.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">SomnoAI <span className="text-indigo-500">Lab</span></h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">Subject Terminal Access</p>
        </div>
        
        <GlassCard className="p-10 rounded-[3.5rem] border-white/10 shadow-3xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email Address" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500 outline-none transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Access Password" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500 outline-none transition-all" required />
            </div>
            <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
              Authorize Session
            </button>
          </form>
          
          <div className="relative flex items-center py-6">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink mx-4 text-[9px] text-slate-600 font-black uppercase tracking-widest">OR</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          <button onClick={() => signInWithGoogle()} className="w-full py-4 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-lg hover:bg-slate-100 transition-all">
            <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
            Sign in with Google Fit
          </button>
          
          <div className="mt-8 text-center">
            <a href="/admin/login" className="text-[10px] font-black text-slate-600 hover:text-rose-400 uppercase tracking-widest transition-colors">
              Administrative Command Portal
            </a>
          </div>

          {error && (
            <m.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center uppercase flex items-center justify-center gap-2">
              <TriangleAlert size={14} /> {error}
            </m.div>
          )}
        </GlassCard>
      </m.div>
    </div>
  );
}
