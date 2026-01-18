
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
      aria-label="Somno Crescent Moon Logo"
    >
      <defs>
        {/* Crescent body gradient: Soft lavender-blue light */}
        <linearGradient id="crescentGrad" x1="30%" y1="20%" x2="70%" y2="80%">
          <stop offset="0%" stopColor="#E0E7FF" />
          <stop offset="100%" stopColor="#C7D2FE" />
        </linearGradient>
        
        {/* Particle Glow (Neural Hub) */}
        <radialGradient id="particleGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </radialGradient>

        {/* Global Bloom / Soft Atmosphere */}
        <filter id="bloom" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Particle specific glow */}
        <filter id="particleBloom">
          <feGaussianBlur stdDeviation="3.5" result="pBlur" />
          <feMerge>
            <feMergeNode in="pBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* 1. Orbit Ring (Dotted/Subtle) - Matches the lab background aesthetic */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="white"
        strokeWidth="0.5"
        strokeDasharray="1 6"
        strokeOpacity="0.15"
      />

      {/* 2. Main Crescent Moon Shape - Mathematically defined for precision */}
      <m.path
        d="M68 82 C45 82 25 62 25 38 C25 24 32 12 43 5 C34 14 29 27 29 42 C29 64 47 82 69 82 C76 82 82 80 87 76 C81 81 75 82 68 82 Z"
        fill="url(#crescentGrad)"
        filter={threeD ? "url(#bloom)" : "none"}
        animate={shouldAnimate ? {
          rotate: [0, 1.5, -1.5, 0],
          scale: [1, 1.02, 1]
        } : {}}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* 3. The Neural Particle (Glowing Node) - Positioned at Top Right */}
      <m.g
        animate={shouldAnimate ? {
          y: [-1, 1, -1],
          opacity: [0.8, 1, 0.8]
        } : {}}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Glow Aura */}
        <circle 
          cx="78" 
          cy="22" 
          r="7" 
          fill="#818CF8" 
          fillOpacity="0.15" 
          filter="blur(4px)"
        />
        {/* Core Node */}
        <circle 
          cx="78" 
          cy="22" 
          r="2.8" 
          fill="url(#particleGrad)" 
          filter="url(#particleBloom)"
        />
        {/* Center Spark */}
        <circle 
          cx="78" 
          cy="22" 
          r="0.8" 
          fill="white" 
        />
      </m.g>

      {/* 4. Subtle Ambient Particles */}
      {threeD && shouldAnimate && (
        <g opacity="0.3">
          <m.circle 
            cx="20" cy="70" r="0.4" fill="white" 
            animate={{ opacity: [0.2, 0.8, 0.2] }} 
            transition={{ duration: 3, repeat: Infinity, delay: 0.2 }} 
          />
          <m.circle 
            cx="85" cy="50" r="0.4" fill="white" 
            animate={{ opacity: [0.1, 0.6, 0.1] }} 
            transition={{ duration: 5, repeat: Infinity, delay: 1 }} 
          />
        </g>
      )}
    </m.svg>
  );
};
