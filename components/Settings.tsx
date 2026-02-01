
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, Key, Info, Bell, RefreshCw, Smartphone, Zap, MessageSquare, Send, KeyRound,
  Loader2, Info as AboutIcon, ChevronRight, Lock, ShieldAlert, CheckCircle2, Mail
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService.ts';
import { notifyAdmin } from '../services/telegramService.ts';
import { emailService } from '../services/emailService.ts';
import { getSafeHostname, safeReload } from '../services/navigation.ts';
import { authApi, supabase, logAuditLog } from '../services/supabaseService.ts';

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
  const [showDonation, setShowDonation] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState(false);
  const [customKey, setCustomKey] = useState(localStorage.getItem('custom_gemini_key') || '');
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkAiStatus = async () => {
      const active = !!localStorage.getItem('custom_gemini_key') || !!process.env.API_KEY;
      setIsAiActive(active);
    };
    checkAiStatus();
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem('somno_lang', newLang);
    onLanguageChange(newLang);
  };

  const handleTestEmail = async () => {
    setEmailStatus('sending');
    try {
      const { data: { user } } = await (supabase.auth as any).getUser();
      if (!user?.email) throw new Error("IDENT_VOID");
      
      const res = await emailService.sendSystemEmail(
        user.email,
        "SomnoAI SMTP Diagnostic Pulse",
        `<h3>Protocol Confirmation</h3><p>This is a diagnostic signal from your laboratory node <b>${getSafeHostname()}</b>.</p><p>SMTP status: <b>OPERATIONAL</b></p>`
      );
      
      setEmailStatus(res.success ? 'success' : 'error');
    } catch (e) {
      setEmailStatus('error');
    }
    setTimeout(() => setEmailStatus('idle'), 4000);
  };

  const handleTestTelegram = async () => {
    setTestStatus('sending');
    const nodeIdentity = getSafeHostname();
    try {
      const success = await notifyAdmin({
        type: 'DIAGNOSTIC_PULSE',
        message: `Signal confirmed from node ${nodeIdentity}. Protocol: Operational.`
      }, lang);
      setTestStatus(success ? 'success' : 'error');
    } catch (e) {
      setTestStatus('error');
    }
    setTimeout(() => setTestStatus('idle'), 4000);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-48 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isAiActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  <Zap size={20} className={isAiActive ? 'animate-pulse' : ''} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Bridge</p>
                  <p className="text-sm font-black text-white italic">{isAiActive ? 'ACTIVE' : 'OFFLINE'}</p>
                </div>
              </div>
              <ShieldCheck size={18} className={isAiActive ? 'text-emerald-500' : 'text-slate-700'} />
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[2.5rem] border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${notifPermission === 'granted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-600'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Notifications</p>
                    <p className="text-sm font-black text-white italic">{notifPermission.toUpperCase()}</p>
                  </div>
                </div>
             </div>
          </GlassCard>
        </div>

        {/* Diagnostic Tools Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Telegram Tool */}
           <GlassCard className="p-8 rounded-[3rem] border-emerald-500/20 bg-emerald-500/[0.02]">
             <div className="space-y-6">
               <div className="flex items-center gap-3">
                 <Send size={18} className="text-emerald-500" />
                 <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">Telegram Comms</h3>
               </div>
               <button 
                 onClick={handleTestTelegram}
                 disabled={testStatus === 'sending'}
                 className={`w-full py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                   testStatus === 'success' ? 'bg-emerald-600 text-white' : 
                   testStatus === 'error' ? 'bg-rose-600 text-white' : 
                   'bg-white/5 text-emerald-500 border border-emerald-500/30 hover:bg-emerald-500/5 shadow-xl'
                 }`}
               >
                 {testStatus === 'sending' ? <RefreshCw size={16} className="animate-spin" /> : <Terminal size={16} />}
                 {testStatus === 'success' ? 'SIGNAL CONFIRMED' : 'TEST TELEGRAM'}
               </button>
             </div>
           </GlassCard>

           {/* Email Tool */}
           <GlassCard className="p-8 rounded-[3rem] border-blue-500/20 bg-blue-500/[0.02]">
             <div className="space-y-6">
               <div className="flex items-center gap-3">
                 <Mail size={18} className="text-blue-400" />
                 <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">SMTP Comms</h3>
               </div>
               <button 
                 onClick={handleTestEmail}
                 disabled={emailStatus === 'sending'}
                 className={`w-full py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] ${
                   emailStatus === 'success' ? 'bg-blue-600 text-white' : 
                   emailStatus === 'error' ? 'bg-rose-600 text-white' : 
                   'bg-white/5 text-blue-400 border border-blue-500/30 hover:bg-blue-500/5 shadow-xl'
                 }`}
               >
                 {emailStatus === 'sending' ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                 {emailStatus === 'success' ? 'EMAIL DISPATCHED' : 'TEST SMTP'}
               </button>
             </div>
           </GlassCard>
        </div>

        {/* API Bridge Section */}
        <GlassCard className="p-8 rounded-[3rem] border-indigo-500/20 bg-indigo-500/[0.02]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Key size={18} className="text-indigo-400" />
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">{t.apiKey}</h3>
            </div>
            <div className="flex gap-3">
              <input 
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder={t.apiKeyPlaceholder}
                className="flex-1 bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-indigo-500/40 transition-all font-mono"
              />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-12">
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2 block text-left">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                  {[
                    { code: 'en', label: 'ENGLISH' },
                    { code: 'zh', label: '中文' },
                    { code: 'es', label: 'ESPAÑOL' }
                  ].map((l) => (
                    <button 
                      key={l.code} 
                      onClick={() => handleLanguageChange(l.code as Language)} 
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l.code ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {l.label}
                    </button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowDonation(true)} className="w-full py-6 rounded-full bg-[#f43f5e]/5 border border-[#f43f5e]/20 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10 hover:bg-[#f43f5e]/10"><Heart size={20} fill="currentColor" /> {t.coffee}</button>
               <button onClick={onLogout} disabled={isDisconnecting} className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20 shadow-2xl">
                 {isDisconnecting ? <Loader2 size={18} className="animate-spin" /> : <DisconnectIcon size={18} />} 
                 {isDisconnecting ? 'DISCONNECTING...' : t.logout}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-2xl text-center space-y-10">
              <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto"><Heart size={48} fill="white" strokeWidth={0} /></m.div>
              <div className="space-y-4 text-center"><h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">CONTRIBUTION<br />ACKNOWLEDGED</h2></div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
