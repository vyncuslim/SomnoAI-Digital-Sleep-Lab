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
        <linearGradient id="moonGlow" x1="20" y1="20" x2="80" y2="80">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        
        <filter id="moonHalo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <mask id="moonMask">
          <circle cx="50" cy="50" r="35" fill="white" />
          <circle cx="65" cy="40" r="32" fill="black" />
        </mask>
      </defs>

      <circle 
        cx="50" cy="50" r="45" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeDasharray="1 8" 
        className="opacity-10" 
      />

      <m.g mask="url(#moonMask)">
        <m.circle
          cx="50" cy="50" r="35"
          fill="url(#moonGlow)"
          filter={threeD ? "url(#moonHalo)" : "none"}
          animate={shouldAnimate ? {
            opacity: [0.7, 1, 0.7],
            scale: [0.98, 1.02, 0.98]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      </m.g>

      <m.g
        animate={shouldAnimate ? { rotate: [0, 360] } : {}}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <circle cx="50" cy="5" r="2.5" fill="#818cf8" filter={threeD ? "url(#moonHalo)" : "none"} />
      </m.g>

      <m.path
        d={initialD || ""}
        stroke="url(#moonGlow)"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-30"
        animate={shouldAnimate ? {
          d: [
            initialD,
            "M30 85 Q 40 95, 50 85 T 70 85",
            initialD
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </m.svg>
  );
};