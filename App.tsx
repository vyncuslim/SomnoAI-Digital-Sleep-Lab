
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Auth } from './Auth.tsx';
import { ViewType, SleepRecord, SyncStatus, ThemeMode, AccentColor } from './types.ts';
import { User, Loader2, Activity, Zap, TriangleAlert, RefreshCw, ExternalLink, Shield } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { translations, Language } from './services/i18n.ts';
import { SpatialIcon } from './components/SpatialIcon.tsx';
import { LegalView } from './components/LegalView.tsx';
import { supabase } from './services/supabaseService.ts';
import { AdminView } from './components/AdminView.tsx';

const m = motion as any;

const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));
const AboutView = lazy(() => import('./components/AboutView.tsx').then(m => ({ default: m.AboutView })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
    <Loader2 size={40} className="animate-spin text-indigo-500 opacity-50" />
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Initialising Laboratory Systems...</p>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en');
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('somno_theme') as ThemeMode) || 'dark');
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('somno_accent') as AccentColor) || 'indigo');
  const [threeDEnabled, setThreeDEnabled] = useState<boolean>(() => localStorage.getItem('somno_3d') !== 'false');
  const [staticMode, setStaticMode] = useState<boolean>(() => localStorage.getItem('somno_static') === 'true');
  
  const [isLoggedIn, setIsLoggedIn] = useState(healthConnect.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | 'privacy' | 'terms' | 'admin'>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [requestedAdminFlow, setRequestedAdminFlow] = useState(window.location.pathname.startsWith('/admin'));

  // Global Session Manager
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAdmin(true);
        setIsLoggedIn(true);
        if (window.location.pathname.includes('/admin')) {
          setActiveView('admin');
        }
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAdmin(true);
        setIsLoggedIn(true);
        setRequestedAdminFlow(false);
        setActiveView('admin');
      } else {
        setIsAdmin(false);
        if (activeView === 'admin') setActiveView('dashboard');
      }
    });

    return () => subscription.unsubscribe();
  }, [activeView]);

  // View Sync with Browser History
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\//, '');
      if (path === 'admin') {
        setRequestedAdminFlow(true);
        setActiveView('admin');
      } else {
        setRequestedAdminFlow(false);
        setActiveView((path || 'dashboard') as any);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    // SECURITY: Prevent SecurityError in sandboxed environments (blob URLs, usercontent.goog, etc.)
    const isSandbox = 
      window.location.protocol.includes('blob') || 
      window.location.origin === 'null' ||
      window.location.hostname === '' ||
      window.location.hostname.includes('usercontent.goog') ||
      window.location.hostname.includes('googleusercontent.com') ||
      window.location.hostname.includes('ai.studio');

    if (isSandbox) return;

    const targetPath = activeView === 'dashboard' ? '/' : `/${activeView}`;
    
    try {
      if (window.location.pathname !== targetPath) {
        // Use relative path to avoid origin mismatch issues
        window.history.pushState({ view: activeView }, '', targetPath);
      }
    } catch (e) {
      // Silently fail navigation history update if restricted, app state remains valid
      console.warn("SomnoAI: Navigation restricted by environment security policies.");
    }
  }, [activeView]);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
    try {
      onProgress?.('authorizing');
      await healthConnect.authorize(forcePrompt);
      setIsLoggedIn(true);
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
      setErrorToast(err.message || "Telemetry Sync Failed");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (isLoggedIn && !currentRecord && !isLoading && !isAdmin) {
      handleSyncHealthConnect(false);
    }
  }, [isLoggedIn, isAdmin, currentRecord, isLoading, handleSyncHealthConnect]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    healthConnect.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setIsAdmin(false);
    setRequestedAdminFlow(false);
    setCurrentRecord(null);
    localStorage.removeItem('health_connect_token');
    
    // Only attempt origin-relative redirect if not in a sandbox
    if (!window.location.protocol.includes('blob')) {
      window.location.href = '/';
    }
  };

  const isPublicView = activeView === 'privacy' || activeView === 'terms' || activeView === 'about';
  const showAuthScreen = (!isLoggedIn && !isGuest && !isPublicView) || (requestedAdminFlow && !isAdmin);

  return (
    <div className={`flex-1 flex flex-col min-h-screen relative`}>
      <main className="flex-1 w-full mx-auto p-4 pt-10 pb-40">
        {showAuthScreen ? (
          <Auth 
            lang={lang} 
            isAdminFlow={requestedAdminFlow} 
            onLogin={() => {
              setIsLoggedIn(true);
              if (requestedAdminFlow) setActiveView('admin');
            }} 
            onGuest={() => setIsGuest(true)} 
            onNavigate={setActiveView} 
          />
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeView === 'admin' ? (
                  isAdmin ? <AdminView /> : <div className="p-20 text-center uppercase font-black italic text-slate-700">Restricted Laboratory Area</div>
                ) : activeView === 'privacy' || activeView === 'terms' ? (
                  <LegalView type={activeView as any} lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'about' ? (
                  <AboutView lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'dashboard' ? (
                  currentRecord ? (
                    <Dashboard data={currentRecord} lang={lang} onSyncHealth={(p) => handleSyncHealthConnect(false, p)} onNavigate={setActiveView} staticMode={staticMode} />
                  ) : <LoadingSpinner />
                ) : activeView === 'calendar' ? (
                  <Trends history={history} lang={lang} />
                ) : activeView === 'assistant' ? (
                  <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} />
                ) : activeView === 'profile' ? (
                  <Settings 
                    lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView}
                    theme={theme} onThemeChange={setTheme} accentColor={accentColor} onAccentChange={setAccentColor}
                    threeDEnabled={threeDEnabled} onThreeDChange={setThreeDEnabled} staticMode={staticMode} onStaticModeChange={setStaticMode}
                    lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={() => handleSyncHealthConnect(true)}
                  />
                ) : null}
              </m.div>
            </AnimatePresence>
          </Suspense>
        )}
      </main>

      {(isLoggedIn || isGuest) && !isPublicView && (
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-10 flex justify-center pointer-events-none">
          <nav className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-2 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Logo, label: 'LAB' },
              { id: 'calendar', icon: Activity, label: 'TRND' },
              { id: 'assistant', icon: Zap, label: 'CORE' },
              { id: isAdmin ? 'admin' : 'profile', icon: isAdmin ? Shield : User, label: isAdmin ? 'ADM' : 'CFG' }
            ].map((nav) => {
              const isActive = activeView === nav.id;
              return (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveView(nav.id as any)} 
                  className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${isActive ? (isAdmin ? 'bg-rose-600' : 'bg-indigo-600') + ' text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <SpatialIcon icon={nav.icon} size={20} animated={isActive} threeD={threeDEnabled} color={isActive ? '#fff' : '#475569'} />
                  {isActive && <m.span layoutId="nav-text" className="text-[10px] font-black uppercase tracking-widest">{nav.label}</m.span>}
                </button>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};
export default App;
