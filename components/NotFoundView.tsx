
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, RefreshCw, ShieldX, Radio, Terminal, Search, Cpu } from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { safeNavigateHash, safeReload, getSafeHash } from '../services/navigation.ts';
import { trackPageView } from '../services/analytics.ts';

const m = motion as any;

const NeuralStatic = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.05]">
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
    <div className="h-full w-full bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] [background-size:20px_20px]" />
  </div>
);

export const NotFoundView: React.FC = () => {
  const [probeIndex, setProbeIndex] = useState(0);

  useEffect(() => {
    trackPageView('/404', '404: Node Unreachable');
    const timer = setInterval(() => {
      setProbeIndex(prev => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center max-w-5xl mx-auto font-sans relative overflow-hidden bg-[#010409]">
      <NeuralStatic />
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140vw] h-[140vw] bg-indigo-900/5 blur-[200px] rounded-full animate-pulse" />

      <m.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl space-y-12 relative z-10"
      >
        <div className="relative inline-block mb-4">
          <Logo size={120} animated={true} className="mx-auto grayscale opacity-40 relative z-10" />
          <m.div 
            animate={{ rotate: [0, -360], scale: [1, 1.1, 1] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-12 border border-dashed border-indigo-500/10 rounded-full" 
          />
        </div>

        <GlassCard className="p-12 md:p-20 rounded-[5rem] border-white/5 bg-black/40 backdrop-blur-3xl shadow-[0_120px_200px_-50px_rgba(0,0,0,1)] overflow-hidden relative" intensity={2}>
          {/* Glitch Decorative Element */}
          <div className="absolute top-0 right-0 p-12 opacity-[0.02] pointer-events-none text-white transform rotate-45">
             <Terminal size={300} strokeWidth={0.5} />
          </div>

          <div className="space-y-14 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-4 mb-4">
                 <div className="h-px w-10 bg-indigo-500/20" />
                 <Radio size={14} className="text-indigo-500 animate-pulse" />
                 <div className="h-px w-10 bg-indigo-500/20" />
              </div>
              
              <h1 className="text-[120px] md:text-[160px] font-black italic tracking-tighter leading-none text-white select-none relative">
                4<span className="text-indigo-600">0</span>4
                <m.div 
                  animate={{ x: [-2, 2, -2], opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 0.1, repeat: Infinity }}
                  className="absolute inset-0 text-rose-500 opacity-20 -z-10 translate-x-1"
                >404</m.div>
              </h1>
              
              <div className="space-y-2">
                <p className="text-indigo-400 font-black uppercase tracking-[0.8em] text-[10px] italic">Sector Unreachable</p>
                <p className="text-slate-700 font-mono text-[8px] uppercase tracking-widest mt-4">Protocol: HANDSHAKE_VOID_ERR_0XFF</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
               {[
                 { icon: Search, label: 'Scanning Grid', active: probeIndex >= 0 },
                 { icon: Cpu, label: 'Neural Mapping', active: probeIndex >= 1 },
                 { icon: ShieldX, label: 'Link Severed', active: probeIndex >= 2 }
               ].map((step, i) => (
                 <div key={i} className={`p-6 bg-white/[0.02] border rounded-3xl transition-all duration-700 flex flex-col items-center gap-3 ${step.active ? 'border-indigo-500/30 opacity-100 shadow-[0_0_20px_rgba(99,102,241,0.1)]' : 'border-white/5 opacity-20'}`}>
                    <step.icon size={18} className={step.active && probeIndex === i ? 'text-indigo-400 animate-pulse' : 'text-slate-600'} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{step.label}</span>
                 </div>
               ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-5 pt-8 max-w-sm mx-auto">
              <button 
                onClick={() => safeNavigateHash('dashboard')}
                className="group flex-1 py-7 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
              >
                <Home size={18} /> Restore Hub
              </button>
              <button 
                onClick={() => safeReload()}
                className="flex-1 py-7 bg-slate-900 border border-white/5 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-3 active:scale-95 italic"
              >
                <RefreshCw size={18} /> Re-Sync Node
              </button>
            </div>
          </div>
        </GlassCard>

        <div className="mt-16 opacity-20 flex items-center justify-center gap-4">
           <Terminal size={14} className="text-slate-600" />
           <span className="text-[8px] font-mono font-black uppercase tracking-[0.6em] text-slate-700 italic">Sector Identifier: {getSafeHash() || 'ROOT_ACCESS'}</span>
        </div>
      </m.div>
    </div>
  );
};
