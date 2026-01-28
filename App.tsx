
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Moon, User, BrainCircuit, Settings as SettingsIcon, History, BookOpen, Smartphone, ShieldOff, AlertTriangle, Database, Shield, FlaskConical, Zap, CheckCircle, MessageSquare, RefreshCw, Power } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language, translations } from './services/i18n.ts';
import { supabase, adminApi, authApi, userDataApi, healthDataApi } from './services/supabaseService.ts';
import { healthConnect } from './services/healthConnectService.ts';
import { getSleepInsight } from './services/geminiService.ts';
import { Logo } from './components/Logo.tsx';
import { notificationService } from './services/notificationService.ts';

// Components
import AdminLoginPage from './app/admin/login/page.tsx';
import AdminDashboard from './app/admin/page.tsx';
import UserLoginPage from './app/login/page.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { DataHistory } from './components/DataHistory.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { DiaryView } from './components/DiaryView.tsx';
import { Settings } from './Settings.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';
import { LegalView } from './components/LegalView.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';

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

const DecisionLoading = ({ onBypass }: { onBypass: () => void }) => {
  const [showBypass, setShowBypass] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setShowBypass(true), 3500);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center bg-[#020617] z-[9999] p-6">
      <Logo size={100} animated={true} />
      <div className="space-y-4">
        <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.6em] italic animate-pulse">Initializing Neural Link</p>
        <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden mx-auto">
          <m.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity }} className="h-full w-1/2 bg-indigo-600" />
        </div>
        {showBypass && (
          <button onClick={onBypass} className="px-6 py-3 bg-white/5 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest hover:text-white transition-all">Force Console Access</button>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en'); 
  const [session, setSession] = useState<any>(null);
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  
  // 核心循环控制状态
  const [setupRequired, setSetupRequired] = useState(false);
  const [hasAppData, setHasAppData] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isSimulated, setIsSimulated] = useState(false);
  const [forceSetupPassed, setForceSetupPassed] = useState(false);
  const [dbError, setDbError] = useState(false);

  const fetchHistory = useCallback(async (sim?: boolean) => {
    if (sim || isSimulated) { setHistory([MOCK_RECORD]); setCurrentRecord(MOCK_RECORD); setHasAppData(true); return; }
    try {
      const records = await healthDataApi.getTelemetryHistory(30);
      if (records && records.length > 0) { setHistory(records as any[]); setCurrentRecord(records[0] as any); setHasAppData(true); }
    } catch (err) { console.warn("Stream offline."); }
  }, [isSimulated]);

  const checkLaboratoryRegistry = useCallback(async (sim?: boolean) => {
    if (sim || isSimulated || forceSetupPassed) { 
      setSetupRequired(false); 
      setHasAppData(true); 
      setAuthState('authenticated');
      if (history.length === 0) await fetchHistory(sim);
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
      else if (err.message === "DB_CALIBRATION_REQUIRED") setDbError(true);
      else setSetupRequired(true);
    }
  }, [fetchHistory, isSimulated, forceSetupPassed, history.length]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: s } } = await supabase.auth.getSession();
      if (s) { setSession(s); setAuthState('authenticated'); checkLaboratoryRegistry(); }
      else { setAuthState('unauthenticated'); }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession) {
        setSession(newSession);
        setAuthState('authenticated');
        if (event === 'SIGNED_IN') checkLaboratoryRegistry();
      } else {
        setSession(null);
        setAuthState('unauthenticated');
      }
    });
    return () => subscription.unsubscribe();
  }, [checkLaboratoryRegistry]);

  useEffect(() => {
    const handleHash = () => {
      const h = window.location.hash || '#/';
      if (h.includes('calendar')) setActiveView('calendar');
      else if (h.includes('assistant')) setActiveView('assistant');
      else if (h.includes('diary')) setActiveView('diary');
      else if (h.includes('profile')) setActiveView('profile');
      else if (h.includes('settings')) setActiveView('settings');
      else if (h.includes('admin/login')) setActiveView('admin-login');
      else if (h.includes('admin')) setActiveView('admin');
      else if (h.includes('privacy')) setActiveView('privacy');
      else if (h.includes('terms')) setActiveView('terms');
      else if (h.includes('feedback')) setActiveView('feedback');
      else setActiveView('dashboard');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
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
    } catch (err: any) { setSyncStatus('error'); setTimeout(() => setSyncStatus('idle'), 2000); }
  };

  const startSandbox = () => { setIsSimulated(true); setHasAppData(true); setSetupRequired(false); setForceSetupPassed(true); setAuthState('authenticated'); };

  if (authState === 'loading') return <DecisionLoading onBypass={() => setAuthState('unauthenticated')} />;
  
  if (dbError) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6 z-[9999]">
      <AlertTriangle size={80} className="text-amber-500 mb-4 animate-pulse" />
      <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Database Loop Detected</h2>
      <p className="text-slate-500 text-sm max-w-sm italic">Policy recursion is restricting node access. Administrative intervention is required.</p>
      <button onClick={() => window.location.hash = '#/admin'} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-xl active:scale-95">PROCEED TO REPAIR TERMINAL</button>
    </div>
  );

  if (isBlocked) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6 z-[9999]">
      <ShieldOff size={80} className="text-rose-600 mb-4 animate-pulse" /><h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Access Revoked</h2>
      <button onClick={() => authApi.signOut()} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-full font-black text-[10px] uppercase tracking-widest">EXIT TERMINAL</button>
    </div>
  );

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;
    if (activeView === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => window.location.hash = '#/'} />;
    if (activeView === 'terms') return <LegalView type="terms" lang={lang} onBack={() => window.location.hash = '#/'} />;
    if (activeView === 'feedback') return <FeedbackView lang={lang} onBack={() => window.location.hash = '#/settings'} />;
    
    if (authState === 'unauthenticated' && !isSimulated) return <UserLoginPage onSuccess={() => {}} onSandbox={startSandbox} lang={lang} />;
    
    // 强制状态锁，物理断开循环
    if (setupRequired && !isSimulated && !forceSetupPassed) return (
      <FirstTimeSetup onComplete={() => { 
        setForceSetupPassed(true); 
        setSetupRequired(false); 
        checkLaboratoryRegistry();
      }} />
    );

    return (
      <div className="w-full flex flex-col">
        <main className="flex-1 w-full max-w-4xl mx-auto p-4 pt-10 pb-48">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === 'dashboard' && (currentRecord && hasAppData ? <Dashboard data={currentRecord} lang={lang} onSyncHealth={handleSyncHealth} onNavigate={(v:any) => window.location.hash = `#/${v}`} /> : <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-10"><Logo size={140} animated={true} /><div className="space-y-8 max-w-sm px-4"><div className="space-y-2"><h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Neural Link Offline</h2><p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">No telemetry detected.</p></div><div className="flex flex-col gap-4"><button onClick={handleSyncHealth} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Smartphone size={16} /> INITIALIZE BRIDGE</button><button onClick={startSandbox} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"><FlaskConical size={16} /> RUN SIMULATION</button></div></div></div>)}
              {activeView === 'calendar' && <DataHistory history={history} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'profile' && <UserProfile lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => authApi.signOut()} onNavigate={(v:any) => window.location.hash = `#/${v}`} />}
            </m.div>
          </AnimatePresence>
        </main>
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <m.nav initial={{ y: 100 }} animate={{ y: 0 }} className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Moon, label: translations[lang].nav.lab },
              { id: 'calendar', icon: History, label: translations[lang].nav.trends },
              { id: 'diary', icon: BookOpen, label: 'DIARY' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button key={nav.id} onClick={() => window.location.hash = `#/${nav.id}`} className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all active:scale-90 ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                <nav.icon size={18} />{activeView === nav.id && <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>}
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
