
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
        backdrop-blur-3xl bg-slate-900/60 border border-white/[0.08] rounded-[1.5rem] 
        shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] transition-all duration-500
        relative overflow-hidden group
        ${className}
      `}
    >
      {/* 顶部极细高光边 */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
      
      {/* 装饰转角 - 左上 */}
      <div className="absolute top-3 left-3 w-1.5 h-1.5 border-t border-l border-white/20 rounded-tl-sm pointer-events-none"></div>
      {/* 装饰转角 - 右下 */}
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 border-b border-r border-white/20 rounded-br-sm pointer-events-none"></div>

      {/* 动态内发光 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      {/* 背景动态网格 */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      <div className="relative z-10 h-full">
        {children}
      </div>
    </motion.div>
  );
};
