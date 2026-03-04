import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, LogIn, LogOut, User, Settings as SettingsIcon, Shield,
  FlaskConical, Newspaper, HelpCircle, Info, LayoutDashboard, 
  TrendingUp, Sparkles, ImageIcon, Mic, BookOpen, PenTool,
  Microscope, Binary, Search
} from 'lucide-react';

import { Language, getTranslation } from '../services/i18n';
import { Logo } from './Logo';

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
  
  const t = getTranslation(lang, 'landing');
  const isZh = lang === 'zh';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const guestLinks = [
    { label: isZh ? '产品' : 'Product', view: 'product', icon: Sparkles },
    { label: isZh ? '原理' : 'How it Works', view: 'how-it-works', icon: Binary },
    { label: isZh ? '研究' : 'Research', view: 'research', icon: Microscope },
    { label: t.nav.science, view: 'science', icon: FlaskConical },
    { label: t.nav.news, view: 'news', icon: Newspaper },
    { label: t.nav.faq, view: 'faq', icon: HelpCircle },
    { label: t.nav.project, view: 'about', icon: Info },
  ];

  const authLinks = [
    { id: 'dashboard', icon: LayoutDashboard, label: isZh ? '实验室' : 'Lab' },
    { id: 'calendar', icon: TrendingUp, label: isZh ? '分析' : 'Atlas' },
    { id: 'experiment', icon: FlaskConical, label: isZh ? '实验' : 'Trials' },
    { id: 'assistant', icon: Sparkles, label: isZh ? 'AI 助手' : 'AI Assist' },
    { id: 'dreams', icon: ImageIcon, label: isZh ? '投影' : 'Dreams' },
    { id: 'voice', icon: Mic, label: isZh ? '语音' : 'Voice' },
    { id: 'news', icon: Newspaper, label: isZh ? '科研' : 'Research' },
    { id: 'faq', icon: HelpCircle, label: isZh ? '帮助' : 'Help' },
    { id: 'blog', icon: PenTool, label: isZh ? '博文' : 'Blog' },
    { id: 'diary', icon: BookOpen, label: isZh ? '日志' : 'Log' },
  ];

  const links = isAuthenticated ? authLinks : guestLinks;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-6 md:px-12 h-20 flex items-center justify-between ${scrolled || isMobileMenuOpen ? 'bg-[#01040a]/80 backdrop-blur-3xl border-b border-white/5 shadow-2xl' : 'bg-transparent'}`}>
      <div className="flex items-center gap-10">
        <Link to="/">
          <m.div 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-6 cursor-pointer group bg-transparent border-none p-0 outline-none text-left relative" 
          >
            <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-all" />
            <Logo lang={lang} className="group-hover:text-indigo-400 transition-colors scale-110" />
          </m.div>
        </Link>

        <div className="hidden xl:flex items-center gap-8">
          {links.map((link: any) => {
            const id = link.id || link.view;
            const isActive = activeView === id;
            return (
              <m.button 
                key={id} 
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
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
              </m.button>
            );
          })}
          {isAuthenticated && isAdmin && (
            <m.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('admin')}
              className={`group relative text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 italic ${activeView === 'admin' ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
            >
              <Shield size={14} /> ADMIN
            </m.button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => onNavigate('/search')}
          className="p-2 text-slate-500 hover:text-white transition-colors"
        >
          <Search size={20} />
        </button>

        <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 mr-2">
          <button 
            onClick={() => onNavigate('/en')}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            EN
          </button>
          <button 
            onClick={() => onNavigate('/cn')}
            className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'zh' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            CN
          </button>
        </div>
        {isAuthenticated ? (
          <div className="hidden sm:flex items-center gap-4">
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('registry')} 
              className={`p-3 rounded-xl transition-all border ${activeView === 'registry' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
            >
              <User size={18} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onNavigate('settings')} 
              className={`p-3 rounded-xl transition-all border ${activeView === 'settings' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}
            >
              <SettingsIcon size={18} />
            </m.button>
            <m.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onLogout} 
              className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 transition-all active:scale-90"
            >
              <LogOut size={18} />
            </m.button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-6">
            <button onClick={() => onNavigate('signup')} className="text-[10px] font-black text-slate-500 hover:text-white transition-all tracking-[0.2em] uppercase italic">
              {t.nav.signup}
            </button>
            <m.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => onNavigate('login')} 
              className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all italic flex items-center gap-3 shadow-lg"
            >
              <LogIn size={14} /> {t.nav.enter}
            </m.button>
          </div>
        )}
        
        <m.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="xl:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-slate-400 hover:text-white transition-all"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </m.button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="xl:hidden absolute top-24 left-6 right-6 bg-[#01040a]/95 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-2xl z-[200] max-h-[70vh] overflow-y-auto grainy-bg"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/10 rounded-full mt-4" />
            <div className="grid grid-cols-2 gap-4 mt-8">
              {links.map((item: any) => {
                const id = item.id || item.view;
                return (
                  <button 
                    key={id} 
                    onClick={() => {
                      onNavigate(id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all relative group ${activeView === id ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'}`}
                  >
                    <div className="absolute top-2 right-2 opacity-20 group-hover:opacity-100 transition-opacity">
                      <span className="text-[6px] font-black font-mono">MOD_{id.toUpperCase().slice(0,3)}</span>
                    </div>
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
              <div className="flex items-center bg-black/40 p-1.5 rounded-full border border-white/5 shadow-inner mb-6">
                {['en', 'zh'].map((l) => (
                  <button 
                    key={l} 
                    onClick={() => {
                      onNavigate(l === 'en' ? '/en' : '/cn');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${lang === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {l === 'en' ? 'ENGLISH' : '中文简体'}
                  </button>
                ))}
              </div>
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
                    {t.nav.signup}
                  </button>
                  <button onClick={() => onNavigate('login')} className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-white shadow-xl">
                    {t.nav.enter}
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
