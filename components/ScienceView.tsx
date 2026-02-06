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

  const metrics = [
    { 
      icon: HeartPulse, 
      title: isZh ? '心率变异性 (HRV)' : 'Heart Rate Variability', 
      desc: isZh ? '实时分析 RHR 与 HRV 信号，通过频率域分析识别副交感神经系统的恢复状态。' : 'Analyzes RHR and HRV signals using frequency-domain analysis to identify parasympathetic recovery.' 
    },
    { 
      icon: Waves, 
      title: isZh ? '呼吸动力学' : 'Respiratory Dynamics', 
      desc: isZh ? '通过高频采样捕捉微小的胸廓起伏，利用形态学特征提取呼吸频率并辅助 REM 识别。' : 'Captures thoracic movement via high-frequency sampling to extract respiratory rates and assist REM detection.' 
    },
    { 
      icon: Activity, 
      title: isZh ? '体动轨迹分析' : 'Actigraphy Analysis', 
      desc: isZh ? '利用三轴加速度计捕捉睡眠中的翻身与肢体震颤，精确过滤睡眠中的假阳性觉醒信号。' : 'Uses tri-axial accelerometry to track limb movements, filtering false-positive wake signals during sleep.' 
    }
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-700 font-sans text-left">
      <header className="max-w-7xl mx-auto px-4 mb-12 md:mb-20">
        <button 
          onClick={onBack}
          className="p-4 bg-slate-950/80 backdrop-blur-3xl hover:bg-white/10 rounded-3xl text-slate-400 hover:text-white transition-all border border-white/5 shadow-2xl active:scale-95"
        >
          <ArrowLeft size={24} />
        </button>
      </header>

      <div className="max-w-5xl mx-auto px-4 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-8">
          <div className="relative inline-block">
             <div className="absolute inset-0 bg-indigo-500/20 blur-[120px] rounded-full animate-pulse" />
             <Logo size={140} animated={true} className="mx-auto relative z-10" />
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">
              {isZh ? '科学' : 'Biological'} <span className="text-indigo-500">Analysis</span>
            </h1>
            <p className="text-[10px] md:text-[12px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic max-w-2xl mx-auto leading-relaxed">
              SomnoAI Neural Architecture • Biometric Signal Processing Protocol v2.8
            </p>
          </div>
        </div>

        {/* Biometric Ingress Section */}
        <section className="space-y-12">
           <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20"><Binary size={24} /></div>
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Signal Synthesis</h2>
                </div>
                <p className="text-slate-400 leading-relaxed italic text-lg max-w-2xl">
                  {isZh 
                    ? 'SomnoAI 采用多模态数据融合技术，将零散的生理指标转化为连续的睡眠架构图。' 
                    : 'SomnoAI utilizes multi-modal data fusion to transform fragmented physiological metrics into a continuous sleep architecture.'}
                </p>
              </div>
              <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/5">
                 <Cpu size={14} className="text-indigo-400" />
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Edge Processing Active</span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {metrics.map((item, i) => (
                <GlassCard key={i} className="p-10 rounded-[3.5rem] border-white/5 hover:border-indigo-500/20 transition-all duration-500 group">
                   <div className="p-4 bg-indigo-500/5 rounded-2xl w-fit mb-8 group-hover:scale-110 transition-transform">
                     <item.icon className="text-indigo-400" size={32} />
                   </div>
                   <h3 className="text-white font-black italic uppercase text-lg mb-4 tracking-tight">{item.title}</h3>
                   <p className="text-slate-500 text-xs leading-relaxed italic font-medium">{item.desc}</p>
                </GlassCard>
              ))}
           </div>
        </section>

        {/* Neural Engine Section */}
        <section className="space-y-12">
           <GlassCard className="p-12 md:p-20 rounded-[4.5rem] border-indigo-500/20 bg-indigo-600/[0.01] relative overflow-hidden" intensity={1.5}>
              <div className="absolute top-0 right-0 p-20 opacity-[0.02] pointer-events-none text-white"><Layers size={400} strokeWidth={0.5} /></div>
              
              <div className="flex items-center gap-5 mb-16 relative z-10">
                 <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400"><Microscope size={32} /></div>
                 <div className="space-y-1">
                   <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">Neural Staging Engine</h2>
                   <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic">Protocol: GEN-SYNTH-V5</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                 <div className="space-y-12">
                    <div className="flex gap-8 items-start">
                       <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xl font-black shrink-0 border border-indigo-500/30">01</div>
                       <div className="space-y-3">
                          <h4 className="text-white font-black italic uppercase text-lg tracking-tight">Baseline Normalization</h4>
                          <p className="text-slate-400 text-sm leading-relaxed italic">Raw metrics are cross-referenced against your historical 14-day baseline to isolate acute deviations from chronic physiological patterns.</p>
                       </div>
                    </div>
                    <div className="flex gap-8 items-start">
                       <div className="w-14 h-14 rounded-3xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-mono text-xl font-black shrink-0 border border-indigo-500/30">02</div>
                       <div className="space-y-3">
                          <h4 className="text-white font-black italic uppercase text-lg tracking-tight">Staging Synthesis</h4>
                          <p className="text-slate-400 text-sm leading-relaxed italic">Advanced neural models identify transitions between non-REM and REM states by correlating heart-rate dips with specific respiratory harmonics.</p>
                       </div>
                    </div>
                 </div>
                 
                 <div className="p-8 bg-black/40 border border-white/5 rounded-[3rem] flex flex-col justify-center gap-8">
                    <div className="flex items-center justify-between">
                       <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">Processing Confidence</span>
                       <span className="text-emerald-500 font-mono font-black italic text-lg">94.8%</span>
                    </div>
                    <div className="space-y-4">
                       {[70, 85, 40].map((w, i) => (
                         <div key={i} className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                            <m.div initial={{ width: 0 }} animate={{ width: `${w}%` }} transition={{ duration: 2, delay: i * 0.2 }} className="h-full bg-indigo-500/40" />
                         </div>
                       ))}
                    </div>
                    <p className="text-[10px] text-slate-500 italic leading-relaxed text-center px-4">
                      Neural synthesis metrics are generated in-browser via secure edge nodes, ensuring 100% data sovereignty.
                    </p>
                 </div>
              </div>
           </GlassCard>
        </section>

        {/* Disclaimer Section */}
        <section className="p-12 md:p-16 bg-rose-500/5 border border-rose-500/20 rounded-[4rem] space-y-8 shadow-2xl shadow-rose-950/20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-[0.05] text-rose-500"><ShieldAlert size={120} /></div>
           <div className="flex items-center gap-5 text-rose-500 relative z-10">
              <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20"><ShieldAlert size={32} /></div>
              <h2 className="text-3xl font-black italic uppercase tracking-tighter">Medical Disclaimer</h2>
           </div>
           <div className="space-y-6 relative z-10">
             <p className="text-slate-300 leading-relaxed italic text-lg font-medium">
               {isZh 
                 ? 'SomnoAI 是一项数字研究工具，而非医疗诊断设备。' 
                 : 'SomnoAI is a digital research instrument, not a clinical diagnostic device.'}
             </p>
             <p className="text-slate-400 leading-relaxed italic text-sm">
               {isZh 
                 ? '本实验室生成的所有见解、评分及建议仅供个人健康优化和教育参考。AI 无法替代专业医生的面对面诊断。如果您正面临严重的睡眠障碍、呼吸暂停或长期慢性失眠，请务必咨询持有执照的医疗专家。' 
                 : 'All insights, scores, and protocols generated within this laboratory are for personal optimization and educational reference only. AI analysis cannot substitute a professional medical diagnosis. If you suffer from serious sleep disorders, apnea, or chronic insomnia, please consult a licensed healthcare professional.'}
             </p>
           </div>
        </section>

        <footer className="pt-20 text-center space-y-10">
           <div className="flex items-center justify-center gap-4 opacity-30">
              <BarChart3 size={16} className="text-slate-500" />
              <p className="text-[10px] font-mono tracking-[0.5em] uppercase">SomnoAI Research Division • v2.8.4</p>
           </div>
           <button onClick={onBack} className="px-20 py-7 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] italic shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all">Dismiss Module</button>
        </footer>
      </div>
    </div>
  );
};