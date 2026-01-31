
import React, { useState, useEffect, useCallback, Component, ErrorInfo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen, ShieldAlert, FlaskConical, RefreshCw, Home, AlertOctagon
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

/**
 * Neural Error Boundary - Captures runtime node crashes
 */
// Fix: Added explicit interfaces for props and state to ensure 'state' and 'props' are correctly typed in ErrorBoundary
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // Initialize state properly
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }
  componentDidCatch(error: any, errorInfo: ErrorInfo) {
    console.error("CRITICAL_NODE_CRASH:", error, errorInfo);
  }
  render() {
    // Fix: Correctly access this.state after defining the state interface
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-10 text-center">
          <div className="w-32 h-32 bg-rose-500/10 rounded-full flex items-center justify-center mb-10 border border-rose-500/20">
            <AlertOctagon size={64} className="text-rose-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-4 leading-none">Neural Grid Failed</h1>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest mb-10 max-w-xs mx-auto">A fatal execution error occurred in the laboratory runtime.</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={() => window.location.href = '/'} className="px-10 py-5 bg-white text-black rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"><Home size={16}/> Reset Node</button>
            <button onClick={() => window.location.reload()} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"><RefreshCw size={16}/> Reload Link</button>
          </div>
        </div>
      );
    }
    // Fix: Correctly access this.props after defining the props interface
    return this.props.children;
  }
}

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
          <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.8em] italic animate-pulse opacity-80">Initializing Neural Link</p>
          <p className="text-slate-700 text-[8px] font-black uppercase tracking-widest">Protocol Handshake • Node v22.4</p>
       </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>('en'); 
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [authMode, setAuthMode] = useState<'login' | 'join'>('login');
  const [isSimulated, setIsSimulated] = useState(false);

  const safeNavigate = useCallback((viewId: string) => {
    setActiveView(viewId as ViewType);
    safeNavigateHash(viewId);
  }, []);

  // Neural Dispatcher
  useEffect(() => {
    const bridgeRouting = () => {
      const pathOnly = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hashRaw = getSafeHash();
      const hashOnly = hashRaw.replace(/^#+/, '').replace(/^\/+/, '').replace(/\/+$/, '');
      
      // Auto-rebase if physically stuck on auth pages while logged in
      if (profile) {
        if (['login', 'signup', 'signin'].includes(pathOnly)) {
           window.history.replaceState(null, '', '/#dashboard');
           setActiveView('dashboard');
           return;
        }
        if (!hashOnly || hashOnly === 'dashboard' || pathOnly === 'dashboard') {
          setActiveView('dashboard');
          return;
        }
      }

      if (!profile) {
        if (pathOnly === 'signup') { setAuthMode('join'); return; }
        if (pathOnly === 'login' || pathOnly === 'signin') { setAuthMode('login'); return; }
      }
      
      const mappings: Record<string, ViewType> = {
        'dashboard': 'dashboard', 'calendar': 'calendar', 'assistant': 'assistant',
        'experiment': 'experiment', 'diary': 'diary', 'settings': 'settings',
        'feedback': 'feedback', 'about': 'about', 'admin': 'admin', 'admin/login': 'admin-login'
      };

      const target = hashOnly || 'dashboard';
      if (mappings[target]) {
        setActiveView(mappings[target]);
      } else {
        const isLegitRoute = ['login', 'signup', 'dashboard', 'admin', 'signin', ''].includes(pathOnly);
        if (!profile && target !== '' && !isLegitRoute) {
          setActiveView('not-found');
        } else if (profile) {
          setActiveView('dashboard');
        }
      }
    };
    
    window.addEventListener('hashchange', bridgeRouting);
    window.addEventListener('popstate', bridgeRouting);
    bridgeRouting();
    return () => {
      window.removeEventListener('hashchange', bridgeRouting);
      window.removeEventListener('popstate', bridgeRouting);
    };
  }, [profile]);

  if (loading) return <DecisionLoading />;

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (profile && activeView === 'not-found') return <Dashboard data={MOCK_RECORD} lang={lang} onNavigate={safeNavigate} />;
    if (activeView === 'not-found') return <NotFoundView />;
    
    if (activeView === 'admin') {
      return (
        <ProtectedRoute level="admin">
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    if (!profile && !isSimulated) {
      if (authMode === 'join') {
        return <UserSignupPage onSuccess={() => { setActiveView('dashboard'); refresh(); }} onSandbox={() => setIsSimulated(true)} lang={lang} />;
      }
      return <UserLoginPage onSuccess={() => { setActiveView('dashboard'); refresh(); }} onSandbox={() => setIsSimulated(true)} lang={lang} mode={authMode} />;
    }

    if (profile && profile.role === 'user' && !profile.full_name && !isSimulated) {
       return <FirstTimeSetup onComplete={() => refresh()} />;
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
            </m.div>
          </AnimatePresence>
        </main>
        
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <m.nav 
            initial={{ y: 100 }} animate={{ y: 0 }} 
            className="bg-[#0a0f25]/90 backdrop-blur-3xl border border-white/5 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl"
          >
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
  };

  return (
    <ErrorBoundary>
      <RootLayout>{renderContent()}</RootLayout>
    </ErrorBoundary>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
