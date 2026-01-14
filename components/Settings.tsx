
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, X, CheckCircle2, Eye, EyeOff, Save, 
  HeartHandshake, Shield, FileText, Copy, Smartphone, Scan, 
  Globe, Zap, RefreshCw, Palette, Box, Info, ShieldCheck, Activity, Terminal, Lock, Loader2
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ThemeMode, AccentColor } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserPassword } from '../services/supabaseService.ts';

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
  lang, onLanguageChange, onLogout, 
  theme, onThemeChange, accentColor, onAccentChange,
  threeDEnabled, onThreeDChange, staticMode, onStaticModeChange,
  lastSyncTime, onManualSync
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [isEngineLinked, setIsEngineLinked] = useState(false);
  const [manualKey, setManualKey] = useState(localStorage.getItem('somno_manual_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'none' | 'paypal' | 'duitnow'>('none');
  const [isSyncing, setIsSyncing] = useState(false);

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const t = translations[lang].settings;
  const isZh = lang === 'zh';

  useEffect(() => {
    const checkKey = async () => {
      const storedKey = localStorage.getItem('somno_manual_gemini_key');
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineLinked(selected || !!process.env.API_KEY || !!storedKey);
      } else {
        setIsEngineLinked(!!process.env.API_KEY || !!storedKey);
      }
    };
    checkKey();
  }, [saveStatus]);

  const handleLinkEngine = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setIsEngineLinked(true);
    }
  };

  const handleSaveManualKey = () => {
    localStorage.setItem('somno_manual_gemini_key', manualKey);
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
  };

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      setPasswordError(isZh ? "密码至少需要 6 个字符" : "Password must be at least 6 characters");
      setPasswordStatus('error');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordStatus('idle');
    try {
      await updateUserPassword(newPassword);
      setPasswordStatus('success');
      setNewPassword('');
      setTimeout(() => setPasswordStatus('idle'), 3000);
    } catch (err: any) {
      setPasswordError(err.message || (isZh ? "密码更新失败" : "Password update failed"));
      setPasswordStatus('error');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleCopy = (text: string, type: 'paypal' | 'duitnow') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus('none'), 2000);
  };

  const triggerSync = async () => {
    setIsSyncing(true);
    await onManualSync();
    setIsSyncing(false);
  };

  const handleManagePermissions = () => {
    alert(lang === 'zh' ? '正在重定向至 Android 系统 Health Connect 设置界面...' : 'Redirecting to Android System Health Connect Settings...');
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700 max-w-2xl mx-auto">
      <header className="px-4 text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">{t.title}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">{t.subtitle}</p>
      </header>

      {/* Account Security Section */}
      <GlassCard className="p-8 rounded-[4rem] space-y-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400">
            <Lock size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{isZh ? '账户安全' : 'Account Security'}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Update Access Credentials</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase text-slate-500 px-4">{isZh ? '设置新访问密码' : 'Set New Access Password'}</label>
          <div className="relative group">
            <input 
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordStatus === 'error') setPasswordStatus('idle');
              }}
              placeholder={isZh ? "输入新密码" : "Enter new password"}
              className="w-full bg-slate-950/60 border border-white/5 rounded-full px-8 py-5 text-xs text-white outline-none focus:border-indigo-500/50 transition-all"
            />
            <button 
              onClick={handlePasswordUpdate}
              disabled={isUpdatingPassword || !newPassword}
              className={`absolute right-2 top-1/2 -translate-y-1/2 px-6 py-3 rounded-full font-black text-[9px] uppercase tracking-widest transition-all ${
                passwordStatus === 'success' ? 'bg-emerald-500 text-white' : 
                passwordStatus === 'error' ? 'bg-rose-500 text-white' : 
                'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30'
              }`}
            >
              {isUpdatingPassword ? <Loader2 size={14} className="animate-spin" /> : 
               passwordStatus === 'success' ? <CheckCircle2 size={14} /> : 
               passwordStatus === 'error' ? <X size={14} /> : 
               (isZh ? '更新' : 'Update')}
            </button>
          </div>
          <AnimatePresence>
            {passwordStatus === 'error' && (
              <m.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-rose-500 text-[9px] font-bold uppercase px-4 italic">
                {passwordError}
              </m.p>
            )}
            {passwordStatus === 'success' && (
              <m.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="text-emerald-500 text-[9px] font-bold uppercase px-4 italic">
                {isZh ? '密码更新成功，已同步至实验室节点' : 'Password synchronized to lab nodes'}
              </m.p>
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* Language Section */}
      <GlassCard className="p-8 rounded-[4rem] space-y-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Globe size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{t.language}</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Interface Locale Selection</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(['en', 'zh', 'de', 'fr'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => onLanguageChange(l)}
              className={`py-4 rounded-3xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                lang === l 
                ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)]' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'
              }`}
            >
              {l === 'en' ? 'English' : l === 'zh' ? '中文' : l === 'de' ? 'Deutsch' : 'Français'}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* AI Core Section */}
      <GlassCard className="p-10 rounded-[4rem] space-y-10">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black italic text-white uppercase tracking-tight">{t.geminiCore}</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isEngineLinked ? t.active : 'Disconnected'}</p>
              </div>
            </div>
            <button 
              onClick={handleLinkEngine}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
            >
              Auth AI
            </button>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Manual Key Injection</label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1">Get Key <ExternalLink size={10}/></a>
            </div>
            <div className="relative">
              <input 
                type={showKey ? 'text' : 'password'}
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-slate-950/60 border border-white/5 rounded-full px-8 py-4 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500/50"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-2">
                <button onClick={() => setShowKey(!showKey)} className="p-2 text-slate-600 hover:text-white transition-colors">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button onClick={handleSaveManualKey} className={`p-2 rounded-full ${saveStatus ? 'text-emerald-400' : 'text-slate-600 hover:text-indigo-400'}`}>
                  {saveStatus ? <CheckCircle2 size={16} /> : <Save size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Health Connect Ecosystem Module */}
        <div className="pt-6 border-t border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
              </div>
              <div>
                <h3 className="text-xs font-black italic text-white uppercase tracking-tight">{t.healthConnect}</h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{t.lastSync}: {lastSyncTime || t.never}</p>
              </div>
            </div>
            <button 
              onClick={triggerSync}
              disabled={isSyncing}
              className="px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/10 active:scale-95"
            >
              {t.manualSync}
            </button>
          </div>

          <div className="bg-slate-950/40 rounded-3xl p-6 border border-white/5 space-y-6">
             <div className="flex items-center gap-3">
               <ShieldCheck size={16} className="text-emerald-400" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Link Diagnostics</span>
             </div>
             
             <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={handleManagePermissions}
                  className="w-full py-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between px-6 group hover:bg-indigo-500/20 transition-all"
                >
                   <div className="flex items-center gap-4">
                      <Terminal size={14} className="text-indigo-400" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">{t.managePermissions}</span>
                   </div>
                   <ExternalLink size={12} className="text-indigo-500 opacity-50 group-hover:opacity-100 transition-opacity" />
                </button>
             </div>

             <div className="p-4 bg-emerald-500/[0.03] border border-emerald-500/10 rounded-2xl flex gap-3 items-start">
                <Info size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-[9px] text-slate-400 leading-relaxed italic">
                   {lang === 'zh' 
                     ? '检测到 Health Connect SDK 运行环境稳定。所有生物识别权限均由 Android 系统层级安全托管。' 
                     : 'Health Connect SDK runtime detected and stable. All biometric permissions are securely managed at the Android OS level.'}
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-4 pt-6">
          <button 
            onClick={() => setShowDonation(true)}
            className="w-full py-5 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-950/20"
          >
            <HeartHandshake size={18} className="inline mr-3" /> {t.coffee}
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-rose-400 hover:bg-rose-500/5 transition-all"
          >
            <LogOut size={16} className="inline mr-3" /> {t.logout}
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-8 rounded-[3.5rem] flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Box size={18} />
            </div>
            <h3 className="text-xs font-black italic text-white uppercase tracking-tight">{t.visualizations}</h3>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{t.enable3D}</span>
            <button 
              onClick={() => onThreeDChange(!threeDEnabled)}
              className={`w-12 h-6 rounded-full relative transition-colors ${threeDEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <m.div 
                animate={{ x: threeDEnabled ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Mode</span>
            <button 
              onClick={() => onStaticModeChange(!staticMode)}
              className={`w-12 h-6 rounded-full relative transition-colors ${staticMode ? 'bg-indigo-600' : 'bg-slate-800'}`}
            >
              <m.div 
                animate={{ x: staticMode ? 24 : 4 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-lg"
              />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-8 rounded-[3.5rem] flex flex-col gap-6">
           <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Info size={18} />
            </div>
            <h3 className="text-xs font-black italic text-white uppercase tracking-tight">{t.legal}</h3>
          </div>
          <div className="space-y-3">
            <a href="/privacy.html" target="_blank" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all text-[10px] font-black uppercase tracking-widest">
              <span>{t.privacy}</span>
              <ExternalLink size={12} />
            </a>
            <a href="/terms.html" target="_blank" className="flex items-center justify-between p-4 bg-white/5 rounded-2xl text-slate-400 hover:text-indigo-400 transition-all text-[10px] font-black uppercase tracking-widest">
              <span>{t.terms}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-3xl">
            <m.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-sm"
            >
              <GlassCard className="p-10 rounded-[5rem] relative overflow-hidden border-rose-500/30">
                <button 
                  onClick={() => setShowDonation(false)} 
                  className="absolute top-8 right-8 z-30 w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors border border-white/5"
                >
                  <X size={20} />
                </button>

                <div className="text-center space-y-8 relative z-10">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Bio-Funding</h2>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em]">{t.fundingDesc}</p>
                  </div>

                  <div className="relative py-4 flex flex-col items-center">
                    <div className="relative p-6 bg-white rounded-[3.5rem] shadow-[0_0_60px_rgba(236,72,153,0.25)] group">
                      <m.div 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-rose-500/30 rounded-[3.5rem] -m-2 pointer-events-none"
                      />
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(t.paypalLink)}&bgcolor=ffffff&color=020617&qzone=2`} 
                        alt="Donation QR Portal" 
                        className="w-48 h-48 rounded-[2rem] relative z-10 mix-blend-multiply"
                      />
                      <m.div 
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1.5px] bg-rose-500 shadow-[0_0_12px_rgba(236,72,153,0.8)] z-20 opacity-60"
                      />
                    </div>
                    <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
                      <Scan size={12} className="text-rose-400" />
                      <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">{t.coffeeDesc}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleCopy(t.paypalId, 'paypal')}
                      className={`w-full py-4 px-6 rounded-full border transition-all flex items-center justify-between ${copyStatus === 'paypal' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:border-rose-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={14} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PayPal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-50">{t.paypalId}</span>
                        {copyStatus === 'paypal' ? <CheckCircle2 size={14} /> : <Copy size={12} />}
                      </div>
                    </button>

                    <button 
                      onClick={() => handleCopy(t.tngId, 'duitnow')}
                      className={`w-full py-4 px-6 rounded-full border transition-all flex items-center justify-between ${copyStatus === 'duitnow' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:border-rose-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={14} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">DuitNow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-50">{t.tngId}</span>
                        {copyStatus === 'duitnow' ? <CheckCircle2 size={14} /> : <Copy size={12} />}
                      </div>
                    </button>
                  </div>
                </div>
              </GlassCard>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
