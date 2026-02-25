import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService.ts';
import { GlassCard } from './GlassCard.tsx';
import { Loader2 } from 'lucide-react';

export const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await (supabase.auth as any).signInWithPassword({ email, password });
    if (error) setError(error.message);
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    const { error } = await (supabase.auth as any).signUp({ email, password });
    if (error) setError(error.message);
    else setError('Check your email for confirmation link');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex items-center justify-center p-6">
      <GlassCard className="p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome to SomnoAI</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-indigo-500 outline-none"
            required
          />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold transition-colors flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Login'}
          </button>
          <button
            type="button"
            onClick={handleSignUp}
            disabled={loading}
            className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors"
          >
            Sign Up
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
