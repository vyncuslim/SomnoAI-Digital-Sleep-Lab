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
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-[32%] bg-[#0A0D22] overflow-hidden border border-white/10 shadow-[0_0_40px_-10px_rgba(79,70,229,0.4)] group",
        className
      )}
      style={{ width: size, height: size }}
    >
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-50" />
      
      <motion.svg
        width="75%"
        height="75%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        animate={animated ? { 
          rotate: [0, 5, -5, 0],
          scale: [1, 1.02, 1]
        } : {}}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10"
      >
        {/* Dotted Circle - Rotating */}
        <motion.circle 
          cx="50" 
          cy="50" 
          r="42" 
          stroke="#1e293b" 
          strokeWidth="1.5" 
          strokeDasharray="3 6" 
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Crescent Moon - Refined */}
        <path 
          d="M68 32 C52 32 38 46 38 62 C38 72 43 81 51 86 C42 83 36 75 36 66 C36 50 49 37 65 37 C71 37 77 39 81 43 C78 36 68 32 68 32Z" 
          fill="url(#moonGradient)"
          className="drop-shadow-[0_0_8px_rgba(176,184,209,0.3)]"
        />
        


        {/* Orbiting Star - Animated */}
        <motion.circle
          cx="82" cy="52" r="2.5" fill="#93c5fd"
          initial={{ opacity: 0.2, scale: 0.8 }}
          animate={animated ? {
            x: [0, -20, -30, -20, 0, 20, 30, 20, 0],
            y: [0, -10, 0, 10, 0, -10, 0, 10, 0],
            opacity: [0.4, 0.8, 0.4, 0.8, 0.4],
            scale: [0.9, 1.1, 0.9, 1.1, 0.9]
          } : {}}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="drop-shadow-[0_0_8px_rgba(147,197,253,0.6)]"
        />

        <defs>
          <linearGradient id="moonGradient" x1="36" y1="32" x2="81" y2="86" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D1D5DB" />
            <stop offset="1" stopColor="#9CA3AF" />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Inner Shadow Overlay */}
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_20px_rgba(0,0,0,0.4)]" />
    </div>
  );
};
