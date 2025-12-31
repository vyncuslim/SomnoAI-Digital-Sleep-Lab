
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { LayoutGrid, Calendar as CalendarIcon, Bot, User, Loader2, Cloud, PlusCircle, TriangleAlert, ShieldCheck } from 'lucide-react';
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
    setTimeout(() => setErrorToast(null), 12000); // 增加时间让用户看清
  }, []);

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

  /**
   * 严格的同步流程。
   * 不再做“模拟刷新”。
   */
  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    setIsLoading(true);
    setHasAttemptedSync(true);
    try {
      onProgress?.('authorizing');
      // 直接通过 SDK 获取或刷新 Access Token
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
      
      // 这里的逻辑非常显式，不再尝试自动重试
      if (errMsg.includes("PERMISSION_DENIED")) {
        // 403 意味着权限足但未勾选
        setIsLoggedIn(false);
        setHasAttemptedSync(false);
        showToast("【权限拦截】检测到您在登录时未勾选睡眠或心率数据权限。请重新接入，并务必手动勾选复选框。");
      } else if (errMsg.includes("AUTH_EXPIRED")) {
        setIsLoggedIn(false);
        setHasAttemptedSync(false);
        showToast("【会话失效】身份令牌已过期。请重新连接 Google 实验室以获取新令牌。");
      } else if (errMsg.includes("DATA_NOT_FOUND")) {
        setIsLoggedIn(true);
        showToast("【信号缺失】未发现有效睡眠会话。请确保 Google Fit 手机端已有最近记录且已完成云同步。");
      } else {
        showToast("【链路异常】无法建立与 Fit API 的安全连接。请检查网络后重试。");
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // 首次载入尝试静默获取数据
    if (googleFit.hasToken() && !currentRecord && !isLoading && !hasAttemptedSync) {
      handleSyncGoogleFit(false);
    }
  }, [handleSyncGoogleFit, currentRecord, isLoading, hasAttemptedSync]);

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
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-pulse">
          <Loader2 className="animate-spin text-indigo-500" size={64} />
          <div className="space-y-2">
            <p className="text-xl font-black text-white tracking-tighter uppercase italic">实验室终端启动中</p>
            <p className="text-slate-500 text-sm font-medium">正在尝试获取有效令牌并同步信号流...</p>
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
        <div className="flex flex-col items-center justify-center h-[70vh] gap-8 text-center px-4 animate-in fade-in duration-700">
          <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
            <Cloud size={80} className="text-indigo-400 mb-2" />
          </div>
          <div className="max-w-xs space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight italic text-center leading-tight">未检测到同步信号</h2>
            <div className="p-5 bg-slate-900/60 border border-white/5 rounded-3xl text-left space-y-3 shadow-xl">
               <div className="flex items-center gap-2 text-rose-400">
                 <ShieldCheck size={16} />
                 <span className="text-[10px] font-black uppercase tracking-widest">权限注入关键说明</span>
               </div>
               <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                 Google Fit 的敏感数据（睡眠/心率）需要用户在授权弹出框中<span className="text-white font-bold">手动勾选对应的复选框</span>。默认通常不勾选，这会导致 403 错误。
               </p>
            </div>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-indigo-600/30"
            >
              重新连接并补全权限
            </button>
            <button 
              onClick={() => setIsDataEntryOpen(true)}
              className="w-full py-5 bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <PlusCircle size={18} /> 录入感知实验数据
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
      case 'profile': return <Settings onLogout={handleLogout} />;
      default: return <Dashboard data={currentRecord!} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className={`max-w-xl mx-auto px-6 ${(isLoggedIn || isGuest || currentRecord) ? 'pt-12 pb-32' : ''} min-h-screen transition-all duration-500`}>
        {renderView()}
      </main>

      {(isLoggedIn || isGuest || currentRecord) && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto backdrop-blur-3xl bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <button onClick={() => setActiveView('dashboard')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <LayoutGrid size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">实验室</span>
            </button>
            <button onClick={() => setActiveView('calendar')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'calendar' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <CalendarIcon size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">趋势图谱</span>
            </button>
            <button onClick={() => setActiveView('assistant')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'assistant' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <Bot size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">AI 智囊</span>
            </button>
            <button onClick={() => setActiveView('profile')} className={`flex-1 py-3 flex flex-col items-center gap-1 transition-colors ${activeView === 'profile' ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-400'}`}>
               <User size={22} /> <span className="text-[9px] font-black uppercase tracking-widest">设置</span>
            </button>
          </div>
        </nav>
      )}

      {errorToast && (
        <div className="fixed bottom-32 left-6 right-6 z-[100] max-w-md mx-auto px-6 py-5 bg-slate-900/90 border border-rose-500/30 backdrop-blur-xl rounded-2xl shadow-[0_20px_80px_rgba(0,0,0,1)] flex flex-col gap-2 animate-in slide-in-from-bottom-6 duration-400">
          <div className="flex items-center gap-2 text-rose-400">
             <TriangleAlert size={18} />
             <span className="text-[11px] font-black uppercase tracking-[0.2em]">实验室警告</span>
          </div>
          <span className="text-slate-200 text-[11px] font-bold leading-relaxed">{errorToast}</span>
        </div>
      )}

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
