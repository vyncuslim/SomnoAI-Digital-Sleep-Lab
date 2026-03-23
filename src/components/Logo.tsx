import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'zh';
  code?: string;
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, code }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src="/logo_512.png" 
        alt="SomnoAI Logo" 
        className="w-10 h-10 object-contain"
        onError={(e) => {
          console.error("Logo image failed to load", e);
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {showText && (
        <div className="flex flex-col min-w-fit">
          <span className="text-xl font-black italic tracking-tighter text-white leading-none whitespace-nowrap">
            SomnoAI<span className="text-indigo-500"> Digital Sleep Lab</span>
          </span>
          {code && (
            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] italic mt-1">
              {code}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
