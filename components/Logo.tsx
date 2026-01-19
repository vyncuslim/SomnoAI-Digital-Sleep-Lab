
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
      aria-label="Somno Digital Lab Visual Identity"
    >
      <defs>
        {/* 月亮主体渐变 - 匹配图中的柔和蓝灰色 */}
        <linearGradient id="crescentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>

        {/* 节点发光背景 */}
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>

        {/* 核心发光滤镜 */}
        <filter id="coreBloom" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        
        {/* 阴影滤镜增加厚度感 */}
        <filter id="moonShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. 外层点状轨道 (Dotted Orbit) */}
      <circle
        cx="50"
        cy="50"
        r="38"
        stroke="white"
        strokeWidth="0.8"
        strokeDasharray="0.8 7.5"
        strokeOpacity="0.15"
        strokeLinecap="round"
      />

      {/* 2. 底部支架线 (Base Support) */}
      <line 
        x1="40" y1="80" x2="60" y2="80" 
        stroke="#94A3B8" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeOpacity="0.4"
      />

      {/* 3. 厚重新月 (The Thick Crescent) - 精确重现图片中的几何比例 */}
      <m.path
        d="M65 72 C48 72 34 58 34 41 C34 26 42 13 54 6 C42 16 38 31 38 43 C38 60 51 70 68 70 C72 70 76 69 80 66 C76 70 71 72 65 72 Z"
        fill="url(#crescentGrad)"
        filter={threeD ? "url(#moonShadow)" : "none"}
        animate={shouldAnimate ? {
          y: [0, -1, 0],
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 4. 右下角神经节点 (Neural Node at 4 o'clock position) */}
      <m.g
        transform="translate(74, 63)"
        animate={shouldAnimate ? {
          opacity: [0.7, 1, 0.7],
          scale: [0.95, 1.05, 0.95]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* 节点外圆圈 */}
        <circle 
          cx="0" cy="0" r="7" 
          fill="#1E293B" 
          stroke="white" 
          strokeWidth="0.5" 
          strokeOpacity="0.1" 
        />
        
        {/* 内嵌方块背景 */}
        <rect 
          x="-3.5" y="-3.5" width="7" height="7" rx="1" 
          fill="#1E293B" 
        />

        {/* 发光方块核心 */}
        <rect 
          x="-2" y="-2" width="4" height="4" rx="0.5" 
          fill="url(#nodeGlow)" 
          filter="url(#coreBloom)"
        />
        
        {/* 核心微点 */}
        <circle cx="0" cy="0" r="0.6" fill="white" />
      </m.g>

      {/* 5. 环境光渲染 */}
      {threeD && (
        <circle 
          cx="50" cy="50" r="45" 
          fill="url(#nodeGlow)" 
          fillOpacity="0.02" 
          pointerEvents="none" 
        />
      )}
    </m.svg>
  );
};
