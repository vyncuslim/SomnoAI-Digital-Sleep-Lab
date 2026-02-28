import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Moon, Zap, Settings, LogOut, 
  BarChart2, Brain, ChevronRight, MessageSquare, X, Sparkles
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard.tsx';
import { Logo } from './Logo.tsx';
import { Language, getTranslation } from '../services/i18n.ts';
import { supabase } from '../services/supabaseService.ts';



import { AIAssistant } from './AIAssistant.tsx';

interface DashboardProps {
  lang: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({ lang }) => {
  const navigate = useNavigate();
  const t = getTranslation(lang, 'dashboard');
  const [user, setUser] = useState<any>(null);
  const [sleepData, setSleepData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogoutFeedback, setShowLogoutFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [stats, setStats] = useState<{
    score: number | null;
    hr: number | null;
    readiness: number | null;
    deep: string | number | null;
  }>({
    score: null,
    hr: null,
    readiness: null,
    deep: null
  });

  const [aiInsight, setAiInsight] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchUserAndData = async () => {
      try {
        const { data: { user }, error } = await (supabase.auth as any).getUser();
        if (error) throw error;
        if (user) {
          setUser(user);
          // Fetch real sleep records
          const { data, error: dataError } = await supabase
            .from('sleep_records')
            .select('*')
            .eq('user_id', user.id)
            .order('date', { ascending: false });
          
          if (!dataError && data && data.length > 0) {
            // Map raw DB data to SleepRecord type
            const mappedData = data.map((d: any) => ({
              id: d.id,
              date: d.date,
              score: d.score,
              heartRate: {
                resting: d.heart_rate_resting,
                min: d.heart_rate_min,
                max: d.heart_rate_max,
                average: d.heart_rate_avg
              },
              deepRatio: d.deep_sleep_duration / (d.total_duration || 480),
              remRatio: d.rem_sleep_duration / (d.total_duration || 480),
              totalDuration: d.total_duration,
              efficiency: d.efficiency,
              readiness: d.readiness,
              aiInsights: d.ai_insights
            }));

            setSleepData(mappedData);
            const latest = mappedData[0];
            
            // Calculate readiness if missing (simple heuristic)
            const readiness = latest.readiness || Math.min(100, Math.max(0, Math.round(
              (latest.score * 0.6) + ((100 - Math.abs(latest.heartRate.resting - 55) * 2) * 0.4)
            )));

            setStats({
              score: latest.score,
              hr: latest.heartRate.resting,
              readiness: readiness,
              deep: (latest.deepRatio * 100).toFixed(0) + '%'
            });

            // Generate AI Insight if not present
            if (latest) {
              setIsAnalyzing(true);
              import('../services/geminiService.ts').then(async ({ getQuickInsight }) => {
                try {
                  const insights = await getQuickInsight(latest, lang);
                  if (insights && insights.length > 0) {
                    setAiInsight(insights[0]);
                  }
                } catch (err) {
                  console.error("AI Insight generation failed", err);
                } finally {
                  setIsAnalyzing(false);
                }
              });
            }
          }
        } else {
          navigate('/auth/signin');
        }
      } catch (e) {
        console.error("Dashboard data fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, [navigate, lang]);

  const performLogout = async () => {
    await (supabase.auth as any).signOut();
    navigate('/auth/signin');
  };

  const handleLogoutClick = () => {
    setShowLogoutFeedback(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) {
      performLogout();
      return;
    }
    
    setIsSubmittingFeedback(true);
    try {
      await supabase.from('feedback').insert({
        user_id: user?.id,
        email: user?.email,
        type: 'suggestion',
        content: `[LOGOUT FEEDBACK] ${feedbackText}`
      });
    } catch (e) {
      console.error("Failed to submit feedback", e);
    } finally {
      setIsSubmittingFeedback(false);
      performLogout();
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans p-6 relative">
      {showLogoutFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowLogoutFeedback(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {lang === 'zh' ? '退出前，请留下您的评价' : 'Before you go, leave some feedback'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'zh' ? '您的反馈对我们非常重要。' : 'Your feedback is very important to us.'}
              </p>
            </div>
            
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder={lang === 'zh' ? '写下您的建议或遇到的问题...' : 'Write your suggestions or issues...'}
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:border-indigo-500 outline-none transition-colors mb-6 resize-none"
            />
            
            <div className="flex gap-4">
              <button 
                onClick={performLogout}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-bold transition-colors"
              >
                {lang === 'zh' ? '跳过并退出' : 'Skip & Logout'}
              </button>
              <button 
                onClick={handleFeedbackSubmit}
                disabled={isSubmittingFeedback || !feedbackText.trim()}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors"
              >
                {isSubmittingFeedback ? (lang === 'zh' ? '提交中...' : 'Submitting...') : (lang === 'zh' ? '提交并退出' : 'Submit & Logout')}
              </button>
            </div>
          </GlassCard>
        </div>
      )}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 relative grainy-bg">
        <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-1.5 h-16 bg-indigo-500 rounded-full blur-[2px] animate-pulse" />
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />
            <Logo className="relative z-10 scale-110" />
          </div>
          <div>
            <p className="micro-label mb-1">System Status: Operational // Neural Link: Stable</p>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase">
              {t.welcome || 'Command Center'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white/5 rounded-full p-1 border border-white/10 mr-2">
            <button 
              onClick={() => {
                const pathWithoutLang = window.location.pathname.replace(/^\/(cn|en)/, '');
                navigate(`/en${pathWithoutLang}`);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'en' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              EN
            </button>
            <button 
              onClick={() => {
                const pathWithoutLang = window.location.pathname.replace(/^\/(cn|en)/, '');
                navigate(`/cn${pathWithoutLang}`);
              }}
              className={`px-3 py-1 rounded-full text-[10px] font-black transition-all ${lang === 'zh' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
            >
              CN
            </button>
          </div>
          <button onClick={() => navigate('/settings')} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
            <Settings size={20} />
          </button>
          <button onClick={handleLogoutClick} className="p-3 bg-rose-500/10 text-rose-500 rounded-full hover:bg-rose-500/20 transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <GlassCard className="p-6 flex items-center gap-4 border-white/5 bg-slate-900/40 group hover:border-indigo-500/30 transition-all">
          <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Moon size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] italic">{t.scoreStatus || 'Sleep Score'}</p>
            <h3 className="text-3xl font-black italic tracking-tighter">{stats.score ?? (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4 border-white/5 bg-slate-900/40 group hover:border-emerald-500/30 transition-all">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] italic">{t.status || 'Resting HR'}</p>
            <h3 className="text-3xl font-black italic tracking-tighter">
              {stats.hr ? `${stats.hr} bpm` : (t.void || 'Void')}
            </h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4 border-white/5 bg-slate-900/40 group hover:border-amber-500/30 transition-all">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] italic">Readiness</p>
            <h3 className="text-3xl font-black italic tracking-tighter">{stats.readiness ? `${stats.readiness}%` : (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4 border-white/5 bg-slate-900/40 group hover:border-purple-500/30 transition-all">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl group-hover:scale-110 transition-transform">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em] italic">Deep Sleep</p>
            <h3 className="text-3xl font-black italic tracking-tighter">{stats.deep ?? (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black italic uppercase tracking-tight flex items-center gap-3">
                <BarChart2 size={20} className="text-indigo-500" />
                Laboratory Telemetry
              </h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Live Link</span>
                </div>
                <select className="bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 outline-none focus:border-indigo-500 transition-all">
                  <option>Last Night</option>
                  <option>Last Week</option>
                </select>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center">
              {sleepData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sleepData.map(d => ({ time: d.date, value: d.score }))}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #ffffff10', borderRadius: '8px' }}
                      itemStyle={{ color: '#6366f1' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#6366f1" fillOpacity={1} fill="url(#colorValue)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center space-y-2">
                  <BarChart2 size={48} className="text-slate-800 mx-auto" />
                  <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">{t.noData || 'No Data Available'}</p>
                </div>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard className="p-8 bg-slate-900/60 border-indigo-500/20 relative overflow-hidden group rounded-[2.5rem]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full group-hover:bg-indigo-500/10 transition-all" />
            <div className="flex items-start justify-between mb-8 relative z-10">
              <div className="space-y-1">
                <p className="micro-label">Neural Analysis Engine</p>
                <h4 className="font-black italic text-2xl uppercase tracking-tight flex items-center gap-3">
                  <Brain size={24} className="text-indigo-400" />
                  Optimal Recovery
                </h4>
              </div>
              <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                <span className="text-[8px] font-black text-indigo-400 uppercase tracking-widest">Active</span>
              </div>
            </div>
            
            <div className="dashed-line mb-8 opacity-50" />
            
            <p className="text-sm text-slate-400 leading-relaxed italic font-medium mb-8 relative z-10 min-h-[4rem]">
              {isAnalyzing ? (
                <span className="animate-pulse">{lang === 'zh' ? '正在分析 Health Connect 数据...' : 'Analyzing Health Connect data...'}</span>
              ) : (
                aiInsight || (lang === 'zh' ? '暂无数据分析。请同步您的 Health Connect。' : 'No analysis available. Please sync your Health Connect data.')
              )}
            </p>
            
            <div className="relative group z-10">
              <input 
                type="text" 
                placeholder={lang === 'zh' ? '询问关于睡眠的问题...' : 'Ask about your sleep...'}
                className="w-full bg-black/60 border border-white/5 rounded-2xl py-4 pl-5 pr-14 text-sm focus:border-indigo-500/50 focus:bg-black/80 outline-none transition-all text-white placeholder-slate-700 italic font-medium"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setShowAIAssistant(true);
                  }
                }}
              />
              <button 
                onClick={() => setShowAIAssistant(true)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-110"
              >
                <Sparkles size={16} />
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-8 rounded-[2.5rem] border-white/5 bg-slate-900/40">
            <div className="flex items-center justify-between mb-8">
              <h4 className="micro-label">Quick Actions</h4>
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-4">
              <button onClick={() => setShowAIAssistant(true)} className="w-full p-5 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 rounded-2xl text-left flex items-center justify-between group transition-all">
                <span className="font-black italic text-xs uppercase tracking-widest text-indigo-400 flex items-center gap-3"><Brain size={18} /> {lang === 'zh' ? 'AI 助手' : 'AI Assistant'}</span>
                <ChevronRight size={18} className="text-indigo-500 group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full p-5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-2xl text-left flex items-center justify-between group transition-all">
                <span className="font-black italic text-xs uppercase tracking-widest text-emerald-400 flex items-center gap-3"><Activity size={18} /> Sync Health Connect</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </button>
              <button onClick={() => navigate('/experiment')} className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left flex items-center justify-between group transition-all">
                <span className="font-black italic text-xs uppercase tracking-widest text-slate-400 flex items-center gap-3"><Zap size={18} /> Start Experiment</span>
                <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-all group-hover:text-white" />
              </button>
              <button onClick={() => navigate('/journal')} className="w-full p-5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl text-left flex items-center justify-between group transition-all">
                <span className="font-black italic text-xs uppercase tracking-widest text-slate-400 flex items-center gap-3"><Activity size={18} /> Log Journal</span>
                <ChevronRight size={18} className="text-slate-600 group-hover:translate-x-1 transition-all group-hover:text-white" />
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Floating AI Assistant Button */}
      <button 
        onClick={() => setShowAIAssistant(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-[0_0_30px_rgba(99,102,241,0.5)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group"
      >
        <Brain size={28} className="group-hover:animate-pulse" />
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#01040a] animate-bounce" />
      </button>

      {/* AI Assistant Modal */}
      <AnimatePresence>
        {showAIAssistant && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8 bg-black/90 backdrop-blur-md">
            <div className="w-full max-w-5xl h-full max-h-[90vh] relative flex flex-col">
              <button 
                onClick={() => setShowAIAssistant(false)}
                className="absolute -top-12 right-0 text-white/60 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors"
              >
                <X size={20} /> Close Assistant
              </button>
              <div className="flex-1 overflow-hidden rounded-[2.5rem] border border-white/10 shadow-2xl">
                <AIAssistant lang={lang} data={sleepData[0] || null} history={sleepData} />
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
