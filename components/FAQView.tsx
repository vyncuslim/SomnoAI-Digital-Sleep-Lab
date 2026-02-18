import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, ChevronDown, ShieldCheck, Zap, 
  Smartphone, Lock, Activity, FlaskConical, MessageSquare,
  Fingerprint, Database, AlertCircle, Mail, Globe, Watch, Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface FAQViewProps {
  lang: Language;
  onBack: () => void;
}

export const FAQView: React.FC<FAQViewProps> = ({ lang, onBack }) => {
  const isZh = lang === 'zh';
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      icon: Watch,
      q: isZh ? '我需要购买专门的追踪设备吗？' : 'Do I need to buy specific tracking gear?',
      a: isZh 
        ? '绝对不需要。SomnoAI 的核心优势在于“硬件中立”。我们致力于消除品牌限制，您只需使用现有的 Apple Watch、小米手环、华为手表、佳明或三星设备，只要它们能与 Android 手机上的 Health Connect 同步数据，即可接入实验室。' 
        : 'Absolutely not. The core advantage of SomnoAI is hardware neutrality. We aim to eliminate brand restrictions. Simply use your existing Apple Watch, Mi Band, Huawei, Garmin, or Samsung device. As long as it syncs with Health Connect on Android, it works here.'
    },
    {
      icon: Smartphone,
      q: isZh ? '数据是如何流动的？' : 'How does the data flow work?',
      a: isZh 
        ? '路径为：智能手表 -> 手机 (Health Connect) -> SomnoAI 移动应用 -> 安全上传 -> Web 端 AI 分析。登录 Web 端后，系统会自动调取您通过手机上传的最新遥测数据进行 AI 深度合成。' 
        : 'The path is: Smartwatch -> Phone (Health Connect) -> SomnoAI Mobile App -> Secure Upload -> Web AI Analysis. Once you log in to the web terminal, the system automatically retrieves your latest mobile-synced telemetry.'
    },
    {
      icon: Cpu,
      q: isZh ? 'AI 分析涵盖哪些维度？' : 'What dimensions does AI analysis cover?',
      a: isZh 
        ? '我们的 AI 引擎涵盖：健康趋势预测、个性化建议、异常监测警报、运动表现优化以及深度睡眠质量评估。通过机器学习算法，我们会对心率、睡眠阶段、步数等进行多维度的关联挖掘。' 
        : 'Our AI engine covers: Health Trend Prediction, Personalized Recommendations, Anomaly Detection, Exercise Optimization, and Deep Sleep Assessment. We mine correlations between HR, sleep stages, and activity.'
    },
    {
      icon: Lock,
      q: isZh ? '不再使用 Google 存储数据了吗？' : 'Moving away from Google storage?',
      a: isZh 
        ? '我们利用 Google 提供的 Health Connect 技术作为本地桥接，但数据不再依赖 Google Fit 的统一云存储。数据流经我们的移动应用加密上传。原始生理流仅在登录会话期间被调取进行分析，确保生物主权。' 
        : 'We use Google\'s Health Connect technology as a local bridge, but we no longer rely on Google Fit\'s unified cloud storage. Telemetry flows through our encrypted mobile bridge. Raw data is only accessed during active sessions to ensure biometric sovereignty.'
    },
    {
      icon: Zap,
      q: isZh ? '它真的能达到智能戒指的分析深度吗？' : 'Can it really match smart ring depth?',
      a: isZh 
        ? '是的。通过 Gemini 2.5 Pro 驱动的神经合成技术，我们能从普通传感器提供的原始数据中解构出深层的恢复熵值和架构，让普通手表也能产出以往只有像 Oura Ring 这种专业设备才能提供的高价值洞察。' 
        : 'Yes. Using neural synthesis powered by Gemini 2.5 Pro, we deconstruct deep recovery entropy and architecture from standard sensor data, providing high-value insights previously exclusive to professional devices like Oura Ring.'
    }
  ];

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

      <div className="max-w-3xl mx-auto px-4 space-y-16">
        <div className="text-center space-y-6">
           <div className="p-5 bg-indigo-500/10 rounded-full w-24 h-24 flex items-center justify-center mx-auto text-indigo-400 border border-indigo-500/20 shadow-2xl">
              <HelpCircle size={48} strokeWidth={1.5} />
           </div>
           <div className="space-y-2">
             <h1 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">Laboratory <span className="text-indigo-400">FAQ</span></h1>
             <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">Knowledge Base • Protocol v2.1</p>
           </div>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <GlassCard 
              key={i} 
              className={`transition-all duration-500 overflow-hidden ${openIndex === i ? 'rounded-[3rem] border-indigo-500/30' : 'rounded-full border-white/5 opacity-80 hover:opacity-100'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-8 md:px-10 py-6 text-left group"
              >
                <div className="flex items-center gap-5">
                   <div className={`p-2 rounded-xl transition-colors ${openIndex === i ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-slate-600 group-hover:text-slate-400'}`}>
                      <faq.icon size={18} />
                   </div>
                   <span className="text-sm md:text-base font-black italic text-white uppercase tracking-tight pr-6">{faq.q}</span>
                </div>
                <ChevronDown size={20} className={`text-slate-500 transition-transform duration-500 shrink-0 ${openIndex === i ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <m.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: "circOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-10 pb-10 pt-4 text-slate-400 text-[13px] md:text-sm leading-relaxed italic border-t border-white/5 mt-2 max-w-2xl">
                       {faq.a}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>

        <div className="p-10 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[4rem] text-center space-y-6">
           <div className="flex items-center justify-center gap-3 text-indigo-400">
              <Mail size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Still have questions?</h3>
           </div>
           <p className="text-slate-500 text-xs italic font-medium leading-relaxed max-w-sm mx-auto">
             Contact our laboratory dispatch for technical inquiries regarding the Mobile Node sync or Health Connect protocols.
           </p>
           <a href="mailto:contact@sleepsomno.com" className="inline-block text-white font-black text-sm italic hover:text-indigo-400 transition-colors underline underline-offset-8">contact@sleepsomno.com</a>
        </div>

        <footer className="pt-20 text-center opacity-30">
           <button onClick={onBack} className="px-12 py-5 bg-slate-900 border border-white/5 text-slate-400 rounded-full font-black text-xs uppercase tracking-widest italic active:scale-95 transition-all hover:bg-slate-800">Return to Lab</button>
        </footer>
      </div>
    </div>
  );
};