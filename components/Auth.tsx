
import React, { useState, useEffect } from 'react';
import { Moon, Key, AlertCircle, CheckCircle2, Eye, EyeOff, Save, ShieldCheck, Lock, Loader2, Info } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';

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
      alert("AI 核心配置成功。");
    } else {
      alert("请输入有效的 Gemini API 密钥");
    }
  };

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    console.log("Initiating Google Fit authorization...");
    
    try {
      // Direct call to authorize to preserve user-gesture event
      await googleFit.authorize();
      console.log("Google Fit connected successfully.");
      onLogin();
    } catch (error: any) {
      console.error("Authorization flow interrupted:", error);
      alert(`${error.message || '连接失败'}\n\n建议：请确保浏览器没有拦截弹出窗口，并在 Google 警告页面点击“高级 -> 前往 mgx.dev”进行授权。`);
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
        <p className="text-slate-400 font-medium px-4 leading-relaxed tracking-wide">数字化睡眠实验室系统</p>
      </div>

      <GlassCard className="w-full max-w-md p-8 border-slate-700/50 bg-slate-900/60 shadow-2xl space-y-6">
        {/* Engine Config */}
        <div className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-500 ${
          hasStoredKey ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'
        }`}>
          {hasStoredKey ? <CheckCircle2 className="text-emerald-500" size={18} /> : <AlertCircle className="text-amber-500" size={18} />}
          <div className="flex-1 text-left">
            <p className="text-xs font-bold text-white">AI 核心: {hasStoredKey ? '准备就绪' : '待配置'}</p>
            <button 
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5 hover:text-indigo-300 transition-colors"
            >
              {showKeyInput ? '收起设置' : '配置计算引擎'}
            </button>
          </div>
        </div>

        {showKeyInput && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
            <div className="relative">
              <input 
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Gemini API Key (AIza...)"
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-4 pl-4 pr-12 text-sm text-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button 
                onClick={() => setShowKey(!showKey)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <button 
              onClick={handleSaveKey}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Save size={16} /> 保存并激活
            </button>
          </div>
        )}

        <div className="space-y-4 pt-2">
          <div className="p-4 bg-white/5 rounded-2xl border border-white/10 mb-4 text-left">
            <div className="flex items-center gap-2 mb-2">
              <Lock size={14} className="text-indigo-400" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">数据主权声明</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              实验室将通过 Google Fit 获取真实的生理指标。所有计算均在端侧完成，授权令牌仅暂存于内存。
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
                提示：若出现“应用未经验证”，请点击弹窗中的<span className="text-slate-400 font-bold"> 高级 -> 前往 mgx.dev </span>即可继续。
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
