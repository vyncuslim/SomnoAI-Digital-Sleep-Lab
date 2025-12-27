
import React, { useState } from 'react';
import { Moon, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617]">
      <div className="w-full max-w-md space-y-8 text-center mb-8">
        <div className="inline-flex p-4 bg-indigo-600/20 rounded-3xl mb-4 border border-indigo-500/30">
          <Moon className="text-indigo-400" size={48} />
        </div>
        <h1 className="text-3xl font-bold tracking-widest text-white">睡眠 AI 分析</h1>
        <p className="text-slate-400">智能优化您的睡眠质量</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700/50">
        <div className="flex bg-slate-800/50 rounded-2xl p-1 mb-8">
          <button 
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            登录
          </button>
          <button 
            onClick={() => setMode('register')}
            className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${mode === 'register' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            注册
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">邮箱</label>
            <div className="relative">
              <input 
                type="email" 
                placeholder="请输入邮箱"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">密码</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="请输入密码"
                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl py-4 pl-12 pr-12 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
              />
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <button 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            onClick={onLogin}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-2xl font-bold text-white shadow-xl shadow-indigo-500/20 transition-all active:scale-[0.98]"
          >
            {mode === 'login' ? '登录' : '立即注册'}
          </button>

          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-slate-700"></div>
            <span className="text-xs text-slate-500 font-bold">或</span>
            <div className="flex-1 h-px bg-slate-700"></div>
          </div>

          <button className="w-full py-4 bg-white/5 border border-slate-700 hover:bg-white/10 rounded-2xl flex items-center justify-center gap-3 transition-all">
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-70" />
            <span className="text-sm font-medium text-slate-300">使用 Google 账号登录</span>
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
