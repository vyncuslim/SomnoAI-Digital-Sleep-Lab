import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, 
  ArrowRight, LogIn, Command, BrainCircuit, Cpu, X, Menu, Target,
  Microscope, Sparkles, Database, Lock, Mail, Globe, LifeBuoy, Copy, Check, Newspaper,
  ChevronRight, Calendar, FlaskConical, Binary, Layers, Waves
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: string) => void;
}

const NeuralBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#01040a]">
    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.2]" />
    <m.div 
      animate={{ 
        opacity: [0.1, 0.2, 0.1],
        scale: [1, 1.05, 1]
      }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] h-screen bg-indigo-600/5 blur-[120px] rounded-full"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.1] mix-blend-overlay" />
  </div>
);

const SectionHeading = ({ title, sub, align = 'center' }: { title: string, sub: string, align?: 'center' | 'left' }) => (
  <div className={`space-y-4 mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <div className={`inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full ${align === 'center' ? 'mx-auto' : ''}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">{sub}</span>
    </div>
    <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">{title}</h2>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = translations[lang].landing;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.science, view: 'science' },
    { label: t.nav.news, view: 'news' },
    { label: t.nav.project, view: 'about' },
    { label: t.nav.support, view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <NeuralBackground />

      {/* Modern Fixed Header */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 py-8 md:px-12 ${scrolled ? 'bg-[#01040a]/85 backdrop-blur-2xl py-5 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={42} animated={true} />
            <div className="flex flex-col text-left">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
                <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1">Digital Sleep Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-12">
            {navLinks.map((link) => (
              <button 
                key={link.view} 
                onClick={() => onNavigate(link.view)}
                className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.3em] uppercase italic"
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6">
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="px-8 py-3 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all italic flex items-center gap-3"
            >
              <LogIn size={14} /> {t.nav.enter}
            </m.button>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(true)}><Menu size={28} /></button>
          </div>
        </div>
      </nav>

      {/* Hero Section - Aggressive Typography */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <m.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }}
          className="max-w-7xl space-y-12"
        >
          <div className="inline-flex items-center gap-4 px-6 py-2 bg-indigo-600/5 border border-indigo-500/20 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Neural Ingress v2.8 Active</span>
          </div>

          <div className="space-y-0 select-none">
            <h1 className="text-[8rem] sm:text-[10rem] md:text-[13rem] lg:text-[15rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
              Engineer
            </h1>
            <h1 className="text-[8rem] sm:text-[10rem] md:text-[13rem] lg:text-[15rem] font-black italic tracking-tighter text-indigo-600 uppercase leading-[0.8] mt-[-1%]">
              Recovery
            </h1>
          </div>

          <m.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl mx-auto leading-relaxed border-l-4 border-indigo-600/30 pl-10 text-left md:text-center"
          >
             {t.heroSubtitle}
          </m.p>

          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-6"
          >
            <m.button 
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="px-14 py-7 bg-indigo-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_60px_rgba(79,70,229,0.3)] transition-all italic flex items-center justify-center gap-4"
            >
              {t.ctaPrimary} <ArrowRight size={18} />
            </m.button>
            <button 
              onClick={() => onNavigate('login')}
              className="px-14 py-7 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4 shadow-xl"
            >
              <Command size={18} className="text-indigo-500" /> {t.ctaSecondary}
            </button>
          </m.div>
        </m.div>
      </section>

      {/* The Pillars - Technical Deep Dive */}
      <section className="relative z-10 py-40 px-6 max-w-[1400px] mx-auto w-full">
         <SectionHeading title="Neural Framework" sub="The Core Protocols" />
         
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                icon: BrainCircuit, 
                title: lang === 'zh' ? '神经合成引擎' : 'Neural Synthesis', 
                desc: lang === 'zh' ? '由 Gemini 2.5 Pro 驱动，解析深度睡眠与 REM 阶段的微小波动。' : 'Powered by Gemini 2.5 Pro, decoding micro-oscillations in Deep and REM phases.',
                id: '0x01'
              },
              { 
                icon: Lock, 
                title: lang === 'zh' ? '边缘主权架构' : 'Edge Sovereignty', 
                desc: lang === 'zh' ? '生物原始数据永不离开终端。所有分析均在本地浏览器会话中完成。' : 'Raw biological data never leaves your device. All synthesis occurs in local session.',
                id: '0x02'
              },
              { 
                icon: Waves, 
                title: lang === 'zh' ? '多维遥测同步' : 'Telemetry Sync', 
                desc: lang === 'zh' ? '无缝桥接 Health Connect 与 Google Fit，获取最精准的生理基准。' : 'Seamless bridge for Health Connect and Google Fit for precise biological baselines.',
                id: '0x03'
              }
            ].map((pillar) => (
              <GlassCard key={pillar.id} className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 space-y-10 group" intensity={1.2}>
                 <div className="flex justify-between items-start">
                    <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 transition-transform shadow-inner">
                       <pillar.icon size={32} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-800 font-black tracking-widest">{pillar.id}</span>
                 </div>
                 <div className="space-y-4">
                    <h3 className="text-2xl font-black italic text-white uppercase tracking-tight">{pillar.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed italic font-medium opacity-80">{pillar.desc}</p>
                 </div>
                 <div className="h-1 w-12 bg-indigo-600/20 rounded-full group-hover:w-full group-hover:bg-indigo-600/40 transition-all duration-700" />
              </GlassCard>
            ))}
         </div>
      </section>

      {/* Research Center - Academic Focus */}
      <section className="relative z-10 py-40 px-6 max-w-[1400px] mx-auto w-full border-t border-white/5">
         <SectionHeading title="Research Hub" sub="Validated Biometrics" align="left" />
         
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8">
               <GlassCard 
                 onClick={() => onNavigate('news')}
                 className="p-16 rounded-[5rem] border-indigo-500/20 bg-indigo-600/[0.02] cursor-pointer group relative overflow-hidden"
                 intensity={1.5}
               >
                  <div className="absolute top-0 right-0 p-16 opacity-[0.03] text-indigo-400 group-hover:rotate-12 transition-transform duration-1000">
                    <Binary size={400} strokeWidth={0.5} />
                  </div>
                  
                  <div className="space-y-10 relative z-10">
                     <div className="flex items-center gap-4">
                        <span className="px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest italic">Featured Report</span>
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-600 uppercase tracking-widest italic"><Calendar size={12} /> Feb 2026</div>
                     </div>
                     <h3 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
                        How AI helps<br/><span className="text-indigo-600 group-hover:text-white transition-colors">optimize recovery?</span>
                     </h3>
                     <p className="text-xl text-slate-400 leading-relaxed italic max-w-2xl font-bold">
                        "A comprehensive study on how multi-modal biological telemetry synthesized via Gemini AI is revolutionizing restorative window detection."
                     </p>
                     <div className="pt-8 flex items-center gap-6 text-white text-[12px] font-black uppercase tracking-[0.4em] italic group-hover:translate-x-4 transition-transform">
                        Access Full Publication <ArrowRight size={20} />
                     </div>
                  </div>
               </GlassCard>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-6">
               <GlassCard className="p-10 rounded-[3rem] border-white/5 flex-1 bg-slate-900/40 space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="p-3 bg-white/5 rounded-2xl text-slate-500"><FlaskConical size={20} /></div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/30 px-3 py-1 rounded-full">PEER REVIEWED</span>
                  </div>
                  <h4 className="text-xl font-black italic text-white uppercase tracking-tight">Decoded: The REM Paradox in Technical Workers</h4>
                  <p className="text-xs text-slate-600 leading-relaxed italic font-medium">New telemetry from Somno Lab suggests REM phases are critical for cognitive mapping.</p>
               </GlassCard>
               <button 
                 onClick={() => onNavigate('news')}
                 className="w-full py-10 bg-slate-950 border border-white/10 rounded-[3rem] text-slate-500 hover:text-indigo-400 hover:border-indigo-500/40 transition-all font-black text-[11px] uppercase tracking-[0.5em] italic flex items-center justify-center gap-4"
               >
                 View Index <Layers size={16} />
               </button>
            </div>
         </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 py-60 px-6 text-center overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[80vh] bg-indigo-600/5 blur-[200px] rounded-full" />
         
         <m.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto space-y-12 relative z-10">
            <h2 className="text-6xl md:text-9xl font-black italic text-white uppercase tracking-tighter leading-none">Ready for<br/><span className="text-indigo-600">Sync?</span></h2>
            <p className="text-xl text-slate-500 font-bold italic leading-relaxed max-w-2xl mx-auto uppercase tracking-widest opacity-80">
               Initialize your personalized restoration cycle within the Digital Sleep Lab today.
            </p>
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('signup')}
              className="px-20 py-10 bg-white text-slate-950 rounded-full font-black text-sm uppercase tracking-[0.6em] shadow-[0_50px_100px_-20px_rgba(255,255,255,0.1)] transition-all italic active:scale-90"
            >
               Execute Protocol
            </m.button>
         </m.div>
      </section>

      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div 
            initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-[200] bg-[#010409] p-12 flex flex-col gap-16 backdrop-blur-3xl"
          >
            <div className="flex justify-between items-center">
              <Logo size={60} />
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-4 bg-white/5 rounded-full"><X size={32} /></button>
            </div>
            <div className="flex flex-col gap-10 text-left">
              {navLinks.map((link) => (
                <button key={link.view} onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }} className="text-5xl font-black italic uppercase tracking-tighter hover:text-indigo-400 transition-all">{link.label}</button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 border-t border-white/5 bg-[#01040a]">
        <div className="flex items-center gap-4">
          <Logo size={28} />
          <span className="text-[10px] font-bold uppercase tracking-widest italic text-slate-500">@2026 SomnoAI Laboratory Hub</span>
        </div>
        <div className="flex items-center gap-4 px-6 py-2 bg-indigo-500/5 border border-indigo-500/20 rounded-full">
          <ShieldCheck size={14} className="text-indigo-400" />
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">Secure Neural Protocol Active</span>
        </div>
      </footer>
    </div>
  );
};