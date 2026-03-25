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
      <div className="relative w-10 h-10 flex-shrink-0">
        <img 
          src="/logo_512.png" 
          alt="SomnoAI Logo" 
          className="w-full h-full object-contain rounded-xl shadow-lg shadow-indigo-500/20"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            console.error("Logo image failed to load from /logo_512.png, trying fallback. Path:", target.src);
            target.src = "https://ais-dev-v4ejkidirch3jvmnuho5bc-29986613499.asia-east1.run.app/logo_512.png";
            target.onerror = () => {
              console.error("Secondary logo fallback failed, using placeholder");
              target.src = "https://picsum.photos/seed/sleep/200/200";
            };
          }}
        />
        <div className="absolute inset-0 rounded-xl border border-white/10 pointer-events-none" />
      </div>
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
