
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { 
  Moon, BrainCircuit, Settings as SettingsIcon, History, 
  BookOpen, DatabaseZap, Zap, MessageSquare, LayoutGrid,
  Activity, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase, authApi, userDataApi } from './services/supabaseService.ts';
import { Logo } from './components/Logo.tsx';

// Components
import AdminDashboard from './app/admin/page.tsx';
import AdminLoginPage from './app/admin/login/page.tsx';
import UserLoginPage from './app/login/page.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Trends } from './components/Trends.tsx';
import { DiaryView } from './components/DiaryView.tsx';

const m = motion as any;

const MOCK_RECORD: SleepRecord = {
  id: 'mock-1',
  date: new Date().toLocaleDateString(),
  score: 82,
  totalDuration: 460,
  deepRatio: 22,
  remRatio: 20,
  efficiency: 89,
  stages: [
    { name: 'Awake', duration: 30, startTime: '23:30' },
    { name: 'Light', duration: 250, startTime: '00:00' },
    { name: 'Deep', duration: 100, startTime: '02:00' },
    { name: 'REM', duration: 80, startTime: '05:00' },
  ],
  heartRate: {
    resting: 58,
    max: 75,
    min: 48,
    average: 62,
    history: []
  },
  aiInsights: ["Neural handshake stable.", "Deep sleep optimization identified."]
};

const DecisionLoading = ({ onBypass }: { onBypass: () => void }) => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center bg-[#020617] z-[9999] p-6">
    <div className="relative">
      <div className="absolute inset-0 bg-indigo-600/20 blur-[100px] rounded-full animate-pulse" />
      <Logo size={120} animated={true} />
    </div>
    <div className="space-y-4">
      <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.6em] italic animate-pulse">Initializing Neural Link</p>
      <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
        <m.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-1/2 bg-indigo-600" />
      </div>
      <button onClick={onBypass} className="mt-8 px-6 py-3 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">Force Bypass</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en'); 
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord] = useState<SleepRecord | null>(null);
  
  const [setupRequired, setSetupRequired] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [rpcMissing, setRpcMissing] = useState(false);

  const checkLaboratoryRegistry = useCallback(async () => {
    try {
      const status = await userDataApi.getProfileStatus();
      if (status) { 
        setSetupRequired(!status.is_initialized); 
      }
    } catch (err: any) {
      if (err.message === "RPC_MISSING_DEPLOY_SQL") setRpcMissing(true);
      else setSetupRequired(true);
    } finally {
      setAuthState(prev => prev === 'loading' ? 'unauthenticated' : prev);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (s) {
          await checkLaboratoryRegistry();
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      } catch (e) {
        setAuthState('unauthenticated');
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        setAuthState('authenticated');
        await checkLaboratoryRegistry();
      } else {
        setAuthState('unauthenticated');
      }
    });
    return () => subscription.unsubscribe();
  }, [checkLaboratoryRegistry]);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash || '#/';
      if (h.includes('admin/login')) setActiveView('admin-login');
      else if (h.includes('admin')) setActiveView('admin');
      else if (h.includes('calendar')) setActiveView('calendar');
      else if (h.includes('assistant')) setActiveView('assistant');
      else if (h.includes('diary')) setActiveView('diary');
      else if (h.includes('settings')) setActiveView('settings');
      else setActiveView('dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  if (authState === 'loading') return <DecisionLoading onBypass={() => setAuthState('unauthenticated')} />;
  
  if (rpcMissing) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6 z-[9999]">
      <DatabaseZap size={80} className="text-indigo-500 mb-4 animate-bounce" />
      <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">SQL RPC Missing</h2>
      <p className="text-slate-500 text-sm max-w-sm italic">The database function 'get_profile_status' was not found. Please run the SQL Kernel script.</p>
      <button onClick={() => window.location.reload()} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">RE-CHECK CONNECTION</button>
    </div>
  );

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;
    if (authState === 'unauthenticated' && !isSimulated) {
      return <UserLoginPage onSuccess={() => checkLaboratoryRegistry()} onSandbox={() => setIsSimulated(true)} lang={lang} />;
    }
    if (setupRequired && !isSimulated) return <FirstTimeSetup onComplete={() => setSetupRequired(false)} />;

    return (
      <div className="w-full flex flex-col min-h-screen">
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 pt-10 pb-48">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === 'dashboard' && <Dashboard data={currentRecord || MOCK_RECORD} lang={lang} onNavigate={(v:any) => window.location.hash = `#/${v}`} />}
              {activeView === 'calendar' && <Trends history={[MOCK_RECORD]} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord || MOCK_RECORD} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => authApi.signOut()} onNavigate={(v:any) => window.location.hash = `#/${v}`} />}
            </m.div>
          </AnimatePresence>
        </main>
        
        {/* 底部 Pill Dock 导航栏 - 对齐截图设计 */}
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <m.nav 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            className="bg-[#0a0f25]/90 backdrop-blur-3xl border border-white/5 rounded-full p-2 flex gap-1 pointer-events-auto shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)]"
          >
            {[
              { id: 'dashboard', icon: Moon, label: 'LAB' },
              { id: 'calendar', icon: History, label: 'HIST' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'diary', icon: BookOpen, label: 'LOG' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button 
                key={nav.id} 
                onClick={() => window.location.hash = `#/${nav.id}`} 
                className={`relative flex items-center gap-3 px-6 py-4 rounded-full transition-all duration-500 active:scale-90 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]' : 'text-slate-600 hover:text-slate-300'}`}
              >
                <nav.icon size={18} className={activeView === nav.id ? 'fill-white/20' : ''} />
                <AnimatePresence>
                  {activeView === nav.id && (
                    <m.span 
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 'auto', opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="text-[9px] font-black uppercase tracking-widest overflow-hidden whitespace-nowrap"
                    >
                      {nav.label}
                    </m.span>
                  )}
                </AnimatePresence>
              </button>
            ))}
          </m.nav>
        </div>
      </div>
    );
  };

  return <RootLayout>{renderContent()}</RootLayout>;
};

export default App;
