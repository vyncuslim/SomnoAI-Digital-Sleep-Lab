
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, X, CheckCircle2, Eye, EyeOff, Save, 
  HeartHandshake, Smartphone, Globe, Lock, Loader2, CreditCard, 
  ChevronRight, Heart, Copy, QrCode, Languages
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ThemeMode, AccentColor } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { updateUserPassword, adminApi } from '../services/supabaseService.ts';
import { supabase } from '../lib/supabaseClient.ts';

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
  lastSyncTime, onManualSync, onNavigate
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [isEngineLinked, setIsEngineLinked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [manualKey, setManualKey] = useState(localStorage.getItem('somno_manual_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Password update states
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [passwordError, setPasswordError] = useState('');

  const t = translations[lang].settings;
  const isZh = lang === 'zh';
  const isSandbox = localStorage.getItem('somno_sandbox_active') === 'true';

  useEffect(() => {
    const checkState = async () => {
      const storedKey = localStorage.getItem('somno_manual_gemini_key');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const adminStatus = await adminApi.checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      } else if (isSandbox) {
        setIsAdmin(true);
      }

      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineLinked(selected || !!process.env.API_KEY || !!storedKey);
      } else {
        setIsEngineLinked(!!process.env.API_KEY || !!storedKey);
      }
    };
    checkState();
  }, [saveStatus, isSandbox]);

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

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
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

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700 max-w-2xl mx-auto">
      <header className="px-4 text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">{t.title}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">{t.subtitle}</p>
      </header>

      {/* Language Switcher Section */}
      <GlassCard className="p-8 rounded-[4rem] border-white/5 bg-white/[0.02]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Languages size={20} />
            </div>
            <div>
              <h2 className="text-sm font-black italic text-white uppercase tracking-tight">{isZh ? '系统语言' : 'System Language'}</h2>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Select UI Protocol</p>
            </div>
          </div>
          <div className="flex bg-slate-950/80 p-1 rounded-full border border-white/5 shadow-inner">
            {(['en', 'zh', 'de', 'fr'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onLanguageChange(l)}
                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </GlassCard>

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
              className="w-full bg-slate-950/60 border border-white/10 rounded-full px-8 py-5 text-xs text-white outline-none focus:border-indigo-500/50 transition-all"
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
              <label className="text-[10px] font-black uppercase text-slate-500">GCP Billing Awareness</label>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-indigo-400 hover:underline flex items-center gap-1"
              >
                Billing Info <CreditCard size={10}/><ExternalLink size={10}/>
              </a>
            </div>
            
            <div className="relative">
              <input 
                type={showKey ? 'text' : 'password'}
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-slate-950/60 border border-white/10 rounded-full px-8 py-4 text-xs font-mono text-indigo-300 outline-none focus:border-indigo-500/50"
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

        <div className="space-y-4 pt-6">
          <button 
            type="button"
            onClick={() => setShowDonation(true)}
            className="w-full py-5 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-3 relative overflow-hidden z-[50]"
          >
            <HeartHandshake size={18} /> {t.coffee}
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-rose-400 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={16} /> {t.logout}
          </button>
        </div>
      </GlassCard>

      {/* Donation Modal - Enhanced with QR & English Defaults */}
      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.8, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-xl"
            >
              <GlassCard className="p-10 md:p-14 rounded-[5rem] border-rose-500/30 shadow-3xl">
                <div className="flex flex-col items-center gap-10">
                  <div className="w-24 h-24 rounded-full bg-rose-500 flex items-center justify-center text-white shadow-2xl relative">
                    <Heart size={40} />
                    <m.div animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-rose-500/30 rounded-full" />
                  </div>
                  
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">{t.thankYouTitle}</h2>
                    <p className="text-sm text-slate-400 italic leading-relaxed px-6">
                      {isZh ? '您的支持将维持实验室算力运行。支付详情如下（默认英文）：' : 'Your support fuels lab processing. Payment details follow (English Default):'}
                    </p>
                  </div>

                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    {/* QR Code Section */}
                    <div className="flex flex-col items-center gap-4 p-6 bg-white/5 border border-white/10 rounded-[3rem]">
                       <div className="p-4 bg-white rounded-[2rem] shadow-2xl">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t.paypalLink)}&color=020617&bgcolor=ffffff`}
                            alt="Payment QR" 
                            className="w-32 h-32 md:w-40 md:h-40"
                          />
                       </div>
                       <div className="flex items-center gap-2 text-rose-400">
                         <QrCode size={14} />
                         <span className="text-[10px] font-black uppercase tracking-widest">SCAN TO PAYPAL</span>
                       </div>
                    </div>

                    {/* Text IDs Section */}
                    <div className="space-y-4">
                      {/* Fixed: Completed truncated array and added .map() for ReactNode compatibility */}
                      {[
                        { id: 'duitnow', label: 'DUITNOW / TNG', value: t.duitNowId },
                        { id: 'paypal', label: 'PayPal', value: t.paypalId }
                      ].map((item) => (
                        <div key={item.id} className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between">
                          <div className="space-y-1">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                            <p className="text-xs font-bold text-white italic">{item.value}</p>
                          </div>
                          <button 
                            onClick={() => handleCopy(item.id, item.value)}
                            className={`p-2 rounded-xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-500 hover:text-white bg-white/5'}`}
                          >
                            {copiedId === item.id ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="w-full pt-4">
                     <a 
                       href={t.paypalLink}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3"
                     >
                       <ExternalLink size={16} /> {isZh ? '前往 PayPal 页面' : 'Go to PayPal Page'}
                     </a>
                  </div>
                  
                  <button onClick={() => setShowDonation(false)} className="text-[10px] font-black uppercase text-slate-600 hover:text-white transition-colors">
                    {t.closeReceipt}
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
