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
  id?: string;
}

const m = motion as any;

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverScale = true,
  intensity = 1,
  role,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${10 * intensity}deg`, `${-10 * intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${-10 * intensity}deg`, `${10 * intensity}deg`]);

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
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverScale ? { scale: 1.015, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.985 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-3xl bg-[#01040a]/40 border border-white/10 rounded-[3rem] 
        shadow-[0_40px_120px_-30px_rgba(0,0,0,0.8)] transition-all duration-500
        relative overflow-hidden group
        ${className}
      `}
    >
      {/* 动态光泽层 */}
      <m.div 
        className="absolute inset-0 pointer-events-none z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{
          background: useTransform(
            [mouseXSpring, mouseYSpring],
            ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(99, 102, 241, 0.15) 0%, transparent 80%)`
          )
        }}
      />
      
      {/* 边框高亮流光 */}
      <div className="absolute inset-0 border border-white/5 rounded-[3rem] pointer-events-none group-hover:border-indigo-500/20 transition-colors duration-700" />

      <div className="relative z-10 h-full">
        {children}
      </div>
    </m.div>
  );
};