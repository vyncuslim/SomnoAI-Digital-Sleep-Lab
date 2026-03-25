import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { Logo } from '../components/Logo';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/useLanguage';

const Signup: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);

  const handleSignup = async () => {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      toast.error(t('auth.fillAllFields'));
      return;
    }
    if (!terms || !privacy) {
      toast.error(t('auth.agreeRequired'));
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      // Record signup attempt
      await fetch('/api/audit/auth-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: !error,
          userId: data.user?.id ?? null,
          email: trimmedEmail,
          errorCode: error?.message ?? null,
          needsEmailConfirmation: !!data.user && !data.user.identities?.length
        }),
      });

      if (error) throw error;
      toast.success(t('auth.signupSuccess'));
    } catch (err: any) {
      toast.error(err?.message || t('auth.signupError'));
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast(`Continuing with ${provider}...`);
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
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="group relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Logo className="mb-6 scale-125 relative z-10" />
          </Link>
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            {t('auth.signupTitle')}
          </h2>
          <p className="text-slate-500 text-xs font-mono uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            SomnoAI • Neural Access
          </p>
        </div>

        <div className="bg-slate-900/40 p-8 sm:p-10 rounded-[2.5rem] border border-white/5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-indigo-500/30 rounded-tl-[2.5rem]" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-purple-500/30 rounded-br-[2.5rem]" />

          <div className="space-y-4">
            <input 
              type="email" 
              placeholder={t('auth.email')} 
              className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-2xl text-sm font-mono focus:outline-none focus:border-indigo-500/50 transition-all" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input 
              type="password" 
              placeholder={t('auth.password')} 
              className="w-full bg-black/40 border border-white/10 px-4 py-4 rounded-2xl text-sm font-mono focus:outline-none focus:border-indigo-500/50 transition-all" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <div className="space-y-3 py-2">
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setTerms(!terms)}>
                <div className={`w-4 h-4 rounded border transition-all ${terms ? 'bg-indigo-500 border-indigo-500' : 'bg-black/40 border-white/20'}`} />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('auth.agreeTerms')}</span>
              </div>
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setPrivacy(!privacy)}>
                <div className={`w-4 h-4 rounded border transition-all ${privacy ? 'bg-indigo-500 border-indigo-500' : 'bg-black/40 border-white/20'}`} />
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{t('auth.agreePrivacy')}</span>
              </div>
            </div>

            <button 
              onClick={handleSignup}
              className="w-full bg-indigo-600 text-white px-4 py-4 rounded-2xl font-black uppercase tracking-widest italic hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              {t('auth.signupBtn')}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-600">
                <span className="bg-[#0a0d14] px-4">{t('auth.orContinueWith')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSocialLogin('GOOGLE')}
                className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {t('auth.google')}
              </button>
              <button 
                onClick={() => handleSocialLogin('OTP')}
                className="bg-white/5 border border-white/5 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest italic hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                {t('auth.otp')}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
