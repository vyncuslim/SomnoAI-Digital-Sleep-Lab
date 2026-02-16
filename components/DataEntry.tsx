import React, { useState, useMemo } from 'react';
import { X, Check, Clock, Heart, Star, Flame, Info, ShieldAlert, Activity, Zap, BrainCircuit, Waves, Terminal, Loader2, ArrowRight } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord, SleepStage } from '../types.ts';
import { motion } from 'framer-motion';

const m = motion as any;

interface DataEntryProps {
  onClose: () => void;
  onSave: (record: SleepRecord) => void;
}

export const DataEntry: React.FC<DataEntryProps> = ({ onClose, onSave }) => {
  const [duration, setDuration] = useState(450); 
  const [score, setScore] = useState(85);
  const [restingHr, setRestingHr] = useState(62);
  const [isValidating, setIsValidating] = useState(false);

  const previewData = useMemo(() => {
    const deepBase = 0.22;
    const remBase = 0.20;
    const awakeRatio = (100 - score) / 300; 
    const awake = Math.floor(duration * awakeRatio);
    const remaining = duration - awake;
    const deep = Math.floor(remaining * deepBase);
    const rem = Math.floor(remaining * remBase);
    const efficiency = Math.round(((duration - awake) / Math.max(1, duration)) * 100);
    return { deep, rem, awake, efficiency };
  }, [duration, score]);

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
        stages,
        heartRate: { resting: restingHr, max: restingHr + 15, min: restingHr - 10, average: restingHr + 5, history: [] },
        aiInsights: ["Manual injection override complete. Biometric link stable."]
      };
      onSave(newRecord);
      setIsValidating(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-3xl bg-[#01040a]/95">
      <m.div initial={{ scale: 0.95, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} className="w-full max-w-5xl">
        <GlassCard className="p-10 md:p-16 rounded-[4.5rem] border-white/5 shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] relative overflow-hidden" intensity={1.5}>
          {/* Background Detail */}
          <div className="absolute top-0 right-0 p-20 opacity-[0.02] text-indigo-400 pointer-events-none transform rotate-45">
             <Waves size={400} />
          </div>

          <header className="flex justify-between items-center mb-16 border-b border-white/5 pb-10 relative z-10">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 rounded-[2rem] flex items-center justify-center border border-indigo-500/20 shadow-2xl">
                <Terminal size={32} className="text-indigo-400" />
              </div>
              <div className="space-y-1 text-left">
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">Injection Terminal</h2>
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.5em] italic">Manual Biometric Synthesis v4.1</p>
              </div>
            </div>
            <button onClick={onClose} className="p-5 bg-white/5 hover:bg-rose-500/10 rounded-full text-slate-500 hover:text-rose-500 transition-all border border-white/5">
              <X size={28} />
            </button>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            <div className="lg:col-span-7 space-y-12">
              {[
                { label: 'Time Stature', icon: Clock, value: `${Math.floor(duration/60)}H ${duration%60}M`, state: duration, set: setDuration, min: 120, max: 720, step: 15 },
                { label: 'Perceived Quality', icon: Star, value: `${score}%`, state: score, set: setScore, min: 0, max: 100, step: 1 },
                { label: 'Resting Pulse', icon: Heart, value: `${restingHr} BPM`, state: restingHr, set: setRestingHr, min: 40, max: 110, step: 1 }
              ].map((field) => (
                <div key={field.label} className="space-y-6">
                  <div className="flex justify-between items-center px-4">
                     <div className="flex items-center gap-3 text-slate-500">
                        <field.icon size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest italic">{field.label}</span>
                     </div>
                     <span className="text-2xl font-black italic text-indigo-400 tabular-nums">{field.value}</span>
                  </div>
                  <div className="relative h-12 flex items-center group">
                     <div className="absolute inset-x-0 h-1 bg-slate-900 rounded-full" />
                     <input 
                       type="range" min={field.min} max={field.max} step={field.step} value={field.state} 
                       onChange={(e) => field.set(parseInt(e.target.value))} 
                       className="absolute inset-x-0 w-full bg-transparent appearance-none cursor-pointer accent-indigo-500 h-1 z-10" 
                     />
                     <m.div 
                       className="absolute left-0 h-1 bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                       style={{ width: `${((field.state - field.min) / (field.max - field.min)) * 100}%` }}
                     />
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-5">
              <div className="bg-slate-900/60 border border-white/5 rounded-[4rem] p-10 h-full flex flex-col justify-between shadow-2xl">
                 <div className="space-y-10">
                    <div className="flex items-center gap-3 text-indigo-400">
                       <BrainCircuit size={20} />
                       <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">Projection Engine</h3>
                    </div>
                    
                    <div className="space-y-8">
                       {[
                         { label: 'Synthesis Efficiency', val: previewData.efficiency, color: 'bg-emerald-500' },
                         { label: 'Deep Recovery Ratio', val: Math.round((previewData.deep/duration)*100), color: 'bg-indigo-500' }
                       ].map(proj => (
                         <div key={proj.label} className="space-y-3">
                            <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 italic px-2">
                               <span>{proj.label}</span>
                               <span className="text-white">{proj.val}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-black rounded-full overflow-hidden">
                               <m.div animate={{ width: `${proj.val}%` }} className={`h-full ${proj.color} shadow-[0_0_10px_currentColor]`} />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 <button 
                   onClick={handleSave} disabled={isValidating}
                   className="w-full py-8 mt-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2.5rem] font-black text-[12px] uppercase tracking-[0.5em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 disabled:opacity-50 italic group"
                 >
                   {isValidating ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                   {isValidating ? 'Encoding Stream...' : 'Execute Injection'}
                   <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </m.div>
    </div>
  );
};