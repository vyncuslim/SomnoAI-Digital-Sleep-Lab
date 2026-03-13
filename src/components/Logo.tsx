import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'zh';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        {/* HUD Elements */}
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-pulse-soft" />
        <div className="absolute inset-[-4px] border border-dashed border-indigo-500/10 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
        
        <img 
          src={`${import.meta.env.BASE_URL}logo_512.png`} 
          alt="SomnoAI Logo" 
          className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]"
          referrerPolicy="no-referrer"
        />
      </div>
      {showText && (
        <div className="flex flex-col min-w-fit">
          <span className="text-xl font-black italic tracking-tighter text-white leading-none whitespace-nowrap">
            SomnoAI<span className="text-indigo-500"> Digital Sleep Lab</span>
          </span>
          <span className="micro-label opacity-40 mt-1">NEURAL_TELEMETRY_V4.2</span>
        </div>
      )}
    </div>
  );
};
