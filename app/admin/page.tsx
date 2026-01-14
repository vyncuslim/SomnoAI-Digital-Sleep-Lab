
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { Loader2, ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function AdminDashboard() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/admin/login';
        return;
      }
      const { data: userProfile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (!userProfile || userProfile.role !== 'admin') {
        setStatus('unauthorized');
        setTimeout(() => { window.location.href = '/'; }, 3000);
        return;
      }
      setProfile(userProfile);
      setStatus('authorized');
    }
    initAdmin();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#020617]">
        <Loader2 className="text-indigo-500 animate-spin" size={56} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypting Authorization Layers...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] text-center">
        <GlassCard className="p-12 rounded-[5rem] border-rose-500/20 max-w-md space-y-8 shadow-2xl">
          <ShieldAlert size={60} className="text-rose-500 mx-auto" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Clearance Denied</h1>
          <p className="text-sm text-slate-400 italic">Redirecting to standard terminal protocol...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 bg-[#020617]">
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center px-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg"><ShieldCheck size={28} /></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Administrator</span>
            <span className="text-lg font-bold text-white italic">{profile?.email}</span>
          </div>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login'; }} className="px-8 py-3 bg-white/5 border border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all flex items-center gap-3 shadow-xl">
          <LogOut size={16} /> Logout
        </button>
      </div>
      <AdminView onBack={() => { window.location.href = '/'; }} />
    </div>
  );
}
