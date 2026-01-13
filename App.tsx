
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Auth } from './Auth.tsx';
import { ViewType, SleepRecord, SyncStatus, ThemeMode, AccentColor } from './types.ts';
import { User, Loader2, Activity, Zap, TriangleAlert, RefreshCw, Shield, WifiOff } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { translations, Language } from './services/i18n.ts';
import { SpatialIcon } from './components/SpatialIcon.tsx';
import { LegalView } from './components/LegalView.tsx';
import { supabase, adminApi } from './services/supabaseService.ts';
import { AdminView } from './components/AdminView.tsx';
import { GlassCard } from './components/GlassCard.tsx';

const m = motion as any;

const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));
const AboutView = lazy(() => import('./components/AboutView.tsx').then(m => ({ default: m.AboutView })));

const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
    <div className="relative">
      <Loader2 size={40} className="animate-spin text-indigo-500 opacity-50" />
      <div className="absolute inset-0 flex items-center justify-center">
         <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
      </div>
    </div>
    <p className="text-slate-500 font-black uppercase text-[9px] tracking-widest">
      {label}
    </p>
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
  const [syncPhase, setSyncPhase] = useState<string>("");

  // Dismiss global HTML loader
  useEffect(() => {
    if ((window as any).dismissLoader) {
      (window as any).dismissLoader();
    }
  }, []);

  const checkAdminPrivileges = useCallback(async (userId: string) => {
    const isUserAdmin = await adminApi.checkAdminStatus(userId);
    setIsAdmin(isUserAdmin);
    if (isUserAdmin && window.location.pathname.includes('/admin')) {
      setActiveView('admin');
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsLoggedIn(true);
        checkAdminPrivileges(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsLoggedIn(true);
        setRequestedAdminFlow(false);
        checkAdminPrivileges(session.user.id);
      } else {
        setIsAdmin(false);
        setIsLoggedIn(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [checkAdminPrivileges]);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
    
    // Safety timeout to prevent infinite loading if the biometric link hangs
    const syncTimeout = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setErrorToast("LINK_TIMEOUT");
      }
    }, 15000);

    try {
      onProgress?.('authorizing');
      setSyncPhase("Linking...");
      await healthConnect.authorize(forcePrompt);
      setIsLoggedIn(true);
      
      onProgress?.('fetching');
      setSyncPhase("Telemetric Stream...");
      const healthData = await healthConnect.fetchSleepData();
      const updatedRecord = { id: `health-${Date.now()}`, ...healthData } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      
      onProgress?.('analyzing');
      setSyncPhase("Neural AI...");
      const insights = await getSleepInsight(updatedRecord, lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
      
      localStorage.setItem('somno_last_sync', new Date().toLocaleString());
      onProgress?.('success');
    } catch (err: any) {
      onProgress?.('error');
      if (err.message === "SLEEP_DATA_SPECIFICALLY_NOT_FOUND") {
        setErrorToast("NO_SLEEP_DATA");
      } else {
        setErrorToast(err.message || "Sync Failed");
      }
    } finally {
      clearTimeout(syncTimeout);
      setIsLoading(false);
      setSyncPhase("");
    }
  }, [lang, isLoading]);

  useEffect(() => {
    if (isLoggedIn && !currentRecord && !isLoading && !isAdmin && !errorToast) {
      handleSyncHealthConnect(false).catch(() => {
        setIsLoading(false);
      });
    }
  }, [isLoggedIn, isAdmin, currentRecord, isLoading, errorToast, handleSyncHealthConnect]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    healthConnect.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setIsAdmin(false);
    setCurrentRecord(null);
    window.location.href = '/';
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
            onLogin={() => setIsLoggedIn(true)} 
            onGuest={() => setIsGuest(true)} 
            onNavigate={setActiveView} 
          />
        ) : (
          <Suspense fallback={<LoadingSpinner label="Compiling Lab..." />}>
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeView === 'admin' ? (
                  isAdmin ? <AdminView /> : <div className="p-20 text-center uppercase font-black text-slate-700">Restricted</div>
                ) : activeView === 'privacy' || activeView === 'terms' ? (
                  <LegalView type={activeView as any} lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'about' ? (
                  <AboutView lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'dashboard' ? (
                  isLoading ? (
                    <LoadingSpinner label={syncPhase} />
                  ) : currentRecord ? (
                    <Dashboard data={currentRecord} lang={lang} onSyncHealth={(p) => handleSyncHealthConnect(false, p)} onNavigate={setActiveView} staticMode={staticMode} />
                  ) : errorToast ? (
                    <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center">
                       <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 max-w-sm space-y-6">
                          <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500">
                             <WifiOff size={24} />
                          </div>
                          <div className="space-y-2">
                             <h2 className="text-xl font-black italic text-white uppercase">Link Exception</h2>
                             <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
                                {errorToast === "NO_SLEEP_DATA" ? "No sleep sessions found." : 
                                 errorToast === "LINK_TIMEOUT" ? "Link connection timed out. Check your device." : errorToast}
                             </p>
                          </div>
                          <button onClick={() => handleSyncHealthConnect(true)} className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl">
                             Retry Handshake
                          </button>
                       </GlassCard>
                    </div>
                  ) : (
                    <LoadingSpinner label="Calibrating Sensors..." />
                  )
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
              { id: isAdmin ? 'admin' : 'profile', icon: isAdmin ? Shield : User, label: 'CFG' }
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
