import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, 
  ArrowRight, LogIn, Command, BrainCircuit, Cpu, X, Menu, Target,
  Microscope, Sparkles, Database, Lock
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language | string;
  onNavigate: (view: string) => void;
}

const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#01040a] z-0">
    <m.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.3, 0.15],
        x: ['-10%', '5%', '-10%'],
        y: ['-5%', '10%', '-5%']
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-[-10%] w-[120vw] h-[100vh] bg-indigo-600/20 blur-[180px] rounded-full"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.22] mix-blend-overlay" />
    <div className="absolute inset-0 opacity-[0.04]" 
         style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const currentLang = (lang || 'en') as Language;
  const isZh = currentLang === 'zh';
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: isZh ? '科学协议' : 'SCIENTIFIC SCIENCE', view: 'science' },
    { label: isZh ? '实验室 FAQ' : 'LAB FAQ', view: 'faq' },
    { label: isZh ? '关于项目' : 'ABOUT PROJECT', view: 'about' },
    { label: isZh ? '技术支持' : 'TECH SUPPORT', view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <BackgroundEffects />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-6 md:px-12 ${scrolled ? 'bg-[#01040a]/90 backdrop-blur-3xl py-4 border-b border-white/5 shadow-2xl' : 'py-10'}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={46} animated={true} />
            <div className="flex flex-col text-left">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
                <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-400 mt-1">Digital Sleep Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <button 
                key={link.view} 
                onClick={() => onNavigate(link.view)}
                className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.25em] uppercase italic"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="px-10 py-3.5 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all italic flex items-center gap-2"
            >
              <LogIn size={14} /> {isZh ? '进入实验室' : 'ENTER LAB'}
            </m.button>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(true)}><Menu size={28} /></button>
          </div>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-20">
        <m.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}
          className="max-w-7xl space-y-14"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-600/5 border border-indigo-500/20 rounded-full shadow-2xl">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Neural Protocol v2.8 Active</span>
          </div>

          <h1 className="text-7xl md:text-[11rem] lg:text-[14rem] font-black italic tracking-tighter text-white uppercase leading-[0.82] drop-shadow-[0_40px_100px_rgba(0,0,0,0.8)] select-none">
            {isZh ? '工程级' : 'ENGINEER'} <br/>
            <span className="text-indigo-500">{isZh ? '恢复方案' : 'RECOVERY'}</span>
          </h1>

          <p className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl mx-auto leading-relaxed border-l-4 border-indigo-600/20 pl-8 opacity-90">
             {isZh 
               ? "SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，为您提供全方位的数字化睡眠实验室体验。" 
               : "Advanced sleep architecture analysis. SomnoAI integrates wearable telemetry with Google Gemini AI models to reconstruct your restoration window and optimize performance."}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            <m.button 
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="px-16 py-8 bg-indigo-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_70px_rgba(79,70,229,0.4)] transition-all italic flex items-center justify-center gap-4"
            >
              {isZh ? '开始优化' : 'START OPTIMIZATION'} <ArrowRight size={18} />
            </m.button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-16 py-8 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4"
            >
              <Command size={18} className="text-indigo-500" /> {isZh ? '访问终端' : 'ACCESS TERMINAL'}
            </button>
          </div>
        </m.div>
      </section>

      {/* SEO Content Section: Why SomnoAI */}
      <section className="py-32 px-6 relative z-10 bg-black/20">
        <div className="max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
              Why <span className="text-indigo-500">SomnoAI</span>?
            </h2>
            <p className="text-slate-400 text-lg md:text-xl font-medium italic max-w-3xl mx-auto leading-relaxed">
              Biological restoration isn't a passive process—it's an engineered outcome. 
              SomnoAI provides the clinical-grade tools needed to master your recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-[3rem]">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit"><Sparkles size={28} /></div>
              <h3 className="text-2xl font-black italic text-white uppercase">AI-Powered Synthesis</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                By leveraging <strong>Google Gemini AI</strong>, we process complex sleep data—including REM cycles, deep sleep density, and resting heart rate stability—to generate a high-fidelity reconstruction of your sleep architecture. No simple averages, just pure biological insight.
              </p>
            </div>
            <div className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-[3rem]">
              <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 w-fit"><Lock size={28} /></div>
              <h3 className="text-2xl font-black italic text-white uppercase">Privacy-First Architecture</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                Your physiological data is your sovereign property. SomnoAI utilizes a <strong>zero-backend storage</strong> policy. All telemetry is processed on the secure edge of your browser and purged immediately upon session termination. Your identity and biology remain decoupled from our servers.
              </p>
            </div>
            <div className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-[3rem]">
              <div className="p-4 bg-amber-500/10 rounded-2xl text-amber-400 w-fit"><Activity size={28} /></div>
              <h3 className="text-2xl font-black italic text-white uppercase">Universal Telemetry Ingress</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                Whether you use <strong>Android Health Connect</strong>, Google Fit, or manual terminal input, SomnoAI normalizes varied data streams into a unified restoration protocol. We support data from smartwatches, rings, and even clinical sleep study exports.
              </p>
            </div>
            <div className="space-y-6 p-8 bg-white/5 border border-white/10 rounded-[3rem]">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 w-fit"><Microscope size={28} /></div>
              <h3 className="text-2xl font-black italic text-white uppercase">Neuro-Science Protocols</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                Our recommendation engine is grounded in latest <strong>circadian rhythm research</strong> and neural recovery models. Receive experimental protocols designed to optimize metabolic load, neurotransmitter balancing, and cognitive performance via improved rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-48 px-6 relative z-10">
        <div className="max-w-[1400px] mx-auto space-y-32">
          <div className="text-left space-y-4 max-w-4xl">
            <h2 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-tight">
               THE <span className="text-indigo-500">PROTOCOL</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {[
               { id: '01', title: isZh ? '遥测接入' : 'Telemetry Ingress', icon: Activity, desc: isZh ? '通过安全网关同步原始穿戴设备指标。' : 'Sync raw wearable metrics via secure encrypted Health Connect gateway.' },
               { id: '02', title: isZh ? '神经网络合成' : 'Neural Synthesis', icon: BrainCircuit, desc: isZh ? '利用 Google Gemini AI 解构您的睡眠架构。' : 'Leverage Google Gemini AI models to decode sleep architecture.' },
               { id: '03', title: isZh ? '精准干预协议' : 'Precision Action', icon: Target, desc: isZh ? '接收量身定制的实验方案以提升表现。' : 'Receive tailored experimental protocols for peak human performance.' }
             ].map((step, i) => (
               <GlassCard key={i} className="p-14 rounded-[5rem] border-white/5 hover:border-indigo-500/20 transition-all duration-700 h-full group" intensity={1.2}>
                  <div className="flex justify-between items-start mb-16">
                     <div className="p-6 bg-indigo-500/10 rounded-3xl text-indigo-400 group-hover:scale-110 transition-transform">
                        <step.icon size={40} />
                     </div>
                     <span className="text-6xl font-black italic text-slate-900 group-hover:text-indigo-500 transition-colors opacity-40">{step.id}</span>
                  </div>
                  <h3 className="text-3xl font-black italic text-white uppercase tracking-tight mb-8 leading-none">{step.title}</h3>
                  <p className="text-slate-500 text-lg leading-relaxed italic font-bold opacity-80">{step.desc}</p>
               </GlassCard>
             ))}
          </div>
        </div>
      </section>

      <footer className="py-32 px-10 border-t border-white/5 bg-[#01040a] relative z-20">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-16">
            <div className="flex items-center gap-5">
               <Logo size={48} />
               <div className="flex flex-col text-left">
                  <span className="text-2xl font-black italic text-white uppercase leading-none">Somno<span className="text-indigo-400">AI</span></span>
                  <span className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-700 mt-1">@2026 LABORATORY INFRASTRUCTURE</span>
               </div>
            </div>
            <div className="flex items-center gap-4 px-8 py-3 bg-white/[0.03] border border-white/5 rounded-full">
               <ShieldCheck size={14} className="text-indigo-500" />
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Powered by Google Gemini</span>
            </div>
         </div>
      </footer>

      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] bg-[#010409] p-12 flex flex-col gap-16 backdrop-blur-3xl"
          >
            <div className="flex justify-between items-center">
              <Logo size={56} />
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-4 bg-white/5 rounded-full"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-12 text-left">
              {navLinks.map((link) => (
                <button key={link.view} onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }} className="text-6xl font-black italic uppercase tracking-tighter hover:text-indigo-400 transition-all">{link.label}</button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};