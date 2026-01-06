
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, ArrowRight, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Lock, Save, FlaskConical, Network, Fingerprint, Keyboard, Terminal as TerminalIcon } from 'lucide-react';
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
  const [hasKey, setHasKey] = useState(false);
  const [isCheckingKey, setIsCheckingKey] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    checkApiKey();
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth: Google GSI Background Loading...", err.message);
    });
  }, []);

  const checkApiKey = async () => {
    try {
      if ((window as any).aistudio) {
        const selected = await (window as any).aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(!!process.env.API_KEY || (window as any).process?.env?.API_KEY);
      }
    } catch (e) {
      setHasKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleActivateEngine = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        setHasKey(true);
        setLocalError(null);
      } catch (e: any) {
        setLocalError(lang === 'zh' ? "激活 AI 神经网关失败" : "Failed to activate AI Gateway");
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!hasKey) {
      setLocalError(lang === 'zh' ? "请先完成 API 密钥输入" : "Please input API Key first");
      return;
    }

    setIsLoggingIn(true);
    setLocalError(null);

    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) {
        onLogin();
      }
    } catch (error: any) {
      console.error("Login Error:", error);
      let msg = error.message;
      if (msg.includes("popup_closed_by_user")) {
        msg = lang === 'zh' ? "授权窗口已关闭" : "Auth popup closed";
      } else if (msg.includes("access_denied")) {
        msg = lang === 'zh' ? "数据访问权限被拒绝" : "Access denied by user";
      }
      setLocalError(msg || "Authentication Failed");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (isCheckingKey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#01040a]">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>
          <Logo size={64} animated threeD />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-16 px-6 bg-transparent relative overflow-x-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1400px] h-[1000px] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="w-full max-w-2xl space-y-6 text-center mb-12 relative z-10"
      >
        <div className="flex justify-center mb-4">
           <Logo size={90} animated threeD />
        </div>
        <div className="space-y-2">
          <h1 className={`${lang === 'zh' ? 'text-4xl' : 'text-5xl'} font-black tracking-tighter text-white italic drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)] px-4 text-center leading-tight`}>
            {lang === 'zh' ? (
              <>SomnoAI <span className="text-indigo-400">数字化实验终端</span></>
            ) : (
              <>SomnoAI <span className="text-indigo-400">Digital Terminal</span></>
            )}
          </h1>
          <div className="flex items-center justify-center gap-4 text-slate-500 font-bold uppercase text-[10px] tracking-[0.4em] opacity-60">
            <span className="flex items-center gap-1"><Network size={10} /> Neural Link v4.0</span>
            <span className="w-1 h-1 bg-slate-700 rounded-full" />
            <span className="flex items-center gap-1"><Fingerprint size={10} /> Biometric Ready</span>
          </div>
        </div>
      </motion.div>

      <GlassCard className="w-full max-w-md p-10 border-white/5 bg-slate-950/40 space-y-10 relative z-20 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.8)]">
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <SpatialIcon icon={Lock} size={14} color={hasKey ? "#10b981" : "#818cf8"} threeD />
                <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-300">
                  {lang === 'zh' ? 'AI 神经网关 (Gemini)' : 'NEURAL GATEWAY (GEMINI)'}
                </h2>
              </div>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-indigo-400/80 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
              >
                {lang === 'zh' ? '计费说明' : 'Billing Info'} <ExternalLink size={10} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>

            {/* 模拟输入框设计的触发器 */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                 {lang === 'zh' ? '安全密钥输入端口' : 'Secure Key Entry Port'}
               </label>
               <motion.button 
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleActivateEngine}
                className={`w-full h-16 rounded-2xl border flex items-center px-6 gap-4 transition-all relative overflow-hidden group shadow-inner ${
                  hasKey 
                    ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-950 border-white/10 text-slate-400 hover:border-indigo-500/40'
                }`}
              >
                <TerminalIcon size={16} className={hasKey ? "text-emerald-500" : "text-indigo-500"} />
                
                <div className="flex-1 text-left font-mono text-sm tracking-tight flex items-center">
                  {hasKey ? (
                    <span className="opacity-80">••••••••••••••••••••••••••••</span>
                  ) : (
                    <div className="flex items-center">
                      <span className="opacity-40">{lang === 'zh' ? '点击此处输入 API 密钥...' : 'Type API Key here...'}</span>
                      <motion.div 
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                        className="w-2 h-4 bg-indigo-500 ml-1"
                      />
                    </div>
                  )}
                </div>

                {hasKey ? (
                   <ShieldCheck size={18} className="text-emerald-500" />
                ) : (
                   <Keyboard size={18} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                )}

                {/* 背景光晕装饰 */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </motion.button>
            </div>
            
            {!hasKey && (
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-3">
                 <Lock size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-slate-400 leading-relaxed font-medium">
                   {lang === 'zh' ? '请点击上方“模拟输入框”激活安全网关。系统将弹出一个加密窗口供您打字输入。' : 'Click the simulated input field to launch the secure gateway. A system dialog will open for you to type your key.'}
                 </p>
              </div>
            )}
          </section>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" aria-hidden="true" />

          <section className="space-y-6">
            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn || !hasKey} 
                className={`w-full py-6 rounded-full flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest transition-all shadow-xl relative z-30 ${!hasKey ? 'opacity-20 cursor-not-allowed filter grayscale' : 'hover:bg-slate-50 hover:shadow-indigo-500/20 active:scale-[0.98]'}`}
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <GoogleIcon />}
                {isLoggingIn ? (lang === 'zh' ? '正在连接链路...' : 'LINKING...') : (lang === 'zh' ? '同步生理指标流' : 'SYNC BIOMETRICS')}
              </button>
              
              <button 
                onClick={onGuest} 
                className="w-full py-5 bg-white/5 border border-white/5 rounded-full flex items-center justify-center gap-3 text-slate-500 hover:text-indigo-400 font-black text-[11px] uppercase tracking-[0.3em] transition-all group"
              >
                <FlaskConical size={14} className="group-hover:scale-110 transition-transform" />
                {lang === 'zh' ? '访问模拟数据实验室' : 'SIMULATION LAB'} 
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </section>
        </div>
      </GlassCard>

      {localError && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-bold shadow-lg"
        >
          <TriangleAlert size={16} />
          {localError}
        </motion.div>
      )}

      <footer className="mt-16 flex flex-col items-center gap-6 opacity-30 hover:opacity-100 transition-opacity pb-12 relative z-10 text-center">
        <nav className="flex items-center gap-10">
          <a href="/privacy" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors">
            Privacy
          </a>
          <a href="/terms" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-indigo-400 transition-colors">
            Terms
          </a>
        </nav>
        <div className="space-y-1">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-slate-400">© 2026 SomnoAI Lab • Neural Research Division</p>
          <p className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">Client Encryption: Active</p>
        </div>
      </footer>
    </div>
  );
};
