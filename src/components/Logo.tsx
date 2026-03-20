import React from 'react';
import logoUrl from '../logo_512.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'zh';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <img 
        src={logoUrl} 
        alt="SomnoAI Logo" 
        className="w-10 h-10 object-contain"
      />
      {showText && (
        <div className="flex flex-col min-w-fit">
          <span className="text-xl font-black italic tracking-tighter text-white leading-none whitespace-nowrap">
            SomnoAI<span className="text-indigo-500"> Digital Sleep Lab</span>
          </span>
        </div>
      )}
    </div>
  );
};
