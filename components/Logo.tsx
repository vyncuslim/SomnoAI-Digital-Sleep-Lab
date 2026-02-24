import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ 
  size = 48, 
  className = '', 
  animated = false
}) => {
  return (
    <div style={{ width: size, height: size, minWidth: size, minHeight: size }} className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SomnoAI Logo"
        className="pointer-events-none"
      >
        {/* 轨道 - 使用白色增加对比度 */}
        {animated ? (
          <motion.circle 
            cx="50" cy="50" r="46" 
            stroke="white" 
            strokeWidth="2" 
            strokeDasharray="4 8"
            strokeOpacity="0.3"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          />
        ) : (
          <circle 
            cx="50" cy="50" r="46" 
            stroke="white" 
            strokeWidth="2" 
            strokeDasharray="4 8"
            strokeOpacity="0.3"
          />
        )}

        {/* 核心月牙 - 使用更亮的靛蓝色 */}
        <path
          d="M65 20 C45 20, 25 40, 25 65 C25 78, 30 88, 38 94 C25 86, 18 71, 18 56 C18 31, 38 11, 63 11 C71 11, 78 13, 84 16 C80 19, 75 20, 70 20"
          fill="#818cf8"
        />

        {/* 神经激活点 - 增加发光效果 */}
        {animated ? (
          <motion.circle
            cx="78"
            cy="32"
            r="6"
            fill="#a5b4fc"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : (
          <circle
            cx="78"
            cy="32"
            r="6"
            fill="#a5b4fc"
          />
        )}
      </svg>
    </div>
  );
};