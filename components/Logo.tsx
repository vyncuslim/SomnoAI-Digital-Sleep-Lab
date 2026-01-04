
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
        {/* 月光核心渐变 */}
        <linearGradient id="moonGlow" x1="20" y1="20" x2="80" y2="80">
          <stop offset="0%" stopColor="#e0e7ff" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
        
        {/* 月冕散乱辉光 */}
        <filter id="moonHalo" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 蒙版：用于切割出新月形 */}
        <mask id="moonMask">
          <circle cx="50" cy="50" r="35" fill="white" />
          <circle cx="65" cy="40" r="32" fill="black" />
        </mask>
      </defs>

      {/* 1. 背景微光圆环 - 模拟星轨 */}
      <circle 
        cx="50" cy="50" r="45" 
        stroke="white" 
        strokeWidth="0.5" 
        strokeDasharray="1 8" 
        className="opacity-20" 
      />

      {/* 2. 数字化新月主体 */}
      <motion.g mask="url(#moonMask)">
        <motion.circle
          cx="50" cy="50" r="35"
          fill="url(#moonGlow)"
          filter="url(#moonHalo)"
          animate={animated ? {
            opacity: [0.7, 1, 0.7],
            scale: [0.98, 1.02, 0.98]
          } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* 月面数字纹理 - 极细横线 */}
        {[25, 35, 45, 55, 65, 75].map((y, i) => (
          <line 
            key={i}
            x1="10" y1={y} x2="90" y2={y}
            stroke="white"
            strokeWidth="0.5"
            className="opacity-10"
          />
        ))}
      </motion.g>

      {/* 3. 轨道监控卫星 - 代表 AI 处理 */}
      <motion.g
        animate={animated ? {
          rotate: [0, 360]
        } : {}}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ originX: '50px', originY: '50px' }}
      >
        <circle cx="50" cy="5" r="2.5" fill="#818cf8" filter="url(#moonHalo)" />
        <motion.circle 
          cx="50" cy="5" r="5" 
          stroke="#818cf8" 
          strokeWidth="0.5" 
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.g>

      {/* 4. 底部脉冲线条 - 模拟睡眠脑波 */}
      <motion.path
        d="M30 85 Q 40 75, 50 85 T 70 85"
        stroke="url(#moonGlow)"
        strokeWidth="2"
        strokeLinecap="round"
        className="opacity-40"
        animate={animated ? {
          d: [
            "M30 85 Q 40 75, 50 85 T 70 85",
            "M30 85 Q 40 95, 50 85 T 70 85",
            "M30 85 Q 40 75, 50 85 T 70 85"
          ]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </motion.svg>
  );
};
