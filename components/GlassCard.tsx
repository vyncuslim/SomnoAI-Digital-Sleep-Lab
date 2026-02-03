
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
  intensity?: number;
  role?: string;
  'aria-label'?: string;
  // Added id to support anchor links for scroll-to functionality
  id?: string;
}

const m = motion as any;

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverScale = false,
  intensity = 1,
  role,
  'aria-label': ariaLabel,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 60, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 60, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${8 * intensity}deg`, `${-8 * intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${-8 * intensity}deg`, `${8 * intensity}deg`]);

  // Refactored: Moved hook call out of the return statement
  const background = useTransform(
    [mouseXSpring, mouseYSpring],
    ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(129, 140, 248, 0.15) 0%, transparent 70%)`
  );

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
    <m.div 
      id={id}
      ref={cardRef}
      role={role}
      aria-label={ariaLabel}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverScale ? { scale: 1.02 } : {}}
      whileTap={onClick ? { scale: 0.97 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-[80px] bg-slate-950/40 border border-white/[0.08] rounded-[4.5rem] 
        shadow-[0_60px_100px_-20px_rgba(0,0,0,0.6)] transition-all duration-1000
        relative overflow-hidden group
        ${className}
      `}
    >
      {/* 液态高光流转 */}
      <m.div 
        style={{ background }}
        className="absolute inset-0 pointer-events-none z-0"
      />

      {/* 内容层 */}
      <div className="relative z-10 h-full">
        {children}
      </div>
      
      {/* 生物发光边缘 */}
      <div className="absolute inset-0 rounded-[4.5rem] border-[1.5px] border-white/5 group-hover:border-indigo-500/20 pointer-events-none transition-colors duration-700" />
    </m.div>
  );
};
