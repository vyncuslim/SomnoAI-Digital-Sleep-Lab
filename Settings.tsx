import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, ExternalLink, Database, ChevronRight, Key, Info, MessageSquare, AlertTriangle, Lightbulb, Loader2, Mail
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackApi, supabase } from './services/supabaseService.ts';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  threeDEnabled: boolean;
  onThreeDChange: (enabled: boolean) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, onNavigate
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'report' | 'suggestion' | 'improvement'>('report');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkKeyStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setFeedbackEmail(user.email || '');

      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const linked = await (window as any).aistudio.hasSelectedApiKey();
          setHasApiKey(linked);
        } catch (e) {
          console.debug("Neural handshake skipped.");
        }
      }
    };
    checkKeyStatus();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleLinkKey = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackContent.trim() || !feedbackEmail.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    
    const result = await feedbackApi.submitFeedback(feedbackType, feedbackContent, feedbackEmail);
    
    if (result.success) {
      setFeedbackStatus('success');
      setFeedbackContent('');
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackStatus('idle');
      }, 2000);
    } else {
      setFeedbackStatus('error');
      setTimeout(() => setFeedbackStatus('idle'), 3000);
    }
    setIsSubmitting(false);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(feedbackEmail);
  const canSubmit = feedbackContent.length > 5 && isEmailValid;

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <div className="absolute top-0 right-[-100px] opacity-[0.05] pointer-events-none -z-10 rotate-12">
        <Moon size={400} fill="currentColor" className="text-indigo-400" />
      </div>

      <div className="bg-[#0a0f25] border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
        <div className="flex items-center gap-5 relative z-10">
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <ShieldCheck size={24} />
          </div>
          <div>
             <h2 className="text-sm font-black italic text-white uppercase tracking-wider flex items-center gap-2">
               <Moon size={14} className="text-indigo-400" /> Neural Engine Core
             </h2>
             <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  LINK ESTABLISHED
                </p>
             </div>
          </div>
        </div>
      </div>

      <GlassCard className="p-8 md:p-10 rounded-[3rem] border-white/10 bg-white/[0.01]">
        <div className="space-y-10">
          <div className="space-y-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">{t.language}</span>
             <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                {['en', 'zh'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => onLanguageChange(l as Language)}
                    className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l === 'en' ? 'ENGLISH' : 'CHINESE'}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">Neural Credentials & Data</span>
             <div className="space-y-3">
               <button 
                  onClick={handleLinkKey}
                  className="w-full p-6 rounded-3xl bg-slate-900/50 border border-white/10 flex items-center justify-between group hover:bg-slate-900 transition-all text-left"
               >
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                        <Key size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider">Gemini API Key</p>
                        <p className="text-[10px] text-slate-500 italic">Manage your laboratory access token</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${hasApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                      {hasApiKey ? 'LINKED' : 'UNSET'}
                    </span>
                    <ChevronRight size={18} className="text-slate-700" />
                  </div>
               </button>

               <button 
                  onClick={() => setShowFeedback(true)}
                  className="w-full p-6 rounded-3xl bg-slate-900/50 border border-white/10 flex items-center justify-between group hover:bg-slate-900 transition-all text-left"
               >
                  <div className="flex items-center gap-4">
                     <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-400">
                        <MessageSquare size={20} />
                     </div>
                     <div>
                        <p className="text-xs font-black text-white uppercase tracking-wider">Lab Feedback</p>
                        <p className="text-[10px] text-slate-500 italic">Report issues or suggest upgrades</p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-700" />
               </button>
             </div>
          </div>

          <div className="space-y-4">
             <button 
                onClick={() => setShowDonation(true)}
                className="w-full py-6 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10"
             >
                <Heart size={20} fill="currentColor" /> {t.coffee}
             </button>

             <button 
                onClick={onLogout}
                className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
                <DisconnectIcon size={18} /> {t.logout}
             </button>
          </div>
        </div>
      </GlassCard>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowFeedback(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <GlassCard className="p-10 rounded-[3rem] border-white/10 space-y-6">
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Lab Feedback</h2>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Help us evolve the laboratory node</p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    {(['report', 'suggestion', 'improvement'] as const).map((type) => (
                      <button
                        key={type}
                        onClick={() => setFeedbackType(type)}
                        className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-2 border transition-all ${feedbackType === type ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-[0_0_15px_rgba(79,70,229,0.2)]' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
                      >
                        {type === 'report' ? <AlertTriangle size={14} /> : type === 'suggestion' ? <MessageSquare size={14} /> : <Lightbulb size={14} />}
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-500 transition-colors" size={16} />
                    <input 
                      type="email"
                      value={feedbackEmail}
                      onChange={(e) => setFeedbackEmail(e.target.value)}
                      placeholder="Your Contact Email"
                      className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-14 pr-6 py-5 text-xs text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-bold italic"
                    />
                  </div>

                  <textarea
                    value={feedbackContent}
                    onChange={(e) => setFeedbackContent(e.target.value)}
                    placeholder="Describe your findings or proposed upgrades..."
                    className="w-full h-32 bg-[#050a1f] border border-white/10 rounded-[2rem] p-6 text-sm text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-medium italic resize-none"
                  />
                </div>

                <button 
                  onClick={handleSubmitFeedback}
                  disabled={!canSubmit || isSubmitting}
                  className={`w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${
                    feedbackStatus === 'success' ? 'bg-emerald-600 text-white' : 
                    feedbackStatus === 'error' ? 'bg-rose-600 text-white' :
                    'bg-indigo-600 text-white disabled:opacity-30'
                  }`}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 
                   feedbackStatus === 'success' ? 'Telemetry Transmitted' : 
                   feedbackStatus === 'error' ? 'Transmission Failed' :
                   'Submit Telemetry'}
                </button>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};