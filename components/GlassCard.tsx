
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
  intensity?: number;
  // Added accessibility props to fix type errors when these are passed to GlassCard
  role?: string;
  'aria-label'?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverScale = false,
  intensity = 1,
  // Added accessibility props to fix type errors when these are passed to GlassCard
  role,
  'aria-label': ariaLabel
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 100, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 100, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${15 * intensity}deg`, `${-15 * intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${-15 * intensity}deg`, `${15 * intensity}deg`]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div 
      ref={cardRef}
      // Pass through accessibility props to the motion.div
      role={role}
      aria-label={ariaLabel}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverScale ? { scale: 1.02, translateZ: 40 } : { translateZ: 20 }}
      whileTap={onClick ? { scale: 0.98, translateZ: -10 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-2xl bg-[#050a1f]/60 border border-white/[0.08] rounded-[3rem] 
        shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] transition-shadow duration-700
        relative overflow-hidden group perspective-1000
        ${className}
      `}
    >
      {/* 深度感内阴影 */}
      <div className="absolute inset-0 rounded-[3rem] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),inset_0_-1px_1px_rgba(0,0,0,0.5)] pointer-events-none z-30" />

      {/* 动态 3D 高光 */}
      <motion.div 
        style={{
          background: useTransform(
            [mouseXSpring, mouseYSpring],
            ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(255,255,255,0.15) 0%, transparent 70%)`
          ),
          translateZ: 100,
          marginTop: 0 // Fix: Explicitly reset margin-top to avoid clipping from inherited styles
        }}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* 内容视差层 */}
      <div className="relative z-10 h-full" style={{ transform: "translateZ(50px)" }}>
        {children}
      </div>
      
      {/* 转角装饰 */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-indigo-500/20 rounded-tl-sm pointer-events-none group-hover:border-indigo-400 transition-colors" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-indigo-500/20 rounded-br-sm pointer-events-none group-hover:border-indigo-400 transition-colors" />
    </motion.div>
  );
};
