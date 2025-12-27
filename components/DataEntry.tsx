
import React, { useState } from 'react';
import { X, Check, Clock, Heart, Star, Flame } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord, SleepStage } from '../types.ts';

interface DataEntryProps {
  onClose: () => void;
  onSave: (record: SleepRecord) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ onClose, onSave }) => {
  const [duration, setDuration] = useState(420);
  const [score, setScore] = useState(80);
  const [restingHr, setRestingHr] = useState(60);
  const [calories, setCalories] = useState(2000);

  const handleSave = () => {
    const deep = Math.floor(duration * 0.2);
    const rem = Math.floor(duration * 0.25);
    const awake = Math.floor(duration * 0.05);
    const light = duration - deep - rem - awake;

    const stages: SleepStage[] = [
      { name: '深睡', duration: deep, startTime: '01:30' },
      { name: 'REM', duration: rem, startTime: '03:00' },
      { name: '浅睡', duration: light, startTime: '04:00' },
      { name: '清醒', duration: awake, startTime: '23:00' },
    ];

    const newRecord: SleepRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      score,
      totalDuration: duration,
      deepRatio: Math.round((deep / duration) * 100),
      remRatio: Math.round((rem / duration) * 100),
      efficiency: score,
      calories,
      stages,
      heartRate: {
        resting: restingHr,
        max: restingHr + 20,
        min: restingHr - 5,
        average: restingHr + 5,
        history: Array.from({ length: 24 }, (_, i) => ({ time: `${i}:00`, bpm: restingHr + Math.random() * 10 })),
      },
      aiInsights: ["实验室：手动录入的代谢模型分析中..."]
    };

    onSave(newRecord);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40">
      <GlassCard className="w-full max-w-md space-y-8 p-8 border-indigo-500/30">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold tracking-tighter">生理信号补录</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" /> 睡眠时长: {Math.floor(duration/60)}h {duration%60}m
            </label>
            <input 
              type="range" min="120" max="720" step="15" 
              value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Flame size={14} className="text-orange-400" /> 代谢消耗: {calories} kcal
            </label>
            <input 
              type="range" min="0" max="5000" step="50" 
              value={calories} onChange={(e) => setCalories(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Star size={14} className="text-amber-400" /> 质量评分: {score}
            </label>
            <input 
              type="range" min="0" max="100" 
              value={score} onChange={(e) => setScore(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <Heart size={14} className="text-rose-400" /> 静息心率: {restingHr} BPM
            </label>
            <input 
              type="range" min="40" max="100" 
              value={restingHr} onChange={(e) => setRestingHr(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95"
        >
          <Check size={20} /> 保存实验数据
        </button>
      </GlassCard>
    </div>
  );
};
