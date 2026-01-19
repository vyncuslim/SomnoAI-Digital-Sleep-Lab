
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
      aria-label="Somno Digital Lab Crescent Logo"
    >
      <defs>
        {/* 月亮主体渐变：柔和的灰紫色调 */}
        <linearGradient id="labMoonGrad" x1="20%" y1="20%" x2="80%" y2="80%">
          <stop offset="0%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#94A3B8" />
        </linearGradient>
        
        {/* 右侧节点发光渐变 */}
        <radialGradient id="nodeGlowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>

        {/* 柔和辉光滤镜 */}
        <filter id="labBloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 核心节点辉光 */}
        <filter id="nodeBloom">
          <feGaussianBlur stdDeviation="4" result="nb" />
          <feMerge>
            <feMergeNode in="nb" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. 外部虚线轨道环 - 匹配参考图中的科技感 */}
      <m.circle
        cx="50"
        cy="50"
        r="42"
        stroke="white"
        strokeWidth="0.8"
        strokeDasharray="1 8"
        strokeOpacity="0.1"
        animate={shouldAnimate ? { rotate: 360 } : {}}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        style={{ originX: '50px', originY: '50px' }}
      />

      {/* 2. 底部底座线 - 增加结构感 */}
      <line 
        x1="40" y1="85" x2="60" y2="85" 
        stroke="#94A3B8" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeOpacity="0.4"
      />

      {/* 3. 新月造型 - 深度定制的数学曲线以匹配参考图 */}
      <m.path
        d="M60 78 C42 78 28 64 28 46 C28 34 34 22 44 16 C36 24 32 35 32 46 C32 62 45 75 61 75 C66 75 70 74 74 71 C70 76 65 78 60 78 Z"
        fill="url(#labMoonGrad)"
        filter={threeD ? "url(#labBloom)" : "none"}
        animate={shouldAnimate ? {
          y: [0, -2, 0],
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 4. 右侧发光神经节点 - 匹配参考图中的位置和光效 */}
      <m.g
        animate={shouldAnimate ? {
          opacity: [0.7, 1, 0.7],
          scale: [0.95, 1.05, 0.95]
        } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* 节点背景圆环 */}
        <circle 
          cx="75" 
          cy="60" 
          r="6" 
          fill="#4F46E5" 
          fillOpacity="0.1" 
        />
        {/* 节点核心 */}
        <circle 
          cx="75" 
          cy="60" 
          r="3" 
          fill="url(#nodeGlowGrad)" 
          filter="url(#nodeBloom)"
        />
        {/* 极小的闪烁白点 */}
        <circle 
          cx="75" 
          cy="60" 
          r="0.8" 
          fill="white" 
        />
      </m.g>

      {/* 5. 环境背景微光 (仅在 Logo 较大时可见) */}
      {threeD && (
        <circle 
          cx="50" cy="50" r="48" 
          fill="url(#nodeGlowGrad)" 
          fillOpacity="0.02" 
        />
      )}
    </m.svg>
  );
};
