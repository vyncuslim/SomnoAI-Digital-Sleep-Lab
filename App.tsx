
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit, ShieldAlert } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { supabase } from './lib/supabaseClient.ts';
import { adminApi } from './services/supabaseService.ts';

// Lazy load specific pages
const UserLoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminView = lazy(() => import('./components/AdminView.tsx').then(m => ({ default: m.AdminView })));
const AdminLoginPage = lazy(() => import('./app/admin/login/page.tsx'));
const LegalView = lazy(() => import('./components/LegalView.tsx').then(m => ({ default: m.LegalView })));

import { Dashboard } from './components/Dashboard.tsx';
// GlassCard import added to fix errors on line 152 and 157
import { GlassCard } from './components/GlassCard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));

const m = motion as any;

const LoadingSpinner = ({ label = "Connecting Lab Nodes..." }: { label?: string }) => (
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
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [isSandbox, setIsSandbox] = useState(() => {
    return new URLSearchParams(window.location.search).get('sandbox') === 'true' || 
           localStorage.getItem('somno_sandbox_active') === 'true';
  });
  
  const getNormalizedRoute = useCallback(() => {
    let path = window.location.pathname.toLowerCase();
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    if (path === '/login') return 'login';
    if (path === '/admin') return 'admin';
    if (path === '/admin/login') return 'admin-login';
    if (path === '/terms') return 'terms';
    if (path === '/privacy') return 'privacy';
    return path === '/' ? '/' : path.slice(1);
  }, []);

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedRoute());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);

  const navigateTo = useCallback((path: string) => {
    const finalPath = path.startsWith('/') ? path : '/' + path;
    window.history.pushState({}, '', finalPath);
    setActiveRoute(getNormalizedRoute());
  }, [getNormalizedRoute]);

  const handleSandboxLogin = useCallback(() => {
    setIsSandbox(true);
    localStorage.setItem('somno_sandbox_active', 'true');
    navigateTo('/?sandbox=true');
  }, [navigateTo]);

  useEffect(() => {
    document.title = "SomnoAI Lab | Digital Sleep Master";

    const checkAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      
      if (currentSession) {
        const adminStatus = await adminApi.checkAdminStatus(currentSession.user.id);
        setIsAdmin(adminStatus);
      }
      setIsInitialAuthCheck(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const adminStatus = await adminApi.checkAdminStatus(newSession.user.id);
        setIsAdmin(adminStatus);
        if (getNormalizedRoute() === 'login') navigateTo('/');
      } else {
        setIsAdmin(false);
      }
    });

    const handlePopState = () => {
      setActiveRoute(getNormalizedRoute());
      setIsSandbox(new URLSearchParams(window.location.search).get('sandbox') === 'true');
    };
    window.addEventListener('popstate', handlePopState);
    
    if ((window as any).dismissLoader) (window as any).dismissLoader();
    
    return () => {
      window.removeEventListener('popstate', handlePopState);
      subscription.unsubscribe();
    };
  }, [getNormalizedRoute, navigateTo]);

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
    return <LoadingSpinner label="Accessing Lab..." />;
  }

  const renderContent = () => {
    const route = activeRoute;

    if (route === 'terms') return <LegalView type="terms" lang={lang} onBack={() => navigateTo('/')} />;
    if (route === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => navigateTo('/')} />;
    
    // Admin Flow
    if (route === 'admin-login') return <Suspense fallback={<LoadingSpinner />}><AdminLoginPage /></Suspense>;
    if (route === 'admin') {
      if (!isAdmin && !isSandbox) {
        return (
          <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
            <GlassCard className="p-12 text-center space-y-6 max-w-sm rounded-[4rem] border-rose-500/20">
              <ShieldAlert size={48} className="text-rose-500 mx-auto" />
              <h2 className="text-xl font-black italic text-white uppercase">Access Denied</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Level 0 Clearance Not Detected.</p>
              <button onClick={() => navigateTo('/')} className="px-8 py-3 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400">Return to Terminal</button>
            </GlassCard>
          </div>
        );
      }
      return (
        <Suspense fallback={<LoadingSpinner label="Initializing Command Deck..." />}>
          <div className="pt-20 px-4">
            <AdminView onBack={() => navigateTo('/')} />
          </div>
        </Suspense>
      );
    }

    // User Auth Flow
    if (!session && !isSandbox) {
      return (
        <Suspense fallback={<LoadingSpinner label="Initializing Auth Terminal..." />}>
          <UserLoginPage onSuccess={() => navigateTo('/')} onSandbox={handleSandboxLogin} />
        </Suspense>
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeView === 'dashboard' ? (
              currentRecord ? (
                <Dashboard data={currentRecord} lang={lang} onSyncHealth={(p) => handleSyncHealthConnect(false, p)} onNavigate={setActiveView} />
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 mb-4">
                    <Activity className="text-indigo-400 animate-pulse" size={32} />
                  </div>
                  <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Biometric Link Offline</h2>
                  <button onClick={() => handleSyncHealthConnect(true)} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95">Connect Lab Nodes</button>
                  {isSandbox && <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">Sandbox Mode Active • Simulated telemetry enabled</p>}
                </div>
              )
            ) : activeView === 'calendar' ? (
              <Trends history={history} lang={lang} />
            ) : activeView === 'assistant' ? (
              <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} isSandbox={isSandbox} />
            ) : activeView === 'profile' ? (
              <Settings 
                lang={lang} onLanguageChange={setLang} 
                onLogout={() => {
                  if (isSandbox) {
                    setIsSandbox(false);
                    localStorage.removeItem('somno_sandbox_active');
                    navigateTo('/');
                  } else {
                    supabase.auth.signOut();
                  }
                }} 
                onNavigate={(v) => typeof v === 'string' && (v === 'admin' ? navigateTo('/admin') : setActiveView(v as any))}
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
      <Suspense fallback={<LoadingSpinner label="Decrypting Lab Nodes..." />}>
        <div className="min-h-screen">{renderContent()}</div>
      </Suspense>
    </RootLayout>
  );
};

export default App;
