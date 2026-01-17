import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldAlert, Loader2, ChevronLeft, Mail, ShieldCheck, 
  Zap, Lock, Eye, EyeOff, Hexagon, Key
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Logo } from '../../../components/Logo.tsx';
import { adminApi, authApi } from '../../../services/supabaseService.ts';

const m = motion as any;

/**
 * 稳健的状态指示器 (Status Indicator)
 * 采用 CSS 变量和简单的 opacity 切换，确保高性能且不崩溃
 */
const StatusIndicator = ({ active = false }: { active?: boolean }) => (
  <div className="flex items-center">
    <div className={`w-10 h-6 rounded-full border border-white/10 flex items-center px-0.5 bg-black/40 relative overflow-hidden transition-all duration-500 ${active ? 'border-rose-500/40 shadow-[0_0_10px_rgba(225,29,72,0.2)]' : ''}`}>
      <div 
        className={`absolute inset-0 bg-rose-600 transition-opacity duration-500 ${active ? 'opacity-20' : 'opacity-0'}`}
      />
      <div 
        className={`w-4 h-4 rounded-full relative z-10 flex items-center justify-center transition-all duration-300 transform ${active ? 'translate-x-4 bg-white shadow-[0_0_8px_white]' : 'translate-x-0 bg-slate-700'}`}
      >
        {active && <div className="w-2 h-2 bg-rose-600 rounded-full blur-[0.5px]" />}
      </div>
    </div>
  </div>
);

export default function AdminLoginPage() {
  const [activeTab, setActiveTab] = useState<'otp' | 'login' | 'register'>('login');
  const [step, setStep] = useState<'input' | 'verify'>('input');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const handleMainAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isProcessing) return;
    setError(null);

    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setIsProcessing(true);
    try {
      if (activeTab === 'otp') {
        if (cooldown > 0) return;
        const { error: otpErr } = await authApi.sendOTP(targetEmail);
        if (otpErr) throw otpErr;
        setStep('verify');
        setCooldown(60);
        setTimeout(() => otpRefs.current[0]?.focus(), 400);
      } else {
        const { data, error: signInErr } = await authApi.signIn(targetEmail, password);
        if (signInErr) throw signInErr;
        
        if (!data?.user) throw new Error("Synchronization failed.");

        const isAdmin = await adminApi.checkAdminStatus(data.user.id);
        if (!isAdmin) {
          await authApi.signOut();
          throw new Error("Access Denied: Subject lacks administrative clearance.");
        }
        
        window.location.hash = '#/admin';
      }
    } catch (err: any) {
      setError(err.message || "Admin Access Protocol Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOtpInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (newOtp.every(d => d !== '') && index === 5) executeOtpVerify(newOtp.join(''));
  };

  const executeOtpVerify = async (fullOtp?: string) => {
    const token = fullOtp || otp.join('');
    if (token.length < 6 || isProcessing) return;
    setIsProcessing(true);
    try {
      const { data, error: verifyErr } = await authApi.verifyOTP(email.trim().toLowerCase(), token);
      if (verifyErr) throw verifyErr;
      
      if (!data?.user) throw new Error("Verification failed.");

      const isAdmin = await adminApi.checkAdminStatus(data.user.id);
      if (!isAdmin) {
        await authApi.signOut();
        throw new Error("Access Denied: Subject lacks administrative clearance.");
      }
      
      window.location.hash = '#/admin';
    } catch (err: any) {
      setError(err.message || "Verification Token Invalid.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* 居中图标区域 - SOMNOAI LAB */}
      <m.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-10 flex flex-col items-center gap-4 z-10"
      >
        <div className="w-24 h-24 mb-2">
          <Logo size={96} animated={true} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
            SOMNOAI <span className="text-rose-600">LAB</span>
          </h1>
          <p className="text-slate-600 font-bold uppercase text-[10px] tracking-[0.5em] mt-2">
            DIGITAL IDENTITY TELEMETRY
          </p>
        </div>
      </m.div>

      <div className="w-full max-w-[460px] z-10">
        <div className="bg-[#050a1f]/90 backdrop-blur-3xl border border-rose-600/10 rounded-[3.5rem] p-1 shadow-2xl">
          <div className="p-10 md:p-12 space-y-10">
            
            {/* 导航标签: OTP, LOGIN, REGISTER */}
            <div className="flex bg-black/40 p-1.5 rounded-full border border-white/5 relative">
              {['otp', 'login', 'register'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => { setActiveTab(tab as any); setStep('input'); }}
                  className={`flex-1 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest z-10 transition-colors ${activeTab === tab ? 'text-white' : 'text-slate-600'}`}
                >
                  {tab === 'otp' ? 'OTP MODE' : tab.toUpperCase()}
                </button>
              ))}
              <m.div 
                className="absolute top-1.5 left-1.5 bottom-1.5 w-[calc(33.33%-3px)] bg-rose-600 rounded-full"
                animate={{ x: activeTab === 'otp' ? '0%' : activeTab === 'login' ? '100%' : '200%' }}
                transition={{ type: "spring", stiffness: 400, damping: 35 }}
              />
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' ? (
                <m.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-10">
                  
                  {/* 实验室宣言文案 */}
                  <p className="text-[12px] text-slate-500 text-center leading-relaxed italic px-2 font-medium">
                    It integrates physiological indicator monitoring, AI deep insights and health advice into one, providing users with a full range of digital sleep experiments.
                  </p>

                  <form onSubmit={handleMainAction} className="space-y-8">
                    <div className="space-y-6">
                      {/* Email Address 字段 */}
                      <div className="relative group">
                        <Mail className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={20} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email Address"
                          className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-rose-600/40 outline-none transition-all placeholder:text-slate-900 font-bold"
                          required
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                           <StatusIndicator active={isEmailValid} />
                        </div>
                      </div>

                      {/* Access Password 字段 (仅非OTP模式显示) */}
                      {activeTab !== 'otp' && (
                        <div className="relative group">
                          <Lock className="absolute left-7 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-rose-500 transition-colors" size={20} />
                          <input 
                            type={showPassword ? "text" : "password"} 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Access Password"
                            className="w-full bg-[#0a0e1a] border border-white/5 rounded-full pl-16 pr-24 py-6 text-sm text-white focus:border-rose-600/40 outline-none transition-all placeholder:text-slate-900 font-bold"
                            required
                          />
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-800 hover:text-white transition-colors">
                               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                             </button>
                             <StatusIndicator active={isPasswordValid} />
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 pt-2">
                      {/* 主按钮: AUTHORIZE ACCESS */}
                      <button 
                        type="submit" 
                        disabled={isProcessing}
                        className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 active:scale-[0.98] transition-all shadow-xl hover:bg-rose-500 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="animate-spin" size={20} /> : <Zap size={18} fill="currentColor" />}
                        {isProcessing ? 'SYNCHRONIZING...' : 'AUTHORIZE ACCESS'}
                      </button>

                      {/* 次要按钮: GOOGLE, SANDBOX MODE */}
                      <div className="grid grid-cols-2 gap-4">
                        <button 
                          type="button" 
                          onClick={() => authApi.signInWithGoogle()} 
                          className="py-5 bg-[#0f121e] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          GOOGLE
                        </button>
                        <button 
                          type="button" 
                          onClick={() => window.location.hash = '#/'} 
                          className="py-5 bg-[#0f121e] border border-white/5 rounded-2xl flex items-center justify-center gap-3 text-slate-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          SANDBOX MODE
                        </button>
                      </div>
                    </div>
                  </form>
                </m.div>
              ) : (
                <m.div key="verify" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="text-center space-y-4">
                    <button onClick={() => setStep('input')} className="text-[11px] font-black text-rose-500 uppercase flex items-center gap-2 mx-auto hover:text-rose-400">
                      <ChevronLeft size={16} /> Back to Identifier
                    </button>
                    <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Neural Handshake</h2>
                    <p className="text-[12px] text-slate-600 font-medium italic truncate px-8">Token dispatched to {email}</p>
                  </div>
                  <div className="flex justify-between gap-3 px-8">
                    {otp.map((digit, idx) => (
                      <input 
                        key={idx} 
                        ref={el => { otpRefs.current[idx] = el; }} 
                        type="text" 
                        inputMode="numeric" 
                        maxLength={1} 
                        value={digit}
                        onChange={(e) => handleOtpInput(idx, e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[idx] && idx > 0) otpRefs.current[idx-1]?.focus(); }}
                        className="w-12 h-16 bg-slate-950/60 border border-white/10 rounded-2xl text-3xl text-center text-white font-mono font-black focus:border-rose-600 outline-none transition-all"
                      />
                    ))}
                  </div>
                  <button 
                    onClick={() => executeOtpVerify()} 
                    disabled={isProcessing || otp.some(d => !d)} 
                    className="w-full py-6 bg-rose-600 text-white rounded-full font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-rose-500 active:scale-[0.97] transition-all disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" size={24} /> : <ShieldCheck size={24} />}
                    VERIFY NEURAL TOKEN
                  </button>
                </m.div>
              )}
            </AnimatePresence>

            {error && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 border border-rose-600/20 bg-rose-600/10 rounded-[2rem] flex items-start gap-4 text-[12px] font-bold italic text-rose-400">
                <ShieldAlert size={20} className="shrink-0 mt-1" />
                <p>{error}</p>
              </m.div>
            )}
          </div>
        </div>
      </div>

      {/* 页脚版权信息 */}
      <footer className="mt-16 text-center space-y-4 opacity-40 hover:opacity-100 transition-all duration-700 pb-12 pointer-events-none">
        <p className="text-[9px] font-mono uppercase tracking-[0.6em] text-slate-800 italic font-black">
          @2026 SomnoAI Digital Sleep Lab • Neural Infrastructure
        </p>
      </footer>
    </div>
  );
}
