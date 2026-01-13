
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { Loader2, ShieldAlert } from 'lucide-react';

export default function AdminPage() {
  const [status, setStatus] = useState<'loading' | 'authorized' | 'unauthorized' | 'unauthenticated'>('loading');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setStatus('unauthenticated');
        window.location.href = '/login';
        return;
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, email')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error || !profile || profile.role !== 'admin') {
        setStatus('unauthorized');
        return;
      }

      setUser(profile);
      setStatus('authorized');
    }

    checkAdmin();
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <Loader2 className="animate-spin text-indigo-500" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Decrypting Authorization...</p>
      </div>
    );
  }

  if (status === 'unauthorized') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-10 text-center">
        <div className="p-10 bg-rose-500/10 rounded-[4rem] border border-rose-500/20 max-w-sm space-y-6">
          <ShieldAlert size={48} className="text-rose-500 mx-auto" />
          <h1 className="text-xl font-black italic text-white uppercase">Clearance Denied</h1>
          <p className="text-sm text-slate-400">Your current identification lacks administrative privileges for Node: SOMNO_LAB.</p>
          <button 
            onClick={() => window.location.href = '/'}
            className="w-full py-4 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
          >
            Return to Base
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10">
      <AdminView onBack={() => window.location.href = '/'} />
    </div>
  );
}
