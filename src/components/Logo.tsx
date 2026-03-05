import React from 'react';
import { Moon } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'zh';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, lang = 'en' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-full animate-pulse" />
        <div className="relative z-10 w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-white/10">
          <Moon className="text-white fill-white/20" size={22} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black italic tracking-tighter text-white leading-none">
            DIGITAL<span className="text-indigo-500"> SLEEP LAB</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 leading-none mt-1">
            {lang === 'zh' ? "您的AI驱动睡眠伴侣" : "AI Powered Analysis"}
          </span>
        </div>
      )}
    </div>
  );
};
