import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowRight, LogIn, Command, MessageSquare, ShieldCheck, Newspaper, FlaskConical, HelpCircle, Info, MessageCircle, ArrowUpRight, Layers
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language | string;
  onNavigate: (view: string) => void;
}

const NeuralScanOverlay = () => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-10">
    <m.div 
      animate={{ y: ["0%", "100%", "0%"] }}
      transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
      className="w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-md"
    />
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)]" />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const t = translations[lang as Language].landing;
  const tl = translations[lang as Language].legal;

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
      {/* 极简实验室深色背景 */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.2]" />
        <m.div 
          animate={{ opacity: [0.1, 0.15, 0.1] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-screen bg-indigo-600/5 blur-[120px] rounded-full" 
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.12] mix-blend-overlay" />
      </div>

      {/* 顶部导航 */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-10 md:px-12 ${scrolled ? 'bg-[#01040a]/90 backdrop-blur-2xl py-6 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={44} animated={true} />
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

      {/* 主视觉 */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-32 pb-24 min-h-screen">
        <NeuralScanOverlay />
        
        <div className="max-w-7xl space-y-16 relative z-10">
          <m.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-4 px-6 py-2.5 bg-indigo-500/5 border border-indigo-500/20 rounded-full shadow-2xl"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Neural Intelligence v2.8 ACTIVE</span>
          </m.div>

          <m.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1 }} className="space-y-0 select-none">
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-white italic tracking-tighter leading-[0.82] uppercase drop-shadow-2xl">
              Analyze.
            </h1>
            <h1 className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-indigo-600 italic tracking-tighter leading-[0.82] uppercase drop-shadow-[0_0_80px_rgba(79,70,229,0.2)]">
              Recover.
            </h1>
          </m.div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="space-y-8">
            <p className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl mx-auto leading-relaxed border-l-2 border-indigo-500/20 pl-10 text-left md:text-center">
               {t.heroSubtitle}
            </p>
          </m.div>

          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
            <m.button 
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="px-16 py-8 bg-indigo-600 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_40px_80px_rgba(79,70,229,0.3)] transition-all hover:bg-indigo-700 italic flex items-center gap-4 active:scale-95"
            >
              {t.ctaPrimary} <ArrowRight size={20} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('science')}
              className="px-16 py-8 bg-black/40 backdrop-blur-2xl border border-white/10 text-slate-300 rounded-full font-black text-[13px] uppercase tracking-[0.4em] transition-all hover:bg-black/60 italic flex items-center gap-4 active:scale-95 shadow-2xl"
            >
              <Command size={20} className="text-indigo-400" /> WATCH PROTOCOL
            </m.button>
          </m.div>
        </div>
      </section>

      {/* DISCORD COMMUNITY SECTION */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <GlassCard className="p-16 md:p-24 rounded-[5rem] md:rounded-[7rem] border-indigo-500/20 bg-indigo-600/[0.02] flex flex-col md:flex-row items-center gap-16 overflow-hidden group">
            <div className="relative shrink-0">
               <div className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] md:rounded-[4rem] bg-slate-900 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-[0_40px_80px_rgba(0,0,0,0.5)]">
                  <MessageCircle size={64} className="md:size-24 group-hover:scale-110 transition-transform" />
               </div>
               <m.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 border border-dashed border-indigo-500/20 rounded-full" />
            </div>
            <div className="space-y-8 flex-1 text-center md:text-left relative z-10">
               <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter leading-none">JOIN THE <span className="text-indigo-400">BLOG COMMUNITY</span></h2>
                  <p className="text-lg text-slate-500 font-medium italic leading-relaxed max-w-xl">
                    🚀 Join the SomnoAI Digital Sleep Lab Blog community on Discord!<br/>
                    💬 Discuss the latest articles, share ideas, and select your favorite topics with other research subjects.
                  </p>
               </div>
               <a 
                 href="https://discord.com/invite/9EXJtRmju" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="inline-flex px-12 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-black text-xs uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 italic items-center gap-4"
               >
                 ENTER DISCORD <ArrowUpRight size={18} />
               </a>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* 底部页脚 */}
      <footer className="relative z-10 px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-10 opacity-50 border-t border-white/5 bg-[#01040a]">
        <div className="flex items-center gap-5">
          <Logo size={32} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-600">@2026 SomnoAI Restoration Lab</span>
            <div className="flex items-center gap-2 mt-1">
              <Layers size={10} className="text-indigo-500" />
              <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Hybrid Architecture Node</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10">
           <button onClick={() => onNavigate('opensource')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors underline decoration-indigo-500/30 underline-offset-4">{tl.opensource}</button>
           <button onClick={() => onNavigate('privacy')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">{tl.privacy}</button>
           <button onClick={() => onNavigate('terms')} className="text-[9px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">{tl.terms}</button>
           <div className="flex items-center gap-5 px-8 py-3 bg-indigo-500/5 border border-indigo-500/20 rounded-full shadow-inner">
             <ShieldCheck size={16} className="text-indigo-400" />
             <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700">Secure Neural Pipeline</span>
           </div>
        </div>
      </footer>
    </div>
  );
};