
import React from 'react';
import { GlassCard } from './GlassCard.tsx';
import { Bell, Shield, Smartphone, Globe, Info, LogOut, ChevronRight, Moon } from 'lucide-react';

export const Settings: React.FC = () => {
  const SettingItem = ({ icon: Icon, label, value, color }: any) => (
    <button className="w-full flex items-center justify-between py-4 group">
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
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-slate-400">Manage your lab preferences</p>
      </header>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Account & Safety</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Shield} label="AI Privacy Mode" value="On-device processing preferred" color="indigo" />
          <SettingItem icon={Smartphone} label="Google Fit Integration" value="Last synced 5 mins ago" color="emerald" />
          <SettingItem icon={LogOut} label="Log Out" color="red" />
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Preferences</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Bell} label="Smart Wake Alarm" value="07:30 AM • Window: 30m" color="amber" />
          <SettingItem icon={Moon} label="Wind Down Reminder" value="10:30 PM" color="blue" />
          <SettingItem icon={Globe} label="Region & Units" value="English (US) • BPM/Mins" color="slate" />
        </GlassCard>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">About</h3>
        <GlassCard className="divide-y divide-white/5 py-2">
          <SettingItem icon={Info} label="SomnoAI Lab v1.4.2" color="slate" />
          <div className="p-4">
             <p className="text-[10px] text-slate-500 leading-relaxed">
               SomnoAI uses the Gemini 3 Flash model for personalized sleep coaching. 
               Data is processed securely via the Gemini API. 
               Built for high-performance recovery.
             </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
