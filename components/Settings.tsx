
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, LogOut, ChevronRight, AlertTriangle, Languages as LangIcon, 
  Heart, Coffee, ExternalLink, QrCode, Copy, Key, Globe2, Smartphone, 
  X, FileText, Sparkles, Globe, CreditCard, Stethoscope, FlaskConical, 
  RefreshCw, Wallet, Info, Trash2, Cpu, Zap, Terminal, HeartHandshake,
  CheckCircle2, Link as LinkIcon
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ViewType, ThemeMode, AccentColor, AIProvider } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
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
  const [showDonation, setShowDonation] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'none' | 'tng' | 'paypal'>('none');
  const [isEngineLinked, setIsEngineLinked] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineLinked(selected || !!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleLinkEngine = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setIsEngineLinked(true);
    }
  };

  const handleCopy = (text: string, type: 'tng' | 'paypal') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus('none'), 2000);
  };

  return (
    <div className="space-y-10 pb-32 animate-in fade-in slide-in-from-bottom-6 duration-700 rounded-[4px]">
      <header className="px-2 space-y-1">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">SomnoAI Digital Sleep Lab</h1>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">System Configuration Control</p>
      </header>

      <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/[0.02] rounded-[4px]">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400"><Key size={24} /></div>
            <div>
              <h2 className="text-xl font-bold italic text-white tracking-tight">AI 引擎激活</h2>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{isEngineLinked ? '引擎已链接' : '引擎离线'}</p>
            </div>
          </div>
          <button onClick={handleLinkEngine} className={`px-6 py-2.5 rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all ${isEngineLinked ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-indigo-600 text-white'}`}>
            {isEngineLinked ? '重新链接密钥' : '点击激活引擎'}
          </button>
        </div>
      </GlassCard>

      <GlassCard className="p-8 border-rose-500/20 bg-rose-500/[0.02] rounded-[4px]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-xl text-rose-400"><HeartHandshake size={24} /></div>
            <div><h2 className="text-xl font-bold italic text-white tracking-tight">{t.coffee}</h2></div>
          </div>
          <button onClick={() => setShowDonation(true)} className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-[4px] font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95">
            支持实验室
          </button>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-4 px-2">
        <a href="/privacy.html" target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-[4px] text-slate-400 hover:text-white transition-all">
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><Shield size={14}/> Privacy Policy</span>
          <ExternalLink size={14}/>
        </a>
        <a href="/terms.html" target="_blank" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-[4px] text-slate-400 hover:text-white transition-all">
          <span className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2"><FileText size={14}/> Terms of Service</span>
          <ExternalLink size={14}/>
        </a>
      </div>

      <div className="pt-6">
        <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-6 bg-white/5 border border-white/10 rounded-[4px] flex items-center justify-center gap-3 text-slate-400 hover:text-rose-400 transition-all font-black text-[10px] uppercase tracking-widest active:scale-95">
          <LogOut size={16} />注销系统
        </button>
      </div>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/95 backdrop-blur-3xl">
            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-sm">
              <GlassCard className="p-8 border-rose-500/30 space-y-8 relative rounded-[4px]">
                <button onClick={() => setShowDonation(false)} className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white"><X size={20} /></button>
                <div className="text-center space-y-4">
                  <h2 className="text-2xl font-black italic text-white tracking-tighter">打赏研究员</h2>
                  <div className="p-4 bg-white rounded-[4px] mx-auto shadow-2xl inline-block">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://paypal.me/vyncuslim" alt="PayPal QR Code" className="w-[180px] h-[180px]" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">PayPal: Vyncuslim vyncuslim</p>
                </div>
                <div className="space-y-3">
                  <button onClick={() => handleCopy('+60 187807388', 'tng')} className={`w-full p-4 rounded-[4px] border transition-all flex items-center justify-between ${copyStatus === 'tng' ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <span className="text-[9px] font-black uppercase tracking-widest">DuitNow / TNG</span>
                    {copyStatus === 'tng' ? <CheckCircle2 size={16}/> : <Copy size={16}/>}
                  </button>
                </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
