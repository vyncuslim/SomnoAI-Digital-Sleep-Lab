import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { LegalView } from './components/LegalView.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { LayoutGrid, Calendar as CalendarIcon, Bot, User, Loader2, Cloud, PlusCircle, TriangleAlert, ShieldCheck, CheckCircle2, Info } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState('dashboard' as ViewType);
  const [prevView, setPrevView] = useState('dashboard' as ViewType);
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAttemptedSync, setHasAttemptedSync] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Robust URL routing for SPA support and Google verification
  useEffect(() => {
    const handleRouting = () => {
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');

      if (path === '/privacy' || path === '/privacy.html' || pageParam === 'privacy') {
        setActiveView((current) => {
          if (current !== 'privacy') {
            setPrevView(current === 'terms' ? 'dashboard' : current);
            return 'privacy';
          }
          return current;
        });
      } else if (path === '/terms' || path === '/terms.html' || pageParam === 'terms') {
        setActiveView((current) => {
          if (current !== 'terms') {
            setPrevView(current === 'privacy' ? 'dashboard' : current);
            return 'terms';
          }
          return current;
        });
      } else if (path === '/' || path === '/index.html' || path === '') {
        setActiveView((current) => {
          if (current === 'privacy' || current === 'terms') {
            return 'dashboard';
          }
          return current;
        });
      }
    };

    handleRouting();
    window.addEventListener('popstate', handleRouting);
    return () => window.removeEventListener('popstate', handleRouting);
  }, []);

  const showToast = useCallback((msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 12000); 
  }, []);

  const navigateTo = (view: ViewType) => {
    if (view === activeView) return;
    
    setPrevView(activeView);
    setActiveView(view);
    
    // Use pushState to update the URL without full page reload
    const path = view === 'privacy' ? '/privacy' : view === 'terms' ? '/terms' : '/';
    window.history.pushState({}, '', path);
  };

  const handleBackFromLegal = () => {
    const target = (prevView === 'privacy' || prevView === 'terms') ? 'dashboard' : prevView;
    setActiveView(target);
    window.history.pushState({}, '', '/');
  };

  const refreshInsight = async (record: SleepRecord) => {
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
        score: 0,
        totalDuration: 0,
        deepRatio: 0,
        remRatio: 0,
        efficiency: 0,
        calories: 0,
        stages: [],
        heartRate: { resting: 0, average: 0, min: 0, max: 0, history: [] },
        aiInsights: ["正在实验室终端解码生理特征流..."],
        ...Object.fromEntries(Object.entries(fitData).filter(([_, v]) => v !== undefined))
      } as SleepRecord;
      
      setCurrentRecord(updatedRecord);
      setHistory(prev => {
        const newHist = [updatedRecord, ...prev.filter(h => !h.id.startsWith('fit-'))];
        return newHist.slice(0, 30);
      });

      onProgress?.('analyzing');
      await refreshInsight(updatedRecord);
      onProgress?.('success');
    } catch (err: any) {
      console.error("Lab Sync Error:", err);
      onProgress?.('error');
      const errMsg = err.message || "";
      if (errMsg.includes("PERMISSION_DENIED")) {
        setIsLoggedIn(false);
        setHasAttemptedSync(false);
        showToast("【关键权限拦截】您可能未点击“查看已拥有的服务”并勾选睡眠/心率框。即使已登录，不勾选也会失败。");
      } else if (errMsg.includes("AUTH_EXPIRED")) {
        setIsLoggedIn(false);
        setHasAttemptedSync(false);
        showToast("【令牌失效】连接已超时。请重新接入实验室隧道。");
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        setIsLoggedIn(true);
        showToast("【信号空置】权限正常，但 Fit 云端没有任何最近记录。请确保 Fit App 此时已有数据。");
      } else {
        showToast(errMsg || "【链路故障】无法与 Fit 通信。请检查网络。");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    const isLegalView = activeView === 'privacy' || activeView === 'terms';
    if (googleFit.hasToken() && !currentRecord && !isLoading && !hasAttemptedSync && !isLegalView) {
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
    if (activeView === 'privacy' || activeView === 'terms') {
      return <LegalView type={activeView} onBack={handleBackFromLegal} />;
    }

    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-pulse">
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
          onLegalPage={(page) => navigateTo(page)}
        />
      );
    }
    
    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-8 text-center px-4 animate-in fade-in duration-700">
          <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
            <Cloud size={80} className="text-indigo-400 mb-2" />
          </div>
          <div className="max-w-xs space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight italic leading-tight text-center">信号同步受限</h2>
            <div className="p-6 bg-slate-900/60 border border-white/5 rounded-3xl text-left space-y-4 shadow-xl">
               <div className="flex items-center gap-2 text-rose-400">
                 <ShieldCheck size={18} />
                 <span className="text-[11px] font-black uppercase tracking-widest">如何修复权限 (必看)</span>
               </div>
               <div className="space-y-3">
                  <div className="flex gap-2">
                    <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      在弹出的授权页，点击中间的 <span className="text-white italic">“查看...拥有部分访问权限的服务”</span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      务必 <span className="text-rose-400 font-black italic underline">手动勾选</span> 每一项「查看睡眠数据」和「心率数据」
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle2 size={12} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-300 leading-relaxed font-medium">
                      滑动到最底部点击 <span className="text-white font-bold italic">继续 (Continue)</span>
                    </p>
                  </div>
               </div>
               <div className="pt-2 border-t border-white/5 flex gap-2">
                 <Info size={14} className="text-slate-500 shrink-0 mt-0.5" />
                 <p className="text-[10px] text-slate-500 italic leading-snug">
                   Google 默认不勾选任何健康复选框。如果您只是“继续”而未勾选，系统将返回 403 权限错误。
                 </p>
               </div>
            </div>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-indigo-600/30"
            >
              重新连接并补全勾选
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> 手动录入实验数据
            </button>
          </div>
        </div>
      );
    }

    switch (activeView) {
      case 'dashboard': return (
        <Dashboard 
          data={currentRecord!} 
          onSyncFit={(onProgress) => handleSyncGoogleFit(false, onProgress)} 
        />
      );
      case 'calendar': return <Trends history={history} />;
      case 'assistant': return <AIAssistant />;
      case 'profile': return <Settings onLogout={handleLogout} onLegalPage={(p) => navigateTo(p)} />;
      default: return <Dashboard data={currentRecord!} />;
    }
  };

  const showNav = (isLoggedIn || isGuest || currentRecord) && !['privacy', 'terms'].includes(activeView);

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className={`max-w-xl mx-auto px-6 ${(isLoggedIn || isGuest || currentRecord) ? 'pt-12 pb-32' : ''} min-h-screen transition-all duration-500`}>
        {renderView()}
      </main>

      {showNav && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto backdrop-blur-3xl bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <button onClick={() => navigateTo('dashboard')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <LayoutGrid size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">实验室</span>
            </button>
            <button onClick={() => navigateTo('calendar')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <CalendarIcon size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">趋势图谱</span>
            </button>
            <button onClick={() => navigateTo('assistant')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'assistant' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <Bot size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">AI 智囊</span>
            </button>
            <button onClick={() => navigateTo('profile')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <User size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">设置</span>
            </button>
          </div>
        </nav>
      )}

      {errorToast && (
        <div className="fixed bottom-32 left-6 right-6 z-[100] max-w-md mx-auto px-6 py-5 bg-slate-900/95 border border-rose-500/30 backdrop-blur-xl rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,1)] flex flex-col gap-2 animate-in slide-in-from-bottom-6 duration-400">
          <div className="flex items-center gap-2 text-rose-400">
             <TriangleAlert size={18} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">实验室同步核心反馈</span>
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