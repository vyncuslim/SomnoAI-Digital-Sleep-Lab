import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, LogIn, Command, ShieldCheck, Newspaper, FlaskConical, HelpCircle, Info, Play, Volume2, VolumeX, Activity, BrainCircuit, Zap, Microscope, LayoutGrid
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language | string;
  onNavigate: (view: string) => void;
}

const NeuralPulseBackground = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
    <m.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/30 blur-[180px] rounded-full"
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const t = translations[lang as Language].landing;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.science, view: 'science', icon: FlaskConical },
    { label: t.nav.news, view: 'news', icon: Newspaper },
    { label: t.nav.faq, view: 'faq', icon: HelpCircle },
    { label: t.nav.project, view: 'about', icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.08] mix-blend-overlay" />
      </div>

      {/* Modern Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-10 md:px-12 ${scrolled ? 'bg-[#01040a]/95 backdrop-blur-3xl py-6 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={46} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1.5">Digital Restoration Lab</span>
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

          <m.button 
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('login')}
            className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all italic flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]"
          >
            <LogIn size={14} /> {t.nav.enter}
          </m.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-56 pb-40 min-h-screen">
        <NeuralPulseBackground />
        
        <div className="max-w-7xl space-y-16 relative z-10">
          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full shadow-2xl"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Neural Engine v2.9 ACTIVE</span>
          </m.div>

          <div className="space-y-4">
            <m.h1 
              initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: "easeOut" }}
              className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-white italic tracking-tighter leading-[0.8] uppercase drop-shadow-2xl"
            >
              Engineer.
            </m.h1>
            <m.h1 
              initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
              className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[14rem] font-black text-indigo-600 italic tracking-tighter leading-[0.8] uppercase drop-shadow-[0_0_100px_rgba(79,70,229,0.3)]"
            >
              Recovery.
            </m.h1>
          </div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="max-w-4xl mx-auto">
            <p className="text-xl md:text-3xl text-slate-400 font-bold italic leading-relaxed border-l-4 border-indigo-600/30 pl-10 text-left md:text-center">
               {t.heroSubtitle}
            </p>
          </m.div>

          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
            <m.button 
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="px-20 py-8 bg-indigo-600 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_40px_80px_-20px_rgba(79,70,229,0.4)] transition-all hover:bg-indigo-700 italic flex items-center gap-4"
            >
              {t.ctaPrimary} <ArrowRight size={20} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('science')}
              className="px-16 py-8 bg-black/40 backdrop-blur-3xl border border-white/10 text-slate-300 rounded-full font-black text-[13px] uppercase tracking-[0.4em] transition-all hover:bg-black/60 italic flex items-center gap-4 active:scale-95 shadow-2xl"
            >
              <Command size={20} className="text-indigo-400" /> {t.ctaSecondary}
            </m.button>
          </m.div>
        </div>
      </section>

      {/* Core Bento Grid */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-6xl mx-auto space-y-24">
           <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-3 px-5 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-full">
                 <LayoutGrid size={14} className="text-indigo-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Core Lab Matrix</span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter">Unified <span className="text-indigo-400">Restoration</span></h2>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { key: 'telemetry', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                { key: 'synthesis', icon: BrainCircuit, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                { key: 'protocols', icon: Zap, color: 'text-emerald-400', bg: 'bg-emerald-400/10' }
              ].map((p, i) => (
                <GlassCard key={i} className="p-12 rounded-[4rem] border-white/5 bg-slate-950 hover:border-indigo-500/40 transition-all group" intensity={1.1}>
                   <div className={`w-20 h-20 rounded-[2rem] ${p.bg} ${p.color} flex items-center justify-center mb-10 group-hover:scale-110 transition-transform shadow-inner border border-white/5`}>
                      <p.icon size={36} />
                   </div>
                   <h3 className="text-2xl font-black italic text-white uppercase tracking-tight mb-4">{t.pillars[p.key].title}</h3>
                   <p className="text-sm text-slate-500 font-medium italic leading-relaxed">{t.pillars[p.key].desc}</p>
                </GlassCard>
              ))}
           </div>
        </div>
      </section>

      {/* Cinematic Showcase */}
      <section className="relative z-10 py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between gap-10 mb-16 px-4">
             <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-indigo-400">
                   <Microscope size={22} />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Telemetry Preview</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">Neural <span className="text-indigo-400">Synthesis</span></h2>
             </div>
             <p className="text-sm md:text-base text-slate-500 italic max-w-sm font-medium leading-relaxed border-l border-white/10 pl-8">
               Watch the synthesis process as raw biometric data is transformed into a high-fidelity sleep architecture.
             </p>
          </div>

          <GlassCard className="rounded-[4rem] md:rounded-[6rem] border-white/10 bg-black/60 overflow-hidden relative group aspect-video shadow-[0_100px_200px_-50px_rgba(0,0,0,1)]" intensity={0.5}>
             <video 
               ref={videoRef}
               src="https://r2.erweima.ai/v2/user/32688/veo/veo_ed0ca7f94da946059d2822a5598687a4.mp4" 
               className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-1000"
               autoPlay 
               muted={isVideoMuted} 
               loop 
               playsInline
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-transparent opacity-80" />
             
             <div className="absolute bottom-10 left-10 md:bottom-16 md:left-16 right-10 md:right-16 flex items-center justify-between z-20">
                <div className="flex items-center gap-6">
                   <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-2xl border border-white/20">
                      <Play size={24} fill="currentColor" />
                   </div>
                   <div className="space-y-1">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest italic leading-none">Protocol Handshake</p>
                      <div className="flex items-center gap-2">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <p className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest">SIGNAL_SYNC_0x9F</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={() => setIsVideoMuted(!isVideoMuted)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-all backdrop-blur-3xl border border-white/10 active:scale-90"
                >
                  {isVideoMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
             </div>
          </GlassCard>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 px-12 py-24 flex flex-col md:flex-row justify-between items-center gap-12 border-t border-white/5 bg-[#01040a] opacity-60">
        <div className="flex items-center gap-6">
          <Logo size={40} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-500">@2026 SomnoAI Laboratory Node</span>
            <div className="flex items-center gap-2 mt-1">
              <ShieldCheck size={12} className="text-indigo-500" />
              <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">End-to-End Encrypted Handshake</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10">
           <button onClick={() => onNavigate('opensource')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors underline decoration-indigo-500/20 underline-offset-8">ARCHITECTURE_ISO</button>
           <button onClick={() => onNavigate('privacy')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">PRIVACY_CORE</button>
           <button onClick={() => onNavigate('terms')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">TERMS_PROTO</button>
        </div>
      </footer>
    </div>
  );
};