
import React from 'react';
import { GlassCard } from './GlassCard.tsx';
import { 
  Shield, Smartphone, Globe, LogOut, 
  ChevronRight, ShieldCheck, FileText, Info
} from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
  onLegalPage?: (page: 'privacy' | 'terms') => void;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout, onLegalPage }) => {
  const SettingItem = ({ icon: Icon, label, value, color, onClick, href }: any) => {
    const Component = href ? 'a' : 'button';
    return (
      <Component 
        onClick={onClick} 
        href={href}
        target={href ? "_blank" : undefined}
        className="w-full flex items-center justify-between py-4 group transition-all active:scale-[0.98] cursor-pointer"
      >
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
      </Component>
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-1">
        <h1 className="text-3xl font-black tracking-tight text-white">设置</h1>
        <p className="text-slate-400 mt-1">实验室引擎与数据同步偏好</p>
      </header>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">安全与计算引擎</h3>
        <GlassCard className="divide-y divide-white/5 py-2 border-indigo-500/20 bg-indigo-500/5">
          <div className="px-4 py-4 flex items-center gap-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <ShieldCheck size={20} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-white">Gemini 核心引擎</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">系统已自动授权</p>
            </div>
          </div>
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
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">法律与合规</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={FileText} label="隐私权政策" value="查看详细声明" color="indigo" href="https://vyncuslim.github.io/privacy.html" />
          <SettingItem icon={Info} label="服务条款" value="查看使用约定" color="indigo" href="https://vyncuslim.github.io/terms.html" />
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
