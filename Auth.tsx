
import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, 
  FileText, Github, Key, ExternalLink, Cpu, Lock, Sparkles, Terminal,
  Eye, EyeOff, RefreshCw, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { AIProvider } from './types.ts';

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
  onNavigate?: (view: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, onNavigate }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [provider, setProvider] = useState<AIProvider>(() => (localStorage.getItem('somno_ai_provider') as AIProvider) || 'gemini');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isInjecting, setIsInjecting] = useState(false);
  const [isKeyInjected, setIsKeyInjected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang].auth;

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });

    const checkStoredKeys = () => {
      const geminiKey = (window as any).process?.env?.API_KEY || process.env.API_KEY;
      const openaiKey = (window as any).process?.env?.OPENAI_API_KEY || (process.env as any).OPENAI_API_KEY;

      if (provider === 'gemini' && geminiKey?.length > 20) {
        setIsKeyInjected(true);
        setApiKeyInput(geminiKey);
      } else if (provider === 'openai' && openaiKey?.length > 20) {
        setIsKeyInjected(true);
        setApiKeyInput(openaiKey);
      } else {
        setIsKeyInjected(false);
        setApiKeyInput('');
      }
    };
    
    checkStoredKeys();
  }, [provider]);

  const handleInjectKey = () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey || cleanKey.length < 20) {
      setLocalError(t.invalidKey);
      return;
    }

    setIsInjecting(true);
    setLocalError(null);

    // Simulate a secure handshake
    setTimeout(() => {
      try {
        if (!(window as any).process) (window as any).process = { env: {} };
        if (!(window as any).process.env) (window as any).process.env = {};
        
        if (provider === 'openai') {
          (window as any).process.env.OPENAI_API_KEY = cleanKey;
        } else {
          (window as any).process.env.API_KEY = cleanKey;
        }
        
        localStorage.setItem('somno_ai_provider', provider);
        setIsKeyInjected(true);
        setIsInjecting(false);
      } catch (err) {
        setLocalError("Injection failure in sandbox environment.");
        setIsInjecting(false);
      }
    }, 600);
  };

  const handleResetKey = () => {
    setIsKeyInjected(false);
    setApiKeyInput('');
    setLocalError(null);
    if (provider === 'openai') {
      if ((window as any).process?.env) (window as any).process.env.OPENAI_API_KEY = '';
    } else {
      if ((window as any).process?.env) (window as any).process.env.API_KEY = '';
    }
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleGoogleLogin = async () => {
    if (!isKeyInjected) {
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 text-center mb-8 relative z-10">
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }} 
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)]"
        >
          <Logo size={100} animated={true} />
        </motion.div>
        <div className="space-y-4">
          <h1 className="text-3xl font-black tracking-tighter text-white italic leading-tight">
            SomnoAI <span className="text-indigo-400">Digital Sleep Lab</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase text-[9px] tracking-[0.35em]">
            ADVANCED BIO-DIGITAL LABORATORY
          </p>
        </div>
      </motion.div>

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

          {/* API Key Management */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 rounded-2xl border border-white/5">
              <button 
                onClick={() => setProvider('gemini')}
                disabled={isKeyInjected}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'gemini' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Google Gemini
              </button>
              <button 
                onClick={() => setProvider('openai')}
                disabled={isKeyInjected}
                className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${provider === 'openai' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                OpenAI GPT
              </button>
            </div>

            <div className={`relative rounded-3xl border transition-all duration-500 p-1 flex flex-col gap-2 bg-black/40 ${isKeyInjected ? 'border-emerald-500/30' : 'border-white/10 focus-within:border-indigo-500/50'}`}>
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${isKeyInjected ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'}`} />
                  <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-slate-400">
                    {isKeyInjected ? `${provider.toUpperCase()} LINKED` : t.awaitingKey}
                  </span>
                </div>
                {isKeyInjected && (
                  <button onClick={handleResetKey} className="text-rose-500 hover:text-rose-400 transition-colors">
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>

              <div className="relative flex items-center">
                <input 
                  ref={inputRef}
                  type={showKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  disabled={isKeyInjected}
                  placeholder={provider === 'openai' ? 'sk-...' : 'AI API Key...'}
                  className="w-full bg-transparent border-none outline-none px-4 py-3 text-sm text-white placeholder:text-slate-700 font-mono"
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
                  className={`m-1 py-4 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-2 transition-all shadow-lg ${provider === 'openai' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                >
                  {isInjecting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  {t.activateEngine}
                </button>
              ) : (
                <div className="m-1 py-4 bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest">
                  <CheckCircle2 size={16} />
                  {t.engineReady}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn || !isKeyInjected} 
              className={`w-full py-5 rounded-[2rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-2xl ${!isKeyInjected ? 'opacity-30 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
              {t.connect}
            </button>
            
            <button 
              onClick={onGuest} 
              className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 font-black text-[10px] uppercase tracking-widest transition-all"
            >
              <Zap size={14} className="text-indigo-400" />
              {t.guest} <ArrowRight size={12} className="ml-1" />
            </button>
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

      <footer className="mt-12 flex flex-col items-center gap-4 opacity-50 hover:opacity-100 transition-opacity pb-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => onNavigate?.('privacy')} 
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {t.privacyPolicy}
          </button>
          <button 
            onClick={() => onNavigate?.('terms')} 
            className="text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
          >
            {t.termsOfService}
          </button>
          <span className="text-[10px] font-bold text-slate-600">
            © 2026 SomnoAI Digital Sleep Lab
          </span>
        </div>
      </footer>
    </div>
  );
};
