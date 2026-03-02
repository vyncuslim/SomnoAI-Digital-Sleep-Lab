import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Language } from '../types.ts';
import { Lock, User, Mail, ArrowRight } from 'lucide-react';

interface AuthProps {
  lang: Language;
  initialView?: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ lang, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const navigate = useNavigate();

  const toggleView = () => setView(view === 'login' ? 'signup' : 'login');

  return (
    <div className="min-h-screen bg-[#01040a] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {view === 'login' ? 'Account Login' : 'Create an Account'}
          </h1>
          <p className="text-sm text-slate-400">
            {view === 'login' 
              ? 'Access your SomnoAI Digital Sleep Lab account to view personalized insights and manage your data.' 
              : 'Register to access the SomnoAI platform. By creating an account, you agree to our Terms of Service and Privacy Policy.'}
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                className="w-full bg-black/20 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="button"
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group"
          >
            {view === 'login' ? 'Sign In' : 'Create Account'}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 mb-4">
            {view === 'login' 
              ? 'Unauthorized access attempts may result in automatic blocking for security reasons.' 
              : 'Users are responsible for maintaining the confidentiality of their credentials.'}
          </p>
          <button 
            onClick={toggleView}
            className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            {view === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
