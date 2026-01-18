
import React, { useState, useEffect, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit, Settings as SettingsIcon, RefreshCw, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase, adminApi, authApi } from './services/supabaseService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { getSleepInsight } from './services/geminiService.ts';
import { Logo } from './components/Logo.tsx';

// Direct imports for stability
import AdminLoginPage from './app/admin/login/page.tsx';
import AdminDashboard from './app/admin/page.tsx';
import UserLoginPage from './app/login/page.tsx';

import { Dashboard } from './components/Dashboard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));
const UserProfile = lazy(() => import('./components/UserProfile.tsx').then(m => ({ default: m.UserProfile })));
const AboutView = lazy(() => import('./components/AboutView.tsx').then(m => ({ default: m.AboutView })));

const m = motion as any;

const LoadingSpinner = ({ label = "Synchronizing Neural Nodes..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center bg-[#020617] p-8">
    <div className="relative">
      <div className="absolute -inset-6 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
      <Loader2 size={40} className="animate-spin text-indigo-500 relative z-10" />
    </div>
    <div className="space-y-1 relative z-10">
      <p className="text-white font-black uppercase text-[11px] tracking-[0.4em] italic">{label}</p>
      <p className="text-slate-600 text-[8px] uppercase tracking-widest font-bold">Neural Protocol Verification In Progress</p>
    </div>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en');
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [threeDEnabled, setThreeDEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('somno_3d_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isSandbox, setIsSandbox] = useState(() => localStorage.getItem('somno_sandbox_active') === 'true');

  useEffect(() => {
    localStorage.setItem('somno_3d_enabled', threeDEnabled.toString());
  }, [threeDEnabled]);

  useEffect(() => {
    localStorage.setItem('somno_lang', lang);
  }, [lang]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash === '#/admin') setActiveView('admin');
      else if (hash === '#/admin/login') setActiveView('admin-login');
      else if (hash === '#/profile') setActiveView('profile');
      else if (hash === '#/settings') setActiveView('settings');
      else if (hash === '#/calendar') setActiveView('calendar');
      else if (hash === '#/assistant') setActiveView('assistant');
      else if (hash === '#/about') setActiveView('about');
      else setActiveView('dashboard');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          const status = await adminApi.checkAdminStatus(initialSession.user.id);
          setIsAdmin(status);
        }
      } catch (err: any) {
        console.warn("Auth check failed:", err.message);
      } finally {
        setTimeout(() => setIsInitialAuthCheck(false), 1500);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        setSession(newSession);
        const status = await adminApi.checkAdminStatus(newSession.user.id);
        setIsAdmin(status);
        
        if (event === 'SIGNED_IN') {
           const currentHash = window.location.hash;
           if (currentHash === '#/login' || currentHash === '' || currentHash === '#/') {
             setActiveView('dashboard');
             window.location.hash = '#/';
           }
        }
      } else {
        setSession(null);
        setIsAdmin(false);
        if (event === 'SIGNED_OUT') {
           setCurrentRecord(null);
           window.location.hash = '#/';
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  const handleSyncHealth = async () => {
    if (syncStatus !== 'idle' && syncStatus !== 'error') return;
    setSyncStatus('authorizing');
    try {
      if (isSandbox) {
        await new Promise(r => setTimeout(r, 1000));
        setSyncStatus('fetching');
        await new Promise(r => setTimeout(r, 800));
        const mock: SleepRecord = {
          id: 'mock-' + Date.now(),
          date: new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' }),
          score: 85,
          totalDuration: 460,
          deepRatio: 22,
          remRatio: 18,
          efficiency: 94,
          stages: [],
          heartRate: { resting: 62, max: 80, min: 55, average: 65, history: [] },
          aiInsights: ["Neural handshake complete. Biometric stream simulated."]
        };
        setSyncStatus('analyzing');
        const insights = await getSleepInsight(mock, lang);
        setCurrentRecord({ ...mock, aiInsights: insights });
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
        return;
      }
      await healthConnect.authorize();
      setSyncStatus('fetching');
      const data = await healthConnect.fetchSleepData();
      setSyncStatus('analyzing');
      const insights = await getSleepInsight(data as SleepRecord, lang);
      const fullRecord = { ...data, aiInsights: insights } as SleepRecord;
      setCurrentRecord(fullRecord);
      setHistory(prev => [fullRecord, ...prev].slice(0, 7));
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 2000);
    } catch (err: any) {
      console.error("Sync Interrupted:", err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const handleLogout = async () => {
    if (isSandbox) {
      localStorage.removeItem('somno_sandbox_active');
      setIsSandbox(false);
    }
    await authApi.signOut();
    setSession(null);
    setCurrentRecord(null);
    setHistory([]);
    setActiveView('dashboard');
    window.location.hash = '#/';
  };

  const enterSandbox = () => {
    localStorage.setItem('somno_sandbox_active', 'true');
    setIsSandbox(true);
    setActiveView('dashboard');
  };

  if (isInitialAuthCheck) return <LoadingSpinner label="Authenticating Neural Identity..." />;

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;

    if (!session && !isSandbox) {
      return (
        <UserLoginPage 
          onSuccess={() => {}} 
          onSandbox={enterSandbox} 
          lang={lang} 
        />
      );
    }

    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40 min-h-screen">
        <div key={activeView}>
          {activeView === 'dashboard' && (
            currentRecord ? (
              <Dashboard data={currentRecord} lang={lang} onSyncHealth={handleSyncHealth} onNavigate={(v: any) => window.location.hash = `#/${v}`} threeDEnabled={threeDEnabled} />
            ) : (
              <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-10">
                <div className="relative">
                  <Logo size={120} animated={true} threeD={threeDEnabled} />
                  <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -inset-12 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Health Connect Node Offline</h2>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-sm mx-auto leading-relaxed px-6">
                    {translations[lang].dashboard.manifesto}
                  </p>
                </div>
                <button 
                  onClick={handleSyncHealth}
                  disabled={syncStatus !== 'idle'}
                  className="px-12 py-6 bg-indigo-600 text-white rounded-full font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl active:scale-95 hover:bg-indigo-500 transition-all flex items-center gap-4"
                >
                  {syncStatus === 'idle' ? <><RefreshCw size={18} /> SYNC VIA HEALTH CONNECT</> : <><Loader2 size={18} className="animate-spin" /> {syncStatus.toUpperCase()}...</>}
                </button>
              </div>
            )
          )}
          {activeView === 'calendar' && <Suspense fallback={<LoadingSpinner />}><Trends history={history} lang={lang} /></Suspense>}
          {activeView === 'assistant' && <Suspense fallback={<LoadingSpinner />}><AIAssistant lang={lang} data={currentRecord} onNavigate={(v: any) => window.location.hash = `#/${v}`} isSandbox={isSandbox} /></Suspense>}
          {activeView === 'profile' && <Suspense fallback={<LoadingSpinner />}><UserProfile lang={lang} /></Suspense>}
          {activeView === 'about' && <Suspense fallback={<LoadingSpinner />}><AboutView lang={lang} onBack={() => window.location.hash = '#/'} /></Suspense>}
          {activeView === 'settings' && (
            <Suspense fallback={<LoadingSpinner />}>
              <Settings 
                lang={lang} 
                onLanguageChange={setLang} 
                onLogout={handleLogout} 
                onNavigate={(v: any) => window.location.hash = `#/${v}`}
                threeDEnabled={threeDEnabled}
                onThreeDChange={setThreeDEnabled}
                theme="dark"
                onThemeChange={()=>{}}
                accentColor="indigo"
                onAccentChange={()=>{}}
                staticMode={false}
                onStaticModeChange={()=>{}}
                lastSyncTime={null}
                onManualSync={() => {}}
              />
            </Suspense>
          )}
        </div>

        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <nav className="bg-slate-950/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Moon, label: 'LAB' },
              { id: 'calendar', icon: Zap, label: 'TRND' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'profile', icon: User, label: 'USER' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button key={nav.id} onClick={() => window.location.hash = `#/${nav.id}`} className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <nav.icon size={18} />
                {activeView === nav.id && <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return <RootLayout>{renderContent()}</RootLayout>;
};

export default App;
