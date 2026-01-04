
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
  
  // 核心：API Key 输入状态
  const [manualKey, setManualKey] = useState(localStorage.getItem('SOMNO_MANUAL_KEY') || '');
  const [isSavingKey, setIsSavingKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showKeyContent, setShowKeyContent] = useState(false);

  useEffect(() => {
    checkApiKey();
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: SDK Warming Postponed", err.message);
    });
  }, []);

  const checkApiKey = () => {
    const savedKey = localStorage.getItem('SOMNO_MANUAL_KEY');
    if (savedKey && savedKey.length > 20) {
      // 注入到全局 window 对象供 geminiService 使用
      if (!(window as any).process) (window as any).process = { env: {} };
      if (!(window as any).process.env) (window as any).process.env = {};
      (window as any).process.env.API_KEY = savedKey;
      setHasKey(true);
    } else {
      setHasKey(false);
    }
    setIsCheckingKey(false);
  };

  const handleSaveKey = () => {
    const trimmedKey = manualKey.trim();
    if (!trimmedKey || trimmedKey.length < 20) {
      setLocalError(lang === 'zh' ? "请输入有效的 API 密钥" : "Please enter a valid API Key");
      return;
    }

    setIsSavingKey(true);
    setLocalError(null);

    // 模拟加密校验过程
    setTimeout(() => {
      localStorage.setItem('SOMNO_MANUAL_KEY', trimmedKey);
      if (!(window as any).process) (window as any).process = { env: {} };
      (window as any).process.env.API_KEY = trimmedKey;
      
      setSaveSuccess(true);
      setIsSavingKey(false);
      setHasKey(true);
      
      setTimeout(() => {
        setSaveSuccess(false);
      }, 2000);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    if (!hasKey) {
      setLocalError(lang === 'zh' ? "请先配置并保存 API 密钥以激活 AI 功能" : "Please configure API Key first to enable AI functions");
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
      {/* 动态背景光晕 */}
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
          {/* API Key 核心输入区 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lock size={12} className={hasKey ? "text-emerald-400" : "text-amber-400"} />
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {lang === 'zh' ? 'Gemini API 密钥' : 'Gemini API Gateway'}
                </label>
              </div>
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                获取密钥 <ExternalLink size={10} />
              </a>
            </div>

            <div className="relative group">
              <div className={`absolute -inset-0.5 rounded-2xl blur opacity-20 transition duration-1000 ${hasKey ? 'bg-emerald-500' : 'bg-indigo-500'}`}></div>
              <div className="relative flex items-center bg-slate-950 rounded-2xl border border-white/10 overflow-hidden focus-within:border-indigo-500/50 transition-all">
                <div className="pl-4 text-slate-600">
                  <Key size={16} />
                </div>
                <input 
                  type={showKeyContent ? "text" : "password"}
                  value={manualKey}
                  onChange={(e) => {
                    setManualKey(e.target.value);
                    setHasKey(false); // 修改时重置状态
                  }}
                  placeholder="Paste AI Studio Key here..."
                  className="w-full py-4 px-4 bg-transparent outline-none text-sm font-mono text-indigo-300 placeholder:text-slate-800"
                />
                <button 
                  onClick={() => setShowKeyContent(!showKeyContent)}
                  className="pr-4 text-slate-600 hover:text-indigo-400 transition-colors"
                >
                  {showKeyContent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              onClick={handleSaveKey}
              disabled={isSavingKey || !manualKey}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-xl ${
                saveSuccess 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30 disabled:grayscale'
              }`}
            >
              {isSavingKey ? <Loader2 className="animate-spin" size={16} /> : (saveSuccess ? <Check size={16} /> : <Save size={16} />)}
              {saveSuccess ? (lang === 'zh' ? '配置已更新' : 'Config Updated') : (lang === 'zh' ? '激活 AI 引擎' : 'Activate AI Engine')}
            </button>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

          {/* 数据连接区 */}
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
