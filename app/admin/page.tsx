
'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient.ts';
import { AdminView } from '../../components/AdminView.tsx';
import { ShieldCheck, LogOut, Loader2, Lock } from 'lucide-react';
import { adminApi } from '../../services/supabaseService.ts';

/**
 * Command Deck - Restricted Node
 * Protected by multi-layer role verification from the 'profiles' table.
 */
export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (!currentSession) {
          window.location.hash = '/admin/login';
          return;
        }

        setSession(currentSession);
        // Deep verification of role clearance
        const isUserAdmin = await adminApi.checkAdminStatus(currentSession.user.id);
        
        if (isUserAdmin === false) {
           // Security Intercept: Redirect unauthorized subject to user terminal
           setTimeout(() => {
             window.location.hash = '/login';
           }, 2000);
        }
        
        setIsAdmin(isUserAdmin);
      } catch (err) {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-rose-500" size={32} />
        <p className="font-black uppercase tracking-widest text-slate-500 text-[10px]">Initializing Level 0 Clearance...</p>
      </div>
    );
  }

  // Access Intercept UI
  if (!session || isAdmin === false) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-sm p-12 bg-slate-900/50 rounded-[3rem] border border-rose-500/20 shadow-2xl">
          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-rose-500/20">
             <Lock className="text-rose-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-rose-500 uppercase italic tracking-tighter leading-none">Access Revoked</h1>
          <p className="text-slate-500 text-sm font-medium leading-relaxed">
            Administrative credentials required. This unauthorized attempt has been logged. Redirecting...
          </p>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => window.location.hash = '/admin/login'}
              className="w-full py-4 bg-rose-600 text-white rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-rose-500 transition-all shadow-xl"
            >
              Re-authorize Terminal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-12 pb-32 px-4 bg-[#020617]">
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(225,29,72,0.3)] border border-rose-400/30">
            <ShieldCheck size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Master Command Node</span>
            <span className="text-lg font-bold text-white italic truncate max-w-[200px] md:max-w-none">
              {session.user.email}
            </span>
          </div>
        </div>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.hash = '/';
          }}
          className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-400 transition-all flex items-center gap-3"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </div>
      <AdminView onBack={() => { window.location.hash = '/'; }} />
    </div>
  );
}
