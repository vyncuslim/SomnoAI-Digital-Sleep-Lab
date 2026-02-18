import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, 
  Bell, RefreshCw, Zap, MessageSquare, Mail, ChevronRight, Check, ShieldCheck, Globe, LifeBuoy, X, Key, Eye, EyeOff,
  Github, Linkedin, Instagram, Facebook, Youtube, Video, UserCircle
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from '../services/notificationService.ts';

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
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);
  
  // API Key State
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('custom_gemini_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [keyCommitStatus, setKeyCommitStatus] = useState<'idle' | 'success'>('idle');

  const t = translations[lang]?.settings || translations.en.settings;

  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setNotifPermission(Notification.permission);
    if (granted) {
      notificationService.sendNotification("SomnoAI Connected", "Neural bridge active. System notifications enabled.");
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCommitKey = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('custom_gemini_key', apiKey.trim());
    setKeyCommitStatus('success');
    setTimeout(() => setKeyCommitStatus('idle'), 2000);
  };

  const socialLinks = [
    { icon: Globe, url: 'https://sleepsomno.com', label: 'Website' },
    { icon: MessageSquare, url: 'https://discord.com/invite/9EXJtRmju', label: 'Discord' },
    { icon: Github, url: 'https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab', label: 'GitHub' },
    { icon: Linkedin, url: 'https://www.linkedin.com/company/somnoai-digital-sleep-lab', label: 'LinkedIn Lab' },
    { icon: UserCircle, url: 'https://www.linkedin.com/in/vyncuslim-lim-761300375', label: 'LinkedIn Founder' },
    { icon: Video, url: 'https://www.tiktok.com/@somnoaidigitalsleeplab', label: 'TikTok' },
    { icon: Instagram, url: 'https://www.instagram.com/somnoaidigitalsleep/', label: 'Instagram' },
    { icon: Facebook, url: 'https://www.facebook.com/people/Somnoai-Digital-Sleep-Lab/61587027632695/', label: 'Facebook' },
    { icon: Youtube, url: 'https://www.youtube.com/channel/UCu0V4CzeSIdagRVrHL116Og', label: 'YouTube' },
  ];

  return (
    <div className="space-y-10 pb-48 max-w-4xl mx-auto px-4 font-sans text-left relative">
      <header className="flex flex-col gap-2 pt-8">
        <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{t.title}</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">System Preferences & Neural Interface Configuration</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* System Status Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                <Zap size={20} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Grid Status</p>
                <p className="text-sm font-black text-white italic">LAB_SYNC_NOMINAL</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[2.5rem] border-white/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${notifPermission === 'granted' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-900 text-slate-600'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Global Alerts</p>
                    <p className="text-sm font-black text-white italic">{notifPermission.toUpperCase()}</p>
                  </div>
                </div>
                {notifPermission !== 'granted' && (
                  <button onClick={handleRequestNotif} className="p-2 text-indigo-400 hover:bg-indigo-500/10 rounded-xl transition-all">
                    <RefreshCw size={16} />
                  </button>
                )}
             </div>
          </GlassCard>
        </div>

        {/* Configuration Matrix */}
        <GlassCard className="p-8 md:p-12 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-16">
            {/* Language Selection */}
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic px-2">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 shadow-inner">
                  {['en', 'zh'].map((l) => (
                    <button 
                      key={l} 
                      onClick={() => onLanguageChange(l as Language)} 
                      className={`flex-1 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {l === 'en' ? 'ENGLISH' : '中文简体'}
                    </button>
                  ))}
               </div>
            </div>

            {/* Neural API Key Section - Exact Design Language Alignment with Auth */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic px-2">{t.apiKeyLabel}</span>
                <p className="text-[9px] text-slate-700 italic px-2">Override default Gemini API credits with your private laboratory key.</p>
              </div>
              
              <form onSubmit={handleCommitKey} className="space-y-6">
                <div className="relative group">
                  <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-400 transition-colors">
                    <Key size={20} />
                  </div>
                  <input 
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={t.apiKeyPlaceholder}
                    className="w-full bg-slate-950 border border-white/5 rounded-full pl-18 pr-20 py-7 text-sm text-white focus:border-indigo-500/50 outline-none transition-all font-black italic shadow-inner placeholder:text-slate-800"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700 hover:text-indigo-400 transition-colors active:scale-90"
                  >
                    {showApiKey ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                
                <button 
                  type="submit"
                  className={`w-full py-6 rounded-full font-black text-[11px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-3 shadow-2xl ${keyCommitStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20 active:scale-95'}`}
                >
                  <AnimatePresence mode="wait">
                    {keyCommitStatus === 'success' ? (
                      <m.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                        <Check size={18} /> SYNC SUCCESS
                      </m.div>
                    ) : (
                      <m.div key="link" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                        <ShieldCheck size={18} /> {t.apiKeyCommit}
                      </m.div>
                    )}
                  </AnimatePresence>
                </button>
              </form>
            </div>

            {/* Network Presence Matrix - 9 Nodes */}
            <div className="space-y-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 italic">{t.socialLabel}</span>
                <span className="text-[8px] font-mono text-slate-800 tracking-widest">MATRIX_V2.0</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-4">
                {socialLinks.map((social) => (
                  <a 
                    key={social.label}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-5 bg-black/40 border border-white/5 rounded-[2rem] flex flex-col items-center gap-3 hover:bg-indigo-600/10 hover:border-indigo-500/30 transition-all group shadow-inner"
                  >
                    <div className="p-2 bg-white/5 rounded-xl text-slate-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/5 transition-all">
                      <social.icon size={20} />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-700 group-hover:text-slate-300 transition-colors text-center">{social.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Support Actions */}
            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowDonation(true)} className="w-full py-7 rounded-full bg-[#f43f5e]/5 border border-[#f43f5e]/20 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/5 hover:bg-[#f43f5e]/10">
                 <Heart size={20} fill="currentColor" /> {t.coffee}
               </button>
               <button onClick={onLogout} className="w-full py-7 rounded-full bg-slate-950 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20">
                 <DisconnectIcon size={18} /> {t.logout}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Donation Modal Logic */}
      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[3000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl overflow-y-auto" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              onClick={(e: React.MouseEvent) => e.stopPropagation()} 
              className="w-full max-w-2xl text-center space-y-12 relative bg-[#01040a] p-10 md:p-16 rounded-[5rem] border border-white/10 shadow-[0_60px_150px_-30px_rgba(0,0,0,1)]"
            >
              <button 
                onClick={() => setShowDonation(false)}
                className="absolute top-10 right-10 p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-600 hover:text-rose-500 transition-all active:scale-90"
              >
                <X size={24} />
              </button>

              <div className="space-y-12">
                <m.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="w-28 h-28 rounded-[2.5rem] bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_80px_rgba(244,63,94,0.4)] mx-auto relative group"
                >
                   <Heart size={50} fill="white" strokeWidth={0} />
                   <div className="absolute inset-0 bg-white/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </m.div>

                <div className="space-y-6">
                   <h2 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
                     CONTRIBUTION<br />
                     <span className="text-indigo-400">ACKNOWLEDGED</span>
                   </h2>
                   <p className="text-sm md:text-base text-slate-500 italic max-w-md mx-auto leading-relaxed font-bold opacity-80">
                     Your support ensures the continued synthesis of neurological restoration protocols.
                   </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-10 items-start">
                  <div className="md:col-span-2 space-y-8 flex flex-col items-center">
                     <div className="p-8 bg-white rounded-[4rem] shadow-[0_40px_80px_rgba(255,255,255,0.05)] ring-8 ring-white/5 overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=000000&bgcolor=ffffff&margin=4&ecc=M`} 
                          alt="Lab Ingress" 
                          className="w-40 h-40 md:w-52 md:h-52 [image-rendering:pixelated]" 
                        />
                     </div>
                     <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.5em] flex items-center gap-3 italic">
                       <QrCode size={16} /> SCAN TO PAYPAL
                     </p>
                  </div>

                  <div className="md:col-span-3 space-y-5 text-left">
                    {[
                      { id: 'duitnow', label: 'TNG / DUITNOW', value: '+60 187807388' }, 
                      { id: 'paypal', label: 'PAYPAL DISPATCH', value: 'vyncuslim@icloud.com' }
                    ].map((item) => (
                      <div key={item.id} className="p-8 bg-slate-900 border border-white/5 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/40 transition-all shadow-inner">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{item.label}</p>
                          <p className="text-base font-black text-white italic tracking-tight truncate max-w-[190px]">{item.value}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(item.id, item.value)} 
                          className={`p-4 rounded-2xl transition-all active:scale-90 ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-700 hover:text-white bg-black/40'}`}
                        >
                           {copiedId === item.id ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};