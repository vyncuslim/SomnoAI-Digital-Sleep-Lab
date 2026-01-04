
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverScale?: boolean;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  hoverScale = false,
  intensity = 1 
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // 鼠标倾斜逻辑
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // 增大旋转角度以提升 3D 感
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [`${12 * intensity}deg`, `${-12 * intensity}deg`]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [`${-12 * intensity}deg`, `${12 * intensity}deg`]);

  // 高光平移
  const shineX = useTransform(mouseXSpring, [-0.5, 0.5], ["0%", "100%"]);
  const shineY = useTransform(mouseYSpring, [-0.5, 0.5], ["0%", "100%"]);

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
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={hoverScale ? { scale: 1.03, z: 50, transition: { duration: 0.4 } } : {}}
      whileTap={onClick ? { scale: 0.97, z: -20 } : {}}
      onClick={onClick}
      className={`
        backdrop-blur-3xl bg-slate-900/40 border border-white/[0.08] rounded-[2.5rem] 
        shadow-[0_30px_70px_-15px_rgba(0,0,0,0.8)] transition-shadow duration-500
        relative overflow-hidden group perspective-1000
        ${className}
      `}
    >
      {/* 动态 3D 高光闪烁层 */}
      <motion.div 
        style={{
          background: useTransform(
            [mouseXSpring, mouseYSpring],
            ([vx, vy]) => `radial-gradient(circle at ${(vx as number + 0.5) * 100}% ${(vy as number + 0.5) * 100}%, rgba(255,255,255,0.12) 0%, transparent 60%)`
          ),
          translateZ: 20
        }}
        className="absolute inset-0 pointer-events-none z-20"
      />

      {/* 内部 3D 网格层 (视差背景) */}
      <motion.div 
        style={{ translateZ: -20 }}
        className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px]" 
      />

      {/* 边缘发光指示器 */}
      <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"></div>

      {/* 内容层 - 使用 translateZ 产生视差 */}
      <div className="relative z-10 h-full" style={{ transform: "translateZ(60px)" }}>
        {children}
      </div>
      
      {/* 装饰转角 */}
      <div className="absolute top-6 left-6 w-3 h-3 border-t-2 border-l-2 border-white/10 rounded-tl-sm pointer-events-none group-hover:border-indigo-500/30 transition-colors"></div>
      <div className="absolute bottom-6 right-6 w-3 h-3 border-b-2 border-r-2 border-white/10 rounded-br-sm pointer-events-none group-hover:border-indigo-500/30 transition-colors"></div>
    </motion.div>
  );
};
