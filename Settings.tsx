import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon, Moon, ShieldCheck,
  Terminal, Key, Info, Bell, RefreshCw, Smartphone, Zap, MessageSquare, Send
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { notificationService } from './services/notificationService.ts';
import { notifyAdmin } from './services/telegramService.ts';
import { getSafeHostname } from './services/navigation.ts';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [notifPermission, setNotifPermission] = useState<string>(Notification.permission);

  const t = translations[lang]?.settings || translations.en.settings;

  useEffect(() => {
    const checkAiStatus = async () => {
      if ((window as any).aistudio?.hasSelectedApiKey) {
        try {
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setIsAiActive(hasKey || !!process.env.API_KEY);
        } catch (e) {
          setIsAiActive(!!process.env.API_KEY);
        }
      } else {
        setIsAiActive(!!process.env.API_KEY);
      }
    };
    checkAiStatus();
  }, []);

  const handleTestTelegram = async () => {
    setTestStatus('sending');
    const nodeIdentity = getSafeHostname();
    const success = await notifyAdmin(`🧪 DIAGNOSTIC TEST\nNode: ${nodeIdentity}\nSubject: Admin Console Test\nStatus: Operational`);
    setTestStatus(success ? 'success' : 'error');
    setTimeout(() => setTestStatus('idle'), 3000);
  };

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

  return (
    <div className="space-y-8 pb-48 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <div className="flex flex-col gap-6">
        {/* AI & Notification Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${isAiActive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <Zap size={20} className={isAiActive ? 'animate-pulse' : ''} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Bridge</p>
                <p className="text-sm font-black text-white italic">{isAiActive ? 'ACTIVE' : 'OFFLINE'}</p>
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
                    <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Notifications</p>
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

        {/* Telegram Diagnostic Tool */}
        <GlassCard className="p-8 rounded-[3rem] border-rose-500/20 bg-rose-500/[0.02]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Send size={18} className="text-rose-500" />
              <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">Telegram Comms Diagnostic</h3>
            </div>
            <p className="text-[10px] text-slate-500 italic">Verify the link between your node and the Telegram administrative gateway.</p>
            <button 
              onClick={handleTestTelegram}
              disabled={testStatus === 'sending'}
              className={`w-full py-4 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all ${
                testStatus === 'success' ? 'bg-emerald-600 text-white' : 
                testStatus === 'error' ? 'bg-rose-600 text-white' : 'bg-white/5 text-rose-500 border border-rose-500/30'
              }`}
            >
              {testStatus === 'sending' ? <RefreshCw size={14} className="animate-spin" /> : <Terminal size={14} />}
              {testStatus === 'success' ? 'SIGNAL CONFIRMED' : testStatus === 'error' ? 'LINK FAILED' : 'SEND TEST SIGNAL'}
            </button>
          </div>
        </GlassCard>

        {/* Core Settings */}
        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-12">
            <div className="space-y-4">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                  {['en', 'zh'].map((l) => (
                    <button key={l} onClick={() => onLanguageChange(l as Language)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{l === 'en' ? 'ENGLISH' : '中文简体'}</button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowDonation(true)} className="w-full py-6 rounded-full bg-[#f43f5e]/5 border border-[#f43f5e]/20 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10 hover:bg-[#f43f5e]/10"><Heart size={20} fill="currentColor" /> {t.coffee}</button>
               <button onClick={onLogout} className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20"><DisconnectIcon size={18} /> {t.logout}</button>
            </div>
          </div>
        </GlassCard>
      </div>

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e: React.MouseEvent) => e.stopPropagation()} className="w-full max-w-2xl text-center space-y-10">
              <m.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto"><Heart size={48} fill="white" strokeWidth={0} /></m.div>
              <div className="space-y-4"><h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">CONTRIBUTION<br />ACKNOWLEDGED</h2><p className="text-[13px] text-slate-400 italic max-w-md mx-auto leading-relaxed">Your support fuels lab processing and research development.</p></div>
              <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2 p-8 bg-slate-900/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-sm"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=020617&bgcolor=ffffff`} alt="QR" className="w-36 h-36 md:w-44 md:h-44" /></div>
                   <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2"><QrCode size={14} /> SCAN TO PAYPAL</p>
                </div>
                <div className="md:col-span-3 space-y-4 text-left">
                  {[{ id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388' }, { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim' }].map((item) => (
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-black text-white italic tracking-tight">{item.value}</p>
                      </div>
                      <button onClick={() => handleCopy(item.id, item.value)} className={`p-4 rounded-2xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}><Copy size={20} /></button>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')} className="w-full py-6 rounded-full bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl transition-transform active:scale-95"><ArrowUpRight size={20} /> GO TO PAYPAL PAGE</button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};