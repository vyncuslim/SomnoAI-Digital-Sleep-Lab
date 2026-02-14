import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

const m = motion as any;

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  className = '', 
  animated = false
}) => {
  return (
    <div style={{ width: size, height: size }} className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <m.svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SomnoAI Logo"
      >
        <defs>
          <linearGradient id="moonSurface" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#4f46e5" />
          </linearGradient>
          <filter id="neuralGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 轨道 */}
        <m.circle 
          cx="50" cy="50" r="46" 
          stroke="#e2e8f0" 
          strokeWidth="1" 
          strokeDasharray="4 8"
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        />

        {/* 核心月牙 */}
        <m.path
          d="M65 20 C45 20, 25 40, 25 65 C25 78, 30 88, 38 94 C25 86, 18 71, 18 56 C18 31, 38 11, 63 11 C71 11, 78 13, 84 16 C80 19, 75 20, 70 20"
          fill="url(#moonSurface)"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />

        {/* 神经激活点 */}
        <m.circle
          cx="78"
          cy="32"
          r="6"
          fill="#6366f1"
          filter="url(#neuralGlow)"
          animate={animated ? {
            scale: [1, 1.4, 1],
            opacity: [0.8, 1, 0.8],
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.svg>
    </div>
  );
};