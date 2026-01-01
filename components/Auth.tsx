import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info, ArrowRight, Zap, TriangleAlert, ShieldAlert, CheckCircle2, ChevronDown, ExternalLink, FileText } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

interface AuthProps {
  onLogin: () => void;
  onGuest: () => void;
  onLegalPage?: (page: 'privacy' | 'terms') => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuest, onLegalPage }) => {
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
      let cleanMsg = error.message?.replace("PERMISSION_DENIED: ", "") || "身份验证连接中断，请重试。";
      
      if (cleanMsg.includes("idpiframe_initialization_failed") || cleanMsg.includes("origin_mismatch") || cleanMsg.includes("unregistered_origin")) {
        cleanMsg = "【域名验证异常】请检查您的 Google Cloud Console JavaScript 来源配置是否包含此域名。";
      }
      
      setLocalError(cleanMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLegalClick = (e: React.MouseEvent, page: 'privacy' | 'terms') => {
    if (onLegalPage) {
      e.preventDefault();
      onLegalPage(page);
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
          <h1 className="text-4xl font-black tracking-tighter text-white italic drop-shadow-2xl leading-tight">SomnoAI Digital Sleep Lab</h1>
          <p className="text-slate-400 font-medium tracking-wide leading-relaxed px-4 text-xs">
            数字化睡眠指标监控、AI 深度洞察与健康建议。
          </p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-white/10 bg-slate-900/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] space-y-6 relative z-10 overflow-visible">
        <div className="space-y-6">
          <div className="p-6 bg-indigo-500/5 rounded-3xl border border-indigo-500/10 text-left space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <Info size={16} className="text-indigo-400" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-300">Google Fit 连接说明</p>
            </div>
            <div className="space-y-3">
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/30">1</div>
                 <p className="text-[11px] text-slate-200 font-medium leading-snug">
                   应用审核期间，若提示“未验证”，请点击页面下方的 <span className="text-white font-bold italic">高级 (Advanced)</span> 选项继续。
                 </p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/30">2</div>
                 <p className="text-[11px] text-slate-200 font-medium leading-snug">
                   在权限确认页，请展开 <span className="text-white italic">“查看权限”</span> 列表并确保勾选所有健康数据项。
                 </p>
               </div>
               <div className="flex gap-3 items-start">
                 <div className="mt-1 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-[10px] font-black text-indigo-400 border border-indigo-500/30">3</div>
                 <p className="text-[11px] text-slate-200 font-medium leading-snug">
                   点击 <span className="text-white italic">继续 (Continue)</span> 完成实验室信号流同步。
                 </p>
               </div>
            </div>
          </div>

          {localError && (
            <div className="p-5 bg-rose-500/10 rounded-2xl border border-rose-500/30 text-left flex gap-3 animate-in shake duration-500">
              <TriangleAlert size={18} className="text-rose-400 shrink-0" />
              <div className="space-y-1">
                 <p className="text-[11px] text-rose-300 font-black leading-relaxed">连接状态异常</p>
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
              <span>{isLoggingIn ? '正在同步实验室...' : '接入 Google Fit'}</span>
            </button>

            <button 
              onClick={onGuest}
              className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black transition-all text-[10px] uppercase tracking-[0.4em] group"
            >
              访客模式浏览 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="pt-2 flex justify-center gap-6 border-t border-white/5">
            <a 
              href="/privacy" 
              onClick={(e) => handleLegalClick(e, 'privacy')}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <FileText size={10} /> 隐私政策
            </a>
            <a 
              href="/terms" 
              onClick={(e) => handleLegalClick(e, 'terms')}
              className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors"
            >
              <ShieldCheck size={10} /> 服务条款
            </a>
          </div>
        </div>
      </GlassCard>
      
      <div className="mt-12 flex items-center gap-4 text-slate-800 text-[10px] font-black uppercase tracking-[0.6em] opacity-40">
        <Lock size={12} />
        Secure Connection Established
      </div>
    </div>
  );
};