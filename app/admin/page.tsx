
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { Loader2, ShieldAlert, LogOut, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function AdminPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'>('loading');
  const [profile, setProfile] = useState<any>(null);

  const spaNavigate = (path: string) => {
    const finalPath = path.startsWith('/') ? path : '/' + path;
    window.history.pushState({}, '', finalPath);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  useEffect(() => {
    async function initAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setStatus('unauthenticated');
        spaNavigate('/admin/login');
        return;
      }

      // Query Profile for Clearance
      const { data: userProfile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !userProfile || userProfile.role !== 'admin') {
        setStatus('unauthorized');
        // Specific delay before mandatory redirect
        setTimeout(() => spaNavigate('/admin/login'), 2000);
        return;
      }

      setProfile(userProfile);
      setStatus('authorized');
    }

    initAdmin();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    spaNavigate('/admin/login');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-[#020617]">
        <m.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
           <Loader2 className="text-indigo-500" size={56} />
        </m.div>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-500">Decrypting Authorization Layers...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-[#020617] text-center">
        <GlassCard className="p-12 rounded-[5rem] border-rose-500/20 max-w-md space-y-8 shadow-2xl">
          <ShieldAlert size={60} className="text-rose-500 mx-auto" />
          <div className="space-y-4">
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter">Clearance Denied</h1>
            <p className="text-sm text-slate-400 italic">"Node identity lacks superuser privileges. Access to laboratory admin terminal revoked."</p>
          </div>
          <div className="pt-4">
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <m.div 
                initial={{ width: 0 }} 
                animate={{ width: "100%" }} 
                transition={{ duration: 2.0, ease: "linear" }} 
                className="h-full bg-rose-500" 
              />
            </div>
            <p className="text-[8px] font-black uppercase text-slate-600 mt-2 tracking-widest">Protocol: Redirecting to Login Portal</p>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (status === 'unauthenticated') {
     return <div className="min-h-screen bg-[#020617]" />;
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 bg-[#020617]">
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-center px-4 gap-6">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-lg ring-4 ring-indigo-500/10">
            <ShieldCheck size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Admin Authorization: VERIFIED</span>
            <span className="text-lg font-bold text-white italic">{profile?.email}</span>
          </div>
        </div>
        
        <button 
          onClick={handleLogout}
          className="px-8 py-3 bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all flex items-center gap-3 shadow-xl"
        >
          <LogOut size={16} /> Terminate Session
        </button>
      </div>

      <m.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
        <AdminView onBack={() => spaNavigate('/')} />
      </m.div>
    </div>
  );
}
