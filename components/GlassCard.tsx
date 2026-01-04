
import React from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverScale = false }) => {
  return (
    <motion.div 
      whileHover={hoverScale ? { scale: 1.01, translateY: -2 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-3xl bg-slate-900/40 border border-white/[0.05] rounded-[2.5rem] 
        shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all duration-500
        relative overflow-hidden group
        ${className}
      `}
    >
      {/* 顶部极细高光边 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent"></div>
      {/* 动态内发光 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
