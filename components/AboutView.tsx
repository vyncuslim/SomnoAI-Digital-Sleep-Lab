
import React from 'react';
import { 
  ArrowLeft, BrainCircuit, Globe, UserCheck, Moon, Lock, Mail, Github, LogIn, UserPlus, Microscope, HelpCircle, Zap
} from 'lucide-react';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack, onNavigate }) => {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      {/* Top Header Controls */}
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-12 md:mb-20 sticky top-4 z-[100]">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>

        {!profile && (
          <div className="flex gap-3 bg-slate-950/80 backdrop-blur-3xl p-2 rounded-full border border-white/5 shadow-2xl">
             <button 
               onClick={() => onNavigate('login')}
               className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
             >
                <LogIn size={14} /> LOGIN
             </button>
             <button 
               onClick={() => onNavigate('signup')}
               className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 active:scale-95 transition-all"
             >
                <UserPlus size={14} /> JOIN LAB
             </button>
          </div>
        )}
      </div>

      <header className="flex flex-col items-center text-center gap-6 mb-16 px-2 max-w-4xl mx-auto">
        <Logo size={120} animated={true} />
        <div>
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white uppercase leading-none">
            About <span className="text-indigo-400">SomnoAI Lab</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-4">
            SomnoAI Digital Sleep Lab • Neural Infrastructure v2.8
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 px-2">
        <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Globe size={24} /></div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Project Overview</h2>
          </div>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed italic">
            <p><b>SomnoAI Digital Sleep Lab</b> is an AI-powered digital health platform focused on advanced sleep architecture analysis and personalized optimization.</p>
            <p>Unlike traditional hardware-dependent trackers, we offer a pure software solution: collect biometric data from any wearable, smart mattress, phone sensors or manual input — then use sophisticated AI models to deliver meaningful insights.</p>
          </div>

          {!profile && (
            <div className="mt-12 pt-12 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
               <button 
                 onClick={() => onNavigate('login')}
                 className="flex items-center justify-center gap-4 py-8 bg-white/5 border border-white/10 rounded-[2.5rem] font-black text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-all italic active:scale-95"
               >
                 <LogIn size={20} className="text-indigo-400" /> Access Terminal
               </button>
               <button 
                 onClick={() => onNavigate('signup')}
                 className="flex items-center justify-center gap-4 py-8 bg-indigo-600 text-white rounded-[2.5rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all italic active:scale-95 shadow-xl shadow-indigo-600/20"
               >
                 <Zap size={20} fill="currentColor" /> Join Registry
               </button>
            </div>
          )}
        </GlassCard>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GlassCard 
             onClick={() => onNavigate('science')}
             className="p-10 rounded-[3.5rem] border-indigo-500/20 bg-indigo-500/[0.02] cursor-pointer group hover:bg-indigo-600/[0.05] transition-all"
           >
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit mb-6"><Microscope size={28} /></div>
              <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">Scientific Protocol</h3>
              <p className="text-slate-500 text-xs italic leading-relaxed">Deep dive into how our neural engine processes biometric telemetry and sleep staging.</p>
           </GlassCard>

           <GlassCard 
             onClick={() => onNavigate('faq')}
             className="p-10 rounded-[3.5rem] border-white/5 bg-white/[0.01] cursor-pointer group hover:bg-white/[0.03] transition-all"
           >
              <div className="p-3 bg-white/5 rounded-2xl text-slate-400 w-fit mb-6"><HelpCircle size={28} /></div>
              <h3 className="text-xl font-black italic text-white uppercase tracking-tight mb-4">Laboratory FAQ</h3>
              <p className="text-slate-500 text-xs italic leading-relaxed">Resolving common doubts regarding hardware compatibility, privacy, and AI precision.</p>
           </GlassCard>
        </div>

        <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-slate-500/10 rounded-2xl text-slate-400"><UserCheck size={24} /></div>
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Lead Developer</h2>
          </div>
          <div className="space-y-6 text-slate-300 text-lg leading-relaxed italic">
            <p>Built independently by <b>Vyncuslim</b> (Penang, Malaysia). A build-in-public project with strong focus on data sovereignty and neural recovery.</p>
            <div className="flex flex-wrap gap-6 mt-10">
              <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" className="inline-flex items-center px-8 py-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 font-black text-[10px] uppercase tracking-widest italic"><Github size={16} className="mr-2" /> Source</a>
              <a href="mailto:ongyuze1401@gmail.com" className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all italic shadow-xl"><Mail size={16} className="mr-2" /> Contact</a>
            </div>
          </div>
        </GlassCard>

        <footer className="pt-12 text-center opacity-30">
           <p className="text-[9px] font-mono tracking-widest uppercase mb-8">SomnoAI Digital Sleep Lab • Secure Infrastructure v2.8</p>
           <button onClick={onBack} className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest italic shadow-2xl active:scale-95 transition-all">Back to Console</button>
        </footer>
      </div>
    </div>
  );
};
