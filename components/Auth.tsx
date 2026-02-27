import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService.ts';
import { GlassCard } from './GlassCard.tsx';
import { Loader2, Mail, Lock, Zap, User, Apple, AlertCircle } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';
import { Turnstile } from '@marsidev/react-turnstile';
import { motion, AnimatePresence } from 'framer-motion';

interface AuthProps {
  lang?: Language;
  initialView?: 'login' | 'signup';
}

export const Auth: React.FC<AuthProps> = ({ lang = 'en', initialView = 'login' }) => {
  const t = translations[lang]?.auth || translations.en.auth;
  const [mode, setMode] = useState<'otp' | 'password'>('otp');
  const [view, setView] = useState<'login' | 'signup'>(initialView);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateForm = () => {
    const errors: { email?: string; password?: string; fullName?: string } = {};
    let isValid = true;

    if (!email) {
      errors.email = t.emailRequired || 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t.emailInvalid || 'Invalid email format';
      isValid = false;
    }

    if (view === 'signup' && !fullName) {
      errors.fullName = t.nameRequired || 'Full name is required';
      isValid = false;
    }

    if (mode === 'password') {
      if (!password) {
        errors.password = t.passwordRequired || 'Password is required';
        isValid = false;
      } else if (password.length < 6) {
        errors.password = t.passwordTooShort || 'Password must be at least 6 characters';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!captchaToken) {
      setError(t.captchaRequired || 'Please complete the verification');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user is already blocked before attempting login
      const { data: profile } = await supabase.from('profiles').select('is_blocked').eq('email', email).single();
      if (profile?.is_blocked) {
        setError(t.blocked);
        setLoading(false);
        return;
      }
    } catch (e) {
      // Ignore error if profile doesn't exist yet
    }

    if (mode === 'otp') {
      const { error } = await (supabase.auth as any).signInWithOtp({ 
        email,
        options: {
          data: { full_name: fullName },
          captchaToken
        }
      });
      if (error) {
        setError(error.message);
        await supabase.rpc('report_failed_login', { target_email: email });
      } else {
        navigate(`/auth/verify?email=${encodeURIComponent(email)}${fullName ? `&name=${encodeURIComponent(fullName)}` : ''}`);
      }
    } else {
      // Password mode
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName },
            captchaToken
          }
        });
        if (error) {
          setError(error.message);
          await supabase.rpc('report_failed_login', { target_email: email });
        } else {
          navigate(`/auth/verify?email=${encodeURIComponent(email)}&type=signup`);
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken } } as any);

        if (signInData.user) {
          const { data: profile } = await supabase.from('profiles').select('is_blocked').eq('id', signInData.user.id).single();
          if (profile?.is_blocked) {
            await supabase.auth.signOut();
            setError(t.blocked);
            setLoading(false);
            return;
          }
          await supabase.rpc('reset_login_attempts', { target_email: email });
          navigate('/dashboard');
        }
        if (error) {
          setError(error.message);
          await supabase.rpc('report_failed_login', { target_email: email });
        } else {
           // Check if blocked after successful login just in case
           const { data: profile } = await supabase.from('profiles').select('is_blocked').eq('email', email).single();
           if (profile?.is_blocked) {
             await supabase.auth.signOut();
             setError(t.blocked);
             setLoading(false);
             return;
           }
           await supabase.rpc('reset_login_attempts', { target_email: email });
           navigate('/dashboard');
        }
      }
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setError(lang === 'zh' ? '配置错误：缺少 Supabase URL。请检查 Vercel 环境变量设置。' : 'Configuration Error: Missing Supabase URL. Please check Vercel environment variables.');
      return;
    }
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <GlassCard className="p-8 w-full max-w-md border-white/10 relative z-10 backdrop-blur-xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">SomnoAI <span className="text-indigo-500">Digital Sleep Lab</span></h2>
          <p className="text-slate-500 text-[10px] uppercase tracking-[0.3em] font-bold">{view === 'login' ? t.loginTitle : t.signupTitle}</p>
        </div>
        
        <div className="flex p-1 bg-white/5 rounded-xl mb-8">
          <button
            onClick={() => { setMode('otp'); setFieldErrors({}); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'otp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {t.otpMode}
          </button>
          <button
            onClick={() => { setMode('password'); setFieldErrors({}); setError(null); }}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {t.passwordMode}
          </button>
        </div>

        <form onSubmit={handleRequestToken} className="space-y-4">
          <AnimatePresence mode="wait">
            <div className="space-y-4">
              {view === 'signup' && (
                <motion.div 
                  key="fullname"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative group"
                >
                  <User className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.fullName ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-indigo-400'}`} size={18} />
                  <input
                    type="text"
                    placeholder={t.fullName}
                    value={fullName}
                    onChange={(e) => { setFullName(e.target.value); if (fieldErrors.fullName) setFieldErrors({...fieldErrors, fullName: undefined}); }}
                    className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-4 outline-none transition-colors text-sm font-medium placeholder-slate-600 ${fieldErrors.fullName ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'}`}
                    disabled={loading}
                  />
                  <AnimatePresence>
                    {fieldErrors.fullName && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-rose-500 text-[10px] font-mono mt-1 ml-1 flex items-center gap-1"
                      >
                        <AlertCircle size={10} /> {fieldErrors.fullName}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              
              <motion.div 
                key="email"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="relative group"
              >
                <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-indigo-400'}`} size={18} />
                <input
                  type="email"
                  placeholder={t.email}
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (fieldErrors.email) setFieldErrors({...fieldErrors, email: undefined}); }}
                  className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-4 outline-none transition-colors text-sm font-medium placeholder-slate-600 ${fieldErrors.email ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'}`}
                  disabled={loading}
                />
                <AnimatePresence>
                  {fieldErrors.email && (
                    <motion.p 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-rose-500 text-[10px] font-mono mt-1 ml-1 flex items-center gap-1"
                    >
                      <AlertCircle size={10} /> {fieldErrors.email}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {mode === 'password' && (
                <motion.div 
                  key="password"
                  variants={inputVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="relative group"
                >
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-rose-500' : 'text-slate-500 group-focus-within:text-indigo-400'}`} size={18} />
                  <input
                    type="password"
                    placeholder={t.password}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); if (fieldErrors.password) setFieldErrors({...fieldErrors, password: undefined}); }}
                    className={`w-full bg-black/40 border rounded-xl pl-12 pr-4 py-4 outline-none transition-colors text-sm font-medium placeholder-slate-600 ${fieldErrors.password ? 'border-rose-500/50 focus:border-rose-500' : 'border-white/10 focus:border-indigo-500'}`}
                    disabled={loading}
                  />
                  <AnimatePresence>
                    {fieldErrors.password && (
                      <motion.p 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-rose-500 text-[10px] font-mono mt-1 ml-1 flex items-center gap-1"
                      >
                        <AlertCircle size={10} /> {fieldErrors.password}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>
          </AnimatePresence>

          <div className="flex justify-center my-4">
            <Turnstile
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || '0x4AAAAAACNi1FM3bbfW_VsI'}
              onSuccess={(token) => setCaptchaToken(token)}
              options={{
                theme: 'dark',
              }}
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-rose-500 text-xs font-mono text-center bg-rose-500/10 py-2 rounded border border-rose-500/20 overflow-hidden"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            type="submit"
            disabled={loading || !captchaToken}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] group relative overflow-hidden"
          >
            {loading && (
              <div className="absolute inset-0 bg-indigo-700/50 flex items-center justify-center z-10">
                 <Loader2 className="animate-spin" />
              </div>
            )}
            <span className={loading ? 'opacity-0' : 'opacity-100 flex items-center gap-2'}>
              <Zap size={16} className="group-hover:text-yellow-300 transition-colors" />
              {view === 'login' ? t.loginBtn : t.signupBtn}
            </span>
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setFieldErrors({}); setError(null); }}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
              disabled={loading}
            >
              {view === 'login' ? t.toSignup : t.toLogin}
            </button>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-3 border border-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {t.googleBtn}
            </button>

            <div className="w-full py-4 bg-white/5 opacity-50 cursor-not-allowed rounded-xl font-bold text-[10px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 border border-white/5 text-slate-500">
              <div className="flex items-center gap-2">
                <Apple size={16} />
                Continue with Apple
              </div>
              <span className="text-[8px] text-rose-500 font-black">{t.appleWarning}</span>
            </div>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">
            SomnoAI Digital Sleep Lab • Neural Unix Access
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
