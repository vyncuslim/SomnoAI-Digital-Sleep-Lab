
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, ChevronLeft, Mail, ShieldAlert, ShieldCheck, 
  Lock, Fingerprint, Eye, EyeOff, LogIn as LoginIcon, 
  UserPlus as RegisterIcon, Key, Hexagon, Zap, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language, translations } from './services/i18n.ts';
import { authApi } from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void; 
}

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const t = translations[lang].auth;
  const [authMode, setAuthMode] = useState<'otp' | 'password'>('otp');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsProcessing(true);
    setError(null);
    try {
      // 模拟请求实验室令牌的逻辑
      await new Promise(resolve => setTimeout(resolve, 1500));
      onLogin();
    } catch (err: any) {
      setError("FAILED TO ESTABLISH NEURAL LINK");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-[#020617] font-sans selection:bg-indigo-500/30">
      {/* 顶部标识 - 复刻截图 */}
      <m.div 
        initial={{ opacity: 0, y: 15 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-12 space-y-2"
      >
        <h1 className="text-4xl font-black tracking-[0.1em] text-white italic uppercase">
          SOMNOAILAB
        </h1>
        <p className="text-slate-600 font-bold uppercase text-[9px] tracking-[0.4em] opacity-80">
          DIGITAL IDENTITY TELEMETRY
        </p>
      </m.div>

      <div className="w-full max-w-[400px] space-y-8">
        {/* 模式切换器 - 复刻截图中的胶囊设计 */}
        <div className="bg-black/40 p-1.5 rounded-[1.8rem] border border-white/5 relative flex">
          <button 
            onClick={() => setAuthMode('otp')}
            className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'otp' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
          >
            OTP MODE
          </button>
          <button 
            onClick={() => setAuthMode('password')}
            className={`flex-1 py-4 rounded-full text-[11px] font-black uppercase tracking-widest z-10 transition-all ${authMode === 'password' ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
          >
            PASSWORD MODE
          </button>
          <m.div 
            className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(50%-3px)] bg-slate-900 border border-white/10 rounded-full shadow-xl"
            animate={{ x: authMode === 'password' ? '100%' : '0%' }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleAction} className="space-y-6">
          <div className="relative group">
            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-indigo-500" size={20} />
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              className="w-full bg-[#050a1f] border border-white/5 rounded-3xl pl-16 pr-8 py-6 text-sm text-white focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 font-bold italic"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isProcessing}
            className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-[0.98] transition-all shadow-2xl hover:bg-indigo-500 disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
            {isProcessing ? 'SYNCHRONIZING...' : 'REQUEST LAB TOKEN'}
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button" 
              className="py-5 bg-[#0a0f25] border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /></svg>
              GOOGLE
            </button>
            <button 
              type="button" 
              onClick={onGuest} 
              className="py-5 bg-[#0a0f25] border border-white/5 rounded-[1.8rem] flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[11px] font-black uppercase tracking-widest"
            >
              <Fingerprint size={18} className="text-indigo-400" />
              SANDBOX MODE
            </button>
          </div>
        </form>

        <div className="text-center">
          <button className="text-[10px] font-black uppercase text-slate-700 hover:text-slate-500 tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
            <Info size={12} />
            CANNOT ACTIVATE ACCOUNT?
          </button>
        </div>
      </div>

      <footer className="mt-20 text-center space-y-4 opacity-30">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">
          SOMNOAI DIGITAL SLEEP LAB • NEURAL INFRASTRUCTURE
        </p>
      </footer>
    </div>
  );
};
