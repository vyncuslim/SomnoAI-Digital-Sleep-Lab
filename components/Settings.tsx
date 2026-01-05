import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, ShieldCheck, FileText, Info, MessageSquare, Github, AlertTriangle, Cpu, Activity, Binary, Radio, Languages as LangIcon, Globe2, Wallet, Heart, Coffee, ExternalLink, QrCode, Copy, Smartphone as MobileIcon, CreditCard, Key, Trash2, CheckCircle2, X, Loader2, RefreshCw, Sun, Moon, Palette, Box, Check
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
  lastSyncTime: string | null;
  onManualSync: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, onNavigate,
  theme, onThemeChange, accentColor, onAccentChange,
  threeDEnabled, onThreeDChange, lastSyncTime, onManualSync
}) => {
  const t = translations[lang].settings;
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [telemetry, setTelemetry] = useState("0x000000");
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [showPaypalQR, setShowPaypalQR] = useState(false);
  const [qrLoaded, setQrLoaded] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const hex = Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0');
      setTelemetry(`0x${hex}`);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleClearApiKey = () => {
    localStorage.removeItem('SOMNO_MANUAL_KEY');
    if ((window as any).process?.env) (window as any).process.env.API_KEY = "";
    onLogout();
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(lang === 'zh' ? "ID 已捕获到剪贴板" : "ID Captured to Clipboard");
    setTimeout(() => setCopyToast(null), 2000);
  };

  const SettingItem = ({ icon: Icon, label, value, href, onClick, badge }: any) => {
    const isExternal = !!href;
    const content = (
      <div className="w-full flex items-center justify-between py-5 px-6 group transition-all active:scale-[0.98] cursor-pointer relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className={`p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300 shadow-lg border border-indigo-500/10`}>
            <Icon size={20} />
          </div>
          <div className="text-left space-y-0.5">
            <p className="font-bold text-slate-100 group-hover:text-white transition-colors tracking-tight">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-400 group-hover:text-slate-300 transition-colors">
                {value}
              </p>
              {badge && (
                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`px-1.5 py-0.5 bg-indigo-500/20 text-indigo-400 text-[7px] font-black rounded-md border border-indigo-500/20 uppercase tracking-tighter`}
                >
                  {badge}
                </motion.span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          {onClick && <Copy size={14} className="text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />}
          {isExternal && <ExternalLink size={14} className="text-slate-500 group-hover:text-indigo-400 transition-all" />}
          {!onClick && !isExternal && <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );

    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open external link: ${label}`} className="block w-full">{content}</a>
    ) : (
      <button onClick={onClick} aria-label={`Settings: ${label}`} className="block w-full text-left outline-none">{content}</button>
    );
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700" style={{ transformStyle: "preserve-3d" }}>
      <header className="px-2 space-y-1">
        <div className="flex items-center gap-3 mb-1">
          <motion.div 
            animate={{ height: [24, 32, 24] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 bg-indigo-500 rounded-full shadow-[0_0_12px_rgba(79,70,229,0.8)]" 
          />
          <h1 className="text-3xl font-black tracking-tighter text-white italic">{t.title}</h1>
        </div>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] px-4">{t.subtitle}</p>
      </header>

      <GlassCard 
        onClick={() => onNavigate('about')}
        className="p-6 border-indigo-500/20 bg-indigo-500/5 group cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
              <Info size={24} />
            </div>
            <div>
              <p className="font-bold text-slate-100">{t.about}</p>
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Mission & Neural Architecture</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </GlassCard>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Palette size={14} className="text-indigo-400" />
          {t.theme}
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex gap-4">
            <button 
              onClick={() => onThemeChange('dark')}
              aria-label="Switch to Dark Mode"
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'}`}
            >
              <Moon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.darkMode}</span>
            </button>
            <button 
              onClick={() => onThemeChange('light')}
              aria-label="Switch to Light Mode"
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-white/5 border-white/5 text-slate-400 hover:text-slate-200'}`}
            >
              <Sun size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.lightMode}</span>
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <RefreshCw size={14} className="text-indigo-400" />
          {t.dataManagement}
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{t.lastSync}</p>
              <p className="text-sm font-bold text-white">{lastSyncTime || t.never}</p>
            </div>
            <button 
              onClick={onManualSync}
              aria-label="Trigger manual synchronization"
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              {t.manualSync}
            </button>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Cpu size={14} className="text-indigo-400" />
          {lang === 'zh' ? '核心引擎管理' : 'CORE ENGINE MGMT'}
        </h3>
        <GlassCard className="divide-y divide-white/5 border-indigo-500/20 bg-indigo-500/[0.02]">
          <SettingItem 
            icon={Key} 
            label={lang === 'zh' ? '管理 API 密钥' : 'Manage API Key'} 
            value={lang === 'zh' ? '重新配置或清除密钥' : 'Reconfigure or Clear Key'}
            onClick={handleClearApiKey}
            badge={lang === 'zh' ? "点击重置" : "RESET"}
          />
        </SettingItem>
      </GlassCard>

      <div className="pt-6 px-2 space-y-4">
        <AnimatePresence mode="wait">
          {showLogoutConfirm ? (
            <motion.div 
              key="confirm"
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-8 bg-rose-500/10 border border-rose-500/30 rounded-[2.5rem] space-y-6 shadow-[0_20px_50px_rgba(225,29,72,0.2)]"
            >
              <div className="flex items-center gap-4 text-rose-400">
                 <div className="p-3 bg-rose-500/20 rounded-2xl border border-rose-500/20">
                   <AlertTriangle size={24} />
                 </div>
                 <div>
                   <p className="font-black uppercase text-[12px] tracking-widest">{lang === 'en' ? 'Purge System?' : '确认退出？'}</p>
                 </div>
              </div>
              <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                {lang === 'en' 
                  ? 'Terminating lab session will erase all biometric cache. This action is irreversible.' 
                  : '终止实验室会话将擦除所有本地缓存。此操作无法撤销。'}
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={onLogout} 
                  className="flex-1 py-4 bg-rose-600 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest"
                >
                  {lang === 'en' ? 'Purge Now' : '确认退出'}
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest">
                  {lang === 'en' ? 'Cancel' : '取消'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.button 
              layoutId="logout-btn"
              onClick={() => setShowLogoutConfirm(true)} 
              aria-label="Logout of system"
              className="group w-full flex items-center justify-between p-7 bg-white/5 border border-white/10 text-slate-400 rounded-[2.5rem] transition-all hover:bg-rose-500/5 hover:border-rose-500/30 active:scale-[0.98] shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-400 group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all shadow-inner border border-white/5"><LogOut size={22} /></div>
                <div className="text-left">
                  <span className="block font-black text-[12px] uppercase tracking-[0.25em] group-hover:text-slate-200 transition-colors">{t.logout}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-500 group-hover:text-rose-400 transition-all" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};