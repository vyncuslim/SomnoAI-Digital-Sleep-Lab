
import React from 'react';
import { 
  ArrowLeft, BrainCircuit, Globe, UserCheck, Moon, Lock, Mail, Github, 
  Microscope, Zap, Linkedin, ShieldCheck, Sparkles, Target, Layers, 
  Watch, Smartphone, Cpu, Binary, HeartPulse, Activity, AlertCircle, Scale, Ruler, Search,
  // Fix: Added missing ArrowRight import
  Server, Shield, Database, Cloud, ArrowRight
} from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { motion } from 'framer-motion';

const m = motion as any;

interface AboutViewProps {
  lang: Language;
  onBack: () => void;
  onNavigate: (view: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ lang, onBack, onNavigate }) => {
  const isZh = lang === 'zh';
  const t = translations[lang].about;

  const aiDimensions = [
    { icon: Activity, title: isZh ? '健康趋势预测' : 'Health Trend Prediction', desc: isZh ? '基于历史数据，预测未来的健康变化，如心率异常风险及睡眠质量下降趋势。' : 'Predicting future health changes like HR anomaly risks and sleep quality decline based on historical data.' },
    { icon: UserCheck, title: isZh ? '个性化健康建议' : 'Personalized Recommendations', desc: isZh ? '结合受试者年龄、性别、运动习惯及饮食偏好，提供定制化的运动计划与作息调整方案。' : 'Tailored workout plans and schedule adjustments based on age, gender, habits, and preferences.' },
    { icon: AlertCircle, title: isZh ? '异常检测与警报' : 'Anomaly Detection & Alerts', desc: isZh ? '实时监控关键健康指标，对异常波动发出即时警告并建议必要的专业医疗咨询。' : 'Real-time monitoring of key metrics with immediate warnings and medical consultation recommendations.' },
    { icon: Zap, title: isZh ? '运动表现优化' : 'Exercise Performance Optimization', desc: isZh ? '分析配速、热量消耗与训练强度，帮助用户优化训练计划并提升运动竞技表现。' : 'Analyzing pace, burn, and intensity to help optimize training plans and enhance athletic performance.' },
    { icon: Moon, title: isZh ? '睡眠质量评估' : 'Sleep Assessment', desc: isZh ? '深度分析睡眠周期、深/浅睡时长与苏醒频率，并提供环境改善与习惯养成建议。' : 'Detailed analysis of sleep cycles, duration, and wake frequency with environment and habit suggestions.' }
  ];

  const brandCompatibility = [
    'Mi Band / 小米手环', 'Huawei Watch / 华为', 'Samsung Galaxy Watch / 三星', 'Garmin / 佳明', 'Fitbit', 'Amazfit'
  ];

  const dataJourney = [
    { icon: Watch, label: isZh ? '智能手表' : 'Smartwatch', desc: isZh ? '原始传感器数据采集' : 'Raw Sensor Collection' },
    { icon: Smartphone, label: isZh ? 'Health Connect' : 'Health Connect', desc: isZh ? 'Android 本地桥接' : 'Android Local Bridge' },
    { icon: Cloud, label: isZh ? 'Somno App' : 'Somno App', desc: isZh ? '加密处理与安全上传' : 'Encryption & Secure Upload' },
    { icon: Globe, label: isZh ? '网页终端' : 'Web Terminal', desc: isZh ? 'AI 分析与深度洞察' : 'AI Analysis & Insights' }
  ];

  return (
    <div className="min-h-screen pt-4 pb-32 animate-in fade-in slide-in-from-right-4 duration-500 font-sans text-left">
      <header className="flex flex-col items-center text-center gap-8 mb-16 px-4 max-w-4xl mx-auto pt-20">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-indigo-500/10 blur-[100px] rounded-full" />
          <Logo size={140} animated={true} className="relative z-10" />
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
            {isZh ? '关于' : 'About'} <span className="text-indigo-400">SomnoAI</span>
          </h1>
          <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">
            SomnoAI Digital Sleep Lab • PHILOSOPHY v4.2
          </p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-16 px-4">
        {/* Core Vision */}
        <section className="relative">
           <m.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="absolute -inset-10 bg-indigo-500/5 blur-[80px] rounded-full pointer-events-none" />
           <GlassCard className="p-12 md:p-20 rounded-[5rem] border-indigo-500/20 bg-indigo-600/[0.02] overflow-hidden" intensity={1.5}>
              <div className="space-y-10 relative z-10">
                 <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl"><Target size={24} /></div>
                    <h2 className="text-xl font-black italic text-indigo-400 uppercase tracking-widest">{t.visionTitle}</h2>
                 </div>
                 <p className="text-3xl md:text-5xl font-black text-white leading-[1.1] italic tracking-tighter uppercase">
                   {t.visionStatement}
                 </p>
              </div>
           </GlassCard>
        </section>

        {/* Brand Philosophy - Broad Compatibility */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-6">
              <Globe size={24} className="text-indigo-400" />
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">{t.compatibilityTitle}</h2>
           </div>
           
           <GlassCard className="p-12 md:p-16 rounded-[4rem] border-white/5 bg-slate-900/40" intensity={1.2}>
              <div className="space-y-8 text-slate-300 text-lg leading-relaxed italic font-medium">
                <p className="border-l-4 border-indigo-500/30 pl-8 font-bold text-white text-xl">
                  {isZh 
                    ? "我们深知许多用户已经拥有了心仪的智能穿戴设备。SomnoAI 从设计之初就考虑到了广泛的兼容性。" 
                    : "We understand users have preferred wearables. SomnoAI was designed for broad compatibility from day one."}
                </p>
                <p>
                  {isZh 
                    ? "除 Apple 设备外，市面上绝大多数主流智能手表品牌——只要能与 Android 手机上的 Health Connect 同步数据——都能无缝接入我们的系统。这意味着您无需购买特定品牌的昂贵设备，显著降低了获得顶级健康诊断的门槛。" 
                    : "Beyond Apple, most mainstream smartwatches—as long as they sync with Health Connect on Android—integrate seamlessly. This means no specific branded hardware is required, lowering the barrier to elite diagnostics."}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4">
                  {brandCompatibility.map((brand, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-indigo-500/30 transition-all">
                       <Watch size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                       <span className="text-[10px] font-black text-slate-400 group-hover:text-white uppercase tracking-tight italic">{brand}</span>
                    </div>
                  ))}
                </div>
              </div>
           </GlassCard>
        </section>

        {/* Data Journey Visualization */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-6">
              <Layers size={24} className="text-indigo-400" />
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">{isZh ? '数据旅程' : 'Data Journey'}</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {dataJourney.map((step, idx) => (
                <GlassCard key={idx} className="p-6 rounded-[2.5rem] border-white/5 flex flex-col items-center text-center gap-4 bg-black/20">
                   <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 shadow-inner"><step.icon size={24} /></div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white uppercase italic tracking-widest">{step.label}</p>
                      <p className="text-[8px] text-slate-500 uppercase font-bold">{step.desc}</p>
                   </div>
                   {idx < 3 && <div className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 z-20 text-indigo-500/30"><ArrowRight size={16} /></div>}
                </GlassCard>
              ))}
           </div>
        </section>

        {/* Core AI Capabilities */}
        <section className="space-y-8">
           <div className="flex items-center gap-4 px-6">
              <Sparkles size={24} className="text-indigo-400" />
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tight">{t.aiCoreTitle}</h2>
           </div>
           
           <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-black/20">
              <p className="text-slate-400 text-sm leading-relaxed italic mb-10 px-4">
                {isZh 
                  ? "我们的 AI 分析不仅仅是数据汇总。通过先进的机器学习算法，我们对心率、睡眠模式、步数和热量消耗进行深度挖掘与关联分析。AI 可以识别睡眠质量下降与工作压力增加之间的潜在联系，生成全面的报告。" 
                  : "AI analysis goes beyond aggregation. Through advanced algorithms, we perform deep mining of heart rate, sleep patterns, and activity, identifying correlations between sleep quality and life stressors."}
              </p>
              
              <div className="grid grid-cols-1 gap-6">
                 {aiDimensions.map((dim, idx) => (
                   <div key={idx} className="p-8 bg-slate-900/40 rounded-[2.5rem] border border-white/5 flex gap-8 items-start group hover:border-indigo-500/30 transition-all">
                      <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform shadow-inner"><dim.icon size={24} /></div>
                      <div className="space-y-2">
                         <h4 className="text-lg font-black text-white italic uppercase tracking-tight">{dim.title}</h4>
                         <p className="text-sm text-slate-500 leading-relaxed italic font-medium">{dim.desc}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </GlassCard>
        </section>

        {/* Continuous Learning & Future Vision */}
        <section className="space-y-8">
           <GlassCard className="p-12 rounded-[4rem] border-indigo-500/20 bg-indigo-600/[0.01]">
              <div className="flex flex-col md:flex-row gap-10 items-start">
                 <div className="p-6 bg-indigo-600 rounded-[2.5rem] text-white shadow-2xl shrink-0">
                    <Binary size={48} />
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{isZh ? '持续学习与进化' : 'Continuous Evolution'}</h3>
                    <p className="text-base text-slate-400 leading-relaxed italic font-medium">
                       {isZh 
                         ? "我们的 AI 系统具有学习能力——随着受试者数据的积累，分析结果将越来越准确。所有结果均通过直观的图表呈现，帮助您更主动、更科学地掌控自己的健康。我们的愿景是让每个人都拥有专属的 AI 健康顾问。" 
                         : "Our AI system possesses learning capabilities—accuracy increases as data accumulates. Results are presented via intuitive charts, empowering you to take proactive control. Our vision is a dedicated AI health advisor for everyone."}
                    </p>
                 </div>
              </div>
           </GlassCard>

           <GlassCard className="p-10 rounded-[3.5rem] border-rose-500/20 bg-rose-500/[0.02]">
              <div className="flex items-start gap-6">
                 <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-500 shrink-0 shadow-inner">
                    <Smartphone size={32} />
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-xl font-black italic text-white uppercase tracking-tight">{isZh ? 'Apple 生态说明' : 'Apple Ecosystem Note'}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                      {t.appleNote}
                    </p>
                 </div>
              </div>
           </GlassCard>
        </section>

        <footer className="pt-20 text-center space-y-12">
           <div className="flex flex-col items-center gap-4 opacity-20">
              <ShieldCheck size={24} className="text-indigo-500" />
              <p className="text-[9px] font-mono tracking-[0.6em] uppercase">@2026 SomnoAI Digital Sleep Lab • PHILOSOPHY_NODE_V4.2</p>
           </div>
           <button onClick={onBack} className="px-16 py-6 bg-slate-900 border border-white/5 text-slate-500 rounded-full font-black text-xs uppercase tracking-[0.3em] italic shadow-2xl active:scale-95 transition-all hover:bg-slate-800">Return to Terminal</button>
        </footer>
      </div>
    </div>
  );
};
