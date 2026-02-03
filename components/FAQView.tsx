
import React, { useState } from 'react';
import { 
  ArrowLeft, HelpCircle, ChevronDown, ShieldCheck, Zap, 
  Smartphone, Lock, Activity, FlaskConical, MessageSquare
} from 'lucide-react';
// Added missing motion and AnimatePresence imports
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

// Added missing motion alias to resolve compilation errors
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
      q: isZh ? '没有手环或智能手表能用吗？' : 'Can I use it without a wearable?',
      a: isZh 
        ? '可以。SomnoAI 提供“手动注入终端”，您可以根据自己的感受和唤醒时间进行手动录入，AI 引擎会基于代谢模型为您推算出睡眠架构。' 
        : 'Yes. SomnoAI provides a "Manual Injection Terminal" where you can input data based on your perception and wake times. Our AI engine will extrapolate your sleep architecture using metabolic models.'
    },
    {
      q: isZh ? '我的健康数据安全吗？' : 'Is my health data secure?',
      a: isZh 
        ? '绝对安全。我们采用“边缘处理”架构。您的原始健康数据（心率、体动等）仅存储在您的浏览器会话中，绝不上传到我们的后台服务器，退出后立即擦除。' 
        : 'Absolutely. We utilize an "Edge Processing" architecture. Your raw health data (heart rate, motion, etc.) is stored only in your browser session and is never uploaded to our backend servers. It is purged immediately upon logout.'
    },
    {
      q: isZh ? 'AI 给出的建议准确吗？' : 'Are the AI suggestions accurate?',
      a: isZh 
        ? '我们的 AI 建议基于 Google Gemini 处理的高级神经网络模型。虽然具有高度启发性，但受限于硬件精度。我们建议将其作为自我优化的参考，而不是绝对准则。' 
        : 'Our AI insights are powered by advanced neural models processed via Google Gemini. While highly insightful, accuracy is dependent on your device hardware. Use them as references for self-optimization rather than absolute rules.'
    },
    {
      q: isZh ? '这是一个医疗产品吗？' : 'Is this a medical product?',
      a: isZh 
        ? '不是。SomnoAI 是一个数字实验平台，旨在通过数据可视化和 AI 深度洞察来协助用户探索睡眠与潜能的关系。它不具备任何医疗诊断或治疗功能。' 
        : 'No. SomnoAI is a digital experimentation platform designed to assist users in exploring the link between sleep and potential through data visualization and AI insights. It has no medical diagnostic or therapeutic functions.'
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

      <div className="max-w-3xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
           <div className="p-4 bg-indigo-500/10 rounded-full w-20 h-20 flex items-center justify-center mx-auto text-indigo-400">
              <HelpCircle size={40} />
           </div>
           <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter">System <span className="text-indigo-400">FAQ</span></h1>
           <p className="text-[10px] text-slate-600 font-mono font-bold uppercase tracking-[0.6em] italic">Knowledge Base • Protocol v1.4</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <GlassCard 
              key={i} 
              className={`p-1.5 transition-all duration-500 overflow-hidden ${openIndex === i ? 'rounded-[3rem] border-indigo-500/30' : 'rounded-full border-white/5'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-10 py-6 text-left"
              >
                <span className="text-sm md:text-base font-black italic text-white uppercase tracking-tight pr-6">{faq.q}</span>
                <ChevronDown size={20} className={`text-slate-500 transition-transform duration-500 ${openIndex === i ? 'rotate-180 text-indigo-400' : ''}`} />
              </button>
              
              <AnimatePresence>
                {openIndex === i && (
                  <m.div 
                    initial={{ height: 0, opacity: 0 }} 
                    animate={{ height: 'auto', opacity: 1 }} 
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-10 pb-10 pt-4 text-slate-400 text-sm leading-relaxed italic border-t border-white/5 mt-2">
                       {faq.a}
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </GlassCard>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-12">
           <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] flex gap-5 items-center">
              <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400"><Lock size={20} /></div>
              <div className="space-y-0.5">
                 <p className="text-white font-bold italic text-xs">Privacy Protocol</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active & Secure</p>
              </div>
           </div>
           <div className="p-8 bg-slate-900/40 border border-white/5 rounded-[3rem] flex gap-5 items-center">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400"><Zap size={20} /></div>
              <div className="space-y-0.5">
                 <p className="text-white font-bold italic text-xs">Neural Sync</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">v5.2 Operational</p>
              </div>
           </div>
        </div>

        <footer className="pt-20 text-center opacity-30">
           <button onClick={onBack} className="px-12 py-5 bg-slate-900 text-slate-400 rounded-full font-black text-xs uppercase tracking-widest italic active:scale-95 transition-all">Return to Lab</button>
        </footer>
      </div>
    </div>
  );
};
