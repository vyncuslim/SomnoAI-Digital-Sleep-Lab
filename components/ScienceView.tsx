import React from 'react';
import { 
  ArrowLeft, Brain, Activity, Waves, Info, ShieldAlert, Microscope, 
  Target, Zap, Binary, Fingerprint, HeartPulse, Cpu, Layers, BarChart3,
  ExternalLink, Globe, BookOpen, Smartphone, Cloud, Terminal
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

const REFERENCE_NODES = [
  { name: 'Sleep Foundation', url: 'https://www.sleepfoundation.org', category: 'General' },
  { name: 'National Institute of Health', url: 'https://www.nih.gov', category: 'Federal' },
  { name: 'PubMed Central', url: 'https://www.ncbi.nlm.nih.gov/pmc/', category: 'Journals' },
  { name: 'Society for Neuroscience', url: 'https://www.sfn.org', category: 'Neuro' }
];

export const ScienceView: React.FC<ScienceViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen bg-[#01040a] pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-700 font-sans text-left relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-32 opacity-[0.02] text-white pointer-events-none transform rotate-12">
        <Terminal size={600} strokeWidth={0.5} />
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
             <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Scientific Protocol v3.0</span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-none">
            {isZh ? '混合架构' : 'HYBRID'} <br/><span className="text-indigo-500">{isZh ? '分析协议' : 'PROTOCOL'}</span>
          </h1>
          
          <p className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl leading-relaxed border-l-4 border-indigo-600/30 pl-10">
            {isZh 
              ? "SomnoAI 不再依赖单一生态，而是通过 Health Connect 混合架构，将多种品牌硬件的遥测数据聚合至 Web 端 AI 引擎，实现跨设备的高级恢复评估。" 
              : "SomnoAI no longer relies on a single ecosystem. Through a hybrid Health Connect architecture, we aggregate telemetry from multiple hardware brands into our Web AI engine for elite recovery assessment."}
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
           <GlassCard className="p-16 rounded-[5rem] border-white/5 space-y-10 group" intensity={1.2}>
              <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                <Smartphone size={40} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Health Connect Ingress</h3>
                <p className="text-slate-500 text-lg leading-relaxed italic font-bold opacity-80">
                  Data flows from your smartwatch into Android Health Connect. Our App cleans, encrypts, and buffers this telemetry before cloud transmission.
                </p>
              </div>
           </GlassCard>

           <GlassCard className="p-16 rounded-[5rem] border-indigo-500/20 bg-indigo-600/[0.01] space-y-10 group" intensity={1.2}>
              <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 w-fit group-hover:scale-110 transition-transform">
                <Brain size={40} />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black italic text-white uppercase tracking-tight">Neural Synthesis Model</h3>
                <p className="text-slate-500 text-lg leading-relaxed italic font-bold opacity-80">
                  Gemini 2.5 Pro processes the de-identified biometric streams on login, reconstructing your deep sleep architecture with clinical-grade precision.
                </p>
              </div>
           </GlassCard>
        </div>

        {/* Methodology Flow */}
        <div className="space-y-16">
          <div className="space-y-4">
             <div className="flex items-center gap-4">
                <Zap size={24} className="text-indigo-400" />
                <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">Data <span className="text-indigo-400">Handshake</span></h2>
             </div>
             <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.6em] italic">From Hardware to Insight</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
               { icon: Activity, title: "Normalization", desc: "AI filters noise from multi-brand sensors to establish a stable biological baseline." },
               { icon: Binary, title: "Correlation", desc: "Cross-referencing RHR, HRV, and REM cycles to find the hidden 'Restoration Score'." },
               { icon: Cloud, title: "Persistence", desc: "Secure cloud upload from mobile app ensures data availability across all login nodes." }
             ].map((m, i) => (
               <div key={i} className="p-10 bg-slate-900/40 rounded-[3rem] border border-white/5 space-y-6">
                  <div className="text-indigo-500"><m.icon size={32} /></div>
                  <h4 className="text-xl font-black italic text-white uppercase">{m.title}</h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic font-medium">{m.desc}</p>
               </div>
             ))}
          </div>
        </div>

        {/* Closing CTA */}
        <footer className="pt-20 text-center space-y-12">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <BarChart3 size={16} />
              <p className="text-[10px] font-mono tracking-[0.5em] uppercase">SomnoAI Digital Sleep Lab Node • v3.0.1</p>
           </div>
           <button 
             onClick={onBack}
             className="px-20 py-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_30px_70px_rgba(79,70,229,0.3)] active:scale-95 transition-all"
           >
             RETURN TO TERMINAL
           </button>
        </footer>
      </div>
    </div>
  );
};