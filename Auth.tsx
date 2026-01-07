
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

// Fix: Use any cast to bypass broken library types for motion props
const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });
  }, []);

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
      {/* 背景装饰 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6 text-center mb-8 relative z-10">
        <m.div 
          animate={{ scale: [1, 1.05, 1] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex p-8 bg-indigo-600/5 rounded-3xl border border-indigo-500/10 shadow-2xl"
        >
          <Logo size={80} animated={true} />
        </m.div>
        <div className="space-y-3">
          <h1 className="text-3xl font-black tracking-tighter text-white italic">
            Somno <span className="text-indigo-400">Lab</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.4em] opacity-60">
            {lang === 'en' ? 'Neural Biometric System' : '数字睡眠神经映射系统'}
          </p>
        </div>
      </m.div>

      <GlassCard className="w-full max-w-sm p-8 border-white/5 bg-slate-900/40 space-y-8 relative z-10 rounded-[4px]">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {lang === 'zh' 
                ? '它融合生理指标监控与 AI 深度洞察，为您开启全方位的数字化睡眠实验。' 
                : 'Integrating physiological monitoring with AI deep insights for your comprehensive digital sleep laboratory.'}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn} 
              className="w-full py-4 rounded-[4px] flex items-center justify-center gap-3 bg-white text-slate-950 font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all shadow-xl"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={18} /> : <Cpu size={18} className="text-indigo-600" />}
              {lang === 'en' ? 'Google Fit' : '连接 Google Fit'}
            </button>
            
            <button 
              onClick={onGuest} 
              className="w-full py-3 bg-white/5 border border-white/5 rounded-[4px] flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black text-[9px] uppercase tracking-widest transition-all"
            >
              {lang === 'en' ? 'Virtual Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {localError && (
          <m.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-rose-500/10 rounded-[4px] border border-rose-500/20 text-rose-300 text-[10px] font-bold"
          >
            <p className="flex gap-2"><TriangleAlert size={14} className="shrink-0" /> {localError}</p>
          </m.div>
        )}
      </GlassCard>

      <footer className="mt-8 flex flex-col items-center gap-3 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate?.('privacy')} className="text-[9px] font-black uppercase tracking-widest text-slate-400">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[9px] font-black uppercase tracking-widest text-slate-400">Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.2em] text-slate-600">© 2026 Somno Lab</p>
      </footer>
    </div>
  );
};
