import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Clock, Activity, Zap, Smartphone, Coffee, AlertCircle, History, Sparkles, Crown } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface SleepInput {
  duration: number;
  bedtime: string;
  wakeTime: string;
  awakenings: number;
  energyScore: number;
  screenTime: boolean;
  caffeine: boolean;
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
  const { profile } = useAuth();
  const rawPlan = profile?.subscription_plan || 'go';
  // Normalize plan name: 'free' maps to 'go'
  const plan = rawPlan.toLowerCase() === 'free' ? 'go' : rawPlan.toLowerCase();
  const isFree = plan === 'go';
  
  // Helper to capitalize first letter
  const displayPlan = plan.charAt(0).toUpperCase() + plan.slice(1);

  const [input, setInput] = useState<SleepInput>({
    duration: 7,
    bedtime: '23:00',
    wakeTime: '07:00',
    awakenings: 0,
    energyScore: 7,
    screenTime: true,
    caffeine: true,
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  useEffect(() => {
    const savedHistory = localStorage.getItem('sleepHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
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
      document.body.removeChild(script);
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
  };

  const generateAnalysis = async () => {
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

        Provide the response in JSON format with the following structure:
        {
          "overview": "A brief summary of the sleep quality",
          "insights": ["Insight 1", "Insight 2", "Insight 3"],
          "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"],
          "tomorrowOptimization": "One key action for tomorrow to improve sleep"
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const resultText = response.text;
      if (resultText) {
        const parsedResult = JSON.parse(resultText) as AIAnalysis;
        setAnalysis(parsedResult);
        saveToHistory(parsedResult);
      }
    } catch (error) {
      console.error('Error generating analysis:', error);
      alert(lang === 'zh' ? '生成分析时出错，请重试。' : 'Error generating analysis, please try again.');
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
    yes: lang === 'zh' ? '是' : 'Yes',
    no: lang === 'zh' ? '否' : 'No',
    overview: lang === 'zh' ? '睡眠概览' : 'Sleep Overview',
    insights: lang === 'zh' ? '关键洞察' : 'Key Insights',
    recommendations: lang === 'zh' ? '个性化建议' : 'Personalized Recommendations',
    tomorrow: lang === 'zh' ? '明日优化方向' : 'Tomorrow Optimization',
    history: lang === 'zh' ? '历史记录' : 'History',
    disclaimer: lang === 'zh' ? '免责声明：此分析仅供参考，不构成医疗建议。' : 'Disclaimer: This analysis is for informational purposes only and does not constitute medical advice.',
    upgradeTitle: lang === 'zh' ? '升级到 Pro' : 'Upgrade to Pro',
    upgradeDesc: lang === 'zh' ? '解锁高级 AI 洞察和无限历史记录。' : 'Unlock advanced AI insights and unlimited history.',
    upgradeBtn: lang === 'zh' ? '立即升级' : 'Upgrade Now',
    currentPlan: lang === 'zh' ? '当前计划' : 'Current Plan',
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 text-slate-200">
      {isFree && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-900/20"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Crown className="text-yellow-300" size={24} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{t.upgradeTitle}</h3>
              <p className="text-indigo-100 text-sm">{t.upgradeDesc}</p>
            </div>
          </div>
          <Link 
            to="/subscription" 
            className="whitespace-nowrap bg-white text-indigo-600 px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm"
          >
            {t.upgradeBtn}
          </Link>
        </motion.div>
      )}

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{t.title}</h1>
          <p className="text-slate-400">Track your sleep and get AI-powered insights.</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">{t.currentPlan}</p>
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
            isFree 
              ? 'bg-slate-800 text-slate-400 border-slate-700' 
              : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
          }`}>
            {displayPlan}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Clock size={16} className="text-indigo-400" />
                {t.duration}
              </label>
              <input 
                type="number" 
                value={input.duration}
                onChange={(e) => setInput({ ...input, duration: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                min="0" max="24" step="0.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Moon size={16} className="text-indigo-400" />
                  {t.bedtime}
                </label>
                <input 
                  type="time" 
                  value={input.bedtime}
                  onChange={(e) => setInput({ ...input, bedtime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                  <Sun size={16} className="text-indigo-400" />
                  {t.wakeTime}
                </label>
                <input 
                  type="time" 
                  value={input.wakeTime}
                  onChange={(e) => setInput({ ...input, wakeTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Activity size={16} className="text-indigo-400" />
                {t.awakenings}
              </label>
              <input 
                type="number" 
                value={input.awakenings}
                onChange={(e) => setInput({ ...input, awakenings: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors"
                min="0"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Zap size={16} className="text-indigo-400" />
                {t.energy}
              </label>
              <input 
                type="range" 
                value={input.energyScore}
                onChange={(e) => setInput({ ...input, energyScore: Number(e.target.value) })}
                className="w-full accent-indigo-500"
                min="1" max="10"
              />
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>1</span>
                <span>{input.energyScore}</span>
                <span>10</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Smartphone size={16} className="text-indigo-400" />
                {t.screen}
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setInput({ ...input, screenTime: true })}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${input.screenTime ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                >
                  {t.yes}
                </button>
                <button 
                  onClick={() => setInput({ ...input, screenTime: false })}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${!input.screenTime ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                >
                  {t.no}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border border-slate-800">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Coffee size={16} className="text-indigo-400" />
                {t.caffeine}
              </label>
              <div className="flex gap-2">
                <button 
                  onClick={() => setInput({ ...input, caffeine: true })}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${input.caffeine ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                >
                  {t.yes}
                </button>
                <button 
                  onClick={() => setInput({ ...input, caffeine: false })}
                  className={`px-3 py-1 rounded-md text-sm transition-colors ${!input.caffeine ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/50' : 'bg-slate-900 text-slate-400 border border-slate-800'}`}
                >
                  {t.no}
                </button>
              </div>
            </div>

            <button 
              onClick={generateAnalysis}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Sparkles size={18} />
              )}
              {isAnalyzing ? t.analyzing : t.generate}
            </button>
          </div>
        </motion.div>

        {/* Results Area */}
        <div className="space-y-6">
          {analysis ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-indigo-950/30 border border-indigo-500/30 rounded-2xl p-6 backdrop-blur-sm"
            >
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <Sparkles className="text-indigo-400" />
                AI Analysis Result
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-indigo-300 mb-2 uppercase tracking-wider">{t.overview}</h3>
                  <p className="text-slate-300 leading-relaxed">{analysis.overview}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-indigo-300 mb-2 uppercase tracking-wider">{t.insights}</h3>
                  <ul className="space-y-2">
                    {analysis.insights.map((insight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-indigo-500 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-indigo-300 mb-2 uppercase tracking-wider">{t.recommendations}</h3>
                  <ul className="space-y-2">
                    {analysis.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-emerald-500 mt-1">✓</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-indigo-900/40 border border-indigo-500/30 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-indigo-300 mb-2 uppercase tracking-wider">{t.tomorrow}</h3>
                  <p className="text-white font-medium">{analysis.tomorrowOptimization}</p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-full min-h-[400px] border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <Moon size={48} className="mb-4 opacity-20" />
              <p>Enter your sleep data and generate an analysis to see insights here.</p>
            </div>
          )}
        </div>
      </div>

      {/* History Area */}
      {history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <History size={20} className="text-slate-400" />
            {t.history}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Date</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3 rounded-tr-lg">Overview</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{record.input.duration}h</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.input.energyScore >= 8 ? 'bg-emerald-500/10 text-emerald-400' : 
                        record.input.energyScore >= 5 ? 'bg-amber-500/10 text-amber-400' : 
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {record.input.energyScore}/10
                      </span>
                    </td>
                    <td className="px-4 py-3 truncate max-w-xs">{record.analysis.overview}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Disclaimer Area */}
      <div className="flex items-start gap-3 p-4 bg-slate-900/30 border border-slate-800/50 rounded-xl text-slate-500 text-sm">
        <AlertCircle size={18} className="shrink-0 mt-0.5" />
        <p>{t.disclaimer}</p>
      </div>
    </div>
  );
};
