
import React, { useState, useMemo } from 'react';
import { X, Check, Clock, Heart, Star, Flame, Info, ShieldAlert, Activity, Zap, BrainCircuit, Waves } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord, SleepStage } from '../types.ts';

interface DataEntryProps {
  onClose: () => void;
  onSave: (record: SleepRecord) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ onClose, onSave }) => {
  const [duration, setDuration] = useState(450); // 7.5 hours
  const [score, setScore] = useState(85);
  const [restingHr, setRestingHr] = useState(62);
  const [calories, setCalories] = useState(2100);
  const [isValidating, setIsValidating] = useState(false);
  const [showError, setShowError] = useState(false);

  // Derived metrics for real-time preview using heuristic algorithms
  const previewData = useMemo(() => {
    // Basic heuristics to make the manual data feel scientifically derived
    const deepBase = 0.22;
    const remBase = 0.20;
    
    // Efficiency impacts awake time
    const awakeRatio = (100 - score) / 300; // Simplified awake estimation
    const awake = Math.floor(duration * awakeRatio);
    
    const remaining = duration - awake;
    const deep = Math.floor(remaining * deepBase);
    const rem = Math.floor(remaining * remBase);
    const efficiency = Math.round(((duration - awake) / Math.max(1, duration)) * 100);
    
    return { deep, rem, awake, efficiency };
  }, [duration, score]);

  const handleSave = () => {
    // Enhanced Validation
    if (duration < 60) {
      setShowError(true);
      return;
    }

    setIsValidating(true);
    
    // Simulate complex algorithmic processing for UX impact
    setTimeout(() => {
      const { deep, rem, awake, efficiency } = previewData;
      const light = duration - deep - rem - awake;

      const stages: SleepStage[] = [
        { name: '深睡', duration: deep, startTime: '01:20' },
        { name: 'REM', duration: rem, startTime: '03:50' },
        { name: '浅睡', duration: Math.max(0, light), startTime: '05:15' },
        { name: '清醒', duration: awake, startTime: '23:30' },
      ];

      const newRecord: SleepRecord = {
        id: `manual-${Date.now()}`,
        date: new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        score,
        totalDuration: duration,
        deepRatio: Math.round((deep / duration) * 100),
        remRatio: Math.round((rem / duration) * 100),
        efficiency,
        calories,
        stages,
        heartRate: {
          resting: restingHr,
          max: Math.round(restingHr * 1.35),
          min: Math.max(40, restingHr - 4),
          average: Math.round(restingHr * 1.1),
          history: Array.from({ length: 12 }, (_, i) => ({ 
            time: `${(i * 2 + 22) % 24}:00`, 
            bpm: restingHr + Math.floor(Math.random() * 12) 
          })),
        },
        aiInsights: ["实验室：主观体征注入成功。架构推演引擎已根据您的能量代谢率完成了反向对齐。"]
      };

      onSave(newRecord);
      setIsValidating(false);
    }, 1200);
  };

  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-emerald-400';
    if (s >= 70) return 'text-indigo-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getDurationQuality = (m: number) => {
    const h = m / 60;
    if (h >= 7 && h <= 9) return { label: '最佳时长', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (h > 9) return { label: '过度修眠', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: '恢复受限', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-3xl bg-[#020617]/85 animate-in fade-in duration-700">
      {/* Dynamic Background Blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-1/4 w-[500px] h-[500px] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-1/4 w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full animate-pulse delay-1000"></div>
      </div>

      <GlassCard className="w-full max-w-5xl max-h-[92vh] overflow-y-auto space-y-8 p-6 md:p-12 border-white/10 shadow-[0_40px_160px_-16px_rgba(0,0,0,1)] scrollbar-hide relative border-t-indigo-500/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.75rem] flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <Activity size={32} className="text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter italic text-white leading-none">体征手动注入终端</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Link</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Signal Override Protocol v3.0</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-400 hover:text-rose-400 transition-all active:scale-90 border border-white/5 shadow-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Primary Input Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Duration Control */}
              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-indigo-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">总监测时长</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getDurationQuality(duration).color} ${getDurationQuality(duration).bg}`}>
                    {getDurationQuality(duration).label}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{Math.floor(duration/60)}<span className="text-sm ml-1 text-slate-500">H</span></span>
                  <span className="text-5xl font-black text-white">{duration%60}<span className="text-sm ml-1 text-slate-500">M</span></span>
                </div>
                <input 
                  type="range" min="60" max="720" step="15" 
                  value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </GlassCard>

              {/* Quality Score Control */}
              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-amber-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">主观评价评分</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">/ 100</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={score} onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                />
              </GlassCard>

              {/* Resting HR Control */}
              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-rose-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">静息心率 (RHR)</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{restingHr}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">BPM</span>
                </div>
                <input 
                  type="range" min="30" max="120" 
                  value={restingHr} onChange={(e) => setRestingHr(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
                />
              </GlassCard>

              {/* Energy Expenditure Control */}
              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-orange-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全天能耗水平</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{calories}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">KCAL</span>
                </div>
                <input 
                  type="range" min="1000" max="4500" step="50" 
                  value={calories} onChange={(e) => setCalories(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                />
              </GlassCard>
            </div>

            {/* AI Reasoning Notice */}
            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-5 items-start">
              <div className="p-3 bg-indigo-500/10 rounded-2xl">
                <Info size={24} className="text-indigo-400" />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">核心算法逻辑提示</p>
                <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                  手动注入模式将激活 <span className="text-white font-bold italic">Somno-Synthesis v2</span> 引擎。该引擎会自动校准您的主观评分与 RHR 之间的偏差，并生成具有生理可信度的睡眠架构图谱。
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Synthesis Preview Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-3 flex items-center gap-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" /> 实验室信号合成预览
            </h3>
            
            <GlassCard className="flex-1 p-8 border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                      <BrainCircuit size={24} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-lg font-black text-white tracking-tight">合成架构推演</p>
                      <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-[0.2em]">Architecture Inference</p>
                    </div>
                  </div>
                  <Waves size={24} className="text-indigo-500/30 animate-pulse" />
                </div>

                <div className="space-y-6">
                  {[
                    { label: '预计深层', value: previewData.deep, unit: 'min', color: 'bg-blue-500', icon: Waves },
                    { label: '预计 REM', value: previewData.rem, unit: 'min', color: 'bg-purple-500', icon: Activity },
                    { label: '预计清醒', value: previewData.awake, unit: 'min', color: 'bg-slate-600', icon: Clock },
                    { label: '效率校准', value: previewData.efficiency, unit: '%', color: 'bg-emerald-500', icon: ShieldAlert }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.15em]">
                        <span className="text-slate-500 flex items-center gap-2">
                          <item.icon size={12} className="text-indigo-400/50" />
                          {item.label}
                        </span>
                        <span className="text-white font-mono">{item.value}{item.unit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-700 ease-out shadow-[0_0_12px_rgba(0,0,0,0.5)]`} 
                          style={{ width: `${item.unit === '%' ? item.value : (item.value / (duration || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-5">
                {showError && (
                  <div className="flex items-center gap-3 text-rose-400 bg-rose-400/10 p-4 rounded-2xl border border-rose-500/20 animate-in slide-in-from-top-4 duration-300">
                    <ShieldAlert size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">注入失败：生理信号不完整</span>
                  </div>
                )}
                
                <button 
                  onClick={handleSave}
                  disabled={isValidating}
                  className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.96] group overflow-hidden relative ${
                    isValidating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/50 border border-indigo-400/30'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {isValidating ? (
                    <>
                      <div className="w-6 h-6 border-3 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></div>
                      正在编码数据流
                    </>
                  ) : (
                    <>
                      <Check size={24} className="group-hover:scale-125 transition-transform" /> 
                      确认注入本地实验室
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-3 opacity-20">
                  <div className="h-px bg-slate-500 w-8"></div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Secure Handshake Required</span>
                  <div className="h-px bg-slate-500 w-8"></div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
