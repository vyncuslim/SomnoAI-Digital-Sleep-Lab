import React from 'react';
import { Navbar } from './Navbar';
import Footer from './Footer';
import { Language } from '../types';

interface RootLayoutProps {
  children: React.ReactNode;
  lang: Language;
  activeView: string;
  onNavigate: (view: string) => void;
  onLanguageChange: (lang: Language) => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const RootLayout: React.FC<RootLayoutProps> = ({ 
  children, 
  lang, 
  activeView, 
  onNavigate, 
  onLanguageChange,
  isAuthenticated, 
  isAdmin,
  onLogout 
}) => {
  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 flex flex-col">
      <Navbar 
        lang={lang}
        activeView={activeView}
        onNavigate={onNavigate}
        onLanguageChange={onLanguageChange}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={onLogout}
      />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 py-8">
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default RootLayout;
