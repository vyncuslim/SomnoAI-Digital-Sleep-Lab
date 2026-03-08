import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
  lang?: 'en' | 'zh';
}

export const Logo: React.FC<LogoProps> = ({ className = "", showText = true, lang = 'en' }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        {/* HUD Elements */}
        <div className="absolute inset-0 border border-indigo-500/20 rounded-full animate-pulse-soft" />
        <div className="absolute inset-[-4px] border border-dashed border-indigo-500/10 rounded-full animate-spin" style={{ animationDuration: '10s' }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_#6366f1]" />
        
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(129,140,248,0.4)]">
          <defs>
            <linearGradient id="blueSwirl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="30%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <linearGradient id="pinkSwirl" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fbcfe8" />
              <stop offset="40%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#4c1d95" />
            </linearGradient>
            <linearGradient id="orangeSwirl" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#f97316" />
              <stop offset="100%" stopColor="#9a3412" />
            </linearGradient>
            <linearGradient id="planetGrad" x1="20%" y1="20%" x2="80%" y2="80%">
              <stop offset="0%" stopColor="#fca5a5" />
              <stop offset="40%" stopColor="#7e22ce" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Stars */}
          <circle cx="22" cy="28" r="1" fill="#fff" opacity="0.9" filter="url(#glow)" />
          <circle cx="78" cy="25" r="1.5" fill="#93c5fd" opacity="0.9" filter="url(#glow)" />
          <circle cx="82" cy="72" r="1" fill="#f9a8d4" opacity="0.8" filter="url(#glow)" />
          <circle cx="25" cy="75" r="1.5" fill="#fff" opacity="0.9" filter="url(#glow)" />
          <circle cx="38" cy="18" r="1" fill="#fde047" opacity="0.8" filter="url(#glow)" />
          <circle cx="68" cy="82" r="1" fill="#c4b5fd" opacity="0.8" filter="url(#glow)" />
          <circle cx="15" cy="55" r="0.8" fill="#fff" opacity="0.6" />
          <circle cx="88" cy="45" r="0.8" fill="#fff" opacity="0.6" />

          {/* Central Planet */}
          <circle cx="50" cy="50" r="12" fill="url(#planetGrad)" />
          
          {/* Planet Highlight */}
          <ellipse cx="45" cy="45" rx="4" ry="2" fill="#fff" opacity="0.3" transform="rotate(-30 45 45)" filter="blur(0.5px)" />

          {/* Planet Ring - Back */}
          <path d="M 32 50 A 18 5 0 0 1 68 50" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" transform="rotate(-20 50 50)" opacity="0.4" />

          {/* Outer Swirls */}
          {/* Orange/Yellow left */}
          <path d="M 35 25 C 15 30, 15 65, 35 80 C 20 65, 20 35, 45 22 Z" fill="url(#orangeSwirl)" />
          
          {/* Blue top right */}
          <path d="M 40 20 C 65 10, 85 30, 75 55 C 80 35, 65 20, 45 25 Z" fill="url(#blueSwirl)" />
          
          {/* Pink/Purple bottom right */}
          <path d="M 65 80 C 85 70, 85 35, 65 20 C 80 35, 80 65, 55 78 Z" fill="url(#pinkSwirl)" />
          
          {/* Inner Swirls overlapping the planet */}
          <path d="M 25 60 C 35 80, 70 85, 80 60 C 65 80, 35 75, 25 60 Z" fill="url(#pinkSwirl)" />
          <path d="M 20 40 C 30 20, 65 15, 75 40 C 60 20, 30 25, 20 40 Z" fill="url(#blueSwirl)" />

          {/* Planet Ring - Front */}
          <path d="M 68 50 A 18 5 0 0 1 32 50" fill="none" stroke="url(#ringGrad)" strokeWidth="2" transform="rotate(-20 50 50)" />
          
        </svg>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-black italic tracking-tighter text-white leading-none">
            SomnoAI<span className="text-indigo-500"> Digital Sleep Lab</span>
          </span>
        </div>
      )}
    </div>
  );
};
