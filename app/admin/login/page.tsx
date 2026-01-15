import React, { useState } from 'react';
import { ShieldAlert, Lock, Fingerprint, Loader2, ChevronLeft, ArrowRight, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/GlassCard.tsx';
import { supabase } from '../../../lib/supabaseClient.ts';
import { adminApi } from '../../../services/supabaseService.ts';

const m = motion as any;

/**
 * Admin Access Portal for SomnoAI Laboratory.
 */
export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) throw authError;
      if (!data.session) throw new Error("Authentication failed: Node rejected session.");

      // Strict role verification to ensure only administrators gain access
      const isAdmin = await adminApi.checkAdminStatus(data.user.id);

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Subject lacks administrative clearance.");
      }

      // Success - Redirect to internal command center
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError(err.message || "Credential override failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 space-y-12 font-sans overflow-hidden relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-rose-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="text-center space-y-6 relative z-10">
        <button 
          onClick={() => window.location.hash = '#/'}
          className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.3em] flex items-center gap-3 mx-auto mb-12 transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> ABORT OVERRIDE
        </button>
        
        <m.div 
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="w-28 h-28 bg-rose-500/5 rounded-full flex items-center justify-center text-rose-500 border border-rose-500/20 mx-auto mb-6 shadow-[0_0_80px_rgba(225,29,72,0.1)]"
        >
          <ShieldAlert size={48} strokeWidth={1.5} />
        </m.div>
        
        <div className="space-y-1">
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Restricted <span className="text-rose-500">Portal</span>
          </h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Clearance Level 0 Only</p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-10 md:p-14 rounded-[4.5rem] border-rose-500/20 relative z-10 shadow-3xl">
        <form onSubmit={handleAdminLogin} className="space-y-8">
          <div className="space-y-4">
            <div className="relative group">
              <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
              <input 
                type="email" 
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Admin Identifier"
                className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-white font-medium outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-800"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-800" size={18} />
              <input 
                type="password" 
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Security Key"
                className="w-full bg-slate-950/60 border border-white/10 rounded-full px-16 py-5 text-sm text-rose-500 font-mono outline-none focus:border-rose-500/50 transition-all placeholder:text-slate-800"
                required
              />
            </div>
          </div>
          
          <button 
            type="submit"
            disabled={isProcessing}
            className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all hover:bg-rose-500 flex items-center justify-center gap-4 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <Fingerprint size={18} />}
            {isProcessing ? 'HANDSHAKING...' : 'INITIALIZE OVERRIDE'}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <m.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 text-rose-400 text-[11px] font-bold"
            >
              <ShieldAlert size={18} className="shrink-0 mt-0.5" />
              <p className="italic font-bold text-rose-400 leading-relaxed">{error}</p>
            </m.div>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-10 border-t border-white/5 text-center space-y-6">
           <p className="text-[9px] text-slate-800 font-bold uppercase tracking-widest leading-relaxed italic">
            This terminal is monitored. All authentication attempts are logged at the neural edge.
          </p>
          <a href="/" className="inline-flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
            Return to Public Dashboard <ArrowRight size={12} />
          </a>
        </div>
      </GlassCard>

      <footer className="text-center text-slate-800 font-black uppercase text-[8px] tracking-[0.6em] pointer-events-none pb-12">
        SomnoAI Digital Sleep Lab • Neural Grid Access
      </footer>
    </div>
  );
}