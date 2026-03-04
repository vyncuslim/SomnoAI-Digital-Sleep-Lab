import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from '../Logo';
import { Search, ChevronDown, ArrowRight } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, sidebar }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#01040a] text-slate-300 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#01040a]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <Logo showText={true} className="scale-75 origin-left" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <Link to="/product" className="hover:text-white transition-colors">Product</Link>
              <Link to="/research" className="hover:text-white transition-colors">Research</Link>
              <Link to="/features" className="hover:text-white transition-colors">Features</Link>
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-white transition-colors">
                Company <ChevronDown size={14} />
                <div className="absolute top-full left-0 pt-4 hidden group-hover:block">
                  <div className="bg-slate-900 border border-white/10 rounded-xl p-2 w-48 shadow-2xl flex flex-col gap-1">
                    <Link to="/about" className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">About Us</Link>
                    <Link to="/blog" className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">Blog</Link>
                    <Link to="/news" className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">News</Link>
                    <Link to="/contact" className="px-3 py-2 hover:bg-white/5 rounded-lg transition-colors">Contact</Link>
                  </div>
                </div>
              </div>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Search size={18} />
            </button>
            <Link to="/auth/signup" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-full transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]">
              Get Started <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-12">
        <div className={`flex-grow ${sidebar ? 'lg:w-3/4' : 'w-full'}`}>
          {children}
        </div>
        {sidebar && (
          <aside className="w-full lg:w-1/4 flex-shrink-0">
            <div className="sticky top-24">
              {sidebar}
            </div>
          </aside>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#01040a] py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Logo showText={true} className="scale-75 origin-left" />
            <p className="text-sm text-slate-500 leading-relaxed">
              Research-driven technology initiative exploring how AI and data analysis can deepen the understanding of human sleep.
            </p>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/product" className="hover:text-white transition-colors">Product Overview</Link></li>
              <li><Link to="/how-it-works" className="hover:text-white transition-colors">How it Works</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link to="/status" className="hover:text-white transition-colors">System Status</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Resources</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/research" className="hover:text-white transition-colors">Research</Link></li>
              <li><Link to="/science" className="hover:text-white transition-colors">Science</Link></li>
              <li><Link to="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-medium mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link to="/legal" className="hover:text-white transition-colors">Legal Center</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/support" className="hover:text-white transition-colors">Support</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} SomnoAI Digital Sleep Lab. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="https://github.com/vyncuslim/SomnoAI-Digital-Sleep-Lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://discord.com/invite/9EXJtRmju" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
            <a href="https://www.linkedin.com/company/somnoai-digital-sleep-lab" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
