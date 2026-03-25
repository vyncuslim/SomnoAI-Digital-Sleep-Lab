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
            const currentSrc = target.src;
            
            if (currentSrc.endsWith('/logo_512.png') && !currentSrc.includes('ais-dev')) {
              // Try the dev URL provided in context if self-origin failed
              console.warn("Logo self-origin failed, trying dev URL fallback");
              target.src = "https://ais-dev-v4ejkidirch3jvmnuho5bc-29986613499.asia-east1.run.app/logo_512.png";
            } else {
              // Final fallback to a robust SVG placeholder
              console.error("All logo image sources failed, using SVG placeholder");
              target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='20' fill='%236366f1'/%3E%3Cpath d='M30 50 Q50 20 70 50 T70 80' fill='none' stroke='white' stroke-width='8' stroke-linecap='round'/%3E%3C/svg%3E";
              target.onerror = null; // Prevent infinite loop
            }
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
