
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { 
  User, Loader2, Cloud, PlusCircle, TriangleAlert, 
  Activity, Zap, Compass 
} from 'lucide-react';
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
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // 路径解析与状态同步
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      // 支持 /settings, /setting, /profile 等多种进入设置页面的路径
      if (path === '/settings' || path === '/setting' || path === '/profile') {
        setActiveView('profile');
      } else if (path === '/aiassistant' || path === '/alassistant' || path === '/assistant' || path === '/zap') {
        setActiveView('assistant');
      } else if (path === '/trends' || path === '/calendar') {
        setActiveView('calendar');
      } else if (path === '/' || path === '/dashboard') {
        setActiveView('dashboard');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    const pathMap: Record<ViewType, string> = {
      dashboard: '/dashboard',
      calendar: '/Trends',
      assistant: '/AIAssistant',
      profile: '/Settings',
      alarm: '/Alarm'
    };
    window.history.pushState({}, '', pathMap[view]);
  };

  const showToast = useCallback((msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 8000); 
  }, []);

  const refreshInsight = async (record: SleepRecord) => {
    if (!record) return;
    try {
      const insight = await getSleepInsight(record);
      setCurrentRecord(prev => prev && prev.id === record.id ? ({
        ...prev,
        aiInsights: [insight, ...prev.aiInsights.filter(i => !i.includes('分析中')).slice(0, 2)]
      }) : prev);
    } catch (e) {
      console.error("AI Insight Refresh Failed", e);
    }
  };

  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setHasAttemptedSync(true);
    try {
      onProgress?.('authorizing');
      await googleFit.authorize(forcePrompt);
      setIsLoggedIn(true);
      setIsGuest(false);
      onProgress?.('fetching');
      const fitData = await googleFit.fetchSleepData();
      const updatedRecord: SleepRecord = {
        id: `fit-${Date.now()}`,
        date: new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        score: 70, totalDuration: 480, deepRatio: 20, remRatio: 20, efficiency: 85, calories: 2000,
        stages: [], heartRate: { resting: 65, average: 70, min: 60, max: 100, history: [] },
        aiInsights: ["实验室正在同步生物特征流..."],
        ...fitData
      } as SleepRecord;
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev.filter(h => !h.id.startsWith('fit-'))].slice(0, 30));
      onProgress?.('analyzing');
      await refreshInsight(updatedRecord);
      onProgress?.('success');
    } catch (err: any) {
      onProgress?.('error');
      const errMsg = err.message || "";
      if (errMsg.includes("PERMISSION_DENIED")) {
        showToast("【关键权限缺失】请勾选睡眠和心率访问权限。");
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        showToast("【信号未找到】Google Fit 中尚无最近的有效睡眠记录。");
      } else {
        showToast("【网关异常】暂时无法建立安全连接，请稍后再试。");
      }
      if (!currentRecord) setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, [showToast, currentRecord]);

  useEffect(() => {
    if (googleFit.hasToken() && !currentRecord && !isLoading && !hasAttemptedSync && activeView === 'dashboard') {
      handleSyncGoogleFit(false);
    }
  }, [handleSyncGoogleFit, currentRecord, isLoading, hasAttemptedSync, activeView]);

  const handleSaveData = (record: SleepRecord) => {
    setCurrentRecord(record);
    setHistory(prev => [record, ...prev]);
    setIsDataEntryOpen(false);
    handleViewChange('dashboard');
    setIsLoggedIn(true);
    setIsGuest(false);
    setHasAttemptedSync(true);
    refreshInsight(record);
  };

  const handleLogout = () => {
    googleFit.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setHasAttemptedSync(false);
    setCurrentRecord(null);
    setHistory([]);
    handleViewChange('dashboard');
  };

  const renderView = () => {
    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-10 text-center px-8">
          <div className="relative">
             <div className="w-24 h-24 border-4 border-indigo-500/10 border-t-indigo-500 rounded-full animate-spin"></div>
             <Logo size={40} className="absolute inset-0 m-auto" animated />
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">实验室计算中</h2>
            <div className="flex flex-col items-center gap-2">
              <div className="h-1 w-32 bg-slate-800 rounded-full overflow-hidden">
                <motion.div animate={{ x: [-128, 128] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} className="w-1/2 h-full bg-indigo-500 shadow-[0_0_10px_#6366f1]" />
              </div>
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Negotiating Bio-Auth Protocol...</p>
            </div>
          </div>
        </div>
      );
    }

    if (!isLoggedIn && !isGuest && !currentRecord) {
      return <Auth onLogin={() => handleSyncGoogleFit(false)} onGuest={() => setIsGuest(true)} />;
    }
    
    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[75vh] gap-10 text-center px-6">
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative p-12 bg-indigo-600/5 border border-indigo-500/10 rounded-[4rem]"
          >
            <Logo size={96} className="opacity-40" animated />
            <div className="absolute inset-0 bg-indigo-500/10 blur-[80px] rounded-full animate-pulse"></div>
          </motion.div>
          <div className="space-y-4">
            <h2 className="text-3xl font-black text-white italic tracking-tighter text-glow-indigo uppercase">生理信号离线</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-[0.3em] max-w-xs mx-auto">
              请同步 Google Fit 云端数据<br/>或通过实验室终端注入模拟信号
            </p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-4">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] transition-all active:scale-[0.98]"
            >
              同步 Google Fit
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-6 bg-white/5 border border-white/10 text-slate-400 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <PlusCircle size={16} /> 手动参数注入
            </button>
          </div>
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {activeView === 'dashboard' && <Dashboard data={currentRecord!} onSyncFit={(onProgress) => handleSyncGoogleFit(false, onProgress)} />}
          {activeView === 'calendar' && <Trends history={history} />}
          {activeView === 'assistant' && <AIAssistant />}
          {activeView === 'profile' && <Settings onLogout={handleLogout} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  const showNav = (isLoggedIn || isGuest || currentRecord);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-indigo-500/30 font-['Plus_Jakarta_Sans']">
      <main className={`max-w-xl mx-auto px-6 ${showNav ? 'pt-20 pb-40' : 'pt-8'} min-h-screen`}>
        {renderView()}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-10 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto glass-morphism border border-white/10 rounded-[3rem] p-2 flex justify-between shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] pointer-events-auto">
            {[
              { id: 'dashboard', icon: Logo, label: '实验室' },
              { id: 'calendar', icon: Activity, label: '趋势' },
              { id: 'assistant', icon: Zap, label: '洞察' },
              { id: 'profile', icon: User, label: '设置' }
            ].map((nav) => (
              <button 
                key={nav.id}
                onClick={() => handleViewChange(nav.id as ViewType)} 
                className={`flex-1 py-4 flex flex-col items-center gap-2 transition-all relative ${activeView === nav.id ? 'text-indigo-400' : 'text-slate-500'}`}
              >
                {activeView === nav.id && (
                  <motion.div 
                    layoutId="navGlow"
                    className="absolute -top-1 w-12 h-1 bg-indigo-500 rounded-full shadow-[0_0_15px_#6366f1]"
                  />
                )}
                {nav.id === 'dashboard' ? (
                  <nav.icon size={22} className={activeView === nav.id ? 'scale-110 grayscale-0' : 'grayscale opacity-70'} />
                ) : (
                  // @ts-ignore
                  <nav.icon size={22} className={activeView === nav.id ? 'scale-110' : ''} />
                )}
                <span className="text-[9px] font-black uppercase tracking-[0.2em]">{nav.label}</span>
              </button>
            ))}
          </div>
        </nav>
      )}

      {errorToast && (
        <div className="fixed top-10 left-6 right-6 z-[100] max-w-md mx-auto px-8 py-5 glass-morphism border border-rose-500/30 rounded-3xl shadow-[0_40px_80px_-20px_rgba(0,0,0,1)] flex items-center gap-5 animate-in slide-in-from-top-6">
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
            <TriangleAlert size={20} />
          </div>
          <span className="text-slate-100 text-[11px] font-black uppercase tracking-widest leading-relaxed">{errorToast}</span>
        </div>
      )}

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
