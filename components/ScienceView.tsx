import React from 'react';
import { 
  ArrowLeft, Brain, Activity, Waves, Info, ShieldAlert, Microscope, 
  Target, Zap, Binary, Fingerprint, HeartPulse, Cpu, Layers, BarChart3
} from 'lucide-react';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { motion } from 'framer-motion';

const m = motion as any;

interface ScienceViewProps {
  lang: Language;
  onBack: () => void;
}

export const ScienceView: React.FC<ScienceViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen bg-[#01040a] pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-700 font-sans text-left relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 opacity-[0.02] text-white pointer-events-none transform rotate-12">
        <Microscope size={600} strokeWidth={0.5} />
      </div>

      <header className="max-w-7xl mx-auto px-6 mb-20 relative z-10">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-6 space-y-32 relative z-10">
        {/* Core Narrative Hero */}
        <div className="space-y-10">
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-600/10 border border-indigo-500/20 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Scientific Protocol v2.8</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-none">
            {isZh ? '科学分析' : 'BIOLOGICAL'} <br/><span className="text-indigo-500">{isZh ? '架构' : 'ARCHITECTURE'}</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl leading-relaxed border-l-4 border-indigo-600/30 pl-10">
            {isZh 
              ? "SomnoAI Digital Sleep Lab 将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验室体验。" 
              : "SomnoAI Digital Sleep Lab integrates physiological monitoring, deep AI insights, and tailored health protocols into a unified digital sleep laboratory environment."}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <GlassCard className="p-16 rounded-[5rem] border-white/5 space-y-10 group" intensity={1.2}>
              <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                <HeartPulse size={40} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Signal Normalization</h3>
                <p className="text-slate-500 text-lg leading-relaxed italic font-bold opacity-80">
                  Raw heart rate and motion telemetry are cross-referenced against your historical 14-day baseline to isolate acute deviations.
                </p>
              </div>
           </GlassCard>

           <GlassCard className="p-16 rounded-[5rem] border-indigo-500/20 bg-indigo-600/[0.01] space-y-10 group" intensity={1.2}>
              <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                <Brain size={40} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Neural Synthesis</h3>
                <p className="text-slate-500 text-lg leading-relaxed italic font-bold opacity-80">
                  Gemini AI models analyze complex correlations between RHR stabilization and deep sleep architecture to identify recovery windows.
                </p>
              </div>
           </GlassCard>
        </div>

        {/* Closing CTA */}
        <footer className="pt-20 text-center space-y-12">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <BarChart3 size={16} />
              <p className="text-[10px] font-mono tracking-[0.5em] uppercase">SomnoAI Digital Sleep Lab Node • v2.8.5</p>
           </div>
           <button 
             onClick={onBack}
             className="px-20 py-8 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_30px_70px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
           >
             TERMINATE ANALYSIS MODULE
           </button>
        </footer>
      </div>
    </div>
  );
};