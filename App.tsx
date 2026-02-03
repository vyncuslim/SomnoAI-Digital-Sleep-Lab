
import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen, FlaskConical, Fingerprint, LockKeyhole, LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Logo } from './components/Logo.tsx';
import { getSafeHash } from './services/navigation.ts';
import { trackPageView } from './services/analytics.ts';
import { authApi } from './services/supabaseService.ts';

// Components
import AdminDashboard from './app/admin/page.tsx';
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
import { SupportView } from './components/SupportView.tsx';
import { AboutView } from './components/AboutView.tsx';
import { UpdatePasswordView } from './components/UpdatePasswordView.tsx';
import { UserProfile } from './components/UserProfile.tsx';

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
    <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.8em] italic animate-pulse opacity-80 text-center">Synchronizing Node</p>
  </div>
);

// 封禁终端：红色警戒风格，彻底切断访问
const BlockedTerminal = ({ onLogout }: { onLogout: () => void }) => (
  <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
    <div className="absolute inset-0 bg-rose-600/10 blur-[120px] rounded-full animate-pulse" />
    <div className="w-40 h-40 bg-rose-600/10 border-2 border-rose-600/30 rounded-[3rem] flex items-center justify-center text-rose-600 shadow-[0_0_80px_rgba(225,29,72,0.2)] mb-10">
      <LockKeyhole size={80} strokeWidth={1.5} />
    </div>
    <h2 className="text-5xl font-black italic text-white uppercase tracking-tighter mb-4">Access <span className="text-rose-600">Revoked</span></h2>
    <p className="text-slate-400 text-sm font-medium italic max-w-sm mb-12 leading-relaxed text-center">
      Your laboratory credentials for SomnoAI Digital Sleep Lab have been restricted by the command bridge. Access to the internal grid is strictly forbidden.
    </p>
    <button onClick={onLogout} className="px-12 py-5 bg-white text-slate-950 rounded-full font-black text-xs uppercase tracking-widest flex items-center gap-3 active:scale-95 transition-all shadow-2xl">
      <LogOut size={18} /> DISCONNECT NODE
    </button>
  </div>
);

const AppContent: React.FC = () => {
  const { profile, loading, refresh } = useAuth();
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en'); 
  const [activeView, setActiveView] = useState<ViewType | 'update-password'>('dashboard');
  const [isSimulated, setIsSimulated] = useState(false);

  const handleLogout = useCallback(async () => {
    try { await authApi.signOut(); } finally {
      setIsSimulated(false);
      window.location.href = '/login';
    }
  }, []);

  useEffect(() => {
    const bridgeRouting = () => {
      // 优先解析路径名 (Clean URL)，用于直接访问场景
      const path = window.location.pathname.replace(/^\/+/, '');
      // 兼容 Hash 路由
      const hash = getSafeHash().replace(/^#+/, '').replace(/^\/+/, '');
      const route = path || hash || 'dashboard';

      // 路径清洗与重定向逻辑
      if (route === 'login') { setActiveView('dashboard'); return; }
      if (route === 'signup' || route === 'sign-in') { setActiveView('dashboard'); return; }
      if (route === 'about') { setActiveView('about'); return; }
      if (route === 'admin') { setActiveView('admin'); return; }

      const mappings: Record<string, ViewType | 'update-password'> = {
        'dashboard': 'dashboard', 'calendar': 'calendar', 'assistant': 'assistant',
        'experiment': 'experiment', 'diary': 'diary', 'settings': 'settings',
        'feedback': 'feedback', 'about': 'about', 'admin': 'admin', 'support': 'support',
        'registry': 'registry', 'update-password': 'update-password'
      };

      if (mappings[route]) {
        setActiveView(mappings[route]);
      } else if (profile || isSimulated) {
        setActiveView('dashboard');
      }
      
      trackPageView(`/${route}`, `SomnoAI: ${route.toUpperCase()}`);
    };
    
    window.addEventListener('hashchange', bridgeRouting);
    window.addEventListener('popstate', bridgeRouting);
    bridgeRouting();
    return () => {
      window.removeEventListener('hashchange', bridgeRouting);
      window.removeEventListener('popstate', bridgeRouting);
    };
  }, [profile, loading, isSimulated]);

  // 【核心补丁】全域封禁拦截
  if (profile?.is_blocked) return <BlockedTerminal onLogout={handleLogout} />;
  if (loading) return <DecisionLoading />;

  const renderContent = () => {
    const path = window.location.pathname.replace(/^\/+/, '');
    
    // 强制专用登录/注册页面
    if (!profile && !isSimulated) {
      if (path === 'login') return <UserLoginPage onSuccess={() => { window.location.href = '/dashboard'; }} onSandbox={() => setIsSimulated(true)} lang={lang} mode="login" />;
      if (path === 'signup' || path === 'sign-in') return <UserSignupPage onSuccess={() => { window.location.href = '/dashboard'; }} onSandbox={() => setIsSimulated(true)} lang={lang} />;
    }

    if (activeView === 'update-password') return <UpdatePasswordView onSuccess={() => setActiveView('dashboard')} />;
    if (activeView === 'about') return <AboutView lang={lang} onBack={() => setActiveView(profile || isSimulated ? 'settings' : 'dashboard')} onNavigate={(v) => {
      if (v === 'login' || v === 'signup') {
         window.location.href = `/${v}`;
      } else {
         setActiveView(v as any);
      }
    }} />;

    if (profile || isSimulated) {
      if (profile?.role === 'user' && !profile.full_name) return <FirstTimeSetup onComplete={() => refresh()} />;
      if (activeView === 'admin') return <ProtectedRoute level="admin"><AdminDashboard /></ProtectedRoute>;

      return (
        <div className="w-full flex flex-col min-h-screen">
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-6 md:pt-10 pb-48">
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeView === 'dashboard' && <Dashboard data={MOCK_RECORD} lang={lang} onNavigate={setActiveView} />}
                {activeView === 'calendar' && <Trends history={[MOCK_RECORD]} lang={lang} />}
                {activeView === 'assistant' && <AIAssistant lang={lang} data={MOCK_RECORD} isSandbox={isSimulated} />}
                {activeView === 'experiment' && <ExperimentView data={MOCK_RECORD} lang={lang} />}
                {activeView === 'diary' && <DiaryView lang={lang} />}
                {activeView === 'registry' && <UserProfile lang={lang} />}
                {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView} />}
                {activeView === 'feedback' && <FeedbackView lang={lang} onBack={() => setActiveView('support')} />}
                {activeView === 'support' && <SupportView lang={lang} onBack={() => setActiveView('settings')} onNavigate={setActiveView} />}
              </m.div>
            </AnimatePresence>
          </main>
          
          <div className="fixed bottom-6 md:bottom-12 left-0 right-0 z-[60] px-4 md:px-6 flex justify-center pointer-events-none pb-safe">
            <m.nav initial={{ y: 100 }} animate={{ y: 0 }} className="bg-[#0a0f25]/90 backdrop-blur-3xl border border-white/5 rounded-full p-1.5 md:p-2 flex gap-1 pointer-events-auto shadow-2xl overflow-x-auto no-scrollbar">
              {[
                { id: 'dashboard', icon: Moon, label: 'LAB' },
                { id: 'calendar', icon: History, label: 'HIST' },
                { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
                { id: 'experiment', icon: FlaskConical, label: 'EXP' },
                { id: 'registry', icon: Fingerprint, label: 'REG' },
                { id: 'diary', icon: BookOpen, label: 'LOG' },
                { id: 'settings', icon: SettingsIcon, label: 'CFG' }
              ].map((nav) => (
                <button key={nav.id} onClick={() => {
                  window.history.pushState(null, '', `/${nav.id}`);
                  setActiveView(nav.id as any);
                }} className={`relative flex items-center gap-2 md:gap-3 px-4 md:px-6 py-3 md:py-4 rounded-full transition-all duration-500 shrink-0 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-600 hover:text-slate-300'}`}>
                  <nav.icon size={16} />
                  {activeView === nav.id && <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest whitespace-nowrap">{nav.label}</span>}
                </button>
              ))}
            </m.nav>
          </div>
        </div>
      );
    }

    // 默认回退到干净的登录页
    return <UserLoginPage onSuccess={() => { window.location.href = '/dashboard'; }} onSandbox={() => setIsSimulated(true)} lang={lang} mode="login" />;
  };

  return <RootLayout>{renderContent()}</RootLayout>;
};

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
