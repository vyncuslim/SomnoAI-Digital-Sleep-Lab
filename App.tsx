
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { LayoutGrid, Calendar as CalendarIcon, Bot, User, Loader2, Cloud, PlusCircle, TriangleAlert, Info } from 'lucide-react';
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
        showToast("【信号未找到】Google Fit 中尚无最近的有效睡眠记录。请确认您的穿戴设备已同步至 Fit。");
      } else {
        showToast("【链路故障】无法连接至实验室服务器，请检查网络后重试。");
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
    window.history.pushState({}, '', '/');
  };

  const renderView = () => {
    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-in fade-in duration-700">
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
        <div className="flex flex-col items-center justify-center h-[75vh] gap-8 text-center px-4 animate-in zoom-in-95 duration-500">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] rounded-full animate-pulse"></div>
            <div className="relative p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem]">
              <Cloud size={80} className="text-indigo-400" />
            </div>
          </div>
          <div className="max-w-xs space-y-4 text-center">
            <h2 className="text-2xl font-black text-white italic tracking-tight">生理信号同步受限</h2>
            <div className="p-4 bg-slate-900/60 rounded-2xl border border-white/5 space-y-3 text-left">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-400">
                <Info size={14} /> 排查建议
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                1. 确认 <span className="text-white italic">Google Fit</span> 应用内已有最近的睡眠图表。<br/>
                2. 检查穿戴设备（如华为、小米、OPPO）是否已通过官方同步插件连接至 Fit。<br/>
                3. 点击下方按钮尝试强制刷新授权。
              </p>
            </div>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl transition-all active:scale-[0.98]"
            >
              强制重新连接网关
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 rounded-3xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-all"
            >
              <PlusCircle size={18} /> 手动注入实验数据
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
            <button onClick={() => setActiveView('dashboard')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <LayoutGrid size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">实验室</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <CalendarIcon size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">趋势图谱</span>
            </button>
            <button onClick={() => setActiveView('assistant')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'assistant' ? 'text-indigo-400' : 'text-slate-500'}`}>
               <Bot size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">AI 智囊</span>
            </button>
            <button onClick={() => setActiveView('profile')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500'}`}>
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
