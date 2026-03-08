import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome, Brain, ShieldCheck, ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { HardwareButton, TechnicalLabel } from './ui/Components';
import { Language, getTranslation } from '../services/i18n';
import { Logo } from './Logo';
import { supabase } from '../services/supabaseService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/useLanguage';
import { notificationService } from '../services/notificationService';

interface AuthProps {
  lang: Language;
  initialView?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'otp';

export const Auth: React.FC<AuthProps> = ({ lang, initialView = 'login' }) => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { langPrefix } = useLanguage();
  const [view, setView] = useState<AuthView>(initialView);
  
  // Sync view with initialView prop when it changes (e.g. via routing)
  React.useEffect(() => {
    if (initialView === 'login' || initialView === 'signup') {
      setView(initialView);
    }
  }, [initialView]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsApproved, setTermsApproved] = useState(false);
  const [privacyApproved, setPrivacyApproved] = useState(false);
  const [isRobotChecked, setIsRobotChecked] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const t = getTranslation(lang, 'landing');

  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmit called', { view, email, termsApproved });
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if ((view === 'signup' || view === 'login') && (!termsApproved || !privacyApproved)) {
        throw new Error('You must approve the Terms of Service and Privacy Policy.');
      }

      if ((view === 'signup' || view === 'login') && !isRobotChecked) {
        throw new Error('Please confirm you are not a robot.');
      }

      if (view === 'signup') {
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
      }

      if (view === 'login') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (signInError) throw signInError;
        
        // Send login notification
        notificationService.sendLoginNotification(email);
        
        navigate(`${langPrefix}/dashboard`);
      } else if (view === 'signup') {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (signUpError) throw signUpError;
        
        navigate(`${langPrefix}/dashboard`);
      } else if (view === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
        
        if (resetError) throw resetError;
        
        setSuccessMessage(lang === 'zh' ? '重置链接已发送到您的邮箱。' : 'Password reset link sent to your email.');
      } else if (view === 'otp') {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        
        if (otpError) throw otpError;
        
        setSuccessMessage(lang === 'zh' ? '登录链接已发送到您的邮箱，请查收。' : 'Magic link sent to your email. Check your inbox to log in.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      // Report failed login to Supabase if it's a login attempt
      if (view === 'login') {
        try {
          await supabase.rpc('report_failed_login', { target_email: email });
        } catch (rpcErr) {
          console.error('Failed to report login attempt:', rpcErr);
        }
      }

      // Make error messages more user-friendly
      let errorMessage = err.message || 'Authentication failed';
      
      if (err.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message === 'User already registered') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.message && err.message.includes('Password should be at least')) {
        errorMessage = 'Password should be at least 6 characters.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}${langPrefix}/dashboard`
        }
      });
      
      if (error) throw error;
      
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === 'login') return lang === 'zh' ? '欢迎回来' : 'Welcome Back';
    if (view === 'signup') return lang === 'zh' ? '加入实验室' : 'Join the Lab';
    if (view === 'forgot-password') return lang === 'zh' ? '重置密码' : 'Reset Password';
    if (view === 'otp') return lang === 'zh' ? '无密码登录' : 'Passwordless Login';
    return '';
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden grainy-bg">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-12">
          <Link to={langPrefix}>
            <Logo className="mb-6 scale-125" />
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
            {getTitle()}
          </h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2">
            SomnoAI Digital Sleep Lab • Neural Access
          </p>
        </div>

        <GlassCard className="p-10 rounded-[3rem] border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl" intensity="high">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold uppercase tracking-widest text-center animate-in fade-in slide-in-from-top-2">
              {successMessage}
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

            {(view === 'login' || view === 'signup') && (
              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4 mr-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Password</label>
                  {view === 'login' && (
                    <button 
                      type="button"
                      onClick={() => setView('forgot-password')}
                      className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                    >
                      {lang === 'zh' ? '忘记密码？' : 'Forgot Password?'}
                    </button>
                  )}
                </div>
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
            )}

            {(view === 'login' || view === 'signup') && (
              <div className="space-y-3 ml-2">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsApproved}
                    onChange={(e) => setTermsApproved(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                    required
                  />
                  <label htmlFor="terms" className="text-xs text-slate-400">
                    {lang === 'zh' ? '我同意' : 'I agree to the'} <Link to={`${langPrefix}/legal/terms-of-service`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{lang === 'zh' ? '服务条款' : 'Terms of Service'}</Link>.
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="privacy"
                    checked={privacyApproved}
                    onChange={(e) => setPrivacyApproved(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                    required
                  />
                  <label htmlFor="privacy" className="text-xs text-slate-400">
                    {lang === 'zh' ? '我同意' : 'I agree to the'} <Link to={`${langPrefix}/legal/privacy-policy`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">{lang === 'zh' ? '隐私政策' : 'Privacy Policy'}</Link>.
                  </label>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="robot-check"
                    checked={isRobotChecked}
                    onChange={(e) => setIsRobotChecked(e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-indigo-500 focus:ring-offset-0"
                    required
                  />
                  <label htmlFor="robot-check" className="text-xs text-slate-400">
                    {lang === 'zh' ? '我不是机器人' : 'I am not a robot'}
                  </label>
                </div>
              </div>
            )}

            {view === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={18} />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                {password && (
                  <div className="px-4 pt-2">
                    <div className="flex gap-1 h-1 mb-1">
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-800'}`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 2 ? 'bg-orange-500' : 'bg-slate-800'}`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 3 ? 'bg-yellow-500' : 'bg-slate-800'}`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 4 ? 'bg-lime-500' : 'bg-slate-800'}`} />
                      <div className={`flex-1 rounded-full transition-all duration-300 ${strength >= 5 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                    </div>
                    <p className="text-[10px] text-slate-500 text-right font-mono uppercase tracking-wider">
                      {strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>
            )}

            <HardwareButton 
              type="submit"
              disabled={loading}
              variant="primary"
              className="w-full !py-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {view === 'login' && (lang === 'zh' ? '登录' : 'Sign In')}
                  {view === 'signup' && (lang === 'zh' ? '注册' : 'Create Account')}
                  {view === 'forgot-password' && (lang === 'zh' ? '发送重置链接' : 'Send Reset Link')}
                  {view === 'otp' && (lang === 'zh' ? '发送登录链接' : 'Send Magic Link')}
                  <ArrowRight size={18} />
                </>
              )}
            </HardwareButton>
          </form>

          {(view === 'login' || view === 'signup') && (
            <>
              <div className="mt-10 relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                  <span className="bg-[#0f172a] px-4 text-slate-600">Or Continue With</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <HardwareButton 
                  type="button" 
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  variant="outline"
                  className="!py-3"
                  icon={<Chrome size={18} className="text-slate-400" />}
                >
                  Google
                </HardwareButton>
                <HardwareButton 
                  type="button" 
                  onClick={() => setView('otp')}
                  disabled={loading}
                  variant="outline"
                  className="!py-3"
                  icon={<KeyRound size={18} className="text-slate-400" />}
                >
                  OTP
                </HardwareButton>
              </div>
            </>
          )}
        </GlassCard>

        <div className="mt-10 text-center space-y-4">
          <p className="text-sm text-slate-500">
            {view === 'login' && (
              <>
                {lang === 'zh' ? '还没有账户？' : "Don't have an account?"}{' '}
                <button onClick={() => setView('signup')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  {lang === 'zh' ? '立即注册' : 'Sign Up'}
                </button>
              </>
            )}
            {view === 'signup' && (
              <>
                {lang === 'zh' ? '已经有账户了？' : "Already have an account?"}{' '}
                <button onClick={() => setView('login')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  {lang === 'zh' ? '立即登录' : 'Sign In'}
                </button>
              </>
            )}
            {(view === 'forgot-password' || view === 'otp') && (
              <button onClick={() => setView('login')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 mx-auto">
                <ArrowLeft size={14} />
                {lang === 'zh' ? '返回登录' : 'Back to Login'}
              </button>
            )}
          </p>
          <button 
            onClick={() => navigate(langPrefix)}
            className="text-[10px] font-black text-slate-700 hover:text-slate-400 uppercase tracking-[0.3em] transition-all"
          >
            ← Back to SomnoAI Digital Sleep Lab
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
