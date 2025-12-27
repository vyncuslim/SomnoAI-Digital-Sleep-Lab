
import React, { useState, useEffect } from 'react';
import { Moon, Mail, Key, AlertCircle, CheckCircle2, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

declare var google: any;
declare var window: any;

const MANUAL_KEY_STORAGE = 'SOMNO_MANUAL_API_KEY';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [hasStoredKey, setHasStoredKey] = useState(false);
  const [showKeyInput, setShowKeyInput] = useState(false);

  useEffect(() => {
    // 安全检查是否存在 API Key
    const checkKey = () => {
      const stored = localStorage.getItem(MANUAL_KEY_STORAGE);
      const env = (globalThis as any).process?.env?.API_KEY;
      setHasStoredKey(!!(stored || env));
      if (stored) setApiKey(stored);
    };
    checkKey();
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim().startsWith('AIza')) {
      localStorage.setItem(MANUAL_KEY_STORAGE, apiKey.trim());
      setHasStoredKey(true);
      setShowKeyInput(false);
      alert("API 密钥已安全保存至本地。");
    } else {
      alert("请输入有效的 Gemini API 密钥 (以 AIza 开头)");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await googleFit.authorize();
      onLogin();
    } catch (error: any) {
      alert(error.message || '登录失败');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full"></div>
      
      <div className="w-full max-w-md space-y-8 text-center mb-8 animate-in slide-in-from-top duration-700">
        <div className="inline-flex p-5 bg-indigo-600/20 rounded-[2.5rem] mb-4 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 relative">
          <Moon className="text-indigo-400" size={56} />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-white mb-2">SomnoAI</h1>
        <p className="text-slate-400 font-medium px-4 leading-relaxed">"科学地夺回您的深度睡眠"</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700/50 bg-slate-900/60 shadow-2xl space-y-6">
        {/* API Key Status */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
          hasStoredKey ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          {hasStoredKey ? <CheckCircle2 className="text-emerald-500" size={18} /> : <AlertCircle className="text-amber-500" size={18} />}
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-white">AI 引擎: {hasStoredKey ? '已就绪' : '未连接'}</p>
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5"
            >
              {showKeyInput ? '收起设置' : (hasStoredKey ? '修改 API 密钥' : '点击录入 API 密钥')}
            </button>
          </div>
        </div>

        {/* Manual Key Input Field */}
        {showKeyInput && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative group">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="粘贴您的 Gemini API Key (AIza...)"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button 
              onClick={handleSaveKey}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
            >
              <Save size={16} /> 保存配置
            </button>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-5 bg-white text-slate-950 hover:bg-slate-100 rounded-[1.5rem] flex items-center justify-center gap-4 transition-all shadow-xl font-bold"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>{isLoggingIn ? '同步中...' : '使用 Google 账号登录'}</span>
          </button>

          <button 
            onClick={onLogin}
            className="w-full py-4 bg-indigo-600/10 border border-indigo-600/30 text-indigo-400 hover:bg-indigo-600/20 rounded-2xl font-bold transition-all"
          >
            访客模式登录
          </button>
        </div>
      </GlassCard>
      
      <div className="mt-8 flex items-center gap-2 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
        <ShieldCheck size={12} />
        SomnoAI Digital Lab v2.1
      </div>
    </div>
  );
};
