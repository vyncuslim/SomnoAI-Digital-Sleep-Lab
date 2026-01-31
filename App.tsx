
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen, FlaskConical, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { getSafeHash, safeNavigateHash, safeReload } from './services/navigation.ts';

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
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { ExperimentView } from './components/ExperimentView.tsx';
import { NotFoundView } from './components/NotFoundView.tsx';
import { AboutView } from './components/AboutView.tsx';

const m = motion as any;

const MOCK_RECORD: SleepRecord = {
  id: 'mock-1',
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
  aiInsights: ["Neural handshake stable.", "Deep sleep optimization identified."]
};

const DecisionLoading = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#020617] z-[9999] p-10 overflow-hidden">
    <div className="relative mb-12">
       <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
       <Logo size={160} animated={true} className="mx-auto relative z-10" />
    </div>
    <div className="space-y-6 text-center max-w-xs">
       <div className="space-y-1">
          <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.8em] italic animate-pulse opacity-80">Synchronizing Identity</p>
          <p className="text-slate-700 text-[8px] font-black uppercase tracking-widest">Protocol Handshake • Node v22.4</p>
       </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { profile, loading, refresh, isAdmin } = useAuth();
  const [lang, setLang] = useState<Language>('en'); 
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'join'>('login');
  const [isSimulated, setIsSimulated] = useState(false);

  // 检测 URL 是否处于令牌交换状态
  const isExchangingTokens = useMemo(() => {
    const hash = window.location.hash || '';
    return hash.includes('access_token=') || hash.includes('id_token=') || hash.includes('code=');
  }, []);

  const safeNavigate = useCallback((viewId: string) => {
    setActiveView(viewId as ViewType);
    safeNavigateHash(viewId);
  }, []);

  useEffect(() => {
    // 如果正在交换令牌且 profile 尚未就绪，保持静默状态
    if (isExchangingTokens && !profile && loading) return;

    const bridgeRouting = () => {
      const pathOnly = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hashRaw = getSafeHash();
      const hashOnly = hashRaw.replace(/^#+/, '').replace(/^\/+/, '').replace(/\/+$/, '');
      
      const mappings: Record<string, ViewType> = {
        'dashboard': 'dashboard', 'calendar': 'calendar', 'assistant': 'assistant',
        'experiment': 'experiment', 'diary': 'diary', 'settings': 'settings',
        'feedback': 'feedback', 'about': 'about', 'admin': 'admin', 
        'admin/login': 'admin-login'
      };

      // 核心重定向逻辑
      if (profile && !loading) {
        // 1. 如果带有 OAuth 令牌，强制清洗为 dashboard
        if (hashRaw.includes('access_token=') || hashRaw.includes('id_token=')) {
          window.history.replaceState(null, '', '/#dashboard');
          setActiveView('dashboard');
          return;
        }

        // 2. 如果处于登录/注册路径，强制回 dashboard
        const isAuthRelated = ['login', 'signup', 'signin', 'otp'].some(p => pathOnly === p || hashOnly === p);
        if (isAuthRelated || !hashOnly) {
           window.history.replaceState(null, '', '/#dashboard');
           setActiveView('dashboard');
           return;
        }
      }

      // 未登录态处理
      if (!profile && !loading) {
        if (pathOnly === 'signup' || hashOnly === 'signup') { setAuthMode('join'); return; }
        if (['login', 'signin'].includes(pathOnly) || ['login', 'signin'].includes(hashOnly)) { setAuthMode('login'); return; }
      }
      
      const target = hashOnly || 'dashboard';
      if (mappings[target]) {
        setActiveView(mappings[target]);
      } else if (profile) {
        setActiveView('dashboard');
      }
    };
    
    window.addEventListener('hashchange', bridgeRouting);
    window.addEventListener('popstate', bridgeRouting);
    bridgeRouting();
    return () => {
      window.removeEventListener('hashchange', bridgeRouting);
      window.removeEventListener('popstate', bridgeRouting);
    };
  }, [profile, isAdmin, loading, isExchangingTokens]);

  if (loading || (isExchangingTokens && !profile)) return <DecisionLoading />;

  const renderContent = () => {
    if (profile && !isSimulated) {
      if (profile.role === 'user' && !profile.full_name) {
        return <FirstTimeSetup onComplete={() => refresh()} />;
      }
      
      if (activeView === 'admin-login') {
        if (isAdmin) return <ProtectedRoute level="admin"><AdminDashboard /></ProtectedRoute>;
        return <Dashboard data={MOCK_RECORD} lang={lang} onNavigate={safeNavigate} />;
      }
      
      if (activeView === 'admin') {
        return <ProtectedRoute level="admin"><AdminDashboard /></ProtectedRoute>;
      }

      return (
        <div className="w-full flex flex-col min-h-screen">
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-10 pb-48">
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeView === 'dashboard' && <Dashboard data={MOCK_RECORD} lang={lang} onNavigate={safeNavigate} />}
                {activeView === 'calendar' && <Trends history={[MOCK_RECORD]} lang={lang} />}
                {activeView === 'assistant' && <AIAssistant lang={lang} data={MOCK_RECORD} />}
                {activeView === 'experiment' && <ExperimentView data={MOCK_RECORD} lang={lang} />}
                {activeView === 'diary' && <DiaryView lang={lang} />}
                {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={safeReload} onNavigate={safeNavigate} />}
                {activeView === 'feedback' && <FeedbackView lang={lang} onBack={() => safeNavigate('settings')} />}
                {activeView === 'about' && <AboutView lang={lang} onBack={() => safeNavigate('settings')} />}
                {activeView === 'not-found' && <NotFoundView />}
              </m.div>
            </AnimatePresence>
          </main>
          
          <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
            <m.nav initial={{ y: 100 }} animate={{ y: 0 }} className="bg-[#0a0f25]/90 backdrop-blur-3xl border border-white/5 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
              {[
                { id: 'dashboard', icon: Moon, label: 'LAB' },
                { id: 'calendar', icon: History, label: 'HIST' },
                { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
                { id: 'experiment', icon: FlaskConical, label: 'EXP' },
                { id: 'diary', icon: BookOpen, label: 'LOG' },
                { id: 'settings', icon: SettingsIcon, label: 'CFG' }
              ].map((nav) => (
                <button key={nav.id} onClick={() => safeNavigate(nav.id)} className={`relative flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}>
                  <nav.icon size={18} />
                  {activeView === nav.id && <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>}
                </button>
              ))}
            </m.nav>
          </div>
        </div>
      );
    }

    if (!profile && !isSimulated) {
      if (activeView === 'admin-login') return <AdminLoginPage />;
      if (authMode === 'join') {
        return <UserSignupPage onSuccess={() => refresh()} onSandbox={() => setIsSimulated(true)} lang={lang} />;
      }
      return <UserLoginPage onSuccess={() => refresh()} onSandbox={() => setIsSimulated(true)} lang={lang} mode={authMode} />;
    }

    return <NotFoundView />;
  };

  return (
    <RootLayout>{renderContent()}</RootLayout>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
