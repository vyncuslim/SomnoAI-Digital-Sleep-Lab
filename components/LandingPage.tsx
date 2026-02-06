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
      desc: isZh ? '通过 Health Connect 自动同步穿戴设备数据，或手动注入生理感受。' : 'Sync wearable telemetry via Health Connect or log subjective recovery metrics manually.'
    },
    {
      icon: BrainCircuit,
      title: isZh ? '2. AI 神经建模' : '2. Neural Synthesis',
      desc: isZh ? '利用 Google Gemini 尖端模型，识别深睡效率、REM 阶段及作息规律。' : 'Leverage Google Gemini models to reconstruct sleep stages and identify recovery architecture.'
    },
    {
      icon: Sparkles,
      title: isZh ? '3. 获得精准协议' : '3. Precision Protocol',
      desc: isZh ? '根据生物基准定制化改善建议，锁定破坏睡眠的隐藏因素。' : 'Receive tailored optimization protocols to eliminate disruptors and maximize deep sleep.'
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
      <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5 px-6 py-4" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <Logo size={32} animated={true} />
             <div className="flex flex-col">
               <span className="text-xl font-black italic tracking-tighter uppercase text-white leading-none">SomnoAI</span>
               <span className="text-[7px] font-bold tracking-[0.3em] uppercase text-indigo-400 opacity-80">Digital Sleep Lab</span>
             </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-10" role="navigation">
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
      <main>
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20 pb-32 text-left">
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
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">SomnoAI Digital Sleep Lab • Neural Intelligence</span>
            </div>

            <div className="space-y-8">
              <h1 className="text-5xl md:text-9xl font-black italic tracking-tighter text-white uppercase leading-[0.85]">
                {isZh ? '让每一次睡眠' : 'ENGINEER YOUR'} <br/>
                <span className="text-indigo-500">{isZh ? '都成为能量补给' : 'NIGHT POTENTIAL'}</span>
              </h1>
              <p className="text-lg md:text-2xl text-slate-400 font-medium italic max-w-4xl mx-auto leading-relaxed px-4">
                {isZh 
                  ? 'SomnoAI 将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。' 
                  : 'Experience clinical-grade sleep architecture analysis. SomnoAI integrates physiological monitoring with AI deep insights to reconstruct your recovery architecture.'}
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
                <LogIn size={18} /> {isZh ? '登录实验室' : 'ENTER LABORATORY'}
              </button>
            </div>
          </m.div>
        </section>

        {/* WORKFLOW SECTION */}
        <section className="py-32 px-4 max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {steps.map((step, i) => (
                <GlassCard key={i} className="p-10 rounded-[3rem] border-white/5 hover:border-indigo-500/20 transition-all duration-700">
                   <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit mb-8 text-indigo-400">
                      <step.icon size={32} />
                   </div>
                   <h3 className="text-xl font-black italic text-white uppercase mb-4">{step.title}</h3>
                   <p className="text-slate-400 text-sm leading-relaxed italic">{step.desc}</p>
                </GlassCard>
              ))}
           </div>
        </section>
      </main>

      {/* REFINED FOOTER */}
      <footer className="bg-black/40 border-t border-white/5 pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1 space-y-6">
               <div className="flex items-center gap-3">
                  <Logo size={28} />
                  <span className="text-xl font-black italic tracking-tighter text-white uppercase">SomnoAI</span>
               </div>
               <p className="text-xs text-slate-500 italic leading-relaxed">
                 Dedicated to the science of recovery and the architecture of high-performance sleep.
               </p>
            </div>
            
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Connectivity</h4>
               <ul className="space-y-3 text-xs font-bold text-slate-400 italic">
                 <li><a href="mailto:admin@sleepsomno.com" className="hover:text-white transition-colors">admin@sleepsomno.com</a></li>
                 <li><a href="mailto:contact@sleepsomno.com" className="hover:text-white transition-colors">contact@sleepsomno.com</a></li>
                 <li><a href="mailto:info@sleepsomno.com" className="hover:text-white transition-colors">info@sleepsomno.com</a></li>
                 <li><a href="mailto:support@sleepsomno.com" className="hover:text-white transition-colors">support@sleepsomno.com</a></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Resources</h4>
               <ul className="space-y-3 text-xs font-bold text-slate-400 italic">
                 <li><button onClick={() => onNavigate('science')} className="hover:text-white transition-colors uppercase">Neural Science</button></li>
                 <li><button onClick={() => onNavigate('faq')} className="hover:text-white transition-colors uppercase">Laboratory FAQ</button></li>
                 <li><button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors uppercase">Connectivity Hub</button></li>
                 <li><a href="/privacy" className="hover:text-white transition-colors uppercase">Privacy Protocol</a></li>
                 <li><a href="/terms" className="hover:text-white transition-colors uppercase">Terms of Service</a></li>
               </ul>
            </div>

            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Global Network</h4>
               <div className="flex gap-4">
                  <a href="https://www.linkedin.com/company/somnoai-digital-sleep-lab/" target="_blank" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                    <Linkedin size={18} />
                  </a>
                  <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
                    <Github size={18} />
                  </a>
                  <a href="mailto:contact@sleepsomno.com" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                    <Mail size={18} />
                  </a>
               </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40">
             <p className="text-[9px] font-mono uppercase tracking-[0.5em]">@2026 SomnoAI Digital Sleep Lab • Neural Infrastructure</p>
             <div className="flex items-center gap-2 text-indigo-400">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">HIPAA/GDPR Alignment Matrix active</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};