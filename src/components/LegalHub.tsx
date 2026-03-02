import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, FileText, Lock, AlertTriangle, Scale, Cookie, Database, Activity, Ban } from 'lucide-react';
import { motion } from 'framer-motion';
import { LEGAL_CONTENT } from '../data/legalContent.ts';
import { Language } from '../types.ts';

interface LegalHubProps {
  lang: Language;
  onBack: () => void;
}

export const LegalHub: React.FC<LegalHubProps> = ({ lang, onBack }) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();

  // Map types to content keys if necessary, or use directly
  const contentKey = type as keyof typeof LEGAL_CONTENT;
  const content = LEGAL_CONTENT[contentKey];

  useEffect(() => {
    if (!content) {
      // Redirect to legal overview or 404 if type is invalid
      navigate('/legal/terms'); 
    }
  }, [content, navigate]);

  if (!content) return null;

  const getIcon = () => {
    switch (type) {
      case 'security': return <Lock className="w-6 h-6 text-emerald-400" />;
      case 'privacy': return <Shield className="w-6 h-6 text-indigo-400" />;
      case 'terms': return <Scale className="w-6 h-6 text-slate-400" />;
      case 'acceptable-use': return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'ai-disclaimer': return <Activity className="w-6 h-6 text-purple-400" />;
      case 'medical-disclaimer': return <Activity className="w-6 h-6 text-rose-400" />;
      case 'data-processing': return <Database className="w-6 h-6 text-blue-400" />;
      case 'cookies': return <Cookie className="w-6 h-6 text-orange-400" />;
      case 'report-abuse': return <AlertTriangle className="w-6 h-6 text-red-400" />;
      case 'blocked': return <Ban className="w-6 h-6 text-red-500" />;
      default: return <FileText className="w-6 h-6 text-slate-400" />;
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
            Legal Center
          </span>
          <div className="w-8" /> {/* Spacer for alignment */}
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
                Last Updated: {content.lastUpdated}
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
            <a href="/legal/security" className="hover:text-indigo-400 transition-colors">Security</a>
          </div>
        </div>
      </main>
    </div>
  );
};
