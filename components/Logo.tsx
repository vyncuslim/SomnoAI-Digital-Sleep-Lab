import React from 'react';

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className = '', width = 240, height = 30 }) => {
  return (
    <svg width={width} height={height} viewBox="0 0 240 30" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <text x="0" y="20" fontFamily="'Space Grotesk', sans-serif" fontSize="20" fontWeight="bold" fill="white">
        SomnoAI <tspan fill="#818cf8">Digital Sleep Lab</tspan>
      </text>
    </svg>
  );
};
