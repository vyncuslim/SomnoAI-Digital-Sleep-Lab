
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, ArrowRight, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock, Eye, EyeOff, Save, Activity, BrainCircuit, Waves } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { SpatialIcon } from './components/SpatialIcon.tsx';

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
    <path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9v3.49h4.84c-.21 1.12-.84 2.07-1.79 2.7l2.85 2.22c1.67-1.55 2.63-3.83 2.63-6.57z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.85-2.22c-.8.53-1.81.85-3.11.85-2.39 0-4.41-1.61-5.14-3.78H.9v2.33C2.38 15.94 5.47 18 9 18z"/>
    <path fill="#FBBC05" d="M3.86 10.67c-.19-.58-.3-1.19-.3-1.82s.11-1.24.3-1.82V4.7H.9C.33 5.83 0 7.13 0 8.5s.33 2.67.9 3.8l2.96-2.63z"/>
    <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.89 11.43 0 9 0 5.47 0 2.38 2.06.9 5.03l2.96 2.33c.73-2.17 2.75-3.78 5.14-3.78z"/>
  </svg>
);

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasKey, setHasKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const [manualKey, setManualKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    checkApiKey();
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: Google GSI Loading...", err.message);
    });
  }, []);

  const checkApiKey = () => {
    try {
      const existingKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
      if (existingKey && existingKey !== '') {
        setHasKey(true);
      }
    } catch (e) {
      setHasKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleActivateManual = () => {
    const trimmedKey = manualKey.trim();
    if (!trimmedKey) {
      setLocalError(lang === 'zh' ? "请输入有效的 API Key" : "Please enter a valid API Key");
      return;
    }
    
    if ((window as any).process) {
      if (!(window as any).process.env) (window as any).process.env = {};
      (window as any).process.env.API_KEY = trimmedKey;
    }
    
    setHasKey(true);
    setLocalError(null);
  };

  const handleGoogleLogin = async () => {
    if (!hasKey) {
      setLocalError(lang === 'zh' ? "请先在上方输入并激活 AI 引擎" : "Please enter and activate AI Engine above first");
      return;
    }

    setIsLoggingIn(true);
    setLocalError(null);

    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) {
        onLogin();
      } else {
        throw new Error("No token received");
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let msg = error.message;
      if (msg === "popup_closed_by_user") {
        msg = lang === 'zh' ? "登录窗口被关闭" : "Login popup closed";
      } else if (msg === "access_denied") {
        msg = lang === 'zh' ? "访问被拒绝，请授予权限" : "Access denied, please grant permissions";
      }
      setLocalError(msg || "Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617]">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Logo size={64} animated threeD />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-20 px-6 bg-transparent relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-4 text-center mb-12 relative z-10">
        <div className="flex justify-center mb-6">
           <Logo size={80} animated threeD />
        </div>
        <h1 className="text-6xl font-black tracking-tighter text-white italic drop-shadow-2xl">
          Somno<span className="text-indigo-400">AI</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[12px] tracking-[0.5em] opacity-80">
          ADVANCED BIO-DIGITAL LABORATORY
        </p>
      </motion.div>

      <GlassCard className="w-full max-w-md p-10 border-white/5 bg-slate-950/50 space-y-10 relative z-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="space-y-10">
          {/* API GATEWAY */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <SpatialIcon icon={Lock} size={14} color={hasKey ? "#10b981" : "#fbbf24"} threeD />
                <label htmlFor="manual-api-key" className="text-[11px] font-black uppercase tracking-widest text-slate-300 cursor-pointer">
                  NEURAL GATEWAY (GEMINI)
                </label>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
              >
                {lang === 'zh' ? '获取密钥' : 'Get Key'} <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <SpatialIcon icon={Key} size={18} color="#64748b" threeD />
              </div>
              <input 
                id="manual-api-key"
                type={showKey ? "text" : "password"}
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste AI Studio Key here..."
                className="w-full bg-[#020617]/80 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-5 flex items-center text-slate-500 hover:text-white transition-colors"
              >
                <SpatialIcon icon={showKey ? EyeOff : Eye} size={18} threeD />
              </button>
            </div>

            <button 
              onClick={handleActivateManual}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.25em] transition-all active:scale-[0.97] shadow-lg ${
                hasKey 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <SpatialIcon icon={hasKey ? ShieldCheck : Save} size={18} threeD />
              {hasKey ? (lang === 'zh' ? '引擎已就绪' : 'ENGINE READY') : (lang === 'zh' ? '激活核心引擎' : 'ACTIVATE NEURAL ENGINE')}
            </button>
          </section>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" aria-hidden="true" />

          {/* OAUTH SECTION */}
          <section className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl space-y-3">
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                {lang === 'zh' 
                  ? '合成精密生理指标监控与深度神经 AI 洞察，打造卓越的数字化睡眠研究环境。' 
                  : 'Synthesizing precision biometric monitoring and deep neuro-AI insights for an unparalleled sleep research environment.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {['sleep.read', 'heart_rate.read'].map(scope => (
                   <span key={scope} className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-mono text-indigo-400 rounded">
                     {scope}
                   </span>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn || !hasKey} 
              className={`w-full py-6 rounded-full flex items-center justify-center gap-4 bg-white text-slate-900 font-bold text-sm transition-all shadow-xl relative z-30 ${!hasKey ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
              {isLoggingIn ? (lang === 'zh' ? '正在连接...' : 'CONNECTING...') : (lang === 'zh' ? '使用 Google 账号登录' : 'Sign in with Google')}
            </button>
          </section>
        </div>
      </GlassCard>

      <footer className="mt-20 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-12 relative z-10">
        <nav className="flex items-center gap-8">
          <a href="/privacy" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <SpatialIcon icon={Shield} size={12} threeD={false} /> Privacy
          </a>
          <a href="/terms" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <SpatialIcon icon={FileText} size={12} threeD={false} /> Terms
          </a>
          <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors">
            <SpatialIcon icon={Github} size={12} threeD={false} /> Source
          </a>
        </nav>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-400">© 2026 SomnoAI • Secure Research Architecture</p>
      </footer>
    </div>
  );
};
