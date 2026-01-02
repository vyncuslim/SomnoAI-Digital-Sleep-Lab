import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`
        backdrop-blur-2xl bg-[#0f172a]/40 border border-white/[0.04] rounded-[2rem] 
        shadow-[0_12px_40px_-12px_rgba(0,0,0,0.5)] hover:border-white/[0.08] transition-all duration-500
        relative overflow-hidden
        ${className}
      `}
    >
      {/* 极细微的光晕效果 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none"></div>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </div>
  );
};