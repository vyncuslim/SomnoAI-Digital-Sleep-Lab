
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { MOCK_RECORD } from './constants.tsx';
import { LayoutGrid, Calendar as CalendarIcon, Bot, AlarmClock, User, Loader2 } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      handleSyncGoogleFit();
    }
  }, [isLoggedIn]);

  const refreshInsight = async (record: SleepRecord) => {
    try {
      const insight = await getSleepInsight(record);
      setCurrentRecord(prev => prev ? ({
        ...prev,
        aiInsights: [insight, ...prev.aiInsights.slice(0, 2)]
      }) : null);
    } catch (e) {
      console.error("Failed to get AI insight", e);
    }
  };

  const handleSaveData = (record: SleepRecord) => {
    setCurrentRecord(record);
    setIsDataEntryOpen(false);
    refreshInsight(record);
  };

  const handleSyncGoogleFit = async () => {
    setIsLoading(true);
    try {
      // 尝试静默授权并抓取数据
      await googleFit.authorize(false);
      const fitData = await googleFit.fetchSleepData();
      
      const updatedRecord: SleepRecord = {
        ...(currentRecord || MOCK_RECORD),
        ...fitData,
        id: `fit-${Date.now()}`,
      };
      
      setCurrentRecord(updatedRecord);
      refreshInsight(updatedRecord);
    } catch (err: any) {
      console.warn("Sync Issue, using fallback:", err.message);
      // 如果从未有过数据，则加载 mock 数据作为演示
      if (!currentRecord) {
        setCurrentRecord(MOCK_RECORD);
        refreshInsight(MOCK_RECORD);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderView = () => {
    if (!isLoggedIn) return <Auth onLogin={() => setIsLoggedIn(true)} />;
    
    // 全屏加载状态
    if (isLoading && !currentRecord) {
      return (
        <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
          <p className="text-slate-400 font-bold animate-pulse">正在从 Google Fit 提取真实数据...</p>
        </div>
      );
    }

    if (!currentRecord) return null;

    switch (activeView) {
      case 'dashboard': return (
        <Dashboard 
          data={currentRecord} 
          onAddData={() => setIsDataEntryOpen(true)} 
          onSyncFit={handleSyncGoogleFit}
        />
      );
      case 'calendar': return <Trends history={[currentRecord]} />;
      case 'assistant': return <AIAssistant />;
      case 'alarm': return <div className="flex items-center justify-center h-[70vh] text-slate-500 font-bold text-lg">闹钟功能开发中</div>;
      case 'profile': return <Settings />;
      default: return <Dashboard data={currentRecord} />;
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
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-900/20 blur-[150px] rounded-full animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/15 blur-[120px] rounded-full animate-pulse duration-[10000ms]"></div>
      </div>

      <main className={`max-w-xl mx-auto px-6 ${isLoggedIn ? 'pt-12 pb-32' : ''} min-h-screen transition-all duration-500`}>
        {renderView()}
      </main>

      {isLoggedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-6 pb-8 pt-4 pointer-events-none">
          <div className="max-w-md mx-auto backdrop-blur-3xl bg-slate-900/80 border border-white/5 rounded-[2.5rem] p-2 flex justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.5)] pointer-events-auto">
            <NavItem view="dashboard" icon={LayoutGrid} label="首页" />
            <NavItem view="calendar" icon={CalendarIcon} label="日历" />
            <NavItem view="assistant" icon={Bot} label="AI助手" />
            <NavItem view="alarm" icon={AlarmClock} label="闹钟" />
            <NavItem view="profile" icon={User} label="我的" />
          </div>
        </nav>
      )}

      {isDataEntryOpen && currentRecord && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
