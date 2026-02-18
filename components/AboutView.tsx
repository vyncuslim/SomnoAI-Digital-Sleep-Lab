import React from 'react';
import { 
  ArrowLeft, BrainCircuit, Globe, UserCheck, Moon, Lock, Mail, Github, LogIn, UserPlus, Microscope, HelpCircle, Zap, Linkedin, ShieldCheck, Sparkles, Target, Layers
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { motion } from 'framer-motion';

const m = motion as any;

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack, onNavigate }) => {
  const isZh = lang === 'zh';
  const t = translations[lang].about;

  const mailNodes = [
    { label: 'Dispatch', email: 'contact@sleepsomno.com' },
    { label: 'Archive', email: 'info@sleepsomno.com' },
    { label: 'Support', email: 'support@sleepsomno.com' },
    { label: 'Admin', email: 'admin@sleepsomno.com' }
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="flex flex-col items-center text-center gap-8 mb-16 px-4 max-w-4xl mx-auto pt-20">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
          <Logo size={140} animated={true} className="relative z-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            About <span className="text-indigo-400">SomnoAI</span>
          </h1>
          <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">
            SomnoAI Digital Sleep Lab • INFRASTRUCTURE v2.8.1
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-16 px-4">
        {/* Core Vision Section - The specific phrase implementation */}
        <section className="relative">
           <m.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="absolute -inset-10 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
           <GlassCard className="p-12 md:p-20 rounded-[5rem] border-indigo-500/20 bg-indigo-600/[0.02] overflow-hidden" intensity={1.5}>
              <div className="space-y-10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl"><Target size={24} /></div>
                    <h2 className="text-xl font-black italic text-indigo-400 uppercase tracking-widest">{t.visionTitle}</h2>
                 </div>
                 <p className="text-3xl md:text-5xl font-black text-white leading-[1.1] italic tracking-tighter uppercase">
                   {t.visionStatement}
                 </p>
                 <div className="flex items-center gap-6 pt-6 border-t border-white/5 opacity-40">
                    <div className="flex items-center gap-2">
                       <ShieldCheck size={14} className="text-emerald-500" />
                       <span className="text-[9px] font-black uppercase tracking-widest">Protocol Verified</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <Sparkles size={14} className="text-indigo-400" />
                       <span className="text-[9px] font-black uppercase tracking-widest">AI Synthesized</span>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </section>

        <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-slate-900/40" intensity={1.2}>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-inner"><Globe size={28} /></div>
            <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">{t.missionLabel}</h2>
          </div>
          <div className="space-y-8 text-slate-300 text-lg md:text-xl leading-relaxed italic font-bold">
            <p className="border-l-4 border-indigo-500/30 pl-8">
              {isZh 
                ? "SomnoAI 的架构逻辑深受“量化自我”运动启发。我们相信，通过将不可见的生物信号（如 HRV 和心率流）可视化，人类可以掌握重置自身恢复周期的主动权。" 
                : "Deeply inspired by the 'Quantified Self' movement, SomnoAI visualizes the invisible. By charting biometric signals like HRV, we empower subjects to reclaim sovereignty over their restoration cycles."}
            </p>
            <p className="text-base text-slate-500 font-medium leading-relaxed">
              {isZh 
                ? "核心由 Google Gemini AI 驱动，我们的引擎能够解构复杂的生物遥测流，将其转化为可操作的神经恢复协议。这不仅仅是监控，而是工程级别的精准修复。" 
                : "Powered by Google Gemini AI, our engine decodes complex biometric telemetry into actionable neurological restoration protocols. This is not mere tracking; it is precision-engineered recovery."}
            </p>
          </div>
        </GlassCard>

        {/* Contact Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
           {mailNodes.map((node) => (
             <GlassCard key={node.label} className="p-8 rounded-[2.5rem] border-white/5 bg-black/40 text-center space-y-2 hover:border-indigo-500/30 transition-all">
                <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">{node.label} Node</p>
                <a href={`mailto:${node.email}`} className="text-[11px] font-black text-white italic hover:text-indigo-400 transition-colors break-all leading-tight">{node.email}</a>
             </GlassCard>
           ))}
        </div>

        <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-black/40">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-900 rounded-2xl text-slate-600 shadow-inner"><UserCheck size={24} /></div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Lead Developer</h2>
          </div>
          <div className="space-y-10 text-slate-400 text-lg leading-relaxed italic font-bold">
            <p>Built independently by <b>Vyncuslim</b>. A build-in-public project with strong focus on data sovereignty and neural recovery optimization.</p>
            
            <div className="flex flex-wrap gap-4">
              <a href="https://github.com/vyncuslim/SomnoAI-Frontend" target="_blank" className="flex items-center px-8 py-5 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 font-black text-[10px] uppercase tracking-widest italic shadow-xl"><Github size={18} className="mr-3" /> GitHub Node</a>
              <button onClick={() => onNavigate('contact')} className="flex items-center px-8 py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic shadow-2xl hover:bg-indigo-500"><Mail size={18} className="mr-3" /> Contact Module</button>
            </div>
          </div>
        </GlassCard>

        <footer className="pt-20 text-center space-y-12">
           <div className="flex flex-col items-center gap-4 opacity-20">
              <ShieldCheck size={24} className="text-indigo-500" />
              <p className="text-[9px] font-mono tracking-[0.6em] uppercase">@2026 SomnoAI Digital Sleep Lab • SECURE_NODE_BETA</p>
           </div>
           <button onClick={onBack} className="px-16 py-6 bg-slate-900 border border-white/5 text-slate-500 rounded-full font-black text-xs uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 transition-all hover:bg-slate-800">Return to Terminal</button>
        </footer>
      </div>
    </div>
  );
};