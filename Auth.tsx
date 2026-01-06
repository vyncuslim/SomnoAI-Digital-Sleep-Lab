
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Loader2, ArrowRight, TriangleAlert, Lock, 
  Terminal, Sparkles, Fingerprint, Network, Eye, EyeOff, 
  RefreshCw, Key, Shield, ChevronRight, Globe, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
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
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isKeyInjected, setIsKeyInjected] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 检查初始环境变量
    const existingKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;
    if (existingKey && existingKey.length > 20) {
      setIsKeyInjected(true);
      setApiKeyInput(existingKey);
    }
    
    // 自动聚焦
    if (!isKeyInjected) {
      setTimeout(() => inputRef.current?.focus(), 500);
    }
    
    googleFit.ensureClientInitialized().catch(() => {});
  }, []);

  const handleInjectKey = () => {
    // 移除点击长度限制，在函数内部校验
    if (!apiKeyInput.trim() || apiKeyInput.trim().length < 20) {
      setLocalError(lang === 'zh' ? "密钥无效：通常 Gemini API 密钥应至少包含 20 个字符" : "Invalid Key: Gemini API keys are usually 20+ characters.");
      return;
    }

    setIsInjecting(true);
    setLocalError(null);

    // 缩短反馈时间，确保响应感
    setTimeout(() => {
      try {
        const cleanKey = apiKeyInput.trim();
        
        // 确保全局变量被注入
        if (!(window as any).process) (window as any).process = { env: {} };
        if (!(window as any).process.env) (window as any).process.env = {};
        (window as any).process.env.API_KEY = cleanKey;
        
        // 双重注入
        try { (process.env as any).API_KEY = cleanKey; } catch(e) {}

        setIsKeyInjected(true);
        setIsInjecting(false);
        setLocalError(null);
      } catch (err) {
        setLocalError("Handshake failure: environment restricted.");
        setIsInjecting(false);
      }
    }, 400);
  };

  const handleResetKey = () => {
    setIsKeyInjected(false);
    setApiKeyInput('');
    setLocalError(null);
    if ((window as any).process?.env) (window as any).process.env.API_KEY = '';
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleGoogleLogin = async () => {
    if (!isKeyInjected) return;

    setIsLoggingIn(true);
    setLocalError(null);

    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin();
    } catch (error: any) {
      let msg = error.message || "Auth Error";
      if (msg.includes("popup_closed")) msg = lang === 'zh' ? "授权窗口被关闭" : "Popup closed";
      setLocalError(msg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12 px-6 bg-[#01040a] relative overflow-hidden">
      {/* 装饰层 */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="w-full max-w-2xl space-y-4 text-center mb-10 relative z-10"
      >
        <div className="flex justify-center mb-4">
           <Logo size={80} animated={!isKeyInjected} threeD />
        </div>
        <div className="space-y-1">
          <h1 className={`${lang === 'zh' ? 'text-4xl' : 'text-5xl'} font-black tracking-tighter text-white italic drop-shadow-2xl`}>
            SomnoAI <span className="text-indigo-400">实验终端</span>
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] opacity-60">
            <span className="flex items-center gap-1.5"><Network size={12} /> Neural-v4</span>
            <span className="flex items-center gap-1.5"><Shield size={12} /> Encrypted</span>
          </div>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-8 border-white/10 bg-slate-950/60 space-y-8 relative z-[100] shadow-2xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl border ${isKeyInjected ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'}`}>
                <Terminal size={16} />
              </div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                {lang === 'zh' ? 'Gemini 引擎网关' : 'Gemini Engine Gateway'}
              </h2>
            </div>
            {isKeyInjected && (
              <button onClick={handleResetKey} className="text-[9px] font-black text-rose-500 hover:text-rose-400 flex items-center gap-1 uppercase transition-colors">
                <RefreshCw size={10} /> {lang === 'zh' ? '重置密钥' : 'Reset'}
              </button>
            )}
          </div>

          <div className={`relative rounded-3xl border transition-all duration-500 p-1 flex flex-col gap-2 ${isKeyInjected ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 bg-black/40 focus-within:border-indigo-500/50'}`}>
            <div className="flex items-center px-4 py-2 opacity-50">
              <div className={`w-1.5 h-1.5 rounded-full mr-2 ${isKeyInjected ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
              <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                {isKeyInjected ? 'Link Established' : 'Awaiting Encryption Key'}
              </span>
            </div>

            <div className="relative flex items-center">
              <input 
                ref={inputRef}
                type={showKey ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                disabled={isKeyInjected}
                placeholder={lang === 'zh' ? '粘贴 API Key...' : 'Paste API Key...'}
                className="w-full bg-transparent border-none outline-none px-4 py-3 text-sm text-white placeholder:text-slate-700 font-mono select-text"
              />
              {!isKeyInjected && apiKeyInput && (
                <button onClick={() => setShowKey(!showKey)} className="p-3 text-slate-500 hover:text-indigo-400">
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>

            {!isKeyInjected ? (
              <button 
                onClick={handleInjectKey}
                disabled={isInjecting}
                className="m-1 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-lg pointer-events-auto"
              >
                {isInjecting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isInjecting ? (lang === 'zh' ? '握手同步中...' : 'HANDSHAKING...') : (lang === 'zh' ? '激活神经引擎' : 'ACTIVATE ENGINE')}
              </button>
            ) : (
              <div className="m-1 py-4 bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                <CheckCircle2 size={16} />
                {lang === 'zh' ? '引擎已就绪' : 'Engine Ready'}
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-6">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-[10px] font-bold text-indigo-400 flex items-center gap-1.5 hover:text-indigo-300">
              <Key size={12} /> {lang === 'zh' ? '获取密钥' : 'Get Key'}
            </a>
            <span className="w-1 h-1 bg-slate-800 rounded-full" />
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 hover:text-indigo-400">
              <Globe size={12} /> {lang === 'zh' ? '计费政策' : 'Billing'}
            </a>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={!isKeyInjected || isLoggingIn} 
              className={`w-full py-6 rounded-full flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${!isKeyInjected ? 'opacity-20 pointer-events-none grayscale' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
              {lang === 'zh' ? '同步生理指标流' : 'SYNC BIOMETRICS'}
            </button>
            
            <button onClick={onGuest} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all group">
              {lang === 'zh' ? '进入模拟实验室' : 'SIMULATION LAB'} <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        <AnimatePresence>
          {localError && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-start gap-4 text-rose-400 text-xs font-bold shadow-xl"
            >
              <TriangleAlert size={18} className="shrink-0 mt-0.5" />
              <p>{localError}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlassCard>

      <footer className="mt-12 flex flex-col items-center gap-4 opacity-30 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-6">
          <button onClick={() => onNavigate?.('privacy')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Privacy</button>
          <button onClick={() => onNavigate?.('terms')} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400">Terms</button>
        </div>
        <p className="text-[8px] font-mono uppercase tracking-[0.4em] text-slate-600">© 2026 SOMNO LAB • EDGE COMPUTE ACTIVE</p>
      </footer>
    </div>
  );
};
