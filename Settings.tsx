
import React, { useState } from 'react';
import { GlassCard } from './components/GlassCard.tsx';
import { 
  LogOut, Key, CheckCircle2, Eye, EyeOff, 
  Heart, Copy, QrCode, ArrowUpRight, LogOut as DisconnectIcon
} from 'lucide-react';
import { Language, translations } from './services/i18n.ts';
import { motion, AnimatePresence } from 'framer-motion';

const m = motion as any;

interface SettingsProps {
  lang: Language;
  onLanguageChange: (l: Language) => void;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  threeDEnabled: boolean;
  onThreeDChange: (enabled: boolean) => void;
  // 补充 App.tsx 传递但之前未定义的属性，防止运行时警告
  theme?: string;
  onThemeChange?: (t: any) => void;
  accentColor?: string;
  onAccentChange?: (c: any) => void;
  staticMode?: boolean;
  onStaticModeChange?: (e: boolean) => void;
  lastSyncTime?: string | null;
  onManualSync?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, 
  threeDEnabled, onThreeDChange
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const t = translations[lang]?.settings || translations.en.settings;

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto px-4 font-sans text-left">
      {/* 顶部标题栏 */}
      <div className="bg-[#0a0f25] border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-400">
            <Key size={20} />
          </div>
          <div>
             <h2 className="text-sm font-black italic text-white uppercase tracking-wider">GEMINI CORE ENGINE</h2>
             <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
               {process.env.API_KEY ? 'CONNECTED' : 'DISCONNECTED'}
             </p>
          </div>
        </div>
        <button className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
          AUTH AI
        </button>
      </div>

      <GlassCard className="p-8 md:p-10 rounded-[3rem] border-white/10 bg-white/[0.01]">
        <div className="space-y-10">
          {/* GCP Billing Awareness */}
          <div className="space-y-4">
             <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">GCP BILLING AWARENESS</span>
                <button 
                  onClick={() => window.open('https://ai.google.dev/gemini-api/docs/billing', '_blank')}
                  className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-indigo-400/30"
                >
                  Billing info <ArrowUpRight size={10} />
                </button>
             </div>
             <div className="relative group">
                <input 
                  type={showKey ? "text" : "password"} 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste API Key here..."
                  className="w-full bg-slate-950/60 border border-white/5 rounded-full px-8 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-800 font-bold italic"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-4 text-slate-700">
                   <button onClick={() => setShowKey(!showKey)} className="hover:text-indigo-400 transition-colors">
                     {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                   </button>
                   <button className="hover:text-indigo-400 transition-colors">
                     <CheckCircle2 size={18} />
                   </button>
                   <button onClick={() => handleCopy('key', apiKey)} className="hover:text-indigo-400 transition-colors">
                     <Copy size={18} />
                   </button>
                </div>
             </div>
          </div>

          {/* 语言选择 */}
          <div className="space-y-4">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic px-2">{t.language}</span>
             <div className="flex bg-black/40 p-1 rounded-full border border-white/5">
                {['en', 'zh'].map((l) => (
                  <button 
                    key={l}
                    onClick={() => onLanguageChange(l as Language)}
                    className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l === 'en' ? 'ENGLISH' : '中文简体'}
                  </button>
                ))}
             </div>
          </div>

          {/* 功能按钮组 */}
          <div className="space-y-4">
             <button 
                onClick={() => setShowDonation(true)}
                className="w-full py-6 rounded-full bg-[#f43f5e]/10 border border-[#f43f5e]/30 text-[#f43f5e] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl shadow-rose-950/10"
             >
                <Heart size={20} fill="currentColor" /> {t.coffee}
             </button>

             <button 
                onClick={onLogout}
                className="w-full py-6 rounded-full bg-slate-900 border border-white/5 text-slate-500 font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 active:scale-95 transition-all"
             >
                <DisconnectIcon size={18} /> {t.logout}
             </button>
          </div>
        </div>
      </GlassCard>

      {/* 贡献确认模态框 */}
      <AnimatePresence>
        {showDonation && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#020617]/95 backdrop-blur-3xl" onClick={() => setShowDonation(false)}>
            <m.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              className="w-full max-w-2xl text-center space-y-10"
            >
              <m.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }}
                className="w-24 h-24 rounded-full bg-[#f43f5e] flex items-center justify-center text-white shadow-[0_0_50px_rgba(244,63,94,0.5)] mx-auto"
              >
                <Heart size={48} fill="white" strokeWidth={0} />
              </m.div>
              
              <div className="space-y-4">
                <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter leading-none">
                  CONTRIBUTION<br />ACKNOWLEDGED
                </h2>
                <p className="text-[13px] text-slate-400 italic max-w-md mx-auto leading-relaxed">
                  Your support fuels lab processing. Payment details follow (English Default):
                </p>
              </div>

              <div className="w-full grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
                <div className="md:col-span-2 p-8 bg-slate-900/80 border border-white/5 rounded-[3rem] flex flex-col items-center gap-6">
                   <div className="bg-white p-5 rounded-[2.5rem] shadow-2xl">
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://paypal.me/vyncuslim')}&color=020617&bgcolor=ffffff`}
                        alt="QR" className="w-36 h-36 md:w-44 md:h-44"
                      />
                   </div>
                   <p className="text-[10px] font-black text-[#f43f5e] uppercase tracking-[0.3em] flex items-center gap-2">
                      <QrCode size={14} /> SCAN TO PAYPAL
                   </p>
                </div>

                <div className="md:col-span-3 space-y-4">
                  {[
                    { id: 'duitnow', label: 'DUITNOW / TNG', value: '+60 187807388' },
                    { id: 'paypal', label: 'PAYPAL', value: 'Vyncuslim vyncuslim' }
                  ].map((item) => (
                    <div key={item.id} className="p-6 bg-slate-900/50 border border-white/5 rounded-[2.2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all text-left">
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                        <p className="text-base font-black text-white italic tracking-tight">{item.value}</p>
                      </div>
                      <button 
                        onClick={() => handleCopy(item.id, item.value)}
                        className={`p-4 rounded-2xl transition-all ${copiedId === item.id ? 'text-emerald-400 bg-emerald-400/10' : 'text-slate-600 hover:text-white bg-white/5'}`}
                      >
                        <Copy size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => window.open('https://paypal.me/vyncuslim', '_blank')}
                className="w-full py-6 rounded-full bg-[#4f46e5] text-white font-black text-sm uppercase tracking-[0.4em] flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-transform"
              >
                <ArrowUpRight size={20} /> GO TO PAYPAL PAGE
              </button>

              <button onClick={() => setShowDonation(false)} className="text-[10px] font-black uppercase text-slate-700 hover:text-slate-400 transition-colors tracking-widest">
                ABORT VIEWING
              </button>
            </m.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
