import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Added missing ChevronRight import from lucide-react
import { 
  Zap, ShieldCheck, Activity, 
  ArrowRight, LogIn, Command, BrainCircuit, Cpu, X, Menu, Target,
  Microscope, Sparkles, Database, Lock, Mail, Globe, LifeBuoy, Copy, Check, Newspaper,
  ChevronRight, Calendar
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';
import { GlassCard } from './GlassCard.tsx';

const m = motion as any;

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: string) => void;
}

const BackgroundEffects = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#01040a] z-0">
    <m.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[150vw] h-[100vh] bg-indigo-600/5 blur-[180px] rounded-full"
    />
    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay" />
    <div className="absolute inset-0 opacity-[0.03]" 
         style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const t = translations[lang].landing;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navLinks = [
    { label: t.nav.science, view: 'science' },
    { label: t.nav.news, view: 'news' },
    { label: t.nav.project, view: 'about' },
    { label: t.nav.support, view: 'support' },
  ];

  const contactNodes = [
    { id: 'dispatch', email: 'contact@sleepsomno.com', label: lang === 'zh' ? '实验室联络' : 'Lab Dispatch', icon: Globe },
    { id: 'support', email: 'support@sleepsomno.com', label: lang === 'zh' ? '技术支持' : 'Tech Support', icon: LifeBuoy },
    { id: 'admin', email: 'admin@sleepsomno.com', label: lang === 'zh' ? '管理终端' : 'Admin Node', icon: ShieldCheck }
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <BackgroundEffects />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-10 md:px-12 ${scrolled ? 'bg-[#01040a]/90 backdrop-blur-3xl py-6 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={48} animated={true} />
            <div className="flex flex-col text-left">
                <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
                <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1">Digital Sleep Lab</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-14">
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
              className="px-10 py-4 bg-white/5 border border-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all italic flex items-center gap-3 shadow-2xl"
            >
              <LogIn size={14} /> {t.nav.enter}
            </m.button>
            <button className="lg:hidden p-2 text-slate-400" onClick={() => setMobileMenuOpen(true)}><Menu size={28} /></button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <m.div 
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }}
          className="max-w-[1500px] space-y-16"
        >
          <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-indigo-600/5 border border-indigo-500/20 rounded-full">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_#10b981]" />
             <span className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-400 italic">Neural Intelligence v2.8 Active</span>
          </div>

          <div className="space-y-0 select-none">
            <h1 className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
              Engineer
            </h1>
            <h1 className="text-[7rem] md:text-[12rem] lg:text-[16rem] font-black italic tracking-tighter text-indigo-600 uppercase leading-[0.8] mt-[-1%] drop-shadow-[0_0_80px_rgba(79,70,229,0.2)]">
              Recovery
            </h1>
          </div>

          <p className="text-xl md:text-3xl text-slate-400 font-bold italic max-w-4xl mx-auto leading-relaxed border-l-4 border-indigo-600/30 pl-10 text-left md:text-center">
             {t.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
            <m.button 
              whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate('signup')}
              className="px-16 py-8 bg-indigo-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] shadow-[0_30px_70px_rgba(79,70,229,0.3)] transition-all italic flex items-center justify-center gap-4"
            >
              {t.ctaPrimary} <ArrowRight size={18} />
            </m.button>
            <button 
              onClick={() => onNavigate('news')}
              className="px-16 py-8 bg-transparent border border-white/10 hover:bg-white/5 text-slate-300 rounded-full font-black text-[12px] uppercase tracking-[0.4em] transition-all italic flex items-center justify-center gap-4 shadow-xl"
            >
              <Newspaper size={18} className="text-indigo-500" /> {lang === 'zh' ? '研究报告' : 'RESEARCH HUB'}
            </button>
          </div>
        </m.div>
      </section>

      {/* Latest Research Feed - Editorial Focus */}
      <section className="relative z-10 max-w-[1400px] mx-auto px-6 pb-40 w-full">
         <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="space-y-4">
               <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">{t.latestResearch}</h2>
               <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">Validated Biological Insights • PEER REVIEWED</p>
            </div>
            <button 
              onClick={() => onNavigate('news')}
              className="px-10 py-4 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 rounded-full text-indigo-400 text-[10px] font-black uppercase tracking-widest italic transition-all flex items-center gap-3"
            >
               EXPLORE JOURNAL <ArrowRight size={14} />
            </button>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { id: 'art-001', title: 'How Gemini AI Decodes Sleep Architecture in 2026', cat: 'AI RESEARCH', date: '2026-02-15', author: 'Vyncuslim' },
              { id: 'art-002', title: 'Neurological Recovery: Deep Sleep vs. REM Paradox', cat: 'BIOLOGY', date: '2026-02-10', author: 'Somno Lab Team' }
            ].map((art) => (
              <GlassCard key={art.id} onClick={() => onNavigate('news')} className="p-12 rounded-[4rem] border-white/5 bg-slate-950/40 cursor-pointer group hover:bg-indigo-600/[0.02]">
                 <div className="flex justify-between items-start mb-8">
                    <span className="text-[9px] font-black text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full">{art.cat}</span>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest italic">Authored by {art.author}</span>
                        <div className="h-4 w-px bg-white/10" />
                        <span className="text-[10px] font-mono text-slate-500 italic flex items-center gap-2"><Calendar size={12} /> {art.date}</span>
                    </div>
                 </div>
                 <h4 className="text-2xl md:text-3xl font-black italic text-white uppercase leading-tight group-hover:text-indigo-300 transition-colors">{art.title}</h4>
                 <div className="mt-8 flex items-center gap-3 text-slate-600 text-[10px] font-black uppercase italic group-hover:text-white transition-colors">
                    READ PUBLICATION <ChevronRight size={14} />
                 </div>
              </GlassCard>
            ))}
         </div>
      </section>

      {/* Dispatch Matrix Section */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 pb-40 w-full">
        <div className="text-center mb-16 space-y-4">
           <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">{t.dispatchTitle}</h2>
           <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.8em] italic">{t.dispatchSub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {contactNodes.map((node) => (
             <GlassCard key={node.id} className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 text-left relative overflow-hidden group">
                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform shadow-inner">
                      <node.icon size={24} />
                   </div>
                   <button 
                    onClick={() => handleCopy(node.id, node.email)}
                    className={`p-3 rounded-xl transition-all active:scale-90 ${copiedId === node.id ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-slate-600 hover:text-white'}`}
                   >
                     {copiedId === node.id ? <Check size={18} /> : <Copy size={18} />}
                   </button>
                </div>
                <div className="space-y-2 relative z-10">
                   <p className="text-[9px] font-mono text-slate-600 uppercase tracking-widest">{node.id.toUpperCase()}_NODE_LINK</p>
                   <h4 className="text-lg font-black italic text-white uppercase tracking-tight">{node.label}</h4>
                   <a href={`mailto:${node.email}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors italic block truncate">
                     {node.email}
                   </a>
                </div>
                <div className="absolute -bottom-6 -right-6 opacity-[0.02] text-white group-hover:rotate-12 transition-transform duration-700 pointer-events-none">
                   <node.icon size={120} strokeWidth={0.5} />
                </div>
             </GlassCard>
           ))}
        </div>
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

      {/* Global Footer */}
      <footer className="relative z-10 px-12 py-16 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity border-t border-white/5 bg-[#01040a]">
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