
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

  // Derived metrics for real-time preview
  const previewData = useMemo(() => {
    const deep = Math.floor(duration * 0.22);
    const rem = Math.floor(duration * 0.20);
    const awake = Math.floor(duration * (1 - (score / 100)) * 0.3); // Rough estimation
    const efficiency = Math.round(((duration - awake) / duration) * 100);
    
    return { deep, rem, awake, efficiency };
  }, [duration, score]);

  const handleSave = () => {
    // Basic validation check
    if (duration < 60 || restingHr < 30 || restingHr > 150) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      return;
    }

    setIsValidating(true);
    
    setTimeout(() => {
      const { deep, rem, awake, efficiency } = previewData;
      const light = duration - deep - rem - awake;

      const stages: SleepStage[] = [
        { name: '深睡', duration: deep, startTime: '01:15' },
        { name: 'REM', duration: rem, startTime: '03:45' },
        { name: '浅睡', duration: light, startTime: '05:00' },
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
          max: Math.round(restingHr * 1.4),
          min: Math.max(40, restingHr - 5),
          average: Math.round(restingHr * 1.15),
          history: Array.from({ length: 12 }, (_, i) => ({ 
            time: `${i * 2}:00`, 
            bpm: restingHr + Math.floor(Math.random() * 15) 
          })),
        },
        aiInsights: ["实验室：手动录入的特征流已注入。算法正在尝试对齐主观与生理模型。"]
      };

      onSave(newRecord);
      setIsValidating(false);
    }, 800);
  };

  const getScoreColor = (s: number) => {
    if (s >= 85) return 'text-emerald-400';
    if (s >= 70) return 'text-indigo-400';
    if (s >= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  const getDurationQuality = (m: number) => {
    const h = m / 60;
    if (h >= 7 && h <= 9) return { label: '理想区间', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (h > 9) return { label: '过度休眠', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: '恢复不足', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl bg-[#020617]/80 animate-in fade-in duration-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600 blur-[120px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600 blur-[120px] rounded-full animate-pulse delay-700"></div>
      </div>

      <GlassCard className="w-full max-w-4xl max-h-[90vh] overflow-y-auto space-y-8 p-6 md:p-10 border-white/10 shadow-[0_32px_128px_-16px_rgba(0,0,0,0.8)] scrollbar-hide relative">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600/20 rounded-[1.5rem] flex items-center justify-center border border-indigo-500/30">
              <Activity size={28} className="text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter italic text-white leading-none">信号手动注入</h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Signal Override Protocol v2.4</p>
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-400 hover:text-rose-400 transition-all active:scale-90 border border-white/5"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Duration */}
              <GlassCard className="p-6 bg-slate-900/40 border-white/5 space-y-4 group">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">睡眠总时长</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getDurationQuality(duration).color} ${getDurationQuality(duration).bg}`}>
                    {getDurationQuality(duration).label}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{Math.floor(duration/60)}<span className="text-sm ml-1 text-slate-500">H</span></span>
                  <span className="text-4xl font-black text-white">{duration%60}<span className="text-sm ml-1 text-slate-500">M</span></span>
                </div>
                <input 
                  type="range" min="60" max="720" step="15" 
                  value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </GlassCard>

              {/* Score */}
              <GlassCard className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-amber-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">主观质量</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-4xl font-black ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">/ 100</span>
                </div>
                <input 
                  type="range" min="0" max="100" 
                  value={score} onChange={(e) => setScore(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition-all"
                />
              </GlassCard>

              {/* HR */}
              <GlassCard className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-rose-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">静息心率 (RHR)</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{restingHr}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">BPM</span>
                </div>
                <input 
                  type="range" min="30" max="120" 
                  value={restingHr} onChange={(e) => setRestingHr(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:accent-rose-400 transition-all"
                />
              </GlassCard>

              {/* Calories */}
              <GlassCard className="p-6 bg-slate-900/40 border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Flame size={16} className="text-orange-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">全天能耗</span>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-white">{calories}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">KCAL</span>
                </div>
                <input 
                  type="range" min="1000" max="4500" step="50" 
                  value={calories} onChange={(e) => setCalories(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500 hover:accent-orange-400 transition-all"
                />
              </GlassCard>
            </div>

            <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex gap-4 items-start">
              <Info size={20} className="text-indigo-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-black text-indigo-300 uppercase tracking-widest">算法提示</p>
                <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                  当生理传感器离线时，系统将基于您的主观评分与代谢水平（KCAL），通过 <span className="text-white">Somno-Reverse</span> 算法反向合成睡眠阶段模型。
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Preview */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
              <Zap size={14} className="text-amber-500" /> 实时信号合成预览
            </h3>
            
            <GlassCard className="p-8 border-indigo-500/20 bg-indigo-500/5 h-full flex flex-col justify-between">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600/20 rounded-xl">
                      <BrainCircuit size={18} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">架构推演中</p>
                      <p className="text-[9px] text-indigo-400/60 font-black uppercase tracking-widest">Synthesizing Architecture</p>
                    </div>
                  </div>
                  <Waves size={20} className="text-indigo-500/40" />
                </div>

                <div className="space-y-4">
                  {[
                    { label: '预计深睡', value: previewData.deep, unit: 'min', color: 'bg-blue-500' },
                    { label: '预计 REM', value: previewData.rem, unit: 'min', color: 'bg-purple-500' },
                    { label: '预计清醒', value: previewData.awake, unit: 'min', color: 'bg-slate-500' },
                    { label: '模拟效率', value: previewData.efficiency, unit: '%', color: 'bg-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-white">{item.value}{item.unit}</span>
                      </div>
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color} transition-all duration-700`} 
                          style={{ width: `${item.unit === '%' ? item.value : (item.value / (duration || 1)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 space-y-4">
                {showError && (
                  <div className="flex items-center gap-2 text-rose-400 bg-rose-400/10 p-3 rounded-xl border border-rose-500/20 animate-in slide-in-from-top-2">
                    <ShieldAlert size={16} />
                    <span className="text-[10px] font-black uppercase">输入信号异常，请核对后重试</span>
                  </div>
                )}
                
                <button 
                  onClick={handleSave}
                  disabled={isValidating}
                  className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.25em] flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-[0.97] group ${
                    isValidating 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40 border border-indigo-400/20'
                  }`}
                >
                  {isValidating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-slate-600 border-t-indigo-400 rounded-full animate-spin"></div>
                      正在编码数据流
                    </>
                  ) : (
                    <>
                      <Check size={20} className="group-hover:scale-125 transition-transform" /> 
                      确认注入实验室
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center gap-2 opacity-30">
                  <ShieldAlert size={10} />
                  <span className="text-[8px] font-black uppercase tracking-[0.5em]">Encrypted Handshake Required</span>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
