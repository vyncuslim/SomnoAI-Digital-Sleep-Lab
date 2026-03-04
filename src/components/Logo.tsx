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
        <img src="/favicon.svg" alt="Logo" className="w-full h-full relative z-10 drop-shadow-lg object-contain" />
      </div>
      {showText && (
        <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200 whitespace-nowrap">
          SomnoAI Digital Sleep Lab
        </span>
      )}
    </motion.div>
  );
};
