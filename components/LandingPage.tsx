
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Moon, BrainCircuit, Activity, 
  ArrowRight, Lock, Microscope, Sparkles, LogIn, HeartPulse, Waves, 
  CheckCircle2, Menu, X, Globe, Mail, Github, Linkedin, ExternalLink, HelpCircle
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const steps = [
    {
      icon: Activity,
      title: isZh ? '1. 智能数据同步' : '1. Biometric Ingress',
      desc: isZh ? '通过 Health Connect 自动同步手环、手表数据，或手动记录生理感受。' : 'Sync wearable telemetry via Health Connect or log subjective recovery metrics manually.'
    },
    {
      icon: BrainCircuit,
      title: isZh ? '2. AI 神经建模' : '2. Neural Synthesis',
      desc: isZh ? '利用 Google Gemini 尖端模型，识别您的深睡效率、REM 阶段及作息规律。' : 'Leverage Google Gemini models to reconstruct sleep stages and identify recovery architecture.'
    },
    {
      icon: Sparkles,
      title: isZh ? '3. 获得专属处方' : '3. Precision Protocol',
      desc: isZh ? '根据您的生物基准，定制化改善建议，锁定破坏睡眠的隐藏因素。' : 'Receive tailored optimization protocols to eliminate disruptors and maximize deep sleep.'
    }
  ];

  const navLinks = [
    { label: isZh ? '科学原理' : 'Science', view: 'science' },
    { label: isZh ? '研究案例' : 'Case Studies', view: 'about' },
    { label: isZh ? '常见问题' : 'FAQ', view: 'faq' },
    { label: isZh ? '技术支持' : 'Support', view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans">
      {/* PROFESSIONAL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <Logo size={32} animated={true} />
             <div className="flex flex-col">
               <span className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">SomnoAI</span>
               <span className="text-[7px] font-bold tracking-[0.3em] uppercase text-indigo-400 opacity-80">Digital Sleep Lab</span>
             </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <button 
                key={link.view} 
                onClick={() => onNavigate(link.view)} 
                className="text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 transition-colors"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => onNavigate('login')}
              className="hidden sm:block px-8 py-2.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
            >
              {isZh ? '实验室入口' : 'Enter Lab'}
            </button>
            <button className="md:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-[90] bg-[#020617] pt-24 px-6 md:hidden"
          >
            <div className="flex flex-col gap-8">
              {navLinks.map((link) => (
                <button 
                  key={link.view} 
                  onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }} 
                  className="text-2xl font-black uppercase italic text-left text-white"
                >
                  {link.label}
                </button>
              ))}
              <button 
                onClick={() => { onNavigate('login'); setMobileMenuOpen(false); }}
                className="w-full py-6 rounded-3xl bg-indigo-600 text-white font-black uppercase tracking-widest text-sm"
              >
                {isZh ? '进入实验室' : 'Login to Console'}
              </button>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* HERO SECTION */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[120vw] h-[120vw] bg-indigo-600/10 blur-[200px] rounded-full animate-pulse" />
          <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#020617] to-transparent" />
        </div>

        <m.div 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-12 relative z-10 max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4">
             <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">SomnoAI Digital Sleep Lab • Clinical Intelligence</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
              {isZh ? '让每一次睡眠' : 'ENGINEER YOUR'} <br/>
              <span className="text-indigo-500">{isZh ? '都成为能量补给' : 'NIGHT POTENTIAL'}</span>
            </h1>
            <p className="text-lg md:text-2xl text-slate-400 font-medium italic max-w-3xl mx-auto leading-relaxed px-4">
              {isZh 
                ? 'SomnoAI 数字化睡眠实验室。融合生理指标监控、AI 深度洞察与科学健康建议，为您揭示数据背后的睡眠真相。' 
                : 'SomnoAI Digital Sleep Lab integrates advanced physiological monitoring and Google Gemini neural insights to reconstruct your recovery architecture.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6 px-4">
            <button 
              onClick={() => onNavigate('signup')}
              className="w-full sm:w-auto px-16 py-7 bg-white text-[#020617] rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(255,255,255,0.1)] transition-all hover:scale-105 active:scale-95 italic flex items-center justify-center gap-4"
            >
              {isZh ? '立即开始优化' : 'START OPTIMIZATION'} <ArrowRight size={20} />
            </button>
            <button 
              onClick={() => onNavigate('login')}
              className="w-full sm:w-auto px-10 py-7 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full font-black text-xs uppercase tracking-[0.3em] border border-white/10 transition-all active:scale-95 italic flex items-center justify-center gap-3"
            >
              <LogIn size={18} /> {isZh ? '登录账号' : 'ENTER LABORATORY'}
            </button>
          </div>
        </m.div>

        <m.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20"
        >
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </m.div>
      </section>

      {/* SERVICES SECTION */}
      <section className="py-32 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
           <span className="text-emerald-400 font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '核心流程' : 'THE PROTOCOL'}</span>
           <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">{isZh ? '科学闭环，深度重塑' : 'PRECISION ANALYSIS'}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {steps.map((step, i) => (
            <GlassCard key={i} className="p-12 rounded-[4rem] border-white/5 bg-slate-900/20 group hover:bg-emerald-600/[0.03]">
              <div className="w-20 h-20 bg-indigo-600/10 rounded-[2rem] flex items-center justify-center text-indigo-400 mb-10 border border-indigo-500/20 shadow-2xl group-hover:scale-110 transition-transform">
                 <step.icon size={36} />
              </div>
              <h3 className="text-2xl font-black italic text-white uppercase mb-4 tracking-tight leading-none">{step.title}</h3>
              <p className="text-slate-500 text-[15px] leading-relaxed italic font-medium">{step.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      {/* CASE STUDY / TRUST SECTION */}
      <section className="py-32 px-4 bg-indigo-600/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-12 text-left">
               <div className="space-y-4">
                  <span className="text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '隐私与安全' : 'PRIVACY & INFRASTRUCTURE'}</span>
                  <h2 className="text-4xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
                    {isZh ? '数据主权' : 'DATA'} <br/> <span className="text-indigo-500">{isZh ? '由你掌控' : 'SOVEREIGNTY'}</span>
                  </h2>
               </div>
               <p className="text-xl text-slate-400 font-medium italic leading-relaxed">
                  {isZh 
                    ? 'SomnoAI 数字化睡眠实验室采用“边缘计算”架构，您的生理数据仅存储在浏览器会话中，绝不上传到后台服务器，且在退出登录后立即永久抹除。' 
                    : 'Utilizing Edge Processing architecture, SomnoAI Digital Sleep Lab ensures your biometric telemetry is stored exclusively in-browser and purged immediately upon session termination.'}
               </p>
               <div className="flex flex-wrap gap-4">
                  {['Bank-Level Encryption', 'No Server Persistence', '100% Anonymous'].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 px-6 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                       <CheckCircle2 size={12} className="text-emerald-500" />
                       <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">{t}</span>
                    </div>
                  ))}
               </div>
            </div>

            <GlassCard className="p-10 md:p-16 rounded-[5rem] border-white/10 bg-black/40 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                  <HelpCircle size={400} />
               </div>
               <div className="space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white"><Microscope size={24} /></div>
                     <h3 className="text-xl font-black italic uppercase text-white tracking-tight">{isZh ? '研究方向' : 'RESEARCH FOCUS'}</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 italic leading-relaxed">
                      {isZh ? '我们致力于通过心率变异性（HRV）与深度学习模型，探索睡眠架构与认知表现之间的直接关联。' : 'SomnoAI Digital Sleep Lab explores the direct correlation between heart rate variability (HRV), neural sleep architecture, and executive cognitive performance.'}
                    </p>
                    <button onClick={() => onNavigate('science')} className="flex items-center gap-3 text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-all italic">
                       {isZh ? '阅读科学协议' : 'READ SCIENTIFIC PROTOCOL'} <ExternalLink size={14} />
                    </button>
                  </div>
               </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* WORLD CLASS FOOTER */}
      <footer className="bg-slate-950 border-t border-white/5 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
          <div className="col-span-1 md:col-span-2 space-y-10">
             <div className="flex items-center gap-4">
                <Logo size={48} animated={true} />
                <div className="flex flex-col">
                  <span className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">SomnoAI</span>
                  <span className="text-[9px] font-bold tracking-[0.4em] uppercase text-indigo-500">Digital Sleep Lab</span>
                </div>
             </div>
             <p className="text-slate-500 text-sm italic font-medium max-w-md leading-relaxed">
               {isZh 
                 ? '通过先进的生物测定科学和人工智能，致力于追求人类最优化的生理恢复。' 
                 : 'Dedicated to the pursuit of optimal human recovery through advanced biometric science and generative intelligence.'}
             </p>
             <div className="flex gap-6">
                <a href="https://github.com/vyncuslim" target="_blank" className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><Github size={20} /></a>
                <a href="https://linkedin.com" target="_blank" className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><Linkedin size={20} /></a>
                <a href="mailto:ongyuze1401@gmail.com" className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-white transition-all"><Mail size={20} /></a>
             </div>
          </div>

          <div className="space-y-10">
             <h4 className="text-white font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '实验室' : 'LABORATORY'}</h4>
             <nav className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <button key={link.view} onClick={() => onNavigate(link.view)} className="text-slate-500 hover:text-white text-left text-sm italic font-medium transition-all">{link.label}</button>
                ))}
             </nav>
          </div>

          <div className="space-y-10">
             <h4 className="text-white font-black uppercase tracking-[0.4em] text-[10px] italic">{isZh ? '法律与合规' : 'LEGAL & NODES'}</h4>
             <nav className="flex flex-col gap-6">
                <button onClick={() => onNavigate('privacy')} className="text-slate-500 hover:text-white text-left text-sm italic font-medium transition-all">{isZh ? '隐私政策' : 'Privacy Policy'}</button>
                <button onClick={() => onNavigate('terms')} className="text-slate-500 hover:text-white text-left text-sm italic font-medium transition-all">{isZh ? '服务条款' : 'Terms of Service'}</button>
                <div className="pt-4">
                   <p className="text-[9px] font-mono text-slate-800 uppercase tracking-widest">Version: 2.8.4-STABLE</p>
                   <p className="text-[9px] font-mono text-slate-800 uppercase tracking-widest">Network: Neural-Grid-Alpha</p>
                </div>
             </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-32 text-center">
           <p className="text-[10px] font-mono uppercase tracking-[0.6em] text-slate-700">
             © 2026 SomnoAI Digital Sleep Lab • SECURING YOUR NIGHT POTENTIAL
           </p>
        </div>
      </footer>
    </div>
  );
};
