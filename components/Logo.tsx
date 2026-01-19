
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
  threeD?: boolean;
  staticMode?: boolean;
}

const m = motion as any;

export const Logo: React.FC<LogoProps> = ({ 
  size = 24, 
  className = '', 
  animated = false, 
  threeD = true,
  staticMode = false 
}) => {
  const shouldAnimate = animated && !staticMode;

  return (
    <m.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="SomnoAI Neural Lab Logo"
    >
      <defs>
        <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id="moonSurface" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
      </defs>

      {/* Orbital Dash Ring */}
      <m.circle 
        cx="50" cy="50" r="46" 
        stroke="#1E293B" 
        strokeWidth="0.5" 
        strokeDasharray="1 4"
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      {/* Sharp Crescent Moon */}
      <m.path
        d="M65 20 C45 20, 25 40, 25 65 C25 78, 30 88, 38 94 C25 86, 18 71, 18 56 C18 31, 38 11, 63 11 C71 11, 78 13, 84 16 C80 19, 75 20, 70 20"
        fill="url(#moonSurface)"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
      />

      {/* Pulsing North Star (Neural Center) */}
      <m.g
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <m.circle
          cx="78"
          cy="32"
          r="4"
          fill="#818CF8"
          filter="url(#neuralGlow)"
          animate={shouldAnimate ? {
            scale: [1, 1.8, 1],
            opacity: [0.6, 1, 0.6],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Star Crosslines */}
        <m.path 
          d="M78 24 V40 M70 32 H86" 
          stroke="#818CF8" 
          strokeWidth="0.5" 
          strokeLinecap="round"
          animate={shouldAnimate ? { rotate: [0, 90], opacity: [0.2, 0.5, 0.2] } : {}}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </m.g>
    </m.svg>
  );
};
