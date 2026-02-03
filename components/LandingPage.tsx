
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, ShieldCheck, Moon, BrainCircuit, Activity, 
  ArrowRight, CheckCircle2, Lock, Microscope, Sparkles, LogIn
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { Language } from '../services/i18n.ts';

const m = motion as any;

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const isZh = lang === 'zh';

  const steps = [
    {
      icon: Activity,
      title: isZh ? '1. 记录睡眠数据' : '1. Record Data',
      desc: isZh ? '手动录入、佩戴设备或使用手机传感器自动同步。' : 'Manual entry, wearable sync, or phone sensor tracking.'
    },
    {
      icon: BrainCircuit,
      title: isZh ? '2. AI 深度分析' : '2. AI Analysis',
      desc: isZh ? '识别夜醒、浅睡及作息规律，找出影响因素。' : 'Identify waking, light sleep, and routine patterns.'
    },
    {
      icon: Zap,
      title: isZh ? '3. 获得专属建议' : '3. Get Insights',
      desc: isZh ? '为您定制环境优化、作息调整与睡前习惯方案。' : 'Customized environment, routine, and habit optimizations.'
    }
  ];

  const benefits = [
    isZh ? '更容易进入深睡' : 'Fall asleep faster',
    isZh ? '减少半夜惊醒频率' : 'Reduce middle-night waking',
    isZh ? '白天精神状态显著提升' : 'Significantly better daytime energy',
    isZh ? '锁定破坏睡眠的隐藏因素' : 'Identify hidden sleep disruptors'
  ];

  const trustPoints = [
    { icon: Lock, label: isZh ? '数据加密存储' : 'Encrypted Storage' },
    { icon: ShieldCheck, label: isZh ? '绝不出售个人数据' : 'No Data Sales' },
    { icon: Microscope, label: isZh ? '基于睡眠科学模型' : 'Science-Based' },
    { icon: Sparkles, label: isZh ? '辅助建议而非诊断' : 'AI Optimization' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans">
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] bg-indigo-600/10 blur-[180px] rounded-full animate-pulse" />
        </div>

        <m.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-10 relative z-10 max-w-4xl"
        >
          <Logo size={120} animated={true} className="mx-auto" />
          
          <div className="space-y-6">
            <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">
              {isZh ? 'AI 帮你看懂睡眠' : 'AI Decodes'} <br/>
              <span className="text-indigo-500">{isZh ? '让每一晚都更高质量' : 'Your Sleep'}</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed">
              {isZh 
                ? '通过数据分析找出影响你睡眠的真正原因，并给出可执行的改善建议。' 
                : 'Identify the real causes affecting your sleep patterns and receive actionable optimization protocols.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 italic flex items-center gap-4"
            >
              {isZh ? '立即开始分析' : 'Start Analysis'} <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-10 py-6 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full font-black text-sm uppercase tracking-[0.3em] border border-white/10 transition-all active:scale-95 italic flex items-center gap-3"
            >
              <LogIn size={18} /> {isZh ? '已有账号' : 'Sign In'}
            </button>
          </div>
        </m.div>

        <m.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-30"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">{isZh ? '向下探索' : 'Scroll to Explore'}</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </m.div>
      </section>

      {/* SECTION 2: HOW IT WORKS */}
      <section className="py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-4">
           <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '工作流程' : 'The Protocol'}</span>
           <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">{isZh ? '简单三步，开启优化' : 'Three Steps to Recovery'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <GlassCard key={i} className="p-10 rounded-[3.5rem] border-white/5">
              <div className="w-16 h-16 bg-indigo-600/10 rounded-2xl flex items-center justify-center text-indigo-400 mb-8 border border-indigo-500/20 shadow-xl">
                 <step.icon size={32} />
              </div>
              <h3 className="text-xl font-black italic text-white uppercase mb-4">{step.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed italic font-medium">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* SECTION 3: BENEFITS */}
      <section className="py-32 px-4 bg-indigo-600/[0.02]">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10">
            <div className="space-y-4">
              <span className="text-emerald-500 font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '预期收益' : 'The Result'}</span>
              <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">
                {isZh ? '你能得到什么' : 'Expect Real'} <br/> <span className="text-emerald-500">{isZh ? '好处' : 'Impact'}</span>
              </h2>
            </div>
            
            <div className="space-y-6">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-center gap-6 group">
                   <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={24} />
                   </div>
                   <span className="text-lg md:text-xl font-bold italic text-slate-300 group-hover:text-white transition-colors">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-[450px]">
             <GlassCard className="p-10 rounded-[4rem] border-white/5 bg-slate-900/40">
                <div className="space-y-8">
                   <div className="flex items-center justify-between border-b border-white/5 pb-6">
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Core Calibration</span>
                      <Moon size={16} className="text-indigo-400" />
                   </div>
                   <div className="space-y-6">
                      {[
                        { label: isZh ? '入睡速度' : 'Sleep Onset', val: '+24%' },
                        { label: isZh ? '神经恢复指数' : 'Neural Recovery', val: '+38%' },
                        { label: isZh ? '早间警觉性' : 'Morning Alertness', val: '+42%' }
                      ].map((stat, i) => (
                        <div key={i} className="flex justify-between items-end">
                           <span className="text-sm font-bold text-slate-400 italic">{stat.label}</span>
                           <span className="text-2xl font-black text-indigo-400 italic">{stat.val}</span>
                        </div>
                      ))}
                   </div>
                </div>
             </GlassCard>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRUST */}
      <section className="py-32 px-4 max-w-6xl mx-auto">
        <div className="text-center mb-20 space-y-4">
           <span className="text-slate-600 font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '安全保障' : 'Privacy & Trust'}</span>
           <h2 className="text-3xl md:text-5xl font-black italic text-white uppercase tracking-tighter">{isZh ? '值得信赖的睡眠实验室' : 'A Laboratory You Can Trust'}</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {trustPoints.map((point, i) => (
            <div key={i} className="flex flex-col items-center text-center space-y-4 p-8 bg-white/5 border border-white/5 rounded-[3rem] hover:bg-white/[0.08] transition-all">
               <div className="text-indigo-400"><point.icon size={32} /></div>
               <span className="text-[11px] font-black uppercase tracking-widest text-slate-300 italic">{point.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5: FINAL CTA */}
      <section className="py-40 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 blur-[120px] rounded-full animate-pulse" />
        <m.div 
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
          className="relative z-10 space-y-12"
        >
          <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
            {isZh ? '开启你的第一次' : 'Begin Your First'} <br/> <span className="text-indigo-500">{isZh ? '睡眠分析' : 'Deep Analysis'}</span>
          </h2>
          <button 
            onClick={() => onNavigate('signup')}
            className="px-16 py-8 bg-white text-[#020617] rounded-full font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:bg-slate-200 transition-all active:scale-95 italic"
          >
            {isZh ? '现在加入注册表' : 'Join Registry Now'}
          </button>
        </m.div>
      </section>

      <footer className="py-20 border-t border-white/5 text-center opacity-30">
        <Logo size={40} className="mx-auto mb-6 grayscale opacity-50" />
        <p className="text-[10px] font-mono uppercase tracking-[0.5em] text-slate-500">
          © 2026 SomnoAI Digital Sleep Lab • Neural Recovery Project
        </p>
      </footer>
    </div>
  );
};
