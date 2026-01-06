
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, LogOut, ChevronRight, AlertTriangle, Languages as LangIcon, 
  Heart, Coffee, ExternalLink, QrCode, Copy, Key, Globe2, Smartphone, 
  X, FileText, Sparkles, Globe, CreditCard, Stethoscope, FlaskConical, 
  RefreshCw, Wallet, Info, Trash2, Cpu, Zap, Terminal
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ViewType, ThemeMode, AccentColor, AIProvider } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { SpatialIcon } from './SpatialIcon.tsx';

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: ViewType | 'privacy' | 'terms' | 'about') => void;
  theme: ThemeMode;
  onThemeChange: (t: ThemeMode) => void;
  accentColor: AccentColor;
  onAccentChange: (c: AccentColor) => void;
  threeDEnabled: boolean;
  onThreeDChange: (enabled: boolean) => void;
  staticMode: boolean;
  onStaticModeChange: (enabled: boolean) => void;
  lastSyncTime: string | null;
  onManualSync: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, onNavigate,
  theme, onThemeChange, accentColor, onAccentChange,
  threeDEnabled, onThreeDChange, 
  staticMode, onStaticModeChange,
  lastSyncTime, onManualSync
}) => {
  const t = translations[lang].settings;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<AIProvider>(() => (localStorage.getItem('somno_ai_provider') as AIProvider) || 'gemini');

  useEffect(() => {
    localStorage.setItem('somno_ai_provider', activeProvider);
  }, [activeProvider]);

  const handleConfirmLogout = () => {
    onLogout();
    setShowLogoutConfirm(false);
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-white italic">{t.title}</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.subtitle}</p>
      </header>

      {/* AI Engine Settings */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Cpu size={14} className="text-indigo-400" />
          AI ENGINE PREFERENCE
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button 
            type="button"
            onClick={() => setActiveProvider('gemini')}
            className={`p-5 rounded-3xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden ${activeProvider === 'gemini' ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
          >
            <Terminal size={20} className="text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">Google Gemini</span>
            <span className="text-[8px] text-slate-500 font-bold leading-tight">Advanced multimodal research engine.</span>
            {activeProvider === 'gemini' && (
              <motion.div layoutId="active-indicator" className="absolute top-3 right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
            )}
          </button>
          <button 
            type="button"
            onClick={() => setActiveProvider('openai')}
            className={`p-5 rounded-3xl border transition-all text-left flex flex-col gap-2 relative overflow-hidden ${activeProvider === 'openai' ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg' : 'bg-white/5 border-white/10 opacity-40 grayscale'}`}
          >
            <Zap size={20} className="text-emerald-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white">OpenAI GPT</span>
            <span className="text-[8px] text-slate-500 font-bold leading-tight">High-precision reasoning alternative.</span>
            {activeProvider === 'openai' && (
              <motion.div layoutId="active-indicator" className="absolute top-3 right-3 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            )}
          </button>
        </div>
      </div>

      {/* Language Switcher */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Globe2 size={14} className="text-indigo-400" />
          {t.language}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(['en', 'zh', 'de', 'fr'] as Language[]).map((l) => (
            <GlassCard key={l} className="p-0 overflow-hidden">
              <button
                type="button"
                onClick={() => onLanguageChange(l)}
                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {l === 'en' ? 'English' : l === 'zh' ? '中文' : l === 'de' ? 'Deutsch' : 'Français'}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      <div className="pt-6">
        <button 
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-400 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-xl"
        >
          <LogOut size={16} />
          {t.logout}
        </button>
      </div>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-sm"
            >
              <GlassCard className="p-10 text-center border-rose-500/40 space-y-8 shadow-[0_0_100px_rgba(225,29,72,0.1)]">
                <div className="mx-auto w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/30">
                  <AlertTriangle size={32} className="text-rose-500" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-xl font-black italic text-white tracking-tighter">
                    {lang === 'zh' ? '确认注销并重载？' : 'Sign Out & Reload?'}
                  </h2>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    {lang === 'zh' 
                      ? '为了您的隐私，注销操作将永久清除所有本地缓存的生理指标和 AI 洞察流。' 
                      : 'For your privacy, signing out will permanently purge all local biometric caches and AI insight streams.'}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button 
                    type="button"
                    onClick={handleConfirmLogout} 
                    className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                  >
                    {lang === 'zh' ? '确认注销' : 'CONFIRM LOGOUT'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => setShowLogoutConfirm(false)} 
                    className="w-full py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:bg-white/10"
                  >
                    {lang === 'zh' ? '取消' : 'CANCEL'}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
