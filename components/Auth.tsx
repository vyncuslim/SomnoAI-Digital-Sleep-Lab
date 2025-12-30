
import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info, ArrowRight, Zap, CircleCheck, TriangleAlert, ShieldAlert } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

interface AuthProps {
  onLogin: () => void;
  onGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth Component: SDK 预热推迟", err.message);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setShowHint(true);
    setLocalError(null);
    
    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      console.error("Auth Failure:", error);
      setLocalError(error.message || "身份验证连接中断");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
      
      <div className="w-full max-w-md space-y-8 text-center mb-10 relative z-10">
        <div className="inline-flex p-8 bg-indigo-600/10 rounded-[3.5rem] mb-4 border border-indigo-500/20 shadow-[0_0_80px_rgba(79,70,229,0.1)]">
          <Moon className="text-indigo-400 fill-indigo-400/20" size={80} />
        </div>
        <div className="space-y-4">
          <h1 className="text-6xl font-black tracking-tighter text-white italic drop-shadow-2xl">SomnoAI</h1>
          <p className="text-slate-400 font-medium tracking-wide leading-relaxed px-6 text-sm">
            聚合生理体征、AI 洞察与实验室代谢流，构建您的全方位数字化睡眠恢复模型。
          </p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-10 border-white/10 bg-slate-900/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] space-y-8 relative z-10 overflow-visible">
        <div className="space-y-6">
          <div className="p-5 bg-indigo-500/5 rounded-3xl border border-indigo-500/20 text-left">
            <div className="flex items-center gap-2 mb-2">
              <CircleCheck size={16} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">特征流接入指南</p>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              请务必在授权页 <span className="text-white font-bold underline decoration-indigo-500">手动勾选所有数据复选框</span>。漏选将导致生理架构推演引擎无法接收信号。
            </p>
          </div>

          {showHint && !localError && (
            <div className="p-5 bg-amber-500/5 rounded-3xl border border-amber-500/20 text-left animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <ShieldAlert size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">安全通行指引</p>
              </div>
              <p className="text-[10px] text-amber-200/60 leading-relaxed font-medium">
                若提示“应用未验证”：点击 <span className="text-white italic">高级 (Advanced)</span> → <span className="text-white italic underline">转到 SomnoAI (不安全)</span> 即可建立加密连接。
              </p>
            </div>
          )}

          {localError && (
            <div className="p-5 bg-rose-500/10 rounded-3xl border border-rose-500/30 text-left flex gap-3 animate-in shake duration-500">
              <TriangleAlert size={18} className="text-rose-400 shrink-0" />
              <p className="text-[11px] text-rose-300 font-bold leading-relaxed">{localError}</p>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all shadow-2xl font-black text-sm uppercase tracking-widest active:scale-[0.97] border ${
                isLoggingIn 
                ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed' 
                : 'bg-white text-slate-950 border-white hover:bg-slate-100 shadow-indigo-600/20'
              }`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap className="fill-indigo-600 text-indigo-600" size={20} />}
              <span>{isLoggingIn ? '正在建立加密隧道...' : '接入 Google Fit 实验室'}</span>
            </button>

            <div className="flex items-start gap-3 px-4 py-1 opacity-40">
              <Info size={14} className="text-slate-400 mt-0.5 shrink-0" />
              <p className="text-[9px] text-slate-400 leading-snug italic uppercase tracking-widest">
                提示：若无响应，请允许浏览器弹出窗口。
              </p>
            </div>
          </div>

          <button 
            onClick={onGuest}
            className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-indigo-400 font-black transition-all text-[10px] uppercase tracking-[0.4em] group"
          >
            以访客身份进入 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </GlassCard>
      
      <div className="mt-16 flex items-center gap-4 text-slate-800 text-[10px] font-black uppercase tracking-[0.6em] opacity-40">
        <Lock size={12} />
        Secure Lab Protocol
      </div>
    </div>
  );
};
