
import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath } from './services/navigation.ts';

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
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
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
    return views[path] || 'landing';
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  const navigate = (view: string) => {
    const cleanView = view.startsWith('/') ? view : `/${view}`;
    safeNavigatePath(cleanView);
    setActiveView(resolveViewFromLocation());
  };

  useEffect(() => {
    const handleRouting = () => {
      setActiveView(resolveViewFromLocation());
    };
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [resolveViewFromLocation]);

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#01040a]">
      <Logo size={80} animated={true} />
    </div>
  );

  // Unauthenticated routing
  if (!profile) {
    if (activeView === 'signup') return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
    if (activeView === 'login') return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
    if (activeView === 'science') return <ScienceView lang={lang} onBack={() => navigate('/')} />;
    if (activeView === 'faq') return <FAQView lang={lang} onBack={() => navigate('/')} />;
    if (activeView === 'about') return <AboutView lang={lang} onBack={() => navigate('/')} onNavigate={navigate} />;
    if (activeView === 'support') return <SupportView lang={lang} onBack={() => navigate('/')} onNavigate={navigate} />;
    if (activeView === 'feedback') return <FeedbackView lang={lang} onBack={() => navigate('/')} />;
    if (activeView === 'news') return <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />;
    if (activeView === 'article' && activeArticle) return <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} />;
    return <LandingPage lang={lang} onNavigate={navigate} />;
  }

  if (!profile.full_name) return <FirstTimeSetup onComplete={refresh} />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '仪表盘' : 'Overview' },
    { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '趋势' : 'Trends' },
    { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? 'AI 教练' : 'AI Coach' },
    { id: 'news', icon: Newspaper, label: lang === 'zh' ? '研究' : 'Research' },
    { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Logs' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#01040a] text-slate-200">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#01040a]/80 backdrop-blur-xl border-b border-white/5 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={34} animated={true} />
            <div className="flex flex-col">
              <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-white">Somno<span className="text-indigo-400">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Digital Sleep Lab</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)}
                className={`text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 italic ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={() => navigate('registry')} className={`p-3 rounded-2xl transition-all ${activeView === 'registry' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
            <User size={20} />
          </button>
          <button onClick={() => navigate('settings')} className={`p-3 rounded-2xl transition-all ${activeView === 'settings' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
            <SettingsIcon size={20} />
          </button>
          <button onClick={() => setIsExitModalOpen(true)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-6 pt-32 pb-32">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.4 }}>
            {activeView === 'dashboard' && <Dashboard data={currentRecord} lang={lang} onNavigate={navigate} />}
            {activeView === 'calendar' && <Trends history={[currentRecord]} lang={lang} />}
            {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
            {activeView === 'experiment' && <ExperimentView data={currentRecord} lang={lang} />}
            {activeView === 'diary' && <DiaryView lang={lang} />}
            {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
            {activeView === 'registry' && <UserProfile lang={lang} />}
            {activeView === 'science' && <ScienceView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'faq' && <FAQView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'support' && <SupportView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'about' && <AboutView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'feedback' && <FeedbackView lang={lang} onBack={() => navigate('support')} />}
            {activeView === 'news' && <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate('article'); }} />}
            {activeView === 'article' && activeArticle && <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} />}
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
