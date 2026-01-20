
import React, { useState, useEffect } from 'react';
import RootLayout from './app/layout.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { Loader2, User, BrainCircuit, Settings as SettingsIcon, Moon, Zap, Activity, FlaskConical, AlertTriangle, ChevronRight } from 'lucide-react';
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
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './Settings.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { AboutView } from './components/AboutView.tsx';
import { FirstTimeSetup } from './components/FirstTimeSetup.tsx';

const m = motion as any;

const LoadingSpinner = ({ onBypass }: { onBypass: () => void }) => {
  const [showBypass, setShowBypass] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setShowBypass(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center bg-[#020617] p-8">
      <div className="relative">
        <div className="absolute -inset-10 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <Loader2 size={40} className="animate-spin text-indigo-500 relative z-10" />
      </div>
      <div className="space-y-4 relative z-10">
        <div className="space-y-1">
          <p className="text-white font-black uppercase text-[11px] tracking-[0.4em] italic">Authenticating Neural Identity...</p>
          <p className="text-slate-600 text-[8px] uppercase tracking-widest font-bold">Neural Protocol Verification In Progress</p>
        </div>
        
        <AnimatePresence>
          {showBypass && (
            <m.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-6"
            >
              <button 
                onClick={onBypass}
                className="flex items-center gap-2 mx-auto px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
              >
                <AlertTriangle size={12} className="text-amber-500" />
                Connection slow? Force Entry
                <ChevronRight size={12} />
              </button>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('somno_lang');
      return (saved as Language) || 'en';
    } catch (e) { return 'en'; }
  });
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [setupRequired, setSetupRequired] = useState(false);
  const [isInitialAuthCheck, setIsInitialAuthCheck] = useState(true);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [threeDEnabled, setThreeDEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('somno_3d_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch(e) { return true; }
  });
  
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isSimulated, setIsSimulated] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('somno_3d_enabled', threeDEnabled.toString());
      localStorage.setItem('somno_lang', lang);
    } catch (e) {}
  }, [threeDEnabled, lang]);

  const checkSetup = async () => {
    try {
      const data = await userDataApi.getUserData();
      setSetupRequired(!data || !data.setup_completed);
    } catch (err) {
      console.warn("Setup check deferred.");
    }
  };

  const fetchHistory = async () => {
    try {
      const telemetry = await healthDataApi.getTelemetryHistory();
      if (telemetry && telemetry.length > 0) {
        const records = telemetry.map((t: any) => {
          const p = t.payload || {};
          return {
            id: t.id,
            date: new Date(t.recorded_at || t.created_at).toLocaleDateString(),
            score: p.score || 85,
            totalDuration: p.totalDuration || p.duration || 480,
            deepRatio: p.deepRatio || p.deep_ratio || 20,
            remRatio: p.remRatio || p.rem_ratio || 20,
            efficiency: p.efficiency || 90,
            stages: p.stages || [],
            heartRate: p.heartRate || p.heart_rate || { resting: t.heart_rate || 60, max: 80, min: 50, average: 65, history: [] },
            aiInsights: p.aiInsights || p.ai_insights || []
          };
        });
        setHistory(records as SleepRecord[]);
        if (!currentRecord) setCurrentRecord(records[0] as SleepRecord);
        setIsSimulated(false);
      }
    } catch (err) {
      console.warn("Telemetry stream unreachable.");
    }
  };

  useEffect(() => {
    const handleHash = () => {
      let hash = '#/';
      try {
        hash = window.location.hash || '#/';
      } catch (e) {
        console.warn("Security Alert: Access to location.hash is restricted.");
      }
      
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
    // 3-second safety timer (reduced from 5s for faster feel)
    const safetyTimer = setTimeout(() => {
      setIsInitialAuthCheck(false);
    }, 3000);

    const initAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        
        if (initialSession) {
          adminApi.checkAdminStatus(initialSession.user.id).then(setIsAdmin).catch(() => setIsAdmin(false));
          checkSetup();
          fetchHistory();
        }
      } catch (err: any) {
        console.warn("Auth sync failure:", err.message);
      } finally {
        setIsInitialAuthCheck(false);
        clearTimeout(safetyTimer);
      }
    };
    
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      if (newSession) {
        adminApi.checkAdminStatus(newSession.user.id).then(setIsAdmin).catch(() => setIsAdmin(false));
        checkSetup();
        fetchHistory();
      } else {
        setIsAdmin(false);
        setSetupRequired(false);
        setHistory([]);
        setCurrentRecord(null);
      }
    });
    
    return () => {
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleInitializeSimulation = () => {
    setSyncStatus('analyzing');
    setTimeout(() => {
      const mockRecord: SleepRecord = {
        id: 'sim-01',
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' }),
        score: 82,
        totalDuration: 442,
        deepRatio: 22,
        remRatio: 18,
        efficiency: 91,
        stages: [
          { name: 'Deep', duration: 90, startTime: '01:00' },
          { name: 'REM', duration: 80, startTime: '03:30' },
          { name: 'Light', duration: 250, startTime: '00:30' },
          { name: 'Awake', duration: 22, startTime: '05:00' }
        ],
        heartRate: { resting: 58, max: 75, min: 52, average: 62, history: [] },
        aiInsights: [
          "Simulation: Your neural architecture indicates strong recovery patterns.",
          "Strategic Insight: Deep sleep cycles optimized for cognitive consolidation.",
          "Biometric Note: Resting heart rate shows high parasympathetic activity."
        ]
      };
      setCurrentRecord(mockRecord);
      setHistory([mockRecord]);
      setIsSimulated(true);
      setSyncStatus('idle');
    }, 1500);
  };

  const handleSyncHealth = async () => {
    if (syncStatus !== 'idle' && syncStatus !== 'error') return;
    setSyncStatus('authorizing');
    try {
      await healthConnect.authorize();
      setSyncStatus('fetching');
      const data = await healthConnect.fetchSleepData();
      setSyncStatus('analyzing');
      const insights = await getSleepInsight(data as SleepRecord, lang);
      const fullRecord = { ...data, aiInsights: insights } as SleepRecord;
      
      await healthDataApi.uploadTelemetry({
        ...fullRecord,
        source: healthConnect.isNativeBridgeAvailable() ? 'android_native_bridge' : 'health_connect'
      });

      setCurrentRecord(fullRecord);
      setHistory(prev => [fullRecord, ...prev].slice(0, 14));
      setIsSimulated(false);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 1500);
    } catch (err: any) {
      console.error("Health Sync Failure:", err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 1500);
    }
  };

  const handleLogout = async () => {
    await authApi.signOut();
    setSession(null);
    setCurrentRecord(null);
    setHistory([]);
    setActiveView('dashboard');
    try {
      window.location.hash = '#/';
    } catch (e) {}
  };

  if (isInitialAuthCheck) return <LoadingSpinner onBypass={() => setIsInitialAuthCheck(false)} />;

  const renderContent = () => {
    if (activeView === 'admin-login') return <AdminLoginPage />;
    if (activeView === 'admin') return <AdminDashboard />;

    if (!session) {
      return (
        <UserLoginPage 
          onSuccess={() => {}} 
          onSandbox={() => {}} 
          lang={lang} 
        />
      );
    }

    if (setupRequired) {
      return <FirstTimeSetup onComplete={() => setSetupRequired(false)} />;
    }

    return (
      <div className="max-w-4xl mx-auto p-4 pt-10 pb-40 min-h-screen">
        <AnimatePresence mode="wait">
          <m.div 
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeView === 'dashboard' && (
              currentRecord ? (
                <div className="space-y-4">
                  {isSimulated && (
                    <div className="px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between mb-4">
                       <div className="flex items-center gap-3 text-amber-500">
                         <Activity size={16} className="animate-pulse" />
                         <span className="text-[10px] font-black uppercase tracking-widest italic">Simulation Mode Active</span>
                       </div>
                       <button onClick={handleSyncHealth} className="text-[9px] font-black text-white bg-amber-600 px-4 py-1.5 rounded-full uppercase tracking-widest hover:bg-amber-500 transition-all">Connect Real Data</button>
                    </div>
                  )}
                  <Dashboard data={currentRecord} lang={lang} onSyncHealth={handleSyncHealth} onNavigate={(v: any) => { try { window.location.hash = `#/${v}` } catch(e) {} }} threeDEnabled={threeDEnabled} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[70vh] text-center gap-10">
                  <Logo size={140} animated={true} threeD={threeDEnabled} />
                  <div className="space-y-8">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-black italic text-white uppercase tracking-tighter">Laboratory Offline</h2>
                       <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.4em]">Hardware synchronization required</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <button 
                        onClick={handleSyncHealth}
                        className="px-10 py-5 bg-indigo-600 text-white rounded-full font-black uppercase text-[11px] tracking-[0.4em] shadow-2xl active:scale-95 transition-all w-full sm:w-auto"
                      >
                        {syncStatus === 'authorizing' ? 'AUTHORIZING...' : syncStatus === 'fetching' ? 'FETCHING...' : 'SYNC HEALTH CONNECT'}
                      </button>
                      <button 
                        onClick={handleInitializeSimulation}
                        disabled={syncStatus !== 'idle'}
                        className="px-10 py-5 bg-white/5 border border-white/10 text-slate-400 rounded-full font-black uppercase text-[11px] tracking-[0.4em] hover:text-white transition-all w-full sm:w-auto flex items-center justify-center gap-3"
                      >
                        {syncStatus === 'analyzing' ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />}
                        {syncStatus === 'analyzing' ? 'CALIBRATING...' : 'INITIALIZE SIMULATION'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            )}
            {activeView === 'calendar' && <Trends history={history} lang={lang} />}
            {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} onNavigate={(v: any) => { try { window.location.hash = `#/${v}` } catch(e) {} }} />}
            {activeView === 'profile' && <UserProfile lang={lang} />}
            {activeView === 'about' && <AboutView lang={lang} onBack={() => { try { window.location.hash = '#/' } catch(e) {} }} />}
            {activeView === 'settings' && (
              <Settings 
                lang={lang} 
                onLanguageChange={setLang} 
                onLogout={handleLogout} 
                onNavigate={(v: any) => { try { window.location.hash = `#/${v}` } catch(e) {} }}
                threeDEnabled={threeDEnabled} 
                onThreeDChange={setThreeDEnabled}
              />
            )}
          </m.div>
        </AnimatePresence>

        <div className="fixed bottom-12 left-0 right-0 z-[60] px-6 flex justify-center pointer-events-none">
          <nav className="bg-slate-950/80 backdrop-blur-3xl border border-white/10 rounded-full p-2 flex gap-1 pointer-events-auto shadow-2xl">
            {[
              { id: 'dashboard', icon: Moon, label: 'LAB' },
              { id: 'calendar', icon: Zap, label: 'TRND' },
              { id: 'assistant', icon: BrainCircuit, label: 'CORE' },
              { id: 'profile', icon: User, label: 'USER' },
              { id: 'settings', icon: SettingsIcon, label: 'CFG' }
            ].map((nav) => (
              <button key={nav.id} onClick={() => { try { window.location.hash = `#/${nav.id}` } catch(e) {} }} className={`relative flex items-center gap-2 px-5 py-4 rounded-full transition-all ${activeView === nav.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
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
