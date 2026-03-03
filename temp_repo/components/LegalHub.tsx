import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Mail, ShieldCheck, FileText, Lock, ShieldAlert, Activity, AlertTriangle, Zap, ExternalLink } from 'lucide-react';
import { Language } from '../types';
import { LEGAL_CONTENT } from '../data/legalContent';
import { updateMetadata } from '../services/navigation';

interface LegalHubProps {
  lang: Language;
  onBack: () => void;
}

export const LegalHub: React.FC<LegalHubProps> = ({ lang, onBack }) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const content = LEGAL_CONTENT[type as keyof typeof LEGAL_CONTENT];

  useEffect(() => {
    if (content) {
      updateMetadata(`${content.title} - SomnoAI Digital Sleep Lab`, content.content.substring(0, 150), `/legal/${type}`);
    }
  }, [type, content]);

  if (!content) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-8">
        <h1 className="text-4xl font-black italic mb-4">404 - Document Not Found</h1>
        <button onClick={onBack} className="px-8 py-3 bg-indigo-600 rounded-full font-bold">Return</button>
      </div>
    );
  }

  const Icon = type === 'privacy' ? ShieldCheck : 
               type === 'terms' ? FileText :
               type === 'cookies' ? Activity :
               type === 'security' ? Lock :
               type === 'acceptable-use' ? Shield :
               type === 'ai-disclaimer' ? Zap :
               type === 'medical-disclaimer' ? AlertTriangle :
               type === 'data-processing' ? ShieldAlert :
               type === 'abuse-policy' ? ShieldAlert :
               Shield;

  return (
    <div className="min-h-screen bg-black pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#1e1b4b_0%,transparent_50%)] opacity-30" />
      
      <header className="flex items-center gap-4 mb-8 px-4 max-w-4xl mx-auto pt-16 relative z-10">
        <button 
          onClick={onBack}
          className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-all active:scale-90 border border-white/5 shadow-lg"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter text-white">
            {content.title}
          </h1>
          <p className="text-[10px] text-indigo-400 font-mono font-bold uppercase tracking-[0.3em] mt-0.5">
            SomnoAI Digital Sleep Lab • Legal Document
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="backdrop-blur-3xl bg-slate-900/60 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8 leading-relaxed text-slate-300 text-[14px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none text-white">
            <Icon size={160} />
          </div>

          <div className="relative z-10 whitespace-pre-wrap">
            {content.content}
          </div>

          <footer className="pt-12 border-t border-white/5 flex flex-col items-center gap-4 opacity-40">
            <div className="flex flex-col items-center gap-2 text-indigo-400">
              <div className="flex items-center gap-2">
                <Mail size={12} />
                <span className="text-[10px] font-bold">contact@sleepsomno.com</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} />
                <span className="text-[10px] font-bold">legal@sleepsomno.com</span>
              </div>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest">© 2026 SOMNO LAB • ALL RIGHTS RESERVED</p>
          </footer>
        </div>
      </div>
    </div>
  );
};
