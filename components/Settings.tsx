
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Bell, Shield, Smartphone, Globe, Info, LogOut, 
  ChevronRight, Moon, Key, CheckCircle2, AlertCircle, 
  Lock, ExternalLink, X, Save, Eye, EyeOff
} from 'lucide-react';

declare var window: any;

export const Settings: React.FC = () => {
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'missing'>('checking');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [manualKey, setManualKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const checkKey = async () => {
    if (window.aistudio?.hasSelectedApiKey) {
      try {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'active' : 'missing');
      } catch (err) {
        setKeyStatus('missing');
      }
    } else {
      // 检查环境变量是否存在（针对 Vercel 等环境）
      const envKey = typeof process !== 'undefined' ? process.env.API_KEY : null;
      setKeyStatus(envKey ? 'active' : 'missing');
    }
  };

  useEffect(() => {
    checkKey();
  }, []);

  const handleSaveManualKey = async () => {
    if (!manualKey.trim()) return;
    
    setIsSaving(true);
    try {
      if (window.aistudio?.openSelectKey) {
        // 触发系统密钥选择器，它通常支持粘贴和管理
        await window.aistudio.openSelectKey();
        await checkKey();
        setIsModalOpen(false);
      } else {
        alert("当前环境仅支持通过环境变量配置密钥。");
      }
    } catch (err) {
      console.error("Save key error", err);
    } finally {
      setIsSaving(false);
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
            value={keyStatus === 'active' ? '引擎已就绪' : '等待手动录入'} 
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
          <SettingItem icon={Smartphone} label="Google Fit" value="已同步昨日数据" color="emerald" />
          <SettingItem icon={Globe} label="数据同步" value="自动更新已开启" color="slate" />
        </GlassCard>
      </div>

      <div className="pt-4 px-2">
        <button className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all active:scale-95">
          <LogOut size={18} /> 退出数字实验室
        </button>
      </div>

      {/* 增强版 API Key 配置模态框 */}
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
              
              <h2 className="text-xl font-black tracking-tight text-white mb-2">配置 AI 引擎密钥</h2>
              <p className="text-xs text-slate-400 text-center leading-relaxed mb-8 px-4">
                为了激活“AI 睡眠洞察”和“智能教练”功能，请粘贴您的 Gemini API 密钥。我们绝不会在云端存储您的密钥。
              </p>

              <div className="w-full space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">API KEY</label>
                  <div className="relative group">
                    <input 
                      type={showKey ? "text" : "password"}
                      value={manualKey}
                      onChange={(e) => setManualKey(e.target.value)}
                      placeholder="在此处输入或粘贴密钥..."
                      className="w-full bg-slate-950/50 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-700"
                    />
                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                    <button 
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400"
                    >
                      {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={handleSaveManualKey}
                    disabled={isSaving || !manualKey}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin rounded-full"></span> : <Save size={16} />}
                    确认并保存
                  </button>
                  
                  <div className="h-px bg-white/5 my-2"></div>

                  <p className="text-[10px] text-slate-500 text-center italic">
                    或者使用系统的安全对话框：
                  </p>

                  <button 
                    onClick={async () => {
                      if (window.aistudio?.openSelectKey) {
                        await window.aistudio.openSelectKey();
                        checkKey();
                        setIsModalOpen(false);
                      }
                    }}
                    className="w-full py-3 border border-white/10 text-slate-300 hover:bg-white/5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                  >
                    通过 AI Studio 授权
                  </button>
                </div>

                <div className="pt-4 text-center border-t border-white/5">
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    获取免费 API 密钥 <ExternalLink size={10} />
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
