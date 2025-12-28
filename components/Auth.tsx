
import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    console.log("Auth Component: Pre-initializing Google client...");
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth Component: Google SDK deferred initialization:", err.message);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    console.log("Auth Component: Login button clicked. Triggering Google OAuth flow...");
    
    try {
      // Step 1: Request authorization from Google
      const token = await googleFit.authorize(true); 
      
      if (token) {
        console.log("Auth Component: Authorization succeeded. Token received.");
        onLogin(); 
      } else {
        console.error("Auth Component: Authorization completed but returned no token.");
        throw new Error("Could not retrieve access token after authorization.");
      }
    } catch (error: any) {
      console.error("Auth Component: OAuth Flow Failed. Full Error Object:", error);
      
      let userMsg = error.message || 'Laboratory endpoint connection failed.';
      
      // Categorize common OAuth cancellation/error scenarios
      if (
        userMsg.includes('cancelled') || 
        userMsg.includes('denied') || 
        userMsg.includes('popup_closed_by_user') ||
        userMsg.includes('access_denied')
      ) {
        userMsg = "授权已被取消或弹窗被关闭。请务必勾选所有复选框以同步数据。";
      } else if (userMsg.includes('popup_blocked')) {
        userMsg = "浏览器拦截了弹出窗口，请允许本站弹出窗口后重试。";
      } else if (userMsg.includes('idpiframe_initialization_failed')) {
        userMsg = "Google 服务初始化失败，请检查浏览器是否禁用了第三方 Cookie。";
      }
      
      alert(userMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md space-y-10 text-center mb-10 relative z-10">
        <div className="inline-flex p-6 bg-indigo-600/20 rounded-[3rem] mb-2 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
          <Moon className="text-indigo-400 fill-indigo-400/20" size={64} />
        </div>
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-white mb-3 italic">SomnoAI</h1>
          <p className="text-slate-400 font-medium tracking-wide">数字化睡眠实验室系统 v2.8</p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-10 border-slate-700/50 bg-slate-900/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8 relative z-10">
        <div className="space-y-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-left space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">接入关键指南</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              在授权弹窗中，请确保 <span className="text-white font-bold underline decoration-indigo-500">手动勾选所有复选框</span>。漏选任何一个都会导致实验室无法提取您的生理特征流。
            </p>
          </div>

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-5 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-2xl font-black active:scale-[0.98] border ${
                isLoggingIn 
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                : 'bg-white text-slate-950 border-white hover:bg-slate-100 shadow-indigo-500/20'
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-indigo-500" size={20} />
              ) : (
                <Zap className="fill-indigo-600 text-indigo-600" size={20} />
              )}
              <span>{isLoggingIn ? '正在唤起授权...' : '连接 Google Fit 账户'}</span>
            </button>

            <div className="flex items-start gap-3 px-4 py-1">
              <Info size={14} className="text-amber-500 mt-1 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-snug italic">
                提示：若点击无响应，请检查浏览器地址栏是否显示“已拦截弹出窗口”。
              </p>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black transition-all text-[10px] uppercase tracking-[0.3em] group"
          >
            以访客身份进入实验室 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </GlassCard>
      
      <div className="mt-12 flex items-center gap-3 text-slate-800 text-[10px] font-black uppercase tracking-[0.5em]">
        <Lock size={12} className="text-slate-800" />
        Encrypted Endpoint
      </div>
    </div>
  );
};
