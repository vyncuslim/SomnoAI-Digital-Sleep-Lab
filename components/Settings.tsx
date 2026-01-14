
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, X, CheckCircle2, Eye, EyeOff, Save, 
  HeartHandshake, Shield, FileText, Copy, Smartphone, Scan, 
  Globe, Zap, RefreshCw, Palette, Box, Info, ShieldCheck, Activity, Terminal, Lock, Loader2, CreditCard, ChevronRight
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
  const [isSyncing, setIsSyncing] = useState(false);

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
        setIsAdmin(true); // Sandbox users can explore admin mock views
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

      {/* Admin Entry - Laboratory Command */}
      {(isAdmin || isSandbox) && (
        <GlassCard 
          onClick={() => onNavigate('admin')}
          className="p-8 rounded-[4rem] border-rose-500/20 bg-rose-500/[0.03] cursor-pointer group"
          hoverScale={true}
        >
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-[0_0_20px_rgba(225,29,72,0.2)]">
                <Terminal size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Laboratory Command</h2>
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">{isSandbox ? 'Sandbox Simulation' : 'Level 0 Clearance Active'}</p>
              </div>
            </div>
            <ChevronRight size={24} className="text-rose-500 opacity-50 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </div>
        </GlassCard>
      )}

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
            onClick={() => setShowDonation(true)}
            className="w-full py-5 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
          >
            <HeartHandshake size={18} className="inline mr-3" /> {t.coffee}
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-rose-400 transition-all"
          >
            <LogOut size={16} className="inline mr-3" /> {t.logout}
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
