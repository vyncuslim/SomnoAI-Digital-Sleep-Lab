import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassCardProps extends HTMLMotionProps<"div"> {
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ className, intensity = 1, children, ...props }) => {
  return (
    <motion.div
      className={cn(
        "bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl shadow-xl",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
