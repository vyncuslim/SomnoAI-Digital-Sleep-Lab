import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  LayoutDashboard, TrendingUp, Sparkles, FlaskConical, 
  User, Settings as SettingsIcon, LogOut, Moon, 
  ChevronDown, BookOpen, Menu, X, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { trackPageView } from './services/analytics.ts';
import { authApi } from './services/supabaseService.ts';
import { safeNavigatePath } from './services/navigation.ts';

// Components
import AdminDashboard from './app/admin/page.tsx';
import AdminLoginPage from './app/admin/login/page.tsx';
import UserLoginPage from './app/login/page.tsx';
import UserSignupPage from './app/signup/page.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
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
import { DataEntry } from './components/DataEntry.tsx';
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
  stages: [
    { name: 'Awake', duration: 30, startTime: '23:30' },
    { name: 'Light', duration: 250, startTime: '00:00' },
    { name: 'Deep', duration: 100, startTime: '02:00' },
    { name: 'REM', duration: 80, startTime: '05:00' },
  ],
  heartRate: { resting: 58, max: 75, min: 48, average: 62, history: [] },
  aiInsights: ["Biometric sync confirmed.", "Optimal deep sleep window identified."]
};

const AppContent: React.FC = () => {
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'zh'); 
  const [currentRecord, setCurrentRecord] = useState<SleepRecord>(INITIAL_MOCK_RECORD);
  const [isInjectionOpen, setIsInjectionOpen] = useState(false);
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  
  const resolveViewFromLocation = useCallback((): ViewType => {
    if (typeof window === 'undefined') return 'landing';
    const path = window.location.pathname.toLowerCase().replace(/\/$/, '') || '/';
    
    if (path === '' || path === '/' || path === '/landing') return 'landing';
    if (path === '/admin/login') return 'admin-login';
    if (path === '/admin') return 'admin';
    if (path === '/signup') return 'signup';
    if (path === '/login') return 'login';
    if (path === '/dashboard') return 'dashboard';
    if (path === '/assistant') return 'assistant';
    if (path === '/calendar') return 'calendar';
    if (path === '/experiment') return 'experiment';
    if (path === '/settings') return 'settings';
    if (path === '/diary') return 'diary';
    if (path === '/registry') return 'registry';
    if (path === '/science') return 'science';
    if (path === '/faq') return 'faq';
    if (path === '/support') return 'support';
    if (path === '/about') return 'about';
    
    return 'landing';
  }, []);

  const [activeView, setActiveView] = useState<ViewType>(resolveViewFromLocation());

  const navigate = (view: string) => {
    safeNavigatePath(`/${view}`);
  };

  useEffect(() => {
    const handleRouting = () => {
      if (loading) return;
      const nextView = resolveViewFromLocation();
      setActiveView(nextView);
      trackPageView(window.location.pathname, `SomnoAI: ${nextView.toUpperCase()}`);
    };
    window.addEventListener('popstate', handleRouting);
    handleRouting();
    return () => window.removeEventListener('popstate', handleRouting);
  }, [loading, resolveViewFromLocation]);

  const confirmLogout = async () => {
    await authApi.signOut();
    setIsExitModalOpen(false);
    window.location.href = '/';
  };

  if (loading) return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#010409]">
      <Logo size={80} animated={true} />
    </div>
  );

  // Unauthenticated Flow
  if (!profile) {
    if (activeView === 'admin-login') return <AdminLoginPage />;
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
    { id: 'diary', icon: BookOpen, label: lang === 'zh' ? '日志' : 'Logs' },
    { id: 'registry', icon: User, label: lang === 'zh' ? '资料' : 'Profile' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#010409]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050a1f]/60 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('dashboard')}>
              <Logo size={34} animated={true} />
              <div className="flex flex-col">
                <span className="text-xl font-black italic tracking-tighter text-white uppercase leading-none">SomnoAI</span>
                <span className="text-[7px] font-black uppercase tracking-[0.4em] text-indigo-500 mt-1 opacity-60">Digital Lab</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-8">
              {navItems.map(item => (
                <button 
                  key={item.id} 
                  onClick={() => navigate(item.id)}
                  className={`text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-2 italic ${activeView === item.id ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                >
                  <item.icon size={14} className={activeView === item.id ? 'animate-pulse' : ''} />
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <button 
              onClick={() => setIsInjectionOpen(true)}
              className="hidden md:flex items-center gap-3 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/20 active:scale-95 italic"
            >
              <FlaskConical size={14} /> Log Telemetry
            </button>
            <div className="h-8 w-px bg-white/5" />
            <button onClick={() => navigate('settings')} className={`p-3 rounded-2xl transition-all ${activeView === 'settings' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-white/5 text-slate-500 hover:text-white'}`}>
              <SettingsIcon size={20} />
            </button>
            <button onClick={() => setIsExitModalOpen(true)} className="p-3 bg-white/5 rounded-2xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={20} />
            </button>
          </div>
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
            {activeView === 'registry' && <UserProfile lang={lang} />}
            {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => setIsExitModalOpen(true)} onNavigate={navigate} />}
            {activeView === 'science' && <ScienceView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'faq' && <FAQView lang={lang} onBack={() => navigate('dashboard')} />}
            {activeView === 'support' && <SupportView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'about' && <AboutView lang={lang} onBack={() => navigate('dashboard')} onNavigate={navigate} />}
            {activeView === 'admin' && <AdminDashboard />}
          </m.div>
        </AnimatePresence>
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050a1f]/80 backdrop-blur-2xl border-t border-white/5 px-6 py-4 flex justify-between items-center shadow-[0_-20px_40px_rgba(0,0,0,0.4)]">
        {navItems.slice(0, 4).map(item => (
          <button 
            key={item.id} 
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center gap-2 flex-1 transition-all ${activeView === item.id ? 'text-indigo-400' : 'text-slate-600'}`}
          >
            <item.icon size={22} />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      {isInjectionOpen && (
        <DataEntry 
          onClose={() => setIsInjectionOpen(false)} 
          onSave={(rec) => { setCurrentRecord(rec); setIsInjectionOpen(false); }} 
        />
      )}

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