import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { Auth } from './components/Auth.tsx';
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
import { Language } from './services/i18n.ts';
import { SleepRecord } from './types.ts';
import { MOCK_BLOG_POSTS, MOCK_RESEARCH } from './data/mockData.ts';

// Mock Data for Demo Purposes
const MOCK_SLEEP_DATA: SleepRecord = {
  id: 'demo-record-1',
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
  const post = MOCK_BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center text-white">Post not found</div>;
  }

  return <BlogPostView post={post} lang={lang} onBack={() => navigate('/blog')} />;
};

const ArticleWrapper: React.FC<{ lang: Language }> = ({ lang }) => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const article = MOCK_RESEARCH.find(a => a.slug === slug);

  if (!article) {
    return <div className="min-h-screen flex items-center justify-center text-white">Article not found</div>;
  }

  return <ArticleView article={article} lang={lang} onBack={() => navigate('/news')} />;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-[#01040a] flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 animate-pulse">Initializing Neural Link...</p>
      </div>
    );
  }
  
  if (!profile) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const [lang, setLang] = useState<Language>('en');
  const navigate = useNavigate();

  // Helper to handle back navigation
  const handleBack = () => navigate(-1);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage lang={lang} onLanguageChange={setLang} />} />
      <Route path="/auth" element={<Auth lang={lang} />} />
      <Route path="/about" element={<AboutView lang={lang} onBack={handleBack} onNavigate={(view) => navigate(`/${view}`)} />} />
      <Route path="/contact" element={<ContactView lang={lang} onBack={handleBack} />} />
      
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
          <UserProfile lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/feedback" element={
        <ProtectedRoute>
          <FeedbackView lang={lang} onBack={handleBack} />
        </ProtectedRoute>
      } />
      <Route path="/experiment" element={
        <ProtectedRoute>
          <ExperimentView data={MOCK_SLEEP_DATA} lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="/journal" element={
        <ProtectedRoute>
          <DiaryView lang={lang} />
        </ProtectedRoute>
      } />
      <Route path="/ai-assistant" element={
        <ProtectedRoute>
          <AIAssistant lang={lang} data={MOCK_SLEEP_DATA} />
        </ProtectedRoute>
      } />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
