
import React, { useState, useEffect, useCallback } from 'react';
import { Dashboard } from './components/Dashboard.tsx';
import { Trends } from './components/Trends.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { Settings } from './components/Settings.tsx';
import { Auth } from './components/Auth.tsx';
import { DataEntry } from './components/DataEntry.tsx';
import { LegalView } from './components/LegalView.tsx';
import { ViewType, SleepRecord, SyncStatus } from './types.ts';
import { User, Loader2, PlusCircle, Activity, Zap } from 'lucide-react';
import { getSleepInsight } from './services/geminiService.ts';
import { googleFit } from './services/googleFitService.ts';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';

const App: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('somno_lang');
    return (saved as Language) || 'en';
  });
  
  const [isLoggedIn, setIsLoggedIn] = useState(googleFit.hasToken());
  const [isGuest, setIsGuest] = useState(false);
  const [activeView, setActiveView] = useState<ViewType | 'privacy' | 'terms'>('dashboard');
  const [currentRecord, setCurrentRecord] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const [isDataEntryOpen, setIsDataEntryOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const t = translations[lang];

  useEffect(() => {
    localStorage.setItem('somno_lang', lang);
  }, [lang]);

  const handleSyncGoogleFit = useCallback(async (forcePrompt = false, onProgress?: (status: SyncStatus) => void) => {
    console.log("App: Sync Triggered");
    setIsLoading(true);
    try {
      onProgress?.('authorizing');
      await googleFit.authorize(forcePrompt);
      
      setIsLoggedIn(true);
      setIsGuest(false);
      
      onProgress?.('fetching');
      const fitData = await googleFit.fetchSleepData();
      
      const updatedRecord = {
        id: `fit-${Date.now()}`,
        aiInsights: [lang === 'en' ? "Lab syncing biometric streams..." : "实验室同步生物识别流中..."],
        ...fitData
      } as SleepRecord;
      
      setCurrentRecord(updatedRecord);
      setHistory(prev => [updatedRecord, ...prev].slice(0, 30));
      
      // 数据抓取成功后即可关闭全屏加载
      setIsLoading(false);
      onProgress?.('analyzing');
      
      // AI 洞察作为后台异步过程
      try {
        const insights = await getSleepInsight(updatedRecord, lang);
        setCurrentRecord(prev => prev ? ({ ...prev, aiInsights: insights }) : prev);
        onProgress?.('success');
      } catch (aiErr: any) {
        console.error("App: AI Analytics failed", aiErr);
        if (aiErr.message === "GATEWAY_NOT_FOUND") {
          setIsLoggedIn(false);
          setErrorToast(lang === 'zh' ? "神经网关已断开，请重新激活" : "Neural Gateway Disconnected");
        }
        onProgress?.('success'); // 即使 AI 失败，基础数据也已展示
      }
      
    } catch (err: any) {
      console.error("App: Sync Error", err);
      setIsLoading(false);
      onProgress?.('error');
      
      let msg = err.message;
      if (msg === "DATA_NOT_FOUND") msg = (lang === 'zh' ? "未发现睡眠数据，请确认 Google Fit 中有记录" : "No sleep data found in Google Fit");
      if (msg === "GOOGLE_SDK_TIMEOUT") msg = (lang === 'zh' ? "Google 服务初始化超时" : "Google SDK Initialization Timeout");
      
      setErrorToast(msg || (lang === 'zh' ? "同步失败" : "Sync Failed"));
      setTimeout(() => setErrorToast(null), 5000);
    }
  }, [lang]);

  const handleLogout = () => {
    googleFit.logout();
    setIsLoggedIn(false);
    setIsGuest(false);
    setCurrentRecord(null);
    setHistory([]);
    setActiveView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderView = () => {
    if (activeView === 'privacy' || activeView === 'terms') {
      return <LegalView type={activeView} lang={lang} onBack={() => setActiveView('profile')} />;
    }

    // 只有在完全没有数据且正在加载时才显示全屏转圈
    if (isLoading && !currentRecord) return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-10 text-center">
        <Loader2 size={48} className="animate-spin text-indigo-500" />
        <div className="space-y-2">
          <p className="text-white font-bold">{lang === 'en' ? 'Authenticating...' : '身份验证中...'}</p>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest leading-relaxed">
            {lang === 'en' ? 'Establishing Bio-Auth Protocol' : '正在建立生物特征识别授权协议'}
            <br/>
            {lang === 'en' ? '(Check for popup windows)' : '(请检查浏览器弹出窗口)'}
          </p>
        </div>
      </div>
    );
    
    if (!isLoggedIn && !isGuest) return <Auth lang={lang} onLogin={() => handleSyncGoogleFit()} onGuest={() => setIsGuest(true)} />;
    
    if (!currentRecord && activeView === 'dashboard') return (
      <div className="flex flex-col items-center justify-center h-[75vh] gap-10 text-center px-4">
        <Logo size={96} className="opacity-40" animated />
        <div className="space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tighter">{lang === 'en' ? 'Biometric Offline' : '生物识别离线'}</h2>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest">{lang === 'en' ? 'Sync cloud data or inject manual signals' : '同步云端数据或手动注入信号'}</p>
        </div>
        <div className="flex flex-col w-full max-w-xs gap-4">
          <button onClick={() => handleSyncGoogleFit(true)} className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl">{lang === 'en' ? 'Sync Google Fit' : '同步 Google Fit'}</button>
          <button onClick={() => setIsDataEntryOpen(true)} className="w-full py-6 bg-white/5 border border-white/10 text-slate-400 rounded-[2rem] font-black uppercase tracking-widest flex items-center justify-center gap-3">
            <PlusCircle size={16} /> {lang === 'en' ? 'Manual Injection' : '手动注入'}
          </button>
        </div>
      </div>
    );

    return (
      <AnimatePresence mode="wait">
        <motion.div key={activeView} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {activeView === 'dashboard' && <Dashboard lang={lang} data={currentRecord!} onSyncFit={(onProgress) => handleSyncGoogleFit(false, onProgress)} />}
          {activeView === 'calendar' && <Trends history={history} />}
          {activeView === 'assistant' && <AIAssistant lang={lang} data={currentRecord} onNavigate={setActiveView} onSync={() => handleSyncGoogleFit()} />}
          {activeView === 'profile' && <Settings lang={lang} onLanguageChange={setLang} onLogout={handleLogout} onNavigate={setActiveView} />}
        </motion.div>
      </AnimatePresence>
    );
  };

  const showNav = isLoggedIn || isGuest || currentRecord;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-['Plus_Jakarta_Sans'] relative flex flex-col">
      <main className={`flex-1 w-full max-w-2xl mx-auto px-6 ${showNav ? 'pt-20 pb-40' : 'pt-8'} transition-all duration-500`}>
        {renderView()}
      </main>

      {showNav && (activeView !== 'privacy' && activeView !== 'terms') && (
        <nav className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-10 safe-area-inset-bottom pointer-events-none">
          <div className="max-w-md mx-auto glass-morphism rounded-[3rem] p-2 flex justify-between pointer-events-auto shadow-[0_-20px_50px_rgba(0,0,0,0.5)] border border-white/10">
            {[
              { id: 'dashboard', icon: Logo, label: t.nav.lab },
              { id: 'calendar', icon: Activity, label: t.nav.trends },
              { id: 'assistant', icon: Zap, label: t.nav.insights },
              { id: 'profile', icon: User, label: t.nav.settings }
            ].map((nav) => {
              const IconComponent = nav.icon;
              return (
                <button 
                  key={nav.id} 
                  onClick={() => setActiveView(nav.id as ViewType)} 
                  className={`flex-1 py-4 flex flex-col items-center gap-2 transition-all active:scale-95 ${activeView === nav.id ? 'text-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <IconComponent 
                    size={22} 
                    {...(nav.id === 'dashboard' ? { animated: activeView === nav.id } : {})} 
                  />
                  <span className="text-[9px] font-black uppercase tracking-widest">{nav.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {isDataEntryOpen && <DataEntry onClose={() => setIsDataEntryOpen(false)} onSave={(r) => { setCurrentRecord(r); setHistory(prev => [r, ...prev]); setIsDataEntryOpen(false); }} />}
      
      {errorToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 bg-rose-600 text-white text-xs font-black uppercase tracking-widest rounded-full shadow-2xl animate-in slide-in-from-top-4">
          {errorToast}
        </div>
      )}
    </div>
  );
};
export default App;
