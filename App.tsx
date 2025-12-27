
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { LayoutGrid, Calendar as CalendarIcon, Bot, AlarmClock, User, Loader2, CloudSync, PlusCircle, AlertTriangle } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      handleSyncGoogleFit(false); 
    }
  }, [isLoggedIn]);

  const showToast = (msg: string) => {
    setErrorToast(msg);
    setTimeout(() => setErrorToast(null), 5000);
  };

  const refreshInsight = async (record: SleepRecord) => {
    try {
      const insight = await getSleepInsight(record);
      setCurrentRecord(prev => prev ? ({
        ...prev,
        aiInsights: [insight, ...prev.aiInsights.filter(i => !i.includes('分析中')).slice(0, 2)]
      }) : null);
    } catch (e) {
      console.error("AI Insight Refresh Failed", e);
    }
  };

  const handleSaveData = (record: SleepRecord) => {
    setCurrentRecord(record);
    setHistory(prev => [record, ...prev]);
    setIsDataEntryOpen(false);
    setActiveView('dashboard');
    refreshInsight(record);
  };

  const handleSyncGoogleFit = async (forcePrompt = true) => {
    const shouldPrompt = forcePrompt || !googleFit.hasToken();
    
    setIsLoading(true);
    try {
      await googleFit.authorize(shouldPrompt);
      const fitData = await googleFit.fetchSleepData();
      
      const updatedRecord: SleepRecord = {
        id: `fit-${Date.now()}`,
        date: new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }),
        score: 0,
        totalDuration: 0,
        deepRatio: 0,
        remRatio: 0,
        efficiency: 0,
        stages: [],
        heartRate: { resting: 0, average: 0, min: 0, max: 0, history: [] },
        aiInsights: ["正在从实验室终端提取生理信号..."],
        ...fitData,
      } as SleepRecord;
      
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev.filter(h => !h.id.startsWith('fit-'))]);
      await refreshInsight(updatedRecord);
    } catch (err: any) {
      console.warn("Sync Issue:", err.message);
      showToast(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    if (!isLoggedIn) return <Auth onLogin={() => setIsLoggedIn(true)} />;
    
    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-6 text-center animate-pulse">
          <div className="relative">
            <Loader2 className="animate-spin text-indigo-500" size={64} />
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full"></div>
          </div>
          <div className="space-y-2">
            <p className="text-xl font-black text-white tracking-tighter uppercase">信号采集边缘端已启动</p>
            <p className="text-slate-500 text-sm font-medium">正在建立加密隧道连接 Google Fit 实验室...</p>
          </div>
        </div>
      );
    }

    if (!currentRecord && activeView === 'dashboard') {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-8 text-center px-4 animate-in fade-in duration-700">
          <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-[3rem] shadow-2xl shadow-indigo-500/10">
            <CloudSync size={80} className="text-indigo-400 mb-2" />
          </div>
          <div className="max-w-xs space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tight">等待信号接入</h2>
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-left space-y-2">
               <div className="flex items-center gap-2 text-amber-400">
                 <AlertTriangle size={14} />
                 <span className="text-[10px] font-black uppercase tracking-widest">排障清单</span>
               </div>
               <ul className="text-[10px] text-slate-400 list-disc list-inside space-y-1">
                 <li>授权时是否勾选了<span className="text-slate-200">全部复选框</span>？</li>
                 <li>手机 Google Fit 是否有<span className="text-slate-200">近 7 天</span>睡眠记录？</li>
                 <li>手机是否开启了<span className="text-slate-200">同步</span>功能？</li>
               </ul>
            </div>
          </div>
          <div className="flex flex-col w-full max-w-xs gap-3">
            <button 
              onClick={() => handleSyncGoogleFit(true)}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-2xl shadow-indigo-600/30"
            >
              重新连接并核对权限
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
          onAddData={() => setIsDataEntryOpen(true)} 
          onSyncFit={() => handleSyncGoogleFit(false)} 
        />
      );
      case 'calendar': return <Trends history={history} />;
      case 'assistant': return <AIAssistant />;
      case 'alarm': return <div className="flex items-center justify-center h-[70vh] text-slate-500 font-bold text-lg uppercase tracking-widest italic opacity-50">Experimental waking system offline</div>;
      case 'profile': return <Settings />;
      default: return <Dashboard data={currentRecord!} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType; icon: any; label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-3 px-1 rounded-2xl ${
        activeView === view ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={22} strokeWidth={activeView === view ? 2.5 : 2} />
      <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className={`max-w-xl mx-auto px-6 ${isLoggedIn ? 'pt-12 pb-32' : ''} min-h-screen transition-all duration-500`}>
        {renderView()}
      </main>

      {isLoggedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto backdrop-blur-3xl bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <NavItem view="dashboard" icon={LayoutGrid} label="实验室" />
            <NavItem view="calendar" icon={CalendarIcon} label="分析" />
            <NavItem view="assistant" icon={Bot} label="SOMNO" />
            <NavItem view="alarm" icon={AlarmClock} label="唤醒" />
            <NavItem view="profile" icon={User} label="系统" />
          </div>
        </nav>
      )}

      {/* Error Toast */}
      {errorToast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 bg-slate-900 border border-indigo-500/30 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col gap-1 animate-in slide-in-from-bottom-4 duration-300 max-w-[80vw]">
          <div className="flex items-center gap-2 text-indigo-400">
             <AlertTriangle size={16} />
             <span className="text-xs font-black uppercase tracking-widest">同步反馈</span>
          </div>
          <span className="text-slate-300 text-[10px] font-medium leading-relaxed">{errorToast}</span>
        </div>
      )}

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
