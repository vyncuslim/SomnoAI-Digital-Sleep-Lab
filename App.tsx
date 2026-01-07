
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Auth } from './Auth.tsx';
import { ViewType, SleepRecord, SyncStatus, ThemeMode, AccentColor } from './types.ts';
import { User, Loader2, Activity, Zap } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { translations, Language } from './services/i18n.ts';
import { SpatialIcon } from './components/SpatialIcon.tsx';

// Fix: Use any cast to bypass broken library types for motion props
const m = motion as any;

// Code-splitting for non-primary views to improve Performance
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));
const DataEntry = lazy(() => import('./components/DataEntry.tsx').then(m => ({ default: m.DataEntry })));
const LegalView = lazy(() => import('./components/LegalView.tsx').then(m => ({ default: m.LegalView })));
const AboutView = lazy(() => import('./components/AboutView.tsx').then(m => ({ default: m.AboutView })));

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center" role="status" aria-label="Loading content">
    <Loader2 size={48} className="animate-spin text-indigo-500" />
    <p className="text-slate-500 font-black uppercase text-[10px] tracking-widest">
      Processing Stream...
    </p>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en');
  const [theme, setTheme] = useState<ThemeMode>(() => (localStorage.getItem('somno_theme') as ThemeMode) || 'dark');
  const [accentColor, setAccentColor] = useState<AccentColor>(() => (localStorage.getItem('somno_accent') as AccentColor) || 'indigo');
  const [threeDEnabled, setThreeDEnabled] = useState<boolean>(() => localStorage.getItem('somno_3d') !== 'false');
  const [staticMode, setStaticMode] = useState<boolean>(() => localStorage.getItem('somno_static') === 'true');
  
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | 'privacy' | 'terms'>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    // Robust loader removal
    const removeLoader = () => {
      if (typeof (window as any).dismissLoader === 'function') {
        (window as any).dismissLoader();
      } else {
        const loader = document.getElementById('page-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => loader.remove(), 500);
        }
      }
    };
    
    // Attempt removal immediately and after a short delay
    removeLoader();
    const timer = setTimeout(removeLoader, 100);

    const path = window.location.pathname;
    if (path === '/about') setActiveView('about');
    else if (path === '/privacy') setActiveView('privacy');
    else if (path === '/terms') setActiveView('terms');

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('somno_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('somno_theme', theme);
    document.documentElement.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  const generateMockData = useCallback(async () => {
    setIsLoading(true);
    const mockHistory: SleepRecord[] = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const score = 70 + Math.floor(Math.random() * 25);
      const duration = 420 + Math.floor(Math.random() * 100);
      const record: SleepRecord = {
        id: `mock-${i}`,
        date: date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
        score,
        totalDuration: duration,
        deepRatio: 22,
        remRatio: 20,
        efficiency: 92 + Math.floor(Math.random() * 6),
        stages: [
          { name: 'Deep', duration: Math.floor(duration * 0.22), startTime: '01:20' },
          { name: 'REM', duration: Math.floor(duration * 0.20), startTime: '03:40' },
          { name: 'Light', duration: duration - Math.floor(duration * 0.47), startTime: '05:00' },
          { name: 'Awake', duration: Math.floor(duration * 0.05), startTime: '23:30' }
        ],
        heartRate: {
          resting: 55 + Math.floor(Math.random() * 10),
          max: 85, min: 52, average: 62, history: []
        },
        aiInsights: lang === 'zh' ? ['模拟数据流激活。'] : ['Simulation stream active.']
      };
      mockHistory.push(record);
    }
    
    setCurrentRecord(mockHistory[0]);
    setHistory(mockHistory);
    
    try {
      const insights = await getSleepInsight(mockHistory[0], lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
    } catch (e) {
      console.warn("AI Insights suppressed for guest mode.");
    }
    setIsLoading(false);
  }, [lang]);

  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    try {
      onProgress?.('authorizing');
      await googleFit.authorize(forcePrompt);
      setIsLoggedIn(true);
      onProgress?.('fetching');
      const fitData = await googleFit.fetchSleepData();
      const updatedRecord = { id: `fit-${Date.now()}`, aiInsights: [lang === 'en' ? "Lab syncing..." : "同步中..."], ...fitData } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      localStorage.setItem('somno_last_sync', new Date().toLocaleTimeString());
      setIsLoading(false);
      onProgress?.('analyzing');
      const insights = await getSleepInsight(updatedRecord, lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
      onProgress?.('success');
    } catch (err: any) {
      setIsLoading(false);
      onProgress?.('error');
      setErrorToast(err.message || (lang === 'zh' ? "同步失败" : "Sync Failed"));
      setTimeout(() => setErrorToast(null), 8000);
    }
  }, [lang]);

  const handleGuestLogin = () => {
    setIsGuest(true);
    generateMockData();
  };

  const handleLogout = () => {
    googleFit.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setCurrentRecord(null);
    setHistory([]);
    localStorage.removeItem('somno_last_sync');
    localStorage.removeItem('google_fit_token');
    window.location.reload();
  };

  const renderView = () => {
    let content;
    if (activeView === 'privacy' || activeView === 'terms') {
      const handleBack = () => (isLoggedIn || isGuest) ? setActiveView('profile') : setActiveView('dashboard');
      content = <LegalView type={activeView} lang={lang} onBack={handleBack} />;
    } else if (activeView === 'about') {
      content = <AboutView lang={lang} onBack={() => setActiveView('profile')} />;
    } else if (isLoading && !currentRecord) {
      content = <LoadingSpinner />;
    } else if (!isLoggedIn && !isGuest) {
      content = <Auth lang={lang} onLogin={() => handleSyncGoogleFit()} onGuest={handleGuestLogin} onNavigate={(v: any) => setActiveView(v)} />;
    } else if (!currentRecord && activeView === 'dashboard') {
      content = (
        <div className="flex flex-col items-center justify-center h-[75vh] gap-10 text-center">
          <Logo size={96} className="opacity-40" />
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{lang === 'en' ? 'Biometric Offline' : '生物识别离线'}</h2>
            <button onClick={() => setIsDataEntryOpen(true)} className="px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest">Inject Signals</button>
          </div>
        </div>
      );
    } else {
      content = (
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {activeView === 'dashboard' && <Dashboard lang={lang} data={currentRecord!} onSyncFit={isGuest ? undefined : (p) => handleSyncGoogleFit(false, p)} staticMode={staticMode} onNavigate={setActiveView} />}
            {activeView === 'calendar' && <Trends history={history} lang={lang} />}
            {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
            {activeView === 'profile' && (
              <Settings 
                lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView}
                theme={theme} onThemeChange={setTheme} accentColor={accentColor} onAccentChange={setAccentColor}
                threeDEnabled={threeDEnabled} onThreeDChange={setThreeDEnabled}
                staticMode={staticMode} onStaticModeChange={setStaticMode}
                lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={isGuest ? generateMockData : () => handleSyncGoogleFit(true)}
              />
            )}
          </m.div>
        </AnimatePresence>
      );
    }

    return (
      <div className="rounded-[4px] overflow-hidden min-h-full">
        <Suspense fallback={<LoadingSpinner />}>
          {content}
        </Suspense>
      </div>
    );
  };

  const showNav = isLoggedIn || isGuest;

  return (
    <div className={`flex-1 flex flex-col accent-${accentColor}`}>
      <main id="main-content" className="flex-1 w-full mx-auto p-4" role="main">
        {renderView()}
      </main>
      
      {showNav && (activeView !== 'privacy' && activeView !== 'terms' && activeView !== 'about') && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-8 safe-area-inset-bottom pointer-events-none" aria-label="Main Navigation">
          <div className="max-w-md mx-auto glass-morphism rounded-[3.5rem] p-2 flex justify-between pointer-events-auto border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-slate-900/70 backdrop-blur-3xl">
            {[
              { id: 'dashboard', icon: Logo, label: translations[lang]?.nav?.lab || 'Lab' },
              { id: 'calendar', icon: Activity, label: translations[lang]?.nav?.trends || 'Trends' },
              { id: 'assistant', icon: Zap, label: translations[lang]?.nav?.insights || 'Insights' },
              { id: 'profile', icon: User, label: translations[lang]?.nav?.settings || 'Settings' }
            ].map((nav) => {
              const isActive = activeView === nav.id;
              const iconColor = isActive ? '#818cf8' : '#475569';
              return (
                <button key={nav.id} onClick={() => setActiveView(nav.id as ViewType)} className={`flex-1 py-4 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  <m.div animate={isActive && !staticMode ? { y: [0, -4, 0], scale: [1, 1.05, 1] } : {}} transition={{ repeat: Infinity, duration: 4 }}>
                    <SpatialIcon icon={nav.icon} size={22} animated={isActive && !staticMode} threeD={threeDEnabled} color={iconColor} />
                  </m.div>
                  <span className={`text-[8px] font-black transition-colors tracking-[0.25em] ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>{nav.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {isDataEntryOpen && (
        <Suspense fallback={null}>
          <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={(r) => { setCurrentRecord(r); setHistory(prev => [r, ...prev]); setIsDataEntryOpen(false); }} />
        </Suspense>
      )}
      <AnimatePresence>
        {errorToast && (
          <m.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl">
            {errorToast}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;
