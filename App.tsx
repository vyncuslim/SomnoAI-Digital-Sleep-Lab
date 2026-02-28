import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { trackPageView } from './services/analytics.ts';
import { Language } from './types.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { Auth } from './components/Auth.tsx';
import { AuthVerify } from './components/AuthVerify.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AdminView } from './components/AdminView.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { AboutView } from './components/AboutView.tsx';
import { ContactView } from './components/ContactView.tsx';
import { AIAssistant } from './components/AIAssistant.tsx';
import { ExperimentView } from './components/ExperimentView.tsx';
import { DiaryView } from './components/DiaryView.tsx';
import { BlogHub } from './components/BlogHub.tsx';
import { BlogPostView } from './components/BlogPostView.tsx';
import { NewsHub } from './components/NewsHub.tsx';
import { ArticleView } from './components/ArticleView.tsx';
import { OpenSourceView } from './components/OpenSourceView.tsx';
import { ChangelogView } from './components/ChangelogView.tsx';
import { LegalView } from './components/LegalView.tsx';
import { SupportView } from './components/SupportView.tsx';
import { getTranslation } from './services/i18n.ts';
import { SleepRecord } from './types.ts';
import { BLOG_POSTS, RESEARCH_ARTICLES } from './data/mockData.ts';
import { BlockedView } from './components/BlockedView.tsx';

import { supabase } from './services/supabaseService.ts';
import { Salesmartly } from './components/Salesmartly.tsx';
import { AnalyticsProvider } from './components/AnalyticsProvider.tsx';

// Initial Data
const INITIAL_SLEEP_DATA: SleepRecord = {
  id: 'rec_7892345610',
  date: new Date().toISOString(),
  score: 85,
  heartRate: {
    resting: 58,
    min: 52,
    max: 110,
    average: 65,
    history: []
  },
  deepRatio: 0.18,
  remRatio: 0.22,
  totalDuration: 460, // minutes
  efficiency: 0.92,
  stages: [],
  aiInsights: [
    "Deep sleep duration is within optimal range.",
    "REM cycles show good consistency.",
    "Resting heart rate is excellent."
  ]
};

const BlogPostWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center text-white">Post not found</div>;
  }

  return <BlogPostView post={post} lang={lang} onBack={() => navigate('/blog')} />;
};

const ArticleWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = RESEARCH_ARTICLES.find(a => a.slug === slug);

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-white">Article not found</div>;
  }

  return <ArticleView article={article} lang={lang} onBack={() => navigate('/news')} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

interface AppRoutesProps {
  lang: Language;
  setLang: (lang: Language) => void;
  latestData: SleepRecord | null;
  history: SleepRecord[];
  profile: any; // TODO: Type this properly
  handleNavigate: (path: string) => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({
  lang,
  setLang,
  latestData,
  history,
  profile,
  handleNavigate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isBlocked } = useAuth();

  const handleBack = () => navigate(-1);

  // Force English for auth routes as requested: sleepsomno.com/cn/auth also English
  const effectiveLang = location.pathname.includes('/auth') ? 'en' : lang;

  if (isBlocked) {
    return <BlockedView />;
  }

  return (
    <React.Fragment>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage lang={effectiveLang} onLanguageChange={setLang} />} />
      <Route path="/auth" element={<Auth lang={effectiveLang} />} />
      <Route path="/auth/login" element={<Auth lang={effectiveLang} initialView="login" />} />
      <Route path="/auth/signup" element={<Auth lang={effectiveLang} initialView="signup" />} />
      <Route path="/auth/verify" element={<AuthVerify lang={effectiveLang} />} />
      <Route path="/about" element={<AboutView lang={effectiveLang} onBack={handleBack} onNavigate={(view) => navigate(`/${view}`)} />} />
      <Route path="/contact" element={<ContactView lang={effectiveLang} onBack={handleBack} />} />
      
      {/* Blog & News */}
      <Route path="/blog" element={<BlogHub lang={effectiveLang} onSelectPost={(post) => navigate(`/blog/${post.slug}`)} />} />
      <Route path="/blog/:slug" element={<BlogPostWrapper lang={effectiveLang} />} />
      <Route path="/news" element={<NewsHub lang={effectiveLang} onSelectArticle={(article) => navigate(`/news/${article.slug}`)} />} />
      <Route path="/news/:slug" element={<ArticleWrapper lang={effectiveLang} />} />

      {/* Legal & Support */}
      <Route path="/privacy" element={<LegalView type="privacy" lang={effectiveLang} onBack={handleBack} />} />
      <Route path="/terms" element={<LegalView type="terms" lang={effectiveLang} onBack={handleBack} />} />
      <Route path="/opensource" element={<OpenSourceView lang={effectiveLang} onBack={handleBack} />} />
      <Route path="/changelog" element={<ChangelogView lang={effectiveLang} onBack={handleBack} />} />
      <Route path="/support" element={<SupportView lang={effectiveLang} onBack={handleBack} onNavigate={(view) => navigate(`/${view}`)} />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard lang={effectiveLang} />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminView lang={effectiveLang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <UserProfile lang={effectiveLang} onBack={handleBack} onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      <Route path="/feedback" element={
        <ProtectedRoute>
          <FeedbackView lang={effectiveLang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/experiment" element={
        <ProtectedRoute>
          <ExperimentView data={latestData} lang={effectiveLang} />
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <DiaryView lang={effectiveLang} />
        </ProtectedRoute>
      } />
      <Route path="/ai-assistant" element={
        <ProtectedRoute>
          <AIAssistant lang={effectiveLang} data={latestData} history={history} />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </React.Fragment>
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, loading } = useAuth();
  const [lang, setLang] = useState<Language>('en'); // Default language to English
  const [latestData, setLatestData] = useState<SleepRecord | null>(null);
  const [history, setHistory] = useState<SleepRecord[]>([]);
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    trackPageView(location.pathname, document.title);
  }, [location]);

  useEffect(() => {
    if (profile) {
      supabase.from('sleep_records')
        .select('*')
        .eq('user_id', profile.id)
        .order('date', { ascending: false })
        .then(({ data }: { data: any[] | null }) => {
          if (data && data.length > 0) {
            const mapped = data.map((d: any) => ({
              id: d.id,
              date: d.date,
              score: d.score,
              heartRate: {
                resting: d.heart_rate_resting,
                min: d.heart_rate_min,
                max: d.heart_rate_max,
                average: d.heart_rate_avg,
                history: []
              },
              deepRatio: d.deep_sleep_duration / (d.total_duration || 1),
              remRatio: d.rem_sleep_duration / (d.total_duration || 1),
              totalDuration: d.total_duration,
              efficiency: d.efficiency,
              stages: [],
              aiInsights: d.ai_insights || []
            }));
            setLatestData(mapped[0]);
            setHistory(mapped);
          }
        });
    }
  }, [profile]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(cn|en)/, '');
    navigate(`/${newLang === 'zh' ? 'cn' : 'en'}${pathWithoutLang}`);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#01040a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Neural Handshake in Progress...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-[#01040a]">
      {!isSupabaseConfigured && (
        <div className="relative w-full bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center z-[9999] shadow-xl">
          ⚠️ Supabase Configuration Missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
        </div>
      )}
      <Routes>
        <Route path="/cn/*" element={<AppRoutes lang="zh" setLang={handleLanguageChange} latestData={latestData} history={history} profile={profile} handleNavigate={handleNavigate} />} />
        <Route path="/en/*" element={<AppRoutes lang="en" setLang={handleLanguageChange} latestData={latestData} history={history} profile={profile} handleNavigate={handleNavigate} />} />
        <Route path="/*" element={<AppRoutes lang="en" setLang={handleLanguageChange} latestData={latestData} history={history} profile={profile} handleNavigate={handleNavigate} />} />
      </Routes>
      <Salesmartly />
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AnalyticsProvider>
          <Router>
            <AppContent />
          </Router>
        </AnalyticsProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
