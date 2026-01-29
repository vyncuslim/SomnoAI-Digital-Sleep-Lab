
import React, { useState, useEffect } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen
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
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center bg-[#020617] z-[9999]">
    <Logo size={120} animated={true} />
    <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.6em] italic animate-pulse">Initializing Neural Link</p>
  </div>
);

const AppContent: React.FC = () => {
  const { profile, loading, isAdmin } = useAuth();
  const [lang, setLang] = useState<Language>('en'); 
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash || '#/';
      if (h.includes('admin/login')) setActiveView('admin-login');
      else if (h.includes('admin')) setActiveView('admin');
      else if (h.includes('calendar')) setActiveView('calendar');
      else if (h.includes('assistant')) setActiveView('assistant');
      else if (h.includes('diary')) setActiveView('diary');
      else if (h.includes('settings')) setActiveView('settings');
      else setActiveView('dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (loading) return <DecisionLoading />;

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    
    // Protect the admin dashboard
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
          onSuccess={() => window.location.reload()} 
          onSandbox={() => setIsSimulated(true)} 
          lang={lang} 
        />
      );
    }

    // Check if initialization is needed for real users
    if (profile && !profile.is_blocked && profile.role === 'user' && !profile.full_name && !isSimulated) {
       // Using full_name as proxy for is_initialized in this simplified logic
       // Actual DB check is preferred
       return <FirstTimeSetup onComplete={() => window.location.reload()} />;
    }

    return (
      <div className="w-full flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-10 pb-48">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === 'dashboard' && <Dashboard data={MOCK_RECORD} lang={lang} />}
              {activeView === 'calendar' && <Trends history={[MOCK_RECORD]} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={MOCK_RECORD} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => {}} onNavigate={() => {}} />}
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
              { id: 'diary', icon: BookOpen, label: 'LOG' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => window.location.hash = `#/${nav.id}`} 
                className={`relative flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 ${activeView === nav.id ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-300'}`}
              >
                <nav.icon size={18} />
                {activeView === nav.id && (
                  <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
                )}
              </button>
            ))}
          </nav>
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
