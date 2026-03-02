import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Cpu, Activity, Zap, Microscope, Phone, HelpCircle, AlertTriangle, Radio } from 'lucide-react';
import { motion } from 'framer-motion';
import { INFO_CONTENT } from '../data/infoContent.ts';
import { Language } from '../types.ts';

interface InfoHubProps {
  lang: Language;
  onBack: () => void;
  type: keyof typeof INFO_CONTENT;
}

export const InfoHub: React.FC<InfoHubProps> = ({ lang, onBack, type }) => {
  const navigate = useNavigate();
  const content = INFO_CONTENT[type];

  if (!content) {
    return (
      <div className="min-h-screen bg-[#01040a] flex items-center justify-center text-white">
        Content not found
      </div>
    );
  }

  const getIcon = () => {
    switch (type) {
      case 'about': return <Info className="w-6 h-6 text-indigo-400" />;
      case 'product': return <Cpu className="w-6 h-6 text-emerald-400" />;
      case 'how-it-works': return <Activity className="w-6 h-6 text-blue-400" />;
      case 'features': return <Zap className="w-6 h-6 text-amber-400" />;
      case 'research': return <Microscope className="w-6 h-6 text-purple-400" />;
      case 'contact': return <Phone className="w-6 h-6 text-rose-400" />;
      case 'faq': return <HelpCircle className="w-6 h-6 text-cyan-400" />;
      case 'status': return <Radio className="w-6 h-6 text-green-400" />;
      case 'report-abuse': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      default: return <Info className="w-6 h-6 text-slate-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-300 font-sans selection:bg-indigo-500/30">
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#01040a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="p-2 -ml-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            Information Center
          </span>
          <div className="w-8" />
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              {getIcon()}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                {content.title}
              </h1>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                {content.subtitle}
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-slate-300 leading-relaxed">
              {content.content}
            </div>
          </div>
        </motion.div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} SomnoAI Digital Sleep Lab. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="/legal/terms" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a>
          </div>
        </div>
      </main>
    </div>
  );
};
