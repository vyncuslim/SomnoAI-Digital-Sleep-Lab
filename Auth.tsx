
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, ArrowRight, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock, Eye, EyeOff, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './components/GlassCard.tsx';
import { googleFit } from './services/googleFitService.ts';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

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
  
  // 手动输入 Key 的状态
  const [manualKey, setManualKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    checkApiKey();
    // 提前初始化 SDK 减少点击时的延迟
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
    
    if ((window as any).process && (window as any).process.env) {
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
      // 确保 SDK 已就绪
      await googleFit.ensureClientInitialized();
      // 请求授权
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
          <Logo size={64} animated />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-transparent relative overflow-hidden">
      {/* 动态背景光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      {/* 顶部标题区域 */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-4 text-center mb-10 relative z-10">
        <h1 className="text-6xl font-black tracking-tighter text-white italic drop-shadow-2xl">
          Somno <span className="text-indigo-400">Lab</span>
        </h1>
        <p className="text-slate-400 font-bold uppercase text-[12px] tracking-[0.5em] opacity-80">
          DIGITAL SLEEP BIOMETRIC SYSTEM
        </p>
      </motion.div>

      {/* 主控制台卡片 */}
      <GlassCard className="w-full max-w-md p-12 border-white/5 bg-slate-950/50 space-y-12 relative z-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="space-y-10">
          
          {/* API 网关输入终端 */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Lock size={14} className={hasKey ? "text-emerald-400" : "text-amber-400/80"} />
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                  GEMINI API GATEWAY
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

            {/* 输入框外壳 */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Key size={18} className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              </div>
              <input 
                type={showKey ? "text" : "password"}
                value={manualKey}
                onChange={(e) => setManualKey(e.target.value)}
                placeholder="Paste AI Studio Key here..."
                className="w-full bg-[#020617]/80 border border-white/10 rounded-2xl py-5 pl-14 pr-14 text-white text-sm placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all font-mono shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)]"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-5 flex items-center text-slate-500 hover:text-white transition-colors"
                title={showKey ? "隐藏" : "显示"}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* 激活按钮 */}
            <button 
              onClick={handleActivateManual}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xs uppercase tracking-[0.25em] transition-all active:scale-[0.97] shadow-lg ${
                hasKey 
                  ? 'bg-emerald-600/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-white/5 text-slate-500 border border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {hasKey ? <ShieldCheck size={18} /> : <Save size={18} />}
              {hasKey ? (lang === 'zh' ? '引擎已就绪' : 'ENGINE READY') : (lang === 'zh' ? 'ACTIVATE AI ENGINE' : 'ACTIVATE AI ENGINE')}
            </button>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

          {/* 底部功能按钮 */}
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin} 
              disabled={isLoggingIn || !hasKey} 
              className={`w-full py-6 rounded-full flex items-center justify-center gap-4 bg-slate-200 text-slate-900 font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl relative z-30 ${!hasKey ? 'opacity-20 cursor-not-allowed grayscale' : 'cursor-pointer hover:bg-white hover:scale-[1.02] active:scale-[0.98]'}`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
              {isLoggingIn ? (lang === 'zh' ? '正在连接...' : 'CONNECTING...') : 'CONNECT HEALTH DATA'}
            </button>
            
            <button 
              onClick={onGuest} 
              className="w-full py-5 bg-transparent border border-white/5 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] transition-all cursor-pointer relative z-30 group"
            >
              VIRTUAL LAB <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {localError && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold"
          >
            <TriangleAlert size={18} className="shrink-0" />
            <p>{localError}</p>
          </motion.div>
        )}
      </GlassCard>

      <footer className="mt-16 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-8 relative z-10">
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
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-slate-400">© 2025 Somno Lab • Secure Health Environment</p>
      </footer>
    </div>
  );
};
