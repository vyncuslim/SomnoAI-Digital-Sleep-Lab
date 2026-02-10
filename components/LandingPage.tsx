import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Moon, BrainCircuit, Activity, 
  ArrowRight, Lock, Microscope, Sparkles, LogIn, HeartPulse, Waves, 
  CheckCircle2, Menu, X, Globe, Mail, Github, Linkedin, ExternalLink, HelpCircle,
  Database, Fingerprint, Shield, Cpu, Layout, BarChart3, Binary, Share2,
  Monitor, Smartphone, UserPlus, Chrome, Radiation
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
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.8 }}
    viewport={{ once: true }}
    className="group h-full"
  >
    <GlassCard className="p-10 h-full rounded-[4rem] border-white/5 hover:border-indigo-500/30 transition-all duration-700 bg-white/[0.01] flex flex-col items-start text-left">
       <div className="p-4 bg-indigo-500/10 rounded-2xl w-fit mb-8 text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
          <Icon size={32} aria-hidden="true" />
       </div>
       <h3 className="text-2xl font-black italic text-white uppercase mb-4 tracking-tighter leading-none">{title}</h3>
       <p className="text-slate-500 text-sm leading-relaxed italic font-medium">{desc}</p>
    </GlassCard>
  </m.article>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const isZh = lang === 'zh';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { label: isZh ? '科学原理' : 'Scientific Protocol', view: 'science' },
    { label: isZh ? '常见问题' : 'Laboratory FAQ', view: 'faq' },
    { label: isZh ? '关于项目' : 'About Project', view: 'about' },
    { label: isZh ? '技术支持' : 'System Support', view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 overflow-x-hidden font-sans selection:bg-indigo-500/30">
      {/* 1. ULTRA-SLEEK FLOATING HEADER */}
      <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-8" role="banner">
        <div className="max-w-7xl mx-auto">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 rounded-full px-10 py-5 flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
              <Logo size={36} animated={true} />
              <div className="flex flex-col text-left">
                <span className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none group-hover:text-indigo-400 transition-colors">SomnoAI</span>
                <span className="text-[7px] font-black tracking-[0.6em] uppercase text-indigo-400/60 leading-none mt-1">{isZh ? '数字化实验室' : 'Digital Lab'}</span>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center gap-14" role="navigation">
              {navLinks.map((link) => (
                <button 
                  key={link.view} 
                  onClick={() => handleNav(link.view)} 
                  className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-500 hover:text-white transition-all relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 w-0 h-[1.5px] bg-indigo-500 group-hover:w-full transition-all duration-500" />
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button 
                onClick={() => handleNav('login')}
                className="px-8 py-3.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2"
              >
                <LogIn size={14} className="text-indigo-400" /> {isZh ? '登录' : 'Enter'}
              </button>
              <button 
                onClick={() => handleNav('signup')}
                className="hidden sm:flex px-8 py-3.5 rounded-full bg-indigo-600 text-[9px] font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all active:scale-95 items-center gap-2 shadow-[0_10px_25px_rgba(79,70,229,0.3)]"
              >
                <UserPlus size={14} /> {isZh ? '注册' : 'Link'}
              </button>
              <button className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors" aria-label="Toggle Menu" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
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
            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-[#01040a] p-10 lg:hidden flex flex-col"
          >
            <div className="flex justify-between items-center mb-20">
              <Logo size={44} />
              <button onClick={() => setMobileMenuOpen(false)} className="p-4 bg-white/5 rounded-[1.5rem] text-slate-400 active:scale-90 transition-all">
                <X size={32} />
              </button>
            </div>
            <div className="flex flex-col gap-12 flex-1">
              {navLinks.map((link) => (
                <button 
                  key={link.view} 
                  onClick={() => handleNav(link.view)} 
                  className="text-5xl font-black uppercase italic text-left text-white tracking-tighter"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <button 
              onClick={() => handleNav('signup')}
              className="w-full py-8 rounded-[3rem] bg-indigo-600 text-white font-black uppercase tracking-widest text-sm shadow-[0_25px_50px_rgba(79,70,229,0.4)] active:scale-95 transition-all text-center"
            >
              {isZh ? '初始化神经链路' : 'Initialize Neural Link'}
            </button>
          </m.nav>
        )}
      </AnimatePresence>

      <main>
        {/* 3. HERO: RESEARCH TERMINAL VIBE */}
        <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-40 pb-24 text-center overflow-hidden">
          <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[160vw] h-[100vh] bg-indigo-600/10 blur-[200px] rounded-full animate-pulse" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05] mix-blend-soft-light" />
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-[#01040a] to-transparent" />
          </div>

          <m.div 
            initial={{ opacity: 0, y: 40 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "circOut" }}
            className="space-y-16 relative z-10 max-w-7xl mx-auto w-full px-6 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-4 px-8 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-4 shadow-2xl backdrop-blur-md">
               <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
               <span className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-300 italic">
                 {isZh ? '神经智能协议 v2.85 运行中' : 'Neural Core v2.85: Active'}
               </span>
            </div>

            <div className="space-y-12">
              <h1 className="text-7xl md:text-9xl lg:text-[13rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {isZh ? '重构您的' : 'ENGINEER'} <br/>
                <span className="text-indigo-500">{isZh ? '夜间潜能' : 'RECOVERY'}</span>
              </h1>
              <p className="text-2xl md:text-3xl lg:text-4xl text-slate-300 font-medium italic max-w-5xl mx-auto leading-tight text-balance opacity-90">
                {isZh 
                  ? '它将生理指标监控、AI 深度洞察与健康建议融为一体，为用户提供全方位的数字化睡眠实验室体验。' 
                  : 'Advanced sleep architecture analysis. SomnoAI integrates wearable telemetry with Google Gemini AI to reconstruct your restoration window.'}
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-12 pt-8">
              <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
                <button 
                  onClick={() => authApi.signInWithGoogle()}
                  className="w-full md:w-auto px-16 py-9 bg-white text-black rounded-full font-black text-[14px] uppercase tracking-[0.4em] shadow-[0_25px_60px_rgba(255,255,255,0.2)] transition-all hover:scale-105 hover:bg-slate-50 active:scale-95 italic flex items-center justify-center gap-5"
                >
                  <Chrome size={24} /> {isZh ? '使用 Google 登录' : 'Auth with Google'}
                </button>
                <button 
                  onClick={() => handleNav('login')}
                  className="w-full md:w-auto px-16 py-9 bg-white/5 hover:bg-white/10 text-slate-300 rounded-full font-black text-[14px] uppercase tracking-[0.4em] border border-white/10 transition-all active:scale-95 italic flex items-center justify-center gap-4 shadow-2xl backdrop-blur-3xl"
                >
                  <LogIn size={22} /> {isZh ? '进入实验室' : 'Open Laboratory'}
                </button>
              </div>
              
              <div className="pt-24 flex flex-wrap items-center justify-center gap-20 opacity-30 grayscale hover:grayscale-0 transition-all duration-1000">
                 <div className="flex items-center gap-4">
                    <Logo size={28} staticMode={true} />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">Powered by Gemini</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <ShieldCheck size={26} />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">{isZh ? '官方节点' : 'Official Node'}</span>
                 </div>
                 <div className="flex items-center gap-4">
                    <Fingerprint size={26} />
                    <span className="text-[11px] font-black uppercase tracking-[0.5em]">{isZh ? '隐私优先' : 'Privacy Edge'}</span>
                 </div>
              </div>
            </div>
          </m.div>
        </section>

        {/* 4. LABORATORY PREVIEW: BENTO GRID DASHBOARD */}
        <section className="py-32 px-6 max-w-7xl mx-auto">
           <m.div 
             initial={{ opacity: 0, scale: 0.98 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             transition={{ duration: 1.2 }}
             className="relative"
           >
              <GlassCard className="p-3 md:p-6 rounded-[5rem] border-white/10 shadow-[0_120px_200px_-50px_rgba(0,0,0,1)] bg-[#050a1f]/95 overflow-hidden group">
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                 
                 {/* Top Status Bar */}
                 <div className="bg-black/40 rounded-[4rem] px-12 py-8 mb-4 flex flex-wrap items-center justify-between border border-white/5">
                    <div className="flex items-center gap-8">
                       <div className="flex items-center gap-4">
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_#10b981]" />
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-emerald-400 italic">
                             {isZh ? '神经连接：稳定' : 'Link: Nominal'}
                          </span>
                       </div>
                       <div className="h-4 w-px bg-slate-800" />
                       <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-600 italic">
                         Latent: 12ms
                       </span>
                    </div>
                    <div className="flex gap-6 opacity-40">
                       <Monitor size={18} />
                       <Smartphone size={18} />
                       <Share2 size={18} />
                    </div>
                 </div>

                 {/* Bento Grid Layout */}
                 <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="bg-slate-900/60 rounded-[4rem] p-16 border border-white/5 min-h-[500px] flex flex-col justify-between group/card relative overflow-hidden text-left">
                          <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-white"><Radiation size={200} /></div>
                          <span className="text-[11px] font-black uppercase tracking-[0.5em] text-indigo-400 italic relative z-10">
                            {isZh ? '恢复评分' : 'Restoration Score'}
                          </span>
                          <div className="text-[180px] font-black italic tracking-tighter text-white leading-none group-hover/card:scale-105 transition-transform duration-1000 relative z-10">88</div>
                          <div className="flex items-center gap-4 relative z-10">
                             <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500"><CheckCircle2 size={24} /></div>
                             <span className="text-[12px] font-black uppercase text-slate-500 tracking-widest italic">
                               {isZh ? '深度修复完成' : 'Deep Restoration: Complete'}
                             </span>
                          </div>
                       </div>

                       <div className="bg-slate-900/60 rounded-[4rem] p-16 border border-white/5 min-h-[500px] flex flex-col justify-between group/card relative overflow-hidden text-left">
                          <div className="space-y-12 relative z-10">
                             <div className="flex justify-between items-center">
                                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500 italic">
                                  {isZh ? '神经分期' : 'Neural Staging'}
                                </span>
                                <Activity size={28} className="text-indigo-500" />
                             </div>
                             <div className="space-y-6">
                                {[70, 45, 90].map((w, i) => (
                                  <div key={i} className="space-y-2">
                                     <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                                        <m.div 
                                          initial={{ width: 0 }} 
                                          whileInView={{ width: `${w}%` }} 
                                          transition={{ duration: 2, delay: i * 0.2 }}
                                          className={`h-full ${i === 0 ? 'bg-indigo-600' : i === 1 ? 'bg-cyan-500' : 'bg-purple-500'}`} 
                                        />
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          <p className="text-sm text-slate-500 italic leading-relaxed pt-10 border-t border-white/5 relative z-10">
                             {isZh 
                               ? '"AI 精准解构深睡、REM 与浅睡节奏。"' 
                               : '"AI reconstruction of restorative cycles (Deep, REM, Light)."'}
                          </p>
                       </div>
                    </div>

                    <div className="lg:col-span-4 space-y-4">
                       <div className="bg-indigo-600/10 rounded-[4rem] p-12 border border-indigo-500/20 h-full flex flex-col justify-center gap-12 group/card text-left">
                          <div className="p-5 bg-indigo-600 rounded-[2rem] w-fit text-white shadow-[0_0_40px_rgba(79,70,229,0.5)] group-hover/card:rotate-12 transition-transform duration-700">
                             <BrainCircuit size={40} />
                          </div>
                          <div className="space-y-6">
                             <h4 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">{isZh ? 'Gemini 智能' : 'Neural Core'}</h4>
                             <p className="text-slate-400 text-sm italic font-medium leading-relaxed">
                               {isZh 
                                 ? '利用 Google Gemini 的高级推理能力，深度解密每一个睡眠周期背后的成因。' 
                                 : 'Leveraging Google Gemini\'s advanced reasoning to decrypt the patterns behind every stage.'}
                             </p>
                          </div>
                       </div>
                    </div>
                 </div>
              </GlassCard>
           </m.div>
        </section>

        {/* 5. LABORATORY PROTOCOL */}
        <section className="py-40 px-6 max-w-7xl mx-auto space-y-24">
           <div className="text-center space-y-6">
              <h2 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter">
                {isZh ? '实验室' : 'THE LAB'} <span className="text-indigo-500">{isZh ? '协议' : 'PROTOCOL'}</span>
              </h2>
              <p className="text-slate-500 uppercase tracking-[0.5em] font-black text-[12px] italic">
                From Biometric Telemetry to Human Transformation
              </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <FeatureCard 
                icon={Activity}
                title={isZh ? "1. 生物特征接入" : "1. BIOMETRIC INGRESS"}
                desc={isZh ? "通过 Health Connect 同步数据，或通过手动终端注入。支持所有主流传感器协议。" : "Sync via Health Connect or use our injection terminal. Multi-sensor infrastructure."}
                delay={0.1}
              />
              <FeatureCard 
                icon={BrainCircuit}
                title={isZh ? "2. 神经模型合成" : "2. NEURAL SYNTHESIS"}
                desc={isZh ? "利用 Google Gemini 尖端模型识别深睡效率与 REM 节奏，精确解构您的恢复架构。" : "Leverage Google Gemini neural models to identify deep sleep efficiency and rhythms."}
                delay={0.2}
              />
              <FeatureCard 
                icon={Sparkles}
                title={isZh ? "3. 精准优化建议" : "3. PRECISION ACTION"}
                desc={isZh ? "获取量身定制的方案，锁定破坏因素，将每一次休息转化为高性能能量储备。" : "Receive tailored protocols to transform every rest into an energy reserve."}
                delay={0.3}
              />
           </div>
        </section>

        {/* 6. TESTIMONIAL: IDENTITY REGISTRY */}
        <section className="py-20 bg-[#020617]/50 border-y border-white/[0.03]">
           <div className="max-w-7xl mx-auto px-6 flex justify-center">
              <GlassCard className="p-16 rounded-[5rem] border-white/5 bg-black/60 overflow-hidden relative max-w-4xl" intensity={2}>
                 <div className="absolute top-0 left-0 p-12 opacity-[0.02] text-white"><Moon size={400} /></div>
                 <div className="space-y-12 relative z-10 text-left">
                    <div className="flex items-center gap-5">
                       <Microscope size={28} className="text-indigo-400" />
                       <h3 className="text-[12px] font-black uppercase text-white tracking-[0.5em] italic">
                         {isZh ? '受试者反馈' : 'LAB REPORT #2481'}
                       </h3>
                    </div>
                    <p className="text-4xl font-black italic text-indigo-300 leading-[1.1] tracking-tighter">
                      {isZh 
                        ? '"这是首个向我解释为什么我的深睡会支离破碎的系统，而不仅仅是给我一个数字。"' 
                        : '"The first system that explains WHY deep sleep was fragmented instead of just giving me a generic score."'}
                    </p>
                    <div className="flex items-center gap-6">
                       <div className="w-20 h-20 rounded-[2.2rem] bg-indigo-600 flex items-center justify-center text-white font-black italic text-2xl shadow-2xl">S</div>
                       <div>
                          <p className="text-xl font-black text-white uppercase tracking-widest italic">{isZh ? '受试者 #2481' : 'Subject #2481'}</p>
                          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest italic">{isZh ? '早期研究访问者' : 'Beta Research Group'}</p>
                       </div>
                    </div>
                 </div>
              </GlassCard>
           </div>
        </section>

        {/* 7. FINAL CTA: ESTABLISH LINK */}
        <section className="py-56 text-center px-6 relative overflow-hidden">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[100vw] bg-indigo-500/[0.07] blur-[150px] rounded-full animate-pulse" />
           <m.div 
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true }}
             className="space-y-20 relative z-10"
           >
              <div className="space-y-6">
                <h2 className="text-7xl md:text-[11rem] font-black italic tracking-tighter text-white uppercase leading-none">
                  {isZh ? '准备好' : 'READY TO'} <br/><span className="text-indigo-500">{isZh ? '重构了吗？' : 'RECONSTRUCT?'}</span>
                </h2>
                <p className="text-[12px] md:text-[16px] text-slate-500 font-mono font-bold uppercase tracking-[0.6em] italic">
                   No Specialized Hardware Required • Neural Core Ready
                </p>
              </div>
              <div className="flex justify-center">
                 <button 
                   onClick={() => handleNav('signup')}
                   className="px-24 py-12 bg-white text-indigo-950 rounded-full font-black text-[16px] uppercase tracking-[0.5em] shadow-[0_50px_100px_rgba(255,255,255,0.15)] hover:scale-105 active:scale-95 transition-all italic flex items-center gap-6 text-center group"
                 >
                   {isZh ? '建立神经链路' : 'Establish Link'} <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                 </button>
              </div>
           </m.div>
        </section>
      </main>

      {/* 8. INSTITUTIONAL FOOTER */}
      <footer className="bg-[#020408] border-t border-white/[0.03] pt-40 pb-20 px-8 text-left" role="contentinfo">
        <div className="max-w-7xl mx-auto space-y-32">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-24">
            <div className="space-y-12">
               <div className="flex items-center gap-4">
                  <Logo size={44} />
                  <span className="text-3xl font-black italic tracking-tighter text-white uppercase">SomnoAI</span>
               </div>
               <p className="text-sm text-slate-500 italic font-medium leading-relaxed max-w-xs opacity-60">
                 {isZh 
                   ? '致力于修复科学与高性能状态重建。采用神经精密技术。' 
                   : 'Dedicated to the science of recovery and high-performance restoration. Built with neural precision.'}
               </p>
               <div className="flex gap-6">
                  {[
                    { icon: Linkedin, href: "https://www.linkedin.com/company/somnoai-digital-sleep-lab/", label: "LinkedIn" },
                    { icon: Github, href: "https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab", label: "GitHub" },
                    { icon: Mail, href: "mailto:contact@sleepsomno.com", label: "Email" }
                  ].map((social, i) => (
                    <a key={i} href={social.href} target="_blank" className="p-4 bg-white/[0.03] rounded-2xl text-slate-500 hover:text-white hover:bg-indigo-600 transition-all shadow-xl" aria-label={social.label}>
                      <social.icon size={22} />
                    </a>
                  ))}
               </div>
            </div>
            
            <div className="space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-400">{isZh ? '实验室索引' : 'LAB INDEX'}</h4>
               <ul className="space-y-6 text-sm font-bold text-slate-600 italic">
                 {navLinks.map(link => (
                   <li key={link.view}><button onClick={() => handleNav(link.view)} className="hover:text-white transition-all uppercase tracking-widest">{link.label}</button></li>
                 ))}
               </ul>
            </div>

            <div className="space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-400">{isZh ? '合规与法律' : 'LEGAL NODE'}</h4>
               <ul className="space-y-6 text-sm font-bold text-slate-600 italic">
                 <li><a href="/privacy" className="hover:text-white transition-all uppercase tracking-widest">{isZh ? '隐私权政策' : 'Privacy Policy'}</a></li>
                 <li><a href="/terms" className="hover:text-white transition-all uppercase tracking-widest">{isZh ? '服务条款' : 'Terms Node'}</a></li>
                 <li><button onClick={() => handleNav('science')} className="hover:text-white transition-all uppercase tracking-widest">{isZh ? '科学免责声明' : 'Disclaimer'}</button></li>
                 <li><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" className="hover:text-white transition-all uppercase tracking-widest flex items-center gap-2">Google API Policy <ExternalLink size={12} /></a></li>
               </ul>
            </div>

            <div className="space-y-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.6em] text-indigo-400">{isZh ? '系统遥测' : 'TELEMETRY'}</h4>
               <div className="p-10 bg-white/[0.01] border border-white/[0.05] rounded-[3rem] space-y-8 shadow-inner">
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-700 uppercase">Core</span>
                     <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> {isZh ? '正常' : 'NOMINAL'}
                     </span>
                  </div>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black text-slate-700 uppercase">Latency</span>
                     <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">12ms</span>
                  </div>
               </div>
            </div>
          </div>

          <div className="pt-20 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-12 opacity-30">
             <div className="flex flex-col items-center md:items-start gap-3">
                <p className="text-[11px] font-mono uppercase tracking-[0.6em] text-slate-500">© 2026 SOMNOAI LAB • OFFICIAL RESEARCH TERMINAL</p>
                <p className="text-[10px] font-black uppercase text-slate-700 tracking-[0.3em] italic">Built for performance in Penang, Malaysia.</p>
             </div>
             <div className="flex items-center gap-4 text-indigo-400 px-10 py-3.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">{isZh ? '验证通道已加密' : 'VERIFIED CHANNEL'}</span>
             </div>
          </div>
        </div>
      </footer>
    </div>
  );
};