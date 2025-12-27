
import React, { useState } from 'react';
import { Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

// Declare google as a global variable provided by the Google Identity Services SDK script
declare var google: any;

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      // Fix: Checked google object existence using the global declaration
      if (typeof google === 'undefined') {
        throw new Error('Google SDK 尚未加载，请稍后再试。');
      }
      
      await googleFit.authorize();
      onLogin();
    } catch (error) {
      console.error('Google Login Error:', error);
      alert('无法通过 Google 登录，请重试或检查浏览器设置。');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* Decorative background for Auth */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-indigo-900/10 blur-[200px] -z-10 rounded-full animate-spin-slow"></div>

      <div className="w-full max-w-md space-y-8 text-center mb-10 animate-in slide-in-from-top duration-700">
        <div className="inline-flex p-5 bg-indigo-600/20 rounded-[2.5rem] mb-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative group">
          <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Moon className="text-indigo-400 relative z-10" size={56} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">睡眠 AI 分析</h1>
        <p className="text-slate-400 font-medium px-4 leading-relaxed">数字化深度洞察，科学优化您的睡眠质量</p>
      </div>

      <GlassCard className="w-full max-w-md p-10 border-slate-700/50 bg-slate-900/60 shadow-inner animate-in zoom-in-95 duration-500">
        <div className="flex bg-slate-950/50 border border-white/5 rounded-3xl p-1.5 mb-10">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-3 text-sm font-black rounded-[1.25rem] transition-all duration-300 ${mode === 'login' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            登录
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-3 text-sm font-black rounded-[1.25rem] transition-all duration-300 ${mode === 'register' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-white'}`}
          >
            注册
          </button>
        </div>

        <div className="space-y-8">
          <div className="space-y-3 text-left">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">电子邮箱</label>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="请输入邮箱"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl py-5 pl-14 pr-4 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
              />
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
            </div>
          </div>

          <div className="space-y-3 text-left">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] pl-2">登录密码</label>
            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="请输入密码"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl py-5 pl-14 pr-14 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-medium"
              />
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={20} />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full py-5 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 rounded-[1.5rem] font-black text-white shadow-2xl shadow-indigo-600/30 transition-all active:scale-[0.98] mt-4"
          >
            {mode === 'login' ? '立即登录' : '开启实验'}
          </button>

          <div className="flex items-center gap-6 py-2">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">第三方登录</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className={`w-full py-5 bg-white/5 border border-slate-800 hover:bg-white/10 rounded-3xl flex items-center justify-center gap-4 transition-all group ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
            <span className="text-sm font-black text-slate-400 group-hover:text-slate-200">
              {isLoggingIn ? '正在连接...' : 'Google 账号登录'}
            </span>
          </button>
        </div>
      </GlassCard>
      
      <p className="mt-12 text-slate-600 text-xs font-medium">SomnoAI Lab • 高性能睡眠管理系统</p>
    </div>
  );
};
