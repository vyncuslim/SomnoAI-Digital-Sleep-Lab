
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { Loader2, ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';
import { adminApi } from '../../services/supabaseService.ts';

const m = motion as any;

export default function AdminDashboard() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized'>('loading');
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    async function verify() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/admin/login';
        return;
      }
      
      const isAdmin = await adminApi.checkAdminStatus(session.user.id);
      
      if (!isAdmin) {
        setStatus('unauthorized');
        await supabase.auth.signOut();
        setTimeout(() => { window.location.href = '/login'; }, 3000);
        return;
      }

      const { data: userProfile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
      setProfile(userProfile);
      setStatus('authorized');
    }
    verify();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#020617]">
        <Loader2 className="text-rose-500 animate-spin" size={56} />
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Syncing Administration Nodes...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] text-center">
        <GlassCard className="p-12 rounded-[5rem] border-rose-500/20 max-w-md space-y-8 shadow-2xl">
          <ShieldAlert size={60} className="text-rose-500 mx-auto" />
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Access Denied</h1>
          <p className="text-sm text-slate-400 italic">Unauthorized node access detected. Purging session...</p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 bg-[#020617]">
      <div className="max-w-6xl mx-auto mb-12 flex justify-between items-center px-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg border border-rose-400/30">
            <ShieldCheck size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Admin Terminal</span>
            <span className="text-lg font-bold text-white italic">{profile?.email}</span>
          </div>
        </div>
        <button 
          onClick={async () => { await supabase.auth.signOut(); window.location.href = '/admin/login'; }} 
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-all flex items-center gap-3"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>
      <AdminView onBack={() => { window.location.href = '/'; }} />
    </div>
  );
}
