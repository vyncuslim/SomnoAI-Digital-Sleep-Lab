import React, { useEffect, useState } from 'react';
import { 
  Shield, Loader2, LogOut, ChevronLeft, Activity, Users, Database, 
  ShieldCheck, Terminal, AlertCircle, LayoutDashboard, DatabaseZap, 
  Settings, MessageSquare, ShieldAlert, Cpu, Network
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/GlassCard.tsx';
import { supabase } from '../../lib/supabaseClient.ts';
import { adminApi } from '../../services/supabaseService.ts';

const m = motion as any;

/**
 * Admin Command Deck - Restricted Terminal Alpha.
 * Implements strict "Verify-then-Render" authorization.
 */
export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [systemStats, setSystemStats] = useState({ users: 0, records: 0, feedback: 0 });

  useEffect(() => {
    const protectAdmin = async () => {
      setLoading(true);
      
      // 1. Check for valid Auth Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.hash = '#/admin/login';
        return;
      }

      // 2. Query permissions database: Strict Role Validation
      try {
        const isAdmin = await adminApi.checkAdminStatus(session.user.id);
        
        if (!isAdmin) {
          // 3. Unauthorized access: Immediate expulsion
          console.error("Critical Security Event: Unauthorized access attempt at Admin Terminal.");
          await supabase.auth.signOut();
          window.location.hash = '#/admin/login';
          return;
        }

        // 4. Authorized: Initialize Command Deck
        setAdminUser(session.user);
        setIsAuthorized(true);
        
        // Load minimal stats
        const [u, r, f] = await Promise.all([
          adminApi.getUsers(),
          adminApi.getSleepRecords(),
          adminApi.getFeedback()
        ]);
        setSystemStats({ users: u.length, records: r.length, feedback: f.length });
      } catch (e) {
        console.error("Telemetry sync failed:", e);
        window.location.hash = '#/admin/login';
        return;
      } finally {
        setLoading(false);
      }
    };

    protectAdmin();
  }, []);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-8">
        <div className="relative">
          <Loader2 className="animate-spin text-rose-500" size={56} />
          <m.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-rose-500/20 rounded-full blur-2xl"
          />
        </div>
        <div className="text-center space-y-2">
          <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.6em] animate-pulse">Neural Handshake in Progress</p>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Verifying Clearance Level 0</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] p-8 md:p-20 space-y-12 animate-in fade-in duration-1000 selection:bg-rose-500/30">
      {/* Header Area */}
      <header className="flex justify-between items-center max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-8">
          <button 
            onClick={() => window.location.hash = '#/'}
            className="p-4 bg-white/5 hover:bg-white/10 rounded-[2rem] text-slate-400 transition-all border border-white/5 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="space-y-1">
            <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
              Command <span className="text-rose-500">Deck</span>
            </h1>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Node: Administrator ({adminUser?.email})</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.hash = '#/';
          }}
          className="flex items-center gap-3 px-10 py-5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-full font-black text-[10px] uppercase tracking-widest border border-rose-500/20 transition-all shadow-2xl active:scale-95"
        >
          <LogOut size={16} /> Disconnect Terminal
        </button>
      </header>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left Stats Column */}
        <div className="space-y-8">
          {[
            { icon: Users, label: 'Subject Registry', val: systemStats.users, color: 'text-rose-400' },
            { icon: Database, label: 'Biometric Flow', val: systemStats.records, color: 'text-indigo-400' },
            { icon: MessageSquare, label: 'Feedback Loop', val: systemStats.feedback, color: 'text-emerald-400' }
          ].map((stat, i) => (
            <GlassCard key={i} className="p-8 rounded-[3.5rem] border-white/5 flex flex-col items-center text-center gap-3" hoverScale={true}>
              <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black italic text-white tracking-tight">{stat.val}</p>
              </div>
            </GlassCard>
          ))}
        </div>

        {/* Center Telemetry Visualization */}
        <GlassCard className="p-12 md:col-span-2 rounded-[5rem] border-white/5 bg-white/[0.01]" intensity={1.1}>
           <div className="flex items-center justify-between mb-12">
             <div className="flex items-center gap-4 text-white">
               <Activity size={24} className="text-rose-500" />
               <h2 className="text-xl font-black italic uppercase tracking-tight">System Telemetry</h2>
             </div>
             <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
               <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Encryption Stable</span>
             </div>
           </div>
           
           <div className="h-64 flex items-end gap-3 pb-6 border-b border-white/5">
             {[40, 65, 30, 85, 45, 90, 70, 50, 80, 60, 95, 35, 75, 45, 85, 60, 40].map((h, i) => (
               <m.div 
                 key={i} 
                 initial={{ height: 0 }}
                 animate={{ height: `${h}%` }}
                 transition={{ delay: i * 0.05, duration: 1.5, type: 'spring' }}
                 className="flex-1 bg-gradient-to-t from-rose-500/10 to-rose-500/40 border-t border-rose-500/50 rounded-t-lg" 
               />
             ))}
           </div>
           
           <div className="grid grid-cols-3 gap-8 pt-10">
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Entropy</p>
                <p className="text-sm font-bold text-white italic">0.024 RMS</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active Threads</p>
                <p className="text-sm font-bold text-white italic">14 / 256</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Uptime</p>
                <p className="text-sm font-bold text-white italic">99.982%</p>
              </div>
           </div>
        </GlassCard>

        {/* Right Status Panel */}
        <div className="space-y-8">
          <GlassCard className="p-10 space-y-8 border-rose-500/20 bg-rose-500/[0.02] rounded-[4.5rem]">
            <div className="flex items-center gap-4 text-white">
               <Terminal size={22} className="text-rose-500" />
               <h2 className="text-lg font-black italic uppercase tracking-tight">Access Log</h2>
            </div>
            <div className="space-y-5 font-mono text-[10px] leading-relaxed">
              <p className="text-slate-500 italic">[OK] NEURAL_SYNC_ESTABLISHED</p>
              <p className="text-rose-500/80 font-bold">[!] ROOT_OVERRIDE_ACTIVE</p>
              <p className="text-slate-500 italic">[OK] CLEARANCE_VERIFIED_LVL0</p>
              <p className="text-emerald-500/80 font-bold">[OK] NO_PASS_AUTH_SUCCESS</p>
            </div>
          </GlassCard>

          <GlassCard className="p-10 space-y-6 bg-indigo-500/[0.03] border-indigo-500/20 rounded-[4rem]">
             <div className="flex items-center gap-4 text-white">
               <Cpu size={22} className="text-indigo-400" />
               <h2 className="text-lg font-black italic uppercase tracking-tight">Core Engine</h2>
             </div>
             <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                <m.div 
                  animate={{ x: [-100, 400] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="w-1/3 h-full bg-indigo-500/50 blur-sm"
                />
             </div>
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center italic">Synapsing Bio-Data Clusters</p>
          </GlassCard>
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="max-w-3xl mx-auto pt-10">
         <div className="p-12 bg-rose-500/5 border border-rose-500/20 rounded-[5rem] text-center space-y-6 relative overflow-hidden group">
            <m.div 
              animate={{ opacity: [0.05, 0.1, 0.05] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 bg-rose-500/20 blur-[80px]"
            />
            <ShieldAlert size={40} className="text-rose-500 mx-auto" />
            <div className="space-y-3 relative z-10">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.6em]">Restricted Data Environment</h3>
              <p className="text-[11px] text-slate-500 leading-relaxed italic max-w-md mx-auto">
                "Identity verification is decoupled from credential storage. Access is strictly granted via real-time database role auditing."
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}