
import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface SpatialIconProps {
  icon: LucideIcon | React.FC<any>;
  size?: number;
  className?: string;
  threeD?: boolean;
  color?: string;
  glow?: boolean;
  animated?: boolean;
}

export const SpatialIcon: React.FC<SpatialIconProps> = ({ 
  icon: Icon, 
  size = 20, 
  className = '', 
  threeD = true,
  color = 'currentColor',
  glow = true,
  animated = false
}) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {threeD && glow && (
        <motion.div
          animate={animated ? {
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1]
          } : { opacity: 0.3 }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 blur-md rounded-full pointer-events-none"
          style={{ backgroundColor: color }}
        />
      )}
      <motion.div
        style={{ 
          color,
          transformStyle: "preserve-3d",
          filter: threeD ? `drop-shadow(0 4px 6px rgba(0,0,0,0.5))` : 'none'
        }}
        whileHover={threeD ? { translateZ: 10, scale: 1.1 } : {}}
      >
        <Icon size={size} />
      </motion.div>
    </div>
  );
};
