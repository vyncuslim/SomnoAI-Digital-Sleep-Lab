
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical, Mic,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper, Info, Activity, Command, ShieldCheck, Github, Mail, HelpCircle, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath } from './services/navigation.ts';

// Core Views
import { Dashboard } from './components/Dashboard.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { LiveAssistant } from './components/LiveAssistant.tsx';
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
import { NewsHub, MOCK_RESEARCH } from './components/NewsHub.tsx';
import { ArticleView } from './components/ArticleView.tsx';
import { ContactView } from './components/ContactView.tsx';
import { NotFoundView } from './components/NotFoundView.tsx';
import { LegalView } from './components/LegalView.tsx';

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
  
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('somno_lang');
    if (stored === 'zh' || stored === 'en' || stored === 'es') return stored as Language;
    return 'en';
  });

  const [currentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);

  /**
   * SOMNO ROUTE ENGINE v42.0 - ABSOLUTE ROOT RESOLUTION
   * Hardened to prioritize Landing Page and prevent fall-through 404s.
   */
  const resolveViewFromLocation = useCallback((): ViewType => {
    try {
      const pathname = window.location.pathname;
      
      // 1. Precise Root Detection (The most common cause of 404s)
      if (pathname === '/' || pathname === '' || pathname === '/index.html') {
        return 'landing';
      }

      // Normalize path for lookup: lowercase, remove leading slash, remove trailing slash
      const cleanPath = pathname.toLowerCase().replace(/^\/+/, '').replace(/\/+$/, '');
      
      // 2. Segment Analysis
      const segments = cleanPath.split('/').filter(Boolean);
      const firstSegment = segments[0];

      // 3. Dynamic Article Hub
      if ((firstSegment === 'article' || firstSegment === 'news') && segments[1]) {
        const found = MOCK_RESEARCH.find(a => a.slug === segments[1]);
        if (found) {
          setActiveArticle(found);
          return 'article';
        }
      }

      // 4. View Mapping Registry
      const viewMap: Record<string, ViewType> = {
        'dashboard': 'dashboard',
        'assistant': 'assistant',
        'voice': 'voice',
        'calendar': 'calendar',
        'atlas': 'calendar',
        'experiment': 'experiment',
        'settings': 'settings',
        'diary': 'diary',
        'registry': 'registry',
        'login': 'login',
        'signup': 'signup',
        'science': 'science',
        'faq': 'faq',
        'about': 'about',
        'support': 'support',
        'feedback': 'feedback',
        'news': 'news',
        'contact': 'contact',
        'privacy': 'privacy',
        'terms': 'terms',
        'home': 'landing',
        'landing': 'landing'
      };

      return viewMap[firstSegment] || 'not-found';
    } catch (e) {
      return 'landing';
    }
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  const navigate = (view: string) => {
    // Normalize path to prevent double slashes
    const cleanView = view.startsWith('/') ? view : `/${view}`;
    safeNavigatePath(cleanView);
    setActiveView(resolveViewFromLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleRouting = () => {
      setActiveView(resolveViewFromLocation());
    };
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [resolveViewFromLocation]);

  useEffect(() => {
    if (!loading) {
      const currentLoc = resolveViewFromLocation();
      if (profile) {
        // Enforce Dashboard for authorized subjects hitting entrance nodes
        if (['landing', 'login', 'signup'].includes(currentLoc)) {
          navigate('dashboard');
        } else {
          setActiveView(currentLoc);
        }
      } else {
        setActiveView(currentLoc);
      }
    }
  }, [profile, loading, resolveViewFromLocation]);

  if (loading) return null;

  const renderContent = () => {
    // 1. Universal Sector (Always accessible)
    switch (activeView) {
      case 'science': return <ScienceView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />;
      case 'faq': return <FAQView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} />;
      case 'about': return <AboutView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />;
      case 'support': return <SupportView lang={lang} onBack={() => navigate(profile ? 'dashboard' : '/')} onNavigate={navigate} />;
      case 'feedback': return <FeedbackView lang={lang} onBack={() => navigate('support')} />;
      case 'contact': return <ContactView lang={lang} onBack={() => navigate('about')} />;
      case 'privacy': return <LegalView type="privacy" lang={lang} onBack={() => navigate('/')} />;
      case 'terms': return <LegalView type="terms" lang={lang} onBack={() => navigate('/')} />;
      case 'news': return <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate(`article/${a.slug}`); }} />;
      case 'article': return activeArticle ? <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} /> : <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate(`article/${a.slug}`); }} />;
    }

    // 2. Unauthenticated Sector (Guest Access)
    if (!profile) {
      if (activeView === 'signup') return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
      if (activeView === 'login') return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
      
      /**
       * RESILIENCE PROTOCOL: 
       * If unauthenticated and route is not-found, 
       * default to LandingPage instead of 404 page.
       */
      return <LandingPage lang={lang} onNavigate={navigate} />;
    }

    // 3. Post-Auth Onboarding
    if (!profile.full_name && !['settings', 'registry'].includes(activeView)) return <FirstTimeSetup onComplete={refresh} />;

    const navItems = [
      { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '实验室' : 'Lab' },
      { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '分析' : 'Atlas' },
      { id: 'experiment', icon: FlaskConical, label: lang === 'zh' ? '实验' : 'Trials' },
      { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? '合成' : 'AI Sync' },
      { id: 'voice', icon: Mic, label: lang === 'zh' ? '语音' : 'Voice' },
      { id: 'news', icon: Newspaper, label: lang === 'zh' ? '科研' : 'Research' },
      { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Log' },
    ];

    // Authenticated View Normalization
    const currentActiveView = (activeView === 'landing' || activeView === 'not-found') ? 'dashboard' : activeView;

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
                  className={`group relative text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2.5 italic ${currentActiveView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                >
                  <item.icon size={16} className={currentActiveView === item.id ? 'animate-pulse' : ''} /> 
                  {item.label}
                  {currentActiveView === item.id && (
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

        <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8 pt-28 md:pt-40 pb-20 relative">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.02 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              {(currentActiveView === 'dashboard') && <Dashboard data={currentRecord} lang={lang} onNavigate={navigate} />}
              {activeView === 'calendar' && <Trends history={[currentRecord]} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
              {activeView === 'voice' && <LiveAssistant lang={lang} data={currentRecord} />}
              {activeView === 'experiment' && <ExperimentView data={currentRecord} lang={lang} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
              {activeView === 'registry' && <UserProfile lang={lang} />}
            </m.div>
          </AnimatePresence>
        </main>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <ExitFeedbackModal 
        isOpen={isExitModalOpen} 
        lang={lang} 
        onConfirmLogout={async () => {
           await authApi.signOut();
           window.location.href = '/';
        }} 
      />
    </>
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
