import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseService';
import { Lock, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/useLanguage';

export const PasswordReset: React.FC = () => {
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.updateUser({ password: password });

    if (error) {
      setError(error.message);
    } else {
      navigate('/auth/login');
    }
    setLoading(false);
  };

  return (
    <div className="p-3 max-w-[300px] mx-auto bg-slate-900 rounded-lg border border-slate-800 text-white">
      <h2 className="text-xs font-bold mb-2 uppercase tracking-wider">{t('auth.newPassword')}</h2>
      <form onSubmit={handleReset} className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.newPasswordPlaceholder')}
            className="w-full bg-slate-800 border border-slate-700 rounded py-1.5 pl-7 pr-2 text-xs"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-medium py-1.5 rounded transition"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" size={12} /> : t('auth.resetBtn')}
        </button>
        {error && <p className="text-[9px] text-rose-500 text-center">{error}</p>}
      </form>
    </div>
  );
};
