
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { Loader2, ShieldAlert, LogOut, UserCheck, Terminal, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function AdminPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'>('loading');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus('unauthenticated');
        window.location.href = '/login';
        return;
      }

      // Fetch profile for role verification
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email, id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile || profile.role !== 'admin') {
        setStatus('unauthorized');
        return;
      }

      setUserProfile(profile);
      setStatus('authorized');
    }

    checkAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#020617]">
        <div className="relative">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypting Clearance...</p>
          <p className="text-[8px] font-mono text-indigo-400 opacity-40">NODE: SOMNO_SECURE_GATEWAY_v1.8</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] text-center">
        <GlassCard className="p-12 rounded-[5rem] border-rose-500/20 max-w-md space-y-8 shadow-[0_50px_100px_-20px_rgba(225,29,72,0.15)]">
          <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-500 mx-auto border border-rose-500/20">
            <ShieldAlert size={40} />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Clearance Denied</h1>
            <p className="text-sm text-slate-400 leading-relaxed italic">
              "Your current identification profile lacks high-level administrative clearance for Node: SOMNO_LAB."
            </p>
          </div>
          <div className="space-y-4 pt-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              Return to Base
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-[10px] font-black text-rose-500/60 hover:text-rose-400 uppercase tracking-widest"
            >
              Terminate Session
            </button>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 bg-[#020617]">
      {/* Admin Quick Profile Overlay */}
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center px-4">
        <GlassCard className="px-8 py-4 rounded-full border-indigo-500/20 flex items-center gap-6">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged as Admin</span>
            <span className="text-sm font-bold text-white italic">{userProfile?.email}</span>
          </div>
        </GlassCard>
        
        <button 
          onClick={handleLogout}
          className="p-4 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-3xl text-slate-600 hover:text-rose-500 transition-all shadow-xl"
          title="Disconnect Lab"
        >
          <LogOut size={24} />
        </button>
      </div>

      <AnimatePresence mode="wait">
        <m.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          <AdminView onBack={() => window.location.href = '/'} />
        </m.div>
      </AnimatePresence>
    </div>
  );
}
