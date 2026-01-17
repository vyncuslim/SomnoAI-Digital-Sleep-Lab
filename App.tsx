import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { Loader2, Activity, Zap, User, BrainCircuit, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { supabase, adminApi, authApi } from './services/supabaseService.ts';

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
  const [currentRecord] = useState<SleepRecord | null>(null);
  const [history] = useState<SleepRecord[]>([]);

  const getNormalizedRoute = useCallback(() => {
    const fullPath = (window.location.hash.replace(/^#/, '') || window.location.pathname).toLowerCase();
    if (fullPath.includes('/admin/login')) return 'admin-login';
    if (fullPath.includes('/admin')) return 'admin';
    if (fullPath.includes('/login')) return 'login';
    return '/';
  }, []);

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedRoute());

  // 监听身份变化
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session: curSession } } = await supabase.auth.getSession();
        setSession(curSession);
        if (curSession) {
          const adminStatus = await adminApi.isAdmin();
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error("Auth sync error:", err);
      } finally {
        setIsInitialAuthCheck(false);
      }
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        const adminStatus = await adminApi.isAdmin();
        setIsAdmin(adminStatus);
      } else {
        setIsAdmin(false);
      }
      
      if (event === 'SIGNED_IN') {
        setActiveView('dashboard');
      }
    });

    const syncRoute = () => setActiveRoute(getNormalizedRoute());
    window.addEventListener('hashchange', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      subscription.unsubscribe();
    };
  }, [getNormalizedRoute]);

  const handleLogout = async () => {
    await authApi.signOut();
  };

  // Google 登录或会话加载时的加载遮罩
  if (isInitialAuthCheck) return <LoadingSpinner label="Linking Identity Handshake..." />;

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return currentRecord ? <Dashboard data={currentRecord} lang={lang} onNavigate={setActiveView} /> : (
          <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
            <Activity className="text-indigo-400 animate-pulse" size={32} />
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Biometric Link Offline</h2>
            <button onClick={() => {}} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[10px] tracking-widest shadow-2xl active:scale-95 transition-all">Connect Lab Nodes</button>
          </div>
        );
      case 'calendar': return <Trends history={history} lang={lang} />;
      case 'assistant': return <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} isSandbox={false} />;
      case 'profile': return <UserProfile lang={lang} />;
      case 'settings': return <Settings lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView} theme="dark" onThemeChange={()=>{}} accentColor="indigo" onAccentChange={()=>{}} threeDEnabled={true} onThreeDChange={()=>{}} staticMode={false} onStaticModeChange={()=>{}} lastSyncTime={null} onManualSync={()=>{}} />;
      default: return null;
    }
  };

  const renderContent = () => {
    if (activeRoute === 'admin-login') return <AdminLoginPage />;
    if (activeRoute === 'admin') return <AdminDashboard />;
    
    // 强制登录守卫（排除沙盒模式）
    if (!session && !localStorage.getItem('somno_sandbox_active')) {
      return <UserLoginPage onSuccess={() => {}} onSandbox={() => {
        localStorage.setItem('somno_sandbox_active', 'true');
        window.location.reload();
      }} lang={lang} />;
    }

    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40">
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