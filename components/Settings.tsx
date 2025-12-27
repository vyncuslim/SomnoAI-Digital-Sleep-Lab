
import React from 'react';
import { GlassCard } from './GlassCard.tsx';
import { Bell, Shield, Smartphone, Globe, Info, LogOut, ChevronRight, Moon, Key } from 'lucide-react';

declare var window: any;

export const Settings: React.FC = () => {
  const handleUpdateApiKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      alert("API Key 已更新成功！");
    }
  };

  const SettingItem = ({ icon: Icon, label, value, color, onClick }: any) => (
    <button onClick={onClick} className="w-full flex items-center justify-between py-4 group">
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
          <Icon size={20} />
        </div>
        <div className="text-left">
          <p className="font-medium">{label}</p>
          {value && <p className="text-xs text-slate-500">{value}</p>}
        </div>
      </div>
      <ChevronRight size={18} className="text-slate-600" />
    </button>
  );

  return (
    <div className="space-y-6 pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">设置</h1>
        <p className="text-slate-400">管理您的数字实验室偏好</p>
      </header>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">账号与安全</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem 
            icon={Key} 
            label="AI 引擎配置" 
            value="点击更新 Gemini API Key" 
            color="indigo" 
            onClick={handleUpdateApiKey}
          />
          <SettingItem icon={Smartphone} label="Google Fit 集成" value="已连接" color="emerald" />
          <SettingItem icon={Shield} label="隐私模式" value="端侧处理优先" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">偏好设置</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Bell} label="智能唤醒闹钟" value="07:30 AM" color="amber" />
          <SettingItem icon={Moon} label="睡前助眠提醒" value="10:30 PM" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">关于</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Info} label="SomnoAI Lab v2.0" color="slate" />
          <div className="p-4">
             <p className="text-[10px] text-slate-500 leading-relaxed">
               由 Gemini 3 Flash 模型驱动的专业级睡眠分析。
               您的数据将通过加密通道安全传输。
             </p>
          </div>
          <button className="w-full flex items-center gap-4 py-4 px-4 text-red-400 font-bold">
            <LogOut size={20} /> 退出登录
          </button>
        </GlassCard>
      </div>
    </div>
  );
};
