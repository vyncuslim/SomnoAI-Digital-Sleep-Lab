import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService.ts';
import { GlassCard } from './GlassCard.tsx';
import { Loader2, Mail, Lock, Zap, User, Apple } from 'lucide-react';
import { Language, translations } from '../services/i18n.ts';

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
  const navigate = useNavigate();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(lang === 'zh' ? '请输入您的电子邮件地址。' : 'Please enter your email address.');
      return;
    }

    if (view === 'signup' && !fullName) {
      setError(lang === 'zh' ? '请输入您的全名。' : 'Please enter your full name.');
      return;
    }

    setLoading(true);
    setError(null);

    // Check if user is already blocked before attempting login
    try {
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
          data: { full_name: fullName }
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
      if (!password) {
        setError(lang === 'zh' ? '请输入您的密码。' : 'Please enter your password.');
        setLoading(false);
        return;
      }
      
      if (view === 'signup') {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) {
          setError(error.message);
          await supabase.rpc('report_failed_login', { target_email: email });
        } else {
          navigate(`/auth/verify?email=${encodeURIComponent(email)}&type=signup`);
        }
      } else {
        const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password });

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
            onClick={() => setMode('otp')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'otp' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {t.otpMode}
          </button>
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${mode === 'password' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {t.passwordMode}
          </button>
        </div>

        <form onSubmit={handleRequestToken} className="space-y-4">
          <div className="space-y-4">
            {view === 'signup' && (
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="text"
                  placeholder={t.fullName}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-indigo-500 outline-none transition-colors text-sm font-medium placeholder-slate-600"
                  required
                />
              </div>
            )}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
              <input
                type="email"
                placeholder={t.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-indigo-500 outline-none transition-colors text-sm font-medium placeholder-slate-600"
                required
              />
            </div>
            
            {mode === 'password' && (
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="password"
                  placeholder={t.password}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl pl-12 pr-4 py-4 focus:border-indigo-500 outline-none transition-colors text-sm font-medium placeholder-slate-600"
                  required
                />
              </div>
            )}
          </div>

          {error && <p className="text-rose-500 text-xs font-mono text-center bg-rose-500/10 py-2 rounded border border-rose-500/20">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] group"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                <Zap size={16} className="group-hover:text-yellow-300 transition-colors" />
                {view === 'login' ? t.loginBtn : t.signupBtn}
              </>
            )}
          </button>
          
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setView(view === 'login' ? 'signup' : 'login')}
              className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-indigo-400 transition-colors"
            >
              {view === 'login' ? t.toSignup : t.toLogin}
            </button>
          </div>
          
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-3 border border-white/5"
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
            SomnoAI Sleep Lab • Neural Unix Access
          </p>
        </div>
      </GlassCard>
    </div>
  );
};
