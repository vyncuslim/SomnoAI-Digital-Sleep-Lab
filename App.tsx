import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './components/RootLayout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical, Mic,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper, PenTool, Shield,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath } from './services/navigation.ts';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';

// Core Views
import { Dashboard } from './components/Dashboard.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { LiveAssistant } from './components/LiveAssistant.tsx';
import { DreamVisualizer } from './components/DreamVisualizer.tsx';
import { Settings } from './components/Settings.tsx';
import { Trends } from './components/Trends.tsx';
import { DiaryView } from './components/DiaryView.tsx';
import { ExperimentView } from './components/ExperimentView.tsx';
import { SupportView } from './components/SupportView.tsx';
import { ScienceView } from './components/ScienceView.tsx';
import { FAQView } from './components/FAQView.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import UserLoginPage from './legacy_pages/UserLoginPage.tsx';
import UserSignupPage from './legacy_pages/UserSignupPage.tsx';
import AdminLoginPage from './legacy_pages/AdminLoginPage.tsx';
import { AdminView } from './components/AdminView.tsx';
import { AboutView } from './components/AboutView.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { ExitFeedbackModal } from './components/ExitFeedbackModal.tsx';
import { NewsHub, MOCK_RESEARCH } from './components/NewsHub.tsx';
import { ArticleView } from './components/ArticleView.tsx';
import { BlogHub, MOCK_BLOG_POSTS } from './components/BlogHub.tsx';
import { BlogPostView } from './components/BlogPostView.tsx';
import { ContactView } from './components/ContactView.tsx';
import { NotFoundView } from './components/NotFoundView.tsx';
import { LegalView } from './components/LegalView.tsx';
import { OpenSourceView } from './components/OpenSourceView.tsx';

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
  const { profile, loading, refresh, isAdmin } = useAuth();
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('somno_lang');
    if (stored === 'zh' || stored === 'en' || stored === 'es') return stored as Language;
    return 'en';
  });

  const [currentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activePost, setActivePost] = useState<Article | null>(null);

  const resolveViewFromLocation = useCallback((): ViewType | 'opensource' => {
    try {
      const pathname = window.location.pathname || '/';
      const cleanPath = pathname.toLowerCase().split('?')[0].replace(/\/+/g, '/').replace(/\/+$/, '') || '/';
      const segments = cleanPath.split('/').filter(Boolean);
      
      // Admin Priority Catch
      if (segments.includes('admin')) return 'admin';
      if (segments.includes('admin-login')) return 'admin-login';

      if (segments.includes('article') || segments.includes('news')) {
        const idx = segments.indexOf('article') !== -1 ? segments.indexOf('article') : segments.indexOf('news');
        const slug = segments[idx + 1];
        if (slug) {
          const found = MOCK_RESEARCH.find(a => a.slug === slug);
          if (found) {
            setActiveArticle(found);
            return 'article';
          }
        }
      }

      if (segments.includes('blog')) {
        const slugIdx = segments.indexOf('blog') + 1;
        const slug = segments[slugIdx];
        if (slug) {
          const found = MOCK_BLOG_POSTS.find(p => p.slug === slug);
          if (found) {
            setActivePost(found);
            return 'blog-post';
          }
        }
        return 'blog';
      }

      const viewMap: Record<string, ViewType | 'opensource'> = {
        'dashboard': 'dashboard',
        'assistant': 'assistant',
        'voice': 'voice',
        'dreams': 'dreams',
        'calendar': 'calendar',
        'atlas': 'calendar',
        'experiment': 'experiment',
        'settings': 'settings',
        'diary': 'diary',
        'registry': 'registry',
        'login': 'login',
        'signup': 'signup',
        'join': 'signup',
        'science': 'science',
        'faq': 'faq',
        'news': 'news',
        'blog': 'blog',
        'about': 'about',
        'support': 'support',
        'privacy': 'privacy',
        'terms': 'terms',
        'contact': 'contact',
        'feedback': 'feedback',
        'opensource': 'opensource',
        '404': 'not-found'
      };

      for (let i = segments.length - 1; i >= 0; i--) {
        if (viewMap[segments[i]]) return viewMap[segments[i]];
      }

      const rootAliases = ['/', '', 'index', 'index.html', 'home', 'landing', 'welcome'];
      if (cleanPath === '/' || rootAliases.includes(cleanPath.replace(/^\//, ''))) {
        return 'landing';
      }

      return 'landing';
    } catch (e) {
      return 'landing';
    }
  }, []);

  const [activeView, setActiveView] = useState<ViewType | 'opensource'>(() => resolveViewFromLocation());

  const navigate = (view: string) => {
    const target = view === '/' ? '/' : (view.startsWith('/') ? view : `/${view}`);
    safeNavigatePath(target);
    setActiveView(resolveViewFromLocation());
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleRouting = () => setActiveView(resolveViewFromLocation());
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [resolveViewFromLocation]);

  useEffect(() => {
    if (!loading) {
      const currentLoc = resolveViewFromLocation();
      if (profile && ['landing', 'login', 'signup'].includes(currentLoc)) {
        if (window.location.pathname !== '/dashboard') {
          navigate('dashboard');
        } else {
          setActiveView('dashboard');
        }
      } else {
        setActiveView(currentLoc);
      }
    }
  }, [profile, loading, resolveViewFromLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center gap-6">
         <Logo size={60} animated={true} />
         <div className="text-[9px] font-black uppercase tracking-[0.5em] text-indigo-500/40 animate-pulse">Synchronizing Terminal...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'landing': return <LandingPage lang={lang} onNavigate={navigate} />;
      case 'science': return <ScienceView lang={lang} onBack={() => navigate('/')} />;
      case 'faq': return <FAQView lang={lang} onBack={() => navigate('/')} />;
      case 'news': return <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate(`article/${a.slug}`); }} />;
      case 'article': return activeArticle ? <ArticleView article={activeArticle} lang={lang} onBack={() => navigate('news')} /> : <NewsHub lang={lang} onSelectArticle={(a) => { setActiveArticle(a); navigate(`article/${a.slug}`); }} />;
      case 'blog': return <BlogHub lang={lang} onSelectPost={(p) => { setActivePost(p); navigate(`blog/${p.slug}`); }} />;
      case 'blog-post': return activePost ? <BlogPostView post={activePost} lang={lang} onBack={() => navigate('blog')} /> : <BlogHub lang={lang} onSelectPost={(p) => { setActivePost(p); navigate(`blog/${p.slug}`); }} />;
      case 'about': return <AboutView lang={lang} onBack={() => navigate('/')} onNavigate={navigate} />;
      case 'support': return <SupportView lang={lang} onBack={() => navigate('/')} onNavigate={navigate} />;
      case 'privacy': return <LegalView type="privacy" lang={lang} onBack={() => navigate('/')} />;
      case 'terms': return <LegalView type="terms" lang={lang} onBack={() => navigate('/')} />;
      case 'opensource': return <OpenSourceView lang={lang} onBack={() => navigate('/')} />;
      case 'login': return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
      case 'signup': return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
      case 'admin-login': return <AdminLoginPage />;
      case 'admin': return (
        <ProtectedRoute level="admin">
          <AdminView onBack={() => navigate('dashboard')} />
        </ProtectedRoute>
      );
      case 'contact': return <ContactView lang={lang} onBack={() => navigate('about')} />;
      case 'feedback': return <FeedbackView lang={lang} onBack={() => navigate('support')} />;
      case 'not-found': return <NotFoundView />;
      default: return null;
    }
  };

  const isStandaloneView = ['landing', 'science', 'faq', 'about', 'support', 'privacy', 'terms', 'login', 'signup', 'admin-login', 'opensource', 'contact', 'feedback', 'not-found', 'news', 'article', 'blog', 'blog-post', 'admin'].includes(activeView);

  if (isStandaloneView) {
    return (
      <>
        {renderContent()}
        <ExitFeedbackModal isOpen={isExitModalOpen} lang={lang} onConfirmLogout={async () => { await authApi.signOut(); window.location.href = '/'; }} />
      </>
    );
  }

  if (!profile) return <LandingPage lang={lang} onNavigate={navigate} />;
  if (!profile.full_name && !['settings', 'registry', 'admin'].includes(activeView)) return <FirstTimeSetup onComplete={refresh} />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '实验室' : 'Lab' },
    { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '分析' : 'Atlas' },
    { id: 'experiment', icon: FlaskConical, label: lang === 'zh' ? '实验' : 'Trials' },
    { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? '合成' : 'AI Sync' },
    { id: 'dreams', icon: ImageIcon, label: lang === 'zh' ? '投影' : 'Dreams' },
    { id: 'voice', icon: Mic, label: lang === 'zh' ? '语音' : 'Voice' },
    { id: 'news', icon: Newspaper, label: lang === 'zh' ? '科研' : 'Research' },
    { id: 'blog', icon: PenTool, label: lang === 'zh' ? '博文' : 'Blog' },
    { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Log' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#01040a] text-slate-200 selection:bg-indigo-500/30">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#01040a]/80 backdrop-blur-3xl border-b border-white/5 px-6 md:px-12 h-20 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={36} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-lg font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">SomnoAI <span className="text-indigo-400 font-medium">Digital Sleep Lab</span></span>
              <span className="text-[6px] font-black uppercase tracking-[0.4em] text-slate-500 mt-1">Sovereign Node Interface</span>
            </div>
          </div>
          <nav className="hidden xl:flex items-center gap-8">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)}
                className={`group relative text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 italic ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
              >
                <item.icon size={14} className={activeView === item.id ? 'animate-pulse' : ''} /> 
                {item.label}
                {activeView === item.id && (
                  <m.div layoutId="nav-glow" className="absolute -bottom-7 left-0 right-0 h-[2px] bg-indigo-500 shadow-[0_0_15px_#6366f1]" />
                )}
              </button>
            ))}
            {isAdmin && (
              <button 
                onClick={() => navigate('admin')}
                className={`group relative text-[9px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-2 italic ${activeView === 'admin' ? 'text-rose-400' : 'text-slate-500 hover:text-rose-400'}`}
              >
                <Shield size={14} /> ADMIN
              </button>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('registry')} className={`p-3 rounded-xl transition-all border ${activeView === 'registry' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
            <User size={18} />
          </button>
          <button onClick={() => navigate('settings')} className={`p-3 rounded-xl transition-all border ${activeView === 'settings' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:bg-white/10'}`}>
            <SettingsIcon size={18} />
          </button>
          <button onClick={() => setIsExitModalOpen(true)} className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 hover:text-white hover:bg-rose-500 transition-all active:scale-90">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <main className="flex-1 w-full max-w-[1700px] mx-auto p-6 md:p-12 pt-32 pb-24 relative overflow-x-hidden">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.01 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            {activeView === 'dashboard' && <Dashboard data={currentRecord} lang={lang} onNavigate={navigate} />}
            {activeView === 'calendar' && <Trends history={[currentRecord]} lang={lang} />}
            {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
            {activeView === 'dreams' && <DreamVisualizer lang={lang} data={currentRecord} />}
            {activeView === 'voice' && <LiveAssistant lang={lang} data={currentRecord} />}
            {activeView === 'experiment' && <ExperimentView data={currentRecord} lang={lang} />}
            {activeView === 'diary' && <DiaryView lang={lang} />}
            {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
            {activeView === 'registry' && <UserProfile lang={lang} />}
          </m.div>
        </AnimatePresence>
      </main>
      <ExitFeedbackModal isOpen={isExitModalOpen} lang={lang} onConfirmLogout={async () => { await authApi.signOut(); window.location.href = '/'; }} />
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