
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
      aria-label="Somno Digital Lab Neural Pulse Logo"
    >
      <defs>
        <linearGradient id="neuralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#22D3EE" />
        </linearGradient>

        <filter id="neuralGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        
        <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.3" />
          <stop offset="100%" stopColor="transparent" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 外围轨道 */}
      <circle cx="50" cy="50" r="45" stroke="white" strokeOpacity="0.03" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="35" stroke="white" strokeOpacity="0.05" strokeWidth="0.5" strokeDasharray="2 4" />

      {/* 背景晕染 */}
      <circle cx="50" cy="50" r="30" fill="url(#coreGlow)" />

      {/* 神经核核心 (六边形几何体) */}
      <m.path
        d="M50 25 L71.65 37.5 V62.5 L50 75 L28.35 62.5 V37.5 L50 25Z"
        stroke="url(#neuralGrad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        filter={threeD ? "url(#neuralGlow)" : "none"}
        animate={shouldAnimate ? {
          opacity: [0.6, 1, 0.6],
          scale: [0.98, 1.05, 0.98],
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 内部交叉脉冲线 */}
      <m.path
        d="M28.35 37.5 L71.65 62.5 M71.65 37.5 L28.35 62.5 M50 25 V75"
        stroke="url(#neuralGrad)"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        initial={{ pathLength: 0 }}
        animate={shouldAnimate ? {
          pathLength: [0, 1, 0],
        } : { pathLength: 1 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* 动态神经突触点 */}
      <m.circle 
        cx="50" cy="50" r="4" fill="white" 
        animate={shouldAnimate ? {
          scale: [1, 1.5, 1],
          opacity: [0.5, 1, 0.5],
          filter: ["blur(0px)", "blur(2px)", "blur(0px)"]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* 浮动的数据颗粒 */}
      {shouldAnimate && [0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 50 + 35 * Math.cos(rad);
        const y = 50 + 35 * Math.sin(rad);
        return (
          <m.circle
            key={i}
            cx={x}
            cy={y}
            r="1.5"
            fill="#22D3EE"
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
              rotate: angle + 360
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 1,
              ease: "easeInOut"
            }}
          />
        );
      })}
    </m.svg>
  );
};
