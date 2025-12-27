
import React, { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { ViewType, SleepRecord } from './types.ts';
import { MOCK_RECORD } from './constants.tsx';
import { LayoutGrid, Calendar as CalendarIcon, Bot, AlarmClock, User } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord>(MOCK_RECORD);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);

  // 登录后逻辑：如果已连接 Google，自动同步一次数据
  useEffect(() => {
    if (isLoggedIn) {
      if (googleFit.hasToken()) {
        console.log("Detecting Google Fit token, auto-syncing...");
        handleSyncGoogleFit();
      } else {
        refreshInsight(currentRecord);
      }
    }
  }, [isLoggedIn]);

  const refreshInsight = async (record: SleepRecord) => {
    try {
      const insight = await getSleepInsight(record);
      setCurrentRecord(prev => ({
        ...prev,
        aiInsights: [insight, ...prev.aiInsights.slice(0, 2)]
      }));
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
    try {
      // 确保有 Token (如果是静默调用且没有 Token，authorize(false) 会尝试获取)
      await googleFit.authorize(false);
      const fitData = await googleFit.fetchSleepData();
      
      const updatedRecord = {
        ...currentRecord,
        ...fitData,
        // 如果有新的阶段数据则更新，否则保持默认
        aiInsights: fitData.aiInsights || currentRecord.aiInsights
      };
      
      setCurrentRecord(updatedRecord as SleepRecord);
      refreshInsight(updatedRecord as SleepRecord);
    } catch (err: any) {
      console.warn("Google Fit Sync Issue:", err.message);
      // 如果是明确的授权错误，再弹出提示
      if (err.message.includes("尚未授权") || err.message.includes("过期")) {
        alert("Google 授权已失效，请尝试重新连接。");
      }
    }
  };

  const renderView = () => {
    if (!isLoggedIn) return <Auth onLogin={() => setIsLoggedIn(true)} />;

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

      {isDataEntryOpen && (
        <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
};

export default App;
