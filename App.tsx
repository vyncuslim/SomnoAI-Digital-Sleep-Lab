
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { User, Loader2, PlusCircle, Activity, Zap } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path.includes('profile') || path.includes('setting')) setActiveView('profile');
      else if (path.includes('assistant')) setActiveView('assistant');
      else if (path.includes('trends') || path.includes('calendar')) setActiveView('calendar');
      else setActiveView('dashboard');
    };
    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    window.history.pushState({}, '', `/${view}`);
  };

  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    try {
      onProgress?.('authorizing');
      await googleFit.authorize(forcePrompt);
      setIsLoggedIn(true);
      setIsGuest(false);
      onProgress?.('fetching');
      const fitData = await googleFit.fetchSleepData();
      const updatedRecord = {
        id: `fit-${Date.now()}`,
        aiInsights: ["Lab syncing biometric streams..."],
        ...fitData
      } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      onProgress?.('analyzing');
      const insight = await getSleepInsight(updatedRecord);
      setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: [insight] }) : prev);
      onProgress?.('success');
    } catch (err: any) {
      onProgress?.('error');
      setErrorToast(err.message || "Gateway Exception");
      setTimeout(() => setErrorToast(null), 5000);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const renderView = () => {
    if (isLoading && !currentRecord) return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-10 text-center">
        <Loader2 size={48} className="animate-spin text-indigo-500" />
        <p className="text-slate-500 text-[9px] uppercase tracking-widest">Negotiating Bio-Auth Protocol...</p>
      </div>
    );
    if (!isLoggedIn && !isGuest) return <Auth onLogin={() => handleSyncGoogleFit()} onGuest={() => setIsGuest(true)} />;
    if (!currentRecord && activeView === 'dashboard') return (
      <div className="flex flex-col items-center justify-center h-[75vh] gap-10 text-center">
        <Logo size={96} className="opacity-40" animated />
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter">Biometric Offline</h2>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest">Sync cloud data or inject manual signals</p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-4">
          <button onClick={() => handleSyncGoogleFit(true)} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">Sync Google Fit</button>
          <button onClick={() => setIsDataEntryOpen(true)} className="w-full py-6 bg-white/5 border border-white/10 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3">
            <PlusCircle size={16} /> Manual Injection
          </button>
        </div>
      </div>
    );
    return (
      <AnimatePresence mode="wait">
        <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {activeView === 'dashboard' && <Dashboard data={currentRecord!} onSyncFit={handleSyncGoogleFit} />}
          {activeView === 'calendar' && <Trends history={history} />}
          {activeView === 'assistant' && <AIAssistant />}
          {activeView === 'profile' && <Settings onLogout={() => { googleFit.logout(); setIsLoggedIn(false); setCurrentRecord(null); }} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  const showNav = isLoggedIn || isGuest || currentRecord;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Plus_Jakarta_Sans']">
      <main className={`max-w-xl mx-auto px-6 ${showNav ? 'pt-20 pb-40' : 'pt-8'} min-h-screen`}>
        {renderView()}
      </main>
      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-10">
          <div className="max-w-md mx-auto glass-morphism rounded-[3rem] p-2 flex justify-between">
            {[
              { id: 'dashboard', icon: Logo, label: 'Lab' },
              { id: 'calendar', icon: Activity, label: 'Trends' },
              { id: 'assistant', icon: Zap, label: 'Insights' },
              { id: 'profile', icon: User, label: 'Settings' }
            ].map((nav) => {
              const IconComponent = nav.icon;
              return (
                <button 
                  key={nav.id} 
                  onClick={() => handleViewChange(nav.id as ViewType)} 
                  className={`flex-1 py-4 flex flex-col items-center gap-2 transition-all ${activeView === nav.id ? 'text-indigo-400' : 'text-slate-500'}`}
                >
                  <IconComponent 
                    size={22} 
                    {...(nav.id === 'dashboard' ? { animated: activeView === nav.id } : {})} 
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
      {isDataEntryOpen && <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={(r) => { setCurrentRecord(r); setHistory(prev => [r, ...prev]); setIsDataEntryOpen(false); }} />}
      
      {errorToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl animate-in slide-in-from-top-4">
          {errorToast}
        </div>
      )}
    </div>
  );
};
export default App;
