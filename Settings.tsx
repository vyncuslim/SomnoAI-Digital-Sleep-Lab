import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, ExternalLink, Database, ChevronRight, Key, Info, MessageSquare, AlertTriangle, Lightbulb, Loader2, Mail, CheckCircle2, XCircle, Zap, Globe, BrainCircuit, Eye, EyeOff, Trash2, Send
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './services/supabaseService.ts';
import { notifyAdmin } from './services/telegramService.ts';

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState(false);
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [telegramTestStatus, setTelegramTestStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkAiStatus = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsAiActive(hasKey || !!process.env.API_KEY);
        } catch (e) {
          setIsAiActive(!!process.env.API_KEY);
        }
      } else {
        setIsAiActive(!!process.env.API_KEY);
      }
    };
    checkAiStatus();
  }, []);

  const handleTestTelegram = async () => {
    if (isTestingTelegram) return;
    setIsTestingTelegram(true);
    setTelegramTestStatus('idle');
    try {
      const ok = await notifyAdmin(`🧪 TELEGRAM LINK TEST\nStatus: Online\nInitiated by Subject Settings\nTime: ${new Date().toLocaleTimeString()}`);
      setTelegramTestStatus(ok ? 'success' : 'error');
    } catch (e) {
      setTelegramTestStatus('error');
    } finally {
      setIsTestingTelegram(false);
      setTimeout(() => setTelegramTestStatus('idle'), 3000);
    }
  };

  const handleOpenAiKeySelector = async () => {
    if ((window as any).aistudio?.openSelectKey) {
      try {
        await (window as any).aistudio.openSelectKey();
        setIsAiActive(true);
      } catch (e) {
        console.error("AI Key Bridge Error.");
      }
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const executeFullLogout = async () => {
    try {
      await onLogout();
      localStorage.removeItem('google_fit_token');
      localStorage.removeItem('health_connect_token');
      localStorage.removeItem('supabase.auth.token');
      window.location.hash = '#/';
      window.location.reload();
    } catch (e) {
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8 pb-96 max-w-2xl mx-auto px-4 font-sans text-left relative z-[80] pointer-events-auto">
      <div className="absolute top-0 right-[-100px] opacity-[0.05] pointer-events-none -z-10 rotate-12">
        <Moon size={400} fill="currentColor" className="text-indigo-400" />
      </div>

      {/* AI STATUS & SECURE BRIDGE */}
      <GlassCard className="p-8 md:p-10 rounded-[3.5rem] bg-gradient-to-br from-indigo-500/[0.05] to-purple-500/[0.05] border-indigo-500/20 shadow-2xl relative overflow-hidden group pointer-events-auto">
        <div className="absolute -right-10 -top-10 opacity-5 group-hover:opacity-10 transition-opacity duration-1000">
           <BrainCircuit size={200} />
        </div>
        
        <div className="space-y-8 relative z-10 pointer-events-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="flex items-center gap-5">
              <div className={`p-5 rounded-[2rem] border transition-all duration-700 ${isAiActive ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-white/10 text-slate-700'}`}>
                <Zap size={28} fill={isAiActive ? "currentColor" : "none"} className={isAiActive ? 'animate-pulse' : ''} />
              </div>
              <div className="text-left">
                 <h2 className="text-lg font-black italic text-white uppercase tracking-tight flex items-center gap-2">
                   Neural Engine Bridge
                 </h2>
                 <div className="flex items-center gap-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${isAiActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                    <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isAiActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isAiActive ? 'COGNITION LINK STABLE' : 'LINK CALIBRATION REQUIRED'}
                    </p>
                 </div>
              </div>
            </div>
            <button 
              onClick={handleOpenAiKeySelector}
              className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all active:scale-95 whitespace-nowrap cursor-pointer relative z-[100] pointer-events-auto flex items-center gap-3"
            >
              <Key size={16} /> INITIALIZE BRIDGE
            </button>
          </div>

          <div className="p-6 bg-slate-900/40 border border-white/5 rounded-[2.2rem] space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">Security Protocol</span>
            </div>
            <p className="text-[11px] text-slate-500 italic leading-relaxed">
              Paid Gemini API keys must be authorized via the secure bridge. This ensures zero persistent storage of sensitive credentials. 
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-white transition-colors underline ml-1">
                GCP Billing Docs <ExternalLink size={10} className="inline ml-0.5" />
              </a>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* TELEGRAM TEST CARD */}
      <GlassCard className="p-8 md:p-10 rounded-[3rem] border-white/10 bg-indigo-500/[0.02] relative z-20 pointer-events-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400">
                <Send size={24} />
              </div>
              <div className="text-left">
                <h3 className="text-[12px] font-black italic text-white uppercase tracking-widest">Admin Notification Channel</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1">Verify Telegram Link Status</p>
              </div>
           </div>
           <button 
             onClick={handleTestTelegram}
             disabled={isTestingTelegram}
             className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center gap-3 ${
               telegramTestStatus === 'success' ? 'bg-emerald-600 text-white' : 
               telegramTestStatus === 'error' ? 'bg-rose-600 text-white' : 
               'bg-white/5 border border-white/10 text-slate-400 hover:text-white'
             }`}
           >
             {isTestingTelegram ? <Loader2 size={14} className="animate-spin" /> : <Terminal size={14} />}
             {telegramTestStatus === 'success' ? 'LINK VERIFIED' : telegramTestStatus === 'error' ? 'LINK FAILED' : 'TEST TELEGRAM LINK'}
           </button>
        </div>
      </GlassCard>

      {/* GENERAL SETTINGS CARD */}
      <GlassCard className="p-8 md:p-10 rounded-[3rem] border-white/10 bg-white/[0.01] relative z-20 pointer-events-auto">
        <div className="space-y-10 relative z-30 pointer-events-auto">
          <div className="space-y-4 pointer-events-auto">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">{t.language}</span>
             <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 relative z-40 pointer-events-auto">
                {['en', 'zh'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => onLanguageChange(l as Language)}
                    className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer z-50 pointer-events-auto ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l === 'en' ? 'ENGLISH' : '中文简体'}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5 relative z-40 pointer-events-auto">
             <button 
                onClick={() => window.location.hash = '#/feedback'}
                className="w-full py-6 rounded-full bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-indigo-500/20 cursor-pointer z-50 pointer-events-auto shadow-lg"
             >
                <MessageSquare size={20} /> {t.feedback}
             </button>

             <button 
                onClick={() => setShowDonation(true)}
                className="w-full py-6 rounded-full bg-[#f43f5e]/5 border border-[#f43f5e]/20 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10 hover:bg-[#f43f5e]/10 cursor-pointer z-50 pointer-events-auto"
             >
                <Heart size={20} fill="currentColor" /> {t.coffee}
             </button>

             <button 
                onClick={executeFullLogout}
                className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20 cursor-pointer z-50 pointer-events-auto"
             >
                <DisconnectIcon size={18} /> {t.logout}
             </button>
          </div>
        </div>
      </GlassCard>

      {/* DONATION MODAL */}
      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl pointer-events-auto" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-2xl text-center space-y-10 relative z-[2001] pointer-events-auto"
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
                  Your support fuels lab processing and research development.
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start pointer-events-auto">
                <div className="md:col-span-2 p-8 bg-slate-900/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-sm">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=020617&bgcolor=ffffff`}
                        alt="QR" className="w-36 h-36 md:w-44 md:h-44"
                      />
                   </div>
                   <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2">
                      <QrCode size={14} /> SCAN TO PAYPAL
                   </p>
                </div>

                <div className="md:col-span-3 space-y-4 pointer-events-auto">
                  {[
                    { id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388' },
                    { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim' }
                  ].map((item) => (
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all text-left pointer-events-auto">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-black text-white italic tracking-tight">{item.value}</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.id, item.value)}
                        className={`p-4 rounded-2xl transition-all cursor-pointer z-50 pointer-events-auto ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')}
                className="w-full py-6 rounded-full bg-indigo-600 text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform cursor-pointer z-50 pointer-events-auto"
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