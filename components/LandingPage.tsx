import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, 
  ArrowRight, LogIn, Command, BrainCircuit, Cpu, X, Menu, Target,
  Microscope, Sparkles, Database, Lock, Mail, Globe, LifeBuoy, Copy, Check, Newspaper,
  ChevronRight, Calendar, FlaskConical, Binary, Layers, Waves, Play, Pause, AlertCircle, Terminal
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
        opacity: [0.1, 0.15, 0.1],
        scale: [1, 1.02, 1]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[140vw] h-screen bg-indigo-600/5 blur-[120px] rounded-full"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
  </div>
);

const SectionHeading = ({ title, sub, align = 'center' }: { title: string, sub: string, align?: 'center' | 'left' }) => (
  <div className={`space-y-4 mb-16 ${align === 'center' ? 'text-center' : 'text-left'}`}>
    <div className={`inline-flex items-center gap-3 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full ${align === 'center' ? 'mx-auto' : ''}`}>
      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
      <span className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.4em] italic">{sub}</span>
    </div>
    <h2 className="text-4xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-none">{title}</h2>
  </div>
);

/**
 * Enhanced Visual Stream with Global Compatibility
 */
const VisualStream = ({ isVideoLoaded, videoError, videoRef, onLoaded, onError }: any) => (
  <div className="absolute inset-0 z-0">
    <div className="absolute inset-0 bg-[#020617] -z-20" />
    
    {/* Cinematic Grid Base */}
    <div className="absolute inset-0 opacity-30 pointer-events-none">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
       <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>

    {/* Primary Video Node with aggressive mobile compatibility */}
    {!videoError && (
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        playsInline 
        webkit-playsinline="true"
        x5-video-player-type="h5"
        preload="auto"
        onLoadedData={onLoaded}
        onError={onError}
        className={`w-full h-full object-cover transition-opacity duration-[2000ms] ${isVideoLoaded ? 'opacity-60' : 'opacity-0'}`}
      >
        <source src="https://assets.mixkit.co/videos/preview/mixkit-waves-of-blue-and-purple-light-moving-slowly-34533-large.mp4" type="video/mp4" />
      </video>
    )}

    {/* Neural Pulse Fallback */}
    <AnimatePresence>
      {(videoError || !isVideoLoaded) && (
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <m.div 
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-[80vw] h-[80vw] bg-indigo-600/10 rounded-full blur-[120px]"
          />
        </m.div>
      )}
    </AnimatePresence>
    
    <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-[#01040a]/70" />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const t = translations[lang].landing;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Aggressive Playback Attempt
  const attemptPlayback = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.debug("Playback intercepted by browser policy. Awaiting user interaction.");
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    attemptPlayback();
    // Re-attempt if data loaded
    if (videoLoaded) attemptPlayback();
  }, [videoLoaded]);

  const togglePlayback = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const infrastructureLinks = [
    { label: 'SCIENTIFIC SCIENCE', view: 'science' },
    { label: 'LAB FAQ', view: 'faq' },
    { label: 'ABOUT PROJECT', view: 'about' },
    { label: 'TECH SUPPORT', view: 'support' },
  ];

  const navLinks = [
    { label: t.nav.science, view: 'science' },
    { label: t.nav.news, view: 'news' },
    { label: t.nav.project, view: 'about' },
    { label: t.nav.support, view: 'support' },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans overflow-x-hidden relative flex flex-col">
      <NeuralBackground />

      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-10 md:px-12 ${scrolled ? 'bg-[#01040a]/90 backdrop-blur-2xl py-6 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={44} animated={true} />
            <div className="flex flex-col text-left">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
                <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-600 mt-1.5">Digital Restoration Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-14">
            {navLinks.map((link) => (
              <button 
                key={link.view} 
                onClick={() => onNavigate(link.view)}
                className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.3em] uppercase italic relative group"
              >
                {link.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-indigo-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <div className="flex items-center gap-8">
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('login')}
              className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all italic flex items-center gap-3 shadow-xl"
            >
              <LogIn size={14} /> {t.nav.enter}
            </m.button>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(true)}><Menu size={32} /></button>
          </div>
        </div>
      </nav>

      {/* Hero Sector */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center pt-32 pb-24 overflow-hidden">
        <m.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          className="w-full max-w-7xl relative"
        >
          <div 
            onClick={() => !isPlaying && togglePlayback()}
            className="relative w-full aspect-video md:aspect-[21/9] rounded-[4rem] md:rounded-[6rem] overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] border border-white/10 group cursor-pointer"
          >
            
            <VisualStream 
              videoRef={videoRef}
              isVideoLoaded={videoLoaded}
              videoError={videoError}
              onLoaded={() => setVideoLoaded(true)}
              onError={() => setVideoError(true)}
            />

            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 space-y-12 z-10">
               <m.div 
                 initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                 className="space-y-4"
               >
                  <div className="inline-flex items-center gap-4 px-6 py-2.5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl">
                    <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">
                      {!isPlaying ? 'SYSTEM_IDLE' : 'Neural Synthesis ACTIVE'}
                    </span>
                  </div>
                  <h1 className="text-[4.5rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] font-black italic tracking-tighter text-white uppercase leading-[0.75] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                    Engineer<br/><span className="text-indigo-500">Recovery</span>
                  </h1>
               </m.div>

               <m.div 
                 initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1, duration: 0.8 }}
                 className="flex flex-col sm:flex-row items-center gap-8"
               >
                  <m.button 
                    whileHover={{ scale: 1.05, y: -6 }} whileTap={{ scale: 0.98 }}
                    onClick={() => onNavigate('signup')}
                    className="px-14 py-8 bg-white text-black rounded-full font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_40px_80px_rgba(255,255,255,0.1)] transition-all italic flex items-center justify-center gap-4 active:scale-95"
                  >
                    {t.ctaPrimary} <ArrowRight size={20} />
                  </m.button>
                  <button 
                    onClick={togglePlayback}
                    className="px-14 py-8 bg-black/40 backdrop-blur-2xl border border-white/10 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4 shadow-2xl hover:bg-black/60 relative group"
                  >
                    {!isPlaying && (
                      <m.div 
                        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1.2, opacity: [0, 0.4, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-white rounded-full"
                      />
                    )}
                    {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
                    {isPlaying ? 'PAUSE PROTOCOL' : 'WATCH PROTOCOL'}
                  </button>
               </m.div>
            </div>
          </div>

          <m.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
            className="mt-16 text-xl md:text-2xl text-slate-500 font-bold italic max-w-4xl mx-auto leading-relaxed px-6"
          >
             {t.heroSubtitle}
          </m.p>
        </m.div>
      </section>

      {/* Pillars Sector */}
      <section className="relative z-10 py-52 px-6 max-w-[1500px] mx-auto w-full">
         <SectionHeading title="Neural Framework" sub="Core Scientific Protocols" />
         <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: BrainCircuit, title: lang === 'zh' ? '神经合成引擎' : 'Neural Synthesis', desc: lang === 'zh' ? '基于 Gemini 2.5 Pro，解析深度睡眠与 REM 阶段的微小生理波动。' : 'Leveraging Gemini 2.5 Pro to decode micro-oscillations in restorative architecture.', id: 'NODE_0x01' },
              { icon: Lock, title: lang === 'zh' ? '边缘主权架构' : 'Edge Sovereignty', desc: lang === 'zh' ? '生物原始数据永不离开终端。全量分析均在本地浏览器会话中闭环。' : 'Raw biological data never leaves your device. All synthesis occurs in local sessions.', id: 'NODE_0x02' },
              { icon: Waves, title: lang === 'zh' ? '多维遥测同步' : 'Telemetry Sync', desc: lang === 'zh' ? '无缝桥接 Health Connect 与 Google Fit，获取高精度实验室级生理基准。' : 'Seamless bridge for Health Connect and Google Fit for clinical-grade baselines.', id: 'NODE_0x03' }
            ].map((pillar) => (
              <GlassCard key={pillar.id} className="p-14 rounded-[4.5rem] border-white/5 bg-slate-950/50 space-y-12 group" intensity={1.4}>
                 <div className="flex justify-between items-start">
                    <div className="p-5 bg-indigo-500/10 rounded-3xl text-indigo-400 border border-indigo-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-inner">
                       <pillar.icon size={36} />
                    </div>
                    <span className="text-[10px] font-mono text-slate-800 font-black tracking-widest">{pillar.id}</span>
                 </div>
                 <div className="space-y-6">
                    <h3 className="text-3xl font-black italic text-white uppercase tracking-tight leading-none">{pillar.title}</h3>
                    <p className="text-base text-slate-500 leading-relaxed italic font-medium opacity-90">{pillar.desc}</p>
                 </div>
              </GlassCard>
            ))}
         </div>
      </section>

      {/* Infrastructure Links Sector */}
      <section className="relative z-10 bg-black/60 border-y border-white/5 py-16 md:py-24 backdrop-blur-3xl shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-6 text-center">
          <div className="flex flex-wrap items-center justify-center md:justify-around gap-y-12 gap-x-20">
            {infrastructureLinks.map((link) => (
              <m.button
                key={link.view}
                whileHover={{ scale: 1.05, color: '#818cf8' }}
                onClick={() => onNavigate(link.view)}
                className="text-2xl md:text-3xl font-black text-slate-500 hover:text-indigo-400 transition-all tracking-[0.25em] uppercase italic whitespace-nowrap drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                {link.label}
              </m.button>
            ))}
          </div>
        </div>
      </section>

      {/* Research Hub Intersection */}
      <section className="relative z-10 py-52 px-6 max-w-[1500px] mx-auto w-full">
         <SectionHeading title="Research Hub" sub="Validated Biometric Insights" align="left" />
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8">
               <GlassCard onClick={() => onNavigate('news')} className="p-20 rounded-[6rem] border-indigo-500/20 bg-indigo-600/[0.03] cursor-pointer group relative overflow-hidden" intensity={1.8}>
                  <div className="absolute top-0 right-0 p-20 opacity-[0.04] text-indigo-400 group-hover:rotate-12 group-hover:scale-110 transition-all duration-1000 pointer-events-none">
                    <Binary size={500} strokeWidth={0.5} />
                  </div>
                  <div className="space-y-12 relative z-10">
                     <div className="flex items-center gap-5">
                        <span className="px-5 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-xl">FEATURED REPORT</span>
                     </div>
                     <h3 className="text-6xl md:text-[5.5rem] font-black italic text-white uppercase tracking-tighter leading-[0.9]">
                        How AI helps<br/><span className="text-indigo-600 group-hover:text-white transition-colors">optimize recovery?</span>
                     </h3>
                     <div className="pt-10 flex items-center gap-8 text-white text-[13px] font-black uppercase tracking-[0.5em] italic group-hover:translate-x-6 transition-transform">
                        Access Full Publication <ArrowRight size={24} />
                     </div>
                  </div>
               </GlassCard>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-8">
               <GlassCard className="p-12 rounded-[4rem] border-white/5 flex-1 bg-slate-950/60 space-y-8 hover:bg-slate-900 transition-colors">
                  <div className="p-4 bg-white/5 rounded-2xl text-slate-600 w-fit"><FlaskConical size={24} /></div>
                  <h4 className="text-2xl font-black italic text-white uppercase tracking-tight">Decoded: The REM Paradox</h4>
                  <p className="text-sm text-slate-500 leading-relaxed italic font-medium">New telemetry suggests REM phases are critical for cognitive problem solving.</p>
               </GlassCard>
               <button onClick={() => onNavigate('news')} className="w-full py-12 bg-slate-950 border border-white/10 rounded-[4rem] text-slate-500 hover:text-indigo-400 font-black text-xs uppercase tracking-[0.6em] italic flex items-center justify-center gap-5 shadow-2xl active:scale-98">
                 View Index Archive <Layers size={20} />
               </button>
            </div>
         </div>
      </section>

      {/* Sync Execution Section */}
      <section className="relative z-10 py-72 px-6 text-center overflow-hidden">
         <m.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} className="max-w-5xl mx-auto space-y-16 relative z-10">
            <h2 className="text-7xl md:text-[10rem] font-black italic text-white uppercase tracking-tighter leading-[0.85]">Ready for<br/><span className="text-indigo-600">Sync?</span></h2>
            <m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('signup')} className="px-24 py-12 bg-white text-slate-950 rounded-full font-black text-base uppercase tracking-[0.8em] shadow-[0_60px_120px_-20px_rgba(255,255,255,0.15)] transition-all italic active:scale-90">
               Execute Protocol
            </m.button>
         </m.div>
      </section>

      <AnimatePresence>
        {mobileMenuOpen && (
          <m.div initial={{ opacity: 0, x: '100%' }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: '100%' }} className="fixed inset-0 z-[200] bg-[#010409] p-16 flex flex-col gap-20 backdrop-blur-3xl">
            <div className="flex justify-between items-center">
              <Logo size={70} />
              <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 p-5 bg-white/5 rounded-full active:scale-90 transition-all"><X size={36} /></button>
            </div>
            <div className="flex flex-col gap-12 text-left">
              {navLinks.map((link) => (
                <button key={link.view} onClick={() => { onNavigate(link.view); setMobileMenuOpen(false); }} className="text-6xl font-black italic uppercase tracking-tighter hover:text-indigo-400 transition-all">{link.label}</button>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>

      <footer className="relative z-10 px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-50 border-t border-white/5 bg-[#01040a]">
        <div className="flex items-center gap-5">
          <Logo size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-600">@2026 SomnoAI Restoration Lab</span>
        </div>
        <div className="flex items-center gap-5 px-8 py-3 bg-indigo-500/5 border border-indigo-500/20 rounded-full shadow-inner">
          <ShieldCheck size={16} className="text-indigo-400" />
          <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Secure Neural Pipeline: Edge_v2.9</span>
        </div>
      </footer>
    </div>
  );
};