import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 rounded-full" />
        <img src="/favicon.svg" alt="SomnoAI Logo" className="relative w-8 h-8 object-contain" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black italic tracking-tighter uppercase leading-none text-white">
            SomnoAI <span className="text-indigo-400 font-medium">Digital Sleep Lab</span>
          </span>
        </div>
      )}
    </div>
  );
};
