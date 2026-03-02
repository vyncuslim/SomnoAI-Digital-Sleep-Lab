import React from 'react';
import { ChevronLeft, LifeBuoy, Mail, MessageSquare, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language } from '../types.ts';

interface SupportViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const SupportView: React.FC<SupportViewProps> = ({ lang, onBack, onNavigate }) => {
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
            Support Center
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
              <LifeBuoy className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                Support Center
              </h1>
              <p className="text-sm text-slate-500 font-mono uppercase tracking-wider">
                We're here to help
              </p>
            </div>
          </div>

          <div className="prose prose-invert prose-lg max-w-none mb-12">
            <p className="text-slate-300 leading-relaxed">
              If you encounter issues using the platform, please contact support. Provide relevant details to help us investigate and resolve the problem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => onNavigate('contact')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left group"
            >
              <Mail className="w-8 h-8 text-indigo-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Contact Support</h3>
              <p className="text-sm text-slate-400">Email our team directly for assistance.</p>
            </button>

            <button 
              onClick={() => onNavigate('faq')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left group"
            >
              <MessageSquare className="w-8 h-8 text-emerald-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">FAQ</h3>
              <p className="text-sm text-slate-400">Find answers to common questions.</p>
            </button>

            <button 
              onClick={() => onNavigate('legal/terms')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left group"
            >
              <FileText className="w-8 h-8 text-amber-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Terms of Service</h3>
              <p className="text-sm text-slate-400">Review our terms and conditions.</p>
            </button>

            <button 
              onClick={() => onNavigate('report-abuse')}
              className="p-6 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-left group"
            >
              <LifeBuoy className="w-8 h-8 text-rose-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold text-white mb-2">Report Abuse</h3>
              <p className="text-sm text-slate-400">Report policy violations or safety concerns.</p>
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
