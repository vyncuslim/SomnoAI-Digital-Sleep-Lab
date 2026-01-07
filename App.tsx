
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

const m = motion as any;

const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));

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
  
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

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

  const generateMockData = useCallback(async () => {
    setIsLoading(true);
    const mockHistory: SleepRecord[] = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      mockHistory.push({
        id: `mock-${i}`,
        date: date.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        score: 75 + Math.floor(Math.random() * 20),
        totalDuration: 420 + Math.floor(Math.random() * 100),
        deepRatio: 22, remRatio: 20, efficiency: 94,
        stages: [],
        heartRate: { resting: 60, max: 85, min: 52, average: 62, history: [] },
        aiInsights: lang === 'zh' ? ['模拟数据流已激活。', '神经链路处于同步模式。', '等待深层次生物识别采样。'] : ['Simulation stream active.', 'Neural link in sync mode.', 'Awaiting deep biometric sampling.']
      });
    }
    setCurrentRecord(mockHistory[0]);
    setHistory(mockHistory);
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
      const updatedRecord = { id: `fit-${Date.now()}`, ...fitData } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      setIsLoading(false);
      onProgress?.('analyzing');
      const insights = await getSleepInsight(updatedRecord, lang);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
      onProgress?.('success');
    } catch (err: any) {
      setIsLoading(false);
      onProgress?.('error');
      setErrorToast(err.message || "Sync Failed");
      setTimeout(() => setErrorToast(null), 3000);
    }
  }, [lang]);

  const handleLogout = () => {
    googleFit.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    localStorage.removeItem('google_fit_token');
    window.location.reload();
  };

  return (
    <div className={`flex-1 flex flex-col min-h-screen relative`}>
      <main className="flex-1 w-full mx-auto p-4 pt-10 pb-40">
        {!isLoggedIn && !isGuest ? (
          <Auth lang={lang} onLogin={() => handleSyncGoogleFit()} onGuest={() => { setIsGuest(true); generateMockData(); }} />
        ) : (
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }}>
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
          </Suspense>
        )}
      </main>

      {/* 浮动胶囊导航栏 */}
      {(isLoggedIn || isGuest) && (
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-10 flex justify-center pointer-events-none">
          <nav className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-2 pointer-events-auto shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
            {[
              { id: 'dashboard', icon: Logo, label: 'LAB' },
              { id: 'calendar', icon: Activity, label: 'TRND' },
              { id: 'assistant', icon: Zap, label: 'CORE' },
              { id: 'profile', icon: User, label: 'CFG' }
            ].map((nav) => {
              const isActive = activeView === nav.id;
              return (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveView(nav.id as ViewType)} 
                  className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${isActive ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <SpatialIcon icon={nav.icon} size={20} animated={isActive} threeD={threeDEnabled} color={isActive ? '#fff' : '#475569'} />
                  {isActive && <m.span layoutId="nav-text" className="text-[10px] font-black uppercase tracking-widest">{nav.label}</m.span>}
                </button>
              );
            })}
          </nav>
        </div>
      )}

      {/* 气泡式错误提示 */}
      <AnimatePresence>
        {errorToast && (
          <m.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="fixed bottom-36 left-1/2 -translate-x-1/2 z-[200] px-8 py-4 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest shadow-2xl">
            {errorToast}
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
};
export default App;
