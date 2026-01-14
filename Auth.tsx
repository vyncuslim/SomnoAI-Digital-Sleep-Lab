
import React, { useState, useRef, useEffect } from 'react';
import { 
  Loader2, Mail, Lock, Zap, UserPlus, LogIn, 
  ChevronLeft, Eye, EyeOff, TriangleAlert, 
  ShieldCheck, Fingerprint, Shield, Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from './components/Logo.tsx';
import { Language } from './services/i18n.ts';
import { 
  signInWithEmailOTP, verifyOtp, signInWithGoogle, 
  signInWithPassword, signUpWithPassword 
} from './services/supabaseService.ts';

const m = motion as any;

interface AuthProps {
  lang: Language;
  onLogin: () => void;
  onGuest: () => void;
}

type AuthMethod = 'otp' | 'password';
type AuthMode = 'login' | 'register';
type AuthStep = 'initial' | 'otp-verify';

export const Auth: React.FC<AuthProps> = ({ lang, onLogin, onGuest }) => {
  const isZh = lang === 'zh';
  const [method, setMethod] = useState<AuthMethod>('otp');
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState<AuthStep>('initial');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // OTP 状态
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 处理验证码输入
  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
    
    // 自动提交
    if (newOtp.every(d => d !== '') && index === 5) {
      executeVerify(newOtp.join(''));
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (method === 'otp') {
        await signInWithEmailOTP(email);
        setStep('otp-verify');
        setTimeout(() => otpRefs.current[0]?.focus(), 500);
      } else {
        if (mode === 'login') {
          await signInWithPassword(email, password);
          onLogin();
        } else {
          await signUpWithPassword(email, password);
          setError(isZh ? "注册指令已发出。请查收邮箱确认后登录。" : "Registration protocol sent. Confirm email before login.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Auth Error: Node Link unstable.");
    } finally {
      setIsProcessing(false);
    }
  };

  const executeVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6) return;
    setIsProcessing(true);
    try {
      await verifyOtp(email, token);
      onLogin();
    } catch (err: any) {
      setError(isZh ? "令牌失效：验证码错误或已过期。" : "Invalid token: Code mismatch or expired.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] font-sans relative overflow-hidden">
      {/* 动态光晕 */}
      <div className="absolute inset-0 pointer-events-none">
        <m.div 
          animate={{ opacity: [0.03, 0.08, 0.03], scale: [1, 1.1, 1] }} 
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-500/10 rounded-full blur-[180px]" 
        />
      </div>

      <m.div layout initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-[460px] z-10">
        <header className="text-center mb-12 space-y-4">
          <m.div layout className="inline-block p-4 bg-slate-900/50 rounded-full shadow-inner border border-white/5 backdrop-blur-sm">
            <Logo size={64} animated={true} />
          </m.div>
          <div className="space-y-1">
            <m.h1 layout className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">
              SomnoAI <span className="text-indigo-500">Lab</span>
            </m.h1>
            <m.p layout className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">
              {isZh ? '数字化身份遥测站' : 'Digital Identity Telemetry'}
            </m.p>
          </div>
        </header>

        <div className="bg-[#050a1f]/60 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-10 md:p-14 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'initial' ? (
              <m.div key="initial" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-10">
                {/* 模式选择器 */}
                <div className="flex flex-col gap-5">
                  <div className="flex bg-slate-950/80 p-1.5 rounded-full border border-white/5">
                    <button 
                      onClick={() => { setMethod('otp'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'otp' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {isZh ? '验证码接入' : 'OTP Code'}
                    </button>
                    <button 
                      onClick={() => { setMethod('password'); setError(null); }}
                      className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${method === 'password' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {isZh ? '密码凭证' : 'Credentials'}
                    </button>
                  </div>

                  {method === 'password' && (
                    <m.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center gap-8">
                      <button onClick={() => setMode('login')} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'login' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <LogIn size={14} /> {isZh ? '登录' : 'Login'}
                      </button>
                      <button onClick={() => setMode('register')} className={`text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${mode === 'register' ? 'text-indigo-400' : 'text-slate-600 hover:text-slate-400'}`}>
                        <UserPlus size={14} /> {isZh ? '注册' : 'Register'}
                      </button>
                    </m.div>
                  )}
                </div>

                <form onSubmit={handleInitialSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                      <input 
                        type="email" 
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={isZh ? "受试者邮箱" : "Subject Identity (Email)"}
                        className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.8rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                    
                    {method === 'password' && (
                      <m.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group overflow-hidden">
                        <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400 transition-colors" size={18} />
                        <input 
                          type={showPassword ? "text" : "password"} 
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          placeholder={isZh ? "访问密钥" : "Access Secret"}
                          className="w-full bg-[#020617]/80 border border-white/10 rounded-[1.8rem] px-16 py-5 text-sm text-white font-medium outline-none focus:border-indigo-500/50 transition-all"
                          required
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-indigo-400">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </m.div>
                    )}
                  </div>

                  <button 
                    disabled={isProcessing}
                    className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={18} /> : (method === 'otp' ? <Zap size={18} /> : (mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />))}
                    {method === 'otp' ? (isZh ? '发送令牌' : 'Send Token') : (mode === 'login' ? (isZh ? '授权接入' : 'Authorize') : (isZh ? '创建身份' : 'Establish'))}
                  </button>
                </form>

                <div className="flex items-center gap-4">
                  <button onClick={() => signInWithGoogle()} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                    <img src="https://img.icons8.com/color/18/google-logo.png" alt="G" /> Google
                  </button>
                  <button onClick={onGuest} className="flex-1 py-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-400 hover:text-white uppercase tracking-widest transition-all">
                    <Fingerprint size={16} className="text-indigo-400" /> Sandbox
                  </button>
                </div>
              </m.div>
            ) : (
              <m.div key="otp-verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                <div className="text-center space-y-4">
                  <button onClick={() => setStep('initial')} className="text-[10px] font-black text-slate-500 hover:text-indigo-400 uppercase tracking-widest flex items-center gap-2 mx-auto transition-colors">
                    <ChevronLeft size={14} /> {isZh ? '修改身份信息' : 'Change Info'}
                  </button>
                  <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                    {isZh ? '校验接入令牌' : 'Verify Lab Token'}
                  </h2>
                </div>

                <div className="flex justify-between gap-3">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={el => { otpRefs.current[idx] = el; }}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpInput(idx, e.target.value)}
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-12 h-16 bg-white/[0.03] border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all"
                    />
                  ))}
                </div>

                <button 
                  onClick={() => executeVerify()}
                  disabled={isProcessing || otp.some(d => !d)}
                  className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-xs uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  {isZh ? '同步受试者身份' : 'Synchronize Identity'}
                </button>
              </m.div>
            )}
          </AnimatePresence>

          {error && (
            <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-400 text-[11px] font-bold">
              <TriangleAlert size={18} className="shrink-0" />
              <p className="flex-1">{error}</p>
            </m.div>
          )}
        </div>
      </m.div>
    </div>
  );
};
