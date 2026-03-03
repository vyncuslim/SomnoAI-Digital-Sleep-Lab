import React from 'react';
import { motion } from 'framer-motion';

export const Logo: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <motion.div 
      className={`flex items-center gap-2 ${className}`}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-indigo-500 rounded-full opacity-20 blur-md"></div>
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-400 relative z-10">
          <path d="M12 3V21M3 12H21M6.343 6.343L17.657 17.657M6.343 17.657L17.657 6.343" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-indigo-200">
        Somno
      </span>
    </motion.div>
  );
};
