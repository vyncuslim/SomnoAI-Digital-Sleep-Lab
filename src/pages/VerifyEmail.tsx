import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlassCard } from '../components/GlassCard';
import { HardwareButton } from '../components/ui/Components';
import { useLanguage } from '../context/useLanguage';

export const VerifyEmail: React.FC = () => {
  const { user, resendVerificationEmail, signOut } = useAuth();
  const { langPrefix, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const email = location.state?.email || user?.email;

  useEffect(() => {
    if (!email && !user) {
      navigate(`${langPrefix}/auth/login`);
    }
  }, [email, user, navigate, langPrefix]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;

    setLoading(true);
    setMessage(null);
    try {
      await resendVerificationEmail(email);
      setMessage({ type: 'success', text: t('auth.verifyEmailResent') });
      setCooldown(60); // 60 seconds cooldown
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || t('auth.verifyEmailError') });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = async () => {
    await signOut();
    navigate(`${langPrefix}/auth/login`);
  };

  if (!email && !user) return null;

  return (
    <div className="min-h-screen bg-[#01040a] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8 sm:p-10 rounded-[2.5rem] border-white/5 bg-slate-900/40 shadow-2xl backdrop-blur-xl text-center">
          <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="text-indigo-400 w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight mb-4">
            {t('auth.verifyEmailTitle')}
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed mb-8">
            {t('auth.verifyEmailDesc').replace('{{email}}', email || '')}
          </p>

          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-2xl text-xs font-bold uppercase tracking-widest border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}
            >
              {message.text}
            </motion.div>
          )}

          <div className="space-y-4">
            <HardwareButton 
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              variant="primary"
              className="w-full py-4"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin mx-auto" />
              ) : cooldown > 0 ? (
                t('auth.resendIn').replace('{{seconds}}', cooldown.toString())
              ) : (
                t('auth.resendBtn')
              )}
            </HardwareButton>

            <button 
              onClick={handleBackToLogin}
              className="flex items-center justify-center gap-2 w-full text-xs text-slate-500 font-bold hover:text-white uppercase tracking-widest transition-colors"
            >
              <ArrowLeft size={14} />
              {t('auth.backToLogin')}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-white/5">
            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              <CheckCircle2 size={12} className="text-emerald-500" />
              {t('auth.secureVerification')}
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};
