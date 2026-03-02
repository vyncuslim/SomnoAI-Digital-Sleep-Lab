import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className, intensity = 1 }) => {
  return (
    <motion.div
      className={twMerge(
        'relative overflow-hidden backdrop-blur-md border border-white/10 bg-white/5 shadow-lg',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
