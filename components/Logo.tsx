
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
  const initialD = "M30 85 Q 40 75, 50 85 T 70 85";
  const waveD = "M30 85 Q 40 95, 50 85 T 70 85";

  return (
    <m.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="Somno Lab Neural Moon Logo"
    >
      <defs>
        <linearGradient id="moonGlow" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#00f2fe" />
        </linearGradient>
        
        <filter id="moonHalo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <mask id="moonMask">
          <circle cx="50" cy="50" r="40" fill="white" />
          <circle cx="70" cy="35" r="35" fill="black" />
        </mask>
      </defs>

      {/* 外部轨道暗示 */}
      <circle 
        cx="50" cy="50" r="48" 
        stroke="white" 
        strokeWidth="0.2" 
        strokeDasharray="2 6" 
        className="opacity-20" 
      />

      <m.g mask="url(#moonMask)">
        <m.circle
          cx="50" cy="50" r="40"
          fill="url(#moonGlow)"
          filter={threeD ? "url(#moonHalo)" : "none"}
          animate={shouldAnimate ? {
            opacity: [0.8, 1, 0.8],
            scale: [0.97, 1.03, 0.97]
          } : {}}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.g>

      {/* 卫星粒子 */}
      <m.g
        animate={shouldAnimate ? { rotate: [0, 360] } : {}}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <circle cx="50" cy="2" r="2.5" fill="#00f2fe" filter={threeD ? "url(#moonHalo)" : "none"} />
      </m.g>

      <m.path
        d={initialD}
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        className="opacity-20"
        animate={shouldAnimate ? {
          d: [
            initialD,
            waveD,
            initialD
          ]
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
    </m.svg>
  );
};
