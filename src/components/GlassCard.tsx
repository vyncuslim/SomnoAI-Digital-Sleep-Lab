import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../utils/cn';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'light' | 'interactive';
  intensity?: 'low' | 'medium' | 'high';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  variant = 'default',
  intensity = 'medium',
  ...props 
}) => {
  const baseStyles = "rounded-2xl border backdrop-blur-xl transition-all duration-300";
  
  const variants = {
    default: "bg-white/5 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
    dark: "bg-black/40 border-white/5 shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]",
    light: "bg-white/10 border-white/20 shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
    interactive: "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)] cursor-pointer"
  };

  const intensities = {
    low: "backdrop-blur-sm",
    medium: "backdrop-blur-md",
    high: "backdrop-blur-xl"
  };

  return (
    <motion.div 
      className={cn(baseStyles, variants[variant], intensities[intensity], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
