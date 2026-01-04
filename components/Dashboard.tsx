
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, RefreshCw, Activity, Loader2, ShieldCheck, Binary, Zap, Waves, BrainCircuit, HeartPulse, Scan, Target
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
      {/* 顶部状态条 */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
             <Scan size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">System Live Status</p>
            <p className="text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronized: {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Unit ID</p>
          <p className="text-[9px] font-mono text-slate-300 uppercase">LAB-NODE-ALPHA-01</p>
        </div>
      </div>

      {/* AI 顶置研判报告 */}
      <section className="px-1">
        <GlassCard className="p-8 border-indigo-500/10 bg-indigo-500/5 shadow-[0_0_80px_-20px_rgba(79,70,229,0.1)]">
          <div className="flex items-start gap-6">
            <div className="mt-1">
              <div className="relative">
                <Sparkles className="text-indigo-400 animate-pulse" size={24} />
                <div className="absolute inset-0 bg-indigo-400/20 blur-xl"></div>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 rounded text-[8px] font-black uppercase tracking-widest border border-indigo-500/20">Critical Insight</span>
              </div>
              <h2 className="text-2xl font-black leading-snug text-white italic tracking-tight font-['Plus_Jakarta_Sans']">
                {data.aiInsights?.[0] || "正在通过神经元网络合成深度睡眠推演报告..."}
              </h2>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-between border-t border-white/5 pt-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={12} className="text-emerald-400/60" />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Biometric Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <Binary size={12} className="text-slate-500" />
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Somno-V3.2 Engine</span>
              </div>
            </div>
            <span className="text-[8px] font-mono text-slate-700">SIG: 0.98522</span>
          </div>
        </GlassCard>
      </section>

      {/* 核心生理指标网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="aspect-square flex flex-col items-center justify-center p-8 relative overflow-hidden">
          {/* 背景雷达装饰 */}
          <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
            <div className="w-[80%] h-[80%] border border-white/20 rounded-full"></div>
            <div className="w-[60%] h-[60%] border border-white/20 rounded-full"></div>
            <div className="w-[40%] h-[40%] border border-white/20 rounded-full"></div>
            <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-white/10"></div>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-white/10"></div>
          </div>

          <div className="relative w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{v: data.score}, {v: 100 - data.score}]}
                  cx="50%" cy="50%" innerRadius="74%" outerRadius="82%"
                  dataKey="v" startAngle={90} endAngle={450} stroke="none"
                  paddingAngle={0}
                >
                  <Cell fill="url(#scoreGrad)" cornerRadius={0} />
                  <Cell fill="rgba(255,255,255,0.03)" />
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
              <div className="relative">
                <span className="text-8xl font-black font-mono italic text-white text-glow-indigo tabular-nums">
                  {data.score}
                </span>
                <span className="absolute -top-2 -right-6 text-indigo-400 font-black font-mono text-sm opacity-50">%</span>
              </div>
              <div className="flex flex-col items-center gap-1 mt-4">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Sleep Score</span>
                <div className="w-8 h-[2px] bg-indigo-500/30"></div>
              </div>
            </div>
          </div>
          
          {/* 得分外围刻度装饰 */}
          <div className="absolute top-6 left-6 text-[8px] font-mono text-slate-700">RNG: 00-100</div>
          <div className="absolute bottom-6 right-6 text-[8px] font-mono text-slate-700 uppercase tracking-widest">Target: Opt-90</div>
        </GlassCard>

        <div className="space-y-4 flex flex-col justify-between">
          <div className="grid grid-cols-1 gap-4 h-full">
            {[
              { label: 'Deep Repair', val: data.deepRatio, icon: BrainCircuit, color: COLORS.deep, id: 'D-01' },
              { label: 'REM Consolid', val: data.remRatio, icon: Zap, color: COLORS.rem, id: 'R-01' },
              { label: 'Efficiency', val: Math.round(data.efficiency), icon: HeartPulse, color: COLORS.success, id: 'E-01' }
            ].map(f => (
              <GlassCard key={f.label} className="p-6 flex items-center justify-between group flex-1">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/5 flex items-center justify-center group-hover:bg-slate-800 transition-colors">
                    <f.icon size={20} style={{ color: f.color }} className="opacity-80" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-mono text-slate-600 uppercase tracking-tighter">{f.id}</span>
                       <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{f.label}</p>
                    </div>
                    <p className="text-2xl font-black font-mono text-slate-200 mt-1">{f.val}%</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="w-24 h-1 bg-slate-800 rounded-none overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${f.val}%` }}
                        className="h-full rounded-none shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                        style={{ backgroundColor: f.color }}
                      />
                   </div>
                   <span className="text-[7px] font-mono text-slate-600 uppercase">Normalized</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </div>

      {/* 睡眠架构时序推演 */}
      <section className="space-y-5">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <Target size={14} className="text-indigo-400" />
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em]">Architecture Chronology</h3>
          </div>
          <div className="flex gap-4">
            <span className="text-[8px] font-mono text-indigo-400/50 uppercase tracking-widest">Mode: Analytics</span>
            <span className="text-[8px] font-mono text-slate-600 uppercase tracking-widest">Buffer: 4096Kb</span>
          </div>
        </div>
        <GlassCard className="p-8 border-white/5">
          {/* 时间轴刻度 */}
          <div className="flex justify-between mb-4 px-1 opacity-20">
             {[...Array(6)].map((_, i) => (
               <div key={i} className="h-2 w-[1px] bg-white"></div>
             ))}
          </div>
          
          <div className="h-14 w-full bg-slate-900/40 rounded-lg overflow-hidden flex border border-white/5 mb-10 relative">
            {/* 动态扫描线 */}
            <motion.div 
              animate={{ left: ['-10%', '110%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 bottom-0 w-[2px] bg-white/20 z-10 blur-sm pointer-events-none"
            />
            
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
                className="h-full relative group cursor-crosshair origin-left border-r border-black/20 last:border-0"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 px-3 py-2 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-all z-50 pointer-events-none shadow-2xl scale-90 group-hover:scale-100 flex flex-col items-center">
                  <p className="text-[8px] font-black uppercase text-indigo-400 tracking-widest mb-0.5">{stage.name}</p>
                  <p className="text-[10px] font-mono text-white whitespace-nowrap">{stage.duration}m</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { l: 'Deep', c: COLORS.deep, v: data.deepRatio },
              { l: 'REM', c: COLORS.rem, v: data.remRatio },
              { l: 'Light', c: COLORS.light, v: 100 - data.deepRatio - data.remRatio - (100 - data.efficiency) },
              { l: 'Awake', c: COLORS.awake, v: 100 - data.efficiency }
            ].map(item => (
              <div key={item.l} className="space-y-3 relative">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.c }} />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{item.l}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black font-mono text-slate-200 tabular-nums">{Math.round(item.v)}</p>
                  <span className="text-[10px] font-mono text-slate-600">%</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>

      {/* 控制中心 */}
      <div className="grid grid-cols-2 gap-5 pt-4">
        <GlassCard 
          onClick={handleSync}
          className="p-6 flex items-center gap-6 group cursor-pointer border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 active:bg-indigo-500/20"
        >
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <RefreshCw size={24} />}
          </div>
          <div>
            <p className="text-[8px] font-mono text-indigo-400/60 uppercase mb-0.5 tracking-tighter">Command: Sync</p>
            <p className="text-sm font-black text-white uppercase tracking-wider">实时特征同步</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 flex items-center gap-6 border-white/5 opacity-40 grayscale">
          <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-white/5 flex items-center justify-center text-slate-500">
            <Waves size={24} />
          </div>
          <div>
            <p className="text-[8px] font-mono text-slate-700 uppercase mb-0.5 tracking-tighter">Command: Export</p>
            <p className="text-sm font-black text-slate-400 uppercase tracking-wider">报告存档</p>
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
            className="fixed bottom-32 left-6 right-6 z-[100] px-8 py-6 rounded-2xl border border-indigo-500/30 glass-morphism shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex items-center gap-6"
          >
            <div className="relative">
              <div className="w-12 h-12 border-2 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
              <Activity size={16} className="absolute inset-0 m-auto text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Neural Synthesis In Progress</p>
              <div className="flex items-center gap-4">
                 <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">Handshake: Google-Fit-API</p>
                 <span className="text-[8px] text-indigo-500/50 animate-pulse">● ● ●</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
