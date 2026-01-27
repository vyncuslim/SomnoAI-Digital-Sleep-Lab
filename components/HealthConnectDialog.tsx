import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, SlidersHorizontal, History, Footprints, HeartPulse, Ruler, Activity, Moon, Scale, Mail, User, Info } from 'lucide-react';
import { Logo } from './Logo.tsx';

const m = motion as any;

interface PermissionItem {
  id: string;
  label: string;
  icon: any;
  enabled: boolean;
}

interface HealthConnectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
  appName?: string;
}

export const HealthConnectDialog: React.FC<HealthConnectDialogProps> = ({ 
  isOpen, 
  onClose, 
  onAllow,
  appName = "SomnoAI Digital Sleep Lab"
}) => {
  const [allowAll, setAllowAll] = useState(false);
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    { id: 'distance', label: 'Distance & Location', icon: Footprints, enabled: false },
    { id: 'exercise', label: 'Exercise & Activity', icon: Activity, enabled: false },
    { id: 'heart_rate', label: 'Heart rate', icon: HeartPulse, enabled: false },
    { id: 'sleep', label: 'Sleep patterns', icon: Moon, enabled: false },
    { id: 'height', label: 'Height', icon: Ruler, enabled: false },
    { id: 'weight', label: 'Weight', icon: Scale, enabled: false },
    { id: 'profile', label: 'Profile information', icon: User, enabled: false },
    { id: 'email', label: 'Email address', icon: Mail, enabled: false },
  ]);

  const handleToggleAll = (val: boolean) => {
    setAllowAll(val);
    setPermissions(prev => prev.map(p => ({ ...p, enabled: val })));
  };

  const handleToggleOne = (id: string) => {
    setPermissions(prev => {
      const next = prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p);
      setAllowAll(next.every(p => p.enabled));
      return next;
    });
  };

  const anyEnabled = permissions.some(p => p.enabled) || allowAll;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-[2px]">
          <m.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="w-full max-w-[460px] bg-[#fdfcff] rounded-t-[2.5rem] sm:rounded-[3rem] overflow-hidden shadow-2xl flex flex-col max-h-[94vh]"
          >
            {/* 品牌顶部：使用月亮 Logo 替换 Google 图标 */}
            <div className="pt-10 pb-6 flex flex-col items-center">
               <div className="w-16 h-16 mb-5 p-1 bg-white rounded-[1.5rem] shadow-sm border border-slate-100 flex items-center justify-center">
                  <Logo size={48} animated={true} />
               </div>
               <h1 className="text-[22px] font-black text-[#1c1b1f] text-center px-10 leading-snug tracking-tighter italic">
                 Allow {appName} to access Health Connect?
               </h1>
            </div>

            {/* 说明列表 */}
            <div className="px-10 py-6 space-y-6 bg-[#f7f8fd]">
              <div className="flex gap-4 items-start">
                <div className="shrink-0 p-1.5 bg-blue-50 text-blue-600 rounded-lg"><SlidersHorizontal size={18} strokeWidth={2.5} /></div>
                <p className="text-[14px] text-[#44474e] leading-relaxed font-medium">
                  Choose data that you want this app to read or write to Health Connect
                </p>
              </div>
              <div className="flex gap-4 items-start">
                <div className="shrink-0 p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><History size={18} strokeWidth={2.5} /></div>
                <p className="text-[14px] text-[#44474e] leading-relaxed font-medium">
                  Permissions include data from the past 30 days and future telemetry.
                </p>
              </div>
            </div>

            {/* 可滚动权限列表 */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
               {/* 全部允许开关 */}
               <div className="bg-[#eef1fb] rounded-[2.5rem] p-6 mt-6 mb-8 flex items-center justify-between mx-2 border border-blue-100/50">
                  <div className="space-y-0.5">
                    <span className="text-[16px] font-black text-[#1c1b1f] block uppercase tracking-tight italic">Allow all</span>
                    <span className="text-[11px] text-[#44474e] uppercase tracking-widest font-black opacity-50">Full Lab Access</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={allowAll} onChange={(e) => handleToggleAll(e.target.checked)} />
                    <div className="w-[52px] h-8 bg-[#e1e2ec] rounded-full peer peer-checked:bg-[#0b57d0] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[20px] transition-colors"></div>
                  </label>
               </div>

               {/* 细分权限 */}
               <div className="px-4 space-y-8 pb-10">
                  <h2 className="text-[12px] font-black text-[#74777f] tracking-[0.2em] uppercase border-b border-slate-100 pb-4 italic">Read permissions</h2>
                  {permissions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 shadow-sm border border-slate-100">
                           <p.icon size={20} strokeWidth={2} />
                        </div>
                        <span className="text-[16px] text-[#1c1b1f] font-bold leading-none italic">{p.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={p.enabled} onChange={() => handleToggleOne(p.id)} />
                        <div className="w-[52px] h-8 bg-[#e1e2ec] rounded-full peer peer-checked:bg-[#0b57d0] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[20px] transition-colors"></div>
                      </label>
                    </div>
                  ))}
               </div>
            </div>

            {/* 底部操作 */}
            <div className="px-8 py-8 bg-white flex gap-4 border-t border-[#e1e2ec] shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
               <button 
                 onClick={onClose}
                 className="flex-1 py-4 text-center text-[#0b57d0] font-black text-[12px] uppercase tracking-widest rounded-full border border-[#74777f] hover:bg-slate-50 active:scale-95 transition-all italic"
               >
                 Cancel
               </button>
               <button 
                 onClick={onAllow}
                 disabled={!anyEnabled}
                 className={`flex-1 py-4 text-center font-black text-[12px] uppercase tracking-[0.3em] rounded-full transition-all active:scale-95 italic ${anyEnabled ? 'bg-[#0b57d0] text-white shadow-lg' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
               >
                 Allow
               </button>
            </div>

            <div className="bg-white pb-4 flex justify-center">
              <div className="w-20 h-1.5 bg-[#1c1b1f] rounded-full opacity-[0.08]" />
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};