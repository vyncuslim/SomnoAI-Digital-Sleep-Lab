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
  hoverScale = false,
  intensity = 1,
  role,
  'aria-label': ariaLabel,
  id
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 80, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 80, damping: 30 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${10 * intensity}deg`, `${-10 * intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${-10 * intensity}deg`, `${10 * intensity}deg`]);

  const background = useTransform(
    [mouseXSpring, mouseYSpring],
    ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(99, 102, 241, 0.08) 0%, transparent 70%)`
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
      whileHover={hoverScale ? { scale: 1.02, y: -4 } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-3xl bg-slate-950/40 border border-white/5 rounded-[2.5rem] 
        shadow-[0_40px_100px_rgba(0,0,0,0.5)] transition-all duration-500
        relative overflow-hidden group
        ${className}
      `}
    >
      <m.div 
        style={{ background }}
        className="absolute inset-0 pointer-events-none z-0 opacity-50"
      />
      <div className="relative z-10 h-full">
        {children}
      </div>
    </m.div>
  );
};