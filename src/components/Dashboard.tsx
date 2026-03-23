import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun, Clock, Activity, Zap, Smartphone, Coffee, AlertCircle, History, Sparkles, Brain, ShieldCheck, Cpu, Terminal, ChevronRight, Settings, LogOut, Upload, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { GridBackground, TelemetryStream, HardwareWidget } from './ui/Components';
import { useLanguage } from '../context/useLanguage';
import { supabase } from '../services/supabaseService';

import { TimePicker } from './ui/TimePicker';

interface SleepInput {
  duration: number;
  bedtime: string;
  wakeTime: string;
  awakenings: number;
  energyScore: number;
  screenTime: boolean;
  caffeine: boolean;
  pace: string;
  maxHeartRate: number;
  minHeartRate: number;
}

interface AIAnalysis {
  overview: string;
  insights: string[];
  recommendations: string[];
  tomorrowOptimization: string;
}

interface HistoryRecord {
  id: string;
  date: string;
  input: SleepInput;
  analysis: AIAnalysis;
}

export const Dashboard = ({ lang }: { lang: 'en' | 'zh' }) => {
  const { profile, signOut } = useAuth();
  const { langPrefix } = useLanguage();
  const navigate = useNavigate();
  const rawPlan = profile?.subscription_plan || 'go';
  const plan = rawPlan.toLowerCase() === 'free' ? 'go' : rawPlan.toLowerCase();
  const displayPlan = plan === 'pro' ? (lang === 'zh' ? 'SomnoAI 数字睡眠实验室分析' : 'SomnoAI Digital Sleep Lab Analysis') : (plan.charAt(0).toUpperCase() + plan.slice(1));

  const [input, setInput] = useState<SleepInput>({
    duration: 7,
    bedtime: '23:00',
    wakeTime: '07:00',
    awakenings: 0,
    energyScore: 7,
    screenTime: true,
    caffeine: true,
    pace: '0:00',
    maxHeartRate: 0,
    minHeartRate: 0,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [dailyCount, setDailyCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isUnlimitedUser = profile?.email === 'ongyuze1401@gmail.com' || 
                         profile?.id === '8f424e4f-e53d-447f-ba5f-98428fe0a34e' || 
                         profile?.subscription_plan === 'unlimited';

  const DAILY_LIMIT = isUnlimitedUser ? Infinity : 4;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  useEffect(() => {
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
          
          // Calculate daily count
          const today = new Date().toDateString();
          const todayCount = parsed.filter((r: any) => new Date(r.date).toDateString() === today).length;
          setDailyCount(todayCount);
        }
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }

    // Load ElevenLabs Widget Script
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@elevenlabs/convai-widget-embed";
    script.async = true;
    script.type = "text/javascript";
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    }
  }, []);

  const saveToHistory = (newAnalysis: AIAnalysis) => {
    const newRecord: HistoryRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      input: { ...input },
      analysis: newAnalysis,
    };
    const updatedHistory = [newRecord, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem('sleepHistory', JSON.stringify(updatedHistory));
    
    // Update daily count
    const today = new Date().toDateString();
    const todayCount = updatedHistory.filter((r: any) => new Date(r.date).toDateString() === today).length;
    setDailyCount(todayCount);
  };

  const handleLogout = async () => {
    await signOut();
    navigate(`${langPrefix}`);
  };

  const generateAnalysis = async () => {
    if (dailyCount >= DAILY_LIMIT) {
      alert(lang === 'zh' 
        ? "您已达到每日 4 次分析限制。我们设置此限制是为了确保系统稳定性并避免超出每日配额。请明天再试！" 
        : "You have reached the daily limit of 4 analyses. We set this limit to ensure system stability and avoid exceeding daily quotas. Please try again tomorrow!");
      return;
    }
    setIsAnalyzing(true);
    try {
      const prompt = `
        As a sleep expert, analyze the following sleep data and provide insights.
        Language: ${lang === 'zh' ? 'Chinese' : 'English'}
        
        Sleep Data:
        - Sleep Duration: ${input.duration} hours
        - Bedtime: ${input.bedtime}
        - Wake Time: ${input.wakeTime}
        - Night Awakenings: ${input.awakenings} times
        - Energy Score (1-10): ${input.energyScore}
        - Screen time before bed: ${input.screenTime ? 'Yes' : 'No'}
        - Caffeine intake today: ${input.caffeine ? 'Yes' : 'No'}
        - Step: ${input.pace}
        - Max Heart Rate: ${input.maxHeartRate} bpm
        - Min Heart Rate: ${input.minHeartRate} bpm
        ${selectedFile ? `- Note: User has uploaded a sleep report file (${selectedFile.name}). Please assume the analysis should consider potential external data if provided in text form.` : ''}

        Provide the response in JSON format with the following structure:
        {
          "overview": "A brief summary of the sleep quality",
          "insights": ["Insight 1", "Insight 2", "Insight 3"],
          "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
          "tomorrowOptimization": "One key action for tomorrow to improve sleep"
        }
      `;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await fetch('/api/analyze-sleep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt,
          lang,
          selectedFileName: selectedFile?.name
        })
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMessage = 'Failed to generate analysis';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data) {
        setAnalysis(data);
        saveToHistory(data);
      }
    } catch (error: any) {
      console.error('Error generating analysis:', error);
      let errorMsg = error.message;
      if (error.message?.includes('quota') || error.message?.includes('429')) {
        errorMsg = lang === 'zh' 
          ? "系统当前繁忙（配额已满），请稍后再试或明天再试。" 
          : "System is currently busy (quota reached). Please try again in a few minutes or tomorrow.";
      }
      alert(lang === 'zh' ? `生成分析时出错：${errorMsg}` : `Error generating analysis: ${errorMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const t = {
    title: lang === 'zh' ? '睡眠分析 MVP' : 'Sleep Analysis MVP',
    generate: lang === 'zh' ? '生成分析' : 'Generate Analysis',
    analyzing: lang === 'zh' ? '分析中...' : 'Analyzing...',
    duration: lang === 'zh' ? '睡眠时长 (小时)' : 'Sleep Duration (hours)',
    bedtime: lang === 'zh' ? '入睡时间' : 'Bedtime',
    wakeTime: lang === 'zh' ? '起床时间' : 'Wake Time',
    awakenings: lang === 'zh' ? '夜醒次数' : 'Night Awakenings',
    energy: lang === 'zh' ? '今日精力评分 (1-10)' : 'Energy Score (1-10)',
    screen: lang === 'zh' ? '睡前是否看手机' : 'Screen Time Before Bed',
    caffeine: lang === 'zh' ? '今日是否摄入咖啡因' : 'Caffeine Intake Today',
    pace: lang === 'zh' ? '步数 (step)' : 'Step',
    maxHR: lang === 'zh' ? '最高心率 (bpm)' : 'Max Heart Rate (bpm)',
    minHR: lang === 'zh' ? '最低心率 (bpm)' : 'Min Heart Rate (bpm)',
    yes: lang === 'zh' ? '是' : 'Yes',
    no: lang === 'zh' ? '否' : 'No',
    overview: lang === 'zh' ? '睡眠概览' : 'Sleep Overview',
    insights: lang === 'zh' ? '关键洞察' : 'Key Insights',
    recommendations: lang === 'zh' ? '个性化建议' : 'Personalized Recommendations',
    tomorrow: lang === 'zh' ? '明日优化方向' : 'Tomorrow Optimization',
    history: lang === 'zh' ? '历史记录' : 'History',
    disclaimer: lang === 'zh' ? '免责声明：此分析仅供参考，不构成医疗建议。' : 'Disclaimer: This analysis is for informational purposes only and does not constitute medical advice.',
    currentPlan: lang === 'zh' ? '当前计划' : 'Current Plan',
    uploadTitle: lang === 'zh' ? '上传睡眠数据' : 'Upload Sleep Data',
    uploadDesc: lang === 'zh' ? '上传 CSV 或睡眠报告图片' : 'Upload CSV or images of sleep reports',
    fileSelected: lang === 'zh' ? '已选择文件' : 'File selected',
  };

  return (
    <div className="relative overflow-hidden grainy-bg pb-20">
      <GridBackground />
      
      {/* Background Glows */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/5 blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="micro-label opacity-40">SYSTEM_ACCESS: GRANTED</span>
              <div className="hidden sm:block h-px w-12 bg-white/10" />
              <span className="micro-label text-indigo-400">NEURAL_LINK: ACTIVE</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">
              {t.title}
            </h1>
            <p className="text-slate-400 font-medium text-base sm:text-lg border-l-2 border-indigo-500/20 pl-6 max-w-2xl">
              {lang === 'zh' ? '跟踪您的睡眠并获取 AI 驱动的见解。' : 'Track your sleep and get AI-powered insights.'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start lg:items-end gap-6 lg:gap-8">
            <div className="flex flex-col items-start lg:items-end gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t.currentPlan}</span>
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                plan === 'pro' ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-slate-800 border-white/5 text-slate-500'
              }`}>
                {displayPlan}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:block">
                <TelemetryStream />
              </div>
              <div className="text-left lg:text-right">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Daily Analysis</p>
                <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  dailyCount >= DAILY_LIMIT && DAILY_LIMIT !== Infinity
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' 
                    : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                }`}>
                  {DAILY_LIMIT === Infinity ? 'Unlimited' : `${dailyCount}/${DAILY_LIMIT}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-5 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hardware-panel p-8 bg-slate-900/40 backdrop-blur-xl relative group"
            >
              <div className="scanline" />
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <h2 className="text-xl font-black italic uppercase tracking-widest text-white">Data Input Module</h2>
              </div>

              <div className="space-y-8">
                {/* Time Metrics Group */}
                <div className="space-y-6 relative before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-indigo-500/50 before:to-transparent">
                  <div className="group/input pl-4">
                    <label className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-focus-within/input:text-indigo-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Clock size={14} />
                        {t.duration}
                      </div>
                      <span className="text-indigo-500/50">VAL_HRS</span>
                    </label>
                    <div className="relative">
                      <input 
                        type="number" 
                        value={input.duration}
                        onChange={(e) => setInput({ ...input, duration: Number(e.target.value) })}
                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono text-lg hover:border-white/10"
                        min="0" max="24" step="0.5"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-600 uppercase">Hours</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pl-4">
                    <TimePicker 
                      label={t.bedtime}
                      value={input.bedtime}
                      onChange={(val) => setInput({ ...input, bedtime: val })}
                      icon={<Moon size={14} />}
                    />
                    <TimePicker 
                      label={t.wakeTime}
                      value={input.wakeTime}
                      onChange={(val) => setInput({ ...input, wakeTime: val })}
                      icon={<Sun size={14} />}
                    />
                  </div>
                </div>

                {/* Quality Metrics Group */}
                <div className="space-y-6 relative before:absolute before:-left-4 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-purple-500/50 before:to-transparent">
                  <div className="group/input pl-4">
                    <label className="flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 group-focus-within/input:text-purple-400 transition-colors">
                      <div className="flex items-center gap-2">
                        <Activity size={14} />
                        {t.awakenings}
                      </div>
                      <span className="text-purple-500/50">VAL_COUNT</span>
                    </label>
                    <input 
                      type="number" 
                      value={input.awakenings}
                      onChange={(e) => setInput({ ...input, awakenings: Number(e.target.value) })}
                      className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-purple-500/50 transition-all font-mono hover:border-white/10"
                      min="0"
                    />
                  </div>

                  <div className="group/input pl-4">
                    <div className="flex justify-between items-center mb-3">
                      <label className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest group-focus-within/input:text-emerald-400 transition-colors">
                        <Zap size={14} />
                        {t.energy}
                      </label>
                      <span className="text-lg font-black italic text-emerald-400">{input.energyScore}/10</span>
                    </div>
                    <div className="flex gap-1 h-8">
                      {[...Array(10)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setInput({ ...input, energyScore: i + 1 })}
                          className={`flex-1 rounded-sm transition-all duration-300 ${
                            i < input.energyScore 
                              ? i < 3 ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' 
                              : i < 7 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' 
                              : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                              : 'bg-slate-800 hover:bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Factors Group */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 group/toggle hover:border-white/10 transition-colors">
                    <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Smartphone size={16} className="text-indigo-500" />
                      {t.screen}
                    </label>
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setInput({ ...input, screenTime: true })}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${input.screenTime ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t.yes}
                      </button>
                      <button 
                        onClick={() => setInput({ ...input, screenTime: false })}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!input.screenTime ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 group/toggle hover:border-white/10 transition-colors">
                    <label className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <Coffee size={16} className="text-amber-500" />
                      {t.caffeine}
                    </label>
                    <div className="flex p-1 bg-slate-900 rounded-xl border border-white/5">
                      <button 
                        onClick={() => setInput({ ...input, caffeine: true })}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${input.caffeine ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t.yes}
                      </button>
                      <button 
                        onClick={() => setInput({ ...input, caffeine: false })}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!input.caffeine ? 'bg-amber-600 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' : 'text-slate-500 hover:text-slate-300'}`}
                      >
                        {t.no}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="group/input">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.pace}</label>
                      <input type="text" value={input.pace} onChange={(e) => setInput({...input, pace: e.target.value})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                    </div>
                    <div className="group/input">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.maxHR}</label>
                      <input type="number" value={input.maxHeartRate} onChange={(e) => setInput({...input, maxHeartRate: Number(e.target.value)})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                    </div>
                    <div className="group/input">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">{t.minHR}</label>
                      <input type="number" value={input.minHeartRate} onChange={(e) => setInput({...input, minHeartRate: Number(e.target.value)})} className="w-full bg-black/40 border border-white/5 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all font-mono" />
                    </div>
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t.uploadTitle}</h3>
                  </div>
                  
                  {!selectedFile ? (
                    <label className="flex flex-col items-center justify-center p-8 bg-black/40 border-2 border-dashed border-white/5 rounded-2xl cursor-pointer hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group">
                      <Upload className="text-slate-500 group-hover:text-indigo-400 mb-3 transition-colors" size={32} />
                      <p className="text-xs font-bold text-slate-400 group-hover:text-slate-200 transition-colors">{t.uploadDesc}</p>
                      <input type="file" className="hidden" onChange={handleFileChange} accept=".csv,image/*" />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-[150px]">{selectedFile.name}</p>
                          <p className="text-[10px] text-indigo-400 uppercase tracking-widest">{t.fileSelected}</p>
                        </div>
                      </div>
                      <button 
                        onClick={removeFile}
                        className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>

                <button 
                  onClick={generateAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(79,70,229,0.3)] group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span className="animate-pulse">{t.analyzing}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} className="group-hover/btn:rotate-12 transition-transform" />
                      {t.generate}
                    </>
                  )}
                </button>
                
                <p className="text-[10px] text-slate-500 text-center mt-4 uppercase tracking-widest font-bold">
                  {lang === 'zh' ? `每日限制: ${dailyCount}/${DAILY_LIMIT} 次分析` : `Daily Limit: ${dailyCount}/${DAILY_LIMIT} Analyses`}
                </p>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HardwareWidget label="NEURAL_LOAD" value="42" unit="%" status="active" icon={<Brain size={20} />} />
              <HardwareWidget label="SYNC_STABILITY" value="98.2" unit="%" status="active" icon={<ShieldCheck size={20} />} />
              <HardwareWidget label="SLEEP_SCORE" value={((input.energyScore / 10) * 100).toString()} unit="/100" status="active" icon={<Moon size={20} />} />
            </div>
          </div>

          {/* Right Column: Analysis & History */}
          <div className="lg:col-span-7 space-y-8">
            <AnimatePresence mode="wait">
              {analysis ? (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, scale: 0.98, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -20 }}
                  className="hardware-panel p-6 sm:p-10 bg-indigo-950/20 border-indigo-500/30 backdrop-blur-xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Cpu size={120} />
                  </div>
                  <div className="scanline" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 sm:gap-0 mb-10">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                        <Sparkles className="text-indigo-400" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Neural Diagnostic Report</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="micro-label text-indigo-400">GEN_ID: {Date.now().toString().slice(-8)}</span>
                          <div className="w-1 h-1 rounded-full bg-indigo-500/30" />
                          <span className="micro-label opacity-40">VER: 4.2.0_STABLE</span>
                        </div>
                      </div>
                    </div>
                    <div className="self-start sm:self-auto px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded text-[8px] font-black text-emerald-400 uppercase tracking-widest italic">
                      COMPLETED
                    </div>
                  </div>
                  
                  <div className="space-y-10 relative z-10">
                    <div className="p-6 bg-black/40 rounded-3xl border border-white/5 relative group hover:border-indigo-500/30 transition-colors">
                      <div className="absolute -top-3 left-6 px-3 py-1 bg-slate-900 border border-indigo-500/30 rounded-full micro-label text-indigo-400 uppercase tracking-widest flex items-center gap-2 shadow-[0_0_10px_rgba(79,70,229,0.2)]">
                        <Activity size={10} className="animate-pulse" />
                        {t.overview}
                      </div>
                      <p className="text-lg text-slate-200 leading-relaxed font-medium italic">"{analysis.overview}"</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Terminal size={12} />
                          {t.insights}
                        </h3>
                        <ul className="space-y-4">
                          {analysis.insights?.map((insight, idx) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={idx} 
                              className="flex items-start gap-3 text-slate-400 text-sm font-medium group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500/40 mt-1.5 group-hover:bg-indigo-400 transition-colors" />
                              {insight}
                            </motion.li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <ShieldCheck size={12} />
                          {t.recommendations}
                        </h3>
                        <ul className="space-y-4">
                          {analysis.recommendations?.map((rec, idx) => (
                            <motion.li 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                              key={idx} 
                              className="flex items-start gap-3 text-slate-400 text-sm font-medium group"
                            >
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40 mt-1.5 group-hover:bg-emerald-400 transition-colors" />
                              {rec}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-indigo-500/30 rounded-3xl p-8 relative group overflow-hidden shadow-[0_0_30px_rgba(79,70,229,0.15)]">
                      <div className="absolute inset-0 data-stream opacity-10" />
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400 to-transparent opacity-50" />
                      <div className="relative z-10">
                        <h3 className="text-[10px] font-black text-indigo-300 mb-4 uppercase tracking-[0.3em] flex items-center gap-2">
                          <Zap size={14} className="animate-pulse text-yellow-400" />
                          {t.tomorrow}
                        </h3>
                        <p className="text-xl md:text-2xl text-white font-black italic uppercase tracking-tight leading-tight group-hover:text-indigo-200 transition-colors drop-shadow-md">
                          {analysis.tomorrowOptimization}
                        </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 blur-3xl rounded-full group-hover:bg-indigo-400/30 transition-colors duration-700" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[500px] border border-dashed border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-slate-600 p-12 text-center group"
                >
                  <div className="w-24 h-24 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:border-indigo-500/20 transition-all duration-700">
                    <Moon size={40} className="opacity-20 group-hover:opacity-40 transition-opacity" />
                  </div>
                  <h3 className="text-xl font-black italic uppercase tracking-widest text-slate-500 mb-4">Awaiting Neural Input</h3>
                  <p className="max-w-xs text-sm font-medium leading-relaxed">
                    Initialize the diagnostic sequence by entering your sleep metrics in the data module.
                  </p>
                  <div className="mt-8 flex gap-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-1 h-1 rounded-full bg-white/10 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* History Area */}
            {history.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="hardware-panel p-8 bg-slate-900/20 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <History size={20} className="text-slate-500" />
                    <h2 className="text-lg font-black italic uppercase tracking-widest text-white">{t.history}</h2>
                  </div>
                  <span className="micro-label opacity-30">LAST_10_RECORDS</span>
                </div>
                
                <div className="space-y-3">
                  {history.map((record) => (
                    <div 
                      key={record.id} 
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-black/40 border border-white/5 rounded-2xl hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all group cursor-default relative overflow-hidden gap-4 sm:gap-0"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500/0 group-hover:bg-indigo-500 transition-colors" />
                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 sm:gap-6 pl-2">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Date</span>
                          <span className="text-sm font-mono text-white">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="h-8 w-px bg-white/5 group-hover:bg-indigo-500/20 transition-colors" />
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors">Duration</span>
                          <span className="text-sm font-mono text-white">{record.input?.duration || 0}h</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1 group-hover:text-indigo-400 transition-colors">Energy</span>
                          <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest italic border ${
                            (record.input?.energyScore || 0) >= 8 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 
                            (record.input?.energyScore || 0) >= 5 ? 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]' : 
                            'bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                          }`}>
                            {record.input?.energyScore || 0}/10
                          </span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
                          <ChevronRight size={16} className="text-slate-500 group-hover:text-indigo-400 transition-colors group-hover:translate-x-0.5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-12 pt-12 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer group">
              <Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'zh' ? '实验室设置' : 'Lab Settings'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer group" onClick={handleLogout}>
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{lang === 'zh' ? '终端退出' : 'Terminal Exit'}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-slate-900/30 border border-white/5 rounded-2xl text-slate-500 text-[10px] font-medium max-w-md italic leading-relaxed">
            <AlertCircle size={14} className="shrink-0 mt-0.5 text-indigo-500/50" />
            <p>{t.disclaimer}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
