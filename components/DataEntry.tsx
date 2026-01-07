
import React, { useState, useMemo } from 'react';
// Added Loader2 to the lucide-react imports
import { X, Check, Clock, Heart, Star, Flame, Info, ShieldAlert, Activity, Zap, BrainCircuit, Waves, Terminal, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord, SleepStage } from '../types.ts';
import { motion } from 'framer-motion';

// Fix: Use any cast to bypass broken library types for motion props
const m = motion as any;

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
        aiInsights: ["Manual injection override detected. Biometric synchronization complete."]
      };
      onSave(newRecord);
      setIsValidating(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/90 overflow-y-auto">
      <m.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl">
        <GlassCard className="p-8 md:p-12 space-y-10 border-indigo-500/20 shadow-2xl">
          <header className="flex justify-between items-center border-b border-white/5 pb-8">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                <Terminal size={28} className="text-indigo-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-3xl font-black italic text-white tracking-tighter">Injection Terminal</h2>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.4em]">Signal Override Protocol</p>
              </div>
            </div>
            <button onClick={onClose} className="p-3 bg-white/5 hover:bg-rose-500/20 rounded-xl text-slate-400 hover:text-rose-400 transition-all">
              <X size={24} />
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500 flex items-center gap-2"><Clock size={12}/> Duration</span>
                  <span className="text-indigo-400 font-mono">{Math.floor(duration/60)}H {duration%60}M</span>
                </div>
                <input type="range" min="120" max="720" step="15" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500 flex items-center gap-2"><Star size={12}/> Subjective Score</span>
                  <span className="text-indigo-400 font-mono">{score}</span>
                </div>
                <input type="range" min="0" max="100" value={score} onChange={(e) => setScore(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-slate-500 flex items-center gap-2"><Heart size={12}/> Resting HR</span>
                  <span className="text-indigo-400 font-mono">{restingHr} BPM</span>
                </div>
                <input type="range" min="40" max="110" value={restingHr} onChange={(e) => setRestingHr(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
              </div>

              <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex gap-4">
                <Info size={20} className="text-indigo-500 shrink-0" />
                <p className="text-[11px] text-slate-400 italic">Synthetic engine will extrapolate architecture based on metabolic load and RHR stabilization.</p>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-indigo-500/20 rounded-3xl p-8 flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <BrainCircuit size={20} className="text-indigo-400" />
                  <h3 className="text-sm font-black italic text-white uppercase tracking-widest">Biometric Projection</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                       <span>Efficiency Projection</span>
                       <span>{previewData.efficiency}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                       <m.div animate={{ width: `${previewData.efficiency}%` }} className="h-full bg-emerald-500" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                       <span>Deep Recovery</span>
                       <span>{previewData.deep}M</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                       <m.div animate={{ width: `${(previewData.deep/duration)*100}%` }} className="h-full bg-indigo-500" />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSave} 
                disabled={isValidating}
                className="w-full py-5 mt-10 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                {isValidating ? <Loader2 className="animate-spin" /> : <Zap size={16} />}
                {isValidating ? 'Encoding Data Stream' : 'Execute Injection'}
              </button>
            </div>
          </div>
        </GlassCard>
      </m.div>
    </div>
  );
};
