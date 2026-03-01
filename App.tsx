import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { trackPageView } from './services/analytics.ts';
import { Language } from './types.ts';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import { AnalyticsProvider } from './components/AnalyticsProvider.tsx';
import { supabase } from './services/supabaseService.ts';
import { SleepRecord } from './types.ts';
import { BLOG_POSTS, RESEARCH_ARTICLES } from './data/mockData.ts';

// Lazy load components
const Auth = lazy(() => import('./components/Auth.tsx').then(module => ({ default: module.Auth })));
const AuthVerify = lazy(() => import('./components/AuthVerify.tsx').then(module => ({ default: module.AuthVerify })));
const Dashboard = lazy(() => import('./components/Dashboard.tsx').then(module => ({ default: module.Dashboard })));
const AdminView = lazy(() => import('./components/AdminView.tsx').then(module => ({ default: module.AdminView })));
const UserProfile = lazy(() => import('./components/UserProfile.tsx').then(module => ({ default: module.UserProfile })));
const FeedbackView = lazy(() => import('./components/FeedbackView.tsx').then(module => ({ default: module.FeedbackView })));
const LandingPage = lazy(() => import('./components/LandingPage.tsx').then(module => ({ default: module.LandingPage })));
const AboutView = lazy(() => import('./components/AboutView.tsx').then(module => ({ default: module.AboutView })));
const ContactView = lazy(() => import('./components/ContactView.tsx').then(module => ({ default: module.ContactView })));
const AIAssistant = lazy(() => import('./components/AIAssistant.tsx').then(module => ({ default: module.AIAssistant })));
const ExperimentView = lazy(() => import('./components/ExperimentView.tsx').then(module => ({ default: module.ExperimentView })));
const DiaryView = lazy(() => import('./components/DiaryView.tsx').then(module => ({ default: module.DiaryView })));
const BlogHub = lazy(() => import('./components/BlogHub.tsx').then(module => ({ default: module.BlogHub })));
const BlogPostView = lazy(() => import('./components/BlogPostView.tsx').then(module => ({ default: module.BlogPostView })));
const NewsHub = lazy(() => import('./components/NewsHub.tsx').then(module => ({ default: module.NewsHub })));
const ArticleView = lazy(() => import('./components/ArticleView.tsx').then(module => ({ default: module.ArticleView })));
const OpenSourceView = lazy(() => import('./components/OpenSourceView.tsx').then(module => ({ default: module.OpenSourceView })));
const ChangelogView = lazy(() => import('./components/ChangelogView.tsx').then(module => ({ default: module.ChangelogView })));
const LegalView = lazy(() => import('./components/LegalView.tsx').then(module => ({ default: module.LegalView })));
const SupportView = lazy(() => import('./components/SupportView.tsx').then(module => ({ default: module.SupportView })));
const FAQView = lazy(() => import('./components/FAQView.tsx').then(module => ({ default: module.FAQView })));
const ScienceView = lazy(() => import('./components/ScienceView.tsx').then(module => ({ default: module.ScienceView })));
const BlockedView = lazy(() => import('./components/BlockedView.tsx').then(module => ({ default: module.BlockedView })));

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
    return <Navigate to="/auth/signin" replace />;
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

  if (isBlocked) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#01040a]" />}>
        <BlockedView />
      </Suspense>
    );
  }

  return (
    <React.Fragment>
    <Suspense fallback={
      <div className="min-h-screen bg-[#01040a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage lang={lang} onLanguageChange={setLang} />} />
      <Route path="/auth" element={<Auth lang={lang} />} />
      <Route path="/auth/login" element={<Auth lang={lang} initialView="login" />} />
      <Route path="/auth/signin" element={<Auth lang={lang} initialView="login" />} />
      <Route path="/auth/signup" element={<Auth lang={lang} initialView="signup" />} />
      <Route path="/auth/verify" element={<AuthVerify lang={lang} />} />
      <Route path="/about" element={<AboutView lang={lang} onBack={handleBack} onNavigate={(view) => navigate(`/${view}`)} />} />
      <Route path="/contact" element={<ContactView lang={lang} onBack={handleBack} />} />
      <Route path="/faq" element={<FAQView lang={lang} onBack={handleBack} />} />
      <Route path="/science" element={<ScienceView lang={lang} onBack={handleBack} />} />
      
      {/* Blog & News */}
      <Route path="/blog" element={<BlogHub lang={lang} onSelectPost={(post) => navigate(`/blog/${post.slug}`)} />} />
      <Route path="/blog/:slug" element={<BlogPostWrapper lang={lang} />} />
      <Route path="/news" element={<NewsHub lang={lang} onSelectArticle={(article) => navigate(`/news/${article.slug}`)} />} />
      <Route path="/news/:slug" element={<ArticleWrapper lang={lang} />} />

      {/* Legal & Support */}
      <Route path="/privacy" element={<LegalView type="privacy" lang={lang} onBack={handleBack} />} />
      <Route path="/terms" element={<LegalView type="terms" lang={lang} onBack={handleBack} />} />
      <Route path="/opensource" element={<OpenSourceView lang={lang} onBack={handleBack} />} />
      <Route path="/changelog" element={<ChangelogView lang={lang} onBack={handleBack} />} />
      <Route path="/support" element={<SupportView lang={lang} onBack={handleBack} onNavigate={(view) => navigate(`/${view}`)} />} />

      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminView lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <UserProfile lang={lang} onBack={handleBack} onNavigate={handleNavigate} />
        </ProtectedRoute>
      } />

      <Route path="/feedback" element={
        <ProtectedRoute>
          <FeedbackView lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/experiment" element={
        <ProtectedRoute>
          <ExperimentView data={latestData} lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <DiaryView lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="/ai-assistant" element={
        <ProtectedRoute>
          <AIAssistant lang={lang} data={latestData} history={history} />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
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
