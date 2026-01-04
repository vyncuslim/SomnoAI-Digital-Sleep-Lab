import React from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, ShieldCheck, FileText, Info, MessageSquare
} from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout }) => {
  const SettingItem = ({ icon: Icon, label, value, color, href, onClick }: any) => {
    const isExternal = !!href;

    const content = (
      <div className="w-full flex items-center justify-between py-4 group transition-all active:scale-[0.98] cursor-pointer">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
            <Icon size={20} />
          </div>
          <div className="text-left">
            <p className="font-semibold text-white group-hover:text-indigo-200 transition-colors">{label}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                {value}
              </p>
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
      </div>
    );

    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block w-full">
          {content}
        </a>
      );
    }

    return (
      <button onClick={onClick} className="block w-full text-left">
        {content}
      </button>
    );
  };

  const handleGeminiInfo = () => {
    alert("Gemini 核心引擎已通过环境变量安全载入。实验室计算处于最高优先级运行状态。");
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-1">
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">SomnoAI Digital Sleep Lab</h1>
        <p className="text-slate-400 mt-1">实验室引擎与数据同步偏好</p>
      </header>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">安全与计算引擎</h3>
        <GlassCard className="divide-y divide-white/5 py-2 border-indigo-500/20 bg-indigo-500/5">
          <SettingItem 
            icon={ShieldCheck} 
            label="Gemini 核心引擎" 
            value="系统已自动授权 • 正常运行" 
            color="indigo" 
            onClick={handleGeminiInfo}
          />
          <SettingItem icon={Shield} label="数据隐私" value="端侧加密存储" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">健康生态集成</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Smartphone} label="Google Fit" value="同步最近 7 天记录" color="emerald" />
          <SettingItem icon={Globe} label="自动更新" value="会话级实时同步" color="slate" />
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">帮助与反馈</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem 
            icon={MessageSquare} 
            label="反馈与建议" 
            value="联系开发者 ongyuze1401@gmail.com" 
            color="amber" 
            href="mailto:ongyuze1401@gmail.com"
          />
          <SettingItem icon={FileText} label="隐私权政策" value="查看详细声明" color="indigo" href="/privacy" />
          <SettingItem icon={Info} label="服务条款" value="查看使用约定" color="indigo" href="/terms" />
        </GlassCard>
      </div>

      <div className="pt-4 px-2">
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 transition-all active:scale-95"
        >
          <LogOut size={18} /> 退出并重载应用
        </button>
      </div>
    </div>
  );
};