import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, ChevronDown, ShieldCheck, Zap, 
  Smartphone, Lock, Activity, FlaskConical, MessageSquare,
  Fingerprint, Database, AlertCircle, Mail, Globe
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
      icon: Activity,
      q: isZh ? '没有手环或智能手表能用吗？' : 'Can I use it without a wearable?',
      a: isZh 
        ? '可以。SomnoAI 提供“手动注入终端（Injection Terminal）”，您可以根据自己的感受和唤醒时间进行手动录入。AI 引擎会基于代谢负荷模型为您推算出睡眠架构与恢复评分。' 
        : 'Yes. SomnoAI provides a "Manual Injection Terminal" where you can log data based on your perception and wake times. Our AI engine will extrapolate your sleep architecture and recovery score using validated metabolic models.'
    },
    {
      icon: Lock,
      q: isZh ? '我的生理数据会被上传吗？' : 'Is my physiological data uploaded?',
      a: isZh 
        ? '绝不上传原始数据。我们采用“边缘处理”架构。心率、体动等原始生理流仅在您的浏览器 SessionStorage 中处理。一旦您关闭页面或登出，所有敏感数据将立即从内存中永久抹除。' 
        : 'Never. We utilize an "Edge Processing" architecture. Your raw physiological streams (heart rate, motion, etc.) are processed exclusively within your browser\'s SessionStorage. All sensitive data is permanently purged from memory immediately upon logout or tab closure.'
    },
    {
      icon: Zap,
      q: isZh ? 'AI 建议的准确性如何？' : 'How accurate are the AI insights?',
      a: isZh 
        ? '我们的建议基于 Google Gemini 处理的高级神经网络模型，结合了最新的睡眠科学研究。虽然它提供了深度洞察，但其精度受限于您输入设备的质量。我们建议将其作为自我优化的导航标，而非绝对真理。' 
        : 'Our insights are powered by advanced neural models processed via Google Gemini, synthesizing the latest findings in sleep science. While highly sophisticated, accuracy is dependent on the quality of your input device. Use them as navigation markers for self-optimization rather than absolute rules.'
    },
    {
      icon: FlaskConical,
      q: isZh ? '这属于医疗产品范畴吗？' : 'Is this considered a medical product?',
      a: isZh 
        ? '不，SomnoAI 是一个数字实验与健康优化平台。它旨在通过数据可视化协助用户探索睡眠与个人潜能的关系。本系统不具备任何医疗诊断、预防或治疗疾病的功能。' 
        : 'No. SomnoAI is a digital experimentation and health optimization platform. It is designed to assist users in exploring the link between sleep architecture and personal potential through visualization. This system does not diagnose, prevent, or treat any medical condition.'
    },
    {
      icon: Database,
      q: isZh ? '支持哪些第三方平台同步？' : 'Which third-party platforms are supported?',
      a: isZh 
        ? '目前我们深度集成了 Android Health Connect 与 Google Fit 协议。未来计划扩展对 Apple Health 与 Oura Cloud API 的原生支持。' 
        : 'We are currently deeply integrated with Android Health Connect and Google Fit protocols. Native support for Apple Health and Oura Cloud APIs is planned for future laboratory updates.'
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
             <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">Knowledge Base • Protocol v1.4</p>
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

        {/* Trust Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12">
           {[
             { icon: Lock, title: 'Privacy', sub: 'Secure Edge' },
             { icon: ShieldCheck, title: 'Compliance', sub: 'GDPR/HIPAA' },
             { icon: Zap, title: 'Latency', sub: 'Real-time' }
           ].map((item, i) => (
             <div key={i} className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] flex flex-col items-center gap-4 group hover:border-indigo-500/20 transition-all">
                <div className="p-3 bg-white/5 rounded-2xl text-slate-600 group-hover:text-indigo-400 transition-colors"><item.icon size={20} /></div>
                <div className="text-center space-y-1">
                   <p className="text-white font-black italic text-[10px] uppercase tracking-widest">{item.title}</p>
                   <p className="text-[9px] text-slate-600 uppercase font-bold">{item.sub}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="p-10 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-[4rem] text-center space-y-6">
           <div className="flex items-center justify-center gap-3 text-indigo-400">
              <Mail size={18} />
              <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Still have questions?</h3>
           </div>
           <p className="text-slate-500 text-xs italic font-medium leading-relaxed max-w-sm mx-auto">
             Contact our laboratory dispatch for technical inquiries regarding neural synchronization or data protocols.
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