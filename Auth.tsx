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
  const t = translations[lang];

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
          Somno <span className="text-indigo-400">Lab</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[12px] tracking-[0.5em] opacity-80">
          DIGITAL SLEEP BIOMETRIC SYSTEM
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
                  AI GATEWAY (GEMINI)
                </label>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
                aria-label={lang === 'zh' ? '前往 Google AI Studio 获取 API 密钥' : 'Go to Google AI Studio to get your API key'}
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
                aria-label={showKey ? (lang === 'zh' ? '隐藏密钥' : 'Hide Key') : (lang === 'zh' ? '显示密钥' : 'Show Key')}
              >
                <SpatialIcon icon={showKey ? EyeOff : Eye} size={18} threeD />
              </button>
            </div>

            <button 
              onClick={handleActivateManual}
              aria-label={lang === 'zh' ? '激活 AI 引擎' : 'Activate AI Engine'}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.25em] transition-all active:scale-[0.97] shadow-lg ${
                hasKey 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              <SpatialIcon icon={hasKey ? ShieldCheck : Save} size={18} threeD />
              {hasKey ? (lang === 'zh' ? '引擎已就绪' : 'ENGINE READY') : (lang === 'zh' ? 'ACTIVATE AI ENGINE' : 'ACTIVATE AI ENGINE')}
            </button>
          </section>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" aria-hidden="true" />

          {/* OAUTH SECTION */}
          <section className="space-y-6">
            <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl space-y-3">
              <p className="text-[10px] text-slate-400 leading-relaxed font-medium italic">
                {lang === 'zh' 
                  ? '授权访问您的 Google Fit 睡眠与心率数据，以驱动 AI 进行生理建模与恢复建议。' 
                  : 'Authorize access to Google Fit sleep & heart rate data to drive AI physiological modeling.'}
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
              aria-label={lang === 'zh' ? '使用 Google 账号登录' : 'Sign in with Google'}
              className={`w-full py-6 rounded-full flex items-center justify-center gap-4 bg-white text-slate-900 font-bold text-sm transition-all shadow-xl relative z-30 ${!hasKey ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-slate-50 hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
              {isLoggingIn ? (lang === 'zh' ? '正在连接...' : 'CONNECTING...') : (lang === 'zh' ? '使用 Google 账号登录' : 'Sign in with Google')}
            </button>
            
            <button 
              onClick={onGuest} 
              aria-label={lang === 'zh' ? '进入虚拟实验室' : 'Enter Virtual Lab'}
              className="w-full py-5 bg-transparent border border-white/5 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] transition-all cursor-pointer relative z-30 group"
            >
              VIRTUAL LAB <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </section>
        </div>

        {localError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            role="alert"
            className="mt-6 p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold"
          >
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </motion.div>
        )}
      </GlassCard>

      {/* HOW IT WORKS / FEATURES */}
      <section className="mt-20 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 px-4" aria-label="App Features">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-8 h-full space-y-4 border-indigo-500/20 bg-indigo-500/[0.02]">
            <SpatialIcon icon={Activity} size={32} color="#818cf8" threeD />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{lang === 'zh' ? '生理指标监控' : 'Biometric Monitoring'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {lang === 'zh' ? '通过 Google Fit 同步精准的睡眠分段与静息心率数据，可视化您的生命体征。' : 'Sync precise sleep segments and resting heart rate data via Google Fit.'}
            </p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
          <GlassCard className="p-8 h-full space-y-4 border-emerald-500/20 bg-emerald-500/[0.02]">
            <SpatialIcon icon={BrainCircuit} size={32} color="#10b981" threeD />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{lang === 'zh' ? 'AI 深度洞察' : 'AI Deep Insights'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {lang === 'zh' ? '利用 Gemini 3 引擎对您的生理数据进行多维合成，提供战术级健康优化建议。' : 'Leverage Gemini 3 to synthesize multi-dimensional insights from your physiological data.'}
            </p>
          </GlassCard>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-8 h-full space-y-4 border-slate-500/20 bg-slate-500/[0.02]">
            <SpatialIcon icon={Waves} size={32} color="#94a3b8" threeD />
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{lang === 'zh' ? '边缘安全架构' : 'Edge-First Privacy'}</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
              {lang === 'zh' ? '数据仅在您的浏览器中处理。无后端存储，确保您的健康数据在绝对私密的环境下运行。' : 'Data is processed entirely in your browser. Zero backend storage for absolute privacy.'}
            </p>
          </GlassCard>
        </motion.div>
      </section>

      <footer className="mt-20 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-12 relative z-10">
        <nav className="flex items-center gap-8">
          <button onClick={() => onNavigate?.('privacy')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors" aria-label={lang === 'zh' ? '隐私政策' : 'Privacy Policy'}>
            <SpatialIcon icon={Shield} size={12} threeD={false} /> Privacy
          </button>
          <button onClick={() => onNavigate?.('terms')} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors" aria-label={lang === 'zh' ? '服务条款' : 'Terms of Service'}>
            <SpatialIcon icon={FileText} size={12} threeD={false} /> Terms
          </button>
          <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors" aria-label={lang === 'zh' ? 'GitHub 源码' : 'GitHub Source'}>
            <SpatialIcon icon={Github} size={12} threeD={false} /> Source
          </a>
        </nav>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-400">© 2025 Somno Lab • Secure Health Environment</p>
      </footer>
    </div>
  );
};