
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, MessageSquare, AlertTriangle, Lightbulb, 
  Zap, Mail, Send, Loader2, CheckCircle2, XCircle, 
  Terminal, ShieldCheck, Sparkles, BrainCircuit
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
        setTimeout(() => onBack(), 2500);
      } else {
        throw error || new Error("TRANSMISSION_FAILED");
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Protocol transmission failure.");
      setTimeout(() => setStatus('idle'), 4000);
    }
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

      <div className="max-w-2xl mx-auto space-y-10">
        <GlassCard className="p-10 md:p-14 rounded-[4.5rem] border-white/10" intensity={1.5}>
          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-4">
               <label className="text-[11px] font-black uppercase text-indigo-400 px-6 tracking-widest italic flex items-center gap-2">
                 <BrainCircuit size={14} /> Select Log Type
               </label>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'report', label: t.feedbackReport, icon: AlertTriangle, color: 'text-rose-500' },
                    { id: 'suggestion', label: t.feedbackSuggestion, icon: Lightbulb, color: 'text-amber-500' },
                    { id: 'improvement', label: t.feedbackImprovement, icon: Sparkles, color: 'text-emerald-500' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id as FeedbackType)}
                      className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all gap-3 ${
                        type === item.id 
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-[0_0_30px_rgba(79,70,229,0.1)]' 
                        : 'bg-slate-900/40 border-white/5 hover:border-white/10 opacity-60'
                      }`}
                    >
                      <item.icon className={type === item.id ? item.color : 'text-slate-600'} size={24} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 px-6 tracking-widest italic flex items-center gap-2">
                  <Mail size={14} /> Subject Identifier (Email)
                </label>
                <div className="relative group">
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Subject Node ID..."
                    className="w-full bg-[#050a1f] border border-white/5 rounded-full px-10 py-6 text-sm text-white focus:border-indigo-500 outline-none transition-all font-bold italic shadow-inner"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black uppercase text-slate-500 px-6 tracking-widest italic flex items-center gap-2">
                  <MessageSquare size={14} /> Telemetry Description
                </label>
                <textarea 
                  required
                  rows={6}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Detail the anomaly or proposal for the neural grid..."
                  className="w-full bg-[#050a1f] border border-white/5 rounded-[2.5rem] px-10 py-8 text-sm text-white focus:border-indigo-500 outline-none transition-all font-medium italic shadow-inner resize-none leading-relaxed"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={status !== 'idle'}
              className={`w-full py-8 rounded-full font-black text-sm uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-4 italic relative overflow-hidden shadow-2xl ${
                status === 'success' ? 'bg-emerald-600 shadow-emerald-500/20' :
                status === 'error' ? 'bg-rose-600 shadow-rose-500/20' :
                'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 active:scale-[0.98]'
              }`}
            >
              <AnimatePresence mode="wait">
                {status === 'transmitting' ? (
                  <m.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <Loader2 size={24} className="animate-spin" />
                    <span>Transmitting Signal...</span>
                  </m.div>
                ) : status === 'success' ? (
                  <m.div key="success" initial={{ y: 20 }} animate={{ y: 0 }} className="flex items-center gap-3">
                    <CheckCircle2 size={24} />
                    <span>Log Committed</span>
                  </m.div>
                ) : status === 'error' ? (
                  <m.div key="error" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                    <XCircle size={24} />
                    <span>Handshake Failure</span>
                  </m.div>
                ) : (
                  <m.div key="idle" initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex items-center gap-3">
                    <Send size={20} />
                    <span>Execute Submission</span>
                  </m.div>
                )}
              </AnimatePresence>
            </button>
          </form>
        </GlassCard>

        {status === 'success' && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-500/5 border border-emerald-500/20 rounded-[3rem] p-10 flex items-center gap-8">
            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
               <ShieldCheck size={32} />
            </div>
            <div className="space-y-1">
               <p className="text-white font-black italic uppercase text-lg leading-tight">Registry Updated</p>
               <p className="text-[11px] text-slate-500 font-medium italic">Your telemetry has been archived. Returning to base terminal...</p>
            </div>
          </m.div>
        )}

        <footer className="pt-10 flex flex-col items-center gap-4 opacity-30 text-center">
           <div className="flex items-center gap-3">
             <Terminal size={14} className="text-indigo-400" />
             <span className="text-[9px] font-mono tracking-widest uppercase font-black">Secure Feedback Link • End-to-End Encrypted</span>
           </div>
           <p className="text-[9px] font-medium text-slate-600 italic max-w-xs leading-relaxed">
             SomnoAI CRO reviews all incoming telemetry. Your contribution optimizes global neural architecture.
           </p>
        </footer>
      </div>
    </div>
  );
};
