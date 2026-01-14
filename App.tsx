import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { supabase } from './lib/supabaseClient.ts';
import { adminApi } from './services/supabaseService.ts';

// Lazy load specific pages
const UserLoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminDashboard = lazy(() => import('./app/admin/page.tsx'));
const AdminLoginPage = lazy(() => import('./app/admin/login/page.tsx'));
const LegalView = lazy(() => import('./components/LegalView.tsx').then(m => ({ default: m.LegalView })));

import { Dashboard } from './components/Dashboard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));

const m = motion as any;

const LoadingSpinner = ({ label = "Synchronizing..." }: { label?: string }) => (
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
  
  const getNormalizedRoute = useCallback(() => {
    let path = window.location.pathname.toLowerCase();
    
    // Clean trailing slashes
    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    // Direct path mapping for SPA routing
    if (path === '/login') return 'login';
    if (path === '/admin') return 'admin';
    if (path === '/admin/login') return 'admin-login';
    if (path === '/terms') return 'terms';
    if (path === '/privacy') return 'privacy';

    // Hash fallback/support
    let hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash.startsWith('/')) hash = hash.slice(1);
    if (hash === 'login') return 'login';
    if (hash === 'admin') return 'admin';
    
    return path === '/' ? '/' : path.slice(1);
  }, []);

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedRoute());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);

  const navigateTo = (path: string) => {
    const finalPath = path.startsWith('/') ? path : '/' + path;
    window.history.pushState({}, '', finalPath);
    setActiveRoute(getNormalizedRoute());
  };

  useEffect(() => {
    document.title = "SomnoAI Digital Sleep Lab | AI-Powered Biometric Insights";

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitialAuthCheck(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      const currentRoute = getNormalizedRoute();
      
      if (session) {
        // Handle post-login redirection logic
        if (currentRoute === 'login') navigateTo('/');
        if (currentRoute === 'admin-login') navigateTo('/admin');
      }
    });

    const handleRouteChange = () => setActiveRoute(getNormalizedRoute());
    window.addEventListener('popstate', handleRouteChange);
    
    if ((window as any).dismissLoader) (window as any).dismissLoader();
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      subscription.unsubscribe();
    };
  }, [getNormalizedRoute]);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
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
    }
  }, [lang]);

  if (isInitialAuthCheck) {
    return <LoadingSpinner label="Decrypting Laboratory Node..." />;
  }

  const renderContent = () => {
    const route = activeRoute === '' ? '/' : activeRoute;

    // Public / Legal Routes
    if (route === 'terms') return <LegalView type="terms" lang={lang} onBack={() => navigateTo('/')} />;
    if (route === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => navigateTo('/')} />;
    
    // Auth Portal Routes
    if (route === 'login') return <UserLoginPage />;
    if (route === 'admin-login') return <AdminLoginPage />;

    // Protected Admin Context
    if (route === 'admin') {
      return <AdminDashboard />;
    }

    // Main App logic - default to login if no session
    if (!session) {
      return <UserLoginPage />;
    }

    return (
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
                  if (window.location.pathname !== '/') navigateTo('/');
                  setActiveView(nav.id as any);
                }} 
                className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${activeView === nav.id && (activeRoute === '/' || activeRoute === 'index.html') ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <nav.icon size={20} />
                {activeView === nav.id && (activeRoute === '/' || activeRoute === 'index.html') && <m.span layoutId="nav-text" className="text-[10px] font-black uppercase tracking-widest">{nav.label}</m.span>}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <Suspense fallback={<LoadingSpinner label="Accessing Core Protocols..." />}>
        <div className="min-h-screen">
          {renderContent()}
        </div>
      </Suspense>
    </RootLayout>
  );
};

export default App;