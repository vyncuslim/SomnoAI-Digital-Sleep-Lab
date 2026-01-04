
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

  const previewData = useMemo(() => {
    const activityFactor = Math.min(0.05, (calories - 2000) / 40000);
    const deepBase = 0.22 + activityFactor;
    const remBase = 0.20;
    const awakeRatio = (100 - score) / 300; 
    const awake = Math.floor(duration * awakeRatio);
    const remaining = duration - awake;
    const deep = Math.floor(remaining * deepBase);
    const rem = Math.floor(remaining * remBase);
    const efficiency = Math.round(((duration - awake) / Math.max(1, duration)) * 100);
    return { deep, rem, awake, efficiency };
  }, [duration, score, calories]);

  const handleSave = () => {
    if (duration < 60) {
      setShowError(true);
      return;
    }
    setIsValidating(true);
    setTimeout(() => {
      const { deep, rem, awake, efficiency } = previewData;
      const light = duration - deep - rem - awake;
      const stages: SleepStage[] = [
        { name: 'Deep', duration: deep, startTime: '01:20' },
        { name: 'REM', duration: rem, startTime: '03:50' },
        { name: 'Light', duration: Math.max(0, light), startTime: '05:15' },
        { name: 'Awake', duration: awake, startTime: '23:30' },
      ];
      const newRecord: SleepRecord = {
        id: `manual-${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
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
        aiInsights: ["Lab: Subjective metrics injected. Synthesis engine completed reverse alignment based on metabolic rates."]
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
    if (h >= 7 && h <= 9) return { label: 'Optimal', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (h > 9) return { label: 'Oversleep', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Restricted', color: 'text-rose-400', bg: 'bg-rose-500/10' };
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-3xl bg-[#020617]/85 animate-in fade-in duration-700">
      <GlassCard className="w-full max-w-5xl max-h-[92vh] overflow-y-auto space-y-8 p-6 md:p-12 border-white/10 shadow-[0_40px_160px_-16px_rgba(0,0,0,1)] scrollbar-hide relative border-t-indigo-500/30">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-indigo-600/10 rounded-[1.75rem] flex items-center justify-center border border-indigo-500/20 shadow-inner">
              <Activity size={32} className="text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black tracking-tighter italic text-white leading-none">Manual Injection Terminal</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Active Link</span>
                </div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Signal Override Protocol v3.0</p>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-4 bg-white/5 hover:bg-rose-500/20 rounded-2xl text-slate-400 hover:text-rose-400 transition-all active:scale-90 border border-white/5 shadow-lg">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-indigo-500/20 transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-400" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Duration</span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${getDurationQuality(duration).color} ${getDurationQuality(duration).bg}`}>
                    {getDurationQuality(duration).label}
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{Math.floor(duration/60)}<span className="text-sm ml-1 text-slate-500">H</span></span>
                  <span className="text-5xl font-black text-white">{duration%60}<span className="text-sm ml-1 text-slate-500">M</span></span>
                </div>
                <input type="range" min="60" max="720" step="15" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </GlassCard>

              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-amber-500/20 transition-all">
                <div className="flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subjective Score</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`text-5xl font-black ${getScoreColor(score)}`}>{score}</span>
                  <span className="text-xs font-black text-slate-500 uppercase tracking-widest">/ 100</span>
                </div>
                <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500" />
              </GlassCard>

              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-rose-500/20 transition-all">
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resting HR (BPM)</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{restingHr}</span>
                </div>
                <input type="range" min="30" max="120" value={restingHr} onChange={(e) => setRestingHr(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500" />
              </GlassCard>

              <GlassCard className="p-6 bg-slate-900/50 border-white/5 space-y-4 hover:border-orange-500/20 transition-all">
                <div className="flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Energy Expenditure</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{calories}</span>
                  <span className="text-xs font-black text-slate-500 uppercase">KCAL</span>
                </div>
                <input type="range" min="500" max="8000" step="50" value={calories} onChange={(e) => setCalories(parseInt(e.target.value))} className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500" />
              </GlassCard>
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex gap-5 items-start">
              <Info size={24} className="text-indigo-400 shrink-0" />
              <div className="space-y-1.5">
                <p className="text-[11px] font-black text-indigo-300 uppercase tracking-widest">Logic Protocol Notice</p>
                <p className="text-[12px] text-slate-400 leading-relaxed font-medium">
                  Injected mode activates <span className="text-white font-bold italic">Somno-Synthesis v2</span>. The engine calibrates score vs RHR to generate physiological architecture map.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-5">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-3 flex items-center gap-2">
              <Zap size={14} className="text-amber-500 fill-amber-500" /> Lab Signal Preview
            </h3>
            
            <GlassCard className="flex-1 p-8 border-indigo-500/20 bg-indigo-500/5 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <BrainCircuit size={24} className="text-indigo-400" />
                    <div>
                      <p className="text-lg font-black text-white tracking-tight">Projected Architecture</p>
                    </div>
                  </div>
                  <Waves size={24} className="text-indigo-500/30 animate-pulse" />
                </div>

                <div className="space-y-6">
                  {[
                    { label: 'Deep Projected', value: previewData.deep, unit: 'm', color: 'bg-blue-500' },
                    { label: 'REM Projected', value: previewData.rem, unit: 'm', color: 'bg-purple-500' },
                    { label: 'Efficiency', value: previewData.efficiency, unit: '%', color: 'bg-emerald-500' }
                  ].map((item, idx) => (
                    <div key={idx} className="space-y-2.5">
                      <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-[0.15em]">
                        <span className="text-slate-500">{item.label}</span>
                        <span className="text-white font-mono">{item.value}{item.unit}</span>
                      </div>
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${item.color}`} style={{ width: `${item.unit === '%' ? item.value : (item.value / (duration || 1)) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-white/10 space-y-5">
                <button onClick={handleSave} disabled={isValidating} className={`w-full py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.96] ${isValidating ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white'}`}>
                  {isValidating ? 'Encoding Stream...' : 'Confirm Injection'}
                </button>
              </div>
            </GlassCard>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
