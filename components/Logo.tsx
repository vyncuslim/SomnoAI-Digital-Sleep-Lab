import React from 'react';
import { BrainCircuit } from 'lucide-react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-50 rounded-full" />
        <BrainCircuit className="relative text-indigo-400 w-8 h-8" />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="text-lg font-black italic tracking-tighter uppercase leading-none text-white">
            SomnoAI <span className="text-indigo-400 font-medium">Sleep Lab</span>
          </span>
        </div>
      )}
    </div>
  );
};
