
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Eye, EyeOff, Save, Check, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';
import { Logo } from './Logo.tsx';
import { Language } from '../services/i18n.ts';

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

  // Use mandatory AI Studio helper to check for selected key
  const checkApiKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.API_KEY);
      }
    } catch (e) {
      console.error("Auth: Key check failed", e);
      setHasKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  // Trigger mandatory AI Studio key selection dialog
  const handleSelectApiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // As per guidelines, assume success after triggering to avoid race conditions
        setHasKey(true);
      } catch (e) {
        setLocalError(lang === 'zh' ? "激活失败，请检查 Google AI Studio 连接" : "Activation failed, check Google AI Studio link");
      }
    } else {
      setLocalError(lang === 'zh' ? "AI Studio 网关不可用" : "AI Studio Gateway unavailable");
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasKey) {
      setLocalError(lang === 'zh' ? "请先激活 AI 引擎" : "Please activate AI Engine first");
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
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <motion.div animate={{ scale: [1, 1.05, 1] }} className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)]">
          <Logo size={100} animated={hasKey} />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-4xl font-black tracking-tighter text-white italic">
            Somno <span className="text-indigo-400">Lab</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em]">
            {lang === 'en' ? 'Digital Sleep Biometric System' : '数字睡眠生物识别系统'}
          </p>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-8 border-white/10 bg-slate-900/60 space-y-8 relative z-10">
        <div className="space-y-6">
          {/* AI Engine activation via mandatory selection dialog */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lock size={12} className={hasKey ? "text-emerald-400" : "text-amber-400"} />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'zh' ? 'Gemini 引擎状态' : 'Gemini Engine Status'}
                </label>
              </div>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                {lang === 'zh' ? '计费文档' : 'Billing Docs'} <ExternalLink size={10} />
              </a>
            </div>

            <button 
              onClick={handleSelectApiKey}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                hasKey 
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              <Zap size={16} className={hasKey ? "fill-emerald-400" : ""} />
              {hasKey ? (lang === 'zh' ? '引擎已激活' : 'Engine Active') : (lang === 'zh' ? '激活 AI 引擎' : 'Activate AI Engine')}
            </button>
            
            {!hasKey && (
              <p className="text-[10px] text-slate-400 italic text-center px-4 leading-relaxed">
                {lang === 'zh' ? '请点击上方按钮并从您的付费 GCP 项目中选择一个 API 密钥。' : 'Please click the button above and select an API key from your paid GCP project.'}
              </p>
            )}
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* Health data connection section */}
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn || !hasKey} 
              className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl ${!hasKey ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
              {lang === 'en' ? 'Connect Health Data' : '连接健康数据'}
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={onGuest} 
                className="flex-1 py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 font-black text-[10px] uppercase tracking-widest transition-all"
              >
                {lang === 'en' ? 'Virtual Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>

        {localError && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold"
          >
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </motion.div>
        )}
      </GlassCard>

      <footer className="mt-12 flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity pb-8">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2025 Somno Lab • Secure Edge Computing</p>
      </footer>
    </div>
  );
};
