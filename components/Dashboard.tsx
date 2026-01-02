import React, { useState, useEffect, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { SleepRecord, SyncStatus } from '../types.ts';
import { GlassCard } from './GlassCard.tsx';
import { COLORS } from '../constants.tsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Sparkles, RefreshCw, CircleCheck, CircleAlert, List, Zap, Clock, Activity, Loader2, Flame, Shield, Database, Check, Satellite, ShieldAlert, KeyRound, Info
} from 'lucide-react';

interface DashboardProps {
  data: SleepRecord;
  onAddData?: () => void;
  onSyncFit?: (onProgress: (status: SyncStatus) => void) => Promise<void>;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export const Dashboard: React.FC<DashboardProps> = ({ data, onSyncFit }) => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showStatus, setShowStatus] = useState(false);

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-slate-500 gap-4">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 size={32} />
      </motion.div>
      <p className="text-sm font-bold uppercase tracking-widest animate-pulse">正在初始化实验室环境</p>
    </div>
  );
  
  const scoreData = useMemo(() => {
    const validScore = typeof data.score === 'number' && !isNaN(data.score) ? Math.min(100, Math.max(0, data.score)) : 0;
    return [{ value: validScore }, { value: 100 - validScore }];
  }, [data.score]);

  useEffect(() => {
    if (syncStatus !== 'idle') {
      setShowStatus(true);
      if (syncStatus === 'success') {
        const timer = setTimeout(() => {
          setShowStatus(false);
          setTimeout(() => setSyncStatus('idle'), 600);
        }, 4000);
        return () => clearTimeout(timer);
      } else if (syncStatus === 'error') {
        const timer = setTimeout(() => {
          setShowStatus(false);
          setTimeout(() => {
            setSyncStatus('idle');
            setErrorMessage(null);
          }, 600);
        }, 15000);
        return () => clearTimeout(timer);
      }
    }
  }, [syncStatus]);

  const handleSync = async () => {
    if (!onSyncFit || isProcessing) return;
    setErrorMessage(null);
    try {
      await onSyncFit((status) => setSyncStatus(status));
    } catch (err: any) {
      setSyncStatus('error');
      setErrorMessage(err.message || "实验室信号同步中断");
    }
  };

  const formatDuration = (mins: number) => {
    if (typeof mins !== 'number' || isNaN(mins)) return '0h 0m';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  };

  const totalStageMins = data.stages?.reduce((acc, s) => acc + (s.duration || 0), 0) || 0;
  const isProcessing = ['authorizing', 'fetching', 'analyzing'].includes(syncStatus);

  const renderStatusDetails = () => {
    if (syncStatus === 'error') {
      return (
        <div className="flex flex-col gap-2">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-rose-400">同步异常</span>
          <p className="text-[10px] font-medium opacity-90 leading-relaxed max-w-xs">{errorMessage || '终端连接丢失'}</p>
        </div>
      );
    }

    const messages = {
      authorizing: { title: '身份校验', desc: '建立加密握手...', icon: <KeyRound size={20} /> },
      fetching: { title: '特征提取', desc: '检索生理流数据...', icon: <Satellite size={20} /> },
      analyzing: { title: '架构推演', desc: 'AI 引擎校准中...', icon: <Database size={20} /> },
      success: { title: '同步完成', desc: '实验数据已部署', icon: <CircleCheck size={20} /> }
    };

    const current = messages[syncStatus as keyof typeof messages];
    if (!current) return null;

    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs font-black uppercase tracking-[0.3em]">{current.title}</span>
        <span className="text-[10px] font-medium opacity-80">{current.desc}</span>
      </div>
    );
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-32"
    >
      <motion.header variants={itemVariants} className="flex justify-between items-center px-1">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter text-white italic leading-none">SomnoAI Lab</h1>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
              <motion.div 
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-indigo-400"
              />
              <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em]">Live Signal</span>
            </div>
          </div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">{data.date}</p>
        </div>
        
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={handleSync}
          disabled={isProcessing}
          className={`p-4 rounded-[1.5rem] shadow-xl border transition-colors ${
            syncStatus === 'success' ? 'bg-emerald-600 border-emerald-500 text-white' :
            syncStatus === 'error' ? 'bg-rose-600 border-rose-500 text-white' :
            isProcessing ? 'bg-indigo-600/20 border-indigo-500/30 text-indigo-400' : 
            'bg-white/5 border-white/10 text-slate-400'
          }`}
        >
          <RefreshCw size={20} className={isProcessing ? 'animate-spin' : ''} />
        </motion.button>
      </motion.header>

      <motion.div variants={itemVariants} className="flex flex-col items-center justify-center py-4 relative">
        <div className="w-72 h-72 relative group">
          <motion.div 
            animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0 bg-indigo-600/30 blur-[100px] rounded-full"
          />
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={scoreData}
                cx="50%"
                cy="50%"
                innerRadius={100}
                outerRadius={125}
                dataKey="value"
                startAngle={90}
                endAngle={450}
                stroke="none"
              >
                <Cell fill="url(#labGradient)" />
                <Cell fill="rgba(255,255,255,0.03)" />
              </Pie>
              <defs>
                <linearGradient id="labGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#4338ca" />
                </linearGradient>
              </defs>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.span 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="text-8xl font-black text-white tracking-tighter italic drop-shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              {data.score ?? 0}
            </motion.span>
            <div className="flex items-center gap-2 mt-2 opacity-50">
              <Shield size={10} className="text-indigo-400" />
              <span className="text-[10px] text-slate-400 font-black tracking-[0.5em] uppercase">Lab SQI</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-5">
        <motion.div variants={itemVariants} className="col-span-2">
          <GlassCard className="p-0 overflow-hidden border-white/5 bg-slate-900/40 relative group">
             <div className="p-7 flex justify-between items-start relative z-10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">脉搏信号 (BPM)</span>
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black text-white">{data.heartRate?.average ?? 0}</span>
                    <span className="text-[11px] text-slate-500 font-black uppercase tracking-widest">AVG</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">低值校正</p>
                  <p className="text-2xl font-black text-rose-400 italic">{data.heartRate?.resting ?? 0}</p>
                </div>
             </div>
             <div className="h-32 w-full mt-[-20px] opacity-80">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={data.heartRate?.history || []}>
                   <defs>
                     <linearGradient id="hrStream" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.2}/>
                       <stop offset="100%" stopColor="#f43f5e" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Area 
                    type="monotone" 
                    dataKey="bpm" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    fill="url(#hrStream)" 
                    animationDuration={2000}
                  />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-7 space-y-4">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-blue-400" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">监控时长</p>
            </div>
            <p className="text-2xl font-black text-white italic">{formatDuration(data.totalDuration)}</p>
          </GlassCard>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GlassCard className="p-7 space-y-4">
            <div className="flex items-center gap-3">
              <Flame size={16} className="text-orange-400" />
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">静态能耗</p>
            </div>
            <p className="text-2xl font-black text-white italic">{data.calories || 0} <span className="text-xs text-slate-500 not-italic ml-1">KCAL</span></p>
          </GlassCard>
        </motion.div>
      </div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2 px-3">
          <Sparkles size={14} className="text-indigo-400" />
          <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">AI 实验室分析</h3>
        </div>
        <GlassCard className="p-8 bg-indigo-600/[0.03] border-indigo-500/20 relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            {data.aiInsights?.map((insight, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.2 }}
                className="flex gap-4 items-start"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <p className="text-[13px] text-slate-200 leading-relaxed font-semibold italic">{insight}</p>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center gap-2 px-3">
          <List size={14} className="text-slate-500" />
          <h3 className="font-black text-[11px] uppercase tracking-[0.4em] text-slate-400">睡眠架构可视化</h3>
        </div>
        <GlassCard className="p-8 space-y-8">
          <div className="w-full h-10 bg-slate-800/40 rounded-2xl overflow-hidden flex border border-white/5">
            {data.stages?.map((stage, idx) => {
              const width = `${(stage.duration / Math.max(1, totalStageMins)) * 100}%`;
              let color = COLORS.light;
              if (stage.name === '深睡') color = COLORS.deep;
              if (stage.name === 'REM') color = COLORS.rem;
              if (stage.name === '清醒') color = COLORS.awake;
              return (
                <motion.div 
                  key={idx} 
                  initial={{ width: 0 }}
                  animate={{ width }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{ backgroundColor: color }}
                  className="h-full relative group/stage"
                />
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            {[
              { label: '深层修复', color: COLORS.deep, val: (data.deepRatio ?? 0) + '%' },
              { label: '认知巩固', color: COLORS.rem, val: (data.remRatio ?? 0) + '%' }
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-xs font-black text-slate-300">{item.val}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <AnimatePresence>
        {showStatus && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className={`fixed bottom-28 left-6 right-6 z-[100] px-6 py-4 rounded-3xl border backdrop-blur-3xl flex items-center justify-between shadow-2xl ${
              syncStatus === 'success' ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100' : 
              syncStatus === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-100' : 
              'bg-slate-900/90 border-indigo-500/30 text-indigo-100'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 rounded-2xl bg-white/5">
                {isProcessing ? <Loader2 size={20} className="animate-spin" /> : <Shield size={20} />}
              </div>
              {renderStatusDetails()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};