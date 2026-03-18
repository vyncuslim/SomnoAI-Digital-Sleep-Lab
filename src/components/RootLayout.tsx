import React, { useState } from 'react';
import { Navbar } from './Navbar';
import Footer from './Footer';
import { Language } from '../types';
import { X } from 'lucide-react';

interface RootLayoutProps {
  children: React.ReactNode;
  lang: Language;
  activeView: string;
  onNavigate: (view: string) => void;
  onLanguageChange: (lang: Language) => void;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  showNavbar?: boolean;
}

const RootLayout: React.FC<RootLayoutProps> = ({ 
  children, 
  lang, 
  activeView, 
  onNavigate, 
  onLanguageChange,
  isAuthenticated, 
  isAdmin,
  onLogout,
  showNavbar = true
}) => {
  const [showBanner, setShowBanner] = useState(true);

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-200 flex flex-col">
      {showBanner && (
        <a 
          href="https://docs.google.com/forms/d/e/1FAIpQLSf1LB5wOAUW8PioG5HiUW8MYC_a9_Rp4Eb9wjYpaQM2U9SJ4A/viewform"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed top-0 left-0 right-0 h-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center z-[9999] shadow-xl hover:brightness-110 transition-all"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span>Join SomnoAI Digital Sleep Lab Early Access — Limited Beta Access</span>
          </div>
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowBanner(false);
            }}
            className="absolute right-4 text-white/70 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full cursor-pointer"
          >
            <X size={12} />
          </div>
        </a>
      )}

      {showNavbar && (
        <Navbar 
          lang={lang}
          activeView={activeView}
          onNavigate={onNavigate}
          onLanguageChange={onLanguageChange}
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          onLogout={onLogout}
          className={`transition-all duration-300 ${showBanner ? '!top-8' : '!top-0'}`}
        />
      )}
      
      <main className={`flex-grow w-full max-w-7xl mx-auto px-4 md:px-8 transition-all duration-300 ${showNavbar ? (showBanner ? "pt-36" : "pt-28") : (showBanner ? "pt-16" : "pt-8")} pb-12`}>
        {children}
      </main>
      <Footer lang={lang} />
    </div>
  );
};

export default RootLayout;
