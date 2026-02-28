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
  const [stats, setStats] = useState({
    score: null,
    hr: null,
    readiness: null,
    deep: null
  });

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
            setSleepData(data);
            const latest = data[0];
            setStats({
              score: latest.score,
              hr: latest.heart_rate_resting,
              readiness: latest.readiness,
              deep: latest.deep_sleep_duration
            });
          }
        } else {
          navigate('/auth');
        }
      } catch (e) {
        console.error("Dashboard data fetch failed:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndData();
  }, [navigate]);

  const performLogout = async () => {
    await (supabase.auth as any).signOut();
    navigate('/');
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

      <header className="flex items-center justify-between mb-12">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">{lang === 'zh' ? '欢迎回来' : 'Welcome back'}</h1>
            <p className="text-xs text-slate-500 font-mono">{user?.email}</p>
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
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
            <Moon size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t.scoreStatus || 'Sleep Score'}</p>
            <h3 className="text-2xl font-black">{stats.score ?? (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">{t.status || 'Resting HR'}</p>
            <h3 className="text-2xl font-black">
              {stats.hr ? `${stats.hr} bpm` : (t.void || 'Void')}
            </h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-500/10 text-amber-500 rounded-2xl">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Readiness</p>
            <h3 className="text-2xl font-black">{stats.readiness ? `${stats.readiness}%` : (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
        <GlassCard className="p-6 flex items-center gap-4">
          <div className="p-4 bg-purple-500/10 text-purple-500 rounded-2xl">
            <Brain size={24} />
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Deep Sleep</p>
            <h3 className="text-2xl font-black">{stats.deep ?? (t.void || 'Void')}</h3>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <GlassCard className="p-8 min-h-[400px]">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold flex items-center gap-3">
                <BarChart2 size={20} className="text-indigo-500" />
                Sleep Stages
              </h3>
              <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-xs">
                <option>Last Night</option>
                <option>Last Week</option>
              </select>
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
          <GlassCard className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500 rounded-xl text-white shadow-lg shadow-indigo-500/30">
                <Brain size={20} />
              </div>
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-[10px] font-bold uppercase tracking-wider">AI Insight</span>
            </div>
            <h4 className="font-bold text-lg mb-2">Optimal Recovery</h4>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              Your deep sleep ratio is 15% higher than your 30-day average. Cognitive performance is likely peaked today.
            </p>
            
            <div className="relative group">
              <input 
                type="text" 
                placeholder={lang === 'zh' ? '询问关于睡眠的问题...' : 'Ask about your sleep...'}
                className="w-full bg-black/40 border border-indigo-500/30 rounded-xl py-3 pl-4 pr-12 text-sm focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 outline-none transition-all text-white placeholder-slate-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    setShowAIAssistant(true);
                  }
                }}
              />
              <button 
                onClick={() => setShowAIAssistant(true)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
              >
                <Sparkles size={14} />
              </button>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500 mb-4">Quick Actions</h4>
            <div className="space-y-3">
              <button onClick={() => setShowAIAssistant(true)} className="w-full p-4 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 rounded-xl text-left flex items-center justify-between group transition-all">
                <span className="font-medium text-sm text-indigo-400 flex items-center gap-2"><Brain size={16} /> {lang === 'zh' ? 'AI 助手' : 'AI Assistant'}</span>
                <ChevronRight size={16} className="text-indigo-500 group-hover:text-indigo-300 transition-colors" />
              </button>
              <button onClick={() => navigate('/experiment')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left flex items-center justify-between group transition-all">
                <span className="font-medium text-sm">Start Experiment</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
              </button>
              <button onClick={() => navigate('/journal')} className="w-full p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left flex items-center justify-between group transition-all">
                <span className="font-medium text-sm">Log Journal</span>
                <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
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
