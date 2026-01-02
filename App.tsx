
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
// Add Zap to the imports
import { LayoutGrid, Calendar as CalendarIcon, Bot, User, Loader2, Cloud, PlusCircle, TriangleAlert, Info, Microscope, Activity, Zap } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

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
        aiInsights: ["实验室正在重构生理特征流..."],
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
        showToast("【关键权限缺失】请确保已勾选睡眠和心率访问权限。");
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        showToast("【信号未找到】Google Fit 中尚无最近的有效睡眠记录。");
      } else {
        showToast("【链路故障】无法连接至实验室服务器。");
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
    setActiveView('dashboard');
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
    setActiveView('dashboard');
  };

  const renderView = () => {
    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-in fade-in duration-700">
          <Loader2 className="animate-spin text-indigo-500" size={64} />
          <div className="space-y-2">
            <p className="text-xl font-black text-white tracking-tighter uppercase italic">实验室终端启动中</p>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Encrypting Session Handshake...</p>
          </div>
        </div>
      );
    }

    if (!isLoggedIn && !isGuest && !currentRecord) {
      return (
        <Auth onLogin={() => handleSyncGoogleFit(false)} onGuest={() => setIsGuest(true)} />
      );
    }
    
    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[75vh] gap-8 text-center px-4 animate-in zoom-in-95">
          <div className="relative p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem]">
            <Cloud size={80} className="text-indigo-400 opacity-40" />
            <div className="absolute inset-0 bg-indigo-500/10 blur-[60px] rounded-full animate-pulse"></div>
          </div>
          <div className="max-w-xs space-y-4">
            <h2 className="text-2xl font-black text-white italic tracking-tight">生理特征流未就绪</h2>
            <p className="text-[11px] text-slate-500 leading-relaxed font-black uppercase tracking-[0.2em]">
              等待 Google Fit 信号同步<br/>或手动注入体征数据进行推演
            </p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl active:scale-[0.98]"
            >
              重新连接实验室网关
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-5 bg-white/5 border border-white/10 text-slate-400 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-2"
            >
              <PlusCircle size={14} /> 注入实验数据
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': return <Dashboard data={currentRecord!} onSyncFit={(onProgress) => handleSyncGoogleFit(false, onProgress)} />;
      case 'calendar': return <Trends history={history} />;
      case 'assistant': return <AIAssistant />;
      case 'profile': return <Settings onLogout={handleLogout} />;
      default: return <Dashboard data={currentRecord!} />;
    }
  };

  const showNav = (isLoggedIn || isGuest || currentRecord);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-indigo-500/30">
      <main className={`max-w-xl mx-auto px-6 ${showNav ? 'pt-16 pb-32' : 'pt-8'} min-h-screen`}>
        {renderView()}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto glass-morphism border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] pointer-events-auto">
            <button onClick={() => setActiveView('dashboard')} className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <Microscope size={20} className={activeView === 'dashboard' ? 'scale-110' : ''} />
               <span className="text-[8px] font-black uppercase tracking-widest">仪表站</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all ${activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <Activity size={20} className={activeView === 'calendar' ? 'scale-110' : ''} />
               <span className="text-[8px] font-black uppercase tracking-widest">图谱</span>
            </button>
            <button onClick={() => setActiveView('assistant')} className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all ${activeView === 'assistant' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <Zap size={20} className={activeView === 'assistant' ? 'scale-110' : ''} />
               <span className="text-[8px] font-black uppercase tracking-widest">洞察</span>
            </button>
            <button onClick={() => setActiveView('profile')} className={`flex-1 py-3 flex flex-col items-center gap-1.5 transition-all ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <User size={20} className={activeView === 'profile' ? 'scale-110' : ''} />
               <span className="text-[8px] font-black uppercase tracking-widest">核心</span>
            </button>
          </div>
        </nav>
      )}

      {errorToast && (
        <div className="fixed top-8 left-6 right-6 z-[100] max-w-md mx-auto px-6 py-4 glass-morphism border border-rose-500/30 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-top-4">
          <TriangleAlert size={18} className="text-rose-400 shrink-0" />
          <span className="text-slate-200 text-[10px] font-black uppercase tracking-widest leading-relaxed">{errorToast}</span>
        </div>
      )}

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
