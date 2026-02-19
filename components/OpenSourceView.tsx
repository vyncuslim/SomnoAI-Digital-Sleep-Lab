import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Github, Scale, Code2, ShieldCheck, ExternalLink, Globe, 
  Layers, Lock, Cpu, Layout, GitBranch, Binary, Database, EyeOff, FileText, Server
} from 'lucide-react';
import { GlassCard } from './GlassCard.tsx';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface OpenSourceViewProps {
  lang: Language;
  onBack: () => void;
}

export const OpenSourceView: React.FC<OpenSourceViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';
  const t = translations[lang].legal;

  const repoNodes = [
    {
      id: 'SomnoAI-frontend',
      visibility: 'PUBLIC',
      role: isZh ? '交互与可视化' : 'UI & Visualization',
      desc: isZh ? '存放网页、界面、API 调用逻辑。代码完全透明，可接受审计。' : 'UI, layout, and API orchestration logic. Fully transparent for public audit.',
      icon: Layout,
      color: 'text-indigo-400',
      tag: 'MIT'
    },
    {
      id: 'SomnoAI-docs',
      visibility: 'PUBLIC',
      role: isZh ? '战略层展示' : 'Strategy & Docs',
      desc: isZh ? '架构图、白皮书、技术协议。展示实验室的宏观愿景。' : 'Architecture diagrams, whitepapers, and technical protocols.',
      icon: FileText,
      color: 'text-emerald-400',
      tag: 'OPEN'
    },
    {
      id: 'SomnoAI-core',
      visibility: 'PRIVATE',
      role: isZh ? '核心算法引擎' : 'Core Neural Engine',
      desc: isZh ? '模型代码、训练脚本、私有权重、数据处理算法。这是我们的“引擎”。' : 'Neural algorithms, training scripts, and proprietary weights. Protected asset.',
      icon: Cpu,
      color: 'text-rose-500',
      tag: 'Sovereign'
    }
  ];

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
            {t.opensource} <span className="text-indigo-400">Structure</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono font-bold uppercase tracking-[0.4em] mt-2">
            SEMI-OPEN DUAL-NODE PROTOCOL • PHASE 1: PHYSICAL ISOLATION
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-12 px-4">
        {/* 核心资产隔离逻辑卡片 */}
        <section className="space-y-6">
           <div className="flex items-center gap-4 px-6">
              <Layers size={18} className="text-indigo-400" />
              <h2 className="text-xs font-black uppercase text-slate-600 tracking-[0.3em] italic">Architecture Allocation</h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {repoNodes.map((repo) => (
                <GlassCard key={repo.id} className={`p-8 rounded-[3rem] border-white/5 bg-slate-900/40 relative overflow-hidden group hover:border-indigo-500/20 transition-all`}>
                  <div className="flex justify-between items-start mb-6">
                     <div className={`p-3 bg-white/5 rounded-2xl ${repo.color} shadow-inner`}><repo.icon size={20} /></div>
                     <span className={`text-[8px] font-black px-2 py-1 rounded-full border ${repo.visibility === 'PUBLIC' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                        {repo.visibility}
                     </span>
                  </div>
                  <h3 className="text-sm font-black text-white uppercase tracking-tight mb-1">{repo.id}</h3>
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 italic">{repo.role}</p>
                  <p className="text-[11px] text-slate-500 italic leading-relaxed mb-6 h-12 line-clamp-3">
                    {repo.desc}
                  </p>
                  <div className="flex items-center gap-2 mt-auto">
                    <Database size={10} className="text-slate-700" />
                    <span className="text-[9px] font-mono text-slate-700 font-bold">{repo.tag} Node</span>
                  </div>
                </GlassCard>
              ))}
           </div>
        </section>

        <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-black/40" intensity={1.2}>
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shrink-0">
               <GitBranch size={48} />
            </div>
            <div className="space-y-6">
               <h2 className="text-4xl font-black italic text-white uppercase tracking-tight">{isZh ? '“半开源”资产管理' : 'Semi-Open Logic'}</h2>
               <p className="text-lg text-slate-300 italic leading-relaxed font-bold border-l-4 border-indigo-500/30 pl-8">
                 {isZh 
                   ? "展示实力，但保留武器。SomnoAI 认为代码分层是创业的护城河。我们在 Public 仓库公开界面标准，在 Private 仓库锁死核心引擎。这种结构化开放保护了长期优势。" 
                   : "Show strength, but keep weapons. SomnoAI treats code layering as a competitive moat. We open the interface standards in Public and lock the core engine in Private. This structured openness ensures long-term dominance."}
               </p>
            </div>
          </div>
        </GlassCard>

        {/* 敏感信息保护声明 */}
        <GlassCard className="p-10 rounded-[3.5rem] border-rose-500/10 bg-rose-500/[0.01] space-y-8">
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <EyeOff size={24} className="text-rose-500" />
              <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Security Hardening</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-10 text-left">
              <div className="space-y-4">
                 <p className="text-[11px] font-black text-rose-500 uppercase tracking-widest italic">Ignored Assets (Public Repo)</p>
                 <div className="bg-black/60 p-6 rounded-[2rem] border border-white/5 font-mono text-[10px] text-slate-500 space-y-2">
                    <p># Security Buffer Active</p>
                    <p className="text-rose-400">.env</p>
                    <p className="text-rose-400">*.ckpt # Model Weights</p>
                    <p className="text-rose-400">*.pt   # PyTorch Models</p>
                    <p>node_modules/</p>
                 </div>
              </div>
              <div className="space-y-4 flex flex-col justify-center">
                 <div className="flex items-center gap-3 text-emerald-500">
                    <ShieldCheck size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Safe Deployment</span>
                 </div>
                 <p className="text-xs text-slate-500 leading-relaxed italic">
                   {isZh 
                     ? "所有 API Key 和服务器地址通过加密的环境变量注入，永不出现在 Public 源码中。我们执行严苛的审计流程以防资产泄露。" 
                     : "All API Keys and server addresses are injected via encrypted environment variables. They never appear in Public source code."}
                 </p>
              </div>
           </div>
        </GlassCard>

        <footer className="pt-20 text-center opacity-40 space-y-10">
           <div className="flex flex-col items-center gap-4">
              <a 
                href="https://github.com/vyncuslim/SomnoAI-Frontend" 
                target="_blank" 
                className="flex items-center px-12 py-6 bg-white/5 rounded-full text-slate-400 hover:text-white transition-all border border-white/5 font-black text-[10px] uppercase tracking-widest italic shadow-xl"
              >
                <Github size={18} className="mr-3" /> ACCESS PUBLIC UI NODE
              </a>
           </div>
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