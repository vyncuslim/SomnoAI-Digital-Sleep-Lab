import React, { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { trackPageView } from './services/analytics';
import { Language } from './types';
import { LanguageProvider } from './context/LanguageProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AnalyticsProvider } from './components/AnalyticsProvider';
import RootLayout from './components/RootLayout';
import { BLOG_POSTS, RESEARCH_ARTICLES } from './data/mockData';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HelmetProvider } from 'react-helmet-async';
import { SchemaMarkup } from './components/SchemaMarkup';

// Lazy load components with retry for chunk loading errors
const lazyWithRetry = (componentImport: () => Promise<any>) =>
  lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        // Assume that the error was caused by the routing to a new version of the app
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        window.location.reload();
        return { default: () => null }; // Return a dummy component while reloading
      }
      throw error;
    }
  });

const PersonalChat = lazyWithRetry(() => import('./components/PersonalChat').then(module => ({ default: module.PersonalChat })));
const SubscriptionManagement = lazyWithRetry(() => import('./pages/SubscriptionManagement').then(module => ({ default: module.SubscriptionManagement })));
const Auth = lazyWithRetry(() => import('./components/Auth').then(module => ({ default: module.Auth })));
const Dashboard = lazyWithRetry(() => import('./components/Dashboard').then(module => ({ default: module.Dashboard })));
const AdminView = lazyWithRetry(() => import('./components/AdminDashboard').then(module => ({ default: module.AdminDashboard })));
const UserProfile = lazyWithRetry(() => import('./components/Placeholders').then(module => ({ default: module.UserProfile })));
const FeedbackView = lazyWithRetry(() => import('./components/Placeholders').then(module => ({ default: module.FeedbackView })));
const LandingPage = lazyWithRetry(() => import('./components/LandingPage').then(module => ({ default: module.LandingPage })));
const Pricing = lazyWithRetry(() => import('./pages/Pricing'));
const About = lazyWithRetry(() => import('./pages/About').then(module => ({ default: module.About })));
const Product = lazyWithRetry(() => import('./pages/Product').then(module => ({ default: module.Product })));
const HowItWorks = lazyWithRetry(() => import('./pages/HowItWorks').then(module => ({ default: module.HowItWorks })));
const Features = lazyWithRetry(() => import('./pages/Features').then(module => ({ default: module.Features })));
const Research = lazyWithRetry(() => import('./pages/Research').then(module => ({ default: module.Research })));
const Science = lazyWithRetry(() => import('./pages/Science').then(module => ({ default: module.Science })));
const Founder = lazyWithRetry(() => import('./pages/Founder').then(module => ({ default: module.Founder })));
const FAQ = lazyWithRetry(() => import('./pages/FAQ').then(module => ({ default: module.FAQ })));
const Status = lazyWithRetry(() => import('./pages/Status').then(module => ({ default: module.Status })));
const Contact = lazyWithRetry(() => import('./pages/Contact').then(module => ({ default: module.Contact })));
const LegalHub = lazyWithRetry(() => import('./pages/LegalHub').then(module => ({ default: module.LegalHub })));
const MediaResources = lazyWithRetry(() => import('./pages/MediaResources').then(module => ({ default: module.MediaResources })));
const DynamicPage = lazyWithRetry(() => import('./pages/DynamicPage').then(module => ({ default: module.DynamicPage })));
const LegalContact = lazyWithRetry(() => import('./pages/LegalContact').then(module => ({ default: module.LegalContact })));
const Atlas = lazyWithRetry(() => import('./pages/Atlas').then(module => ({ default: module.Atlas })));
const Dreams = lazyWithRetry(() => import('./pages/Dreams').then(module => ({ default: module.Dreams })));
const Voice = lazyWithRetry(() => import('./pages/Voice').then(module => ({ default: module.Voice })));
const GenericFeature = lazyWithRetry(() => import('./pages/GenericFeature').then(module => ({ default: module.GenericFeature })));
const Trials = lazyWithRetry(() => import('./pages/Trials').then(module => ({ default: module.Trials })));
// const DiaryView = lazyWithRetry(() => import('./components/Placeholders').then(module => ({ default: module.DiaryView })));
const BlogHub = lazyWithRetry(() => import('./pages/BlogHub').then(module => ({ default: module.BlogHub })));
const BlogPostView = lazyWithRetry(() => import('./components/BlogPostView').then(module => ({ default: module.BlogPostView })));
const NewsHub = lazyWithRetry(() => import('./pages/NewsHub').then(module => ({ default: module.NewsHub })));
const ArticleView = lazyWithRetry(() => import('./components/ArticleView').then(module => ({ default: module.ArticleView })));
const ChangelogView = lazyWithRetry(() => import('./components/Placeholders').then(module => ({ default: module.ChangelogView })));
const SupportView = lazyWithRetry(() => import('./components/SupportView').then(module => ({ default: module.SupportView })));
const FounderDashboardPage = lazyWithRetry(() => import('./pages/FounderDashboardPage').then(module => ({ default: module.FounderDashboardPage })));
const SearchHub = lazyWithRetry(() => import('./components/SearchHub').then(module => ({ default: module.SearchHub })));
const BlockedView = lazyWithRetry(() => import('./components/BlockedView').then(module => ({ default: module.BlockedView })));
const LogoOnly = lazyWithRetry(() => import('./pages/LogoOnly'));

// Initial Data
// const INITIAL_SLEEP_DATA: SleepRecord = {
//   id: 'rec_7892345610',
//   date: new Date().toISOString(),
//   score: 85,
//   heartRate: {
//     resting: 58,
//     min: 52,
//     max: 110,
//     average: 65,
//     history: []
//   },
//   deepRatio: 0.18,
//   remRatio: 0.22,
//   totalDuration: 460, // minutes
//   efficiency: 0.92,
//   stages: [],
//   aiInsights: [
//     "Deep sleep duration is within optimal range.",
//     "REM cycles show good consistency.",
//     "Resting heart rate is excellent."
//   ]
// };

const BlogPostWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const post = BLOG_POSTS.find(p => p.slug === slug);
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center text-white">Post not found</div>;
  }

  return <BlogPostView post={post} lang={lang} onBack={() => navigate(`${langPrefix}/blog`)} />;
};

const ArticleWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = RESEARCH_ARTICLES.find(a => a.slug === slug);
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-white">Article not found</div>;
  }

  return <ArticleView article={article} lang={lang} onBack={() => navigate(`${langPrefix}/news`)} />;
};

interface AppRoutesProps {
  lang: Language;
  setLang: (lang: Language) => void;
  handleNavigate: (path: string) => void;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (user) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeoutReached(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (timeoutReached && !loading && !user) {
      if (window.opener) {
        window.close();
      } else {
        navigate('/auth/login?error=unverified', { replace: true });
      }
    }
  }, [timeoutReached, loading, user, navigate]);

  return (
    <div className="min-h-screen bg-[#01040a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest">Verifying Identity...</p>
      </div>
    </div>
  );
};

const AppRoutes: React.FC<AppRoutesProps> = ({
  lang,
  setLang,
  handleNavigate,
}) => {
  const navigate = useNavigate();
  const { isBlocked, blockedReason, blockCode } = useAuth();
  const langPrefix = lang === 'zh' ? '/cn' : '/en';

  const handleBack = () => navigate(-1);

  const location = useLocation();
  console.log('AppRoutes rendered for path:', location.pathname);
  if (isBlocked) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-[#01040a]" />}>
        <BlockedView reason={blockedReason} blockCode={blockCode} />
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
      <Route index element={<LandingPage lang={lang} onLanguageChange={setLang} onNavigate={handleNavigate} />} />
      <Route path="auth" element={<Auth lang={lang} />} />
      <Route path="auth/login" element={<Auth lang={lang} initialView="login" />} />
      <Route path="auth/signin" element={<Auth lang={lang} initialView="login" />} />
      <Route path="auth/signup" element={<Auth lang={lang} initialView="signup" />} />
      <Route path="auth/callback" element={<AuthCallback />} />
      <Route path="login" element={<Navigate to={`${langPrefix}/auth/login`} replace />} />
      <Route path="signup" element={<Navigate to={`${langPrefix}/auth/signup`} replace />} />
      <Route path="auth/verify" element={<AuthCallback />} />
      <Route path="auth/freeze" element={<DynamicPage lang={lang} type="account-blocking" />} />
      <Route path="about" element={<About lang={lang} />} />
      <Route path="product" element={<Product lang={lang} />} />
      <Route path="how-it-works" element={<HowItWorks lang={lang} />} />
      <Route path="features" element={<Features lang={lang} />} />
      <Route path="research" element={<Research lang={lang} />} />
      <Route path="science" element={<Science lang={lang} />} />
      <Route path="founder" element={<Founder lang={lang} />} />
      <Route path="contact" element={<Contact lang={lang} />} />
      <Route path="faq" element={<FAQ lang={lang} />} />
      <Route path="status" element={<Status lang={lang} />} />
      <Route path="search" element={<SearchHub />} />
      <Route path="logo" element={<LogoOnly />} />
      
      {/* Blog & News */}
      <Route path="blog" element={<BlogHub lang={lang} onSelectPost={(post: any) => navigate(`${langPrefix}/blog/${post.slug}`)} />} />
      <Route path="blog/:slug" element={<BlogPostWrapper lang={lang} />} />
      <Route path="news" element={<NewsHub lang={lang} onSelectArticle={(article: any) => navigate(`${langPrefix}/news/${article.slug}`)} />} />
      <Route path="news/:slug" element={<ArticleWrapper lang={lang} />} />
      <Route path="changelog" element={<ChangelogView lang={lang} onBack={handleBack} />} />

      {/* Legal & Support */}
      <Route path="legal" element={<LegalHub lang={lang} />} />
      <Route path="media" element={<MediaResources lang={lang} />} />
      <Route path="legal/privacy-policy" element={<DynamicPage lang={lang} type="privacy-policy" />} />
      <Route path="legal/terms-of-service" element={<DynamicPage lang={lang} type="terms-of-service" />} />
      <Route path="legal/cookies" element={<DynamicPage lang={lang} type="cookies" />} />
      <Route path="legal/cookie-policy" element={<Navigate to={`${langPrefix}/legal/cookies`} replace />} />
      <Route path="legal/medical-disclaimer" element={<DynamicPage lang={lang} type="medical-disclaimer" />} />
      <Route path="legal/data-handling" element={<DynamicPage lang={lang} type="data-handling" />} />
      <Route path="legal/contact" element={<LegalContact lang={lang} />} />
      <Route path="legal/data-processing" element={<Navigate to={`${langPrefix}/legal/data-handling`} replace />} />
      <Route path="legal/security" element={<DynamicPage lang={lang} type="security" />} />
      <Route path="legal/acceptable-use" element={<DynamicPage lang={lang} type="acceptable-use" />} />
      <Route path="legal/ai-disclaimer" element={<DynamicPage lang={lang} type="ai-disclaimer" />} />
      <Route path="legal/abuse-policy" element={<DynamicPage lang={lang} type="abuse-policy" />} />
      <Route path="legal/account-blocking" element={<DynamicPage lang={lang} type="account-blocking" />} />
      <Route path="legal/policy-framework" element={<DynamicPage lang={lang} type="policy-framework" />} />
      <Route path="legal/open-source" element={<DynamicPage lang={lang} type="open-source" />} />
      <Route path="legal/:type" element={<DynamicPage lang={lang} />} />
      <Route path="privacy" element={<Navigate to={`${langPrefix}/legal/privacy-policy`} replace />} />
      <Route path="terms" element={<Navigate to={`${langPrefix}/legal/terms-of-service`} replace />} />
      <Route path="policy" element={<Navigate to={`${langPrefix}/legal/policy-framework`} replace />} />
      <Route path="opensource" element={<Navigate to={`${langPrefix}/legal/open-source`} replace />} />
      <Route path="support" element={<SupportView lang={lang} />} />
      <Route path="report-abuse" element={<Navigate to={`${langPrefix}/legal/abuse-policy`} replace />} />

      {/* Protected Routes */}
      <Route path="dashboard" element={
        <ProtectedRoute lang={lang}>
          <Dashboard lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="admin" element={
        <ProtectedRoute adminOnly lang={lang}>
          <AdminView lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="founder-dashboard" element={
        <ProtectedRoute adminOnly lang={lang}>
          <FounderDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="settings" element={
        <ProtectedRoute lang={lang}>
          <UserProfile lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="pricing" element={<Pricing lang={lang} />} />
      <Route path="subscription" element={
        <ProtectedRoute lang={lang}>
          <SubscriptionManagement lang={lang} />
        </ProtectedRoute>
      } />

      <Route path="feedback" element={
        <ProtectedRoute lang={lang}>
          <FeedbackView lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="experiment" element={
        <ProtectedRoute lang={lang}>
          <Trials lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="atlas" element={
        <ProtectedRoute lang={lang}>
          <Atlas lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="dreams" element={
        <ProtectedRoute lang={lang}>
          <Dreams lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="voice" element={
        <ProtectedRoute lang={lang}>
          <Voice lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="journal" element={
        <ProtectedRoute lang={lang}>
          <GenericFeature lang={lang} onBack={handleBack} title={lang === 'zh' ? '日志' : 'Log'} description={lang === 'zh' ? '这里是睡眠日志。' : 'Welcome to your sleep log.'} />
        </ProtectedRoute>
      } />
      <Route path="personal-chat" element={
        <ProtectedRoute lang={lang}>
          <PersonalChat />
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
  const { user, isAdmin, signOut } = useAuth();
  
  // Derive language from URL
  const lang: Language = location.pathname.startsWith('/cn') ? 'zh' : 'en';
  
  const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const handleLanguageChange = (newLang: Language) => {
    const currentPath = window.location.pathname;
    const pathWithoutLang = currentPath.replace(/^\/(cn|en)/, '') || '/';
    const targetLang = newLang === 'zh' ? 'cn' : 'en';
    navigate(`/${targetLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`);
  };

  const handleNavigate = (path: string) => {
    // If it's a relative path (no leading slash), prefix it with current language
    if (!path.startsWith('/') && !path.startsWith('http')) {
      const prefix = lang === 'zh' ? '/cn' : '/en';
      navigate(`${prefix}/${path}`);
    } else if (path.startsWith('/') && !path.startsWith('/en') && !path.startsWith('/cn')) {
      // If it's an absolute path but missing language prefix, add it
      const prefix = lang === 'zh' ? '/cn' : '/en';
      navigate(`${prefix}${path}`);
    } else {
      navigate(path);
    }
  };

  const handleLogout = async () => {
    await signOut();
    const prefix = lang === 'zh' ? '/cn' : '/en';
    navigate(prefix);
  };

  const isAuthPage = location.pathname.includes('/auth');
  const showNavbar = !isAuthPage;

  const getActiveView = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    if (parts.length === 0) return 'home';
    if (parts.length === 1 && (parts[0] === 'en' || parts[0] === 'cn')) return 'home';
    return parts[parts.length - 1];
  };

  const activeView = getActiveView();

  return (
    <ErrorBoundary lang={lang}>
      <RootLayout 
        lang={lang} 
        activeView={activeView} 
        onNavigate={handleNavigate} 
        onLanguageChange={handleLanguageChange}
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        showNavbar={showNavbar}
      >
        <SchemaMarkup />
        
        {!isSupabaseConfigured && (
          <div className="fixed top-0 left-0 right-0 bg-rose-600 text-white text-[10px] font-black uppercase tracking-[0.2em] py-2 text-center z-[9999] shadow-xl">
            ⚠️ Supabase Configuration Missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.
          </div>
        )}
        
        <LanguageProvider lang={lang} setLang={handleLanguageChange}>
          {/^\/(cn|en)(\/|$)/.test(location.pathname) ? (
            <Routes>
              <Route path="/cn/*" element={<AppRoutes lang="zh" setLang={handleLanguageChange} handleNavigate={handleNavigate} />} />
              <Route path="/en/*" element={<AppRoutes lang="en" setLang={handleLanguageChange} handleNavigate={handleNavigate} />} />
            </Routes>
          ) : (
            <AppRoutes lang="en" setLang={handleLanguageChange} handleNavigate={handleNavigate} />
          )}
        </LanguageProvider>
      </RootLayout>
  </ErrorBoundary>
);
};

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <Router>
          <AnalyticsProvider>
            <AppContent />
          </AnalyticsProvider>
        </Router>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
