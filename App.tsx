
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

// Code-splitting for non-primary views to improve Lighthouse Performance
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
    const path = window.location.pathname;
    if (path === '/about') setActiveView('about');
    else if (path === '/privacy') setActiveView('privacy');
    else if (path === '/terms') setActiveView('terms');

    // Remove the static page loader once React has taken over
    const loader = document.getElementById('page-loader');
    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('somno_lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('somno_theme', theme);
    document.documentElement.classList.toggle('light-mode', theme === 'light');
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('somno_static', String(staticMode));
    document.body.classList.toggle('static-ui', staticMode);
  }, [staticMode]);

  const generateMockData = useCallback(async () => {
    setIsLoading(true);
    const mockHistory: SleepRecord[] = [];
    const now = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      const score = 70 + Math.floor(Math.random() * 25);
      const duration = 420 + Math.floor(Math.random() * 100);
      const deep = Math.floor(duration * 0.22);
      const rem = Math.floor(duration * 0.20);
      const awake = Math.floor(duration * 0.05);
      
      const record: SleepRecord = {
        id: `mock-${i}`,
        date: date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
        score,
        totalDuration: duration,
        deepRatio: 22,
        remRatio: 20,
        efficiency: 92 + Math.floor(Math.random() * 6),
        stages: [
          { name: 'Deep', duration: deep, startTime: '01:20' },
          { name: 'REM', duration: rem, startTime: '03:40' },
          { name: 'Light', duration: duration - deep - rem - awake, startTime: '05:00' },
          { name: 'Awake', duration: awake, startTime: '23:30' }
        ],
        heartRate: {
          resting: 55 + Math.floor(Math.random() * 10),
          max: 85,
          min: 52,
          average: 62,
          history: []
        },
        aiInsights: lang === 'zh' ? ['模拟数据流激活。', '神经架构分析已就绪。'] : ['Simulation stream active.', 'Neural architecture ready.']
      };
      mockHistory.push(record);
    }
    
    setCurrentRecord(mockHistory[0]);
    setHistory(mockHistory);
    
    try {
      const insights = await getSleepInsight(mockHistory[0], lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
    } catch (e) {
      console.warn("AI Insights suppressed for guest mode (No API Key).");
    }
    
    setIsLoading(false);
  }, [lang]);

  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setHistory([]); 
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
      console.error("Sync Critical Failure:", err);
      setIsLoading(false);
      onProgress?.('error');
      
      let friendlyError = lang === 'zh' ? "同步失败" : "Sync Failed";
      if (err.message?.includes("FIT_API_FAILURE")) {
        friendlyError = lang === 'zh' ? `API 故障: ${err.message}` : `API Link Failure: ${err.message}`;
      } else if (err.message === "DATA_NOT_FOUND") {
        friendlyError = lang === 'zh' ? "未发现睡眠数据" : "No sleep data found";
      }

      setErrorToast(friendlyError);
      setTimeout(() => setErrorToast(null), 8000);
    }
  }, [lang]);

  const handleGuestLogin = () => {
    setIsGuest(true);
    generateMockData();
  };

  const handleLogout = () => {
    try {
      // 彻底重置所有本地持久化状态
      googleFit.logout();
      setIsLoggedIn(false);
      setIsGuest(false);
      setCurrentRecord(null);
      setHistory([]);

      localStorage.removeItem('somno_last_sync');
      localStorage.removeItem('google_fit_token');
      localStorage.removeItem('somno_ai_provider');
      
      // 清除全局变量引用
      if ((window as any).process?.env) {
        (window as any).process.env.API_KEY = '';
        (window as any).process.env.OPENAI_API_KEY = '';
      }
      
      sessionStorage.clear();
      
      // 核心：强制页面硬重载以刷新整个 React 运行时环境
      window.location.href = window.location.origin + window.location.pathname;
    } catch (e) {
      window.location.reload();
    }
  };

  const renderView = () => {
    if (activeView === 'privacy' || activeView === 'terms') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <LegalView type={activeView} lang={lang} onBack={() => setActiveView('profile')} />
        </Suspense>
      );
    }
    if (activeView === 'about') {
      return (
        <Suspense fallback={<LoadingSpinner />}>
          <AboutView lang={lang} onBack={() => setActiveView('profile')} />
        </Suspense>
      );
    }
    if (isLoading && !currentRecord) {
      return <LoadingSpinner />;
    }
    
    if (!isLoggedIn && !isGuest) {
      return <Auth lang={lang} onLogin={() => handleSyncGoogleFit()} onGuest={handleGuestLogin} onNavigate={(v: any) => setActiveView(v)} />;
    }
    
    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[75vh] gap-10 text-center">
          <Logo size={96} className="opacity-40" animated={!staticMode} threeD={threeDEnabled} staticMode={staticMode} />
          <div className="space-y-4">
            <h2 className="text-3xl font-black uppercase tracking-tighter">{lang === 'en' ? 'Biometric Offline' : '生物识别离线'}</h2>
            <div className="flex flex-col gap-4">
              <button onClick={() => setIsDataEntryOpen(true)} className="px-8 py-5 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest">{lang === 'en' ? 'Inject Signals' : '手动注入'}</button>
              <button onClick={() => handleSyncGoogleFit(true)} className="px-8 py-4 bg-white/5 border border-white/10 text-slate-400 rounded-2xl font-black uppercase text-[10px] tracking-widest">{lang === 'en' ? 'Retry Google Sync' : '重试 Google 同步'}</button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Suspense fallback={<LoadingSpinner />}>
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
          </Suspense>
        </motion.div>
      </AnimatePresence>
    );
  };

  const showNav = isLoggedIn || isGuest;

  return (
    <div className={`flex-1 flex flex-col accent-${accentColor}`}>
      {isGuest && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-amber-500 to-amber-600">
           <div className="absolute top-1 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-amber-600 text-[8px] font-black text-white uppercase tracking-widest rounded-b-lg">
             Simulation Protocol v3.0
           </div>
        </div>
      )}
      <main id="main-content" className={`flex-1 w-full max-w-2xl mx-auto px-6 ${showNav ? 'pt-20 pb-28' : 'pt-8 pb-10'}`} role="main">
        {renderView()}
      </main>
      
      {showNav && (activeView !== 'privacy' && activeView !== 'terms' && activeView !== 'about') && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-8 safe-area-inset-bottom pointer-events-none" aria-label="Main Navigation">
          <div className="max-w-md mx-auto glass-morphism rounded-[3.5rem] p-2 flex justify-between pointer-events-auto border border-white/10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] bg-slate-900/70 backdrop-blur-3xl">
            {[
              { id: 'dashboard', icon: Logo, label: translations[lang].nav.lab },
              { id: 'calendar', icon: Activity, label: translations[lang].nav.trends },
              { id: 'assistant', icon: Zap, label: translations[lang].nav.insights },
              { id: 'profile', icon: User, label: translations[lang].nav.settings }
            ].map((nav) => {
              const isActive = activeView === nav.id;
              const iconColor = isActive ? (accentColor === 'rose' ? '#fb7185' : '#818cf8') : '#475569';
              
              return (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveView(nav.id as ViewType)} 
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex-1 py-4 flex flex-col items-center gap-1.5 transition-all active:scale-95 ${isActive ? 'text-white' : 'text-slate-500'}`}
                >
                  <motion.div
                    animate={isActive && !staticMode ? {
                      y: [0, -4, 0],
                      scale: [1, 1.05, 1],
                    } : { y: 0, scale: 1 }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="relative flex items-center justify-center"
                  >
                    <SpatialIcon 
                      icon={nav.icon} 
                      size={22} 
                      animated={isActive && !staticMode} 
                      threeD={threeDEnabled} 
                      color={iconColor}
                    />
                    {isActive && !staticMode && (
                      <motion.div
                        layoutId="nav-glow-indicator"
                        className="absolute -bottom-1 w-1 h-1 rounded-full blur-[2px]"
                        style={{ backgroundColor: iconColor }}
                        animate={{ opacity: [0.4, 1, 0.4] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                      />
                    )}
                  </motion.div>
                  <motion.span 
                    className={`text-[8px] font-black transition-colors tracking-[0.25em] ${isActive ? (accentColor === 'rose' ? 'text-rose-400' : 'text-indigo-400') : 'text-slate-600'}`}
                  >
                    {nav.label}
                  </motion.span>
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
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            role="alert"
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-rose-600 text-white rounded-full font-black text-xs uppercase tracking-widest shadow-2xl"
          >
            {errorToast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;
