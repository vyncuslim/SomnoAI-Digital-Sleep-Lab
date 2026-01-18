
import React, { useState, useEffect } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, X, CheckCircle2, Eye, EyeOff, Save, 
  HeartHandshake, Globe, Lock, Loader2, CreditCard, 
  Heart, Copy, QrCode, Languages, UserCircle, Settings as SettingsIcon, Brain, ShieldAlert
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { ThemeMode, AccentColor } from './types.ts';
import { motion, AnimatePresence } from 'framer-motion';
// Fixed: Removed non-existent member updateUserPassword from the import
import { adminApi } from './services/supabaseService.ts';
import { supabase } from './lib/supabaseClient.ts';

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
  isRecoveringPassword?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, 
  onNavigate, isRecoveringPassword = false
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = translations[lang].settings;
  const isZh = lang === 'zh';

  useEffect(() => {
    const checkState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fixed: checkAdminStatus is now added to adminApi and exported correctly
        const adminStatus = await adminApi.checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      }
    };
    checkState();
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12 pb-32 max-w-2xl mx-auto px-4">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">{isZh ? '系统配置' : 'System Config'}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">NEURAL INFRASTRUCTURE</p>
      </header>

      <button 
        onClick={() => setShowDonation(true)}
        className="w-full py-6 rounded-[2rem] bg-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
      >
        <HeartHandshake size={20} /> {t.coffee}
      </button>

      <button onClick={onLogout} className="w-full py-4 text-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-rose-400 transition-all flex items-center justify-center gap-3 italic">
        <LogOut size={16} /> {t.logout}
      </button>

      {isAdmin && (
        <button onClick={() => onNavigate('admin')} className="w-full py-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-full font-black text-[10px] uppercase tracking-widest mt-4">
          Command Deck
        </button>
      )}

      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <div className="flex flex-col items-center gap-10">
                <m.div 
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.4)]"
                >
                  <Heart size={48} fill="white" strokeWidth={0} />
                </m.div>
                
                <div className="text-center space-y-4">
                  <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-[0.9]">
                    CONTRIBUTION<br />ACKNOWLEDGED
                  </h2>
                  <p className="text-[13px] text-slate-400 italic max-sm-mx-auto leading-relaxed">
                    Your support fuels lab processing. Payment details follow (English Default):
                  </p>
                </div>

                <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-6 items-start">
                  <div className="md:col-span-2 p-8 bg-[#0f172a]/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6 shadow-inner">
                     <div className="bg-white p-5 rounded-[2rem] shadow-2xl">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(t.paypalLink)}&color=020617&bgcolor=ffffff`}
                          alt="QR" className="w-36 h-36 md:w-44 md:h-44"
                        />
                     </div>
                     <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2">
                        <QrCode size={14} /> SCAN TO PAYPAL
                     </p>
                  </div>

                  <div className="md:col-span-3 space-y-4">
                    {[
                      { id: 'duitnow', label: 'DUITNOW / TNG', value: t.duitNowId },
                      { id: 'paypal', label: 'PAYPAL', value: t.paypalId }
                    ].map((item) => (
                      <div key={item.id} className="p-6 bg-[#0f172a]/50 border border-white/5 rounded-[2rem] flex items-center justify-between group hover:border-[#4f46e5]/30 transition-all">
                        <div className="space-y-1">
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                          <p className="text-base font-black text-white italic tracking-tight">{item.value}</p>
                        </div>
                        <button 
                          onClick={() => handleCopy(item.id, item.value)}
                          className={`p-3 rounded-xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                        >
                          <Copy size={20} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => window.open(t.paypalLink, '_blank')}
                  className="w-full py-6 rounded-full bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
                >
                  <ExternalLink size={20} /> GO TO PAYPAL PAGE
                </button>

                <button onClick={() => setShowDonation(false)} className="text-[10px] font-black uppercase text-slate-700 hover:text-slate-400 transition-colors tracking-widest">
                  ABORT VIEWING
                </button>
              </div>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
