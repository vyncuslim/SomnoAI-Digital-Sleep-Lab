
import React, { useState, useEffect } from 'react';
import { Moon, ShieldCheck, Lock, Loader2, Info, ArrowRight, Zap, CheckCircle2, AlertTriangle, ChevronRight } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

interface AuthProps {
  onLogin: () => void;
  onGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showVerificationHint, setShowVerificationHint] = useState(false);

  useEffect(() => {
    // 页面加载时静默预初始化客户端
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth Component: Google SDK 预初始化被推迟 (正常现象)", err.message);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setShowVerificationHint(true);
    console.log("Auth Component: 开始执行 Google Login...");
    
    try {
      // 首先确保客户端初始化完成
      await googleFit.ensureClientInitialized();
      
      // 发起强制授权请求（要求账号选择和重新同意）
      const token = await googleFit.authorize(true); 
      
      if (token) {
        console.log("Auth Component: 授权成功，正在进入实验室...");
        onLogin(); 
      }
    } catch (error: any) {
      console.error("Auth Component: 授权请求失败", error);
      // 这里的错误会由 App.tsx 中的 handleSync 进一步处理（如果需要的话）
      // 在 Auth 页面我们只需重置状态
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md space-y-8 text-center mb-10 relative z-10">
        <div className="inline-flex p-6 bg-indigo-600/20 rounded-[3rem] mb-2 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20">
          <Moon className="text-indigo-400 fill-indigo-400/20" size={64} />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white italic">SomnoAI</h1>
          <p className="text-slate-400 font-medium tracking-wide leading-relaxed px-4">
            它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室。
          </p>
        </div>
      </div>

      <GlassCard className="w-full max-w-md p-10 border-slate-700/50 bg-slate-900/40 shadow-[0_20px_50px_rgba(0,0,0,0.5)] space-y-8 relative z-10">
        <div className="space-y-6">
          <div className="p-5 bg-indigo-500/10 rounded-3xl border border-indigo-500/20 text-left space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">连接核心指南</p>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              在授权弹窗中，请确保 <span className="text-white font-bold underline decoration-indigo-500">勾选所有权限复选框</span>。这是实验室提取生理信号流的唯一途径。
            </p>
          </div>

          {showVerificationHint && (
            <div className="p-5 bg-amber-500/10 rounded-3xl border border-amber-500/20 text-left space-y-3 animate-in fade-in slide-in-from-top-2 duration-400">
              <div className="flex items-center gap-2 text-amber-400">
                <AlertTriangle size={16} />
                <p className="text-[10px] font-black uppercase tracking-widest">安全验证通行指引</p>
              </div>
              <div className="space-y-2 text-[11px] text-amber-200/80 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">1</span>
                  <span>若提示“Google 尚未验证此应用”，点击左下角 <span className="font-black text-white italic">高级 (Advanced)</span>。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">2</span>
                  <span>点击底部出现的 <span className="font-black text-white italic underline">转到 SomnoAI (不安全)</span> 链接。</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-amber-500/20 flex items-center justify-center text-[9px] font-bold text-amber-400 shrink-0">3</span>
                  <span>勾选所有权限后点击“继续”。</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className={`w-full py-5 rounded-3xl flex items-center justify-center gap-4 transition-all shadow-2xl font-black active:scale-[0.98] border ${
                isLoggingIn 
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40 cursor-not-allowed' 
                : 'bg-white text-slate-950 border-white hover:bg-slate-100 shadow-indigo-500/20'
              }`}
            >
              {isLoggingIn ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Zap className="fill-indigo-600 text-indigo-600" size={20} />
              )}
              <span>{isLoggingIn ? '正在调起安全终端...' : '连接 Google Fit 实验室'}</span>
            </button>

            <div className="flex items-start gap-3 px-4 py-1">
              <Info size={14} className="text-slate-500 mt-1 shrink-0" />
              <p className="text-[10px] text-slate-500 leading-snug italic">
                提示：若点击无响应，请检查地址栏右侧是否显示“已拦截弹出窗口”。
              </p>
            </div>
          </div>

          <button 
            onClick={onGuest}
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
