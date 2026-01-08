
import React, { useState, useEffect } from 'react';
import { Loader2, ArrowRight, Key, Cpu, TriangleAlert, CheckCircle2, Eye, EyeOff, Save, X, Activity, Lock, Database, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { healthConnect } from './services/healthConnectService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEngineActive, setIsEngineActive] = useState(false);
  const [showManualKeyInput, setShowManualKeyInput] = useState(false);
  const [manualKey, setManualKey] = useState(localStorage.getItem('somno_manual_gemini_key') || '');
  const [showKey, setShowKey] = useState(false);

  const t = translations[lang].auth;

  useEffect(() => {
    const checkKey = async () => {
      const storedManualKey = localStorage.getItem('somno_manual_gemini_key');
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineActive(hasKey || !!process.env.API_KEY || !!storedManualKey);
      } else {
        setIsEngineActive(!!process.env.API_KEY || !!storedManualKey);
      }
    };
    checkKey();
  }, []);

  const handleActivateEngine = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio) {
      try {
        await aistudio.openSelectKey();
        setIsEngineActive(true);
      } catch (e) {
        console.error("AI Bridge failed:", e);
      }
    } else {
      setShowManualKeyInput(true);
    }
  };

  const handleSaveManualKey = () => {
    localStorage.setItem('somno_manual_gemini_key', manualKey);
    setIsEngineActive(!!manualKey);
    setShowManualKeyInput(false);
  };

  const handleHealthConnectLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await healthConnect.ensureClientInitialized();
      const token = await healthConnect.authorize(true); 
      if (token) onLogin();
    } catch (error: any) {
      setLocalError(error.message || "Authentication Failed");
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#020617]">
      {/* Neural Background Patterns */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />
      
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-lg space-y-10 text-center relative z-10"
      >
        <div className="relative flex flex-col items-center">
          <m.div 
            animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="w-36 h-36 rounded-full bg-indigo-600/10 border border-indigo-500/10 flex items-center justify-center shadow-[0_0_120px_rgba(79,70,229,0.15)] mb-12"
          >
            <Logo size={90} animated={true} />
          </m.div>
          <div className="space-y-4">
            <h1 className="text-5xl font-black tracking-tighter text-white italic uppercase leading-none">
              SomnoAI <br/>
              <span className="text-indigo-400">Digital Sleep Lab</span>
            </h1>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-[0.7em] opacity-60">
              High-Fidelity Biometric Mapping
            </p>
          </div>
        </div>

        <GlassCard className="p-10 rounded-[5rem] space-y-10 relative border-white/10" intensity={1.1}>
          <AnimatePresence mode="wait">
            {!showManualKeyInput ? (
              <m.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-8">
                <div className="space-y-4">
                   <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                    {t.tagline}
                  </p>
                </div>

                {/* Interactive Status Grid */}
                <div className="grid grid-cols-2 gap-3 pb-2">
                   <m.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate?.('about')}
                      className="p-5 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 transition-all cursor-pointer group"
                   >
                      <Database size={20} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                      <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-slate-400 tracking-widest">Health Connect</span>
                   </m.button>
                   <m.button 
                      whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onNavigate?.('about')}
                      className="p-5 bg-white/5 rounded-[2.5rem] border border-white/5 flex flex-col items-center gap-2 transition-all cursor-pointer group"
                   >
                      <Lock size={20} className="text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                      <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-slate-400 tracking-widest">Secure Bridge</span>
                   </m.button>
                </div>

                <div className={`p-5 rounded-[2rem] flex items-center justify-between transition-colors ${isEngineActive ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-indigo-500/10 border border-indigo-500/20'}`}>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 ml-2">
                    <Key size={14} className={isEngineActive ? 'text-emerald-400' : 'text-indigo-400'} />
                    Neural Core
                  </span>
                  <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 mr-2 ${isEngineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isEngineActive && <CheckCircle2 size={12} />}
                    {isEngineActive ? 'Online' : 'Offline'}
                  </span>
                </div>

                <div className="space-y-4">
                  <button 
                    onClick={handleHealthConnectLogin} 
                    disabled={isLoggingIn} 
                    className="w-full py-6 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-[0.2em] hover:scale-[1.03] transition-all shadow-[0_20px_50px_rgba(255,255,255,0.1)] active:scale-95 disabled:opacity-50"
                  >
                    {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
                    {t.connect}
                  </button>
                  
                  {!isEngineActive && (
                    <button 
                      onClick={handleActivateEngine}
                      className="w-full py-4 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      {t.activateEngine}
                    </button>
                  )}

                  <button 
                    onClick={onGuest} 
                    className="w-full py-4 bg-white/5 border border-white/5 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all"
                  >
                    {t.guest} <ArrowRight size={14} />
                  </button>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-center gap-6 opacity-30">
                   <Activity size={16} />
                   <div className="h-1 w-20 bg-white/10 rounded-full" />
                   <Cpu size={16} />
                </div>
              </m.div>
            ) : (
              <m.div key="keyinput" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-black uppercase text-white tracking-widest flex items-center gap-3">
                    <Key size={14} className="text-indigo-400" />
                    Neural Engine Injection
                  </h3>
                  <button onClick={() => setShowManualKeyInput(false)} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
                </div>
                
                <div className="relative">
                  <input 
                    type={showKey ? 'text' : 'password'}
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="w-full bg-slate-950/60 border border-white/10 rounded-[2rem] px-8 py-5 text-sm font-mono text-indigo-300 outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button 
                  onClick={handleSaveManualKey}
                  className="w-full py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-[0_15px_40px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
                >
                  <Save size={16} className="inline mr-2" /> Save Protocol
                </button>
                
                <p className="text-[10px] text-slate-500 italic px-6">
                  Keys are stored in your browser's local sandbox. <br/> 
                  Obtain an industrial-grade key at <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-indigo-400 hover:underline">Google AI Studio</a>.
                </p>
              </m.div>
            )}
          </AnimatePresence>

          {localError && !showManualKeyInput && (
            <m.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-5 bg-rose-500/10 rounded-3xl border border-rose-500/20 text-rose-300 text-[11px] font-bold"
            >
              <p className="flex justify-center gap-3 italic"><TriangleAlert size={16} className="shrink-0" /> {localError}</p>
            </m.div>
          )}
        </GlassCard>

        <footer className="mt-12 flex flex-col items-center gap-6 opacity-60 hover:opacity-100 transition-all duration-700">
          <div className="flex items-center gap-10">
            <m.button 
              whileHover={{ y: -2 }}
              onClick={() => onNavigate?.('privacy')} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
            >
              {t.privacyPolicy} <ExternalLink size={10} />
            </m.button>
            <m.button 
              whileHover={{ y: -2 }}
              onClick={() => onNavigate?.('terms')} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-2"
            >
              {t.termsOfService} <ExternalLink size={10} />
            </m.button>
          </div>
          <div className="flex items-center gap-3 opacity-30">
             <div className="h-[1px] w-8 bg-slate-800" />
             <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-slate-700">© 2026 SOMNO LAB TERMINAL</p>
             <div className="h-[1px] w-8 bg-slate-800" />
          </div>
        </footer>
      </m.div>
    </div>
  );
};
