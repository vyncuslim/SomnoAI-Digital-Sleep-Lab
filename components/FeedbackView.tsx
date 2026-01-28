
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MessageSquare, AlertTriangle, Lightbulb, 
  Zap, Mail, Send, Loader2, CheckCircle2, XCircle, 
  Terminal, ShieldCheck, Sparkles, BrainCircuit, RotateCcw
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackApi, supabase } from '../services/supabaseService.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface FeedbackViewProps {
  lang: Language;
  onBack: () => void;
}

type FeedbackType = 'report' | 'suggestion' | 'improvement';

export const FeedbackView: React.FC<FeedbackViewProps> = ({ lang, onBack }) => {
  const [type, setType] = useState<FeedbackType>('report');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState<'idle' | 'transmitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = translations[lang].settings;

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !email.trim() || status === 'transmitting') return;

    setStatus('transmitting');
    setErrorMessage(null);

    try {
      const { success, error } = await feedbackApi.submitFeedback(type, content, email);
      if (success) {
        setStatus('success');
      } else {
        throw error || new Error("TRANSMISSION_FAILED");
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Protocol transmission failure.");
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setContent('');
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans">
      <header className="flex items-center gap-6 mb-12 px-2">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            Feedback <span className="text-indigo-400">Hub</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">
            Registry Logging System • v2.1
          </p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <m.div 
              key="success-state"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="space-y-8"
            >
              <GlassCard className="p-16 rounded-[5rem] border-emerald-500/20 text-center space-y-8">
                <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                  <ShieldCheck size={48} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Log Committed</h2>
                  <p className="text-sm text-slate-400 italic max-w-xs mx-auto leading-relaxed">
                    Your contribution has been hashed and added to the lab registry. Our neural architects will review it shortly.
                  </p>
                </div>
                <button 
                  onClick={onBack}
                  className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-500 transition-all active:scale-95"
                >
                  Return to Base
                </button>
              </GlassCard>
            </m.div>
          ) : (
            <m.div 
              key="form-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/10" intensity={1.5}>
                <form onSubmit={handleSubmit} className="space-y-12">
                  <div className="space-y-6">
                     <label className="text-[11px] font-black uppercase text-indigo-400 px-6 tracking-widest italic flex items-center gap-2">
                       <BrainCircuit size={14} /> Select Transmission Logic
                     </label>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { id: 'report', label: t.feedbackReport, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/40' },
                          { id: 'suggestion', label: t.feedbackSuggestion, icon: Lightbulb, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/40' },
                          { id: 'improvement', label: t.feedbackImprovement, icon: Sparkles, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/40' }
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setType(item.id as FeedbackType)}
                            className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all gap-3 relative overflow-hidden group ${
                              type === item.id 
                              ? `${item.bg} ${item.border} shadow-[0_0_40px_rgba(0,0,0,0.3)]` 
                              : 'bg-slate-900/40 border-white/5 hover:border-white/10 opacity-60'
                            }`}
                          >
                            {type === item.id && (
                               <m.div layoutId="active-bg" className="absolute inset-0 bg-white/[0.02] pointer-events-none" />
                            )}
                            <item.icon className={type === item.id ? item.color : 'text-slate-600'} size={24} />
                            <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">{item.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase text-slate-500 px-6 tracking-widest italic flex items-center gap-2">
                        <Mail size={14} /> Node Identifier (Email)
                      </label>
                      <div className="relative group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
                           <Mail size={18} />
                        </div>
                        <input 
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Subject ID..."
                          className="w-full bg-[#050a1f] border border-white/5 rounded-full pl-16 pr-10 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-bold italic shadow-inner"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[11px] font-black uppercase text-slate-500 px-6 tracking-widest italic flex items-center gap-2">
                        <MessageSquare size={14} /> Intelligence Context (Comments)
                      </label>
                      <div className="relative">
                        <textarea 
                          required
                          rows={6}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          placeholder="Describe the anomaly or proposed optimization..."
                          className="w-full bg-[#050a1f] border border-white/5 rounded-[2.5rem] px-10 py-8 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-medium italic shadow-inner resize-none leading-relaxed"
                        />
                        <div className="absolute bottom-6 right-8 opacity-10">
                           <Terminal size={40} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {status === 'error' && (
                    <m.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-[2rem] flex items-center gap-4 text-rose-400">
                      <XCircle size={20} className="shrink-0" />
                      <div className="flex-1">
                        <p className="text-[11px] font-black uppercase tracking-widest">Gateway Rejection</p>
                        <p className="text-[10px] italic font-medium opacity-80">{errorMessage}</p>
                      </div>
                      <button onClick={handleReset} className="p-2 hover:bg-rose-500/10 rounded-full transition-all">
                        <RotateCcw size={16} />
                      </button>
                    </m.div>
                  )}

                  <button 
                    type="submit"
                    disabled={status === 'transmitting'}
                    className={`w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic relative overflow-hidden shadow-2xl ${
                      status === 'transmitting' ? 'bg-slate-800 text-slate-500 cursor-wait' :
                      'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-[0.98]'
                    }`}
                  >
                    <AnimatePresence mode="wait">
                      {status === 'transmitting' ? (
                        <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                          <Loader2 size={24} className="animate-spin" />
                          <span>Establishing Handshake...</span>
                        </m.div>
                      ) : (
                        <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                          <Send size={20} />
                          <span>Commit Intelligence</span>
                        </m.div>
                      )}
                    </AnimatePresence>
                  </button>
                </form>
              </GlassCard>
            </m.div>
          )}
        </AnimatePresence>

        <footer className="mt-12 flex flex-col items-center gap-4 opacity-30 text-center">
           <div className="flex items-center gap-3">
             <Terminal size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase font-black">Encrypted Neural Bridge v3.0</span>
           </div>
           <p className="text-[9px] font-medium text-slate-600 italic max-w-xs leading-relaxed">
             SomnoAI protocol ensures that all feedback is processed with biological integrity and privacy.
           </p>
        </footer>
      </div>
    </div>
  );
};
