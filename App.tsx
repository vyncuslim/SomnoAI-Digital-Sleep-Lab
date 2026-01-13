
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Auth } from './Auth.tsx';
import { ViewType, SleepRecord, SyncStatus, ThemeMode, AccentColor } from './types.ts';
import { User, Loader2, Activity, Zap, TriangleAlert, RefreshCw, Shield, WifiOff, Lock, ChevronLeft } from 'lucide-react';
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | 'privacy' | 'terms' | 'admin'>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [syncPhase, setSyncPhase] = useState<string>("");

  // 核心权限检查逻辑
  const syncIdentity = useCallback(async (user: any) => {
    if (!user) {
      setIsAdmin(false);
      setIsLoggedIn(false);
      return;
    }
    
    setIsLoggedIn(true);
    const isAdminUser = await adminApi.checkAdminStatus(user.id);
    setIsAdmin(isAdminUser);

    // 路由守卫：检测 URL 指令
    const path = window.location.pathname;
    if (path === '/admin') {
      if (isAdminUser) {
        setActiveView('admin');
      } else {
        // 纵深防御：拦截非授权进入后台
        window.history.replaceState({}, '', '/');
        setActiveView('dashboard');
      }
    }
  }, []);

  useEffect(() => {
    // 1. 初始化 Session
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncIdentity(session?.user);
    });

    // 2. 监听 Auth 状态变更
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      syncIdentity(session?.user);
      if (event === 'SIGNED_OUT') {
        setIsGuest(false);
        setActiveView('dashboard');
      }
    });

    if ((window as any).dismissLoader) (window as any).dismissLoader();

    return () => subscription.unsubscribe();
  }, [syncIdentity]);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
    try {
      onProgress?.('authorizing');
      setSyncPhase("Linking...");
      await healthConnect.authorize(forcePrompt);
      
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
      setErrorToast(err.message || "Sync Failed");
    } finally {
      setIsLoading(false);
      setSyncPhase("");
    }
  }, [lang]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const showAuthScreen = !isLoggedIn && !isGuest && activeView !== 'privacy' && activeView !== 'terms';

  return (
    <div className="flex-1 flex flex-col min-h-screen relative">
      <main className="flex-1 w-full mx-auto p-4 pt-10 pb-40">
        {showAuthScreen ? (
          <Auth 
            lang={lang} 
            onLogin={() => setIsLoggedIn(true)} 
            onGuest={() => setIsGuest(true)} 
            onNavigate={setActiveView} 
          />
        ) : (
          <Suspense fallback={<LoadingSpinner label="Compiling Lab..." />}>
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {activeView === 'admin' ? (
                  isAdmin ? <AdminView onBack={() => setActiveView('dashboard')} /> : <LoadingSpinner label="Access Denied" />
                ) : activeView === 'privacy' || activeView === 'terms' ? (
                  <LegalView type={activeView as any} lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'about' ? (
                  <AboutView lang={lang} onBack={() => setActiveView('dashboard')} />
                ) : activeView === 'dashboard' ? (
                  isLoading ? (
                    <LoadingSpinner label={syncPhase} />
                  ) : currentRecord ? (
                    <Dashboard data={currentRecord} lang={lang} onSyncHealth={(p) => handleSyncHealthConnect(false, p)} onNavigate={setActiveView} />
                  ) : errorToast ? (
                    <div className="flex flex-col items-center justify-center h-[70vh] p-8 text-center">
                       <GlassCard className="p-10 rounded-[4rem] border-rose-500/20 max-w-sm space-y-6">
                          <WifiOff size={48} className="text-rose-500 mx-auto" />
                          <p className="text-sm text-slate-400">{errorToast}</p>
                          <button onClick={() => handleSyncHealthConnect(true)} className="w-full py-4 bg-indigo-600 text-white rounded-full font-bold uppercase tracking-widest text-[10px]">Retry</button>
                       </GlassCard>
                    </div>
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
                    lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView}
                    theme="dark" onThemeChange={() => {}} accentColor="indigo" onAccentChange={() => {}}
                    threeDEnabled={true} onThreeDChange={() => {}} staticMode={false} onStaticModeChange={() => {}}
                    lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={() => handleSyncHealthConnect(true)}
                  />
                ) : null}
              </m.div>
            </AnimatePresence>
          </Suspense>
        )}
      </main>

      {(isLoggedIn || isGuest) && activeView !== 'privacy' && activeView !== 'terms' && (
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
                  onClick={() => {
                    setActiveView(nav.id as any);
                    if (nav.id === 'admin') window.history.pushState({}, '', '/admin');
                    else window.history.pushState({}, '', '/');
                  }} 
                  className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${isActive ? (isAdmin && nav.id === 'admin' ? 'bg-rose-600' : 'bg-indigo-600') + ' text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <SpatialIcon icon={nav.icon} size={20} animated={isActive} />
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
