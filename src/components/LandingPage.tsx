import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Language } from '../types.ts';
import { ArrowRight, Activity, Moon, Shield } from 'lucide-react';

interface LandingPageProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ lang, onLanguageChange }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#01040a] text-white font-sans selection:bg-indigo-500/30">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#01040a]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Moon className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">SomnoAI</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="/product" className="hover:text-white transition-colors">Product</a>
            <a href="/research" className="hover:text-white transition-colors">Research</a>
            <a href="/about" className="hover:text-white transition-colors">About</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/auth/login')}
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button 
              onClick={() => navigate('/auth/signup')}
              className="bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-500"
          >
            Sleep Intelligence<br />Redefined.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            SomnoAI Digital Sleep Lab integrates physiological monitoring, AI deep insights, and health recommendations to provide users with a comprehensive digital sleep laboratory experience.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button 
              onClick={() => navigate('/auth/signup')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-lg transition-all flex items-center gap-2 group"
            >
              Get Started <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/how-it-works')}
              className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold text-lg transition-all"
            >
              How it Works
            </button>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <Activity className="w-10 h-10 text-emerald-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Deep Analysis</h3>
            <p className="text-slate-400 leading-relaxed">
              Advanced algorithms process your sleep data to identify patterns and anomalies that standard trackers miss.
            </p>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <Shield className="w-10 h-10 text-indigo-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Privacy First</h3>
            <p className="text-slate-400 leading-relaxed">
              Your physiological data is encrypted and processed with strict adherence to security protocols.
            </p>
          </div>
          <div className="p-8 bg-white/5 border border-white/10 rounded-3xl">
            <Moon className="w-10 h-10 text-purple-400 mb-6" />
            <h3 className="text-xl font-bold text-white mb-3">Recovery Focus</h3>
            <p className="text-slate-400 leading-relaxed">
              Understand your recovery cycles to optimize performance and overall well-being.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 bg-[#01040a]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="font-bold text-white mb-4">Platform</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="/product" className="hover:text-indigo-400 transition-colors">Overview</a></li>
              <li><a href="/features" className="hover:text-indigo-400 transition-colors">Features</a></li>
              <li><a href="/how-it-works" className="hover:text-indigo-400 transition-colors">How it Works</a></li>
              <li><a href="/status" className="hover:text-indigo-400 transition-colors">System Status</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="/about" className="hover:text-indigo-400 transition-colors">About Us</a></li>
              <li><a href="/blog" className="hover:text-indigo-400 transition-colors">Blog</a></li>
              <li><a href="/contact" className="hover:text-indigo-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="/legal/privacy" className="hover:text-indigo-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/terms" className="hover:text-indigo-400 transition-colors">Terms of Service</a></li>
              <li><a href="/legal/security" className="hover:text-indigo-400 transition-colors">Security</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Support</h4>
            <ul className="space-y-2 text-slate-500">
              <li><a href="/support" className="hover:text-indigo-400 transition-colors">Help Center</a></li>
              <li><a href="/faq" className="hover:text-indigo-400 transition-colors">FAQ</a></li>
              <li><a href="/report-abuse" className="hover:text-indigo-400 transition-colors">Report Abuse</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-center text-xs text-slate-600">
          <p>© {new Date().getFullYear()} SomnoAI Digital Sleep Lab. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
