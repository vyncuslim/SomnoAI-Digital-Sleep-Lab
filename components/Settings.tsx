
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, LogOut, ChevronRight, Info, AlertTriangle, Cpu, Binary, Languages as LangIcon, 
  Wallet, Heart, Coffee, ExternalLink, QrCode, Copy, Key, Check, Moon, Sun, Palette, 
  RefreshCw, Globe2, Smartphone, CheckCircle2, X, EyeOff, Eye, Database, Github, FileText,
  DollarSign, Sparkles, Receipt, ArrowUpRight, Globe
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

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
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
  const [showThankYou, setShowThankYou] = useState(false);
  const [telemetry, setTelemetry] = useState("0x4A8F2E");
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (staticMode) return;
    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      setTelemetry(`0x${hex}`);
    }, 2000);
    return () => clearInterval(interval);
  }, [staticMode]);

  // Google Translate Re-initialization for SPA
  useEffect(() => {
    const initTranslate = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        if (!document.querySelector('.goog-te-gadget')) {
          window.googleTranslateElementInit();
        }
      }
    };
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(initTranslate, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`${label} ${translations[lang].settings.copySuccess}`);
    setTimeout(() => setCopyToast(null), 2000);
    setShowThankYou(true);
  };

  const handleManualSyncAction = async () => {
    setIsSyncing(true);
    try {
      await onManualSync();
    } finally {
      setIsSyncing(false);
    }
  };

  const SettingItem = ({ icon: Icon, label, value, onClick, badge, color = "indigo", isLoading = false }: any) => (
    <button 
      onClick={onClick}
      disabled={isLoading}
      className="w-full flex items-center justify-between py-5 px-6 group transition-all active:scale-[0.98] border-b border-white/5 last:border-0 disabled:opacity-50"
    >
      <div className="flex items-center gap-5">
        <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
          {isLoading ? <RefreshCw size={20} className="animate-spin" /> : <Icon size={20} />}
        </div>
        <div className="text-left">
          <p className="font-bold text-slate-100 group-hover:text-white transition-colors">{label}</p>
          <div className="flex items-center gap-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400">{value}</p>
            {badge && (
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black rounded border border-indigo-500/20">
                {badge}
              </span>
            )}
          </div>
        </div>
      </div>
      <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-white italic">{t.title}</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{t.subtitle}</p>
      </header>

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
                onClick={() => onLanguageChange(l)}
                className={`w-full py-4 text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {l === 'en' ? 'English' : l === 'zh' ? '中文' : l === 'de' ? 'Deutsch' : 'Français'}
              </button>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Google Translate Integration */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
            <Globe size={14} className="text-indigo-400" />
            {lang === 'zh' ? '全域自动翻译' : 'Global Auto Translation'}
          </h3>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[8px] font-black rounded border border-emerald-500/20 uppercase tracking-widest">Neural Link</span>
        </div>
        <GlassCard className="p-6 border-indigo-500/20">
          <div className="flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <LangIcon size={20} />
              </div>
              <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                {lang === 'zh' 
                  ? '使用 Google Translate 引擎将整个实验室界面即时翻译成您喜欢的语言。这适用于除了核心分析报告以外的所有内容。' 
                  : 'Use Google Translate to interpret the entire lab interface into your preferred language instantly.'}
              </p>
            </div>
            <div id="google_translate_element" className="min-h-[46px] flex items-center justify-center p-2 bg-slate-950/40 rounded-2xl border border-white/5 transition-all hover:border-white/10"></div>
          </div>
        </GlassCard>
      </div>

      {/* Data Management Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Database size={14} className="text-indigo-400" />
          {t.dataManagement}
        </h3>
        <GlassCard className="overflow-hidden">
          <SettingItem 
            icon={RefreshCw} 
            label={t.manualSync} 
            value={lastSyncTime || t.never} 
            onClick={handleManualSyncAction}
            isLoading={isSyncing}
          />
        </GlassCard>
      </div>

      {/* Visualizations & Static Mode */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
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
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{lang === 'zh' ? '禁用背景脉冲与 3D 旋转' : 'Disable ambient animations'}</p>
                </div>
             </div>
             <button 
              onClick={() => onStaticModeChange(!staticMode)}
              aria-label="Toggle Static Mode"
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
                  <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{threeDEnabled ? 'Depth Enabled' : 'Flat UI'}</p>
                </div>
             </div>
             <button 
              onClick={() => onThreeDChange(!threeDEnabled)}
              aria-label="Toggle 3D Icons"
              className={`w-12 h-6 rounded-full transition-all relative ${threeDEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
             >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${threeDEnabled ? 'left-7' : 'left-1'}`} />
             </button>
          </div>
        </GlassCard>
      </div>

      {/* Support Lab Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Heart size={14} className="text-rose-400" />
          {t.funding}
        </h3>
        <GlassCard className="p-8 space-y-6 border-rose-500/20">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-rose-500/10 rounded-[2rem] text-rose-400">
              <Coffee size={32} />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-lg">{t.coffee}</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">{t.coffeeDesc}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button 
              onClick={() => handleCopy(t.duitNowId, 'DuitNow')}
              className="w-full p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <Smartphone size={20} className="text-indigo-400" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-200">DuitNow / TNG (MY)</p>
                  <p className="text-lg font-black font-mono tracking-tight text-white">{t.duitNowId}</p>
                </div>
              </div>
              <Copy size={16} className="text-slate-400 group-hover:text-indigo-400" />
            </button>

            <button 
              onClick={() => { window.open(t.paypalLink, '_blank'); setShowThankYou(true); }}
              className="w-full p-6 bg-sky-500/10 border border-sky-500/20 rounded-3xl flex items-center justify-between group active:scale-[0.98] transition-all"
            >
              <div className="flex items-center gap-4">
                <QrCode size={20} className="text-sky-400" />
                <div className="text-left">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-200">PayPal / Global</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{t.paypalId}</p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-sky-400" />
            </button>
          </div>
          
          <p className="text-[9px] text-slate-500 leading-relaxed italic text-center px-4">
            {t.fundingDisclaimer}
          </p>
        </GlassCard>
      </div>

      {/* Legal & Docs */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Shield size={14} className="text-indigo-400" />
          {t.legal}
        </h3>
        <GlassCard className="overflow-hidden">
          <SettingItem 
            icon={Shield} 
            label={t.privacy} 
            value="v2025.01.04" 
            onClick={() => onNavigate('privacy')}
          />
          <SettingItem 
            icon={FileText} 
            label={t.terms} 
            value="v2025.01.04" 
            onClick={() => onNavigate('terms')}
          />
          <SettingItem 
            icon={Github} 
            label="GitHub Repository" 
            value="Open Source" 
            onClick={() => window.open('https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab', '_blank')}
          />
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
        <AnimatePresence mode="wait">
          {showLogoutConfirm ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-rose-500/10 border border-rose-500/20 rounded-[2.5rem] space-y-6"
            >
              <div className="text-center space-y-2">
                <p className="font-black text-rose-400 uppercase text-xs tracking-widest">确认终止实验室会话？</p>
                <p className="text-[10px] text-slate-400 font-medium italic">物理数据擦除程序准备就绪。</p>
              </div>
              <div className="flex gap-4">
                <button onClick={onLogout} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  清除并退出
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-white/5 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest">
                  取消
                </button>
              </div>
            </motion.div>
          ) : (
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-6 bg-white/5 border border-white/10 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-400 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest"
            >
              <LogOut size={16} />
              {t.logout}
            </button>
          )}
        </AnimatePresence>
      </div>

      {/* Thank You Modal / Receipt */}
      <AnimatePresence>
        {showThankYou && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="w-full max-w-sm">
              <GlassCard className="p-10 text-center border-indigo-500/40 space-y-8 shadow-[0_0_100px_rgba(79,70,229,0.3)]">
                <div className="mx-auto w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center border border-indigo-500/30">
                  <Sparkles size={40} className="text-indigo-400" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-black italic text-white tracking-tighter">{t.thankYouTitle}</h2>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    {t.thankYouMsg}
                  </p>
                </div>
                <button 
                  onClick={() => setShowThankYou(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:bg-indigo-500 transition-all"
                >
                  {t.closeReceipt}
                </button>
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
