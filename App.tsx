
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper, Info, Activity, Command
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
      '/article': 'article'
    };
    return views[cleanPath] || 'landing';
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  // FIX: Force rendering transition to dashboard if profile exists
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
  };

  useEffect(() => {
    const handleRouting = () => setActiveView(resolveViewFromLocation());
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [resolveViewFromLocation]);

  if (loading) return null;

  // Shared View Logic
  // Added comment above fix: Replacing JSX.Element with React.ReactElement to resolve the 'Cannot find namespace JSX' error
  const sharedViews: Record<string, React.ReactElement> = {
    'science': <ScienceView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />,
    'faq': <FAQView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />,
    'about': <AboutView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />,
    'support': <SupportView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />,
    'feedback': <FeedbackView lang={lang} onBack={() => navigate('support')} />,
    'news': <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />,
    'article': activeArticle ? <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} /> : <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />
  };

  if (sharedViews[activeView]) return sharedViews[activeView];

  if (!profile) {
    if (activeView === 'signup') return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
    if (activeView === 'login') return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
    return <LandingPage lang={lang} onNavigate={navigate} />;
  }

  // Mandatory Setup for new users
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
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#01040a]/80 backdrop-blur-2xl border-b border-white/5 px-8 h-24 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={42} animated={true} />
            <div className="flex flex-col">
              <span className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.5em] text-slate-500 mt-1.5">Digital Sleep Lab</span>
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

        <div className="flex items-center gap-6">
          <button onClick={() => navigate('registry')} className={`p-4 rounded-3xl transition-all border ${activeView === 'registry' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
            <User size={20} />
          </button>
          <button onClick={() => navigate('settings')} className={`p-4 rounded-3xl transition-all border ${activeView === 'settings' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
            <SettingsIcon size={20} />
          </button>
          <button onClick={() => setIsExitModalOpen(true)} className="p-4 bg-white/5 border border-white/5 rounded-3xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-8 pt-40 pb-40 relative">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
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
