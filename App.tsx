
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  const handleHardReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.hash = '#/';
    window.location.reload();
  };
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center gap-8 text-center bg-[#020617] z-[9999] p-6">
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full animate-pulse" />
        <Logo size={100} animated={true} className="relative z-10" />
      </div>
      <div className="space-y-6 relative z-10 w-full max-w-xs">
        <div className="space-y-3">
          <div className="flex items-center justify-center gap-3">
            <Shield size={14} className="text-indigo-500 animate-pulse" />
            <p className="text-white font-mono font-black uppercase text-[11px] tracking-[0.6em] italic">Calibrating Neural Link</p>
          </div>
          <div className="w-48 h-1 bg-white/5 rounded-full mx-auto overflow-hidden">
            <m.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }} className="h-full w-1/2 bg-indigo-600" />
          </div>
          <p className="text-slate-700 font-mono text-[9px] uppercase tracking-widest font-bold animate-pulse italic">Establishing Protocol Handshake...</p>
        </div>
        {showBypass && (
          <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4 space-y-3">
             <button onClick={onBypass} className="w-full py-4 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"><RefreshCw size={12} /> Force Load Console</button>
             <button onClick={handleHardReset} className="w-full py-3 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:text-rose-400 transition-all"><Power size={10} /> Clear Cache & Reset</button>
          </m.div>
        )}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const isAuthCallback = useMemo(() => window.location.hash.includes('access_token=') || window.location.hash.includes('id_token=') || window.location.search.includes('code='), []);
  const [lang, setLang] = useState<Language>('en'); 
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [dbCalibrationRequired, setDbCalibrationRequired] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [hasAppData, setHasAppData] = useState(false);
  const [authState, setAuthState] = useState<'loading' | 'unauthenticated' | 'authenticated'>('loading');
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState('idle');
  const [isSimulated, setIsSimulated] = useState(false);
  const [isRemoteApiValid, setIsRemoteApiValid] = useState<boolean | null>(null);
  
  const isRegistryCheckActive = useRef(false);

  const fetchHistory = useCallback(async (sim?: boolean) => {
    if (sim || isSimulated) { setHistory([MOCK_RECORD]); setCurrentRecord(MOCK_RECORD); setHasAppData(true); return; }
    try {
      const records = await healthDataApi.getTelemetryHistory(30);
      if (records && records.length > 0) { setHistory(records as any[]); setCurrentRecord(records[0] as any); setHasAppData(true); }
    } catch (err: any) { 
      if (err.message === "DB_CALIBRATION_REQUIRED") setDbCalibrationRequired(true);
      console.warn("Telemetry stream unreachable."); 
    }
  }, [isSimulated]);

  const checkLaboratoryRegistry = useCallback(async (sim?: boolean) => {
    if (isRegistryCheckActive.current && !sim) return;
    isRegistryCheckActive.current = true;

    if (sim || isSimulated) { 
      setSetupRequired(false); 
      setHasAppData(true); 
      setIsBlocked(false); 
      setDbCalibrationRequired(false); 
      setIsRemoteApiValid(true);
      await fetchHistory(true); 
      isRegistryCheckActive.current = false;
      return; 
    }
    try {
      const status = await userDataApi.getProfileStatus();
      if (status) { 
        setIsBlocked(status.is_blocked); 
        setSetupRequired(!status.is_initialized); 
        setHasAppData(status.has_app_data); 
        
        if (status.is_initialized) {
          const apiHasData = await healthDataApi.checkRemoteIngressStatus();
          setIsRemoteApiValid(apiHasData);
        }

        if (status.is_initialized && status.has_app_data) await fetchHistory(); 
      }
      else { setSetupRequired(true); }
    } catch (err: any) {
      if (err.message === "BLOCK_ACTIVE") setIsBlocked(true);
      else if (err.message === "DB_CALIBRATION_REQUIRED") setDbCalibrationRequired(true);
      else setHasAppData(false);
    } finally {
      isRegistryCheckActive.current = false;
    }
  }, [fetchHistory, isSimulated]);

  useEffect(() => {
    let mountActive = true;
    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!mountActive) return;
        if (initialSession) { 
          setSession(initialSession); 
          setAuthState('authenticated'); 
          adminApi.checkAdminStatus(initialSession.user.id).then(setIsAdmin); 
          checkLaboratoryRegistry(); 
        }
        else if (!isAuthCallback) setAuthState('unauthenticated');
      } catch (err) { if (mountActive) setAuthState('unauthenticated'); }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mountActive) return;
      if (newSession) {
        setSession(newSession); setIsSimulated(false); setAuthState('authenticated');
        adminApi.checkAdminStatus(newSession.user.id).then(setIsAdmin);
        checkLaboratoryRegistry();
        if (event === 'SIGNED_IN') {
          notificationService.sendNotification("SomnoAI Active", `Handshake verified: ${newSession.user.email}`);
        }
      } else { 
        setSession(null); 
        setIsAdmin(false); 
        if (!isAuthCallback) setAuthState('unauthenticated'); 
      }
    });

    const loadingSafety = setTimeout(() => { if (authState === 'loading') setAuthState('unauthenticated'); }, 6000);
    return () => { mountActive = false; subscription.unsubscribe(); clearTimeout(loadingSafety); };
  }, [checkLaboratoryRegistry, isAuthCallback, authState]);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || '#/';
      if (hash.includes('privacy')) setActiveView('privacy');
      else if (hash.includes('terms')) setActiveView('terms');
      else if (hash.includes('feedback')) setActiveView('feedback');
      else if (hash.includes('assistant')) setActiveView('assistant');
      else if (hash.includes('diary')) setActiveView('diary');
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
      setHasAppData(true); setCurrentRecord(fullRecord); setHistory(prev => [fullRecord, ...prev]); setSyncStatus('success');
      
      const apiHasData = await healthDataApi.checkRemoteIngressStatus();
      setIsRemoteApiValid(apiHasData);
      
      notificationService.sendNotification("Sync Complete", `Telemetry updated. Score: ${fullRecord.score}%`);
      setTimeout(() => setSyncStatus('idle'), 1500);
    } catch (err: any) { 
      if (err.message === "DB_CALIBRATION_REQUIRED") setDbCalibrationRequired(true);
      setSyncStatus('error'); 
      setTimeout(() => setSyncStatus('idle'), 2000); 
    }
  };

  const startSandbox = () => { 
    setIsSimulated(true); 
    setHasAppData(true); 
    setSetupRequired(false); 
    setAuthState('authenticated'); 
    setDbCalibrationRequired(false); 
    checkLaboratoryRegistry(true); 
    notificationService.sendNotification("Sandbox Mode", "Simulation active."); 
  };

  if (authState === 'loading') return <DecisionLoading onBypass={() => setAuthState('unauthenticated')} />;
  
  if (isBlocked) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-6 z-[9999]">
      <ShieldOff size={80} className="text-rose-600 mb-4 animate-pulse" /><h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">Access Revoked</h2>
      <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed uppercase tracking-widest font-bold">Your node has been suspended.</p>
      <button onClick={() => authApi.signOut()} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">TERMINATE SESSION</button>
    </div>
  );

  if (dbCalibrationRequired) return (
    <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center p-8 text-center space-y-8 z-[9999] overflow-y-auto">
      <div className="relative"><Database size={80} className="text-amber-500 mb-4" /><AlertTriangle size={32} className="absolute -bottom-2 -right-2 text-rose-500 animate-pulse" /></div>
      <div className="space-y-4 max-w-2xl"><h2 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-tight">Database Calibration Required</h2><p className="text-slate-400 text-xs leading-relaxed font-bold italic">Your database schema is incomplete or RLS policies are missing. Please run the <span className="text-white">setup.sql</span> script in your Supabase SQL Editor.</p></div>
      <div className="flex flex-col sm:flex-row gap-4"><button onClick={() => window.location.reload()} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20">RETRY HANDSHAKE</button><button onClick={startSandbox} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[10px] uppercase tracking-[0.4em] hover:text-white transition-all">BYPASS TO SANDBOX</button></div>
    </div>
  );

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;
    if (activeView === 'privacy') return <LegalView type="privacy" lang={lang} onBack={() => window.location.hash = '#/'} />;
    if (activeView === 'terms') return <LegalView type="terms" lang={lang} onBack={() => window.location.hash = '#/'} />;
    if (activeView === 'feedback') return <FeedbackView lang={lang} onBack={() => window.location.hash = '#/settings'} />;
    if (authState === 'unauthenticated' && !isSimulated) return <UserLoginPage onSuccess={() => {}} onSandbox={startSandbox} lang={lang} />;
    if (setupRequired && !isSimulated) return <FirstTimeSetup onComplete={() => { setSetupRequired(false); checkLaboratoryRegistry(); }} />;

    return (
      <div className="w-full flex flex-col">
        <AnimatePresence>
          {isRemoteApiValid === false && activeView === 'dashboard' && (
            <m.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-rose-600/90 backdrop-blur-md overflow-hidden">
               <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <AlertTriangle size={16} className="text-white animate-pulse" />
                     <p className="text-[10px] font-black text-white uppercase tracking-widest">External Data Link Incomplete: Remote Node Empty</p>
                  </div>
                  <button onClick={handleSyncHealth} className="px-4 py-1.5 bg-white text-rose-600 rounded-full text-[9px] font-black uppercase tracking-tighter hover:bg-rose-50 transition-all">FORCE SYNC</button>
               </div>
            </m.div>
          )}
        </AnimatePresence>

        <main className="flex-1 w-full max-w-4xl mx-auto p-4 pt-10 pb-48">
          <AnimatePresence mode="wait">
            <m.div key={activeView} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeView === 'dashboard' && (currentRecord && hasAppData ? <Dashboard data={currentRecord} lang={lang} onSyncHealth={handleSyncHealth} onNavigate={(v:any) => window.location.hash = `#/${v}`} threeDEnabled={true} /> : <div className="flex flex-col items-center justify-center min-h-[70vh] text-center gap-10"><Logo size={140} animated={true} /><div className="space-y-8 max-w-sm px-4"><div className="space-y-2"><h2 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">Neural Link Offline</h2><p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em] leading-relaxed">No telemetry detected.</p></div><div className="flex flex-col gap-4"><button onClick={handleSyncHealth} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-3 active:scale-95 transition-all"><Smartphone size={16} /> INITIALIZE BRIDGE</button><button onClick={startSandbox} className="px-10 py-5 bg-white/5 border border-white/10 text-slate-500 rounded-full font-black text-[11px] uppercase tracking-[0.4em] hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"><FlaskConical size={16} /> RUN SIMULATION</button></div></div></div>)}
              {activeView === 'calendar' && <DataHistory history={history} lang={lang} />}
              {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} />}
              {activeView === 'diary' && <DiaryView lang={lang} />}
              {activeView === 'profile' && <UserProfile lang={lang} />}
              {activeView === 'settings' && <Settings lang={lang} onLanguageChange={setLang} onLogout={() => authApi.signOut()} onNavigate={(v:any) => window.location.hash = `#/${v}`} threeDEnabled={true} onThreeDChange={() => {}} />}
            </m.div>
          </AnimatePresence>
        </main>
        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <m.nav initial={{ y: 100 }} animate={{ y: 0 }} className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Moon, label: translations[lang].nav.lab },
              { id: 'calendar', icon: History, label: translations[lang].nav.trends },
              { id: 'diary', icon: BookOpen, label: 'DIARY' },
              { id: 'assistant', icon: BrainCircuit, label: translations[lang].nav.insights },
              { id: 'settings', icon: SettingsIcon, label: translations[lang].nav.settings }
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
