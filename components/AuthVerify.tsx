import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabaseService.ts';
import { emailService } from '../services/emailService.ts';
import { GlassCard } from './GlassCard.tsx';
import { Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { Language, getTranslation } from '../services/i18n.ts';

interface AuthVerifyProps {
  lang?: Language;
}

export const AuthVerify: React.FC<AuthVerifyProps> = ({ lang = 'en' }) => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const type = searchParams.get('type') || '';
  const name = searchParams.get('name') || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const t = getTranslation(lang, 'auth');

  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (!email) {
      navigate('/auth');
    }
  }, [email, navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) {
        setError(error.message);
      } else {
        setResendCooldown(60);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error } = await (supabase.auth as any).verifyOtp({ 
        email, 
        token: otp, 
        type: 'magiclink' 
      });
      
      if (error) {
        console.error("OTP Verification Error:", error);
        setError(error.message);
        await supabase.rpc('report_failed_login', { target_email: email });
        
        // Notify user about failed attempt
        const { data: attemptData } = await supabase.from('login_attempts').select('attempts').eq('email', email).single();
        if (attemptData) {
          await emailService.sendFailedLoginNotification(email, attemptData.attempts);
        }
      } else {
        const { data: profile } = await supabase.from('profiles').select('is_blocked').eq('email', email).single();
        if (profile?.is_blocked) {
          await supabase.auth.signOut();
          setError(t.blocked);
          setLoading(false);
          return;
        }
        await supabase.rpc('reset_login_attempts', { target_email: email });
        
        // If it was a signup, send welcome email
        if (type === 'signup') {
          await emailService.sendSignupNotification(email, name || email.split('@')[0]);
        }

        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error("Unexpected OTP Verification Error:", err);
      setError(err.message || 'An unexpected error occurred.');
      await supabase.rpc('report_failed_login', { target_email: email });
    } finally {
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

      <GlassCard className="p-8 w-full max-w-md border-indigo-500/20 relative z-10 backdrop-blur-xl">
        <button 
          onClick={() => navigate('/auth')}
          className="absolute left-6 top-6 p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="text-center mb-10 mt-4">
          <div className="w-16 h-16 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-400 animate-pulse border border-indigo-500/20">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Verify Identity</h2>
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-mono leading-relaxed">
            A SECURE ACCESS TOKEN HAS BEEN DISPATCHED TO <br/>
            <span className="text-indigo-400 font-bold">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerifyOtp} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-black text-slate-500 ml-1">Verification Token</label>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-5 focus:border-indigo-500 outline-none transition-all text-center text-3xl tracking-[0.6em] font-mono text-white placeholder-white/5 shadow-inner"
              autoFocus
              autoComplete="one-time-code"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCooldown > 0 || loading}
                className="text-[10px] text-indigo-400 hover:text-indigo-300 disabled:text-slate-600 disabled:cursor-not-allowed uppercase tracking-widest font-bold transition-colors"
              >
                {resendCooldown > 0 
                  ? (lang === 'zh' ? `重新发送 (${resendCooldown}s)` : `Resend OTP (${resendCooldown}s)`)
                  : (lang === 'zh' ? '重新发送 OTP' : 'Resend OTP')}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 animate-shake">
              <div className="text-rose-500 mt-0.5">⚠️</div>
              <p className="text-rose-500 text-[10px] font-mono leading-relaxed uppercase tracking-wider">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center shadow-[0_0_40px_-10px_rgba(79,70,229,0.6)] active:scale-[0.98]"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Authorize Session'}
          </button>
          
          <div className="text-center">
            <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">
              SECURE ENCRYPTED HANDSHAKE REQUIRED
            </p>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
