import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { AdminView } from './components/AdminView.tsx';
import { UserProfile } from './components/UserProfile.tsx';
import { FeedbackView } from './components/FeedbackView.tsx';
import { Auth } from './components/Auth.tsx';
import { Placeholder } from './components/Placeholder.tsx';
import { Language } from './services/i18n.ts';

function App() {
  const [lang] = useState<Language>('en');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage lang={lang} />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard lang={lang} />} />
        <Route path="/admin" element={<AdminView lang={lang} onBack={() => window.history.back()} />} />
        <Route path="/settings" element={<UserProfile lang={lang} onBack={() => window.history.back()} />} />
        <Route path="/feedback" element={<FeedbackView lang={lang} onBack={() => window.history.back()} />} />
        
        <Route path="/experiment" element={<Placeholder title="Experiment" />} />
        <Route path="/journal" element={<Placeholder title="Journal" />} />
        <Route path="/ai-assistant" element={<Placeholder title="AI Assistant" />} />
        
        <Route path="/about" element={<Placeholder title="About Us" />} />
        <Route path="/blog" element={<Placeholder title="Blog" />} />
        <Route path="/contact" element={<Placeholder title="Contact" />} />
        <Route path="/opensource" element={<Placeholder title="Open Source" />} />
        <Route path="/changelog" element={<Placeholder title="Changelog" />} />
        <Route path="/privacy" element={<Placeholder title="Privacy Policy" />} />
        <Route path="/terms" element={<Placeholder title="Terms of Service" />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
