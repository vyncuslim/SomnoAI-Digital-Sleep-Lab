import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { LayoutGrid, Calendar as CalendarIcon, Bot, User, Loader2, Cloud, PlusCircle, TriangleAlert } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState('dashboard' as ViewType);
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

  const navigateTo = (view: ViewType) => {
    setActiveView(view);
    
    try {
      const isRestricted = 
        !window.location.origin || 
        window.location.origin === 'null' ||
        window.location.protocol === 'blob:' || 
        window.location.hostname.includes('usercontent.goog') || 
        window.location.hostname.includes('ai.studio');

      // 仅在主功能视图切换时保持 URL 简洁。法律页面已由 Vercel 服务端静态分发。
      if (!isRestricted && typeof window.history.pushState === 'function') {
        window.history.pushState({ view }, '', '/');
      }
    } catch (err) {
      console.warn("History API restricted");
    }
  };

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
        score: 70,
        totalDuration: 480,
        deepRatio: 20,
        remRatio: 20,
        efficiency: 85,
        calories: 2000,
        stages: [],
        heartRate: { resting: 65, average: 70, min: 60, max: 100, history: [] },
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
        setIsLoggedIn(false);
        showToast("【关键权限缺失】请确保在 Google 授权页面勾选了睡眠和心率访问权限。");
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        showToast("【信号未找到】Google Fit 中尚无最近的有效睡眠记录。");
      } else {
        showToast("【链路故障】无法连接至实验室服务器，请稍后重试。");
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
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center">
          <Loader2 className="animate-spin text-indigo-500" size={64} />
          <div className="space-y-2">
            <p className="text-xl font-black text-white tracking-tighter uppercase italic">实验室终端启动中</p>
            <p className="text-slate-500 text-sm font-medium">正在建立加密隧道同步特征流...</p>
          </div>
        </div>
      );
    }

    if (!isLoggedIn && !isGuest && !currentRecord) {
      return (
        <Auth 
          onLogin={() => handleSyncGoogleFit(false)} 
          onGuest={() => setIsGuest(true)}
        />
      );
    }
    
    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-8 text-center px-4">
          <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem]">
            <Cloud size={80} className="text-indigo-400" />
          </div>
          <div className="max-w-xs space-y-4 text-center">
            <h2 className="text-2xl font-black text-white italic">信号同步受限</h2>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Google Fit 尚未开放生理特征流。请确认已在授权页勾选睡眠权限，或尝试手动注入实验数据。
            </p>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl"
            >
              重新连接网关
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> 手动录入数据
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
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <main className={`max-w-xl mx-auto px-6 ${showNav ? 'pt-12 pb-32' : 'pt-8'} min-h-screen`}>
        {renderView()}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto backdrop-blur-3xl bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-2xl pointer-events-auto">
            <button onClick={() => navigateTo('dashboard')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <LayoutGrid size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">实验室</span>
            </button>
            <button onClick={() => navigateTo('calendar')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <CalendarIcon size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">趋势图谱</span>
            </button>
            <button onClick={() => navigateTo('assistant')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'assistant' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <Bot size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">AI 智囊</span>
            </button>
            <button onClick={() => navigateTo('profile')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <User size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">设置</span>
            </button>
          </div>
        </nav>
      )}

      {errorToast && (
        <div className="fixed bottom-32 left-6 right-6 z-[100] max-w-md mx-auto px-6 py-5 bg-slate-900/95 border border-rose-500/30 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col gap-2 animate-in slide-in-from-bottom-6">
          <div className="flex items-center gap-2 text-rose-400">
             <TriangleAlert size={18} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">同步反馈</span>
          </div>
          <span className="text-slate-100 text-[11px] font-bold leading-relaxed">{errorToast}</span>
        </div>
      )}

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;