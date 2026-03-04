import React from 'react';
import { motion } from 'framer-motion';

export const Logo: React.FC<{ className?: string; showText?: boolean }> = ({ className = "", showText = true }) => {
  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 drop-shadow-lg">
          <defs>
            {/* Planet Gradient */}
            <radialGradient id="planetGrad" cx="35" cy="35" r="45" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFD166" />
              <stop offset="0.3" stopColor="#EF476F" />
              <stop offset="0.7" stopColor="#118AB2" />
              <stop offset="1" stopColor="#073B4C" />
            </radialGradient>
            
            {/* Ring Gradient */}
            <linearGradient id="ringGrad" x1="20" y1="60" x2="80" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FF5470" />
              <stop offset="1" stopColor="#FDE24F" />
            </linearGradient>

            {/* Top Right Swoosh Gradient (Cyan/Blue) */}
            <linearGradient id="swooshTopRight" x1="30" y1="10" x2="80" y2="70" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#48CAE4" />
              <stop offset="0.5" stopColor="#0077B6" />
              <stop offset="1" stopColor="#023E8A" />
            </linearGradient>

            {/* Bottom Swoosh Gradient (Magenta/Purple) */}
            <linearGradient id="swooshBottom" x1="80" y1="40" x2="20" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#F72585" />
              <stop offset="0.5" stopColor="#7209B7" />
              <stop offset="1" stopColor="#3A0CA3" />
            </linearGradient>

            {/* Left Swoosh Gradient (Orange/Pink) */}
            <linearGradient id="swooshLeft" x1="20" y1="80" x2="50" y2="20" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FEE440" />
              <stop offset="0.3" stopColor="#F15BB5" />
              <stop offset="0.7" stopColor="#9B5DE5" />
              <stop offset="1" stopColor="#3A0CA3" />
            </linearGradient>
          </defs>
          
          {/* Left Swoosh (Orange/Yellow/Pink) */}
          <path d="M 50 15 C 20 20, 10 50, 25 75 C 30 85, 45 95, 65 90 C 35 85, 20 60, 30 35 C 35 25, 45 20, 60 25 C 55 20, 52 15, 50 15 Z" fill="url(#swooshLeft)" />
          
          {/* Bottom Swoosh (Magenta/Purple) */}
          <path d="M 85 45 C 95 70, 75 95, 40 90 C 25 85, 15 80, 15 80 C 45 105, 90 90, 95 55 C 97 45, 90 40, 85 45 Z" fill="url(#swooshBottom)" />
          
          {/* Top Right Swoosh (Cyan/Blue) */}
          <path d="M 40 20 C 60 5, 90 20, 85 60 C 80 75, 75 80, 75 80 C 95 50, 80 10, 45 10 C 35 10, 30 15, 40 20 Z" fill="url(#swooshTopRight)" />

          {/* Back part of the ring */}
          <path d="M 25 55 C 30 45, 65 35, 75 45" stroke="url(#ringGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.5" />

          {/* Central Planet */}
          <circle cx="50" cy="50" r="16" fill="url(#planetGrad)" />
          
          {/* Planet Crater/Highlight */}
          <circle cx="44" cy="42" r="4" fill="#FFFFFF" opacity="0.8" />
          <circle cx="56" cy="46" r="2" fill="#FFFFFF" opacity="0.4" />

          {/* Front part of the ring */}
          <path d="M 22 55 C 30 68, 70 58, 78 45" stroke="url(#ringGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Stars */}
          <circle cx="25" cy="25" r="1.5" fill="#FFCC00" opacity="0.9" />
          <circle cx="80" cy="20" r="1" fill="#33CCFF" opacity="0.8" />
          <circle cx="15" cy="75" r="1" fill="#CC00FF" opacity="0.8" />
          <circle cx="85" cy="65" r="1.5" fill="#FFFFFF" opacity="0.9" />
          <circle cx="75" cy="80" r="1" fill="#FFFFFF" opacity="0.6" />
          <circle cx="65" cy="85" r="0.8" fill="#FFFFFF" opacity="0.4" />
          <circle cx="35" cy="45" r="0.8" fill="#FFCC00" opacity="0.8" />
        </svg>
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 whitespace-nowrap">
          SomnoAI Digital Sleep Lab
        </span>
      )}
    </motion.div>
  );
};
