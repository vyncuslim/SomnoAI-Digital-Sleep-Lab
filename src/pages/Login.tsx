import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, AlertCircle, Key } from 'lucide-react';
import { fetchWithLogging } from '../services/apiService';
import { Logo } from '../components/Logo';
import { useLanguage } from '../context/useLanguage';
import { startAuthentication } from '@simplewebauthn/browser';

const Login = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  if (user) {
    navigate(from, { replace: true });
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (error) {
        // Record login failure
        try {
          await fetchWithLogging('/api/audit/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email: trimmedEmail, 
              status: 'failed', 
              errorCode: error.message 
            }),
          }, 'Login Failure Logging');
        } catch (e) {
          console.warn('Login failure logging failed', e);
        }
        throw error;
      }

      // Record login success
      try {
        await fetchWithLogging('/api/audit/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: data.user.id,
            email: data.user.email,
            status: 'success',
            metadata: {
              role: data.user.user_metadata?.role || 'user',
              user_name: data.user.user_metadata?.full_name || 'User',
              device: navigator.userAgent
            }
          }),
        }, 'Login Success Logging');
      } catch (e) {
        console.warn('Login success logging failed', e);
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || t('auth.loginError'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Get authentication options from server
      const optionsRes = await fetch("/api/webauthn/generate-authentication-options", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      const optionsData = await optionsRes.json();
      if (!optionsData.success) throw new Error(optionsData.message);

      // 2. Start WebAuthn authentication in browser
      const asseResp = await startAuthentication({ optionsJSON: optionsData.options });

      // 3. Send response to server for verification
      const verifyRes = await fetch("/api/webauthn/verify-authentication", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          response: asseResp,
          challengeId: optionsData.challengeId
        })
      });

      const verifyData = await verifyRes.json();
      if (verifyData.success && verifyData.action_link) {
        window.location.href = verifyData.action_link;
      } else {
        throw new Error(verifyData.message || "Verification failed");
      }
    } catch (error: any) {
      console.error(error);
      if (error.name === 'NotAllowedError') {
        setError("Authentication cancelled or blocked by browser.");
      } else {
        setError(error.message || "An error occurred during authentication");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-secondary/30 p-8 rounded-2xl border border-white/10 shadow-xl backdrop-blur-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <Logo showText={false} className="scale-125" />
          </div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight italic">{t('auth.loginTitle')}</h1>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mt-2">Neural Access • Session Start</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start text-red-400">
            <AlertCircle className="w-5 h-5 mr-3 shrink-0 mt-0.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.email')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-background/50 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{t('auth.password')}</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-background/50 text-foreground placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t('auth.loggingIn') : t('auth.loginBtn')}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-secondary/30 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handlePasskeyLogin}
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-medium text-gray-300 bg-background/50 hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Key className="w-5 h-5 mr-2" />
              Login with Passkey
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
