
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, ShieldCheck, Activity, 
  ArrowRight, LogIn, Command, BrainCircuit, Cpu, X, Menu, Target,
  Microscope, Sparkles, Database, Lock, Mail, Globe, LifeBuoy, Copy, Check, Newspaper,
  ChevronRight, Calendar, FlaskConical, Binary, Layers, Waves, Play, Pause, AlertCircle, Terminal,
  Loader2, MessageCircle, ArrowUpRight
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

const VisualStream = ({ isVideoLoaded, videoError, onLoaded }: any) => (
  <div className="absolute inset-0 z-0 overflow-hidden">
    <div className="absolute inset-0 bg-[#020617] -z-20" />
    
    <div className="absolute inset-0 opacity-30 pointer-events-none z-10">
       <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15),transparent_70%)]" />
       <div className="w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:80px_80px]" />
    </div>

    {!videoError && (
      <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${isVideoLoaded ? 'opacity-50' : 'opacity-0'}`}>
        <iframe 
          src="https://www.youtube.com/embed/V_6FAQhJX8Y?autoplay=1&mute=1&loop=1&playlist=V_6FAQhJX8Y&controls=0&modestbranding=1&rel=0&iv_load_policy=3&showinfo=0&disablekb=1&enablejsapi=1"
          className="absolute top-1/2 left-1/2 w-160vw h-160vh -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ border: 'none' }}
          allow="autoplay; encrypted-media"
          onLoad={onLoaded}
        />
      </div>
    )}

    <AnimatePresence>
      {(videoError || !isVideoLoaded) && (
        <m.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
             <m.div 
               animate={{ 
                 scale: [1, 1.1, 1],
                 opacity: [0.3, 0.5, 0.3]
               }}
               transition={{ duration: 4, repeat: Infinity }}
               className="w-[60vw] h-[60vw] bg-indigo-600/10 rounded-full blur-[120px] absolute"
             />
             <Loader2 size={32} className="text-indigo-500 animate-spin opacity-20" />
             <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.8em] opacity-40">Connecting Neural Stream...</span>
          </div>
        </m.div>
      )}
    </AnimatePresence>
    
    <div className="absolute inset-0 bg-gradient-to-t from-[#01040a] via-transparent to-[#01040a]/70 z-10" />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const t = translations[lang].landing;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openProtocolVideo = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    window.open('https://www.youtube.com/shorts/V_6FAQhJX8Y', '_blank');
  };

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
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => onNavigate('/')}>
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
          </div>
        </div>
      </nav>

      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 text-center pt-32 pb-24 overflow-hidden">
        <m.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }}
          className="w-full max-w-7xl relative"
        >
          <div 
            onClick={openProtocolVideo}
            className="relative w-full aspect-video md:aspect-[21/9] rounded-[4rem] md:rounded-[6rem] overflow-hidden shadow-[0_100px_200px_-50px_rgba(0,0,0,1)] border border-white/10 group cursor-pointer"
          >
            
            <VisualStream 
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
                    <div className={`w-2.5 h-2.5 rounded-full ${videoLoaded ? 'bg-indigo-500 animate-pulse' : 'bg-amber-500 shadow-[0_0_10px_#f59e0b]'}`} />
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">
                      {!videoLoaded ? 'CONNECTING GRID' : 'Neural Intelligence v2.8 ACTIVE'}
                    </span>
                  </div>
                  <h1 className="text-[4.5rem] sm:text-[8rem] md:text-[10rem] lg:text-[13rem] font-black italic tracking-tighter text-white uppercase leading-[0.75] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                    Analyze.<br/><span className="text-indigo-500">Optimize.</span><br/>Recover.
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
                    onClick={openProtocolVideo}
                    className="px-14 py-8 bg-black/40 backdrop-blur-2xl border border-white/10 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4 shadow-2xl hover:bg-black/60 relative group pointer-events-auto"
                  >
                    <Play size={18} fill="currentColor" />
                    WATCH PROTOCOL
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

      {/* Laboratory Community Section - Community Centric Design */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-16 md:p-24 rounded-[5rem] md:rounded-[7rem] border-indigo-500/20 bg-indigo-600/[0.02] flex flex-col md:flex-row items-center gap-16 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative shrink-0">
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] md:rounded-[4rem] bg-slate-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                  <MessageCircle size={64} className="md:size-24 group-hover:scale-110 transition-transform" />
               </div>
               <m.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border border-dashed border-indigo-500/20 rounded-full" />
            </div>
            <div className="space-y-8 flex-1 text-center md:text-left relative z-10">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">JOIN THE <span className="text-indigo-400">RESEARCH COMMUNITY</span></h2>
                  <div className="space-y-2">
                    <p className="text-xl text-slate-200 font-bold italic">
                      🚀 Join the SomnoAI Digital Sleep Lab Blog community on Discord!
                    </p>
                    <p className="text-lg text-slate-500 font-medium italic leading-relaxed max-w-xl">
                      💬 Discuss the latest articles, share ideas, and select your favorite topics with other research subjects.
                    </p>
                  </div>
               </div>
               <a 
                 href="https://discord.com/invite/9EXJtRmju" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 italic items-center gap-4"
               >
                 👉 CLICK TO JOIN <ArrowUpRight size={18} />
               </a>
            </div>
          </GlassCard>
        </div>
      </section>

      <footer className="relative z-10 px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-50 border-t border-white/5 bg-[#01040a]">
        <div className="flex items-center gap-5">
          <Logo size={32} />
          <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-600">@2026 SomnoAI Restoration Lab</span>
        </div>
        <div className="flex items-center gap-10">
           <button onClick={() => onNavigate('privacy')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">Privacy</button>
           <button onClick={() => onNavigate('terms')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">Terms</button>
           <div className="flex items-center gap-5 px-8 py-3 bg-indigo-500/5 border border-indigo-500/20 rounded-full shadow-inner">
             <ShieldCheck size={16} className="text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Secure Neural Pipeline</span>
           </div>
        </div>
      </footer>
    </div>
  );
};
