
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Moon, BrainCircuit, Activity, 
  ArrowRight, Lock, Microscope, Sparkles, LogIn, HeartPulse, Waves, 
  CheckCircle2, Menu, X, Globe, Mail, Github, Linkedin, ExternalLink, HelpCircle,
  Database, Fingerprint, Shield, Cpu, Layout, BarChart3, Binary, Share2,
  Monitor, Smartphone, UserPlus, Chrome
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { GlassCard } from './GlassCard.tsx';
import { Language } from '../services/i18n.ts';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: string) => void;
}

const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }: any) => (
  <m.article 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    viewport={{ once: true }}
    className="group"
  >
    <GlassCard className="p-8 h-full rounded-[3rem] border-white/5 hover:border-indigo-500/30 transition-all duration-500 bg-white/[0.01]">
       <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit mb-6 text-indigo-400 group-hover:scale-110 transition-transform duration-500">
          <Icon size={28} aria-hidden="true" />
       </div>
       <h3 className="text-xl font-black italic text-white uppercase mb-3 tracking-tight">{title}</h3>
       <p className="text-slate-500 text-sm leading-relaxed italic font-medium">{desc}</p>
    </GlassCard>
  </m.article>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const isZh = lang === 'zh';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (e: React.MouseEvent, view: string) => {
    e.preventDefault();
    onNavigate(view);
  };

  const navLinks = [
    { label: isZh ? '科学原理' : 'Scientific Protocol', view: 'science' },
    { label: isZh ? '实验室 FAQ' : 'Laboratory FAQ', view: 'faq' },
    { label: isZh ? '关于项目' : 'About Project', view: 'about' },
    { label: isZh ? '技术支持' : 'System Support', view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 overflow-x-hidden font-sans selection:bg-indigo-500/30">
      {/* 1. PROFESSIONAL HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5 px-6 py-4" role="banner">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
             <Logo size={36} animated={true} />
             <div className="flex flex-col">
               <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase text-white leading-none group-hover:text-indigo-400 transition-colors">SomnoAI</span>
               <span className="text-[7px] font-bold tracking-[0.4em] uppercase text-indigo-400/60">Digital Sleep Lab</span>
             </div>
          </div>
          
          <nav className="hidden lg:flex items-center gap-12" role="navigation">
            {navLinks.map((link) => (
              <a 
                key={link.view} 
                href={`/${link.view}`}
                onClick={(e) => handleNav(e, link.view)} 
                className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-indigo-500 group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 md:gap-4">
            <a 
              href="/login"
              onClick={(e) => handleNav(e, 'login')}
              className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-2"
            >
              <LogIn size={14} className="text-indigo-400" /> {isZh ? '登录' : 'Enter'}
            </a>
            <a 
              href="/signup"
              onClick={(e) => handleNav(e, 'signup')}
              className="hidden sm:flex px-6 py-3 rounded-full bg-indigo-600 text-[10px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all active:scale-95 items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <UserPlus size={14} /> {isZh ? '注册' : 'Link'}
            </a>
            <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" aria-label="Toggle Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MOBILE OVERLAY MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <m.nav 
            initial={{ opacity: 0, x: '100%' }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-[#020617] p-8 lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-16">
              <Logo size={40} />
              <button onClick={() => setMobileMenuOpen(false)} className="p-3 bg-white/5 rounded-2xl text-slate-400">
                <X size={28} />
              </button>
            </div>
            <div className="flex flex-col gap-10 flex-1">
              {navLinks.map((link) => (
                <a 
                  key={link.view} 
                  href={`/${link.view}`}
                  onClick={(e) => { handleNav(e, link.view); setMobileMenuOpen(false); }} 
                  className="text-4xl font-black uppercase italic text-left text-white tracking-tighter"
                >
                  {link.label}
                </a>
              ))}
            </div>
            <a 
              href="/signup"
              onClick={(e) => { handleNav(e, 'signup'); setMobileMenuOpen(false); }}
              className="w-full py-7 rounded-[2.5rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-[0_20px_50px_rgba(79,70,229,0.3)] active:scale-95 transition-all text-center"
            >
              {isZh ? '初始化神经链路' : 'Initialize Neural Link'}
            </a>
          </m.nav>
        )}
      </AnimatePresence>

      {/* 3. HERO SECTION */}
      <main>
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[140vw] h-[100vh] bg-indigo-600/10 blur-[160px] rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#020617] to-transparent" />
          </div>

          <m.div 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-12 relative z-10 max-w-6xl mx-auto"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 group cursor-default">
               <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Neural Intelligence v2.8 Active</span>
            </div>

            <div className="space-y-10">
              <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
                {isZh ? '重构您的' : 'ENGINEER'} <br/>
                <span className="text-indigo-500">{isZh ? '夜间潜能' : 'RECOVERY'}</span>
              </h1>
              <p className="text-xl md:text-3xl text-slate-400 font-medium italic max-w-4xl mx-auto leading-relaxed px-4 opacity-80">
                {isZh 
                  ? '它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。' 
                  : 'Advanced sleep architecture analysis. SomnoAI integrates wearable telemetry with Google Gemini AI models to reconstruct your restoration window.'}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-8 pt-6 px-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
                <button 
                  onClick={() => authApi.signInWithGoogle()}
                  className="w-full sm:w-auto px-12 py-8 bg-white text-black rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_20px_60px_rgba(255,255,255,0.15)] transition-all hover:scale-105 hover:bg-slate-100 active:scale-95 italic flex items-center justify-center gap-4"
                >
                  <Chrome size={20} /> {isZh ? '使用 Google 登录' : 'Sign in with Google'}
                </button>
                <a 
                  href="/login"
                  onClick={(e) => handleNav(e, 'login')}
                  className="w-full sm:w-auto px-12 py-8 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full font-black text-[12px] uppercase tracking-[0.4em] border border-white/10 transition-all active:scale-95 italic flex items-center justify-center gap-3"
                >
                  <LogIn size={18} /> {isZh ? '进入实验室' : 'ENTER LABORATORY'}
                </a>
              </div>
              
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] italic">
                New to the Lab? <a href="/signup" onClick={(e) => handleNav(e, 'signup')} className="text-indigo-400 underline underline-offset-4">Initialize Registry</a>
              </p>
            </div>

            {/* TRUST BADGE */}
            <div className="pt-16 flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
               <div className="flex items-center gap-3">
                  <Logo size={24} staticMode={true} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Built with Gemini</span>
               </div>
               <div className="flex items-center gap-3">
                  <ShieldCheck size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Official Node</span>
               </div>
               <div className="flex items-center gap-3">
                  <Fingerprint size={20} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Privacy First</span>
               </div>
            </div>
          </m.div>
        </section>

        {/* 4. LABORATORY PREVIEW */}
        <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden" id="dashboard-preview">
           <m.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1 }}
             className="relative"
           >
              <GlassCard className="p-2 md:p-4 rounded-[4rem] border-white/10 shadow-[0_100px_150px_-50px_rgba(0,0,0,1)] bg-[#050a1f]/80 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 
                 <div className="bg-black/40 rounded-[3rem] px-10 py-6 mb-2 flex items-center justify-between border border-white/5">
                    <div className="flex items-center gap-6">
                       <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_15px_#6366f1]" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 italic">Neural Sync: Connected</span>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-700"><Monitor size={14} /></div>
                       <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-slate-700"><Smartphone size={14} /></div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
                    <div className="lg:col-span-3 space-y-2 hidden lg:block">
                       <div className="bg-black/20 rounded-[2.5rem] p-8 border border-white/5 h-full space-y-10">
                          <div className="space-y-6">
                             {[Layout, BarChart3, Binary, Share2].map((Icon, i) => (
                               <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${i === 0 ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-600'}`}>
                                  <Icon size={18} />
                                  <div className="h-2 w-16 bg-current opacity-20 rounded-full" />
                               </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="lg:col-span-9 space-y-2">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div className="bg-slate-900/60 rounded-[3rem] p-12 border border-white/5 min-h-[400px] flex flex-col justify-between">
                             <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400 italic">Recovery Score</span>
                             <div className="text-[120px] font-black italic tracking-tighter text-white leading-none">88</div>
                             <div className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-emerald-500" />
                                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Optimal Restoration</span>
                             </div>
                          </div>
                          <div className="bg-slate-900/60 rounded-[3rem] p-12 border border-white/5 min-h-[400px] space-y-10">
                             <div className="flex justify-between items-center">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 italic">Neural Staging</span>
                                <Activity size={18} className="text-indigo-500" />
                             </div>
                             <p className="text-[11px] text-slate-500 italic leading-relaxed pt-4 border-t border-white/5">
                                "Our AI reconstructs sleep cycles (Deep, REM, Light) using Google Gemini's advanced reasoning models."
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </GlassCard>
           </m.div>
        </section>

        {/* 5. PROTOCOL STEPS SECTION */}
        <section className="py-32 px-4 max-w-7xl mx-auto space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">The Laboratory <span className="text-indigo-500">Protocol</span></h2>
              <p className="text-slate-500 uppercase tracking-[0.4em] font-black text-[10px] italic">From Biometric Telemetry to Human Transformation</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Activity}
                title={isZh ? "1. 生物特征接入" : "1. Biometric Ingress"}
                desc={isZh ? "通过 Health Connect 同步数据，或通过手动终端注入感受。支持所有主流传感器协议。" : "Sync data via Health Connect or use our Injection Terminal. Full sensor-agnostic infrastructure."}
                delay={0.1}
              />
              <FeatureCard 
                icon={BrainCircuit}
                title={isZh ? "2. 神经模型合成" : "2. Neural Synthesis"}
                desc={isZh ? "利用 Google Gemini 尖端模型识别深睡效率与 REM 节奏，精确解构您的夜间恢复架构。" : "Leverage Google Gemini neural models to identify deep sleep efficiency and REM rhythms."}
                delay={0.2}
              />
              <FeatureCard 
                icon={Sparkles}
                title={isZh ? "3. 精准优化协议" : "3. Precision Protocol"}
                desc={isZh ? "获取量身定制的方案，锁定破坏因素，将每一次休息转化为高性能能量储备。" : "Receive tailored optimization protocols to transform every rest into an energy reserve."}
                delay={0.3}
              />
           </div>
        </section>

        {/* 6. TRUST & BRAND AUTHORITY */}
        <section className="py-32 bg-indigo-600/5 border-y border-white/5">
           <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div className="space-y-12">
                 <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">Official <span className="text-indigo-500">Infrastructure</span></h2>
                 <p className="text-slate-400 text-lg font-medium italic leading-relaxed">
                   SomnoAI Digital Sleep Lab is a specialized research environment dedicated to the intersection of data sovereignty and recovery science.
                 </p>
                 <div className="space-y-8">
                    {[
                      { icon: Lock, title: "Edge Processing", desc: "No biometric data persistence on our cloud nodes. Total privacy by design." },
                      { icon: Database, title: "Open Data Access", desc: "Integrates with Google Fit, Oura, and manual inputs via secure APIs." },
                      { icon: Globe, title: "Global Lab Dispatch", desc: "Dedicated support nodes across Penang, Malaysia for infrastructure maintenance." }
                    ].map((item, i) => (
                      <div key={i} className="flex gap-6 items-start group">
                         <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400 group-hover:bg-indigo-600 group-hover:text-white transition-all"><item.icon size={20} /></div>
                         <div>
                            <h4 className="text-white font-black italic uppercase tracking-tight">{item.title}</h4>
                            <p className="text-slate-500 text-sm italic font-medium">{item.desc}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
              
              <GlassCard className="p-12 rounded-[4rem] border-white/5 bg-black/40 overflow-hidden" intensity={1.5}>
                 <div className="space-y-10 relative z-10">
                    <div className="flex items-center gap-3">
                       <Microscope size={20} className="text-indigo-400" />
                       <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] italic">Identity Registry</h3>
                    </div>
                    <p className="text-2xl font-black italic text-indigo-300 leading-snug">"The first lab environment where I actually own the insights, not just the data charts."</p>
                    <div className="flex items-center gap-5">
                       <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black italic shadow-xl">S</div>
                       <div>
                          <p className="text-sm font-black text-white uppercase tracking-widest italic">Subject #2481</p>
                          <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Verified Researcher</p>
                       </div>
                    </div>
                 </div>
                 <div className="absolute -bottom-10 -right-10 opacity-[0.03] text-white"><Moon size={240} strokeWidth={0.5} /></div>
              </GlassCard>
           </div>
        </section>

        {/* 7. CTA */}
        <section className="py-40 text-center px-4 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] bg-indigo-500/5 blur-[120px] rounded-full" />
           <m.div 
             initial={{ opacity: 0, scale: 0.9 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="space-y-14 relative z-10"
           >
              <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-none">Ready to <br/><span className="text-indigo-500">Reconstruct?</span></h2>
              <div className="flex justify-center">
                 <a 
                   href="/signup"
                   onClick={(e) => handleNav(e, 'signup')}
                   className="px-20 py-8 bg-white text-indigo-950 rounded-full font-black text-[12px] uppercase tracking-[0.5em] shadow-[0_30px_70px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all italic flex items-center gap-4 text-center"
                 >
                   Establish Link <ArrowRight size={20} />
                 </a>
              </div>
           </m.div>
        </section>
      </main>

      {/* 8. INSTITUTIONAL FOOTER */}
      <footer className="bg-black/60 border-t border-white/5 pt-32 pb-16 px-6" role="contentinfo">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16">
            <div className="space-y-8">
               <div className="flex items-center gap-3">
                  <Logo size={32} />
                  <span className="text-2xl font-black italic tracking-tighter text-white uppercase">SomnoAI</span>
               </div>
               <p className="text-xs text-slate-500 italic font-medium leading-relaxed max-w-xs">
                 Dedicated to the science of recovery and high-performance restoration. Built with neural precision in Penang, Malaysia.
               </p>
               <div className="flex gap-4">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/somnoai-digital-sleep-lab/", label: "LinkedIn" },
                    { icon: Github, href: "https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab", label: "GitHub" },
                    { icon: Mail, href: "mailto:contact@sleepsomno.com", label: "Email" }
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-white hover:bg-indigo-600 transition-all" aria-label={social.label}>
                      <social.icon size={18} />
                    </a>
                  ))}
               </div>
            </div>
            
            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Lab Navigation</h4>
               <ul className="space-y-4 text-xs font-bold text-slate-500 italic">
                 {navLinks.map(link => (
                   <li key={link.view}><a href={`/${link.view}`} onClick={(e) => handleNav(e, link.view)} className="hover:text-white transition-colors uppercase tracking-widest">{link.label}</a></li>
                 ))}
               </ul>
            </div>

            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Identity & Compliance</h4>
               <ul className="space-y-4 text-xs font-bold text-slate-500 italic">
                 <li><a href="/privacy" className="hover:text-white transition-colors uppercase tracking-widest">Privacy Policy</a></li>
                 <li><a href="/terms" className="hover:text-white transition-colors uppercase tracking-widest">Terms of Service</a></li>
                 <li><a href="/science" onClick={(e) => handleNav(e, 'science')} className="hover:text-white transition-colors uppercase tracking-widest">Scientific Disclaimer</a></li>
                 <li><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" className="hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">Google API Policy <ExternalLink size={10} /></a></li>
               </ul>
            </div>

            <div className="space-y-8">
               <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">System Pulse</h4>
               <div className="p-6 bg-white/[0.02] border border-white/5 rounded-[2rem] space-y-4">
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-600 uppercase">Neural Core</span>
                     <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-2">
                        <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Nominal
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[9px] font-black text-slate-600 uppercase">Edge Gate</span>
                     <span className="text-[9px] font-black text-indigo-400 uppercase">Stable v2.8</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
             <div className="flex flex-col items-center md:items-start gap-2">
                <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-slate-400">@2026 SomnoAI Digital Sleep Lab • Official Ingress</p>
                <p className="text-[8px] font-black uppercase text-slate-600 tracking-[0.2em] italic">Built for performance in Penang, Malaysia.</p>
             </div>
             <div className="flex items-center gap-2 text-indigo-400 px-6 py-2 bg-indigo-500/5 rounded-full border border-indigo-500/10">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black uppercase tracking-widest italic">Identity Verification Active</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
