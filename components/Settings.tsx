import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut as DisconnectIcon, ShieldCheck, 
  RefreshCw, Zap, ChevronRight, Terminal, Globe, Heart, LifeBuoy, Key, Eye, EyeOff, Save, Trash2
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
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
  const { isAdmin, profile } = useAuth();
  const [showExitFeedback, setShowExitFeedback] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('somno_custom_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [isSavingKey, setIsSavingKey] = useState(false);

  const t = translations[lang]?.settings || translations.en.settings;

  // Determine API Key active status
  const isApiKeyActive = !!customKey || !!process.env.API_KEY;

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem('somno_lang', newLang);
    onLanguageChange(newLang);
  };

  const saveCustomKey = () => {
    setIsSavingKey(true);
    setTimeout(() => {
      if (customKey.trim()) {
        localStorage.setItem('somno_custom_key', customKey.trim());
      } else {
        localStorage.removeItem('somno_custom_key');
      }
      setIsSavingKey(false);
    }, 1000);
  };

  const clearCustomKey = () => {
    setCustomKey('');
    localStorage.removeItem('somno_custom_key');
  };

  return (
    <div className="space-y-8 pb-48 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <header className="flex flex-col gap-2 pt-8">
        <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
          {t.title}
        </h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">System Preferences & Node Diagnostics</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* API Status & Input Panel */}
        <GlassCard className="p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-500/[0.03] space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${isApiKeyActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Zap size={24} className={isApiKeyActive ? 'animate-pulse' : ''} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{t.apiKey}</p>
                <p className="text-sm font-black text-white italic">
                  {localStorage.getItem('somno_custom_key') ? 'USER_NODE_LINKED' : isApiKeyActive ? 'DEFAULT_NODE_ACTIVE' : 'NODE_OFFLINE'}
                </p>
              </div>
            </div>
            {isAdmin && (
              <button 
                onClick={() => onNavigate('admin')}
                className="px-6 py-2.5 bg-indigo-600/20 text-indigo-400 rounded-full text-[9px] font-black uppercase tracking-widest border border-indigo-500/30 hover:bg-indigo-600/30 transition-all flex items-center gap-2"
              >
                <Terminal size={12} /> BRIDGE_ACCESS
              </button>
            )}
          </div>

          <div className="space-y-4 pt-4 border-t border-white/5">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic flex items-center gap-2">
                  <Key size={12} /> Personal Neural Key
                </span>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[9px] font-black text-indigo-400 hover:text-white uppercase tracking-widest underline underline-offset-4">Get Key</a>
             </div>
             
             <div className="relative group">
                <input 
                  type={showKey ? "text" : "password"}
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder={t.apiKeyPlaceholder}
                  className="w-full bg-black/40 border border-white/5 rounded-full px-8 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-bold italic shadow-inner"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-600 hover:text-white transition-colors">
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  {customKey && (
                    <button onClick={clearCustomKey} className="p-2 text-slate-600 hover:text-rose-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
             </div>

             <button 
               onClick={saveCustomKey}
               disabled={isSavingKey}
               className="w-full py-4 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 transition-all active:scale-95 flex items-center justify-center gap-3 italic disabled:opacity-50"
             >
               {isSavingKey ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
               {isSavingKey ? 'COMMITTING LINK...' : 'COMMIT NEURAL LINK'}
             </button>
          </div>
        </GlassCard>

        {/* Preferences */}
        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01] space-y-12">
          <div className="space-y-6">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2 flex items-center gap-2">
               <Globe size={12} /> {t.language}
             </span>
             <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                {(['en', 'zh', 'es'] as Language[]).map((l) => (
                  <button 
                    key={l} 
                    onClick={() => handleLanguageChange(l)} 
                    className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l === 'en' ? 'ENGLISH' : l === 'zh' ? '中文简体' : 'ESPAÑOL'}
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
             <button 
               onClick={() => onNavigate('support')} 
               className="w-full py-6 rounded-full bg-white/5 border border-white/10 text-slate-300 font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all italic"
             >
               <LifeBuoy size={20} /> Support
             </button>
             <button 
               onClick={() => setShowExitFeedback(true)} 
               className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20 italic"
             >
               <DisconnectIcon size={18} /> {t.logout}
             </button>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showExitFeedback && (
          <ExitFeedbackModal 
            isOpen={showExitFeedback} 
            lang={lang} 
            onConfirmLogout={onLogout} 
          />
        )}
      </AnimatePresence>

      <footer className="pt-12 text-center opacity-30">
        <div className="flex items-center justify-center gap-3 text-indigo-400 mb-2">
           <ShieldCheck size={14} />
           <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Encrypted Session</span>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.5em] text-slate-600">
          NODE: {profile?.email || 'GUEST_GATEWAY'} • REV: 2026.1.4
        </p>
      </footer>
    </div>
  );
};