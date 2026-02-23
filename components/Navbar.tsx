import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogIn, LogOut, User, Settings as SettingsIcon, Shield,
  FlaskConical, Newspaper, HelpCircle, Info, LayoutDashboard, 
  TrendingUp, Sparkles, ImageIcon, Mic, BookOpen, PenTool
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { Language, translations } from '../services/i18n.ts';

const m = motion as any;

interface NavbarProps {
  lang: Language;
  activeView: string;
  onNavigate: (view: string) => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  lang, 
  activeView, 
  onNavigate, 
  isAuthenticated, 
  isAdmin,
  onLogout 
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const t = translations[lang];
  const isZh = lang === 'zh';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const guestLinks = [
    { label: t.landing.nav.science, view: 'science', icon: FlaskConical },
    { label: t.landing.nav.news, view: 'news', icon: Newspaper },
    { label: t.landing.nav.faq, view: 'faq', icon: HelpCircle },
    { label: t.landing.nav.project, view: 'about', icon: Info },
  ];

  const authLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: isZh ? '实验室' : 'Lab' },
    { id: 'calendar', icon: TrendingUp, label: isZh ? '分析' : 'Atlas' },
    { id: 'experiment', icon: FlaskConical, label: isZh ? '实验' : 'Trials' },
    { id: 'assistant', icon: Sparkles, label: isZh ? '合成' : 'AI Sync' },
    { id: 'dreams', icon: ImageIcon, label: isZh ? '投影' : 'Dreams' },
    { id: 'voice', icon: Mic, label: isZh ? '语音' : 'Voice' },
    { id: 'news', icon: Newspaper, label: isZh ? '科研' : 'Research' },
    { id: 'blog', icon: PenTool, label: isZh ? '博文' : 'Blog' },
    { id: 'diary', icon: BookOpen, label: isZh ? '日志' : 'Log' },
  ];

  const links = isAuthenticated ? authLinks : guestLinks;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 h-20 flex items-center justify-between ${scrolled || isMobileMenuOpen ? 'bg-[#01040a]/80 backdrop-blur-3xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => onNavigate(isAuthenticated ? 'dashboard' : '/')}>
          <Logo size={36} animated={true} />
          <div className="flex flex-col text-left">
            <span className="text-lg font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">
              SomnoAI <span className="text-indigo-400 font-medium">Digital Sleep Lab</span>
            </span>
            <span className="text-[6px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">
              {isZh ? '您的AI驱动睡眠伴侣' : 'Your AI-Powered Sleep Companion'}
            </span>
          </div>
        </div>

        <div className="hidden xl:flex items-center gap-8">
          {links.map((link: any) => {
            const id = link.id || link.view;
            const isActive = activeView === id;
            return (
              <button 
                key={id} 
                onClick={() => {
                  onNavigate(id);
                  setIsMobileMenuOpen(false);
                }}
                className={`group relative text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 italic ${isActive ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
              >
                <link.icon size={14} className={isActive ? 'animate-pulse' : ''} /> 
                {link.label}
                {isActive && (
                  <m.div layoutId="nav-glow" className="absolute -bottom-7 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                )}
              </button>
            );
          })}
          {isAuthenticated && isAdmin && (
            <button 
              onClick={() => onNavigate('admin')}
              className={`group relative text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 italic ${activeView === 'admin' ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
            >
              <Shield size={14} /> ADMIN
            </button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-4">
            <button onClick={() => onNavigate('registry')} className={`p-3 rounded-xl transition-all border ${activeView === 'registry' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
              <User size={18} />
            </button>
            <button onClick={() => onNavigate('settings')} className={`p-3 rounded-xl transition-all border ${activeView === 'settings' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
              <SettingsIcon size={18} />
            </button>
            <button onClick={onLogout} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 transition-all active:scale-90">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => onNavigate('signup')} className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.2em] uppercase italic">
              {t.landing.nav.signup}
            </button>
            <m.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => onNavigate('login')} 
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all italic flex items-center gap-3 shadow-lg"
            >
              <LogIn size={14} /> {t.landing.nav.enter}
            </m.button>
          </div>
        )}
        
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-24 left-6 right-6 bg-[#01040a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-[200] max-h-[70vh] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-4">
              {links.map((item: any) => {
                const id = item.id || item.view;
                return (
                  <button 
                    key={id} 
                    onClick={() => {
                      onNavigate(id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${activeView === id ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <item.icon size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest italic">{item.label}</span>
                  </button>
                );
              })}
              {isAuthenticated && isAdmin && (
                <button 
                  onClick={() => {
                    onNavigate('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all ${activeView === 'admin' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-rose-400'}`}
                >
                  <Shield size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest italic">ADMIN</span>
                </button>
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/5">
              {isAuthenticated ? (
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => onNavigate('registry')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500">
                    <User size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest italic">Profile</span>
                  </button>
                  <button onClick={() => onNavigate('settings')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 text-slate-500">
                    <SettingsIcon size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest italic">Settings</span>
                  </button>
                  <button onClick={onLogout} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <LogOut size={20} />
                    <span className="text-[8px] font-black uppercase tracking-widest italic">Exit</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <button onClick={() => onNavigate('signup')} className="w-full py-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-slate-400">
                    {t.landing.nav.signup}
                  </button>
                  <button onClick={() => onNavigate('login')} className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white shadow-xl">
                    {t.landing.nav.enter}
                  </button>
                </div>
              )}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
