
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
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">Processing Bio-Stream...</p>
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
  const [isApiDenied, setIsApiDenied] = useState(false);

  // Supabase Session Logic
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAdmin(true);
        setIsLoggedIn(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setIsAdmin(true);
        setIsLoggedIn(true);
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Sync state with URL path
  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, '');
    if (path === 'about') setActiveView('about');
    else if (path === 'calendar') setActiveView('calendar');
    else if (path === 'assistant') setActiveView('assistant');
    else if (path === 'profile') setActiveView('profile');
    else if (path === 'privacy') setActiveView('privacy');
    else if (path === 'terms') setActiveView('terms');
    else if (path === 'admin') setActiveView('admin');
  }, []);

  // Resilient pushState for Preview/Sandboxed environments
  useEffect(() => {
    const isBlob = window.location.protocol === 'blob:';
    const isSandboxed = window.location.origin === 'null' || window.location.hostname.includes('usercontent.goog');
    
    if (isBlob || isSandboxed) return; 

    const publicViews = ['privacy', 'terms', 'about'];
    const spaViews = ['dashboard', 'calendar', 'assistant', 'profile', 'admin'];
    
    if (publicViews.includes(activeView) || spaViews.includes(activeView as any)) {
      const targetPath = activeView === 'dashboard' ? '/' : `/${activeView}`;
      try {
        if (window.location.pathname !== targetPath) {
          window.history.pushState({ view: activeView }, '', targetPath);
        }
      } catch (e) {
        console.warn("Navigation history update failed.", e);
      }
    }
  }, [activeView]);

  useEffect(() => {
    const removeLoader = () => {
      const loader = document.getElementById('page-loader');
      if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 800);
      }
    };
    const timer = setTimeout(removeLoader, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
    setIsApiDenied(false);
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
      let errMsg = err.message || "Sync Failed";
      const langErrors = (translations[lang] as any).errors;
      if (errMsg.includes("FIT_API_ACCESS_DENIED")) {
        setIsApiDenied(true);
        errMsg = langErrors.healthApiDenied;
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        errMsg = langErrors.noDataFound;
      } else if (errMsg.includes("SLEEP_DATA_SPECIFICALLY_NOT_FOUND")) {
        errMsg = langErrors.noSleepData;
      } else {
        errMsg = langErrors.syncFailed;
      }
      setErrorToast(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  useEffect(() => {
    if (isLoggedIn && !currentRecord && !isLoading) {
      handleSyncHealthConnect(false);
    }
  }, [isLoggedIn]);

  const generateMockData = useCallback(async () => {
    setIsLoading(true);
    const mockHistory: SleepRecord[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      mockHistory.push({
        id: `mock-${i}`,
        date: date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
        score: 75 + Math.floor(Math.random() * 20),
        totalDuration: 420 + Math.floor(Math.random() * 100),
        deepRatio: 22, remRatio: 20, efficiency: 94,
        stages: [],
        heartRate: { resting: 60, max: 85, min: 52, average: 62, history: [] },
        aiInsights: lang === 'zh' ? ['模拟数据流已激活。', '神经链路处于同步模式。'] : ['Simulation stream active.', 'Neural link in sync mode.']
      });
    }
    setCurrentRecord(mockHistory[0]);
    setHistory(mockHistory);
    setIsLoading(false);
  }, [lang]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    healthConnect.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setIsAdmin(false);
    setCurrentRecord(null);
    localStorage.removeItem('health_connect_token');
    window.location.reload();
  };

  const isPublicView = activeView === 'privacy' || activeView === 'terms' || activeView === 'about';
  const isShowAuth = !isLoggedIn && !isGuest && !isPublicView;

  return (
    <div className={`flex-1 flex flex-col min-h-screen relative`}>
      <main className="flex-1 w-full mx-auto p-4 pt-10 pb-40">
        {isShowAuth ? (
          <Auth lang={lang} onLogin={() => setIsLoggedIn(true)} onGuest={() => { setIsGuest(true); generateMockData(); }} onNavigate={setActiveView} />
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}>
                {activeView === 'privacy' || activeView === 'terms' ? (
                  <LegalView type={activeView as 'privacy' | 'terms'} lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'about' ? (
                  <AboutView lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'admin' ? (
                  <AdminView />
                ) : (
                  isLoading && !currentRecord ? (
                    <LoadingSpinner />
                  ) : (
                    <>
                      {activeView === 'dashboard' && (
                        <>
                          {currentRecord ? (
                            <Dashboard 
                              lang={lang} 
                              data={currentRecord} 
                              onSyncHealth={isGuest ? undefined : (p) => handleSyncHealthConnect(false, p)} 
                              staticMode={staticMode} 
                              onNavigate={setActiveView} 
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center h-[70vh] gap-8 px-10 text-center">
                              <m.div 
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 4, repeat: Infinity }}
                                className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400"
                              >
                                <TriangleAlert size={40} />
                              </m.div>
                              <div className="space-y-4 max-w-sm">
                                <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">
                                  {isApiDenied ? "API Access Required" : "Telemetry Disconnected"}
                                </h2>
                                <p className="text-xs text-slate-400 leading-relaxed italic">
                                  {errorToast || "No active biometric stream identified. Please synchronize with your wearable device via Health Connect."}
                                </p>
                              </div>
                              <div className="flex flex-col gap-4">
                                <button 
                                  onClick={() => handleSyncHealthConnect(true)}
                                  className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.3em] shadow-xl hover:scale-105 transition-all flex items-center gap-3"
                                >
                                  <RefreshCw size={14} /> Re-Initialize Link
                                </button>
                                <button 
                                  onClick={() => { setIsGuest(true); generateMockData(); }}
                                  className="text-[10px] font-black uppercase text-slate-500 hover:text-indigo-400 tracking-widest transition-colors"
                                >
                                  Use Synthetic Data Instead
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                      {activeView === 'calendar' && <Trends history={history} lang={lang} />}
                      {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} />}
                      {activeView === 'profile' && (
                        <Settings 
                          lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView}
                          theme={theme} onThemeChange={setTheme} accentColor={accentColor} onAccentChange={setAccentColor}
                          threeDEnabled={threeDEnabled} onThreeDChange={setThreeDEnabled}
                          staticMode={staticMode} onStaticModeChange={setStaticMode}
                          lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={isGuest ? generateMockData : () => handleSyncHealthConnect(true)}
                        />
                      )}
                    </>
                  )
                )}
              </m.div>
            </AnimatePresence>
          </Suspense>
        )}
      </main>

      {(isLoggedIn || isGuest) && !isPublicView && (
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-10 flex justify-center pointer-events-none">
          <nav className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-2 pointer-events-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
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
