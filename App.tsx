import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit, Settings as SettingsIcon, WifiOff, RefreshCw, FlaskConical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase, adminApi, authApi } from './services/supabaseService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { getSleepInsight } from './services/geminiService.ts';

const UserLoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminDashboard = lazy(() => import('./app/admin/page.tsx'));
const AdminLoginPage = lazy(() => import('./app/admin/login/page.tsx'));

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
  const [lang, setLang] = useState<Language>(() => (localStorage.getItem('somno_lang') as Language) || 'en');
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');

  const isSandbox = localStorage.getItem('somno_sandbox_active') === 'true';

  const getNormalizedRoute = useCallback(() => {
    const fullPath = (window.location.hash.replace(/^#/, '') || window.location.pathname).toLowerCase();
    if (fullPath.includes('/admin/login')) return 'admin-login';
    if (fullPath.includes('/admin')) return 'admin';
    if (fullPath.includes('/login')) return 'login';
    return '/';
  }, []);

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedRoute());

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession) {
          adminApi.isAdmin().then(status => setIsAdmin(status));
        }
      } catch (err) {
        console.error("Auth init failure:", err);
      } finally {
        setTimeout(() => setIsInitialAuthCheck(false), 300);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const status = await adminApi.checkAdminStatus(newSession.user.id);
        setIsAdmin(status);
      } else {
        setIsAdmin(false);
      }
      
      if (event === 'SIGNED_IN') {
        setActiveView('dashboard');
        setIsInitialAuthCheck(false);
      }
      
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('somno_sandbox_active');
        setCurrentRecord(null);
      }
    });

    const syncRoute = () => setActiveRoute(getNormalizedRoute());
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
      subscription.unsubscribe();
    };
  }, [getNormalizedRoute]);

  const handleSyncHealth = async (onProgress?: (status: SyncStatus) => void) => {
    console.log("Initializing Laboratory Sync...");
    setSyncStatus('authorizing');
    onProgress?.('authorizing');
    
    try {
      // 沙盒模式模拟逻辑
      if (isSandbox && !healthConnect.hasToken()) {
        console.log("Sandbox Simulation: Bypassing real Health Connect link.");
        await new Promise(r => setTimeout(r, 1200));
        setSyncStatus('fetching');
        onProgress?.('fetching');
        await new Promise(r => setTimeout(r, 800));
        
        const mockData: Partial<SleepRecord> = {
          date: new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', weekday: 'long' }),
          score: 84 + Math.floor(Math.random() * 8),
          totalDuration: 472,
          deepRatio: 24,
          remRatio: 19,
          efficiency: 96,
          stages: [
            { name: 'Awake', duration: 10, startTime: '23:45' },
            { name: 'Light', duration: 290, startTime: '00:00' },
            { name: 'Deep', duration: 100, startTime: '01:15' },
            { name: 'REM', duration: 82, startTime: '04:45' },
          ],
          heartRate: { resting: 60, max: 82, min: 56, average: 62, history: [] }
        };

        setSyncStatus('analyzing');
        onProgress?.('analyzing');
        const insights = await getSleepInsight(mockData as SleepRecord, lang);
        const fullRecord = { ...mockData, aiInsights: insights } as SleepRecord;
        setCurrentRecord(fullRecord);
        setSyncStatus('success');
        onProgress?.('success');
        setTimeout(() => setSyncStatus('idle'), 2000);
        return;
      }

      // 真实同步逻辑
      await healthConnect.authorize();
      
      setSyncStatus('fetching');
      onProgress?.('fetching');
      const data = await healthConnect.fetchSleepData();
      
      if (!data) throw new Error("NO_DATA_RETURNED");

      setSyncStatus('analyzing');
      onProgress?.('analyzing');
      const insights = await getSleepInsight(data as SleepRecord, lang);
      
      const fullRecord = { ...data, aiInsights: insights } as SleepRecord;
      
      setCurrentRecord(fullRecord);
      setHistory(prev => [fullRecord, ...prev.filter(h => h.date !== fullRecord.date)].slice(0, 14));
      
      setSyncStatus('success');
      onProgress?.('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Critical Sync Error:", err);
      setSyncStatus('error');
      onProgress?.('error');
      
      const msg = err?.message || String(err);
      if (msg === "LINK_REQUIRED" || msg === "AUTHORIZATION_TIMEOUT") {
        alert("Action Required: Please allow Health Connect access in the popup (Check if popup is blocked).");
      } else if (msg === "NO_HEALTH_CONNECT_DATA") {
        alert("No Data Found: Please ensure your wearable app has synced data to Health Connect.");
      } else {
        alert(`Handshake Failed: ${msg}`);
      }
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const handleLogout = async () => {
    await authApi.signOut();
    localStorage.removeItem('somno_sandbox_active');
    window.location.hash = '#/';
  };

  if (isInitialAuthCheck) return <LoadingSpinner label="Linking Identity Handshake..." />;

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return currentRecord ? (
          <Dashboard 
            data={currentRecord} 
            lang={lang} 
            onNavigate={setActiveView} 
            onSyncHealth={handleSyncHealth}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[75vh] gap-8 text-center px-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-slate-900 flex items-center justify-center text-slate-700 border border-white/5 shadow-2xl">
                <WifiOff size={40} />
              </div>
              <m.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-indigo-500/10 rounded-full"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter">Biometric Link Offline</h2>
              <p className="text-[12px] text-slate-500 font-bold uppercase tracking-widest max-w-sm leading-relaxed mx-auto">
                {translations[lang].dashboard.manifesto}
              </p>
            </div>
            <div className="flex flex-col gap-4 w-full max-w-xs">
              <button 
                onClick={() => handleSyncHealth()} 
                disabled={syncStatus !== 'idle' && syncStatus !== 'error'}
                className="w-full py-6 bg-indigo-600 text-white rounded-full font-black uppercase text-[11px] tracking-[0.3em] shadow-2xl active:scale-95 hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {syncStatus === 'idle' || syncStatus === 'error' ? (
                  <><RefreshCw size={16} /> CONNECT LAB NODES</>
                ) : (
                  <><Loader2 size={16} className="animate-spin" /> {syncStatus.toUpperCase()}...</>
                )}
              </button>
              
              {isSandbox && (
                <button 
                  onClick={() => { localStorage.removeItem('somno_sandbox_active'); window.location.reload(); }}
                  className="text-[9px] font-black text-slate-700 hover:text-rose-400 uppercase tracking-widest transition-colors py-2 flex items-center justify-center gap-2"
                >
                  <FlaskConical size={12} /> Exit Sandbox
                </button>
              )}

              <button 
                onClick={() => setActiveView('settings')} 
                className="text-[10px] font-black text-slate-700 hover:text-indigo-400 uppercase tracking-widest transition-colors py-2"
              >
                Config Lab Nodes
              </button>
            </div>
          </div>
        );
      case 'calendar': return <Trends history={history} lang={lang} />;
      case 'assistant': return <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} isSandbox={localStorage.getItem('somno_sandbox_active') === 'true'} />;
      case 'profile': return <UserProfile lang={lang} />;
      case 'settings': return (
        <Settings 
          lang={lang} 
          onLanguageChange={setLang} 
          onLogout={handleLogout} 
          onNavigate={setActiveView} 
          theme="dark" onThemeChange={()=>{}} 
          accentColor="indigo" onAccentChange={()=>{}} 
          threeDEnabled={true} onThreeDChange={()=>{}} 
          staticMode={false} onStaticModeChange={()=>{}} 
          lastSyncTime={null} 
          onManualSync={() => handleSyncHealth()} 
        />
      );
      default: return null;
    }
  };

  const renderContent = () => {
    if (activeRoute === 'admin-login') return <AdminLoginPage />;
    if (activeRoute === 'admin') return <AdminDashboard />;
    
    if (!session && !isSandbox) {
      return <UserLoginPage onSuccess={() => {}} onSandbox={() => {
        localStorage.setItem('somno_sandbox_active', 'true');
        window.location.reload();
      }} lang={lang} />;
    }

    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40 min-h-screen">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {renderActiveView()}
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
                onClick={() => setActiveView(nav.id as any)} 
                className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all shrink-0 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <nav.icon size={18} />
                {activeView === nav.id && <m.span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</m.span>}
              </button>
            ))}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <Suspense fallback={<LoadingSpinner />}>
        {renderContent()}
      </Suspense>
    </RootLayout>
  );
};

export default App;