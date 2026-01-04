
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, Info, ArrowRight, Zap, TriangleAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { googleFit } from '../services/googleFitService.ts';
import { Logo } from './Logo.tsx';

interface AuthProps {
  onLogin: () => void;
  onGuest: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, onGuest }) => {
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    googleFit.ensureClientInitialized().catch(err => {
      console.warn("Auth Component: SDK 预热推迟", err.message);
    });
  }, []);

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLocalError(null);
    try {
      await googleFit.ensureClientInitialized();
      const token = await googleFit.authorize(true); 
      if (token) onLogin(); 
    } catch (error: any) {
      console.error("Auth Failure:", error);
      let cleanMsg = error.message?.replace("PERMISSION_DENIED: ", "") || "身份验证失败";
      setLocalError(cleanMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#020617] relative overflow-hidden">
      {/* High-end Holographic Background */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.2, 0.1],
          x: [0, 50, 0],
          y: [0, -50, 0]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[100%] h-[100%] bg-indigo-600/10 blur-[180px] rounded-full"
      />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-8 text-center mb-8 relative z-10"
      >
        <motion.div 
          animate={{ scale: [1, 1.05, 1], rotate: [0, 2, 0, -2, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex p-10 bg-indigo-600/5 rounded-[3.5rem] border border-indigo-500/10 shadow-[0_0_120px_rgba(79,70,229,0.15)] backdrop-blur-sm"
        >
          <Logo size={120} animated />
        </motion.div>
        
        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter text-white italic leading-tight">
            SomnoAI <span className="text-indigo-400 block sm:inline">Lab</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-wide leading-relaxed px-8 text-sm uppercase">
            数字化睡眠实验与生理架构推演
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
        className="w-full max-w-md"
      >
        <GlassCard className="p-10 border-white/10 bg-slate-900/40 shadow-[0_40px_100px_rgba(0,0,0,0.6)] space-y-8 relative z-10">
          <div className="space-y-6">
            <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 text-left space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">安全性声明</p>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                数据仅在浏览器本地会话中同步处理。我们不设后端服务器，数据在页面关闭后立即清除。
              </p>
            </div>

            {localError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20 text-left flex gap-3"
              >
                <TriangleAlert size={18} className="text-rose-400 shrink-0" />
                <p className="text-[11px] text-rose-300 font-bold leading-relaxed">{localError}</p>
              </motion.div>
            )}

            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className={`w-full py-5 rounded-[2.5rem] flex items-center justify-center gap-4 transition-all shadow-2xl font-black text-sm uppercase tracking-widest border ${
                  isLoggingIn 
                  ? 'bg-slate-800 text-slate-500 border-white/5' 
                  : 'bg-white text-slate-950 border-white'
                }`}
              >
                {isLoggingIn ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} className="fill-indigo-600 text-indigo-600" />}
                <span>接入 Google Fit</span>
              </motion.button>

              <button 
                onClick={onGuest}
                className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 hover:text-indigo-400 font-black transition-all text-[10px] uppercase tracking-[0.4em] group"
              >
                访客实验室浏览 <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
