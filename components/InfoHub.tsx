import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Target, Layers, Sparkles, Binary, Smartphone, Mail, Github, MessageSquare, Linkedin, Youtube, ShieldCheck, Activity, UserCheck, AlertCircle, Zap, Moon, Watch, Smartphone as SmartphoneIcon, Cloud, ArrowRight } from 'lucide-react';
import { Language } from '../types';
import { INFO_CONTENT } from '../data/infoContent';
import { updateMetadata } from '../services/navigation';
import { GlassCard } from './GlassCard';
import { Logo } from './Logo';

interface InfoHubProps {
  lang: Language;
  onBack: () => void;
}

export const InfoHub: React.FC<InfoHubProps> = ({ lang, onBack }) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const content = INFO_CONTENT[type as keyof typeof INFO_CONTENT];

  useEffect(() => {
    if (content) {
      updateMetadata(`${content.title} - SomnoAI Digital Sleep Lab`, content.content.substring(0, 150), `/${type}`);
    }
  }, [type, content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-black italic mb-4">404 - Page Not Found</h1>
        <button onClick={onBack} className="px-8 py-3 bg-indigo-600 rounded-full font-bold">Return</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-30" />
      
      <header className="flex flex-col items-center text-center gap-8 mb-16 px-4 max-w-4xl mx-auto pt-20 relative z-10">
        <div className="absolute top-0 left-4">
          <button 
            onClick={onBack}
            className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
        <div className="absolute top-0 right-4">
          <Logo />
        </div>
        <div className="flex items-center justify-center gap-4 mt-8">
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase leading-none">
            {content.title}
          </h1>
        </div>
        <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">
          SomnoAI Digital Sleep Lab • Documentation
        </p>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-slate-900/40" intensity={1.2}>
          <div className="space-y-8 text-slate-300 text-lg leading-relaxed italic font-medium whitespace-pre-wrap">
            {content.content}
          </div>
        </GlassCard>

        {type === 'contact' && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
             <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-black/20">
                <h4 className="text-lg font-black text-white italic uppercase tracking-tight mb-6">Official Links</h4>
                <div className="grid grid-cols-2 gap-4">
                   <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase italic tracking-tight">
                      <Github size={14} /> GitHub
                   </a>
                   <a href="https://discord.com/invite/9EXJtRmju" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase italic tracking-tight">
                      <MessageSquare size={14} /> Discord
                   </a>
                   <a href="https://www.linkedin.com/company/somnoai-digital-sleep-lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase italic tracking-tight">
                      <Linkedin size={14} /> LinkedIn
                   </a>
                   <a href="https://www.youtube.com/channel/UCu0V4CzeSIdagRVrHL116Og" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase italic tracking-tight">
                      <Youtube size={14} /> YouTube
                   </a>
                </div>
             </GlassCard>
             <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-black/20 flex flex-col justify-center items-center gap-4">
                <Mail size={32} className="text-indigo-400" />
                <p className="text-sm font-bold uppercase tracking-widest text-slate-400">support@sleepsomno.com</p>
             </GlassCard>
          </div>
        )}

        <footer className="pt-20 text-center space-y-12">
           <div className="flex flex-col items-center gap-4 opacity-20">
              <ShieldCheck size={24} className="text-indigo-500" />
              <p className="text-[9px] font-mono tracking-[0.6em] uppercase">@2026 SomnoAI Digital Sleep Lab • PHILOSOPHY_NODE_V4.2</p>
           </div>
           <button onClick={onBack} className="px-16 py-6 bg-slate-900 border border-white/5 text-slate-500 rounded-full font-black text-xs uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 transition-all hover:bg-slate-800">Return to Terminal</button>
        </footer>
      </div>
    </div>
  );
};
