import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome, Brain, ShieldCheck } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Language, getTranslation } from '../services/i18n';
import { Logo } from './Logo';
import { supabase } from '../services/supabaseService';

interface AuthProps {
  lang: Language;
  initialView?: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ lang, initialView = 'login' }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const t = getTranslation(lang, 'landing');

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (authError) throw authError;
        navigate('/dashboard');
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          },
        });
        if (authError) throw authError;
        // For demo/simplicity, we'll just navigate to dashboard if no error
        // In a real app, we might show a "check your email" message, 
        // but the user explicitly asked to remove "Verify Email" messages.
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden grainy-bg">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <Logo className="mb-6 scale-125" />
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {view === 'login' ? (lang === 'zh' ? '欢迎回来' : 'Welcome Back') : (lang === 'zh' ? '加入实验室' : 'Join the Lab')}
          </h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2">
            SomnoAI Digital Sleep Lab • Neural Access
          </p>
        </div>

        <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 shadow-2xl" intensity="high">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' ? (lang === 'zh' ? '登录' : 'Sign In') : (lang === 'zh' ? '注册' : 'Create Account')}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/5"></div>
            </div>
            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
              <span className="bg-[#0f172a] px-4 text-slate-600">Or Continue With</span>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <Github size={18} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-3 py-3 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all">
              <Chrome size={18} className="text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Google</span>
            </button>
          </div>
        </GlassCard>

        <div className="mt-10 text-center space-y-4">
          <p className="text-sm text-slate-500">
            {view === 'login' ? (lang === 'zh' ? '还没有账户？' : "Don't have an account?") : (lang === 'zh' ? '已经有账户了？' : "Already have an account?")}{' '}
            <button 
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
            >
              {view === 'login' ? (lang === 'zh' ? '立即注册' : 'Sign Up') : (lang === 'zh' ? '立即登录' : 'Sign In')}
            </button>
          </p>
          <button 
            onClick={() => navigate('/')}
            className="text-[10px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-[0.3em] transition-all"
          >
            ← Back to Laboratory
          </button>
        </div>

        <div className="mt-12 flex items-center justify-center gap-8 opacity-20 grayscale">
          <ShieldCheck size={20} />
          <Brain size={20} />
          <div className="h-4 w-px bg-white/20" />
          <span className="text-[8px] font-mono uppercase tracking-widest">AES-256 Encrypted</span>
        </div>
      </motion.div>
    </div>
  );
};
