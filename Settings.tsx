import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, ExternalLink, Database, ChevronRight, Key, Info, MessageSquare, AlertTriangle, Lightbulb, Loader2, Mail, CheckCircle2, XCircle, Zap, Globe, BrainCircuit, Eye, EyeOff, Trash2
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
  lang, onLanguageChange, onLogout
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'report' | 'suggestion' | 'improvement'>('report');
  const [feedbackContent, setFeedbackContent] = useState('');
  const [feedbackEmail, setFeedbackEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_api_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkStatus = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsLinked(hasKey || !!apiKey);
      } else {
        setIsLinked(!!apiKey);
      }
    };
    checkStatus();
  }, [apiKey]);

  const handleSaveKey = (val: string) => {
    const cleanKey = val.trim();
    setApiKey(cleanKey);
    if (cleanKey) {
      localStorage.setItem('gemini_api_key', cleanKey);
    } else {
      localStorage.removeItem('gemini_api_key');
    }
  };

  const handleOpenAuth = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      await (window as any).aistudio.openSelectKey();
      setIsLinked(true);
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem('gemini_api_key');
    setApiKey('');
    setIsLinked(false);
    window.location.reload();
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmitFeedback = async () => {
    const emailToSubmit = feedbackEmail.trim();
    if (!feedbackContent.trim() || !emailToSubmit || isSubmitting) return;
    
    setIsSubmitting(true);
    setFeedbackStatus('idle');
    try {
      const { success } = await feedbackApi.submitFeedback(feedbackType, feedbackContent, emailToSubmit);
      if (success) {
        setFeedbackStatus('success');
        setFeedbackContent('');
        setTimeout(() => {
          setFeedbackStatus('idle');
          setShowFeedback(false);
        }, 2000);
      } else {
        setFeedbackStatus('error');
      }
    } catch (err) {
      setFeedbackStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <div className="absolute top-0 right-[-100px] opacity-[0.05] pointer-events-none -z-10 rotate-12">
        <Moon size={400} fill="currentColor" className="text-indigo-400" />
      </div>

      {/* Gemini Core Engine Section */}
      <GlassCard className="p-8 md:p-10 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] border-indigo-500/20 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
           <BrainCircuit size={160} />
        </div>
        
        <div className="space-y-8 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-5">
              <div className={`p-4 rounded-2xl border transition-all ${isLinked ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-900 border-white/10 text-slate-600'}`}>
                <Key size={24} />
              </div>
              <div>
                 <h2 className="text-sm font-black italic text-white uppercase tracking-wider flex items-center gap-2">
                   GEMINI CORE ENGINE
                 </h2>
                 <div className="flex items-center gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${isLinked ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isLinked ? 'text-emerald-400' : 'text-slate-600'}`}>
                      {isLinked ? 'LINK ESTABLISHED' : 'DISCONNECTED'}
                    </p>
                 </div>
              </div>
            </div>
            <button 
              onClick={handleOpenAuth}
              className="px-8 py-3 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all active:scale-95"
            >
              AUTH AI
            </button>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center px-4">
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">GCP BILLING AWARENESS</span>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1 hover:text-white transition-colors">
                   Billing Info <ExternalLink size={10} />
                 </a>
              </div>
              <div className="relative group">
                <input 
                  type={showKey ? "text" : "password"}
                  value={apiKey}
                  onChange={(e) => handleSaveKey(e.target.value)}
                  placeholder="Paste API Key here..."
                  className="w-full bg-slate-950/80 border border-white/5 rounded-3xl pl-8 pr-32 py-5 text-xs text-white outline-none focus:border-indigo-500/40 transition-all font-mono placeholder:italic placeholder:text-slate-800"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                   <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-600 hover:text-white transition-colors">
                      {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                   </button>
                   <button onClick={() => handleSaveKey('')} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                      <Trash2 size={16} />
                   </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <button 
                 onClick={() => setShowDonation(true)}
                 className="py-5 bg-gradient-to-r from-rose-500/10 to-purple-500/10 border border-rose-500/20 rounded-3xl text-rose-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all group"
               >
                 <Heart size={16} className="group-hover:fill-rose-500 transition-all" /> SUPPORT RESEARCH
               </button>
               <button 
                 onClick={handleDisconnect}
                 className="py-5 bg-white/5 border border-white/10 rounded-3xl text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-white hover:border-white/20"
               >
                 <DisconnectIcon size={16} /> DISCONNECT & RELOAD
               </button>
            </div>
          </div>
        </div>
      </GlassCard>

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
                    {l === 'en' ? 'ENGLISH' : '中文简体'}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <button 
                onClick={() => setShowFeedback(true)}
                className="w-full py-6 rounded-full bg-white/5 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
                <MessageSquare size={20} /> {t.feedback}
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
                  Your support fuels lab processing.
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
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-indigo-500/30 transition-all text-left">
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