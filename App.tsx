import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical, 
  Settings as SettingsIcon, LogOut, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath } from './services/navigation.ts';

// Components
import AdminDashboard from './app/admin/page.tsx';
import UserLoginPage from './app/login/page.tsx';
import UserSignupPage from './app/signup/page.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Trends } from './components/Trends.tsx';
import { ExperimentView } from './components/ExperimentView.tsx';
import { SupportView } from './components/SupportView.tsx';
import { ScienceView } from './components/ScienceView.tsx';
import { FAQView } from './components/FAQView.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { ExitFeedbackModal } from './components/ExitFeedbackModal.tsx';
import { AboutView } from './components/AboutView.tsx';
import { LandingPage } from './LandingPage.tsx';

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
  aiInsights: ["神经链路同步正常。", "数字化实验室环境已就绪。"]
};

const AppContent: React.FC = () => {
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'zh'); 
  const [currentRecord, setCurrentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  // 处理预加载层移除
  useEffect(() => {
    if (!loading) {
      const preloader = document.getElementById('preloader');
      if (preloader) {
        preloader.style.opacity = '0';
        setTimeout(() => preloader.remove(), 500);
      }
    }
  }, [loading]);

  const resolveViewFromLocation = useCallback((): ViewType => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    if (path === '' || path === '/' || path === '/landing') return 'landing';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/assistant') return 'assistant';
    if (path === '/calendar') return 'calendar';
    if (path === '/experiment') return 'experiment';
    if (path === '/settings') return 'settings';
    if (path === '/registry') return 'registry';
    if (path === '/login') return 'login';
    if (path === '/signup') return 'signup';
    if (path === '/science') return 'science';
    if (path === '/faq') return 'faq';
    if (path === '/support') return 'support';
    if (path === '/about') return 'about';
    return 'landing';
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  const navigate = (view: string) => {
    safeNavigatePath(`/${view}`);
    setActiveView(view as ViewType);
  };

  useEffect(() => {
    const handleRouting = () => {
      if (loading) return;
      setActiveView(resolveViewFromLocation());
    };
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, [loading, resolveViewFromLocation]);

  const confirmLogout = async () => {
    await authApi.signOut();
    setIsExitModalOpen(false);
    window.location.href = '/';
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-white">
      <Logo size={80} animated={true} />
    </div>
  );

  if (!profile) {
    if (activeView === 'signup') return <UserSignupPage onSuccess={refresh} onSandbox={() => {}} lang={lang} />;
    if (activeView === 'login') return <UserLoginPage onSuccess={refresh} onSandbox={() => {}} lang={lang} mode="login" />;
    if (activeView === 'science') return <ScienceView lang={lang} onBack={() => navigate('landing')} />;
    if (activeView === 'faq') return <FAQView lang={lang} onBack={() => navigate('landing')} />;
    if (activeView === 'about') return <AboutView lang={lang} onBack={() => navigate('landing')} onNavigate={navigate} />;
    if (activeView === 'support') return <SupportView lang={lang} onBack={() => navigate('landing')} onNavigate={navigate} />;
    return <LandingPage lang={lang} onNavigate={navigate} />;
  }

  if (!profile.full_name) return <FirstTimeSetup onComplete={refresh} />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: lang === 'zh' ? '仪表盘' : 'Overview' },
    { id: 'calendar', icon: TrendingUp, label: lang === 'zh' ? '趋势' : 'Trends' },
    { id: 'assistant', icon: Sparkles, label: lang === 'zh' ? 'AI 教练' : 'AI Coach' },
    { id: 'experiment', icon: FlaskConical, label: lang === 'zh' ? '实验室' : 'Lab' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-white text-slate-900">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('dashboard')}>
            <Logo size={34} animated={true} />
            <div className="flex flex-col">
              <span className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900">Somno<span className="text-indigo-600">AI</span></span>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-slate-400 mt-1">Laboratory Hub</span>
            </div>
          </div>
          <nav className="hidden lg:flex items-center gap-8">
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => navigate(item.id)}
                className={`text-[11px] font-bold uppercase tracking-widest transition-all flex items-center gap-2 italic ${activeView === item.id ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-900'}`}
              >
                <item.icon size={14} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-5">
          <button onClick={() => navigate('registry')} className={`p-3 rounded-2xl transition-all ${activeView === 'registry' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}>
            <User size={20} />
          </button>
          <button onClick={() => setIsExitModalOpen(true)} className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all">
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
            {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
            {activeView === 'registry' && <UserProfile lang={lang} />}
            {activeView === 'science' && <ScienceView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'faq' && <FAQView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'support' && <SupportView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'about' && <AboutView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'admin' && <AdminDashboard />}
          </m.div>
        </AnimatePresence>
      </main>

      <ExitFeedbackModal 
        isOpen={isExitModalOpen} 
        lang={lang} 
        onConfirmLogout={confirmLogout} 
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