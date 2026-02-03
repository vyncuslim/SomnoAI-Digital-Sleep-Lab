
import React from 'react';
import { 
  ArrowLeft, Brain, Activity, Waves, Info, ShieldAlert, Microscope, 
  Target, Zap, Binary, Fingerprint, HeartPulse
} from 'lucide-react';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';

interface ScienceViewProps {
  lang: Language;
  onBack: () => void;
}

export const ScienceView: React.FC<ScienceViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="max-w-7xl mx-auto px-4 mb-12 md:mb-20">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-6">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
             <Logo size={120} animated={true} className="mx-auto relative z-10" />
          </div>
          <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
            {isZh ? '科学' : 'The Science'} <span className="text-indigo-400">Analysis</span>
          </h1>
          <p className="text-[10px] md:text-[12px] text-slate-500 font-mono font-bold uppercase tracking-[0.5em] italic">
            SomnoAI Neural Architecture & Biometric Processing
          </p>
        </div>

        <section className="space-y-8">
           <div className="flex items-center gap-4 border-b border-white/5 pb-6">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Binary size={24} /></div>
              <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">How we analyze your sleep</h2>
           </div>
           <p className="text-slate-400 leading-relaxed italic text-lg">
             {isZh 
               ? 'SomnoAI 不仅仅是记录时间。我们利用边缘计算和生成式 AI 模型，从复杂的生理信号流中提取出深层的神经恢复指标。' 
               : 'SomnoAI goes beyond simple time logging. We utilize edge computing and generative AI models to extract deep neural recovery metrics from complex biometric streams.'}
           </p>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: HeartPulse, 
                  title: isZh ? '心率变异性' : 'Heart Rate', 
                  desc: isZh ? '分析静息心率与 HRV 信号，识别自主神经系统的恢复状态。' : 'Analyzes RHR and HRV signals to identify autonomic nervous system recovery states.' 
                },
                { 
                  icon: Waves, 
                  title: isZh ? '呼吸节奏' : 'Respiration', 
                  desc: isZh ? '通过呼吸微动检测睡眠深浅，识别 REM 阶段。' : 'Detects sleep depth through respiratory micromovements to identify REM stages.' 
                },
                { 
                  icon: Activity, 
                  title: isZh ? '体动轨迹' : 'Motion', 
                  desc: isZh ? '过滤微小的体动信号，精确区分觉醒与浅睡状态。' : 'Filters micromovement signals to precisely distinguish between Awake and Light sleep.' 
                }
              ].map((item, i) => (
                <GlassCard key={i} className="p-8 rounded-[3rem] border-white/5">
                   <item.icon className="text-indigo-400 mb-6" size={32} />
                   <h3 className="text-white font-black italic uppercase text-sm mb-3">{item.title}</h3>
                   <p className="text-slate-500 text-xs leading-relaxed italic">{item.desc}</p>
                </GlassCard>
              ))}
           </div>
        </section>

        <section className="space-y-8">
           <GlassCard className="p-10 md:p-14 rounded-[4rem] border-white/10 bg-indigo-500/[0.02]">
              <div className="flex items-center gap-4 mb-8">
                 <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Microscope size={24} /></div>
                 <h2 className="text-2xl font-black italic text-white uppercase tracking-tight">Neural Staging Engine</h2>
              </div>
              <div className="space-y-10">
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono font-bold shrink-0">01</div>
                    <div className="space-y-2">
                       <h4 className="text-white font-bold italic uppercase text-base">Biometric Normalization</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">Raw data from wearables is normalized against your specific baseline (stored locally) to eliminate individual physiological bias.</p>
                    </div>
                 </div>
                 <div className="flex gap-6 items-start">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono font-bold shrink-0">02</div>
                    <div className="space-y-2">
                       <h4 className="text-white font-bold italic uppercase text-base">Generative Synthesis</h4>
                       <p className="text-slate-400 text-sm leading-relaxed italic">Advanced AI models synthesize patterns in heart rate and movement to reconstruct your hypnogram (sleep architecture).</p>
                    </div>
                 </div>
              </div>
           </GlassCard>
        </section>

        <section className="p-10 md:p-14 bg-rose-500/5 border border-rose-500/20 rounded-[4rem] space-y-6">
           <div className="flex items-center gap-4 text-rose-500">
              <ShieldAlert size={32} />
              <h2 className="text-2xl font-black italic uppercase tracking-tight">Medical Disclaimer</h2>
           </div>
           <p className="text-slate-300 leading-relaxed italic text-base">
             {isZh 
               ? 'SomnoAI 是一项旨在协助优化健康和提升生产力的实验性研究工具，而非医疗诊断设备。AI 生成的所有见解仅供教育参考。如果您有严重的睡眠呼吸暂停或长期失眠问题，请务必咨询持有执照的医疗专家。' 
               : 'SomnoAI is an experimental research tool designed for optimization and productivity assistance, not a medical diagnostic device. All AI-generated insights are for educational reference only. If you suffer from serious sleep apnea or chronic insomnia, please consult a licensed medical professional.'}
           </p>
        </section>

        <footer className="pt-12 text-center opacity-30">
           <p className="text-[9px] font-mono tracking-widest uppercase mb-8">SomnoAI Digital Sleep Lab • Neural Research Division</p>
           <button onClick={onBack} className="px-12 py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-widest italic shadow-2xl active:scale-95 transition-all">Dismiss Module</button>
        </footer>
      </div>
    </div>
  );
};
