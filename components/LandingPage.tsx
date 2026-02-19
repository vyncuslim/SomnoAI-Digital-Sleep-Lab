import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, LogIn, Command, ShieldCheck, Newspaper, FlaskConical, HelpCircle, Info, Activity, BrainCircuit, Zap, Microscope, LayoutGrid,
  Github, Linkedin, Instagram, Facebook, Youtube, Video, MessageSquare, Globe, UserCircle, Share2, ExternalLink, Watch, Smartphone, Cpu, Binary,
  User, Verified
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
  <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
    <m.div 
      animate={{ 
        scale: [1, 1.2, 1],
        opacity: [0.1, 0.3, 0.1]
      }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/30 blur-[180px] rounded-full"
    />
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onNavigate }) => {
  const [scrolled, setScrolled] = useState(false);
  
  const t = translations[lang as Language].landing;
  const isZh = lang === 'zh';

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

  const socialMatrix = [
    { icon: Globe, url: 'https://sleepsomno.com', label: isZh ? '官方网站' : 'Official Site', status: 'ACTIVE', color: '#6366f1', type: 'CORE' },
    { icon: MessageSquare, url: 'https://discord.com/invite/9EXJtRmju', label: isZh ? 'Discord 社区' : 'Discord Hub', status: 'ACTIVE', color: '#5865F2', type: 'COMMUNITY' },
    { icon: Github, url: 'https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab', label: 'GitHub', status: 'OPEN SOURCE', color: '#ffffff', type: 'CODE' },
    { icon: Video, url: 'https://www.tiktok.com/@somnoaidigitalsleeplab', label: 'TikTok', status: 'ACTIVE', color: '#ff0050', type: 'SOCIAL' },
    { icon: Linkedin, url: 'https://www.linkedin.com/company/somnoai-digital-sleep-lab', label: isZh ? 'LinkedIn 公司页' : 'LinkedIn Co.', status: 'ACTIVE', color: '#0077b5', type: 'BUSINESS' },
    { icon: UserCircle, url: 'https://www.linkedin.com/in/vyncuslim-lim-761300375', label: 'Vyncus Lim', status: 'FOUNDER', color: '#0077b5', type: 'IDENTITY' },
    { icon: Instagram, url: 'https://www.instagram.com/somnoaidigitalsleep/', label: 'Instagram', status: 'ACTIVE', color: '#e1306c', type: 'SOCIAL' },
    { icon: Facebook, url: 'https://www.facebook.com/people/Somnoai-Digital-Sleep-Lab/61587027632695/', label: 'Facebook', status: 'ACTIVE', color: '#1877f2', type: 'SOCIAL' },
    { icon: Youtube, url: 'https://www.youtube.com/channel/UCu0V4CzeSIdagRVrHL116Og', label: 'YouTube', status: 'ACTIVE', color: '#ff0000', type: 'CONTENT' },
  ];

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15]" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-700 px-6 py-10 md:px-12 ${scrolled ? 'bg-[#01040a]/95 backdrop-blur-3xl py-6 border-b border-white/5 shadow-2xl' : ''}`}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-5 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <Logo size={46} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1.5">{isZh ? '数字化睡眠实验室' : 'Digital Restoration Lab'}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-14">
            {navLinks.map((link) => (
              <button key={link.view} onClick={() => onNavigate(link.view)} className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.3em] uppercase italic group relative">
                {link.label}
                <span className="absolute -bottom-2 left-0 w-0 h-[1px] bg-indigo-500 group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          <m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onNavigate('login')} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all italic flex items-center gap-3 shadow-[0_20px_40px_-10px_rgba(79,70,229,0.3)]">
            <LogIn size={14} /> {t.nav.enter}
          </m.button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-56 pb-40 min-h-screen">
        <NeuralPulseBackground />
        <div className="max-w-7xl space-y-16 relative z-10">
          <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-4 px-6 py-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full shadow-2xl">
            <Watch size={14} className="text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 italic">Code is the Ring v4.2</span>
          </m.div>

          <div className="space-y-4">
            <m.h1 initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }} className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[12rem] font-black text-white italic tracking-tighter leading-[0.8] uppercase">Zero.</m.h1>
            <m.h1 initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-7xl sm:text-9xl md:text-[11rem] lg:text-[13rem] font-black text-indigo-600 italic tracking-tighter leading-[0.8] uppercase">Hardware.</m.h1>
          </div>

          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="max-w-4xl mx-auto">
            <p className="text-xl md:text-3xl text-slate-400 font-bold italic leading-relaxed border-l-4 border-indigo-600/30 pl-10 text-left md:text-center">
               {t.heroSubtitle}
            </p>
          </m.div>

          <m.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }} className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-10">
            <m.button whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('signup')} className="px-20 py-8 bg-indigo-600 text-white rounded-full font-black text-[13px] uppercase tracking-[0.4em] shadow-[0_40px_80px_-20px_rgba(79,70,229,0.4)] transition-all italic flex items-center gap-4">{t.ctaPrimary} <ArrowRight size={20} /></m.button>
            <m.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} onClick={() => onNavigate('science')} className="px-16 py-8 bg-black/40 backdrop-blur-3xl border border-white/10 text-slate-300 rounded-full font-black text-[13px] uppercase tracking-[0.4em] hover:bg-black/60 italic flex items-center gap-4 active:scale-95 shadow-2xl">
              <Command size={20} className="text-indigo-400" /> {t.ctaSecondary}
            </m.button>
          </m.div>
        </div>
      </section>

      {/* Network Matrix Section */}
      <section className="relative z-10 py-40 px-6 border-t border-white/5 bg-slate-950/20">
        <div className="max-w-7xl mx-auto space-y-24">
          <div className="flex flex-col md:flex-row justify-between items-end gap-10 px-4">
             <div className="space-y-4 text-left">
                <div className="flex items-center gap-3 text-indigo-400">
                   <Share2 size={22} />
                   <span className="text-[10px] font-black uppercase tracking-[0.4em] italic text-slate-500">Laboratory Dispatch</span>
                </div>
                <h2 className="text-4xl md:text-7xl font-black italic text-white uppercase tracking-tighter leading-none">Network <span className="text-indigo-400">Presence</span></h2>
             </div>
             
             <GlassCard 
               onClick={() => window.open('https://www.linkedin.com/in/vyncuslim-lim-761300375', '_blank')}
               className="p-6 rounded-3xl border-white/10 bg-indigo-600/5 hover:bg-indigo-600/10 cursor-pointer group transition-all"
             >
                <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white italic font-black shadow-lg">V</div>
                   <div className="text-left">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest italic flex items-center gap-2">
                        Founder / Subject 001 <Verified size={10} />
                      </p>
                      <p className="text-sm font-black text-white italic uppercase tracking-tight">Vyncus Lim</p>
                   </div>
                   <ExternalLink size={14} className="text-slate-500 group-hover:text-indigo-400 ml-4" />
                </div>
             </GlassCard>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {socialMatrix.map((node, idx) => (
              <GlassCard 
                key={idx}
                onClick={() => window.open(node.url, '_blank')}
                className="p-10 rounded-[3.5rem] border-white/5 hover:border-indigo-500/30 transition-all group cursor-pointer relative overflow-hidden h-full flex flex-col justify-between bg-[#01040a]/40"
                intensity={1.3}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity pointer-events-none"
                  style={{ backgroundColor: node.color }}
                />
                
                <div className="flex justify-between items-start mb-12 relative z-10">
                   <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-slate-400 group-hover:text-white transition-all shadow-inner group-hover:scale-110 duration-500">
                      <node.icon size={32} />
                   </div>
                   <div className={`px-4 py-1.5 rounded-full border border-white/5 text-[8px] font-black tracking-widest ${node.status === 'OPEN SOURCE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : node.status === 'FOUNDER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-white/5 text-slate-500'} group-hover:bg-white/10 group-hover:text-white transition-all italic`}>
                      {node.status}
                   </div>
                </div>

                <div className="space-y-4 relative z-10 text-left">
                   <div className="flex items-center gap-3">
                      <span className="text-[8px] font-mono text-slate-600 tracking-widest">{node.type}</span>
                      <div className="h-px w-8 bg-slate-800" />
                   </div>
                   <h3 className="text-2xl font-black italic text-white uppercase tracking-tight group-hover:text-indigo-400 transition-colors">
                     {node.label}
                   </h3>
                   <div className="flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity pt-4 border-t border-white/5">
                      <span className="text-[8px] font-mono text-slate-500 uppercase truncate max-w-[200px]">
                        {node.url.replace('https://', '').replace('http://', '')}
                      </span>
                      <ExternalLink size={14} className="text-slate-500" />
                   </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Global Footer */}
      <footer className="relative z-10 px-12 py-24 flex flex-col md:flex-row justify-between items-center gap-12 bg-[#01040a] border-t border-white/5">
        <div className="flex items-center gap-8">
          <Logo size={48} />
          <div className="flex flex-col text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.6em] italic text-slate-500">@2026 SomnoAI Laboratory Hub</span>
            <div className="flex items-center gap-2 mt-2">
              <ShieldCheck size={14} className="text-indigo-500" />
              <span className="text-[8px] font-bold text-slate-700 uppercase tracking-widest">Neural Link Encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-8">
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-12">
             <button onClick={() => onNavigate('opensource')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors underline decoration-indigo-500/20 underline-offset-8">ARCHITECTURE_ISO</button>
             <button onClick={() => onNavigate('privacy')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">PRIVACY_CORE</button>
             <button onClick={() => onNavigate('terms')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest italic transition-colors">TERMS_PROTO</button>
          </div>
          <p className="text-[8px] font-mono text-slate-500 tracking-[0.4em]">STABILITY_VERSION: 4.2.8 // REGION: GLOBAL_EDGE</p>
        </div>
      </footer>
    </div>
  );
};