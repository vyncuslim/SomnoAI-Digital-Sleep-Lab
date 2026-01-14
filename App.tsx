
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, ShieldCheck, User, BrainCircuit } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { supabase } from './lib/supabaseClient.ts';

const LoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminPage = lazy(() => import('./app/admin/page.tsx'));

import { Dashboard } from './components/Dashboard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));

const m = motion as any;

const LoadingSpinner = ({ label = "Initializing..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center bg-[#020617]">
    <div className="relative">
      <Loader2 size={48} className="animate-spin text-indigo-500 opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
      </div>
    </div>
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-[0.4em] animate-pulse">{label}</p>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en');
  const [session, setSession] = useState<any>(null);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  
  // Use Hash Routing to prevent pushState origin errors and 404s
  const getHashRoute = () => {
    const hash = window.location.hash.replace('#', '').toLowerCase();
    return hash || '/';
  };

  const [activeRoute, setActiveRoute] = useState<string>(getHashRoute());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialAuthCheck(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (session) {
        // Successful login redirect logic using hash
        const currentHash = getHashRoute();
        if (currentHash === 'login' || currentHash === 'admin/login') {
          navigateTo(currentHash.includes('admin') ? 'admin' : '/');
        }
      } else {
        // Auto redirect to login if no session and not already on a login page
        const currentHash = getHashRoute();
        if (currentHash !== 'login' && currentHash !== 'admin/login') {
          navigateTo('login');
        }
      }
    });

    const handleHashChange = () => setActiveRoute(getHashRoute());
    window.addEventListener('hashchange', handleHashChange);
    if ((window as any).dismissLoader) (window as any).dismissLoader();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  const navigateTo = (path: string) => {
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    // We use window.location.hash directly to avoid pushState cross-origin issues
    window.location.hash = cleanPath || '/';
  };

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
    try {
      onProgress?.('authorizing');
      await healthConnect.authorize(forcePrompt);
      onProgress?.('fetching');
      const healthData = await healthConnect.fetchSleepData();
      const updatedRecord = { id: `health-${Date.now()}`, ...healthData } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      onProgress?.('analyzing');
      const insights = await getSleepInsight(updatedRecord, lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
      localStorage.setItem('somno_last_sync', new Date().toLocaleString());
      onProgress?.('success');
    } catch (err: any) {
      onProgress?.('error');
      setErrorToast(err.message || "Sync Failed");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  if (isInitialAuthCheck) {
    return <LoadingSpinner label="Synchronizing Identity Node..." />;
  }

  const renderRoute = (): React.ReactNode => {
    if (!session) {
      if (activeRoute === 'admin/login') return <LoginPage isAdminPortal={true} />;
      return <LoginPage isAdminPortal={false} />;
    }

    if (activeRoute === 'login' || activeRoute === 'admin/login') {
      return activeRoute.includes('admin') ? <AdminPage /> : renderLab();
    }

    if (activeRoute === 'admin') return <AdminPage />;
    
    return renderLab();
  };

  const renderLab = () => (
    <div className="max-w-4xl mx-auto p-4 pt-10 pb-40">
      <AnimatePresence mode="wait">
        <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {activeView === 'dashboard' ? (
            currentRecord ? (
              <Dashboard data={currentRecord} lang={lang} onSyncHealth={(p) => handleSyncHealthConnect(false, p)} onNavigate={setActiveView} />
            ) : (
              <div className="flex items-center justify-center h-[70vh]">
                <button onClick={() => handleSyncHealthConnect(true)} className="px-8 py-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-indigo-600 hover:text-white transition-all">Initialize Digital Handshake</button>
              </div>
            )
          ) : activeView === 'calendar' ? (
            <Trends history={history} lang={lang} />
          ) : activeView === 'assistant' ? (
            <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} />
          ) : activeView === 'profile' ? (
            <Settings 
              lang={lang} onLanguageChange={setLang} onLogout={() => supabase.auth.signOut()} onNavigate={setActiveView}
              theme="dark" onThemeChange={() => {}} accentColor="indigo" onAccentChange={() => {}}
              threeDEnabled={true} onThreeDChange={() => {}} staticMode={false} onStaticModeChange={() => {}}
              lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={() => handleSyncHealthConnect(true)}
            />
          ) : null}
        </m.div>
      </AnimatePresence>

      <div className="fixed bottom-12 left-0 right-0 z-[60] px-10 flex justify-center pointer-events-none">
        <nav className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-2 pointer-events-auto shadow-2xl">
          {[
            { id: 'dashboard', icon: Activity, label: 'LAB' },
            { id: 'calendar', icon: Zap, label: 'TRND' },
            { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
            { id: 'profile', icon: User, label: 'CFG' }
          ].map((nav) => (
            <button 
              key={nav.id} 
              onClick={() => {
                if (activeRoute !== '/') navigateTo('/');
                setActiveView(nav.id as any);
              }} 
              className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${activeView === nav.id && (activeRoute === '/' || activeRoute === '') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <nav.icon size={20} />
              {activeView === nav.id && (activeRoute === '/' || activeRoute === '') && <m.span layoutId="nav-text" className="text-[10px] font-black uppercase tracking-widest">{nav.label}</m.span>}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );

  return (
    <RootLayout>
      <Suspense fallback={<LoadingSpinner label="Decrypting Laboratory Node..." />}>
        {renderRoute()}
      </Suspense>
    </RootLayout>
  );
};

export default App;
