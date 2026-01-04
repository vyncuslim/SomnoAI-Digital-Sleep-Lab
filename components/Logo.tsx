
import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ size = 24, className = '', animated = false }) => {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logoGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <linearGradient id="logoGradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
        <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 外围微弱感应圈 */}
      <motion.circle 
        cx="50" cy="50" r="46" 
        stroke="url(#logoGradPrimary)" 
        strokeWidth="1" 
        className="opacity-20"
        animate={animated ? {
          scale: [0.95, 1.05, 0.95],
          opacity: [0.1, 0.3, 0.1]
        } : {}}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* 核心双旋 S 结构 */}
      <motion.g
        animate={animated ? {
          rotate: [0, 360]
        } : {}}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: 'center' }}
      >
        {/* 上旋臂 - 象征 REM 认知 */}
        <motion.path
          d="M50 25C35 25 25 35 25 50C25 65 35 75 50 75"
          stroke="url(#logoGradSecondary)"
          strokeWidth="10"
          strokeLinecap="round"
          filter="url(#softGlow)"
          animate={animated ? {
            pathLength: [0.8, 1, 0.8],
            strokeWidth: [8, 11, 8]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* 下旋臂 - 象征深度修复 */}
        <motion.path
          d="M50 25C65 25 75 35 75 50C75 65 65 75 50 75"
          stroke="url(#logoGradPrimary)"
          strokeWidth="10"
          strokeLinecap="round"
          className="opacity-80"
          animate={animated ? {
            pathLength: [1, 0.8, 1],
            strokeWidth: [11, 8, 11]
          } : {}}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.g>

      {/* 中心流光点 */}
      <motion.circle 
        cx="50" cy="50" r="3" 
        fill="#fff" 
        animate={animated ? {
          opacity: [0.2, 0.8, 0.2],
          scale: [0.8, 1.2, 0.8]
        } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </motion.svg>
  );
};
