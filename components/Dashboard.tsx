import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Activity, Loader2, Shield, Binary, ChevronRight, Info, Zap, Waves, Brain
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

const labTransition = { duration: 0.6, ease: [0.22, 1, 0.36, 1] };

export const Dashboard: React.FC<DashboardProps> = ({ data, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (syncStatus !== 'idle') {
      setShowStatus(true);
      if (syncStatus === 'success') {
        const timer = setTimeout(() => setShowStatus(false), 4000);
        return () => clearTimeout(timer);
      }
    }
  }, [syncStatus]);

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 pb-32">
      {/* 1. AI 结论先行 (Natural Language Summary) */}
      <motion.section 
        initial={{ y: -10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }}
        className="px-1"
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/80">Laboratory Intelligence Post</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-xl font-bold leading-snug text-slate-100 italic">
            {data.aiInsights?.[0]?.split('。')[0]}。
          </h2>
          <div className="flex items-center gap-2 opacity-40">
            <Shield size={10} />
            <span className="text-[9px] font-mono tracking-tighter uppercase">Verified by Somno-v3 Architecture</span>
          </div>
        </div>
      </motion.section>

      {/* 2. 中央评分与核心因子 (Score & Factors) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <GlassCard className="py-10 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
            <Waves className="w-full h-full scale-150 rotate-45" />
          </div>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{v: data.score}, {v: 100 - data.score}]}
                  cx="50%" cy="50%" innerRadius={70} outerRadius={85}
                  dataKey="v" startAngle={90} endAngle={450} stroke="none"
                >
                  <Cell fill="url(#labScoreGrad)" />
                  <Cell fill="rgba(255,255,255,0.03)" />
                </Pie>
                <defs>
                  <linearGradient id="labScoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.primary} />
                    <stop offset="100%" stopColor="#4338ca" />
                  </linearGradient>
                </defs>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black font-mono italic text-white text-glow-indigo">
                {data.score}
              </span>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Lab Index</span>
            </div>
          </div>
        </GlassCard>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] px-2">三大核心修复因子</h3>
          <div className="space-y-3">
            {[
              { label: '神经修复 (Deep)', val: data.deepRatio, icon: Brain, color: COLORS.deep },
              { label: '认知巩固 (REM)', val: data.remRatio, icon: Zap, color: COLORS.rem },
              { label: '心血管冗余 (RHR)', val: Math.round(100 - ((data.heartRate.resting - 40)/60)*100), icon: Activity, color: '#f43f5e' }
            ].map(factor => (
              <GlassCard key={factor.label} className="p-4 border-white/5 bg-white/[0.01]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-slate-800/50">
                      <factor.icon size={14} style={{ color: factor.color }} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-400">{factor.label}</span>
                  </div>
                  <span className="text-sm font-black font-mono text-slate-200">{factor.val}%</span>
                </div>
                <div className="mt-3 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${factor.val}%` }} 
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-full rounded-full" 
                    style={{ backgroundColor: factor.color }}
                  />
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* 3. 睡眠实验室时间轴 (Sleep Timeline Lab) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Binary size={14} className="text-slate-500" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">睡眠特征推演图谱</h3>
          </div>
          <span className="text-[9px] font-mono text-slate-600">RESOLUTION: 1MIN/PX</span>
        </div>
        <GlassCard className="p-6 md:p-8 space-y-8">
          <div className="relative pt-6 pb-2">
            {/* 时间标记 */}
            <div className="absolute top-0 left-0 w-full flex justify-between text-[8px] font-mono text-slate-600 uppercase tracking-widest">
               <span>Inflow</span>
               <span>Midpoint</span>
               <span>Wake-up</span>
            </div>
            
            <div className="h-6 w-full bg-slate-800/20 rounded-lg overflow-hidden flex border border-white/5">
              {data.stages?.map((stage, idx) => (
                <div 
                  key={idx}
                  style={{ 
                    width: `${(stage.duration / Math.max(1, data.totalDuration)) * 100}%`,
                    backgroundColor: stage.name === '深睡' ? COLORS.deep : stage.name === 'REM' ? COLORS.rem : stage.name === '清醒' ? COLORS.awake : COLORS.light
                  }}
                  className="h-full relative group cursor-help"
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1.5 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-2xl">
                    <p className="text-[8px] font-black uppercase tracking-widest text-indigo-400">{stage.name}</p>
                    <p className="text-[10px] font-mono text-white">{stage.duration}m</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/5">
            {[
              { l: '深睡', c: COLORS.deep, v: data.deepRatio },
              { l: 'REM', c: COLORS.rem, v: data.remRatio },
              { l: '浅睡', c: COLORS.light, v: 100 - data.deepRatio - data.remRatio - (100 - data.efficiency) },
              { l: '觉醒', c: COLORS.awake, v: 100 - data.efficiency }
            ].map(item => (
              <div key={item.l} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.c }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase">{item.l}</span>
                </div>
                <p className="text-lg font-black font-mono text-slate-200">{Math.round(item.v)}%</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* 4. 实验室操作区 */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard 
          onClick={handleSync}
          className="p-5 flex items-center justify-between group cursor-pointer border-indigo-500/10 hover:border-indigo-500/30 transition-all active:scale-[0.98]"
        >
          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">特征流同步</p>
             <p className="text-xs font-bold text-indigo-400 uppercase tracking-tighter">Sync Stream</p>
          </div>
          <RefreshCw size={16} className={`text-indigo-400 ${isProcessing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-700'}`} />
        </GlassCard>

        <GlassCard className="p-5 flex items-center justify-between border-white/5 opacity-60">
          <div className="space-y-1">
             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">导出实验报告</p>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Export PDF</p>
          </div>
          <Binary size={16} className="text-slate-500" />
        </GlassCard>
      </div>

      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-28 left-6 right-6 z-[100] px-6 py-4 rounded-2xl border glass-morphism border-indigo-500/20 text-indigo-100 flex items-center gap-4 shadow-2xl"
          >
            <div className="p-2 rounded-xl bg-white/5">
              {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Shield size={16} />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest">
                {isProcessing ? '实验室计算中...' : '同步已验证'}
              </span>
              <span className="text-[9px] opacity-70">
                Somno-v3 引擎已成功挂载生物特征流
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
