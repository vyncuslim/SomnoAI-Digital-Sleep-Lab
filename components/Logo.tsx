
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
      animate={animated ? {
        rotate: [0, 5, 0, -5, 0],
      } : {}}
      transition={animated ? {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      } : {}}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* 外圆环 */}
      <circle 
        cx="50" cy="50" r="45" 
        stroke="url(#logoGradient)" 
        strokeWidth="6" 
        strokeDasharray="10 5"
        className="opacity-20"
      />
      
      {/* 核心 S 型/勾合图形 */}
      <path
        d="M50 15C30.67 15 15 30.67 15 50C15 69.33 30.67 85 50 85C50 85 50 70 50 50C50 30 50 15 50 15Z"
        fill="url(#logoGradient)"
        filter="url(#glow)"
      />
      <path
        d="M50 15C69.33 15 85 30.67 85 50C85 69.33 69.33 85 50 85C50 85 50 70 50 50C50 30 50 15 50 15Z"
        fill="url(#logoGradient)"
        className="opacity-60"
        style={{ transformOrigin: 'center', transform: 'rotate(180deg)' }}
      />
      
      {/* 中心连接点 */}
      <circle cx="50" cy="50" r="6" fill="#fff" className="shadow-lg" />
    </motion.svg>
  );
};
