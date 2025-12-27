
import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Pre-initialize Google Fit client to avoid blocking popups later
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Google Identity Service pre-init background warning:", err);
    });
  }, []);

  /**
   * Primary entry point for Google Fit connection.
   * Calls authorize and handles success/error.
   */
  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    console.log("Requesting user authorization for Google Fit...");
    
    try {
      // Direct call to authorize. By having pre-warmed the client in useEffect,
      // this invocation stays within the user-gesture window to avoid popup blocking.
      await googleFit.authorize(true); 
      
      console.log("Authorization successful, advancing to dashboard.");
      onLogin(); // Proceed to main app
    } catch (error: any) {
      console.error("Login sequence failed:", error);
      
      let userMsg = error.message || '连接失败';
      if (userMsg.includes('cancelled') || userMsg.includes('denied')) {
        userMsg = "授权已取消。SomnoAI 需要访问权限才能展示您的生理指标。";
      } else {
        userMsg = `${userMsg}\n\n建议：请确保浏览器没有拦截弹出窗口，并在 Google 警告页面点击“高级 -> 前往 mgx.dev”进行授权。`;
      }
      
      alert(userMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md space-y-8 text-center mb-8 animate-in slide-in-from-top duration-700">
        <div className="inline-flex p-5 bg-indigo-600/20 rounded-[2.5rem] mb-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative">
          <Moon className="text-indigo-400" size={56} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">SomnoAI</h1>
        <p className="text-slate-400 font-medium px-4 leading-relaxed tracking-wide">数字化睡眠实验室系统</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700/50 bg-slate-900/60 shadow-2xl space-y-6">
        {/* Fixed: Removed API Key configuration section to align with hard requirements */}
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">数据主权与计算声明</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              实验室将通过 Google Fit 获取生理指标。所有计算均由 Gemini 安全驱动。授权令牌仅暂存于浏览器内存。
            </p>
          </div>

          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-5 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-xl font-bold active:scale-95 border ${
                isLoggingIn 
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed' 
                : 'bg-white text-slate-950 border-white hover:bg-slate-100'
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin text-indigo-500" size={20} />
              ) : (
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              )}
              <span>{isLoggingIn ? '唤起 Google 授权中...' : '连接 Google 健身账号'}</span>
            </button>

            <div className="flex items-start gap-2 px-4 py-1">
              <Info size={12} className="text-slate-500 mt-0.5 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-tight italic">
                提示：若出现“应用未经验证”，请点击弹窗中的<span className="text-slate-400 font-bold ml-1">高级 &gt; 前往 mgx.dev</span> 即可。
              </p>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full py-4 text-slate-600 hover:text-slate-400 font-bold transition-all text-[10px] uppercase tracking-[0.3em]"
          >
            以实验室访客身份进入
          </button>
        </div>
      </GlassCard>
      
      <div className="mt-8 flex items-center gap-2 text-slate-800 text-[10px] font-black uppercase tracking-[0.4em]">
        <ShieldCheck size={12} className="text-slate-700" />
        Encrypted Lab Env 2.5
      </div>
    </div>
  );
};
