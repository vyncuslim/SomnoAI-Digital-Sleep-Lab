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
        ? '绝对不需要。SomnoAI 的核心优势在于“硬件中立”。我们相信 AI 代码的力量胜过昂贵的硬件。您只需使用现有的 Apple Watch、智能手表或手机，通过我们的移动应用将 Health Connect 数据同步至实验室即可。' 
        : 'Absolutely not. The core advantage of SomnoAI is hardware neutrality. We believe the power of AI code outweighs expensive hardware. Simply use your existing Apple Watch, Android smartwatch, or smartphone. Our mobile app bridges your Health Connect data directly to the lab.'
    },
    {
      icon: Smartphone,
      q: isZh ? 'Health Connect 是如何运作的？' : 'How does Health Connect work?',
      a: isZh 
        ? '在 Android 设备上，Health Connect 作为数据中枢，安全地从您的手表 App 收集生理指标。我们的移动端应用会读取这些指标并上传至您的账户。登录 Web 端后，系统会自动调取这些遥测数据进行 AI 分析。' 
        : 'On Android, Health Connect acts as a secure data hub, gathering metrics from your watch apps. Our mobile application reads these metrics and uploads them to your profile. Once you log in to the web interface, the system retrieves this telemetry for AI analysis.'
    },
    {
      icon: Lock,
      q: isZh ? '数据安全性如何？' : 'How secure is my data?',
      a: isZh 
        ? '数据通过端到端加密传输。您的生理流仅在登录会话期间被调取进行分析。一旦登出，原始同步流将从浏览器缓存中永久抹除，确保您的生物主权。' 
        : 'Data is transmitted via end-to-end encrypted links. Your biological streams are only retrieved for analysis during active sessions. Upon logout, all raw synchronized streams are permanently purged from your browser cache, ensuring your biometric sovereignty.'
    },
    {
      icon: Zap,
      q: isZh ? '它真的能达到智能戒指的分析深度吗？' : 'Can it really match smart ring depth?',
      a: isZh 
        ? '是的。通过 Gemini 2.5 Pro 驱动的神经合成技术，我们能够从手表提供的基础心率和体动数据中解构出深层的睡眠架构和恢复熵值，这些以往只有像 Oura 这样昂贵的设备才能做到。' 
        : 'Yes. Using neural synthesis powered by Gemini 2.5 Pro, we deconstruct deep sleep architecture and recovery entropy from standard heart rate and motion data—insights previously exclusive to expensive devices like Oura.'
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