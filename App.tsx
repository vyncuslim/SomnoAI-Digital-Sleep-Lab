import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen, ShieldAlert, FlaskConical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';

// Components
import AdminDashboard from './app/admin/page.tsx';
import AdminLoginPage from './app/admin/login/page.tsx';
import UserLoginPage from './app/login/page.tsx';
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
  heartRate: {
    resting: 58,
    max: 75,
    min: 48,
    average: 62,
    history: []
  },
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
       <div className="w-48 h-[1px] bg-white/5 mx-auto relative overflow-hidden">
          <m.div 
            animate={{ x: ['-100%', '100%'] }} 
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-indigo-500/40 w-1/2"
          />
       </div>
    </div>
  </div>
);

const AppContent: React.FC = () => {
  const { profile, loading, isOwner, isAdmin } = useAuth();
  const [lang, setLang] = useState<Language>('en'); 
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSimulated, setIsSimulated] = useState(false);

  const safeNavigate = useCallback((viewId: string) => {
    setActiveView(viewId as ViewType);
    try {
      if (typeof window !== 'undefined' && window.location) {
        window.location.hash = `#/${viewId}`;
      }
    } catch (e) {
      console.warn("Security: Navigation hash update blocked. Using internal state only.");
    }
  }, []);

  useEffect(() => {
    const handleHash = () => {
      let h = '';
      try {
        h = window.location.hash || '';
      } catch (e) {
        return;
      }
      
      const path = h.replace(/^#\/?/, '');
      
      // Default view logic
      if (path === '' || path === 'dashboard') {
        setActiveView('dashboard');
        return;
      }

      // Route mapping
      if (path.includes('admin/login')) { setActiveView('admin-login'); return; }
      if (path.includes('admin')) { setActiveView('admin'); return; }
      if (path.includes('calendar')) { setActiveView('calendar'); return; }
      if (path.includes('assistant')) { setActiveView('assistant'); return; }
      if (path.includes('experiment')) { setActiveView('experiment'); return; }
      if (path.includes('diary')) { setActiveView('diary'); return; }
      if (path.includes('settings')) { setActiveView('settings'); return; }
      if (path.includes('feedback')) { setActiveView('feedback'); return; }
      if (path.includes('privacy')) { setActiveView('privacy'); return; }
      if (path.includes('terms')) { setActiveView('terms'); return; }
      if (path.includes('profile')) { setActiveView('profile'); return; }
      if (path.includes('about')) { setActiveView('about'); return; }

      // If no paths match, only then show Not Found
      setActiveView('not-found');
    };
    
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) return <DecisionLoading />;

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'not-found') return <NotFoundView />;
    
    if (activeView === 'admin') {
      return (
        <ProtectedRoute level="admin">
          <AdminDashboard />
        </ProtectedRoute>
      );
    }

    if (!profile && !isSimulated) {
      return (
        <UserLoginPage 
          onSuccess={() => safeNavigate('dashboard')} 
          onSandbox={() => setIsSimulated(true)} 
          lang={lang} 
        />
      );
    }

    if (profile && profile.role === 'user' && !profile.full_name && !isSimulated) {
       return <FirstTimeSetup onComplete={() => window.location.reload()} />;
    }

    return (
      <div className="w-full flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-10 pb-48">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === 'dashboard' && <Dashboard data={MOCK_RECORD} lang={lang} onNavigate={setActiveView} />}
              {activeView === 'calendar' && <Trends history={[MOCK_RECORD]} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={MOCK_RECORD} />}
              {activeView === 'experiment' && <ExperimentView data={MOCK_RECORD} lang={lang} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => {}} onNavigate={() => {}} />}
              {activeView === 'feedback' && <FeedbackView lang={lang} onBack={() => safeNavigate('settings')} />}
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
              <button 
                key={nav.id} 
                onClick={() => safeNavigate(nav.id)} 
                className={`relative flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}
              >
                <nav.icon size={18} />
                {activeView === nav.id && (
                  <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
                )}
              </button>
            ))}
            
            {isAdmin && (
              <button 
                onClick={() => safeNavigate('admin')} 
                className={`relative flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 ${(activeView as string) === 'admin' ? 'bg-rose-600 text-white' : 'text-rose-500/50 hover:text-rose-500'}`}
              >
                <ShieldAlert size={18} />
                {(activeView as string) === 'admin' && (
                  <span className="text-[9px] font-black uppercase tracking-widest">ADMIN</span>
                )}
              </button>
            )}
          </m.nav>
        </div>
      </div>
    );
  };

  return <RootLayout>{renderContent()}</RootLayout>;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;