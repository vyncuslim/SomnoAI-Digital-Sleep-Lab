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
            <radialGradient id="planetGrad" cx="35" cy="35" r="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFE066" />
              <stop offset="0.3" stopColor="#FF7A00" />
              <stop offset="0.6" stopColor="#D50032" />
              <stop offset="1" stopColor="#1A0033" />
            </radialGradient>
            
            {/* Ring Gradient */}
            <linearGradient id="ringGrad" x1="20" y1="60" x2="80" y2="40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FF3366" />
              <stop offset="0.5" stopColor="#FF99CC" />
              <stop offset="1" stopColor="#33CCFF" />
            </linearGradient>

            {/* Top Right Swoosh Gradient */}
            <linearGradient id="swooshTopRight" x1="50" y1="10" x2="80" y2="80" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#CCFFFF" />
              <stop offset="0.2" stopColor="#00E5FF" />
              <stop offset="0.5" stopColor="#0055FF" />
              <stop offset="1" stopColor="#1A0066" />
            </linearGradient>

            {/* Bottom Swoosh Gradient */}
            <linearGradient id="swooshBottom" x1="80" y1="50" x2="20" y2="90" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FF3399" />
              <stop offset="0.5" stopColor="#CC00FF" />
              <stop offset="1" stopColor="#330099" />
            </linearGradient>

            {/* Left Swoosh Gradient */}
            <linearGradient id="swooshLeft" x1="20" y1="80" x2="40" y2="10" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FF99CC" />
              <stop offset="0.3" stopColor="#FF5500" />
              <stop offset="0.7" stopColor="#FFCC00" />
              <stop offset="1" stopColor="#FFFFCC" />
            </linearGradient>
          </defs>
          
          {/* Left Swoosh (Orange/Yellow/Pink) */}
          <path d="M 55 15 C 20 15, 5 40, 15 70 C 20 85, 45 95, 60 90 C 30 85, 15 55, 30 30 C 40 15, 55 15, 55 15 Z" fill="url(#swooshLeft)" />
          
          {/* Bottom Swoosh (Magenta/Purple) */}
          <path d="M 90 40 C 95 70, 65 95, 25 85 C 10 80, 10 80, 10 80 C 40 100, 85 85, 95 50 C 100 35, 90 40, 90 40 Z" fill="url(#swooshBottom)" />
          
          {/* Top Right Swoosh (Cyan/Blue) */}
          <path d="M 40 15 C 75 10, 100 30, 85 70 C 80 85, 80 85, 80 85 C 100 50, 80 15, 50 10 C 40 8, 40 15, 40 15 Z" fill="url(#swooshTopRight)" />

          {/* Back part of the ring */}
          <path d="M 30 55 C 35 45, 65 35, 70 45" stroke="url(#ringGrad)" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.4" />

          {/* Central Planet */}
          <circle cx="48" cy="48" r="14" fill="url(#planetGrad)" />
          
          {/* Planet Crater/Highlight */}
          <circle cx="53" cy="44" r="3" fill="#FF99CC" opacity="0.6" />
          <circle cx="42" cy="42" r="1.5" fill="#FFFFFF" opacity="0.8" />

          {/* Front part of the ring */}
          <path d="M 28 55 C 35 65, 70 55, 72 45" stroke="url(#ringGrad)" strokeWidth="3" fill="none" strokeLinecap="round" />
          
          {/* Stars */}
          <circle cx="25" cy="25" r="1.5" fill="#FFCC00" opacity="0.9" />
          <path d="M 25 21 L 25 29 M 21 25 L 29 25" stroke="#FFCC00" strokeWidth="0.5" opacity="0.8" />
          
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
