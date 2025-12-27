
import React, { useState, useEffect } from 'react';
import { Moon, Mail, Lock, Eye, EyeOff, Key, AlertCircle } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

declare var google: any;
declare var window: any;

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(true);

  useEffect(() => {
    // 检查是否已配置 Gemini API Key
    const checkApiKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleConfigureKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    } else {
      alert("API Key 选择功能在此环境下不可用，请确保在支持的环境中运行。");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    
    try {
      // 等待 SDK 加载的简单重试逻辑
      let retries = 0;
      while (typeof google === 'undefined' && retries < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        retries++;
      }

      if (typeof google === 'undefined' || !google.accounts) {
        throw new Error('Google SDK 加载失败，请检查网络连接或刷新页面。');
      }
      
      await googleFit.authorize();
      onLogin();
    } catch (error: any) {
      console.error('Google Login Error:', error);
      alert(error.message || '登录失败，请重试。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-900/10 blur-[200px] -z-10 rounded-full"></div>

      <div className="w-full max-w-md space-y-8 text-center mb-8 animate-in slide-in-from-top duration-700">
        <div className="inline-flex p-5 bg-indigo-600/20 rounded-[2.5rem] mb-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative group">
          <Moon className="text-indigo-400 relative z-10" size={56} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">SomnoAI</h1>
        <p className="text-slate-400 font-medium px-4 leading-relaxed italic">"科学地夺回您的深度睡眠"</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700/50 bg-slate-900/60 shadow-2xl">
        {!hasApiKey && (
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
            <div className="text-left">
              <p className="text-xs font-bold text-amber-200">未检测到 API Key</p>
              <p className="text-[10px] text-amber-200/60 leading-tight mt-1">
                AI 洞察功能需要配置 Gemini API Key。
              </p>
              <button 
                onClick={handleConfigureKey}
                className="mt-2 text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors"
              >
                立即配置 →
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className={`w-full py-5 bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-xl shadow-white/5 active:scale-95 font-bold ${isLoggingIn ? 'opacity-70' : ''}`}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>{isLoggingIn ? '同步中...' : '使用 Google 账号登录'}</span>
          </button>

          <div className="flex items-center gap-6">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">或</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <div className="space-y-4">
            <div className="relative group">
              <input 
                type="email" 
                placeholder="邮箱地址"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-700"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
            </div>
            <button 
              onClick={onLogin}
              className="w-full py-4 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/20 rounded-2xl font-bold transition-all"
            >
              普通登录
            </button>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-white/5">
          <button 
            onClick={handleConfigureKey}
            className="flex items-center justify-center gap-2 w-full text-slate-500 hover:text-slate-300 transition-colors text-xs font-bold"
          >
            <Key size={14} /> 配置 AI 引擎 (Gemini API Key)
          </button>
        </div>
      </GlassCard>
      
      <p className="mt-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">SomnoAI Digital Lab v2.0</p>
    </div>
  );
};
