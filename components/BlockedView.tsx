import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Lock, Mail, ExternalLink, AlertTriangle } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';

export const BlockedView: React.FC = () => {
  const referenceId = `SEC-${new Date().getTime().toString(36).toUpperCase()}`;

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans flex items-center justify-center p-6 relative overflow-hidden grainy-bg">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-rose-600/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <GlassCard className="w-full max-w-2xl p-0 overflow-hidden border-rose-500/20 shadow-[0_0_50px_-10px_rgba(225,29,72,0.3)]">
        {/* Header */}
        <div className="bg-rose-950/30 border-b border-rose-500/20 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-rose-500" size={24} />
            <span className="text-rose-500 font-mono text-xs font-bold uppercase tracking-widest">Security Protocol Activated</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-rose-500/70 font-mono text-xs uppercase">Access Terminated</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 md:p-14 text-center">
          <div className="mb-8 relative inline-block">
            <div className="absolute inset-0 bg-rose-500/20 blur-xl rounded-full" />
            <Lock size={64} className="text-rose-500 relative z-10" />
          </div>

          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-6 leading-tight">
            Account <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">Restricted</span>
          </h1>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6 mb-8 text-left">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="text-rose-400 shrink-0 mt-0.5" size={18} />
              <div>
                <h3 className="text-rose-200 font-bold text-sm uppercase tracking-wider mb-1">Violation Detected</h3>
                <p className="text-rose-200/70 text-sm leading-relaxed">
                  Your account has been flagged by our automated security systems for violating the SomnoAI Digital Sleep Lab terms of service. This action is irreversible via the automated interface.
                </p>
              </div>
            </div>
            <div className="h-px w-full bg-rose-500/10 my-4" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-rose-500/50 uppercase tracking-widest font-bold mb-1">Reference ID</p>
                <p className="font-mono text-rose-300 text-xs">{referenceId}</p>
              </div>
              <div>
                <p className="text-[10px] text-rose-500/50 uppercase tracking-widest font-bold mb-1">Timestamp</p>
                <p className="font-mono text-rose-300 text-xs">{new Date().toISOString()}</p>
              </div>
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-8 max-w-md mx-auto">
            If you believe this is an error, please contact our administrative core immediately. Include your Reference ID in the subject line.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`mailto:admin@sleepsomno.com?subject=Appeal Request [${referenceId}]`}
              className="px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_-5px_rgba(225,29,72,0.5)] flex items-center gap-2 group"
            >
              <Mail size={16} />
              <span>Contact Support</span>
              <ExternalLink size={14} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="/"
              className="px-8 py-4 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all border border-white/5"
            >
              Return to Home
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-black/40 border-t border-white/5 p-4 text-center">
          <div className="flex items-center justify-center gap-2 opacity-50 mb-2">
            <Logo className="w-4 h-4" />
            <span className="text-[10px] font-mono uppercase tracking-widest">SomnoAI Security Core</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">
            System ID: {import.meta.env.VITE_SUPABASE_URL ? 'ONLINE' : 'OFFLINE'} • Node: {window.location.hostname}
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
