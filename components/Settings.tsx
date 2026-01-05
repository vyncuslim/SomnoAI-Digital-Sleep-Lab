
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, LogOut, ChevronRight, Info, AlertTriangle, Cpu, Binary, Languages as LangIcon, 
  Wallet, Heart, Coffee, ExternalLink, QrCode, Copy, Key, Check, Moon, Sun, Palette, 
  RefreshCw, Globe2, CreditCard, Smartphone, CheckCircle2, X, EyeOff, Eye
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ViewType, ThemeMode, AccentColor } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [showPaypalQR, setShowPaypalQR] = useState(false);
  const [telemetry, setTelemetry] = useState("0x4A8F2E");

  useEffect(() => {
    if (staticMode) return;
    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      setTelemetry(`0x${hex}`);
    }, 2000);
    return () => clearInterval(interval);
  }, [staticMode]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`${label} ${translations[lang].settings.copySuccess}`);
    setTimeout(() => setCopyToast(null), 2000);
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, badge, color = "indigo" }: any) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between py-5 px-6 group transition-all active:scale-[0.98] border-b border-white/5 last:border-0"
    >
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">{value}</p>
            {badge && (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black rounded border border-indigo-500/20">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-white italic">{t.title}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em]">{t.subtitle}</p>
      </header>

      {/* Language Switcher - Redesigned to 2x2 Grid to avoid "reading together" */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Globe2 size={14} className="text-indigo-400" />
          {t.language}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {(['en', 'zh', 'de', 'fr'] as Language[]).map((l) => (
            <GlassCard key={l} className="p-0 overflow-hidden">
              <button
                onClick={() => onLanguageChange(l)}
                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {l === 'en' ? 'English' : l === 'zh' ? '中文' : l === 'de' ? 'Deutsch' : 'Français'}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Visualizations & Static Mode */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Palette size={14} className="text-indigo-400" />
          {t.visualizations}
        </h3>
        <GlassCard className="overflow-hidden">
          <div className="w-full flex items-center justify-between py-5 px-6 border-b border-white/5">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <EyeOff size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-100">{lang === 'zh' ? '静态模式' : 'Static Mode'}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'zh' ? '禁用自动旋转和背景脉冲' : 'Disable looping animations'}</p>
                </div>
             </div>
             <button 
              onClick={() => onStaticModeChange(!staticMode)}
              className={`w-12 h-6 rounded-full transition-all relative ${staticMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
             >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${staticMode ? 'left-7' : 'left-1'}`} />
             </button>
          </div>
          <div className="w-full flex items-center justify-between py-5 px-6">
             <div className="flex items-center gap-5">
                <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                  <Smartphone size={20} />
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-100">{t.enable3D}</p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{threeDEnabled ? 'Depth Enabled' : 'Flat Icons'}</p>
                </div>
             </div>
             <button 
              onClick={() => onThreeDChange(!threeDEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${threeDEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
             >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${threeDEnabled ? 'left-7' : 'left-1'}`} />
             </button>
          </div>
        </GlassCard>
      </div>

      {/* Core Settings */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Cpu size={14} className="text-indigo-400" />
          {t.security}
        </h3>
        <GlassCard className="overflow-hidden">
          <SettingItem 
            icon={Key} 
            label={t.geminiCore} 
            value={lang === 'zh' ? '神经引擎已就绪' : 'Neural Engine Ready'} 
            badge="v3.1"
          />
          <SettingItem 
            icon={Shield} 
            label={t.dataPrivacy} 
            value={t.encrypted} 
          />
        </GlassCard>
      </div>

      {/* Research Funding */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Heart size={14} className="text-rose-400" />
          {t.funding}
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-400">
              <Coffee size={28} />
            </div>
            <div>
              <p className="font-bold text-slate-100">{t.coffee}</p>
              <p className="text-xs text-slate-500 leading-relaxed mt-1">{t.coffeeDesc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-4 group">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <CreditCard size={18} className="text-sky-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">PayPal (Global)</span>
                </div>
                <button onClick={() => setShowPaypalQR(true)} className="p-2 bg-sky-500/10 text-sky-400 rounded-xl"><QrCode size={16} /></button>
              </div>
              <p className="text-sm font-bold text-white">{t.paypalId}</p>
              <a href={t.paypalLink} target="_blank" className="block w-full py-3 bg-sky-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest text-center">{t.paypalCopy}</a>
            </div>
            <div className="p-5 bg-white/5 border border-white/5 rounded-3xl space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-indigo-400" />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-300">DuitNow / TNG (MY)</span>
                </div>
                <button onClick={() => handleCopy(t.duitNowId, 'DuitNow')} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><Copy size={16} /></button>
              </div>
              <p className="text-lg font-black font-mono tracking-tighter text-white">{t.duitNowId}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Footer Meta */}
      <div className="px-4 opacity-30 flex justify-between items-center">
         <div className="flex items-center gap-2">
            <Binary size={12} className="text-indigo-400" />
            <span className="text-[8px] font-mono tracking-widest uppercase">System Telemetry</span>
         </div>
         <span className="text-[8px] font-mono">{telemetry}</span>
      </div>

      <div className="pt-6">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-500 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest"
        >
          <LogOut size={16} />
          {t.logout}
        </button>
      </div>

      {/* Modals & Toasts */}
      <AnimatePresence>
        {showPaypalQR && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-sm px-4">
              <GlassCard className="p-8 space-y-8 text-center border-indigo-500/40 shadow-[0_0_100px_rgba(79,70,229,0.2)]">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-widest">Research Grant Gateway</span>
                  <button onClick={() => setShowPaypalQR(false)}><X size={20}/></button>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] flex flex-col items-center gap-4 shadow-2xl">
                  <h2 className="text-slate-900 font-black tracking-tight text-xl">PayPal / Global</h2>
                  <div className="w-48 h-48 bg-slate-100 rounded-2xl overflow-hidden border border-slate-100">
                    <img src="https://cdn.jsdelivr.net/gh/vyncuslim/SomnoAI-Digital-Sleep-Lab@main/public/paypal_qr.jpg" alt="QR" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Vyncuslim vyncuslim</p>
                </div>
                <button onClick={() => setShowPaypalQR(false)} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">Close Gateway</button>
              </GlassCard>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {copyToast && (
          <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[300] px-6 py-3 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest">
            {copyToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
