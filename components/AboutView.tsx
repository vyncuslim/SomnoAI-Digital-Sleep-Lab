
import React from 'react';
import { 
  ArrowLeft, BrainCircuit, ShieldCheck, Activity, 
  Terminal, Zap, BookOpen, Database, Smartphone, 
  ChevronRight, Sparkles, Binary, Cpu, Info
} from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { Language, translations } from '../services/i18n.ts';
// Fix: Import missing Logo component
import { Logo } from './Logo.tsx';

const m = motion as any;

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  const t = translations[lang].about;

  const sections = [
    { id: 'intro', icon: BrainCircuit, color: 'text-indigo-400' },
    { id: 'monitoring', icon: Activity, color: 'text-emerald-400' },
    { id: 'aiInsights', icon: Binary, color: 'text-purple-400' },
    { id: 'privacy', icon: ShieldCheck, color: 'text-rose-400' },
    { id: 'guide', icon: Terminal, color: 'text-amber-400' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans p-6 md:p-12 pb-40">
      <header className="max-w-4xl mx-auto flex items-center gap-8 mb-16 px-4">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-white uppercase leading-none">
            Lab <span className="text-indigo-400">Knowledge Base</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">Systematic Laboratory Manual v3.1</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto space-y-12">
        {/* Main Manifesto */}
        <GlassCard className="p-10 md:p-16 rounded-[4rem] border-indigo-500/20 bg-indigo-500/[0.02] relative overflow-hidden" intensity={1.2}>
          <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
            <Cpu size={240} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 text-indigo-400">
               <Sparkles size={24} />
               <span className="text-[11px] font-black uppercase tracking-[0.3em]">Laboratory Manifesto</span>
            </div>
            <p className="text-2xl md:text-3xl font-black italic text-white leading-tight tracking-tight">
              "{t.manifesto}"
            </p>
            <div className="flex items-center gap-6 pt-6">
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Core Status</span>
                  <span className="text-[11px] font-bold text-emerald-500 uppercase">Operational</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Neural Link</span>
                  <span className="text-[11px] font-bold text-indigo-500 uppercase">Encrypted</span>
               </div>
            </div>
          </div>
        </GlassCard>

        {/* Detailed Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((sec, idx) => {
            const content = (t.sections as any)[sec.id];
            return (
              <m.div
                key={sec.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <GlassCard className="p-10 h-full rounded-[3.5rem] border-white/5 hover:bg-white/[0.03] transition-all group">
                  <div className="space-y-6">
                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 transition-all group-hover:scale-110 ${sec.color}`}>
                      <sec.icon size={28} />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-lg font-black italic text-white uppercase tracking-tight">{content.title}</h3>
                      <p className="text-[13px] text-slate-400 leading-relaxed font-medium italic whitespace-pre-wrap">
                        {content.content}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </m.div>
            );
          })}
        </div>

        {/* Tactical Requirements */}
        <div className="bg-slate-900/40 rounded-[4rem] border border-white/5 p-12 flex flex-col md:flex-row items-center gap-10">
           <div className="w-24 h-24 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shrink-0">
             <Smartphone size={40} />
           </div>
           <div className="space-y-4">
              <h4 className="text-xl font-black italic text-white uppercase tracking-tight">Bridge Infrastructure</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-medium italic">
                SomnoAI utilizes the Android Health Connect SDK as its primary biometric bridge. Ensure all permissions are granted within the system registry to enable seamless telemetric flow.
              </p>
              <div className="flex gap-4 pt-2">
                 <button className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white transition-all">
                    View SDK Docs <ChevronRight size={12} />
                 </button>
              </div>
           </div>
        </div>

        {/* Technical Footer */}
        <footer className="pt-20 border-t border-white/5 flex flex-col items-center gap-6 opacity-40 text-center">
           {/* Fix: Corrected component call from the imported Logo component */}
           <Logo size={48} animated={false} />
           <div className="space-y-2">
              <p className="text-[9px] font-mono tracking-widest uppercase font-black">SomnoAI Digital Sleep Lab • Neural Core Engine</p>
              <p className="text-[9px] font-medium text-slate-600 italic max-w-sm leading-relaxed">
                All algorithms developed under Clinical Recovery Optimization (CRO) frameworks. Digital Sovereignty is maintained through edge execution.
              </p>
           </div>
        </footer>
      </main>
    </div>
  );
};
