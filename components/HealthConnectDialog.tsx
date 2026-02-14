import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, SlidersHorizontal, History, Footprints, HeartPulse, Ruler, Activity, Moon, Scale, Mail, User, Info, Zap } from 'lucide-react';
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
        <div className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-xl">
          <m.div 
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="w-full max-w-[480px] bg-[#020617] rounded-t-[3rem] sm:rounded-[4rem] border border-white/10 overflow-hidden shadow-[0_0_120px_rgba(0,0,0,1)] flex flex-col max-h-[94vh]"
          >
            {/* Dark Mode Header */}
            <div className="pt-12 pb-8 flex flex-col items-center relative overflow-hidden">
               <div className="absolute top-0 inset-x-0 h-40 bg-indigo-600/10 blur-[80px] -z-10" />
               <div className="w-20 h-20 mb-6 p-4 bg-slate-900 rounded-[2.5rem] shadow-inner border border-white/5 flex items-center justify-center">
                  <Logo size={48} animated={true} />
               </div>
               <h1 className="text-[20px] font-black text-white text-center px-12 leading-tight tracking-tighter italic uppercase">
                 Neural Ingress <span className="text-indigo-400">Authorization</span>
               </h1>
            </div>

            {/* Description Grid */}
            <div className="px-10 py-8 space-y-6 bg-white/[0.02] border-y border-white/5">
              <div className="flex gap-5 items-start">
                <div className="shrink-0 p-2 bg-indigo-500/10 text-indigo-400 rounded-xl"><SlidersHorizontal size={18} strokeWidth={2.5} /></div>
                <p className="text-[13px] text-slate-400 leading-relaxed font-medium italic">
                  Select biometric telemetry streams to bridge with Health Connect.
                </p>
              </div>
            </div>

            {/* Scrollable Permissions List */}
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
               {/* Allow All Switch */}
               <div className="bg-indigo-600/10 rounded-[2.5rem] p-7 mt-8 mb-8 flex items-center justify-between mx-2 border border-indigo-500/20 shadow-inner">
                  <div className="space-y-0.5">
                    <span className="text-[15px] font-black text-white block uppercase tracking-tight italic">Universal Access</span>
                    <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-black opacity-80">Full Laboratory Ingress</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={allowAll} onChange={(e) => handleToggleAll(e.target.checked)} />
                    <div className="w-[56px] h-8 bg-slate-800 rounded-full peer peer-checked:bg-indigo-600 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[24px] transition-colors shadow-inner"></div>
                  </label>
               </div>

               {/* Specific Scopes */}
               <div className="px-4 space-y-8 pb-10">
                  <h2 className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase border-b border-white/5 pb-4 italic">Telemetry nodes</h2>
                  {permissions.map((p) => (
                    <div key={p.id} className="flex items-center justify-between group">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-400 border border-white/5 group-hover:text-white group-hover:border-indigo-500/30 transition-all shadow-inner">
                           <p.icon size={22} strokeWidth={2} />
                        </div>
                        <span className="text-[15px] text-slate-200 font-bold leading-none italic group-hover:text-white transition-colors">{p.label}</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={p.enabled} onChange={() => handleToggleOne(p.id)} />
                        <div className="w-[56px] h-8 bg-slate-800 rounded-full peer peer-checked:bg-indigo-500/60 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-[24px] transition-colors"></div>
                      </label>
                    </div>
                  ))}
               </div>
            </div>

            {/* Fixed Footer */}
            <div className="px-10 py-10 bg-[#01040a] flex gap-5 border-t border-white/5">
               <button 
                 onClick={onClose}
                 className="flex-1 py-5 text-center text-slate-500 font-black text-[11px] uppercase tracking-widest rounded-full border border-white/5 hover:bg-white/5 active:scale-95 transition-all italic"
               >
                 Decline
               </button>
               <button 
                 onClick={onAllow}
                 disabled={!anyEnabled}
                 className={`flex-1 py-5 text-center font-black text-[11px] uppercase tracking-[0.4em] rounded-full transition-all active:scale-95 italic shadow-2xl ${anyEnabled ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/20' : 'bg-slate-900 text-slate-700 cursor-not-allowed border border-white/5'}`}
               >
                 Synchronize
               </button>
            </div>

            <div className="bg-[#01040a] pb-6 flex justify-center">
              <div className="w-20 h-1.5 bg-indigo-500 rounded-full opacity-[0.2]" />
            </div>
          </m.div>
        </div>
      )}
    </AnimatePresence>
  );
};