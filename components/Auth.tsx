import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Zap, Eye, EyeOff, 
  Chrome, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from './Logo.tsx';
import { authApi } from '../services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: 'en' | 'zh' | 'es';
  onLogin: () => void;
  onGuest: () => void; 
  initialTab?: 'login' | 'signup' | 'otp';
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest, initialTab = 'login' }) => {
  // 在专用路径下锁定 Tab，不允许随意切换以符合用户需求
  const [activeTab] = useState<'login' | 'signup' | 'otp'>(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<{message: string} | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const SITE_KEY = '0x4AAAAAACNi1FM3bbfW_VsI'; 
    const initTurnstile = () => {
      if (turnstileRef.current && (window as any).turnstile) {
        (window as any).turnstile.render(turnstileRef.current, {
          sitekey: SITE_KEY,
          theme: 'dark',
          callback: (token: string) => setTurnstileToken(token)
        });
      }
    };
    setTimeout(initTurnstile, 500);
  }, []);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setError(null);
    setIsProcessing(true);

    try {
      if (activeTab === 'login') {
        const { error: signInErr } = await authApi.signIn(email.trim(), password, turnstileToken || undefined);
        if (signInErr) throw signInErr;
        onLogin();
      } else if (activeTab === 'signup') {
        const { error: signUpErr } = await authApi.signUp(email.trim(), password, { full_name: fullName.trim() }, turnstileToken || undefined);
        if (signUpErr) throw signUpErr;
        setError({ message: "Registry requested. Check email for verification link." });
      }
    } catch (err: any) {
      setError({ message: err.message || "Protocol link severed." });
    } finally {
      setIsProcessing(false);
    }
  };

  const isLogin = activeTab === 'login';

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans relative overflow-x-hidden text-left">
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center mb-12 space-y-4">
        <Logo size={80} animated={true} />
        <div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter leading-none">
            SomnoAI <span className="text-indigo-500">{isLogin ? 'Access' : 'Registry'}</span>
          </h1>
          <p className="text-slate-600 font-mono font-bold uppercase text-[9px] tracking-[0.8em] mt-3 italic">SomnoAI Digital Sleep Lab</p>
        </div>
      </m.div>

      <div className="w-full max-w-[400px] space-y-8 relative z-10">
        {/* Google 专用入口 */}
        <button 
          onClick={() => authApi.signInWithGoogle()}
          className="w-full py-5 rounded-full bg-white text-black font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl hover:bg-slate-200 transition-all active:scale-95"
        >
          <Chrome size={18} />
          {isLogin ? 'LOGIN WITH GOOGLE' : 'JOIN WITH GOOGLE'}
        </button>

        <div className="flex items-center gap-4 opacity-30">
          <div className="h-px flex-1 bg-white" /><span className="text-[9px] font-black text-white">OR</span><div className="h-px flex-1 bg-white" />
        </div>

        <form onSubmit={handleAuthAction} className="space-y-6">
          <div className="space-y-4">
            {!isLogin && (
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Subject Name (Full Name)" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
            )}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email Identifier" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
            <div className="relative">
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Access Key" className="w-full bg-[#050a1f] border border-white/5 rounded-full px-8 py-5 text-sm text-white outline-none focus:border-indigo-500/50 font-bold italic" required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-700">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>

          <div ref={turnstileRef} className="flex justify-center min-h-[65px]"></div>

          <button 
            type="submit" disabled={isProcessing}
            className="w-full py-5 rounded-full bg-indigo-600 text-white font-black text-[11px] uppercase tracking-[0.4em] shadow-2xl flex items-center justify-center gap-4 transition-all hover:bg-indigo-500 disabled:opacity-40"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
            <span>{isLogin ? 'ESTABLISH LINK' : 'INITIALIZE REGISTRY'}</span>
          </button>
        </form>

        <div className="flex flex-col items-center gap-4 pt-4">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {isLogin ? "No identity node? " : "Credentials exist? "}
            <button onClick={() => {
              window.location.href = isLogin ? '/signup' : '/login';
            }} className="text-indigo-400 underline underline-offset-4">{isLogin ? 'Join Lab' : 'Login'}</button>
          </p>
          <button onClick={onGuest} className="text-slate-700 text-[9px] font-black uppercase tracking-[0.4em] hover:text-slate-400 transition-colors">Sandbox Override</button>
        </div>

        {error && (
          <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl flex items-center gap-3">
            <AlertCircle className="text-indigo-500" size={16} />
            <p className="text-[10px] font-bold text-indigo-400 uppercase italic">{error.message}</p>
          </m.div>
        )}
      </div>
    </div>
  );
};