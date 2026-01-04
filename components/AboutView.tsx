
import React from 'react';
import { ArrowLeft, BrainCircuit, Rocket, Target, Cpu, FlaskConical, ShieldCheck, Binary } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack }) => {
  const t = translations[lang].about;
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex items-center gap-4 mb-10 px-2">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white">
            {t.title}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            Neural Laboratory Documentation
          </p>
        </div>
      </header>

      <div className="space-y-8">
        <GlassCard className="p-8 space-y-6 border-indigo-500/30 bg-indigo-500/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
              <Target size={24} />
            </div>
            <h2 className="text-xl font-bold italic text-white">{t.mission}</h2>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {t.missionText}
          </p>
        </GlassCard>

        <GlassCard className="p-8 space-y-6 border-emerald-500/20 bg-emerald-500/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400">
              <BrainCircuit size={24} />
            </div>
            <h2 className="text-xl font-bold italic text-white">{t.tech}</h2>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {t.techText}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="flex items-center gap-2">
              <Cpu size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Gemini 3 Pro</span>
            </div>
            <div className="flex items-center gap-2">
              <Binary size={14} className="text-emerald-400" />
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Edge Logic</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-8 space-y-6 border-amber-500/20 bg-amber-500/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-400">
              <Rocket size={24} />
            </div>
            <h2 className="text-xl font-bold italic text-white">{t.vision}</h2>
          </div>
          <p className="text-slate-300 leading-relaxed font-medium">
            {t.visionText}
          </p>
        </GlassCard>

        <footer className="pt-12 flex flex-col items-center gap-6 opacity-40">
           <div className="flex items-center gap-3">
             <FlaskConical size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase">Research Prototype v3.4</span>
           </div>
           <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2rem] text-center max-w-sm">
             <p className="text-[10px] text-slate-500 font-medium italic">
               "In the intersection of binary and biology, we find the truth of rest."
             </p>
           </div>
        </footer>
      </div>
    </div>
  );
};
