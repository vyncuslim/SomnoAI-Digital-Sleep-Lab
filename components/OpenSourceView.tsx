import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Github, Scale, Code2, ShieldCheck, ExternalLink, Globe, Layers, Lock, Cpu, Layout, GitBranch } from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface OpenSourceViewProps {
  lang: Language;
  onBack: () => void;
}

const DEPENDENCIES = [
  { name: 'React 18', license: 'MIT', url: 'https://reactjs.org' },
  { name: 'Lucide React', license: 'ISC', url: 'https://lucide.dev' },
  { name: 'Framer Motion', license: 'MIT', url: 'https://framer.com/motion' },
  { name: 'Recharts', license: 'MIT', url: 'https://recharts.org' },
  { name: 'Google Gemini API', license: 'Custom', url: 'https://ai.google.dev' },
  { name: 'Supabase', license: 'Apache-2.0', url: 'https://supabase.com' }
];

export const OpenSourceView: React.FC<OpenSourceViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';
  const t = translations[lang].legal;

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="flex items-center gap-6 mb-12 px-2 max-w-4xl mx-auto pt-10">
        <button 
          onClick={onBack}
          className="p-4 bg-white/5 hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-lg active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            {t.opensource} <span className="text-indigo-400">Strategy</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">
            SEMI-OPEN DUAL-REPOSITORY PROTOCOL • v4.5
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 px-4">
        {/* Semi-Open Source Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <GlassCard className="p-10 rounded-[3.5rem] border-white/5 bg-slate-900/40 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400"><Layout size={100} /></div>
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg"><Globe size={20} /></div>
                 <h3 className="text-lg font-black text-white italic uppercase">Public UI Node</h3>
              </div>
              <p className="text-sm text-slate-400 italic leading-relaxed">
                {isZh 
                  ? "前端界面、交互架构与 API 调用封装完全开源。这确保了受试者可以透明地审计数据隐私流向。" 
                  : "The interface layer, layout architecture, and API call encapsulations are fully Open Source, ensuring transparency in data privacy flows."}
              </p>
              <div className="pt-4 flex items-center gap-3">
                 <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">Visibility: PUBLIC</span>
                 <span className="text-[9px] font-black bg-white/5 text-slate-500 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">MIT License</span>
              </div>
           </GlassCard>

           <GlassCard className="p-10 rounded-[3.5rem] border-indigo-500/20 bg-indigo-600/[0.02] space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-400"><Lock size={100} /></div>
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-slate-800 rounded-xl text-indigo-400 shadow-lg"><Cpu size={20} /></div>
                 <h3 className="text-lg font-black text-white italic uppercase">Private Core Node</h3>
              </div>
              <p className="text-sm text-slate-400 italic leading-relaxed">
                {isZh 
                  ? "核心神经合成算法、Prompt 工程与内部诊断协议保存在私有仓库中。这是实验室的核心技术主权。" 
                  : "Core neural synthesis patterns, proprietary prompt engineering, and internal audit protocols reside in a sovereign private repository."}
              </p>
              <div className="pt-4 flex items-center gap-3">
                 <span className="text-[9px] font-black bg-rose-500/10 text-rose-500 px-3 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">Visibility: PRIVATE</span>
                 <span className="text-[9px] font-black bg-white/5 text-slate-500 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest">Proprietary</span>
              </div>
           </GlassCard>
        </div>

        <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-black/40" intensity={1.2}>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shrink-0">
               <GitBranch size={48} />
            </div>
            <div className="space-y-6">
               <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">{isZh ? '控制权资产' : 'Control as an Asset'}</h2>
               <p className="text-lg text-slate-300 italic leading-relaxed font-bold border-l-4 border-indigo-500/30 pl-8">
                 {isZh 
                   ? "SomnoAI 认为：代码只是工具，控制权才是资产。我们拒绝无节制的全部公开，只在正确的地方透明。通过双仓库架构，我们保护了研究资产，同时向社区开放了交互标准。" 
                   : "SomnoAI believes code is a tool, while control is the asset. We reject reckless transparency. Through a dual-repo architecture, we protect research assets while opening interaction standards."}
               </p>
               <div className="flex flex-wrap gap-4 pt-4">
                 <a 
                   href="https://github.com/vyncuslim/SomnoAI-Frontend" 
                   target="_blank" 
                   className="flex items-center px-8 py-4 bg-white/5 rounded-2xl text-slate-400 hover:text-white transition-all border border-white/5 font-black text-[10px] uppercase tracking-widest italic shadow-xl"
                 >
                   <Github size={18} className="mr-3" /> UI REPOSITORY (PUBLIC)
                 </a>
               </div>
            </div>
          </div>
        </GlassCard>

        {/* Ecosystem Transparency */}
        <div className="space-y-8">
           <div className="flex items-center gap-4 px-6">
              <Layers size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] italic">Open Ecosystem Credits</h2>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {DEPENDENCIES.map((dep) => (
                <GlassCard key={dep.name} className="p-8 rounded-[2.5rem] border-white/5 bg-slate-900/40 hover:border-indigo-500/20 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <h4 className="text-base font-black text-white italic uppercase tracking-tight">{dep.name}</h4>
                      <a href={dep.url} target="_blank" className="text-slate-700 group-hover:text-indigo-400 transition-colors">
                        <ExternalLink size={14} />
                      </a>
                   </div>
                   <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-emerald-500" />
                      <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">{dep.license}</span>
                   </div>
                </GlassCard>
              ))}
           </div>
        </div>

        <footer className="pt-20 text-center opacity-40">
           <button 
             onClick={onBack}
             className="px-16 py-7 bg-slate-900 border border-white/5 text-slate-400 rounded-full font-black text-xs uppercase tracking-widest italic active:scale-95 transition-all hover:bg-slate-800"
           >
             Return to Lab Terminal
           </button>
        </footer>
      </div>
    </div>
  );
};