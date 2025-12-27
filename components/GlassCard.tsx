
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
        backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 
        shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] hover:bg-white/[0.08] transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
};
