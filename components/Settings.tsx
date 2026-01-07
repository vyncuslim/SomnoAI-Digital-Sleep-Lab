
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, X, CheckCircle2, Eye, EyeOff, Save, HeartHandshake, Shield, FileText, Copy, Smartphone, Scan
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ThemeMode, AccentColor } from '../types.ts';
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
  lang, onLogout
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [isEngineLinked, setIsEngineLinked] = useState(false);
  const [manualKey, setManualKey] = useState(localStorage.getItem('somno_manual_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState(false);
  const [copyStatus, setCopyStatus] = useState<'none' | 'paypal' | 'duitnow'>('none');

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

  const handleCopy = (text: string, type: 'paypal' | 'duitnow') => {
    navigator.clipboard.writeText(text);
    setCopyStatus(type);
    setTimeout(() => setCopyStatus('none'), 2000);
  };

  return (
    <div className="space-y-12 pb-32 animate-in fade-in duration-700">
      <header className="px-4 text-center space-y-2">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">Lab Configuration</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Biometric System Override</p>
      </header>

      <GlassCard className="p-10 rounded-[5rem] space-y-10">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Key size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black italic text-white uppercase tracking-tight">AI Security</h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{isEngineLinked ? 'Link Active' : 'Disconnected'}</p>
              </div>
            </div>
            <button 
              onClick={handleLinkEngine}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105"
            >
              Auth AI
            </button>
          </div>

          <div className="space-y-4 pt-8 border-t border-white/5">
            <div className="flex justify-between items-center px-4">
              <label className="text-[10px] font-black uppercase text-slate-500">Manual Key Injection</label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-bold text-indigo-400 hover:underline">Get Key</a>
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

        <div className="space-y-4">
          <button 
            onClick={() => setShowDonation(true)}
            className="w-full py-5 rounded-full bg-rose-600/10 border border-rose-500/30 text-rose-400 font-black text-[11px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-xl shadow-rose-950/20"
          >
            <HeartHandshake size={18} className="inline mr-3" /> Support Research
          </button>
          
          <button 
            onClick={onLogout}
            className="w-full py-5 rounded-full bg-white/5 border border-white/10 text-slate-500 font-black text-[11px] uppercase tracking-widest hover:text-rose-400 transition-all"
          >
            Terminal Shutdown
          </button>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-4 px-8">
        <a href="/privacy.html" target="_blank" className="flex items-center justify-between p-6 bg-white/5 rounded-full text-slate-500 hover:text-indigo-400 transition-all">
          <span className="text-[10px] font-black uppercase flex items-center gap-3"><Shield size={16} /> Privacy Policy</span>
          <ExternalLink size={16} />
        </a>
        <a href="/terms.html" target="_blank" className="flex items-center justify-between p-6 bg-white/5 rounded-full text-slate-500 hover:text-indigo-400 transition-all">
          <span className="text-[10px] font-black uppercase flex items-center gap-3"><FileText size={16} /> Terms of Service</span>
          <ExternalLink size={16} />
        </a>
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
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.4em]">Laboratory Maintenance</p>
                  </div>

                  {/* Enhanced QR Portal */}
                  <div className="relative py-4 flex flex-col items-center">
                    <div className="relative p-6 bg-white rounded-[3.5rem] shadow-[0_0_60px_rgba(236,72,153,0.25)] group">
                      <m.div 
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-0 border-2 border-rose-500/30 rounded-[3.5rem] -m-2 pointer-events-none"
                      />
                      <img 
                        src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://paypal.me/vyncuslim&bgcolor=ffffff&color=020617&qzone=2" 
                        alt="PayPal QR Portal" 
                        className="w-48 h-48 rounded-[2rem] relative z-10 mix-blend-multiply"
                      />
                      {/* Laser Line */}
                      <m.div 
                        animate={{ top: ['0%', '100%'] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-[1.5px] bg-rose-500 shadow-[0_0_12px_rgba(236,72,153,0.8)] z-20 opacity-60"
                      />
                    </div>
                    <div className="mt-6 flex items-center gap-2 px-4 py-2 bg-rose-500/10 rounded-full border border-rose-500/20">
                      <Scan size={12} className="text-rose-400" />
                      <span className="text-[9px] font-black text-rose-300 uppercase tracking-widest">Scan to Support</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleCopy('vyncuslim', 'paypal')}
                      className={`w-full py-4 px-6 rounded-full border transition-all flex items-center justify-between ${copyStatus === 'paypal' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:border-rose-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={14} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">PayPal</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-50">vyncuslim</span>
                        {copyStatus === 'paypal' ? <CheckCircle2 size={14} /> : <Copy size={12} />}
                      </div>
                    </button>

                    <button 
                      onClick={() => handleCopy('+60 187807388', 'duitnow')}
                      className={`w-full py-4 px-6 rounded-full border transition-all flex items-center justify-between ${copyStatus === 'duitnow' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-300 hover:border-rose-400'}`}
                    >
                      <div className="flex items-center gap-3">
                        <Smartphone size={14} className="text-rose-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest">DuitNow</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono opacity-50">+60 18***7388</span>
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
