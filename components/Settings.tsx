
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, Key, CheckCircle2, AlertCircle, 
  Lock, ExternalLink, X, Check
} from 'lucide-react';

declare var window: any;

export const Settings: React.FC = () => {
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'missing'>('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if an API key has been selected using the official method
  const checkKey = async () => {
    setKeyStatus('checking');
    if (window.aistudio?.hasSelectedApiKey) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        if (hasKey) {
          setKeyStatus('active');
          return;
        }
      } catch (err) {
        console.warn("AI Studio key check failed", err);
      }
    }
    setKeyStatus('missing');
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleOpenSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // As per guidelines, assume success after triggering the selection to avoid race conditions
      setKeyStatus('active');
      setIsModalOpen(false);
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
            value={keyStatus === 'active' ? '引擎已激活' : '等待授权'} 
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

      {/* API Key Authorization Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" 
            onClick={() => setIsModalOpen(false)}
          />
          <GlassCard className="relative w-full max-w-md p-8 border-indigo-500/30 shadow-[0_0_80px_rgba(79,70,229,0.15)] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20">
                <Lock size={28} />
              </div>
              
              <h2 className="text-xl font-black tracking-tight text-white mb-2">AI 引擎授权</h2>
              <p className="text-xs text-slate-400 text-center leading-relaxed mb-8 px-4">
                驱动 SomnoAI 的深度睡眠分析需要有效的 Gemini API 密钥。请点击下方按钮完成授权。
              </p>

              <div className="w-full space-y-5">
                <button 
                  onClick={handleOpenSelectKey}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check size={18} strokeWidth={3} />
                  使用 AI Studio 授权
                </button>

                <div className="pt-4 text-center border-t border-white/5">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    了解计费与密钥说明 <ExternalLink size={10} />
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
