
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Activity, Loader2, ShieldCheck, Binary, Zap, Waves, BrainCircuit, HeartPulse
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    try {
      await onSyncFit((status) => setSyncStatus(status));
    } catch (err) {
      setSyncStatus('error');
    }
  };

  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-8 pb-32"
    >
      {/* AI 顶置研判报告 */}
      <section className="px-2">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 animate-pulse delay-75"></div>
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400/80">AI Synthesis Report</span>
        </div>
        <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/5 shadow-[0_0_80px_-20px_rgba(79,70,229,0.15)]">
          <div className="relative">
            <Sparkles className="absolute -top-1 -left-1 text-indigo-400 opacity-20" size={32} />
            <h2 className="text-2xl font-black leading-tight text-white italic tracking-tight relative z-10">
              {data.aiInsights?.[0] || "正在生成深度睡眠推演报告..."}
            </h2>
          </div>
          <div className="mt-6 flex items-center gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[9px] font-mono text-emerald-400/70 uppercase">Biometric Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <Binary size={12} className="text-slate-500" />
              <span className="text-[9px] font-mono text-slate-500 uppercase">Model: Somno-v3.1</span>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* 核心生理指标网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="aspect-square flex flex-col items-center justify-center p-8 relative">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-600/10 blur-[60px] rounded-full"
          />
          <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{v: data.score}, {v: 100 - data.score}]}
                  cx="50%" cy="50%" innerRadius="70%" outerRadius="85%"
                  dataKey="v" startAngle={90} endAngle={450} stroke="none"
                >
                  <Cell fill="url(#scoreGrad)" />
                  <Cell fill="rgba(255,255,255,0.02)" />
                </Pie>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-black font-mono italic text-white text-glow-indigo">
                {data.score}
              </span>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-1 h-1 rounded-full bg-indigo-500"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Lab Efficiency</span>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4 flex flex-col justify-center">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-2 flex items-center gap-2">
            <Activity size={12} /> 生物修复指数
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {[
              { label: '深睡修复', val: data.deepRatio, icon: BrainCircuit, color: COLORS.deep },
              { label: 'REM 巩固', val: data.remRatio, icon: Zap, color: COLORS.rem },
              { label: '静息质量', val: Math.round(data.efficiency), icon: HeartPulse, color: COLORS.success }
            ].map(f => (
              <GlassCard key={f.label} className="p-5 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-800/50 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <f.icon size={18} style={{ color: f.color }} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{f.label}</p>
                    <p className="text-xl font-black font-mono text-slate-200">{f.val}%</p>
                  </div>
                </div>
                <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${f.val}%` }}
                     className="h-full rounded-full"
                     style={{ backgroundColor: f.color }}
                   />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* 睡眠架构时序推演 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Binary size={14} className="text-indigo-400" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Architecture Timeline</h3>
          </div>
          <div className="flex gap-4">
            <span className="text-[8px] font-mono text-slate-600 uppercase">Sampling: 1Hz</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase">Ref: GoogleFit-API</span>
          </div>
        </div>
        <GlassCard className="p-8">
          <div className="h-10 w-full bg-slate-900/40 rounded-2xl overflow-hidden flex border border-white/5 mb-8">
            {data.stages?.map((stage, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: idx * 0.05 }}
                style={{ 
                  width: `${(stage.duration / Math.max(1, data.totalDuration)) * 100}%`,
                  backgroundColor: stage.name === '深睡' ? COLORS.deep : stage.name === 'REM' ? COLORS.rem : stage.name === '清醒' ? COLORS.awake : COLORS.light
                }}
                className="h-full relative group cursor-crosshair origin-left"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none shadow-2xl scale-90 group-hover:scale-100">
                  <p className="text-[9px] font-black uppercase text-indigo-400 mb-0.5">{stage.name}</p>
                  <p className="text-xs font-mono text-white whitespace-nowrap">{stage.duration} min</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { l: 'Deep', c: COLORS.deep, v: data.deepRatio },
              { l: 'REM', c: COLORS.rem, v: data.remRatio },
              { l: 'Light', c: COLORS.light, v: 100 - data.deepRatio - data.remRatio - (100 - data.efficiency) },
              { l: 'Awake', c: COLORS.awake, v: 100 - data.efficiency }
            ].map(item => (
              <div key={item.l} className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.c }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{item.l}</span>
                </div>
                <p className="text-2xl font-black font-mono text-slate-200">{Math.round(item.v)}%</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* 实验控制按钮 */}
      <div className="grid grid-cols-2 gap-5">
        <GlassCard 
          onClick={handleSync}
          className="p-6 flex flex-col gap-4 group cursor-pointer border-indigo-500/10 hover:border-indigo-500/30 active:bg-indigo-500/5"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:rotate-45 transition-transform duration-500">
            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Real-time Sync</p>
            <p className="text-sm font-bold text-white uppercase tracking-tight">同步特征流</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex flex-col gap-4 border-white/5 opacity-40">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/50 flex items-center justify-center text-slate-500">
            <Waves size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Export Report</p>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">导出实验报告</p>
          </div>
        </GlassCard>
      </div>

      {/* 同步状态浮窗 */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-32 left-6 right-6 z-[100] px-8 py-5 rounded-3xl border border-indigo-500/20 glass-morphism shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex items-center gap-5"
          >
            <div className="relative">
              <div className="w-10 h-10 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <Activity size={14} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">实验室正在进行推演计算</p>
              <p className="text-[9px] text-slate-500 mt-0.5">正在建立与 Google Fit 的安全握手通道...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
