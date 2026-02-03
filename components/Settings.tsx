
import React, { useState } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut as DisconnectIcon, ShieldCheck,
  Key, RefreshCw, Zap, Loader2, ChevronRight, Terminal, Server, LifeBuoy
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.tsx';
import { ExitFeedbackModal } from './ExitFeedbackModal.tsx';
import { notifyAdmin } from '../services/telegramService.ts';
import { emailService } from '../services/emailService.ts';

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
  const { isAdmin, profile } = useAuth();
  const [showExitFeedback, setShowExitFeedback] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'transmitting' | 'success' | 'error'>('idle');

  const t = translations[lang]?.settings || translations.en.settings;

  const handleLanguageChange = (newLang: Language) => {
    localStorage.setItem('somno_lang', newLang);
    onLanguageChange(newLang);
  };

  const handleFullCommsDiagnostic = async () => {
    if (testStatus === 'transmitting') return;
    setTestStatus('transmitting');
    
    const payload = {
      type: 'SYSTEM_SIGNAL',
      source: 'ADMIN_DIAGNOSTIC_TERMINAL',
      message: `🧪 FULL COMMS TEST\nSubject: ${profile?.email || 'Unknown'}\nIdentity: ${profile?.full_name || 'N/A'}\nProtocol: Mirroring TG+Email`
    };

    try {
      const [tgRes, emailRes] = await Promise.all([
        notifyAdmin(payload),
        emailService.sendAdminAlert(payload)
      ]);

      if (tgRes && emailRes.success) {
        setTestStatus('success');
      } else {
        setTestStatus('error');
      }
    } catch (e) {
      setTestStatus('error');
    }

    setTimeout(() => setTestStatus('idle'), 4000);
  };

  return (
    <div className="space-y-8 pb-48 max-w-2xl mx-auto px-4 font-sans text-left relative overflow-hidden">
      <ExitFeedbackModal 
        isOpen={showExitFeedback} 
        lang={lang} 
        onConfirmLogout={onLogout} 
      />

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className={`p-6 rounded-[2.5rem] border-white/5 ${isAdmin ? 'opacity-100 bg-amber-500/5 border-amber-500/10' : 'opacity-40 grayscale'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${process.env.API_KEY ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-800 text-slate-600'}`}>
                  <Server size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Admin Global Link</p>
                  <p className="text-sm font-black text-white italic">{process.env.API_KEY ? 'CONNECTED' : 'OFFLINE'}</p>
                </div>
              </div>
              <ShieldCheck size={18} className={process.env.API_KEY ? 'text-amber-500' : 'text-slate-700'} />
            </div>
          </GlassCard>

          <GlassCard className="p-6 rounded-[2.5rem] border-indigo-500/20 bg-indigo-500/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400">
                  <Zap size={20} className="animate-pulse" />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Neural Bridge</p>
                  <p className="text-sm font-black text-white italic">OPERATIONAL</p>
                </div>
              </div>
              <Key size={18} className="text-emerald-500" />
            </div>
          </GlassCard>
        </div>

        {isAdmin && (
          <GlassCard className="p-8 rounded-[3rem] border-rose-500/20 bg-rose-500/[0.02]">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Radio className="text-rose-500 animate-pulse" size={18} />
                <h3 className="text-[11px] font-black uppercase text-white tracking-widest italic">Mirrored Comms Diagnostic</h3>
              </div>
              <p className="text-[10px] text-slate-500 italic leading-relaxed">
                Verify concurrent signal dispatch to both Telegram and Email administrative gateways.
              </p>
              <button 
                onClick={handleFullCommsDiagnostic}
                disabled={testStatus === 'transmitting'}
                className={`w-full py-5 rounded-full font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all italic shadow-xl ${
                  testStatus === 'success' ? 'bg-emerald-600 text-white' : 
                  testStatus === 'error' ? 'bg-rose-600 text-white' : 
                  'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {testStatus === 'transmitting' ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                {testStatus === 'success' ? 'DUAL SIGNAL CONFIRMED' : testStatus === 'error' ? 'MIRRORING FAILURE' : 'INITIATE DUAL TEST'}
              </button>
            </div>
          </GlassCard>
        )}

        <GlassCard onClick={() => onNavigate('support')} className="p-8 rounded-[3rem] border-emerald-500/20 bg-emerald-500/[0.02] cursor-pointer group hover:bg-emerald-500/[0.05] transition-all">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-5">
                <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
                   <LifeBuoy size={24} />
                </div>
                <div className="space-y-1">
                   <h3 className="text-sm font-black italic text-white uppercase tracking-widest">{translations[lang].support.title}</h3>
                   <p className="text-[10px] text-slate-500 font-medium italic">Support, FAQ & Contributions</p>
                </div>
             </div>
             <ChevronRight size={20} className="text-emerald-500/40 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>
        </GlassCard>

        <GlassCard className="p-10 rounded-[4rem] border-white/10 bg-white/[0.01]">
          <div className="space-y-12">
            <div className="space-y-4 text-left">
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2 block">{t.language}</span>
               <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5">
                  {[
                    { code: 'en', label: 'ENGLISH' },
                    { code: 'zh', label: '中文' },
                    { code: 'es', label: 'ESPAÑOL' }
                  ].map((l) => (
                    <button key={l.code} onClick={() => handleLanguageChange(l.code as Language)} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l.code ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>{l.label}</button>
                  ))}
               </div>
            </div>

            <div className="space-y-4 pt-4 border-t border-white/5">
               <button onClick={() => setShowExitFeedback(true)} className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all hover:text-rose-500 hover:border-rose-500/20 shadow-2xl">
                 <DisconnectIcon size={18} /> {t.logout}
               </button>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

const Radio = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
    <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
  </svg>
);
