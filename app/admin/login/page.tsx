
'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, Mail, Loader2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { signInWithPassword, adminApi } from '../../../services/supabaseService.ts';
import { Logo } from '../../../components/Logo.tsx';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';

const m = motion as any;

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const sessionData = await signInWithPassword(email, password);
      if (!sessionData) throw new Error("Authentication failed.");
      
      const isAdmin = await adminApi.checkAdminStatus(sessionData.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Access Denied: Level 0 Clearance Required.');
      }

      // Navigate within SPA context
      window.history.pushState({}, '', '/admin');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } catch (err: any) {
      setError(err.message || 'Verification Failed.');
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
          <form onSubmit={handleAdminAuth} className="space-y-6">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400" size={18} />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin ID" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-rose-500 outline-none transition-all" required />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-rose-400" size={18} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Secure Key" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-rose-500 outline-none transition-all" required />
            </div>
            <button disabled={loading} className="w-full py-5 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] transition-all">
              {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={18} />}
              Authorize Command
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <button onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new PopStateEvent('popstate')); }} className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest flex items-center justify-center gap-2 mx-auto">
              <ArrowLeft size={12} /> Exit to Lab Terminal
            </button>
          </div>

          {error && <div className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-[10px] font-bold text-center uppercase flex items-center justify-center gap-3"><ShieldAlert size={16} /> {error}</div>}
        </GlassCard>
      </m.div>
    </div>
  );
}
