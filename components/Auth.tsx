import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService.ts';
import { GlassCard } from './GlassCard.tsx';
import { Loader2, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Language } from '../services/i18n.ts';

interface AuthProps {
  lang?: Language;
}

export const Auth: React.FC<AuthProps> = ({ lang = 'en' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validateInput = () => {
    if (!email || !password) {
      setError('Please enter both email and password.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInput()) return;
    
    setLoading(true);
    setError(null);
    const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleSignUp = async () => {
    if (!validateInput()) return;

    setLoading(true);
    setError(null);
    
    // Simulate signup process
    const { error } = await (supabase.auth as any).signUp({ email, password });
    
    if (error) {
      setError(error.message);
    } else {
      // Instead of showing "Check email", switch to OTP view
      setShowOtp(true);
      setError(null);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    // Simulate OTP verification
    // In a real app, this would call supabase.auth.verifyOtp
    setTimeout(() => {
      if (otp.length === 6) {
        navigate('/dashboard');
      } else {
        setError('Invalid verification code. Please try again.');
        setLoading(false);
      }
    }, 1500);
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

  if (showOtp) {
    return (
      <div className="min-h-screen bg-[#01040a] text-white flex items-center justify-center p-6">
        <GlassCard className="p-8 w-full max-w-md">
          <button 
            onClick={() => setShowOtp(false)}
            className="mb-6 text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={16} /> Back
          </button>
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
              <KeyRound size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Verify Account</h2>
            <p className="text-slate-400 text-sm">
              Enter the 6-digit code sent to <br/>
              <span className="text-white font-medium">{email}</span>
            </p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-4 focus:border-indigo-500 outline-none transition-colors text-center text-2xl tracking-[0.5em] font-mono"
              autoFocus
            />
            
            {error && <p className="text-rose-500 text-sm font-medium text-center">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors flex items-center justify-center"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Verify Code'}
            </button>
            
            <p className="text-center text-xs text-slate-500">
              Didn't receive code? <button type="button" className="text-indigo-400 hover:text-indigo-300">Resend</button>
            </p>
          </form>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex items-center justify-center p-6">
      <GlassCard className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">SomnoAI Digital Sleep Lab</h2>
        <p className="text-center text-slate-400 text-xs uppercase tracking-widest mb-8">Advanced Telemetry Analysis</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none transition-colors"
            required
          />
          {error && <p className="text-rose-500 text-sm font-medium">{error}</p>}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Login'}
          </button>
          
          <div className="flex items-center gap-3 my-4">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-xs text-slate-500 uppercase">Or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 bg-white text-black hover:bg-slate-200 rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>

          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 text-sm"
          >
            <Mail size={16} />
            Sign Up with Email
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
