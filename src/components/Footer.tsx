import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
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
  );
};
