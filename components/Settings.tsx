
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, Key, CheckCircle2, AlertCircle, 
  Lock, ExternalLink, X, Check, Eye, EyeOff, Save
} from 'lucide-react';

declare var window: any;
const MANUAL_KEY_STORAGE = 'SOMNO_MANUAL_API_KEY';

export const Settings: React.FC = () => {
  const [keyStatus, setKeyStatus] = useState<'active' | 'missing'>('missing');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const checkKey = () => {
    const stored = localStorage.getItem(MANUAL_KEY_STORAGE);
    const env = (globalThis as any).process?.env?.API_KEY;
    if (stored || env) {
      setKeyStatus('active');
      if (stored) setApiKey(stored);
    } else {
      setKeyStatus('missing');
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSave = () => {
    if (apiKey.trim().startsWith('AIza')) {
      localStorage.setItem(MANUAL_KEY_STORAGE, apiKey.trim());
      checkKey();
      setIsModalOpen(false);
    } else {
      alert("请输入有效的 Gemini API 密钥");
    }
  };

  const SettingItem = ({ icon: Icon, label, value, color, onClick, status }: any) => (
    <button 
      onClick={onClick} 
      className="w-full flex items-center justify-between py-4 group transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-semibold text-white group-hover:text-indigo-200 transition-colors">{label}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {status === 'active' && <CheckCircle2 size={12} className="text-emerald-400" />}
            {status === 'missing' && <AlertCircle size={12} className="text-amber-400" />}
            <p className={`text-[10px] font-bold uppercase tracking-wider ${status === 'missing' ? 'text-amber-400' : 'text-slate-500'}`}>
              {value}
            </p>
          </div>
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
    </button>
  );

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-1">
        <h1 className="text-3xl font-black tracking-tight text-white">设置</h1>
        <p className="text-slate-400 mt-1">实验室引擎与数据同步偏好</p>
      </header>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">安全与计算引擎</h3>
        <GlassCard className="divide-y divide-white/5 py-2 border-indigo-500/20 bg-indigo-500/5">
          <SettingItem 
            icon={Key} 
            label="Gemini API 密钥" 
            value={keyStatus === 'active' ? '引擎已就绪' : '等待手动配置'} 
            status={keyStatus}
            color="indigo" 
            onClick={() => setIsModalOpen(true)}
          />
          <SettingItem icon={Shield} label="数据隐私" value="端侧加密存储" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">健康生态集成</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Smartphone} label="Google Fit" value="已同步健康数据" color="emerald" />
          <SettingItem icon={Globe} label="自动更新" value="每 6 小时同步" color="slate" />
        </GlassCard>
      </div>

      <div className="pt-4 px-2">
        <button 
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all active:scale-95"
        >
          <LogOut size={18} /> 退出并重载应用
        </button>
      </div>

      {/* Manual API Key Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)} />
          <GlassCard className="relative w-full max-w-md p-8 border-indigo-500/30 animate-in zoom-in-95">
            <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 p-2 text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                <Lock size={28} />
              </div>
              <h2 className="text-xl font-black text-white mb-2">手动配置 API 密钥</h2>
              <p className="text-xs text-slate-400 text-center mb-8">
                请输入您的 Gemini API 密钥。此密钥仅存储在您的浏览器本地。
              </p>
              <div className="w-full space-y-4">
                <div className="relative">
                  <input 
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-4 pr-12 text-sm text-indigo-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button onClick={() => setShowKey(!showKey)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <button 
                  onClick={handleSave}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                >
                  <Save size={18} /> 保存并更新引擎
                </button>
                <div className="text-center pt-2">
                  <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 font-bold flex items-center justify-center gap-1 uppercase tracking-widest">
                    获取密钥 <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
