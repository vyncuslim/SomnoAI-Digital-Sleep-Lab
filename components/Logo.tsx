
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
      aria-label="Somno Lab Blue Sphere Moon Logo"
    >
      <defs>
        <radialGradient id="moonBaseGradient" cx="50%" cy="50%" r="50%" fx="35%" fy="35%">
          <stop offset="0%" stopColor="#A5B4FC" />
          <stop offset="40%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </radialGradient>
        
        <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="craterInnerShadow">
          <feOffset dx="0.5" dy="0.5" />
          <feGaussianBlur stdDeviation="1" result="offset-blur" />
          <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
          <feFlood floodColor="black" floodOpacity="0.4" result="color" />
          <feComposite operator="in" in="color" in2="inverse" result="shadow" />
          <feComposite operator="over" in="shadow" in2="SourceGraphic" />
        </filter>
      </defs>

      {/* 外部大气层光晕 */}
      {threeD && (
        <m.circle
          cx="50"
          cy="50"
          r="46"
          fill="#4F46E5"
          fillOpacity="0.1"
          animate={shouldAnimate ? { scale: [1, 1.08, 1], opacity: [0.1, 0.2, 0.1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* 月球主体 - 高级质感蓝色球体 */}
      <m.circle
        cx="50"
        cy="50"
        r="40"
        fill="url(#moonBaseGradient)"
        filter={threeD ? "url(#moonGlow)" : "none"}
        animate={shouldAnimate ? {
          rotate: [0, 5, 0],
          scale: [0.99, 1.01, 0.99]
        } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      />

      {/* 真实环形山纹理 - 对应截图中的坑位特征 */}
      <g opacity="0.15" filter="url(#craterInnerShadow)">
        <circle cx="32" cy="38" r="7" fill="white" />
        <circle cx="68" cy="42" r="5" fill="white" />
        <circle cx="48" cy="68" r="8" fill="white" />
        <circle cx="28" cy="62" r="4" fill="white" />
        <circle cx="72" cy="22" r="3" fill="white" />
      </g>

      {/* 表面漫反射层 */}
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="white"
        fillOpacity="0.05"
        style={{ pointerEvents: 'none' }}
      />

      {/* 环绕的数字粒子 */}
      {shouldAnimate && (
        <m.g
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ originX: '50px', originY: '50px' }}
        >
          <circle cx="50" cy="5" r="1.5" fill="#00F2FE" filter="url(#moonGlow)" />
        </m.g>
      )}
    </m.svg>
  );
};
