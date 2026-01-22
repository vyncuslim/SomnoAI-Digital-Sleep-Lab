import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, ExternalLink, Database, ChevronRight, Key, Info, MessageSquare, AlertTriangle, Lightbulb, Loader2
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { feedbackApi } from './services/supabaseService.ts';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkKeyStatus = async () => {
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
    if (!feedbackContent.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    
    const result = await feedbackApi.submitFeedback(feedbackType, feedbackContent);
    
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
             
             <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-3">
                <Info size={14} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-500 italic leading-relaxed">
                  High-fidelity Neural Synthesis requires a Gemini API key from a paid GCP project. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-amber-500 underline">Review Billing Documentation</a>.
                </p>
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
              <GlassCard className="p-10 rounded-[3rem] border-white/10 space-y-8">
                <div className="text-center space-y-2">
                   <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Lab Feedback</h2>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Node: ongyuze1401@gmail.com</p>
                </div>

                <div className="flex gap-2">
                   {(['report', 'suggestion', 'improvement'] as const).map((type) => (
                     <button
                       key={type}
                       onClick={() => setFeedbackType(type)}
                       className={`flex-1 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest flex flex-col items-center gap-2 border transition-all ${feedbackType === type ? 'bg-indigo-600/20 border-indigo-500/50 text-white' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300'}`}
                     >
                       {type === 'report' ? <AlertTriangle size={14} /> : type === 'suggestion' ? <MessageSquare size={14} /> : <Lightbulb size={14} />}
                       {type}
                     </button>
                   ))}
                </div>

                <textarea
                  value={feedbackContent}
                  onChange={(e) => setFeedbackContent(e.target.value)}
                  placeholder="Describe your issue or suggestion here..."
                  className="w-full h-40 bg-[#050a1f] border border-white/10 rounded-[2rem] p-6 text-sm text-white placeholder:text-slate-700 outline-none focus:border-indigo-500/50 transition-all font-medium italic"
                />

                <button 
                  onClick={handleSubmitFeedback}
                  disabled={!feedbackContent.trim() || isSubmitting}
                  className={`w-full py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 ${feedbackStatus === 'success' ? 'bg-emerald-600' : 'bg-indigo-600 disabled:opacity-30'}`}
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : feedbackStatus === 'success' ? 'Feedback Transmitted' : 'Submit Telemetry'}
                </button>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-2xl text-center space-y-10"
            >
              <m.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto"
              >
                <Heart size={48} fill="white" strokeWidth={0} />
              </m.div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                  CONTRIBUTION<br />ACKNOWLEDGED
                </h2>
                <p className="text-[13px] text-slate-400 italic max-w-md mx-auto leading-relaxed">
                  Your support fuels lab processing and neural research.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2 p-8 bg-slate-900/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=020617&bgcolor=ffffff`}
                        alt="QR" className="w-36 h-36 md:w-44 md:h-44"
                      />
                   </div>
                   <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2">
                      <QrCode size={14} /> SCAN TO PAYPAL
                   </p>
                </div>

                <div className="md:col-span-3 space-y-4">
                  {[
                    { id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388' },
                    { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim' }
                  ].map((item) => (
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all text-left">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-black text-white italic tracking-tight">{item.value}</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.id, item.value)}
                        className={`p-4 rounded-2xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')}
                className="w-full py-6 rounded-full bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
              >
                <ArrowUpRight size={20} /> GO TO PAYPAL PAGE
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};