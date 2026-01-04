
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert, Shield, FileText, Github, Key, ExternalLink, Cpu, Eye, EyeOff, Save, Check } from 'lucide-react';
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
  
  // 手动输入相关状态
  const [showManualInput, setShowManualInput] = useState(false);
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

  const checkApiKey = async () => {
    try {
      // 1. 检查本地手动存储的 Key
      const savedKey = localStorage.getItem('SOMNO_MANUAL_KEY');
      if (savedKey) {
        (window as any).process.env.API_KEY = savedKey;
        setHasKey(true);
        setIsCheckingKey(false);
        return;
      }

      // 2. 检查环境变量注入
      if (process.env.API_KEY && process.env.API_KEY !== '') {
        setHasKey(true);
        setIsCheckingKey(false);
        return;
      }

      // 3. 检查 aistudio 交互式授权状态
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const selected = await aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(false);
      }
    } catch (e) {
      console.error("Auth: Key check failed", e);
      setHasKey(false);
    } finally {
      setIsCheckingKey(false);
    }
  };

  const handleSaveManualKey = () => {
    if (!manualKey.trim()) return;
    setIsSavingKey(true);
    setTimeout(() => {
      localStorage.setItem('SOMNO_MANUAL_KEY', manualKey.trim());
      (window as any).process.env.API_KEY = manualKey.trim();
      setSaveSuccess(true);
      setIsSavingKey(false);
      setHasKey(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setShowManualInput(false);
      }, 1500);
    }, 800);
  };

  const handleActivateGateway = async () => {
    const aistudio = (window as any).aistudio;
    if (aistudio && typeof aistudio.openSelectKey === 'function') {
      try {
        await aistudio.openSelectKey();
        setHasKey(true);
      } catch (e) {
        setLocalError(lang === 'zh' ? "激活失败，请检查 Google AI Studio 连接" : "Activation failed, check Google AI Studio link");
      }
    } else {
      setShowManualInput(true); // 降级到手动输入
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />
      
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
        {!hasKey || showManualInput ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="p-6 bg-amber-500/5 rounded-[2rem] border border-amber-500/10 text-left space-y-4">
              <div className="flex items-center gap-2">
                <Key size={16} className="text-amber-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-300">{lang === 'en' ? 'Neural Gateway Configuration' : '神经网关配置'}</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === 'en' 
                  ? 'Connect your Gemini API Key. You can get a free key from Google AI Studio.' 
                  : '请配置您的 Gemini API 密钥。您可以从 Google AI Studio 获取免费密钥。'}
              </p>
              <div className="flex items-center gap-2 pt-2">
                <a 
                  href="https://aistudio.google.com/app/apikey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors"
                >
                  <ExternalLink size={10} /> {lang === 'en' ? 'Get API Key from AI Studio' : '前往获取 API Key'}
                </a>
              </div>
            </div>

            {/* 手动输入终端 */}
            <div className="space-y-4 pt-2">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center bg-slate-950/80 rounded-2xl border border-white/10 overflow-hidden focus-within:border-indigo-500/50 transition-all">
                  <div className="pl-4 text-slate-500">
                    <Shield size={16} />
                  </div>
                  <input 
                    type={showKeyContent ? "text" : "password"}
                    value={manualKey}
                    onChange={(e) => setManualKey(e.target.value)}
                    placeholder={lang === 'en' ? "Paste API Key here..." : "在此粘贴 API 密钥..."}
                    className="w-full py-4 px-4 bg-transparent outline-none text-sm font-mono text-indigo-300 placeholder:text-slate-700"
                  />
                  <button 
                    onClick={() => setShowKeyContent(!showKeyContent)}
                    className="pr-4 text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    {showKeyContent ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleSaveManualKey}
                disabled={!manualKey.trim() || isSavingKey}
                className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl ${
                  saveSuccess 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600'
                }`}
              >
                {isSavingKey ? <Loader2 className="animate-spin" size={20} /> : (saveSuccess ? <Check size={20} /> : <Save size={20} />)}
                {saveSuccess ? (lang === 'zh' ? '配置成功' : 'Configured') : (lang === 'zh' ? '激活并保存' : 'Save & Activate')}
              </button>
            </div>

            <div className="relative flex items-center gap-4 py-2">
              <div className="h-[1px] flex-1 bg-white/5"></div>
              <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{lang === 'zh' ? '或者' : 'OR'}</span>
              <div className="h-[1px] flex-1 bg-white/5"></div>
            </div>

            <button 
              onClick={handleActivateGateway}
              className="w-full py-4 border border-white/10 hover:border-indigo-500/30 rounded-[2.5rem] flex items-center justify-center gap-3 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:text-slate-200 transition-all"
            >
              <Zap size={14} className="fill-indigo-500/40 text-indigo-500/40" />
              {lang === 'en' ? 'Use AI Studio Gateway' : '使用官方网关激活'}
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95">
            <div className="p-6 bg-emerald-500/5 rounded-[2rem] border border-emerald-500/10 text-left space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">{lang === 'en' ? 'Gateway Active & Secure' : '神经网关已就绪'}</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {lang === 'en' ? 'Zero-backend edge computing active. Biometric signals will be processed locally via Google GenAI.' : '零后端边缘计算已启用。生物识别信号将通过 Google GenAI 本地处理。'}
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleGoogleLogin} 
                disabled={isLoggingIn} 
                className="w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 bg-white text-slate-950 font-black text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl"
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Cpu size={20} className="text-indigo-600" />}
                {lang === 'en' ? 'Sync Health Data' : '同步健康数据 (Fit)'}
              </button>
              
              <div className="flex gap-2">
                <button onClick={onGuest} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-400 font-black text-[10px] uppercase tracking-widest transition-all">
                  {lang === 'en' ? 'Virtual Lab' : '进入虚拟实验室'} <ArrowRight size={12} />
                </button>
                <button 
                  onClick={() => setShowManualInput(true)}
                  className="px-6 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center gap-2 text-slate-600 hover:text-amber-500 transition-all"
                  title={lang === 'zh' ? '重新配置网关' : 'Reconfigure Gateway'}
                >
                  <Key size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {localError && (
          <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3 text-rose-300 text-[11px] font-bold animate-in slide-in-from-top-2">
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
