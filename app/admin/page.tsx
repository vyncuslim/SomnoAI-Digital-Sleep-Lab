import React, { useEffect, useState } from 'react';
import { Shield, Loader2, LogOut, ChevronLeft, Activity, Users, Database, ShieldCheck, Terminal, AlertCircle, LayoutDashboard, DatabaseZap } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { adminApi } from '../../services/supabaseService.ts';

const m = motion as any;

/**
 * Admin Command Deck - Restricted Terminal for Laboratory Management.
 * Features advanced telemetry and secure registry oversight.
 */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.hash = '#/admin/login';
        return;
      }

      const status = await adminApi.checkAdminStatus(session.user.id);
      
      if (!status) {
        await supabase.auth.signOut();
        window.location.hash = '#/admin/login';
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <Loader2 className="animate-spin text-rose-500" size={48} />
          <m.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl"
          />
        </div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Verifying Security Clearance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 md:p-20 space-y-12 animate-in fade-in duration-1000">
      <header className="flex justify-between items-center max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => window.location.hash = '#/'}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 transition-all border border-white/5 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Command <span className="text-rose-500">Deck</span>
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Administrative Terminal Alpha</p>
          </div>
        </div>
        
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.hash = '#/';
          }}
          className="flex items-center gap-3 px-8 py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full font-black text-[10px] uppercase tracking-widest border border-rose-500/20 transition-all shadow-xl"
        >
          <LogOut size={16} /> Disconnect
        </button>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-10 space-y-8 md:col-span-2 border-white/5 bg-white/[0.02]" intensity={1.1}>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-4 text-white">
               <Activity size={24} className="text-rose-500" />
               <h2 className="text-xl font-black italic uppercase tracking-tight">System Telemetry</h2>
             </div>
             <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Stable</span>
             </div>
           </div>
           
           <div className="h-48 flex items-end gap-2 border-b border-white/5 pb-4">
             {[40, 65, 30, 85, 45, 90, 70, 50, 80, 60, 95, 35, 75, 45, 85].map((h, i) => (
               <m.div 
                 key={i} 
                 initial={{ height: 0 }}
                 animate={{ height: `${h}%` }}
                 transition={{ delay: i * 0.05, duration: 1, type: 'spring' }}
                 className="flex-1 bg-rose-500/20 border-t border-rose-500/50 rounded-t-lg" 
               />
             ))}
           </div>
           
           <div className="grid grid-cols-3 gap-6 pt-4">
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase">Neural Load</p>
                <p className="text-sm font-bold text-white italic">0.42 / 1.00</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase">Active Links</p>
                <p className="text-sm font-bold text-white italic">-- ACTIVE</p>
              </div>
              <div className="space-y-1">
                <p className="text-[8px] font-black text-slate-600 uppercase">Registry Status</p>
                <p className="text-sm font-bold text-white italic">SECURE</p>
              </div>
           </div>
        </GlassCard>

        <div className="space-y-8">
          <GlassCard className="p-10 space-y-8 border-white/5 bg-white/[0.02]">
             <div className="flex items-center gap-4 text-white">
               <Users size={24} className="text-rose-500" />
               <h2 className="text-xl font-black italic uppercase tracking-tight">Registry</h2>
             </div>
             <div className="space-y-4">
                <div className="p-5 bg-slate-950/40 rounded-3xl border border-white/5 flex items-center justify-between">
                   <span className="text-xs font-bold text-white italic">Subject Count</span>
                   <span className="text-rose-400 font-black">---</span>
                </div>
                <div className="p-5 bg-slate-950/40 rounded-3xl border border-white/5 flex items-center justify-between">
                   <span className="text-xs font-bold text-white italic">Total Uptime</span>
                   <span className="text-rose-400 font-black">99.9%</span>
                </div>
             </div>
          </GlassCard>
          
          <GlassCard className="p-8 space-y-4 border-rose-500/10 bg-rose-500/[0.02] rounded-[3rem]">
            <div className="flex items-center gap-3 text-rose-500">
               <Terminal size={18} />
               <span className="text-[10px] font-black uppercase tracking-widest">Logs</span>
            </div>
            <p className="text-[9px] text-slate-600 font-mono leading-relaxed italic">
              Scanning encrypted logs...<br/>
              [OK] NEURAL_SYNC_SUCCESS<br/>
              [OK] AUTH_LINK_ESTABLISHED
            </p>
          </GlassCard>
        </div>
      </div>

      <div className="max-w-6xl mx-auto flex justify-center pt-10">
         <div className="p-12 bg-rose-500/5 border border-rose-500/20 rounded-[5rem] text-center max-w-3xl space-y-6 relative overflow-hidden group">
            <m.div 
              animate={{ opacity: [0, 0.1, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-rose-500/10 blur-3xl"
            />
            <Shield size={40} className="text-rose-500 mx-auto group-hover:scale-110 transition-transform duration-700" />
            <div className="space-y-2">
              <h3 className="text-white font-black uppercase text-xs tracking-[0.5em]">Restricted Command Protocol</h3>
              <p className="text-xs text-slate-500 leading-relaxed italic max-w-md mx-auto">
                "Access is restricted to laboratory administrators with Level 0 clearance. Unauthorized attempts are intercepted by neural security nodes."
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}