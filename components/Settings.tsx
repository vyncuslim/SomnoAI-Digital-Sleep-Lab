
import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard.tsx';
import { Bell, Shield, Smartphone, Globe, Info, LogOut, ChevronRight, Moon, Key, CheckCircle2, AlertCircle } from 'lucide-react';

declare var window: any;

export const Settings: React.FC = () => {
  const [keyStatus, setKeyStatus] = useState<'checking' | 'active' | 'missing'>('checking');

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setKeyStatus(hasKey ? 'active' : 'missing');
      } else {
        setKeyStatus('active'); // Assume active if not in AI Studio environment
      }
    };
    checkKey();
  }, []);

  const handleUpdateApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // After opening, we assume success as per guidelines
      setKeyStatus('active');
    } else {
      alert("当前环境不支持手动配置 API Key。系统将自动使用预置密钥。");
    }
  };

  const SettingItem = ({ icon: Icon, label, value, color, onClick, rightElement }: any) => (
    <button 
      onClick={onClick} 
      className="w-full flex items-center justify-between py-4 group disabled:opacity-50"
      disabled={!onClick}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-medium">{label}</p>
          {value && <p className="text-xs text-slate-500">{value}</p>}
        </div>
      </div>
      {rightElement || <ChevronRight size={18} className="text-slate-600" />}
    </button>
  );

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-slate-400">管理您的数字实验室偏好</p>
      </header>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">AI 安全与引擎</h3>
        <GlassCard className="divide-y divide-white/5 py-2 border-indigo-500/20">
          <div className="px-4 py-3 bg-indigo-500/5 rounded-2xl mx-2 mb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {keyStatus === 'active' ? (
                <CheckCircle2 size={16} className="text-emerald-400" />
              ) : keyStatus === 'missing' ? (
                <AlertCircle size={16} className="text-amber-400" />
              ) : (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full"></div>
              )}
              <span className="text-xs font-bold text-slate-300">
                AI 引擎状态: {keyStatus === 'active' ? '已就绪' : keyStatus === 'missing' ? '待配置' : '检查中...'}
              </span>
            </div>
          </div>
          <SettingItem 
            icon={Key} 
            label="管理 API 密钥" 
            value="点击进入安全配置界面以输入或更改您的密钥" 
            color="indigo" 
            onClick={handleUpdateApiKey}
          />
          <div className="p-4 bg-slate-900/40 m-2 rounded-2xl border border-white/5">
            <h4 className="text-xs font-black text-slate-400 uppercase mb-2">安全说明</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              为了保障您的隐私与账户安全，SomnoAI 使用加密的安全对话框处理 API 密钥。
              我们不会在本地持久化存储您的明文密钥，所有 AI 请求均通过加密通道传输。
              <br/><br/>
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-indigo-400 underline">了解关于 API 计费与额度的更多信息</a>
            </p>
          </div>
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">数据集成</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Smartphone} label="Google Fit" value="已连接并同步" color="emerald" />
          <SettingItem icon={Shield} label="隐私保护" value="端侧加密处理" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">应用信息</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Info} label="SomnoAI Lab v2.0" value="查看版本详情与更新日志" color="slate" />
          <button className="w-full flex items-center gap-4 py-4 px-4 text-red-400 font-bold hover:bg-red-500/5 transition-colors">
            <LogOut size={20} /> 退出登录
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
