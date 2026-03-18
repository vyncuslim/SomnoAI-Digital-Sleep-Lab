import React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
  className?: string;
}

export const TimePicker: React.FC<TimePickerProps> = ({ 
  label, 
  value, 
  onChange, 
  icon = <Clock size={14} />,
  className = "" 
}) => {
  return (
    <div className={`group/input ${className}`}>
      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-focus-within/input:text-indigo-400 transition-colors">
        {icon}
        {label}
      </label>
      <div className="relative">
        <input 
          type="time" 
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono hover:border-white/10 appearance-none"
          style={{ colorScheme: 'dark' }}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
          <Clock size={16} />
        </div>
      </div>
    </div>
  );
};
