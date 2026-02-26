import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 20, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="10" />
        <path d="M30 50L45 65L70 35" stroke="white" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="font-black italic tracking-tighter text-white uppercase" style={{ fontSize: size * 0.8 }}>
        SomnoAI <span className="text-indigo-500">Digital Sleep Lab</span>
      </span>
    </div>
  );
};
