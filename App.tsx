
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard';
import { Trends } from './components/Trends';
import { AIAssistant } from './components/AIAssistant';
import { Settings } from './components/Settings';
import { Auth } from './components/Auth';
import { ViewType, SleepRecord } from './types';
import { MOCK_RECORD } from './constants';
import { LayoutGrid, Calendar as CalendarIcon, Bot, AlarmClock, User } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentRecord] = useState<SleepRecord>(MOCK_RECORD);

  const renderView = () => {
    if (!isLoggedIn) return <Auth onLogin={() => setIsLoggedIn(true)} />;

    switch (activeView) {
      case 'dashboard': return <Dashboard data={currentRecord} />;
      case 'calendar': return <Trends history={[currentRecord]} />;
      case 'assistant': return <AIAssistant />;
      case 'alarm': return <div className="flex items-center justify-center h-full text-slate-500">闹钟功能开发中</div>;
      case 'profile': return <Settings />;
      default: return <Dashboard data={currentRecord} />;
    }
  };

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType; icon: any; label: string }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex flex-col items-center justify-center gap-1 transition-all flex-1 py-2 ${
        activeView === view ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon size={24} strokeWidth={activeView === view ? 2.5 : 2} />
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white selection:bg-indigo-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-900/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 blur-[120px] rounded-full"></div>
      </div>

      <main className={`max-w-2xl mx-auto px-6 ${isLoggedIn ? 'pt-12' : ''} min-h-screen`}>
        {renderView()}
      </main>

      {/* Persistent Bottom Nav */}
      {isLoggedIn && (
        <nav className="fixed bottom-0 left-0 right-0 z-40 px-6 pb-8 pt-4">
          <div className="max-w-md mx-auto backdrop-blur-2xl bg-slate-900/80 border border-white/5 rounded-[32px] p-2 flex justify-between shadow-2xl">
            <NavItem view="dashboard" icon={LayoutGrid} label="首页" />
            <NavItem view="calendar" icon={CalendarIcon} label="日历" />
            <NavItem view="assistant" icon={Bot} label="AI助手" />
            <NavItem view="alarm" icon={AlarmClock} label="闹钟" />
            <NavItem view="profile" icon={User} label="我的" />
          </div>
        </nav>
      )}
    </div>
  );
};

export default App;
