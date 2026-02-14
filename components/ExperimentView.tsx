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
          <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
            <FlaskConical size={24} />
          </div>
          <h1 className="text-3xl font-black italic text-slate-900 uppercase tracking-tighter leading-none">{t.title}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <GlassCard className="p-8 rounded-[3rem] border-slate-100 bg-slate-50">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Microchip size={18} className="text-indigo-600" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Baseline</span>
              </div>
              <button 
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] shadow-xl hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 italic"
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
              <m.div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-8 border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/30">
                <Binary size={40} className="text-slate-200" />
                <p className="text-sm font-medium italic text-slate-400">{t.noExperiment}</p>
              </m.div>
            ) : (
              <GlassCard className="p-12 rounded-[4.5rem] border-indigo-100 shadow-2xl relative overflow-hidden" intensity={1.5}>
                <div className="space-y-12 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-indigo-600">
                      <Target size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.hypothesis}</span>
                    </div>
                    <p className="text-lg font-bold italic text-slate-900 leading-relaxed">"{String(experiment.hypothesis)}"</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-3 text-indigo-600">
                      <Binary size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.protocol}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {Array.isArray(experiment.protocol) && experiment.protocol.map((step, idx) => (
                        <div key={idx} className="p-5 bg-white border border-slate-100 rounded-2xl flex items-center gap-4 shadow-sm">
                          <span className="text-[10px] font-mono text-indigo-500 font-bold">0{idx+1}</span>
                          <p className="text-sm font-medium italic text-slate-700">{String(step)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-emerald-600">
                      <Activity size={18} />
                      <span className="text-[10px] font-black uppercase tracking-widest">{t.impact}</span>
                    </div>
                    <p className="text-sm font-medium italic text-slate-500 leading-relaxed">{String(experiment.expectedImpact)}</p>
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