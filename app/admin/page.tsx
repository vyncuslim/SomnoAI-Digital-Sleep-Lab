
import React from 'react';
import { createSupabaseServer } from '../../lib/supabase/server.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { ShieldCheck, LogOut } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = createSupabaseServer();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    // Note: Usually handled by middleware, but added as a fail-safe
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-white">
        <p className="font-black uppercase tracking-widest text-slate-500">Initializing Clearance...</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (profile?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-rose-500 uppercase italic">Access Denied</h1>
          <p className="text-slate-500 text-sm">Level 0 Clearance Not Detected.</p>
          <a href="/login" className="text-indigo-400 text-xs font-bold uppercase tracking-widest block pt-4">Return to Subject Lab</a>
        </div>
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
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Admin Node</span>
            <span className="text-lg font-bold text-white italic">{session.user.email}</span>
          </div>
        </div>
        <button 
          onClick={() => { window.location.href = '/login'; }}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-all flex items-center gap-3"
        >
          <LogOut size={16} /> Disconnect Node
        </button>
      </div>
      <AdminView onBack={() => { window.location.href = '/'; }} />
    </div>
  );
}
