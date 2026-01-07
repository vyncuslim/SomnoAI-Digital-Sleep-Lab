
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';
import { Logo } from './Logo.tsx';
import { Language } from '../services/i18n.ts';

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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <m.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)]"
        >
          <Logo size={100} animated={true} />
        </m.div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-white italic">
            Somno <span className="text-indigo-400">Lab</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">
            {lang === 'en' ? 'Digital Sleep Biometric System' : '数字睡眠生物识别系统'}
          </p>
        </div>
      </m.div>

      <GlassCard className="w-full max-w-md p-8 border-white/10 bg-slate-900/60 space-y-8 relative z-10">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {lang === 'zh' 
                ? '它将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验。' 
                : 'Integrating physiological monitoring, AI deep insights, and health advice for a comprehensive digital sleep lab experience.'}
            </p>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn} 
              className="w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl"
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
              {lang === 'en' ? 'Connect Google Fit' : '连接 Google Fit'}
            </button>
            
            <button 
              onClick={onGuest} 
              className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              {lang === 'en' ? 'Virtual Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {localError && (
          <m.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold"
          >
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </m.div>
        )}
      </GlassCard>

      <footer className="mt-12 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2025 Somno Lab • Neural Infrastructure</p>
      </footer>
    </div>
  );
};
