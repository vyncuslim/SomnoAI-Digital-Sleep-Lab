
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
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{value}</p>
            </div>
          </div>
        </div>
        <ChevronRight size={18} className="text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
      </div>
    );
    return isExternal ? <a href={href} className="block w-full">{content}</a> : <button onClick={onClick} className="block w-full text-left">{content}</button>;
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="px-1">
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight">Digital Sleep Lab</h1>
        <p className="text-slate-400 mt-1">Engine & Data Sync Preferences</p>
      </header>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Security & Calculation</h3>
        <GlassCard className="divide-y divide-white/5 py-2 border-indigo-500/20 bg-indigo-500/5">
          <SettingItem icon={ShieldCheck} label="Gemini Core Engine" value="Authorized • Active" color="indigo" onClick={() => alert("Core initialized.")} />
          <SettingItem icon={Shield} label="Data Privacy" value="Edge-Encrypted Storage" color="blue" />
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Health Ecosystem</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Smartphone} label="Google Fit" value="Syncing Last 7 Days" color="emerald" />
          <SettingItem icon={Globe} label="Auto Update" value="Session-Level Sync" color="slate" />
        </GlassCard>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] px-2">Support</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={MessageSquare} label="Feedback" value="Contact ongyuze1401@gmail.com" color="amber" href="mailto:ongyuze1401@gmail.com" />
          <SettingItem icon={FileText} label="Privacy Policy" value="View Statement" color="indigo" href="/privacy" />
          <SettingItem icon={Info} label="Terms of Service" value="Usage Agreement" color="indigo" href="/terms" />
        </GlassCard>
      </div>

      <div className="pt-4 px-2">
        <button onClick={onLogout} className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl font-bold hover:bg-red-500/20 active:scale-95 transition-all">
          <LogOut size={18} /> Sign Out & Reload
        </button>
      </div>
    </div>
  );
};
