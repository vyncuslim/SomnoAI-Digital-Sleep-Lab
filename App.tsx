import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, Article } from './types.ts';
import {
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical, Mic,
  User, Settings as SettingsIcon, LogOut, BookOpen, Newspaper, PenTool
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
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>(() => {
    const stored = localStorage.getItem('somno_lang');
    if (stored === 'zh' || stored === 'en' || stored === 'es') return stored as Language;
    return 'en';
  });

  const [currentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState<Article | null>(null);
  const [activePost, setActivePost] = useState<Article | null>(null);

  /**
   * SOMNO ROUTE ENGINE v9001.0 - ULTRA COMPATIBILITY
   * 修复 404 误判：
   * 1. 采用降级优先原则，若路径段中未找到任何已知关键字，则默认显示 landing。
   * 2. 移除对 segments.length > 1 的强制 404 限制。
   */
  const resolveViewFromLocation = useCallback((): ViewType | 'opensource' => {
    try {
      const pathname = window.location.pathname || '/';
      const cleanPath = pathname.toLowerCase().split('?')[0].replace(/\/+/g, '/').replace(/\/+$/, '');
      const segments = cleanPath.split('/').filter(Boolean);
      
      // 特殊处理：文章与博客 slug
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
        const slug = segments[segments.indexOf('blog') + 1];
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

      // 从后往前匹配关键字
      for (let i = segments.length - 1; i >= 0; i--) {
        if (viewMap[segments[i]]) return viewMap[segments[i]];
      }

      // 如果没有任何匹配，且不是空路径，且不包含 index 等别名，则根据意图决定
      const rootAliases = ['', 'index', 'index.html', 'home', 'landing', 'welcome'];
      if (segments.length === 0 || (segments.length === 1 && rootAliases.includes(segments[0]))) {
        return 'landing';
      }

      // 只有显式包含 404 关键字时才显示 404 页面，否则默认回退到首页
      // 这能解决大多数沙盒环境下的加载问题
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
        navigate('dashboard');
      } else {
        setActiveView(currentLoc);
      }
    }
  }, [profile, loading, resolveViewFromLocation]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center gap-6">
         <Logo size={80} animated={true} />
         <div className="text-[10px] font-black uppercase tracking-[0.6em] text-indigo-500/40 animate-pulse">Synchronizing Lab Pulse...</div>
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
      case 'contact': return <ContactView lang={lang} onBack={() => navigate('about')} />;
      case 'feedback': return <FeedbackView lang={lang} onBack={() => navigate('support')} />;
      case 'not-found': return <NotFoundView />;
      default: return <LandingPage lang={lang} onNavigate={navigate} />;
    }
  };

  const isLabView = !['landing', 'science', 'faq', 'about', 'support', 'privacy', 'terms', 'login', 'signup', 'opensource', 'contact', 'feedback', 'not-found', 'news', 'article', 'blog', 'blog-post'].includes(activeView);

  if (!isLabView) {
    return (
      <>
        {renderContent()}
        <ExitFeedbackModal isOpen={isExitModalOpen} lang={lang} onConfirmLogout={async () => { await authApi.signOut(); window.location.href = '/'; }} />
      </>
    );
  }

  if (!profile) return <LandingPage lang={lang} onNavigate={navigate} />;
  if (!profile.full_name && !['settings', 'registry'].includes(activeView)) return <FirstTimeSetup onComplete={refresh} />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '实验室' : 'Lab' },
    { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '分析' : 'Atlas' },
    { id: 'experiment', icon: FlaskConical, label: lang === 'zh' ? '实验' : 'Trials' },
    { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? '合成' : 'AI Sync' },
    { id: 'voice', icon: Mic, label: lang === 'zh' ? '语音' : 'Voice' },
    { id: 'news', icon: Newspaper, label: lang === 'zh' ? '科研' : 'Research' },
    { id: 'blog', icon: PenTool, label: lang === 'zh' ? '博文' : 'Blog' },
    { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Log' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#01040a] text-slate-200 selection:bg-indigo-500/30">
      <header className="fixed top-0 left-0 right-0 z-[100] bg-[#01040a]/80 backdrop-blur-3xl border-b border-white/5 px-6 md:px-12 h-20 md:h-24 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={40} animated={true} />
            <div className="flex flex-col text-left">
              <span className="text-xl md:text-2xl font-black italic tracking-tighter uppercase leading-none text-white group-hover:text-indigo-400 transition-colors">Somno<span className="text-indigo-400">AI</span></span>
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
            {activeView === 'dashboard' && <Dashboard data={currentRecord} lang={lang} onNavigate={navigate} />}
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