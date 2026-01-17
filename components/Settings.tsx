import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  LogOut, ExternalLink, Key, CheckCircle2, Eye, EyeOff, Save, 
  HeartHandshake, Languages, Cpu, Loader2, CreditCard, 
  Heart, Copy, QrCode, Layers, Info, Trash2, ShieldAlert
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { ThemeMode, AccentColor } from '../types.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { adminApi } from '../services/supabaseService.ts';
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
  isRecoveringPassword?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, onLanguageChange, onLogout, 
  onNavigate, threeDEnabled, onThreeDChange
}) => {
  const [showDonation, setShowDonation] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // Gemini Engine State
  const [manualKey, setManualKey] = useState(() => localStorage.getItem('somno_manual_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);
  const [engineActive, setEngineActive] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success'>('idle');

  const t = translations[lang].settings;
  const isZh = lang === 'zh';

  useEffect(() => {
    const checkState = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const adminStatus = await adminApi.checkAdminStatus(session.user.id);
        setIsAdmin(adminStatus);
      }
      
      const storedKey = localStorage.getItem('somno_manual_gemini_key');
      const hasAiStudioKey = (window as any).aistudio ? await (window as any).aistudio.hasSelectedApiKey() : false;
      setEngineActive(!!process.env.API_KEY || !!storedKey || hasAiStudioKey);
    };
    checkState();
    
    // Periodically poll for AI Studio status or key updates
    const timer = setInterval(checkState, 3000);
    return () => clearInterval(timer);
  }, [saveStatus]);

  const handleSaveKey = () => {
    setSaveStatus('saving');
    setTimeout(() => {
      if (manualKey.trim()) {
        localStorage.setItem('somno_manual_gemini_key', manualKey.trim());
      } else {
        localStorage.removeItem('somno_manual_gemini_key');
      }
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 800);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAuthAI = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 1000);
      } catch (e) {
        console.error("AI Studio Key selection aborted.");
      }
    }
  };

  return (
    <div className="space-y-8 pb-32 max-w-2xl mx-auto px-4 font-sans">
      <header className="text-center space-y-2 mb-10">
        <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">{isZh ? '系统配置' : 'System Config'}</h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">NEURAL INFRASTRUCTURE</p>
      </header>

      {/* Gemini Core Engine Control */}
      <GlassCard className="p-8 md:p-10 rounded-[3.5rem] border-white/10 bg-white/[0.01]">
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl border ${engineActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-slate-900 border-white/5 text-slate-700'}`}>
                <Cpu size={24} />
              </div>
              <div>
                <h2 className="text-lg font-black italic text-white uppercase tracking-tight">Gemini Core Engine</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className={`w-1.5 h-1.5 rounded-full ${engineActive ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]' : 'bg-rose-600 shadow-[0_0_8px_#e11d48]'}`} />
                  <span className={`text-[9px] font-black uppercase tracking-widest ${engineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {engineActive ? 'CONNECTED' : 'DISCONNECTED'}
                  </span>
                </div>
              </div>
            </div>
            { (window as any).aistudio && (
              <button 
                onClick={handleAuthAI}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all shadow-lg"
              >
                AUTH AI
              </button>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2 text-slate-500">
                 <CreditCard size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">GCP Billing Awareness</span>
              </div>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">
                Billing Info <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative group">
              <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500 transition-colors">
                <Key size={18} />
              </div>
              <input 
                type={showKey ? "text" : "password"}
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste API Key here..."
                className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-16 pr-32 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/40 transition-all placeholder:text-slate-900"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button 
                  onClick={() => setShowKey(!showKey)}
                  className="p-3 bg-white/5 rounded-xl text-slate-600 hover:text-white transition-all"
                >
                  {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                <button 
                  onClick={handleSaveKey}
                  disabled={saveStatus === 'saving'}
                  className={`p-3 rounded-xl transition-all ${saveStatus === 'success' ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white border border-indigo-500/20'}`}
                >
                  {saveStatus === 'saving' ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                </button>
              </div>
            </div>
            <p className="text-[9px] text-slate-600 italic px-4 leading-relaxed uppercase tracking-widest">
              System priority: <span className="text-slate-400 font-bold">Process ENV</span> > <span className="text-slate-400 font-bold">Manual Injection</span>
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Language & Visual Settings */}
      <GlassCard className="p-8 rounded-[3.5rem] border-white/5 bg-white/[0.01]">
        <div className="space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Languages size={18} className="text-indigo-400" />
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{t.language}</h2>
            </div>
            <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 relative overflow-hidden">
               <button 
                onClick={() => onLanguageChange('en')}
                className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 transition-all ${lang === 'en' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
               >
                 ENGLISH
               </button>
               <button 
                onClick={() => onLanguageChange('zh')}
                className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest relative z-10 transition-all ${lang === 'zh' ? 'text-white' : 'text-slate-600 hover:text-slate-400'}`}
               >
                 中文简体
               </button>
               <m.div 
                animate={{ x: lang === 'zh' ? '100%' : '0%' }}
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-3px)] bg-indigo-600 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)]"
               />
            </div>
          </div>

          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-indigo-400" />
                <p className="text-sm font-bold text-white italic">3D Neural Mapping</p>
              </div>
              <p className="text-[10px] text-slate-500 font-medium italic">Enables spatial rendering and glow effects.</p>
            </div>
            <button 
              onClick={() => onThreeDChange(!threeDEnabled)}
              className={`w-12 h-7 rounded-full border border-white/10 flex items-center px-1 bg-black/40 relative overflow-hidden transition-all duration-500 ${threeDEnabled ? 'border-indigo-500/40 shadow-[0_0_12px_rgba(79,70,229,0.3)]' : ''}`}
            >
              <m.div 
                animate={{ x: threeDEnabled ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                className={`w-5 h-5 rounded-full relative z-10 ${threeDEnabled ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,1)]' : 'bg-slate-700'}`}
              />
              {threeDEnabled && <m.div initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} className="absolute inset-0 bg-indigo-500" />}
            </button>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button 
          onClick={() => setShowDonation(true)}
          className="w-full py-6 rounded-[2.5rem] bg-[#4f46e5] text-white font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
        >
          <HeartHandshake size={20} /> {t.coffee}
        </button>

        <button onClick={onLogout} className="w-full py-6 bg-slate-900 border border-white/5 rounded-[2.5rem] text-slate-800 font-black text-[10px] uppercase tracking-widest hover:text-rose-400 transition-all flex items-center justify-center gap-3 italic">
          <LogOut size={16} /> {t.logout}
        </button>
      </div>

      {isAdmin && (
        <button onClick={() => onNavigate('admin')} className="w-full py-5 bg-rose-600/10 border border-rose-600/30 text-rose-500 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-xl mt-4 active:scale-95 transition-all flex items-center justify-center gap-3">
          <ShieldAlert size={18} /> COMMAND DECK ACCESS
        </button>
      )}

      {/* Donation Modal */}
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
                  <p className="text-[13px] text-slate-400 italic max-w-sm mx-auto leading-relaxed">
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