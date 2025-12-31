
import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info, ArrowRight, Zap, TriangleAlert, ShieldAlert, CheckCircle2, ChevronDown, ExternalLink, FileText } from 'lucide-react';
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
      // 强制弹出 consent 页面以让用户重新勾选
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      console.error("Auth Failure:", error);
      const cleanMsg = error.message?.replace("PERMISSION_DENIED: ", "") || "身份验证连接中断";
      setLocalError(cleanMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] bg-indigo-600/10 blur-[150px] rounded-full animate-pulse"></div>
      
      <div className="w-full max-w-md space-y-6 text-center mb-6 relative z-10">
        <div className="inline-flex p-6 bg-indigo-600/10 rounded-[3rem] mb-2 border border-indigo-500/20 shadow-[0_0_80px_rgba(79,70,229,0.1)] animate-in zoom-in duration-1000">
          <Moon className="text-indigo-400 fill-indigo-400/20" size={64} />
        </div>
        <div className="space-y-3">
          <h1 className="text-5xl font-black tracking-tighter text-white italic drop-shadow-2xl">SomnoAI</h1>
          <p className="text-slate-400 font-medium tracking-wide leading-relaxed px-4 text-xs">
            通过 Google Fit 生态聚合生理特征流，构建您的数字化睡眠实验室。
          </p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-white/10 bg-slate-900/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] space-y-6 relative z-10 overflow-visible">
        <div className="space-y-6">
          {/* Detailed Google UI Guide based on user's screenshot */}
          <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/20 text-left space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 rounded-lg">
                <ShieldAlert size={16} className="text-amber-400" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-300">Google 授权页避坑指南</p>
            </div>
            
            <div className="space-y-3">
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-400 border border-amber-500/30">1</div>
                 <p className="text-[11px] text-slate-200 font-bold leading-snug">
                   若提示“应用未验证”：点击页面左下角的 <span className="text-white italic">高级 (Advanced)</span>，选择 <span className="text-white underline italic">转到 SomnoAI (不安全)</span>。
                 </p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]">2</div>
                 <p className="text-[11px] text-rose-300 font-black leading-snug">
                   点击中间的 <span className="text-white italic">“查看已拥有的部分访问权限”</span> (或 7 项服务)，<span className="underline decoration-rose-500 decoration-2 underline-offset-4">手动勾选全部复选框</span>。
                 </p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-black text-amber-400 border border-amber-500/30">3</div>
                 <p className="text-[11px] text-slate-200 font-bold leading-snug">
                   滑动到底部点击 <span className="text-white italic">继续 (Continue)</span>。
                 </p>
               </div>
            </div>
          </div>

          {localError && (
            <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/30 text-left flex gap-3 animate-in shake duration-500">
              <TriangleAlert size={18} className="text-rose-400 shrink-0" />
              <div className="space-y-1">
                 <p className="text-[11px] text-rose-300 font-black leading-relaxed">连接被拦截</p>
                 <p className="text-[10px] text-rose-300/70 font-medium leading-relaxed">{localError}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-5 rounded-2xl flex items-center justify-center gap-4 transition-all shadow-2xl font-black text-sm uppercase tracking-widest active:scale-[0.97] border ${
                isLoggingIn 
                ? 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed' 
                : 'bg-white text-slate-950 border-white hover:bg-slate-100'
              }`}
            >
              {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-indigo-600 text-indigo-600" />}
              <span>{isLoggingIn ? '正在校准实验室隧道...' : '接入 Google Fit 实验室'}</span>
            </button>

            <button 
              onClick={onGuest}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black transition-all text-[10px] uppercase tracking-[0.4em] group"
            >
              以访客身份浏览实验室 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Legal Links Footer */}
          <div className="pt-2 flex justify-center gap-6 border-t border-white/5">
            <a href="/privacy.html" target="_blank" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">
              <FileText size={10} /> 隐私权政策
            </a>
            <a href="/terms.html" target="_blank" className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">
              <ShieldCheck size={10} /> 服务条款
            </a>
          </div>
        </div>
      </GlassCard>
      
      <div className="mt-12 flex items-center gap-4 text-slate-800 text-[10px] font-black uppercase tracking-[0.6em] opacity-40">
        <Lock size={12} />
        Secure Lab Encryption
      </div>
    </div>
  );
};
