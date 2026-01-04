
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
              <p className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-400 transition-colors">
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
          {onClick && <Copy size={14} className="text-slate-600 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all" />}
          {isExternal && <ExternalLink size={14} className="text-slate-600 group-hover:text-indigo-400 transition-all" />}
          {!onClick && !isExternal && <ChevronRight size={16} className="text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/[0.03] to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    );

    return isExternal ? (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">{content}</a>
    ) : (
      <button onClick={onClick} className="block w-full text-left outline-none">{content}</button>
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
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] px-4">{t.subtitle}</p>
      </header>

      {/* About Section */}
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
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Mission & Neural Architecture</p>
            </div>
          </div>
          <ChevronRight size={18} className="text-indigo-400 group-hover:translate-x-1 transition-all" />
        </div>
      </GlassCard>

      {/* Theme Customization */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Palette size={14} className="text-indigo-400" />
          {t.theme}
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex gap-4">
            <button 
              onClick={() => onThemeChange('dark')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${theme === 'dark' ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
            >
              <Moon size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.darkMode}</span>
            </button>
            <button 
              onClick={() => onThemeChange('light')}
              className={`flex-1 p-4 rounded-2xl border transition-all flex items-center justify-center gap-3 ${theme === 'light' ? 'bg-white text-slate-900 border-slate-200' : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300'}`}
            >
              <Sun size={18} />
              <span className="text-[10px] font-black uppercase tracking-widest">{t.lightMode}</span>
            </button>
          </div>
          <div className="space-y-3">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 px-1">{t.accentColor}</p>
            <div className="flex justify-between items-center px-2">
              {(['indigo', 'emerald', 'rose', 'amber', 'sky'] as AccentColor[]).map((c) => (
                <button 
                  key={c}
                  onClick={() => onAccentChange(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${accentColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-50 hover:opacity-100'}`}
                  style={{ backgroundColor: c === 'indigo' ? '#818cf8' : c === 'emerald' ? '#10b981' : c === 'rose' ? '#f43f5e' : c === 'amber' ? '#f59e0b' : '#0ea5e9' }}
                >
                  {accentColor === c && <Check size={16} className="text-white" />}
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Visualizations (3D Icons) */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Box size={14} className="text-indigo-400" />
          {t.visualizations}
        </h3>
        <GlassCard className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="font-bold text-slate-100">{t.enable3D}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Interactive depth icons</p>
              </div>
            </div>
            <button 
              onClick={() => onThreeDChange(!threeDEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative ${threeDEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <motion.div 
                animate={{ x: threeDEnabled ? 24 : 2 }}
                className="w-5 h-5 bg-white rounded-full absolute top-0.5"
              />
            </button>
          </div>
        </GlassCard>
      </div>

      {/* Data Management Section */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <RefreshCw size={14} className="text-indigo-400" />
          {t.dataManagement}
        </h3>
        <GlassCard className="p-6 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.lastSync}</p>
              <p className="text-sm font-bold text-white">{lastSyncTime || t.never}</p>
            </div>
            <button 
              onClick={onManualSync}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
            >
              <RefreshCw size={14} />
              {t.manualSync}
            </button>
          </div>
        </GlassCard>
      </div>

      {/* 支持实验室模块 */}
      <div className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
          <Heart size={14} className="text-rose-500" />
          {t.funding}
        </h3>
        <GlassCard className="p-8 space-y-8 border-rose-500/20 bg-rose-500/[0.02]" intensity={1.1}>
          <div className="flex gap-4 items-start">
            <div className="p-4 bg-rose-500/10 rounded-[1.5rem] border border-rose-500/20">
               <Coffee size={24} className="text-rose-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-black italic text-white leading-none">{t.coffee}</h4>
              <p className="text-xs text-slate-400 font-medium">{t.fundingDesc}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {/* PayPal 增强卡片 */}
             <div className="flex flex-col gap-2">
               <div className="flex gap-2">
                 <button 
                  onClick={() => window.open(t.paypalLink, '_blank')}
                  className="flex-1 flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-blue-600/10 hover:border-blue-500/30 transition-all group"
                 >
                   <div className="flex items-center gap-4">
                     <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400"><CreditCard size={18} /></div>
                     <div className="text-left">
                       <p className="text-xs font-black uppercase tracking-widest text-white">PayPal</p>
                       <p className="text-[9px] font-mono text-slate-500 group-hover:text-blue-400 transition-colors">Vyncuslim vyncuslim</p>
                     </div>
                   </div>
                   <ExternalLink size={14} className="text-slate-600 group-hover:text-blue-400" />
                 </button>
                 <button 
                  onClick={() => {
                    setQrLoaded(false);
                    setShowPaypalQR(true);
                  }}
                  className="px-5 bg-white/5 border border-white/5 rounded-2xl hover:bg-indigo-600/10 hover:border-indigo-500/30 text-slate-500 hover:text-indigo-400 transition-all"
                  title="Show QR Code"
                 >
                   <QrCode size={18} />
                 </button>
               </div>
             </div>

             {/* DuitNow */}
             <button 
              onClick={() => handleCopy(t.duitNowId)}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-rose-600/10 hover:border-rose-500/30 transition-all group"
             >
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400"><QrCode size={18} /></div>
                 <div className="text-left">
                   <p className="text-xs font-black uppercase tracking-widest text-white">DuitNow</p>
                   <p className="text-[9px] font-mono text-slate-500 group-hover:text-rose-400 transition-colors">{t.transferVia}</p>
                 </div>
               </div>
               <Copy size={14} className="text-slate-600 group-hover:text-rose-400" />
             </button>

             {/* TNG */}
             <button 
              onClick={() => handleCopy(t.tngId)}
              className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-sky-600/10 hover:border-sky-500/30 transition-all group"
             >
               <div className="flex items-center gap-4">
                 <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400"><MobileIcon size={18} /></div>
                 <div className="text-left">
                   <p className="text-xs font-black uppercase tracking-widest text-white">TNG eWallet</p>
                   <p className="text-[9px] font-mono text-slate-500 group-hover:text-sky-400 transition-colors">Direct Support (MY)</p>
                 </div>
               </div>
               <Copy size={14} className="text-slate-600 group-hover:text-sky-400" />
             </button>
          </div>

          <div className="p-5 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
             <Info size={18} className="text-amber-500 shrink-0" />
             <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">{t.fundingDisclaimer}</p>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4 flex items-center gap-2">
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
          <SettingItem icon={ShieldCheck} label={t.geminiCore} value={`${t.active}`} badge="Gemini-3-Flash" />
        </GlassCard>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em]">{t.language}</h3>
        </div>
        <GlassCard className="divide-y divide-white/5 border-indigo-500/20">
          <div className="w-full py-8 px-6 space-y-6">
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/80 rounded-[1.75rem] border border-white/5 shadow-inner relative overflow-hidden">
              {(['en', 'zh', 'de', 'fr'] as Language[]).map((l) => (
                <button 
                  key={l}
                  onClick={() => onLanguageChange(l)}
                  className={`relative flex items-center justify-center gap-3 py-4 rounded-[1.25rem] transition-all duration-500 overflow-hidden ${lang === l ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {lang === l && (
                    <motion.div layoutId="activeLangIndicator" className="absolute inset-0 bg-indigo-600 shadow-[0_0_30px_rgba(79,70,229,0.4)]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                  )}
                  <Globe2 size={14} className="relative z-10" />
                  <span className="relative z-10 text-[11px] font-black tracking-widest uppercase">{l.toUpperCase()}</span>
                </button>
              ))}
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.25em] px-4">{t.legal}</h3>
        <GlassCard className="divide-y divide-white/5 border-slate-700/20">
          <SettingItem icon={Shield} label={t.privacy} value={lang === 'zh' ? '查看隐私协议' : 'View Privacy'} onClick={() => onNavigate('privacy')} />
          <SettingItem icon={FileText} label={t.terms} value={lang === 'zh' ? '查看服务条款' : 'View Terms'} onClick={() => onNavigate('terms')} />
        </GlassCard>
      </div>

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
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic">
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
              className="group w-full flex items-center justify-between p-7 bg-white/5 border border-white/10 text-slate-400 rounded-[2.5rem] transition-all hover:bg-rose-500/5 hover:border-rose-500/30 active:scale-[0.98] shadow-2xl overflow-hidden relative"
            >
              <div className="flex items-center gap-5 relative z-10">
                <div className="p-3 bg-slate-800 rounded-2xl text-slate-500 group-hover:bg-rose-500/10 group-hover:text-rose-400 transition-all shadow-inner border border-white/5"><LogOut size={22} /></div>
                <div className="text-left">
                  <span className="block font-black text-[12px] uppercase tracking-[0.25em] group-hover:text-slate-200 transition-colors">{t.logout}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-700 group-hover:text-rose-400 transition-all" />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="flex flex-col items-center gap-5 py-12 opacity-20">
           <div className="flex items-center gap-3 justify-center">
             <Binary size={12} className="text-indigo-400" />
             <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-slate-600">Secure Protocol v3.4.0 • Signal: <span className="text-indigo-400">{telemetry}</span></p>
           </div>
        </div>
      </div>

      {/* PayPal QR Overlay 面板 */}
      <AnimatePresence>
        {showPaypalQR && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-6"
            onClick={() => setShowPaypalQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.8, y: 40, rotateX: 20 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.8, y: 40, rotateX: 20 }}
              className="w-full max-w-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="p-10 border-indigo-500/40 shadow-[0_0_100px_rgba(79,70,229,0.3)] bg-white overflow-hidden" intensity={1.2}>
                <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-6">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-slate-950 tracking-tight italic">Vyncuslim vyncuslim</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">PayPal Researcher Support</p>
                  </div>
                  <button 
                    onClick={() => setShowPaypalQR(false)}
                    className="p-2 bg-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="relative aspect-square w-full bg-white rounded-3xl border border-slate-100 flex items-center justify-center p-6 group shadow-[inset_0_2px_10px_rgba(0,0,0,0.05)]">
                  {!qrLoaded && (
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                       <Loader2 size={32} className="animate-spin text-blue-600" />
                    </div>
                  )}
                  
                  {/* 使用真实的 QR Code 生成 API */}
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(t.paypalLink)}&color=000000&bgcolor=ffffff&qzone=1`}
                    alt="PayPal QR Code"
                    className={`w-full h-full object-contain transition-opacity duration-500 ${qrLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setQrLoaded(true)}
                  />
                  
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                     <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center border border-slate-100/50">
                        <svg viewBox="0 0 24 24" className="w-8 h-8" fill="#003087">
                          <path d="M20.007 21.003c-.303 1.34-1.353 1.997-3.15 1.997H11.25c-.5 0-.916-.36-.988-.857l-2.223-14.28c-.027-.184.116-.36.302-.36h4.524c3.085 0 5.174-1.285 5.86-4.505.027-.13.14-.23.272-.23h3.04c.18 0 .323.167.284.342l-2.404 18.003zM15.42 2.76C14.73 6.04 12.61 7.35 9.48 7.35H5.06l-.272 1.76h3.41c3.085 0 5.174-1.285 5.86-4.505.102-.48.163-.92.194-1.334.025-.333.344-.567.668-.51z" />
                        </svg>
                     </div>
                  </div>
                </div>

                <div className="mt-8 space-y-4 text-center">
                  <p className="text-xs font-bold text-slate-500 tracking-tight leading-relaxed px-4">
                    {lang === 'en' ? 'Scan to pay Vyncuslim vyncuslim' : '扫描以向 Vyncuslim vyncuslim 支付'}
                  </p>
                  <button 
                    onClick={() => window.open(t.paypalLink, '_blank')}
                    className="w-full py-4 bg-[#003087] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <ExternalLink size={14} />
                    {t.paypalCopy}
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 信号捕获提示框 (Toast) */}
      <AnimatePresence>
        {copyToast && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-indigo-600 text-white rounded-full shadow-[0_20px_50px_rgba(79,70,229,0.5)] flex items-center gap-3 border border-indigo-400"
          >
            <CheckCircle2 size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{copyToast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
