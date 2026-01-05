
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });
  }, []);

  const checkApiKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        // Fallback for non-studio environment
        setHasKey(!!process.env.API_KEY && process.env.API_KEY !== '');
      }
    } catch (e) {
      console.error("Auth: Key check failed", e);
      setHasKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectApiKey = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Assume success to improve UX responsiveness
        setHasKey(true);
        setLocalError(null);
      } catch (e) {
        setLocalError(lang === 'zh' ? "激活失败，请手动打开 AI Studio" : "Activation failed, please open AI Studio manually");
      }
    } else {
      setLocalError(lang === 'zh' ? "环境连接错误，请检查 Gateway 状态。" : "Gateway connection error. Ensure you are in a supported environment.");
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasKey) {
      setLocalError(lang === 'zh' ? "请先点击上方按钮激活 AI 引擎" : "Please activate AI Engine first");
      return;
    }
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      setLocalError(error.message || "Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Logo size={64} animated />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <motion.div animate={{ scale: [1, 1.05, 1] }} className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-white/5 shadow-[0_0_120px_rgba(79,70,229,0.1)]">
          <Logo size={120} animated={hasKey} />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white italic">Somno <span className="text-indigo-400">Lab</span></h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.4em]">{lang === 'en' ? 'Digital Sleep Biometric System' : '数字睡眠生物识别系统'}</p>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-10 border-white/10 bg-slate-950/40 space-y-8 relative z-20">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lock size={12} className={hasKey ? "text-emerald-400" : "text-amber-400"} />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                  {lang === 'zh' ? '实验室 AI 引擎状态' : 'Lab AI Engine Status'}
                </label>
              </div>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                {lang === 'zh' ? '计费说明' : 'Billing'} <ExternalLink size={10} />
              </a>
            </div>

            <button 
              onClick={handleSelectApiKey}
              className={`w-full py-6 rounded-[2.5rem] flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl relative z-30 pointer-events-auto ${
                hasKey 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 cursor-pointer border border-white/10'
              }`}
            >
              <Zap size={18} className={hasKey ? "fill-emerald-400" : "animate-pulse"} />
              {hasKey ? (lang === 'zh' ? '引擎已就绪' : 'Engine Ready') : (lang === 'zh' ? '激活 AI 实验引擎' : 'Activate AI Engine')}
            </button>
            
            {!hasKey && (
              <div className="flex items-start gap-2 px-2 text-[9px] text-amber-400/80 italic font-medium">
                <Info size={12} className="shrink-0" />
                <p>{lang === 'zh' ? '必须先激活引擎，否则分析功能将显示“网关不可用”。' : 'Engine activation required, otherwise AI features will show "Gateway unavailable".'}</p>
              </div>
            )}
          </div>

          <div className="h-[1px] w-full bg-white/5"></div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn || !hasKey} 
              className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl relative z-30 ${!hasKey ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:shadow-indigo-500/20'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
              {lang === 'en' ? 'Sync Health Data' : '同步健康数据 (Fit)'}
            </button>
            
            <button onClick={onGuest} className="w-full py-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer relative z-30">
              {lang === 'en' ? 'Virtual Guest Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {localError && (
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold animate-in slide-in-from-top-2 duration-300">
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </div>
        )}
      </GlassCard>

      <footer className="mt-16 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-8 relative z-10">
        <div className="flex items-center gap-8">
          <button onClick={() => onNavigate?.('privacy')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <Shield size={12} /> Privacy
          </button>
          <button onClick={() => onNavigate?.('terms')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <FileText size={12} /> Terms
          </button>
          <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <Github size={12} /> Source
          </a>
        </div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-400">© 2025 Somno Lab • Secure Health Environment</p>
      </footer>
    </div>
  );
};
