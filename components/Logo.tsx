
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
      aria-label="Somno Master Moon Logo"
    >
      <defs>
        {/* 高精度核心球体渐变：模拟深空蓝色的体积感 */}
        <radialGradient id="masterMoonGradient" cx="30%" cy="30%" r="70%" fx="30%" fy="30%">
          <stop offset="0%" stopColor="#DDE4FF" />
          <stop offset="25%" stopColor="#7C72FF" />
          <stop offset="60%" stopColor="#2D20A6" />
          <stop offset="100%" stopColor="#0B0E23" />
        </radialGradient>
        
        {/* 边缘流光渐变 (Rim Light) */}
        <linearGradient id="rimLight" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.4" />
          <stop offset="50%" stopColor="white" stopOpacity="0" />
        </linearGradient>

        {/* 分层光晕滤镜：核心辉光 + 外部扩散 */}
        <filter id="ultraGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coreBlur" />
          <feGaussianBlur stdDeviation="6" result="outerBlur" />
          <feFlood floodColor="#6366F1" floodOpacity="0.5" result="glowColor" />
          <feComposite in="glowColor" in2="outerBlur" operator="in" result="softGlow" />
          <feMerge>
            <feMergeNode in="softGlow" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* 坑洞内部阴影 */}
        <filter id="craterInner">
          <feDropShadow dx="-0.5" dy="-0.5" stdDeviation="0.4" floodOpacity="0.5"/>
        </filter>
      </defs>

      {/* 1. 环境大气层：极弱的波动光圈 */}
      {threeD && (
        <m.circle
          cx="50"
          cy="50"
          r="49"
          stroke="#818cf8"
          strokeWidth="0.5"
          strokeOpacity="0.1"
          animate={shouldAnimate ? { scale: [1, 1.05, 1], opacity: [0.1, 0.3, 0.1] } : {}}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* 2. 主球体核心 */}
      <m.circle
        cx="50"
        cy="50"
        r="40"
        fill="url(#masterMoonGradient)"
        filter={threeD ? "url(#ultraGlow)" : "none"}
        style={{ transformOrigin: 'center' }}
        animate={shouldAnimate ? {
          rotate: [0, 2, -2, 0],
        } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3. 表面细节：月球坑洞的有机分布 */}
      <g opacity="0.15" style={{ mixBlendMode: 'plus-lighter' }}>
        <circle cx="35" cy="42" r="6" fill="#1E1B4B" filter="url(#craterInner)" />
        <circle cx="65" cy="35" r="4.5" fill="#1E1B4B" filter="url(#craterInner)" />
        <circle cx="48" cy="62" r="7.5" fill="#1E1B4B" filter="url(#craterInner)" />
        <circle cx="72" cy="58" r="3.2" fill="#1E1B4B" filter="url(#craterInner)" />
        <circle cx="28" cy="68" r="4" fill="#1E1B4B" filter="url(#craterInner)" />
      </g>

      {/* 4. 边缘流光：增强3D感 */}
      <circle
        cx="50"
        cy="50"
        r="39.5"
        stroke="url(#rimLight)"
        strokeWidth="1.5"
        strokeOpacity="0.2"
        fill="none"
        style={{ pointerEvents: 'none' }}
      />

      {/* 5. 顶部高光反射 */}
      <circle
        cx="40"
        cy="40"
        r="12"
        fill="white"
        fillOpacity="0.06"
        style={{ pointerEvents: 'none' }}
      />

      {/* 6. 轨道卫星（青蓝色数据点）：对标视觉参考中的关键元素 */}
      {shouldAnimate && (
        <m.g
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ originX: '50px', originY: '50px' }}
        >
          <m.circle 
            cx="50" 
            cy="-2" 
            r="3.5" 
            fill="#00F2FE" 
            animate={{ 
              opacity: [0.6, 1, 0.6],
              scale: [0.9, 1.2, 0.9]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.8))' }}
          />
        </m.g>
      )}
    </m.svg>
  );
};
