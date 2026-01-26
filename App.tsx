import React, { useState, useEffect, useCallback } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, User, BrainCircuit, Settings as SettingsIcon, Moon, Activity, FlaskConical, History, Terminal, Smartphone, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase, adminApi, authApi, userDataApi, healthDataApi } from './services/supabaseService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { getSleepInsight } from './services/geminiService.ts';
import { Logo } from './components/Logo.tsx';

// Components
import AdminLoginPage from './app/admin/login/page.tsx';
import AdminDashboard from './app/admin/page.tsx';
import UserLoginPage from './app/login/page.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { DataHistory } from './components/DataHistory.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './Settings.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { LegalView } from './components/LegalView.tsx';

const m = motion as any;

const MOCK_RECORD: SleepRecord = {
  id: 'sandbox-alpha-01',
  date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
  score: 84,
  totalDuration: 465,
  deepRatio: 22,
  remRatio: 21,
  efficiency: 89,
  stages: [
    { name: 'Awake', duration: 15, startTime: '23:30' },
    { name: 'Light', duration: 250, startTime: '23:45' },
    { name: 'Deep', duration: 100, startTime: '02:00' },
    { name: 'REM', duration: 100, startTime: '04:30' }
  ],
  heartRate: { resting: 58, max: 75, min: 48, average: 62, history: [] },
  aiInsights: ["Neural synthesis complete. Link stable.", "Fact: Simulation active."]
};

const DecisionLoading = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-6 text-center bg-[#020617] z-[9999]">
    <Logo size={60} animated={true} />
    <p className="text-white font-black uppercase text-[10px] tracking-[0.5em] italic animate-pulse">
      CALIBRATING NEURAL LINK...
    </p>
  </div>
);

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en'); // Default to English
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [hasAppData, setHasAppData] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isSimulated, setIsSimulated] = useState(false);

  const fetchHistory = useCallback(async (sim?: boolean) => {
    if (sim || isSimulated) {
      setHistory([MOCK_RECORD]);
      setCurrentRecord(MOCK_RECORD);
      setHasAppData(true);
      return;
    }
    try {
      const records = await healthDataApi.getTelemetryHistory(30);
      if (records && records.length > 0) {
        setHistory(records as any[]);
        setCurrentRecord(records[0] as any);
        setHasAppData(true);
      }
    } catch (err) {}
  }, [isSimulated]);

  const checkLaboratoryRegistry = useCallback(async (sim?: boolean) => {
    if (sim || isSimulated) {
      setSetupRequired(false);
      setHasAppData(true);
      setIsBlocked(false);
      await fetchHistory(true);
      return;
    }
    try {
      const status = await userDataApi.getProfileStatus();
      if (status) {
        setIsBlocked(status.is_blocked);
        setSetupRequired(!status.is_initialized);
        setHasAppData(status.has_app_data);
        if (status.is_initialized && status.has_app_data) await fetchHistory();
      } else {
        setSetupRequired(true);
      }
    } catch (err: any) {
      if (err.message === "BLOCK_ACTIVE") setIsBlocked(true);
    }
  }, [fetchHistory, isSimulated]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession) {
          setSession(initialSession);
          adminApi.checkAdminStatus(initialSession.user.id).then(setIsAdmin);
          await checkLaboratoryRegistry();
        }
      } finally {
        setIsInitialAuthCheck(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setIsSimulated(false);
        adminApi.checkAdminStatus(newSession.user.id).then(setIsAdmin);
        checkLaboratoryRegistry();
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setIsAdmin(false);
        setIsBlocked(false);
        setIsSimulated(false);
        setHasAppData(false);
        setSetupRequired(false);
      }
    });
    return () => subscription.unsubscribe();
  }, [checkLaboratoryRegistry]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#/';
      if (hash.includes('privacy')) setActiveView('privacy');
      else if (hash.includes('terms')) setActiveView('terms');
      else if (hash.includes('assistant')) setActiveView('assistant');
      else if (hash.includes('admin/login')) setActiveView('admin-login');
      else if (hash.includes('admin')) setActiveView('admin');
      else if (hash.includes('profile')) setActiveView('profile');
      else if (hash.includes('settings')) setActiveView('settings');
      else if (hash.includes('calendar')) setActiveView('calendar');
      else setActiveView('dashboard');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleSyncHealth = async () => {
    if (syncStatus !== 'idle') return;
    setSyncStatus('authorizing');
    try {
      await healthConnect.authorize();
      setSyncStatus('fetching');
      const data = await healthConnect.fetchSleepData();
      setSyncStatus('analyzing');
      const insights = await getSleepInsight(data as SleepRecord, lang);
      const fullRecord = { ...data, aiInsights: insights } as SleepRecord;
      
      await healthDataApi.uploadTelemetry(fullRecord);
      setHasAppData(true);
      setCurrentRecord(fullRecord);
      setHistory(prev => [fullRecord, ...prev]);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 1500);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 2000);
    }
  };

  const startSandbox = () => {
    // Immediate state update to prevent black screen (render logic will skip loaders)
    setIsSimulated(true);
    setHasAppData(true);
    setSetupRequired(false);
    setIsInitialAuthCheck(false);
    checkLaboratoryRegistry(true);
  };

  if (isInitialAuthCheck) return <DecisionLoading />;

  if (isBlocked) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6 z-[9999]">
        <ShieldOff size={80} className="text-rose-600 mb-4 animate-pulse" />
        <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">Node Access Revoked</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">Your biometric node has been suspended by system authority.</p>
        <button onClick={() => authApi.signOut()} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">TERMINATE SESSION</button>
      </div>
    );
  }

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;
    if (activeView === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => window.location.hash = '#/'} />;
    if (activeView === 'terms') return <LegalView type="terms" lang={lang} onBack={() => window.location.hash = '#/'} />;

    if (!session && !isSimulated) {
      return <UserLoginPage onSuccess={() => {}} onSandbox={startSandbox} lang={lang} />;
    }

    if (setupRequired && !isSimulated) {
      return <FirstTimeSetup onComplete={() => { setSetupRequired(false); checkLaboratoryRegistry(); }} />;
    }

    return (
      <div className="flex flex-col h-full overflow-hidden relative bg-[#020617]">
        <main className="flex-1 overflow-y-auto p-4 pt-10 pb-40 scrollbar-hide">
          <div className="max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              <m.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {activeView === 'dashboard' && (
                  currentRecord && hasAppData ? (
                    <Dashboard data={currentRecord} lang={lang} onSyncHealth={handleSyncHealth} onNavigate={(v:any) => window.location.hash = `#/${v}`} threeDEnabled={true} />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-10">
                      <Logo size={140} animated={true} />
                      <div className="space-y-8 max-w-sm">
                        <div className="space-y-2">
                           <h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-tight">Neural Link Offline</h2>
                           <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">No telemetry detected. Initialize laboratory bridge to begin.</p>
                        </div>
                        <div className="flex flex-col gap-4">
                          <button onClick={handleSyncHealth} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3">
                            <Smartphone size={16} /> INITIALIZE BRIDGE
                          </button>
                          <button onClick={startSandbox} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-3">
                            <FlaskConical size={16} /> RUN SIMULATION
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                )}
                {activeView === 'calendar' && <DataHistory history={history} lang={lang} />}
                {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
                {activeView === 'profile' && <UserProfile lang={lang} />}
                {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => authApi.signOut()} onNavigate={(v:any) => window.location.hash = `#/${v}`} threeDEnabled={true} onThreeDChange={() => {}} />}
              </m.div>
            </AnimatePresence>
          </div>
        </main>

        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <m.nav initial={{ y: 100 }} animate={{ y: 0 }} className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Moon, label: translations[lang].nav.lab },
              { id: 'calendar', icon: History, label: translations[lang].nav.trends },
              { id: 'assistant', icon: BrainCircuit, label: translations[lang].nav.insights },
              { id: 'profile', icon: User, label: 'USER' },
              { id: 'settings', icon: SettingsIcon, label: translations[lang].nav.settings }
            ].map((nav) => (
              <button key={nav.id} onClick={() => window.location.hash = `#/${nav.id}`} className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <nav.icon size={18} />
                {activeView === nav.id && <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>}
              </button>
            ))}
          </m.nav>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#020617] w-full h-full">
      <RootLayout>{renderContent()}</RootLayout>
    </div>
  );
};

export default App;