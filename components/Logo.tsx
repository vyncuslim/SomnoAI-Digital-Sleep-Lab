import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LogoProps {
  size?: number;
  animated?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, animated = false, className }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(className)}
      animate={animated ? { rotate: 360 } : {}}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
    >
      <path d="M65 20 C45 20, 25 40, 25 65 C25 78, 30 88, 38 94 C25 86, 18 71, 18 56 C18 31, 38 11, 63 11 C71 11, 78 13, 84 16 C80 19, 75 20, 70 20" fill="#6366F1"/>
      <circle cx="78" cy="32" r="6" fill="#818CF8"/>
    </motion.svg>
  );
};
