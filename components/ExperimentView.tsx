
import React, { useState } from 'react';
import { 
  FlaskConical, Sparkles, Zap, BrainCircuit, 
  Target, Activity, Loader2, ChevronRight, CheckCircle2,
  Terminal, Info, Binary, Microchip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord } from '../types.ts';
import { designExperiment, SleepExperiment } from '../services/geminiService.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface ExperimentViewProps {
  data: SleepRecord;
  lang: Language;
}

export const ExperimentView: React.FC<ExperimentViewProps> = ({ data, lang }) => {
  const [experiment, setExperiment] = useState<SleepExperiment | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState(false);

  const t = translations[lang].experiment;

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const result = await designExperiment(data, lang);
      setExperiment(result);
      setActiveProtocol(false);
    } catch (err) {
      console.error("Experiment synthesis failed:", err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleCommit = () => {
    setActiveProtocol(true);
  };

  return (
    <div className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left">
      <header className="pt-8 space-y-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
            <FlaskConical size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
              {t.title}
            </h1>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mt-2 italic">
              {t.subtitle}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-indigo-500/[0.02]">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Microchip size={18} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Telemetry Summary</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase">Sleep Score</span>
                  <span className="text-2xl font-black italic text-white">{data.score}%</span>
                </div>
                <div className="flex justify-between items-end border-b border-white/5 pb-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase">Resting HR</span>
                  <span className="text-2xl font-black italic text-white">{data.heartRate.resting} <span className="text-[10px] uppercase not-italic">bpm</span></span>
                </div>
              </div>

              <button 
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
              >
                {isSynthesizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isSynthesizing ? t.synthesizing : t.generate}
              </button>
            </div>
          </GlassCard>

          <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[2.5rem] space-y-4">
             <div className="flex items-center gap-3">
               <Info size={16} className="text-indigo-400" />
               <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Protocol Logic</span>
             </div>
             <p className="text-[10px] text-slate-500 italic leading-relaxed">
               Experiments are dynamically synthesized by the Neural Core based on current biometric variance and circadian rhythms.
             </p>
          </div>
        </div>

        {/* Right Column: Experiment Display */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!experiment ? (
              <m.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-20 px-10 text-center space-y-8 border border-white/5 rounded-[4rem] bg-black/20"
              >
                <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center text-slate-700">
                  <Binary size={40} />
                </div>
                <p className="text-sm font-medium italic text-slate-500 max-w-sm leading-relaxed">
                  {t.noExperiment}
                </p>
              </m.div>
            ) : (
              <m.div 
                key="experiment"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <GlassCard className="p-12 rounded-[4.5rem] border-indigo-500/20 shadow-2xl overflow-hidden relative" intensity={1.5}>
                  <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none"><Terminal size={200} /></div>
                  
                  <div className="flex justify-between items-center mb-12 relative z-10">
                     <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <h3 className="text-xl font-black italic text-white uppercase tracking-tight">{t.activeHeader}</h3>
                     </div>
                     <Activity size={20} className="text-slate-700" />
                  </div>

                  <div className="space-y-12 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-indigo-400">
                        <Target size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.hypothesis}</span>
                      </div>
                      <p className="text-lg font-bold italic text-white leading-relaxed">"{experiment.hypothesis}"</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-indigo-400">
                        <Binary size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.protocol}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        {experiment.protocol.map((step, idx) => (
                          <div key={idx} className="p-5 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-4">
                            <span className="text-[10px] font-mono text-indigo-500 font-bold">0{idx+1}</span>
                            <p className="text-sm font-medium italic text-slate-300">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3 text-emerald-400">
                        <Activity size={18} />
                        <span className="text-[10px] font-black uppercase tracking-widest">{t.impact}</span>
                      </div>
                      <p className="text-sm font-medium italic text-slate-400 leading-relaxed">{experiment.expectedImpact}</p>
                    </div>
                  </div>

                  <div className="mt-12 relative z-10">
                    <button 
                      onClick={handleCommit}
                      disabled={activeProtocol}
                      className={`w-full py-6 rounded-full font-black text-xs uppercase tracking-[0.5em] flex items-center justify-center gap-3 transition-all italic shadow-2xl ${
                        activeProtocol 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-95'
                      }`}
                    >
                      {activeProtocol ? <CheckCircle2 size={18} /> : <Zap size={18} fill="currentColor" />}
                      {activeProtocol ? 'PROTOCOL COMMITTED' : t.commit}
                    </button>
                  </div>
                </GlassCard>
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
