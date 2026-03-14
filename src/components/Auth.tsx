import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Chrome, Brain, ShieldCheck, ArrowLeft, KeyRound, Loader2, Check } from 'lucide-react';
import { Turnstile } from '@marsidev/react-turnstile';
import { GlassCard } from './GlassCard';
import { HardwareButton } from './ui/Components';
import { Language } from '../services/i18n';
import { Logo } from './Logo';
import { supabase, logAuditLog, logError } from '../services/supabaseService';
import { securityService } from '../services/securityService';
import { emailService } from '../services/emailService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/useLanguage';
import { notificationService } from '../services/notificationService';
import { trackEvent } from '../services/analytics';

interface AuthProps {
  lang: Language;
  initialView?: 'login' | 'signup';
}

type AuthView = 'login' | 'signup' | 'forgot-password' | 'otp' | 'verification-pending';

const InputField = ({ icon: Icon, label, rightElement, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center ml-4 mr-1">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        {rightElement}
      </div>
      <div className="relative group">
        <Icon 
          className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isFocused ? 'text-indigo-400' : 'text-slate-600'}`} 
          size={18} 
        />
        <input 
          {...props}
          onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white font-mono focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all placeholder-slate-700/50 hover:border-white/20"
        />
        <div className={`absolute inset-0 rounded-2xl transition-opacity duration-300 pointer-events-none ${isFocused ? 'opacity-100 shadow-[0_0_15px_rgba(99,102,241,0.1)]' : 'opacity-0'}`} />
      </div>
    </div>
  );
};

const CheckboxField = ({ id, checked, onChange, children }: any) => (
  <div className="flex items-start gap-3 group cursor-pointer" onClick={() => onChange(!checked)}>
    <div className="relative mt-0.5 flex-shrink-0">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
        required
      />
      <div className={`w-4 h-4 rounded border transition-all duration-300 flex items-center justify-center
        ${checked ? 'bg-indigo-500 border-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-black/40 border-white/20 group-hover:border-white/40'}`}
      >
        <Check size={12} className={`text-white transition-transform duration-300 ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
    </div>
    <label htmlFor={id} className="text-xs text-slate-400 cursor-pointer select-none leading-relaxed group-hover:text-slate-300 transition-colors" onClick={(e) => e.preventDefault()}>
      {children}
    </label>
  </div>
);

export const Auth: React.FC<AuthProps> = ({ lang, initialView = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isVerified } = useAuth();
  const { langPrefix } = useLanguage();
  const [view, setView] = useState<AuthView>(initialView);
  
  React.useEffect(() => {
    if (user && isVerified) {
      navigate(`${langPrefix}/dashboard`);
    }
  }, [user, isVerified, navigate, langPrefix]);

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    if (errorParam === 'unverified') {
      setError('Please verify your email address before logging in. Check your inbox for the verification link.');
    }
  }, [location.search]);

  React.useEffect(() => {
    if (initialView === 'login' || initialView === 'signup') {
      setView(initialView);
    }
  }, [initialView]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [termsApproved, setTermsApproved] = useState(false);
  const [privacyApproved, setPrivacyApproved] = useState(false);
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;
  const isTurnstileEnabled = !!turnstileSiteKey;

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = React.useRef<any>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
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

  React.useEffect(() => {
    setShowOtpInput(false);
    setToken('');
    setSuccessMessage(null);
    setError(null);
    setTurnstileToken(null);
    if (turnstileRef.current) {
      turnstileRef.current.reset();
    }
  }, [view]);

  const validateEmail = (email: string) => {
    const fakePatterns = ['@ddd', '@ds', '@123'];
    if (fakePatterns.some(pattern => email.includes(pattern))) {
      return { valid: false, message: 'Please use a valid email address.' };
    }

    const validDomains = ['gmail.com', 'outlook.com', 'yahoo.com', '.edu'];
    const domain = email.split('@')[1];
    
    // If it's a common domain or ends with .edu, it's valid
    if (validDomains.some(d => domain?.endsWith(d))) {
      return { valid: true };
    }

    // Otherwise, check if it looks like a company domain (has a dot and not too short)
    if (domain && domain.includes('.') && domain.length > 4) {
      return { valid: true };
    }

    return { valid: false, message: 'Please use a valid email domain (e.g., gmail.com, outlook.com, or a company domain).' };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (view === 'signup' && (!termsApproved || !privacyApproved)) {
        throw new Error('You must approve the Terms of Service and Privacy Policy.');
      }

      const requiresCaptcha = view === 'login' || view === 'signup' || view === 'forgot-password' || (view === 'otp' && !showOtpInput);
      if (requiresCaptcha && isTurnstileEnabled && !turnstileToken) {
        throw new Error('Please complete the security verification.');
      }

      if (view === 'signup') {
        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          throw new Error(emailValidation.message);
        }

        if (password !== confirmPassword) {
          throw new Error('Passwords do not match.');
        }
      }

      if (view === 'login') {
        if (!supabase.auth.signInWithPassword) {
          throw new Error('Supabase is not configured. Please check your environment variables.');
        }
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
          options: {
            captchaToken: turnstileToken || undefined,
          },
        });
        
        if (signInError) {
          await securityService.handleFailedLogin(email);
          await fetch('/api/audit/auth-login-failure', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, errorCode: signInError.message })
          });
          throw signInError;
        }
        
        if (data.user) {
          // Check if email is verified
          if (!data.user.email_confirmed_at) {
            await supabase.auth.signOut();
            throw new Error('Please verify your email address before logging in. Check your inbox for the verification link.');
          }

          // Check if user is blocked
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
          
          if (profileData?.is_blocked) {
             // Log the attempt
             await fetch('/api/audit/auth-login-failure', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, errorCode: `Blocked user attempted login. Role: ${profileData.role || 'user'}. Code: ${profileData.block_code || 'N/A'}` })
             });
             await supabase.auth.signOut();
             throw new Error(`Your account is blocked. Block Code: ${profileData.block_code || 'N/A'}. Please contact admin@sleepsomno.com`);
          } else {
             // Check if role is valid
             if (!profileData?.role) {
               console.warn(`User ${data.user.id} has no role assigned.`);
               // await logAuditLog(data.user.id, 'LOGIN_NO_ROLE', `User logged in without an assigned role.`); // REMOVE
             }
             
             await fetch('/api/auth/record-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.user.id,
                    email,
                    role: profileData?.role || 'user',
                    user_name: profileData?.full_name || 'N/A',
                    device: navigator.userAgent
                })
             });
             notificationService.sendLoginNotification(email, data.user.id);
             trackEvent('login', 'authentication', 'email');
          }
        }
        
        navigate(`${langPrefix}/dashboard`);
      } else if (view === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            captchaToken: turnstileToken || undefined,
            emailRedirectTo: `${window.location.origin}/auth/verify`,
          },
        });
        
        if (signUpError) {
          await fetch('/api/audit/auth-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: null,
              email,
              success: false,
              errorCode: signUpError.message
            })
          });
          throw signUpError;
        }
        
        if (data.session) {
          // Email confirmation is disabled, user is logged in
          if (data.user) {
            trackEvent('sign_up', 'authentication', 'email');
            await fetch('/api/audit/auth-signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: data.user.id,
                    email,
                    success: true
                })
            });
            notificationService.sendLoginNotification(email, data.user.id);
            emailService.sendSignupWelcome(email);
          }
          navigate(`${langPrefix}/dashboard`);
        } else {
          // Email confirmation is required
          trackEvent('sign_up_pending', 'authentication', 'email');
          await fetch('/api/audit/auth-signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: data.user?.id ?? null,
                email,
                success: true,
                needsEmailConfirmation: true
            })
          });
          emailService.sendSignupWelcome(email);
          setSuccessMessage('Registration successful! Please check your email to verify your account before logging in.');
          setView('verification-pending');
        }
      } else if (view === 'forgot-password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset-password`,
          captchaToken: turnstileToken || undefined,
        });
        
        if (resetError) {
          await logError(null, resetError, `Password reset request failed for ${email}`);
          throw resetError;
        }
        emailService.sendPasswordReset(email);
        setSuccessMessage(lang === 'zh' ? '重置链接已发送到您的邮箱。' : 'Password reset link sent to your email.');
      } else if (view === 'otp') {
        if (showOtpInput) {
          const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
          });
          
          if (verifyError) throw verifyError;
          
          if (data.user) {
            await logAuditLog(data.user.id, 'USER_LOGIN_OTP', 'Successful OTP login');
          }
          
          navigate(`${langPrefix}/dashboard`);
          return;
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            captchaToken: turnstileToken || undefined,
          },
        });
        
        if (otpError) throw otpError;
        setShowOtpInput(true);
        setSuccessMessage(lang === 'zh' ? '验证码/登录链接已发送到您的邮箱，请查收。' : 'Verification code or magic link sent to your email. Check your inbox.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      
      if (view === 'login') {
        try {
          await supabase.rpc('report_failed_login', { target_email: email });
          await logAuditLog('SYSTEM', 'FAILED_LOGIN_ATTEMPT', `Failed login attempt for email: ${email}`);
        } catch (rpcErr) {
          console.error('Failed to report login attempt:', rpcErr);
        }
      }

      let errorMessage = err.message || 'Authentication failed';
      
      if (err.message && err.message.includes('invalid-input-secret')) {
        errorMessage = 'CAPTCHA configuration error: The secret key is invalid. Please check your Supabase Auth settings.';
      } else if (err.message && err.message.includes('captcha verification process failed')) {
        errorMessage = 'CAPTCHA verification failed. If you have enabled CAPTCHA in Supabase, please ensure you have set VITE_TURNSTILE_SITE_KEY in your environment variables. Otherwise, disable CAPTCHA in Supabase Auth settings.';
      } else if (err.message === 'Invalid login credentials') {
        errorMessage = 'Invalid email or password.';
      } else if (err.message === 'User already registered') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.message && err.message.includes('Password should contain at least one character of each')) {
        errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
      } else if (err.message && err.message.includes('Password should be at least')) {
        errorMessage = 'Password should be at least 6 characters.';
      }
      setError(errorMessage);
      // Reset Turnstile on error
      if (turnstileRef.current) {
        turnstileRef.current.reset();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          skipBrowserRedirect: true,
        }
      });
      
      if (error) throw error;
      
      if (data?.url) {
        // Open the OAuth URL in a popup to avoid iframe restrictions
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        const popup = window.open(
          data.url,
          'supabase_oauth',
          `width=${width},height=${height},left=${left},top=${top},toolbar=0,scrollbars=1,status=1,resizable=1,location=1,menuBar=0`
        );
        
        if (!popup) {
          setError(lang === 'zh' ? '弹窗被拦截，请允许弹窗以继续。' : 'Popup blocked. Please allow popups to continue.');
        } else {
          // Listen for the popup closing or auth state changing
          const checkPopup = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopup);
              setLoading(false);
            }
          }, 1000);
        }
      }
      
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      if (error) throw error;
      setSuccessMessage('Verification email resent! Please check your inbox.');
    } catch (err: any) {
      if (err.status === 429) {
        setError('Too many requests. Please wait a few minutes before trying again.');
      } else if (err.status === 500) {
        setError('Server error while sending email. Please try again later or contact support.');
      } else {
        setError(err.message || 'Failed to resend verification email.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (view === 'login') return lang === 'zh' ? '欢迎回来' : 'Welcome Back';
    if (view === 'signup') return lang === 'zh' ? '加入实验室' : 'Join the Lab';
    if (view === 'forgot-password') return lang === 'zh' ? '重置密码' : 'Reset Password';
    if (view === 'otp') return lang === 'zh' ? '无密码登录' : 'Passwordless Login';
    if (view === 'verification-pending') return lang === 'zh' ? '等待验证' : 'Verification Pending';
    return '';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: any = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden grainy-bg">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] pointer-events-none opacity-50" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to={langPrefix} className="group relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Logo className="mb-6 scale-125 relative z-10" />
          </Link>
          <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {getTitle()}
          </h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SomnoAI • Neural Access
          </p>
        </div>

        <GlassCard className="p-8 sm:p-10 rounded-[2.5rem] border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl relative overflow-hidden" intensity="high">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-[2.5rem]" />

          <AnimatePresence mode="wait">
            {view === 'verification-pending' ? (
              <motion.div
                key="verification-pending"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mail className="text-indigo-400 w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Check Your Email</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  We've sent a verification link to <span className="text-white font-mono">{email}</span>. 
                  Please click the link in the email to verify your account and complete registration.
                </p>
                
                <div className="pt-4 space-y-4">
                  <HardwareButton 
                    onClick={handleResendVerification}
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Resend Verification Email'}
                  </HardwareButton>
                  
                  <button 
                    onClick={() => setView('login')}
                    className="text-xs text-indigo-400 font-bold hover:text-indigo-300 uppercase tracking-widest transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="auth-form">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    {error}
                  </motion.div>
                )}
                {successMessage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-500 text-xs font-bold uppercase tracking-widest text-center"
                  >
                    {successMessage}
                  </motion.div>
                )}
                
                <motion.form 
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <motion.div variants={itemVariants}>
                    <InputField
                      icon={Mail}
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e: any) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      required
                      disabled={showOtpInput}
                    />
                  </motion.div>

                  {view === 'otp' && showOtpInput && (
                    <motion.div variants={itemVariants}>
                      <InputField
                        icon={KeyRound}
                        label={lang === 'zh' ? '验证码' : 'Verification Code'}
                        type="text"
                        value={token}
                        onChange={(e: any) => setToken(e.target.value)}
                        placeholder="123456"
                        required
                        autoFocus
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          type="button"
                          onClick={() => {
                            setShowOtpInput(false);
                            setToken('');
                            setSuccessMessage(null);
                          }}
                          className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                        >
                          {lang === 'zh' ? '更改邮箱' : 'Change Email'}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {(view === 'login' || view === 'signup') && (
                    <motion.div variants={itemVariants}>
                      <InputField
                        icon={Lock}
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        rightElement={
                          view === 'login' && (
                            <button 
                              type="button"
                              onClick={() => setView('forgot-password')}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors"
                            >
                              {lang === 'zh' ? '忘记密码？' : 'Forgot Password?'}
                            </button>
                          )
                        }
                      />
                    </motion.div>
                  )}

                  {view === 'signup' && (
                    <motion.div variants={itemVariants} className="space-y-4 ml-2 pt-2">
                      <CheckboxField id="terms" checked={termsApproved} onChange={setTermsApproved}>
                        {lang === 'zh' ? '我同意' : 'I agree to the'} <Link to={`${langPrefix}/legal/terms-of-service`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">{lang === 'zh' ? '服务条款' : 'Terms of Service'}</Link>.
                      </CheckboxField>
                      <CheckboxField id="privacy" checked={privacyApproved} onChange={setPrivacyApproved}>
                        {lang === 'zh' ? '我同意' : 'I agree to the'} <Link to={`${langPrefix}/legal/privacy-policy`} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline transition-colors">{lang === 'zh' ? '隐私政策' : 'Privacy Policy'}</Link>.
                      </CheckboxField>
                    </motion.div>
                  )}

                  {(view === 'login' || view === 'signup' || view === 'forgot-password' || (view === 'otp' && !showOtpInput)) && isTurnstileEnabled && (
                    <motion.div variants={itemVariants} className="space-y-4 ml-2 pt-2">
                      <div className="pt-2">
                        <Turnstile 
                          ref={turnstileRef}
                          siteKey={turnstileSiteKey} 
                          onSuccess={(token) => setTurnstileToken(token)}
                          onError={() => setError('Security verification failed. Please try again.')}
                          onExpire={() => setTurnstileToken(null)}
                          options={{
                            theme: 'dark',
                            size: 'normal',
                          }}
                        />
                      </div>
                    </motion.div>
                  )}

                  {view === 'signup' && (
                    <motion.div variants={itemVariants}>
                      <InputField
                        icon={Lock}
                        label="Confirm Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e: any) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                      
                      {password && (
                        <div className="px-4 pt-3">
                          <div className="flex gap-1 h-1.5 mb-2">
                            <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 1 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' : 'bg-slate-800'}`} />
                            <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 2 ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]' : 'bg-slate-800'}`} />
                            <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 3 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-slate-800'}`} />
                            <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 4 ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'bg-slate-800'}`} />
                            <div className={`flex-1 rounded-full transition-all duration-500 ${strength >= 5 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-800'}`} />
                          </div>
                          <p className="text-[10px] text-slate-500 text-right font-mono uppercase tracking-wider flex justify-end items-center gap-2">
                            <span className="opacity-50">Strength:</span>
                            <span className={`font-bold ${strength < 2 ? 'text-rose-500' : strength < 4 ? 'text-yellow-500' : 'text-emerald-500'}`}>
                              {strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}
                            </span>
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants} className="pt-2">
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
                          {view === 'otp' && (
                            showOtpInput 
                              ? (lang === 'zh' ? '验证验证码' : 'Verify Code') 
                              : (lang === 'zh' ? '发送登录链接' : 'Send Magic Link')
                          )}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </HardwareButton>
                  </motion.div>
                </motion.form>

                {(view === 'login' || view === 'signup') && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="mt-10 relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-white/5"></div>
                      </div>
                      <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest">
                        <span className="bg-[#0f172a] px-4 text-slate-500">Or Continue With</span>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-4">
                      <HardwareButton 
                        type="button" 
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        variant="outline"
                        className="!py-3"
                        icon={<Chrome size={18} className="text-slate-400 group-hover/btn:text-white transition-colors" />}
                      >
                        Google
                      </HardwareButton>
                      <HardwareButton 
                        type="button" 
                        onClick={() => setView('otp')}
                        disabled={loading}
                        variant="outline"
                        className="!py-3"
                        icon={<KeyRound size={18} className="text-slate-400 group-hover/btn:text-white transition-colors" />}
                      >
                        OTP
                      </HardwareButton>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </GlassCard>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 text-center space-y-6"
        >
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
            {view === 'verification-pending' && (
              <>
                {lang === 'zh' ? '已经验证？' : "Already verified?"}{' '}
                <button onClick={() => setView('login')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors">
                  {lang === 'zh' ? '立即登录' : 'Sign In'}
                </button>
              </>
            )}
            {(view === 'forgot-password' || view === 'otp') && (
              <button onClick={() => setView('login')} className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors flex items-center justify-center gap-2 mx-auto group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {lang === 'zh' ? '返回登录' : 'Back to Login'}
              </button>
            )}
          </p>
          <button 
            onClick={() => navigate(langPrefix)}
            className="text-[10px] font-black text-slate-600 hover:text-slate-400 uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-2 mx-auto group"
          >
            <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
            Back to SomnoAI Digital Sleep Lab
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 flex items-center justify-center gap-8 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500"
        >
          <ShieldCheck size={20} className="text-emerald-500" />
          <Brain size={20} className="text-indigo-500" />
          <div className="h-4 w-px bg-white/20" />
          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-400">AES-256 Encrypted</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

