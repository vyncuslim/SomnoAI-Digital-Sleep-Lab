
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, SlidersHorizontal, History, Footprints, HeartPulse, Ruler, Timer, PersonStanding, Activity } from 'lucide-react';

const m = motion as any;

interface PermissionItem {
  id: string;
  label: string;
  icon: React.ElementType;
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
  appName = "SomnoAI Lab"
}) => {
  const [allowAll, setAllowAll] = useState(false);
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    { id: 'distance', label: 'Distance', icon: Footprints, enabled: false },
    { id: 'exercise', label: 'Exercise', icon: Activity, enabled: false },
    { id: 'heart_rate', label: 'Heart rate', icon: HeartPulse, enabled: false },
    { id: 'height', label: 'Height', icon: Ruler, enabled: false },
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
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-[1px]">
          <m.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-[440px] bg-[#f8f9ff] rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[96vh]"
          >
            {/* Top Branding Section */}
            <div className="pt-12 pb-6 flex flex-col items-center">
               <div className="w-16 h-16 mb-6">
                  <svg viewBox="0 0 48 48" className="w-full h-full drop-shadow-sm">
                    <defs>
                      <linearGradient id="hc-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#4285F4" />
                        <stop offset="100%" stopColor="#1967D2" />
                      </linearGradient>
                    </defs>
                    <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16z" fill="url(#hc-logo-grad)" />
                    <circle cx="24" cy="24" r="8" fill="url(#hc-logo-grad)" />
                    <path d="M30 18l-9 9-4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
               </div>
               <h1 className="text-[24px] font-normal text-[#1c1b1f] text-center px-12 leading-tight">
                 Allow {appName} to access Health Connect?
               </h1>
            </div>

            {/* Instruction List */}
            <div className="px-8 space-y-7 pb-8">
              <div className="flex gap-5 items-start">
                <div className="shrink-0 mt-0.5"><SlidersHorizontal size={22} className="text-[#44474e]" strokeWidth={2} /></div>
                <p className="text-[15px] text-[#44474e] leading-snug">
                  Choose data that you want this app to read or write to Health Connect
                </p>
              </div>
              <div className="flex gap-5 items-start">
                <div className="shrink-0 mt-0.5"><History size={22} className="text-[#44474e]" strokeWidth={2} /></div>
                <p className="text-[15px] text-[#44474e] leading-snug">
                  If you give read access, this app can read new data and data from the past 30 days
                </p>
              </div>
              <div className="flex gap-5 items-start">
                <div className="shrink-0 mt-0.5"><Shield size={22} className="text-[#44474e]" strokeWidth={2} /></div>
                <p className="text-[15px] text-[#44474e] leading-snug">
                  You can learn how {appName} handles your data in the developer's <span className="text-[#0b57d0] underline cursor-pointer font-medium decoration-1 underline-offset-2">privacy policy</span>
                </p>
              </div>
            </div>

            {/* Scrollable Toggle List */}
            <div className="flex-1 overflow-y-auto px-4 pb-4 scrollbar-hide">
               {/* Allow All Switch */}
               <div className="bg-[#eef1fb] rounded-[2rem] p-6 mb-8 flex items-center justify-between mx-1">
                  <span className="text-[18px] font-normal text-[#1c1b1f]">Allow all</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={allowAll} onChange={(e) => handleToggleAll(e.target.checked)} />
                    <div className="w-[52px] h-8 bg-[#e1e2ec] rounded-full peer peer-checked:bg-[#0b57d0] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-[#74777f] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[20px] peer-checked:after:border-none"></div>
                  </label>
               </div>

               {/* Granular Permissions */}
               <div className="px-4 space-y-9">
                  <h2 className="text-[14px] font-medium text-[#44474e] tracking-tight">Allow '{appName}' to read</h2>
                  {permissions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-6">
                        <p.icon size={22} className="text-[#1c1b1f]" strokeWidth={1.5} />
                        <span className="text-[18px] text-[#1c1b1f] font-normal leading-none">{p.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={p.enabled} onChange={() => handleToggleOne(p.id)} />
                        <div className="w-[52px] h-8 bg-[#e1e2ec] rounded-full peer peer-checked:bg-[#0b57d0] after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-[#74777f] after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[20px] peer-checked:after:border-none"></div>
                      </label>
                    </div>
                  ))}
               </div>
            </div>

            {/* Bottom Actions */}
            <div className="px-6 py-6 bg-white flex gap-4">
               <button 
                 onClick={onClose}
                 className="flex-1 py-3.5 text-center text-[#0b57d0] font-medium text-[14px] rounded-full border border-[#74777f] hover:bg-slate-50 active:bg-slate-100 transition-colors"
               >
                 Cancel
               </button>
               <button 
                 onClick={onAllow}
                 className={`flex-1 py-3.5 text-center font-medium text-[14px] rounded-full transition-all ${anyEnabled ? 'bg-[#0b57d0] text-white' : 'bg-[#1c1b1f1f] text-[#1c1b1f61] cursor-not-allowed'}`}
               >
                 Allow
               </button>
            </div>

            {/* Android Navigation Bar Simulator */}
            <div className="bg-white pb-3 flex justify-center">
              <div className="w-24 h-1.5 bg-[#1c1b1f] rounded-full opacity-10" />
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};
