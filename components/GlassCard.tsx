
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', onClick, hoverScale = false }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 鼠标倾斜逻辑
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
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
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d"
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverScale ? { scale: 1.02, transition: { duration: 0.3 } } : {}}
      whileTap={onClick ? { scale: 0.98 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-3xl bg-slate-900/40 border border-white/[0.08] rounded-[2rem] 
        shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transition-all duration-300
        relative overflow-hidden group perspective-1000
        ${className}
      `}
    >
      {/* 动态 3D 高光 */}
      <motion.div 
        style={{
          background: useTransform(
            [x, y],
            ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(255,255,255,0.08) 0%, transparent 60%)`
          )
        }}
        className="absolute inset-0 pointer-events-none"
      />

      {/* 装饰转角 */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20 rounded-tl-sm pointer-events-none"></div>
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20 rounded-br-sm pointer-events-none"></div>

      {/* 背景动态流光 */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:30px_30px]"></div>
      
      <div className="relative z-10 h-full" style={{ transform: "translateZ(40px)" }}>
        {children}
      </div>
    </motion.div>
  );
};
