
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
      aria-label="SomnoAI Lunar Lab Logo"
    >
      <defs>
        <linearGradient id="moonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#C084FC" />
        </linearGradient>

        <filter id="lunarGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <radialGradient id="lunarAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 月之晕影 */}
      <circle cx="50" cy="50" r="45" fill="url(#lunarAura)" />

      {/* 数字新月主体 */}
      <m.path
        d="M75 25 C50 25, 30 45, 30 70 C30 82, 35 92, 42 98 C30 90, 22 75, 22 60 C22 35, 42 15, 67 15 C75 15, 82 17, 88 20 C84 23, 80 25, 75 25Z"
        fill="url(#moonGrad)"
        filter={threeD ? "url(#lunarGlow)" : "none"}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={shouldAnimate ? {
          opacity: [0.8, 1, 0.8],
          scale: [0.98, 1.02, 0.98],
        } : { opacity: 1, scale: 1 }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 神经信号脉冲点 */}
      <m.circle 
        cx="32" cy="70" r="2.5" fill="white" 
        animate={shouldAnimate ? { scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <m.circle 
        cx="65" cy="18" r="2" fill="#C084FC" 
        animate={shouldAnimate ? { scale: [1, 2, 1], opacity: [0.3, 0.8, 0.3] } : {}}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
      
      {/* 扫掠光效 */}
      <m.path
        d="M35 60 Q50 50, 70 65"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        strokeOpacity="0.2"
        animate={shouldAnimate ? { pathLength: [0, 1, 0], opacity: [0, 0.3, 0] } : { opacity: 0.1 }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      />
    </m.svg>
  );
};
