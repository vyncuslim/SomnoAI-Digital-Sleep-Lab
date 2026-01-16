import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit, RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase } from './lib/supabaseClient.ts';
import { adminApi, ensureProfile } from './services/supabaseService.ts';

// Pages
const UserLoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminDashboard = lazy(() => import('./app/admin/page.tsx'));
const AdminLoginPage = lazy(() => import('./app/admin/login/page.tsx'));
const LegalView = lazy(() => import('./components/LegalView.tsx').then(m => ({ default: m.LegalView })));

// Components
import { Dashboard } from './components/Dashboard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));
const UserProfile = lazy(() => import('./components/UserProfile.tsx').then(m => ({ default: m.UserProfile })));

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
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('somno_lang');
    if (saved) return saved as Language;
    return 'en';
  });
  
  const isZh = lang === 'zh';
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const [isSandbox, setIsSandbox] = useState(() => {
    return localStorage.getItem('somno_sandbox_active') === 'true';
  });
  
  const getNormalizedRoute = useCallback(() => {
    const hashPart = window.location.hash.replace(/^#/, '');
    const pathPart = window.location.pathname;
    const fullPath = (hashPart || pathPart).toLowerCase();
    
    if (fullPath.includes('/admin/login')) return 'admin-login';
    if (fullPath.includes('/admin')) return 'admin';
    if (fullPath.includes('/login')) return 'login';
    if (fullPath.includes('/terms')) return 'terms';
    if (fullPath.includes('/privacy')) return 'privacy';
    
    return '/';
  }, []);

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedRoute());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);

  const navigateTo = useCallback((path: string) => {
    const finalHash = path.startsWith('/') ? path : '/' + path;
    window.location.hash = finalHash;
  }, []);

  const handleSandboxLogin = useCallback(() => {
    setIsSandbox(true);
    localStorage.setItem('somno_sandbox_active', 'true');
    navigateTo('/');
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    if (isSandbox) {
      setIsSandbox(false);
      localStorage.removeItem('somno_sandbox_active');
      setSession(null);
      setIsAdmin(false);
      setIsLoggingOut(false);
      navigateTo('/');
    } else {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.debug("Auth clearing completed.");
      } finally {
        setSession(null);
        setIsAdmin(false);
        setIsLoggingOut(false);
        navigateTo('/');
      }
    }
  }, [isSandbox, navigateTo, isLoggingOut]);

  useEffect(() => {
    if (typeof (window as any).gtag === 'function') {
      const path = activeRoute === '/' ? `/${activeView}` : activeRoute;
      (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: `SomnoAI | ${activeView.toUpperCase()}`
      });
    }
  }, [activeRoute, activeView]);

  useEffect(() => {
    let checkTimeout: any;

    const checkAuth = async () => {
      checkTimeout = setTimeout(() => {
        setIsInitialAuthCheck(false);
      }, 10000);

      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          await ensureProfile(currentSession.user.id, currentSession.user.email || '');
          const { data: userData } = await supabase
            .from('user_data')
            .select('is_blocked')
            .eq('id', currentSession.user.id)
            .maybeSingle();

          if (userData?.is_blocked) {
            await supabase.auth.signOut();
            setSession(null);
          } else {
            setSession(currentSession);
            const adminStatus = await adminApi.checkAdminStatus(currentSession.user.id);
            setIsAdmin(adminStatus);
          }
        }
      } catch (err) {
        console.warn("Auth check sequence disruption:", err);
      } finally {
        clearTimeout(checkTimeout);
        setIsInitialAuthCheck(false);
      }
    };
    
    checkAuth();

    const syncRoute = () => setActiveRoute(getNormalizedRoute());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (isLoggingOut) return;
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        return;
      }
      
      if (newSession) {
        await ensureProfile(newSession.user.id, newSession.user.email || '');
        const { data: userData } = await supabase
          .from('user_data')
          .select('is_blocked')
          .eq('id', newSession.user.id)
          .maybeSingle();

        if (userData?.is_blocked) {
          await supabase.auth.signOut();
        } else {
          setSession(newSession);
          const adminStatus = await adminApi.checkAdminStatus(newSession.user.id);
          setIsAdmin(adminStatus);
        }
      }
    });

    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
      subscription.unsubscribe();
      clearTimeout(checkTimeout);
    };
  }, [getNormalizedRoute, navigateTo, isLoggingOut]);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsSyncing(true);
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
    } finally {
      setIsSyncing(false);
    }
  }, [lang]);

  if (isInitialAuthCheck) return <LoadingSpinner label="Decrypting Lab Access..." />;

  const renderContent = () => {
    const route = activeRoute;
    if (route === 'terms') return <LegalView type="terms" lang={lang} onBack={() => navigateTo('/')} />;
    if (route === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => navigateTo('/')} />;
    
    if (route === 'admin-login') return <Suspense fallback={<LoadingSpinner />}><AdminLoginPage /></Suspense>;
    if (route === 'admin') {
      if (!session && !isSandbox) {
        navigateTo('/admin/login');
        return <LoadingSpinner label="Redirecting..." />;
      }
      return <Suspense fallback={<LoadingSpinner label="Initializing Command Deck..." />}><AdminDashboard /></Suspense>;
    }
    
    if (!session && !isSandbox) {
      return <Suspense fallback={<LoadingSpinner label="Warming Auth Nodes..." />}><UserLoginPage onSuccess={() => navigateTo('/')} onSandbox={handleSandboxLogin} lang={lang} /></Suspense>;
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
                  <p className="text-xs text-slate-500 max-w-xs italic mb-4">Establishing secure telemetry link. Connect lab nodes for sync.</p>
                  <button onClick={() => handleSyncHealthConnect(true)} disabled={isSyncing} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl hover:bg-indigo-500 transition-all active:scale-95 flex items-center gap-3 disabled:opacity-50">
                    {isSyncing ? <RefreshCw className="animate-spin" size={14} /> : <Zap size={14} />}
                    {isSyncing ? 'Linking...' : 'Connect Lab Nodes'}
                  </button>
                </div>
              )
            ) : activeView === 'calendar' ? (
              <Trends history={history} lang={lang} />
            ) : activeView === 'assistant' ? (
              <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} isSandbox={isSandbox} />
            ) : activeView === 'profile' ? (
              <UserProfile lang={lang} />
            ) : activeView === 'settings' ? (
              <Settings 
                lang={lang} onLanguageChange={(l) => { setLang(l); localStorage.setItem('somno_lang', l); }} onLogout={handleLogout} 
                onNavigate={(v) => typeof v === 'string' && (v === 'admin' ? navigateTo('/admin') : setActiveView(v as any))}
                theme="dark" onThemeChange={() => {}} accentColor="indigo" onAccentChange={() => {}}
                threeDEnabled={true} onThreeDChange={() => {}} staticMode={false} onStaticModeChange={() => {}}
                lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={() => handleSyncHealthConnect(true)}
              />
            ) : null}
          </m.div>
        </AnimatePresence>

        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <nav className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl overflow-x-auto no-scrollbar">
            {[
              { id: 'dashboard', icon: Activity, label: 'LAB' },
              { id: 'calendar', icon: Zap, label: 'TRND' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'profile', icon: User, label: 'USER' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => { if (window.location.hash !== '#/' && window.location.hash !== '') navigateTo('/'); setActiveView(nav.id as any); }} 
                className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all shrink-0 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <nav.icon size={18} />
                {activeView === nav.id && <m.span layoutId="nav-text" className="text-[9px] font-black uppercase tracking-widest">{nav.label}</m.span>}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return <RootLayout><Suspense fallback={<LoadingSpinner label="Decrypting Lab Nodes..." />}><div className="min-h-screen">{renderContent()}</div></Suspense></RootLayout>;
};

export default App;