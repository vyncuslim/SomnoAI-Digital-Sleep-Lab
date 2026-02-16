import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper, Info, Activity, Command, ShieldCheck, Github, Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath, updateMetadata } from './services/navigation.ts';

// Core Views
import { Dashboard } from './components/Dashboard.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Trends } from './components/Trends.tsx';
import { DiaryView } from './components/DiaryView.tsx';
import { ExperimentView } from './components/ExperimentView.tsx';
import { SupportView } from './components/SupportView.tsx';
import { ScienceView } from './components/ScienceView.tsx';
import { FAQView } from './components/FAQView.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import UserLoginPage from './app/login/page.tsx';
import UserSignupPage from './app/signup/page.tsx';
import { AboutView } from './components/AboutView.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { ExitFeedbackModal } from './components/ExitFeedbackModal.tsx';
import { NewsHub } from './components/NewsHub.tsx';
import { ArticleView } from './components/ArticleView.tsx';
import { ContactView } from './components/ContactView.tsx';

const m = motion as any;

const INITIAL_MOCK_RECORD: SleepRecord = {
  id: 'initial-state',
  date: new Date().toLocaleDateString(),
  score: 82,
  totalDuration: 460,
  deepRatio: 22,
  remRatio: 20,
  efficiency: 89,
  stages: [],
  heartRate: { resting: 58, max: 75, min: 48, average: 62, history: [] },
  aiInsights: ["Neural link synced.", "Laboratory environment ready."]
};

const AppContent: React.FC = () => {
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en'); 
  const [currentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  const resolveViewFromLocation = useCallback((): ViewType => {
    let path = window.location.pathname.toLowerCase().trim();
    if (!path || path === '/' || path === '/index.html' || path === '/landing') return 'landing';

    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    const views: Record<string, ViewType> = {
      '/dashboard': 'dashboard',
      '/assistant': 'assistant',
      '/calendar': 'calendar',
      '/experiment': 'experiment',
      '/settings': 'settings',
      '/diary': 'diary',
      '/registry': 'registry',
      '/login': 'login',
      '/signup': 'signup',
      '/science': 'science',
      '/faq': 'faq',
      '/about': 'about',
      '/support': 'support',
      '/feedback': 'feedback',
      '/news': 'news',
      '/article': 'article',
      '/contact': 'contact'
    };
    return views[cleanPath] || 'landing';
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  useEffect(() => {
    if (!loading) {
      const currentLoc = resolveViewFromLocation();
      if (profile) {
        if (currentLoc === 'landing' || currentLoc === 'login' || currentLoc === 'signup') {
          setActiveView('dashboard');
          if (window.location.pathname !== '/dashboard') {
            window.history.replaceState(null, '', '/dashboard');
          }
        } else {
          setActiveView(currentLoc);
        }
      } else {
        setActiveView(currentLoc);
      }
    }
  }, [profile, loading, resolveViewFromLocation]);

  const navigate = (view: string) => {
    const cleanView = view.startsWith('/') ? view : `/${view}`;
    safeNavigatePath(cleanView);
    setActiveView(resolveViewFromLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleRouting = () => setActiveView(resolveViewFromLocation());
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [resolveViewFromLocation]);

  const isPublicPage = ['landing', 'login', 'signup', 'science', 'faq', 'about', 'support', 'feedback', 'news', 'article', 'contact'].includes(activeView);

  if (loading) return null;

  const sharedViews: Record<string, React.ReactElement> = {
    'science': <ScienceView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />,
    'faq': <FAQView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />,
    'about': <AboutView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />,
    'support': <SupportView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />,
    'feedback': <FeedbackView lang={lang} onBack={() => navigate('support')} />,
    'contact': <ContactView lang={lang} onBack={() => navigate('about')} />,
    'news': <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />,
    'article': activeArticle ? <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} /> : <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />
  };

  if (sharedViews[activeView]) return sharedViews[activeView];

  if (!profile) {
    if (activeView === 'signup') return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
    if (activeView === 'login') return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
    return <LandingPage lang={lang} onNavigate={navigate} />;
  }

  if (!profile.full_name && activeView !== 'settings') return <FirstTimeSetup onComplete={refresh} />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '实验室' : 'Lab' },
    { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '分析' : 'Atlas' },
    { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? '合成' : 'AI Sync' },
    { id: 'news', icon: Newspaper, label: lang === 'zh' ? '科研' : 'Research' },
    { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Log' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#01040a] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#01040a]/80 backdrop-blur-3xl border-b border-white/5 px-6 md:px-12 h-20 md:h-24 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={40} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1">Digital Sleep Lab</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-10">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)}
                className={`group relative text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 italic ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
              >
                <item.icon size={16} className={activeView === item.id ? 'animate-pulse' : ''} /> 
                {item.label}
                {activeView === item.id && (
                  <m.div layoutId="nav-glow" className="absolute -bottom-10 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button onClick={() => navigate('registry')} className={`p-4 rounded-[1.5rem] transition-all border ${activeView === 'registry' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 shadow-xl'}`}>
            <User size={18} />
          </button>
          <button onClick={() => navigate('settings')} className={`p-4 rounded-[1.5rem] transition-all border ${activeView === 'settings' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10 shadow-xl'}`}>
            <SettingsIcon size={18} />
          </button>
          <button onClick={() => setIsExitModalOpen(true)} className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[1.5rem] text-rose-500 hover:text-white hover:bg-rose-500 transition-all shadow-xl active:scale-90">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-28 md:pt-40 pb-40 relative">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            {activeView === 'dashboard' && <Dashboard data={currentRecord} lang={lang} onNavigate={navigate} />}
            {activeView === 'calendar' && <Trends history={[currentRecord]} lang={lang} />}
            {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
            {activeView === 'experiment' && <ExperimentView data={currentRecord} lang={lang} />}
            {activeView === 'diary' && <DiaryView lang={lang} />}
            {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
            {activeView === 'registry' && <UserProfile lang={lang} />}
          </m.div>
        </AnimatePresence>
      </main>

      <footer className="w-full bg-slate-950/40 border-t border-white/5 py-12 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <Logo size={24} />
              <span className="text-sm font-black italic text-white uppercase tracking-widest">SomnoAI</span>
            </div>
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest italic">
              Digital Sleep Laboratory Infrastructure v2.8
            </p>
          </div>

          <div className="flex gap-8">
            <button onClick={() => navigate('about')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all italic">About</button>
            <button onClick={() => navigate('science')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all italic">Protocol</button>
            <button onClick={() => navigate('support')} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all italic">Support</button>
            <a href="/privacy" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-all italic">Privacy</a>
          </div>

          <div className="flex items-center gap-5 opacity-40">
             <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" className="text-slate-400 hover:text-white transition-colors"><Github size={18} /></a>
             <a href="mailto:contact@sleepsomno.com" className="text-slate-400 hover:text-white transition-colors"><Mail size={18} /></a>
             <div className="flex items-center gap-2 px-4 py-1.5 bg-indigo-500/5 rounded-full border border-indigo-500/10">
                <ShieldCheck size={12} className="text-indigo-400" />
                <span className="text-[8px] font-mono uppercase tracking-widest">Secure Node</span>
             </div>
          </div>
        </div>
        <p className="text-center text-[9px] font-mono text-slate-800 uppercase tracking-[0.8em] mt-12">
          © 2026 SomnoAI Laboratory Node • All Recovery Protocols Verified
        </p>
      </footer>

      <div className="lg:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm">
        <div className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-around shadow-[0_40px_80px_-20px_rgba(0,0,0,1)]">
           {navItems.map((item) => (
             <button 
               key={item.id} 
               onClick={() => navigate(item.id)}
               className={`flex flex-col items-center gap-1.5 p-4 rounded-3xl transition-all relative ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
             >
                {activeView === item.id && (
                  <m.div layoutId="mobile-nav-pill" className="absolute inset-0 bg-indigo-500/10 rounded-3xl -z-10 border border-indigo-500/20" />
                )}
                <item.icon size={22} className={activeView === item.id ? 'scale-110' : ''} />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
             </button>
           ))}
        </div>
      </div>

      <ExitFeedbackModal 
        isOpen={isExitModalOpen} 
        lang={lang} 
        onConfirmLogout={async () => {
           await authApi.signOut();
           window.location.href = '/';
        }} 
      />
    </div>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <RootLayout>
      <AppContent />
    </RootLayout>
  </AuthProvider>
);

export default App;