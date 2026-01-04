
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
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

  const checkApiKey = async () => {
    try {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    } catch (e) {
      console.error("Key check failed", e);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      setHasKey(true);
    } catch (e) {
      setLocalError("Gateway Activation Failed");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
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
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <motion.div animate={{ scale: [1, 1.05, 1] }} className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)]">
          <Logo size={120} animated />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white italic">Somno <span className="text-indigo-400">Lab</span></h1>
          <p className="text-slate-400 font-medium uppercase text-sm tracking-widest">{lang === 'en' ? 'Digital Sleep & Physiological Projections' : '数字睡眠与生理预测系统'}</p>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-10 border-white/10 bg-slate-900/40 space-y-8 relative z-10">
        {!hasKey ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10 text-left space-y-4">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-amber-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">{lang === 'en' ? 'Neural Gateway Inactive' : '神经网关未激活'}</p>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'en' 
                  ? 'To enable AI Synthesis, you must link your paid Google Cloud API Key. No data is stored outside your browser.' 
                  : '为启用 AI 综合分析，您必须关联您的 Google Cloud API Key。所有数据仅在浏览器内处理。'}
              </p>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
              >
                <ExternalLink size={10} /> {lang === 'en' ? 'Billing Documentation' : '计费文档'}
              </a>
            </div>
            
            <button 
              onClick={handleSelectKey}
              className="w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 bg-indigo-600 text-white font-black text-sm uppercase tracking-widest hover:bg-indigo-500 shadow-[0_0_30px_rgba(79,70,229,0.3)] transition-all active:scale-95"
            >
              <Zap size={20} className="fill-white" />
              {lang === 'en' ? 'Activate Neural Gateway' : '激活神经网关'}
            </button>
          </div>
        ) : (
          <>
            <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 text-left space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{lang === 'en' ? 'Gateway Active & Secure' : '网关已激活且安全'}</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">{lang === 'en' ? 'Zero backend storage. Sensitive metrics cleared upon session termination.' : '无后端存储。会话结束时即时清除敏感指标。'}</p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn} 
                className="w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-indigo-600 text-indigo-600" />}
                {lang === 'en' ? 'Connect Google Fit' : '连接 Google Fit'}
              </button>
              <button onClick={onGuest} className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em] transition-all">
                {lang === 'en' ? 'Browse Guest Lab' : '以访客身份浏览'} <ArrowRight size={12} />
              </button>
            </div>
          </>
        )}

        {localError && (
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold">
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </div>
        )}
      </GlassCard>

      <footer className="mt-16 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-8">
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
        <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2025 Somno Lab • Secure Health Environment</p>
      </footer>
    </div>
  );
};
