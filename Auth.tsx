
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isEngineActive, setIsEngineActive] = useState(false);

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(() => {});
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsEngineActive(hasKey || !!process.env.API_KEY);
      }
    };
    checkKey();
  }, []);

  const handleActivateEngine = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setIsEngineActive(true);
    }
  };

  const handleGoogleLogin = async () => {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden rounded-[4px]">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6 text-center mb-8 relative z-10">
        <m.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 6, repeat: Infinity }} className="inline-flex p-8 bg-indigo-600/5 rounded-3xl border border-indigo-500/10 shadow-2xl">
          <Logo size={80} animated={true} />
        </m.div>
        <div className="space-y-3">
          <h1 className="text-2xl font-black tracking-tighter text-white italic uppercase">
            SomnoAI <span className="text-indigo-400">Digital Sleep Lab</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] opacity-60">
            {lang === 'en' ? 'Neural Biometric Mapping' : '数字睡眠神经映射系统'}
          </p>
        </div>
      </m.div>

      <GlassCard className="w-full max-w-sm p-8 border-white/5 bg-slate-900/40 space-y-8 relative z-10 rounded-[4px]">
        <div className="space-y-6">
          <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Key size={12} className="text-indigo-400" /> AI 引擎状态
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest ${isEngineActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isEngineActive ? '已就绪' : '离线'}
              </span>
            </div>
            {!isEngineActive && (
              <button onClick={handleActivateEngine} className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[4px] font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-95">
                点击配置 API 密钥
              </button>
            )}
            <p className="text-[8px] text-slate-500 italic leading-relaxed">
              * 功能需要配置付费 API Key。点击上方按钮通过对话框选择您的密钥项目。
            </p>
          </div>

          <div className="space-y-3">
            <button onClick={handleGoogleLogin} disabled={isLoggingIn} className="w-full py-4 rounded-[4px] flex items-center justify-center gap-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl">
              {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <Cpu size={18} className="text-indigo-600" />}
              {lang === 'en' ? 'Connect Google Fit' : '连接 Google Fit'}
            </button>
            <button onClick={onGuest} className="w-full py-3 bg-white/5 border border-white/5 rounded-[4px] flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black text-[9px] uppercase tracking-widest transition-all">
              {lang === 'en' ? 'Virtual Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {localError && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 bg-rose-500/10 rounded-[4px] border border-rose-500/20 text-rose-300 text-[10px] font-bold">
            <p className="flex gap-2"><TriangleAlert size={14} className="shrink-0" /> {localError}</p>
          </m.div>
        )}
      </GlassCard>

      <footer className="mt-8 flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <a href="/privacy.html" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">Privacy</a>
          <a href="/terms.html" className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">Terms</a>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-slate-600">© 2026 SomnoAI Digital Sleep Lab</p>
      </footer>
    </div>
  );
};
