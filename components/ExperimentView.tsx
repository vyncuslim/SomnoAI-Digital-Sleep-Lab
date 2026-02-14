import React, { useState } from 'react';
import { 
  FlaskConical, Sparkles, Zap, BrainCircuit, 
  Target, Activity, Loader2, CheckCircle2,
  Terminal, Info, Binary, Microchip
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { SleepRecord } from '../types.ts';
import { designExperiment, SleepExperiment } from '../services/geminiService.ts';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

export const ExperimentView: React.FC<{ data: SleepRecord; lang: Language }> = ({ data, lang }) => {
  const [experiment, setExperiment] = useState<SleepExperiment | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const t = translations[lang].experiment;

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    try {
      const result = await designExperiment(data, lang);
      setExperiment(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="space-y-10 pb-40 max-w-4xl mx-auto px-4 font-sans text-left">
      <header className="pt-8 space-y-2">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 shadow-xl">
            <FlaskConical size={24} />
          </div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{t.title}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 rounded-[3rem] border-white/5 bg-slate-900/40 shadow-inner">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Microchip size={18} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Baseline Unit</span>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-indigo-500 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
              >
                {isSynthesizing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {isSynthesizing ? t.synthesizing : t.generate}
              </button>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            {!experiment ? (
              <m.div className="h-full flex flex-col items-center justify-center py-24 text-center space-y-8 border-2 border-dashed border-white/5 rounded-[4rem] bg-black/20">
                <Binary size={40} className="text-slate-800" />
                <p className="text-sm font-black uppercase tracking-widest italic text-slate-700">{t.noExperiment}</p>
              </m.div>
            ) : (
              <GlassCard className="p-12 rounded-[4.5rem] border-indigo-500/20 shadow-2xl relative overflow-hidden bg-indigo-900/5" intensity={1.5}>
                <div className="space-y-12 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <Target size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Neural Hypothesis</span>
                    </div>
                    <p className="text-xl font-bold italic text-slate-200 leading-relaxed border-l-2 border-indigo-500/30 pl-6">"{String(experiment.hypothesis)}"</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-indigo-400">
                      <Binary size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Protocol Execution Steps</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      {Array.isArray(experiment.protocol) && experiment.protocol.map((step, idx) => (
                        <div key={idx} className="p-6 bg-black/40 border border-white/5 rounded-[2rem] flex items-center gap-6 shadow-inner group hover:border-indigo-500/30 transition-all">
                          <span className="text-xl font-black italic text-indigo-500/40 group-hover:text-indigo-400">0{idx+1}</span>
                          <p className="text-sm font-medium italic text-slate-300 leading-relaxed">{String(step)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <Activity size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Expected Restoration Impact</span>
                    </div>
                    <p className="text-sm font-medium italic text-slate-500 leading-relaxed pl-1">{String(experiment.expectedImpact)}</p>
                  </div>
                </div>
              </GlassCard>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};