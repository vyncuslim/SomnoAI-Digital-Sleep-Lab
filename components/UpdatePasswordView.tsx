
import React, { useState } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { Lock, Zap, Loader2, CheckCircle2, ShieldAlert, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authApi } from '../services/supabaseService.ts';
import { Logo } from './Logo.tsx';

const m = motion as any;

export const UpdatePasswordView: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Handshake mismatch: Access keys must be identical.");
      return;
    }
    if (password.length < 6) {
      setError("Protocol violation: Access key requires minimum 6 characters.");
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const { error: updateErr } = await authApi.updatePassword(password);
      if (updateErr) throw updateErr;
      
      setSuccess(true);
      setTimeout(() => onSuccess(), 2000);
    } catch (err: any) {
      setError(err.message || "Registry update failed. Link may have expired.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[150px] rounded-full" />
      </div>

      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-md space-y-10 relative z-10"
      >
        <div className="text-center space-y-6">
          <Logo size={80} animated={true} className="mx-auto" />
          <div className="space-y-1">
             <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Access Rotation</h1>
             <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic">Identity Recovery Protocol</p>
          </div>
        </div>

        <GlassCard className="p-10 md:p-14 border-indigo-500/20 shadow-2xl rounded-[4rem]">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-indigo-400 px-4 tracking-widest italic flex items-center gap-2">
                    <Lock size={12}/> New Access Key
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic"
                      placeholder="Minimum 6 characters"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
               </div>

               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase text-slate-500 px-4 tracking-widest italic">Confirm Key</label>
                  <input 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic"
                    placeholder="Repeat access key"
                    required
                  />
               </div>
            </div>

            <AnimatePresence>
              {error && (
                <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-3">
                   <ShieldAlert className="text-rose-500 shrink-0 mt-0.5" size={16} />
                   <p className="text-[10px] font-bold text-rose-400 uppercase leading-relaxed italic">{error}</p>
                </m.div>
              )}
            </AnimatePresence>

            <button 
              type="submit" 
              disabled={isUpdating || success}
              className={`w-full py-6 rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all italic relative overflow-hidden ${success ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95 disabled:opacity-40'}`}
            >
              {isUpdating ? <Loader2 className="animate-spin" size={20} /> : success ? <CheckCircle2 size={20} /> : <Zap size={20} fill="currentColor" />}
              <span>{isUpdating ? "ROTATING KEY..." : success ? "KEY ROTATED" : "CONFIRM ROTATION"}</span>
            </button>
          </form>
        </GlassCard>
      </m.div>

      <footer className="mt-16 opacity-30">
        <p className="text-[8px] font-mono font-black uppercase tracking-[0.8em] text-slate-700 italic">SECURE ACCESS NODE • PROTOCOL 7.2</p>
      </footer>
    </div>
  );
};
