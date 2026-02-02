
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Key, Bell, RefreshCw, Zap, Loader2, ChevronRight, Send, Terminal, Server, ShieldAlert, MessageSquare, Info, LifeBuoy
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { ExitFeedbackModal } from './ExitFeedbackModal.tsx';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, onNavigate
}) => {
  const { isAdmin } = useAuth();
  const [isSystemAiActive, setIsSystemAiActive] = useState(!!process.env.API_KEY);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_gemini_key') || '');
  const [isPersonalAiActive, setIsPersonalAiActive] = useState(!!customKey);
  const [showExitFeedback, setShowExitFeedback] = useState(false);

  const t = translations[lang]?.settings || translations.en.settings;

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem('somno_lang', newLang);
    onLanguageChange(newLang);
  };

  return (
    <div className="space-y-8 pb-48 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <ExitFeedbackModal 
        isOpen={showExitFeedback} 
        lang={lang} 
        onConfirmLogout={onLogout} 
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className={`p-6 rounded-[2.5rem] border-white/5 ${isAdmin ? 'opacity-100 bg-amber-500/5 border-amber-500/10' : 'opacity-40 grayscale'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isSystemAiActive ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                  <Server size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Admin Global Link</p>
                  <p className="text-sm font-black text-white italic">{isSystemAiActive ? 'CONNECTED' : 'OFFLINE'}</p>
                </div>
              </div>
              <ShieldCheck size={18} className={isSystemAiActive ? 'text-amber-500' : 'text-slate-700'} />
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isPersonalAiActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <Zap size={20} className={isPersonalAiActive ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Personal Bridge</p>
                  <p className="text-sm font-black text-white italic">{isPersonalAiActive ? 'ACTIVE' : 'CONFIG REQUIRED'}</p>
                </div>
              </div>
              <Key size={18} className={isPersonalAiActive ? 'text-emerald-500' : 'text-slate-700'} />
            </div>
          </GlassCard>
        </div>

        {/* Enhanced Support Hub Entry */}
        <GlassCard onClick={() => onNavigate('support')} className="p-8 rounded-[3rem] border-emerald-500/20 bg-emerald-500/[0.02] cursor-pointer group hover:bg-emerald-500/[0.05] transition-all">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                   <LifeBuoy size={24} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black italic text-white uppercase tracking-widest">{translations[lang].support.title}</h3>
                   <p className="text-[10px] text-slate-500 font-medium italic">Support, FAQ & Contributions</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-emerald-500/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </GlassCard>

        {/* Personal Key Config */}
        <GlassCard className="p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-indigo-400" />
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">{t.apiKey}</h3>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Regular subjects must provide a personal API Key to enable AI analysis.
              </p>
              <input 
                type="password"
                value={customKey}
                onChange={(e) => {
                  const val = e.target.value;
                  setCustomKey(val);
                  localStorage.setItem('custom_gemini_key', val);
                  setIsPersonalAiActive(!!val);
                }}
                placeholder={t.apiKeyPlaceholder}
                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500/40 transition-all font-mono"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-12">
            <div className="space-y-4 text-left">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2 block">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                  {[
                    { code: 'en', label: 'ENGLISH' },
                    { code: 'zh', label: '中文' },
                    { code: 'es', label: 'ESPAÑOL' }
                  ].map((l) => (
                    <button key={l.code} onClick={() => handleLanguageChange(l.code as Language)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l.code ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{l.label}</button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowExitFeedback(true)} className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20 shadow-2xl">
                 <DisconnectIcon size={18} /> {t.logout}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
