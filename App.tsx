
import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, Activity, Zap, WifiOff, ShieldCheck, User, BrainCircuit } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from './services/i18n.ts';
import { supabase } from './lib/supabaseClient.ts';
import { GlassCard } from './components/GlassCard.tsx';

// 懒加载页面：必须在 Suspense 内运行
const LoginPage = lazy(() => import('./app/login/page.tsx'));
const AdminPage = lazy(() => import('./app/admin/page.tsx'));

// 核心组件
import { Dashboard } from './components/Dashboard.tsx';
const Trends = lazy(() => import('./components/Trends.tsx').then(m => ({ default: m.Trends })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(m => ({ default: m.AIAssistant })));
const Settings = lazy(() => import('./components/Settings.tsx').then(m => ({ default: m.Settings })));

const m = motion as any;

const LoadingSpinner = ({ label = "Loading..." }: { label?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center">
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
  
  // 路径归一化
  const getNormalizedPath = () => {
    let path = window.location.pathname.toLowerCase();
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return path || '/';
  };

  const [activeRoute, setActiveRoute] = useState<string>(getNormalizedPath());
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    const handlePopState = () => {
      setActiveRoute(getNormalizedPath());
    };
    window.addEventListener('popstate', handlePopState);
    
    // 强制执行初始同步
    const pathOnMount = getNormalizedPath();
    if (activeRoute !== pathOnMount) {
      setActiveRoute(pathOnMount);
    }

    if ((window as any).dismissLoader) (window as any).dismissLoader();
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSyncHealthConnect = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setErrorToast(null);
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
      setErrorToast(err.message || "Sync Failed");
    } finally {
      setIsLoading(false);
    }
  }, [lang]);

  const navigateTo = (path: string) => {
    const normalized = path.toLowerCase();
    window.history.pushState({}, '', normalized);
    setActiveRoute(normalized);
  };

  // 路由渲染逻辑
  const renderRoute = () => {
    if (activeRoute === '/login') return <LoginPage />;
    if (activeRoute === '/admin') return <AdminPage />;
    
    // 主实验室界面 (Root /)
    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40">
        <AnimatePresence mode="wait">
          <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {activeView === 'dashboard' ? (
              currentRecord ? (
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
                lang={lang} onLanguageChange={setLang} onLogout={() => supabase.auth.signOut().then(() => navigateTo('/login'))} onNavigate={setActiveView}
                theme="dark" onThemeChange={() => {}} accentColor="indigo" onAccentChange={() => {}}
                threeDEnabled={true} onThreeDChange={() => {}} staticMode={false} onStaticModeChange={() => {}}
                lastSyncTime={localStorage.getItem('somno_last_sync')} onManualSync={() => handleSyncHealthConnect(true)}
              />
            ) : null}
          </m.div>
        </AnimatePresence>

        {/* 浮动导航栏 */}
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-10 flex justify-center pointer-events-none">
          <nav className="bg-slate-900/60 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-2 pointer-events-auto shadow-2xl overflow-hidden">
            {[
              { id: 'dashboard', icon: Activity, label: 'LAB' },
              { id: 'calendar', icon: Zap, label: 'TRND' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'profile', icon: User, label: 'CFG' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => {
                  if (activeRoute !== '/') navigateTo('/');
                  setActiveView(nav.id as any);
                }} 
                className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${activeView === nav.id && activeRoute === '/' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <nav.icon size={20} />
                {activeView === nav.id && activeRoute === '/' && <m.span layoutId="nav-text" className="text-[10px] font-black uppercase tracking-widest">{nav.label}</m.span>}
              </button>
            ))}
            <div className="w-[1px] h-8 bg-white/10 mx-1 self-center" />
            <button 
              onClick={() => navigateTo('/admin')}
              className={`relative flex items-center gap-2 px-6 py-4 rounded-full transition-all ${activeRoute === '/admin' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-500 hover:text-rose-400'}`}
            >
              <ShieldCheck size={20} />
              {activeRoute === '/admin' && <m.span layoutId="nav-text-admin" className="text-[10px] font-black uppercase tracking-widest">ADM</m.span>}
            </button>
          </nav>
        </div>
      </div>
    );
  };

  return (
    <RootLayout>
      <Suspense fallback={<LoadingSpinner label="Decrypting Laboratory Node..." />}>
        {renderRoute()}
      </Suspense>
    </RootLayout>
  );
};

export default App;
