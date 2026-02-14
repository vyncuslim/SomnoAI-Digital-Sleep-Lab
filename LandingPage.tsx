import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, LogIn, Command, MessageSquare, ShieldCheck
} from 'lucide-react';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';

const m = motion as any;

interface LandingPageProps {
  lang: Language | string;
  onNavigate: (view: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const isZh = lang === 'zh';
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-indigo-100 overflow-x-hidden relative flex flex-col">
      {/* 极简实验室背景：即便 CSS 加载慢，背景也是白色的，防止由于暗色模式逻辑导致的黑色闪烁 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.4]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-indigo-50/40 blur-[120px] rounded-full" />
      </div>

      {/* 顶部导航 */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-8 md:px-12 ${scrolled ? 'bg-white/80 backdrop-blur-xl py-5 border-b border-slate-200 shadow-sm' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={42} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Somno<span className="text-indigo-600">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Digital Sleep Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            {['science', 'faq', 'about', 'support'].map((view) => (
              <button 
                key={view} 
                onClick={() => onNavigate(view)}
                className="text-[10px] font-bold text-slate-500 hover:text-slate-900 transition-all tracking-[0.2em] uppercase italic"
              >
                {view}
              </button>
            ))}
          </div>

          <button 
            onClick={() => onNavigate('login')}
            className="px-8 py-3 bg-slate-100 border border-slate-200 text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-slate-200 transition-all italic flex items-center gap-3"
          >
            <LogIn size={14} /> {isZh ? '进入实验室' : 'ENTER LAB'}
          </button>
        </div>
      </nav>

      {/* 主视觉 */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-32 pb-20 min-h-screen">
        <div className="max-w-7xl space-y-12">
          {/* 状态徽章 */}
          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-full"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 italic">Neural Protocol v2.8 Active</span>
          </m.div>

          {/* 巨型标题 - 纯正工业设计风格 */}
          <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="space-y-0 select-none">
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-slate-900 italic tracking-tighter leading-[0.82] uppercase">
              Engineer
            </h1>
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-indigo-600 italic tracking-tighter leading-[0.82] uppercase">
              Recovery
            </h1>
          </m.div>

          <m.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="text-lg md:text-2xl text-slate-500 font-medium italic max-w-3xl mx-auto leading-relaxed border-l-2 border-slate-200 pl-8 text-left md:text-center">
            {isZh 
              ? "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验室体验。" 
              : "Advanced sleep architecture analysis. SomnoAI integrates wearable telemetry with Google Gemini AI models to reconstruct your restoration window and optimize performance."}
          </m.p>

          {/* 按钮组 */}
          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <button 
              onClick={() => onNavigate('signup')}
              className="px-14 py-6 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-lg transition-all hover:bg-indigo-700 hover:scale-105 italic flex items-center gap-4 active:scale-95"
            >
              Start Optimization <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-14 py-6 bg-white border border-slate-200 text-slate-900 rounded-full font-black text-[11px] uppercase tracking-[0.3em] transition-all hover:bg-slate-50 italic flex items-center gap-4 active:scale-95 shadow-sm"
            >
              <Command size={16} className="text-indigo-600" /> Access Terminal
            </button>
          </m.div>
        </div>
      </section>

      {/* 悬浮聊天触发 */}
      <m.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={() => onNavigate('assistant')}
        className="fixed bottom-10 right-10 z-[100] w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl"
      >
        <MessageSquare size={24} fill="currentColor" />
      </m.button>

      {/* 底部页脚 */}
      <footer className="relative z-10 px-12 py-12 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60 hover:opacity-100 transition-opacity border-t border-slate-100 bg-white">
        <div className="flex items-center gap-4">
          <Logo size={28} />
          <span className="text-[10px] font-bold uppercase tracking-widest italic text-slate-400">@2026 SomnoAI Laboratory Hub</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-slate-50 border border-slate-200 rounded-full">
          <ShieldCheck size={14} className="text-indigo-600" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Secure Neural Protocol Active</span>
        </div>
      </footer>
    </div>
  );
};