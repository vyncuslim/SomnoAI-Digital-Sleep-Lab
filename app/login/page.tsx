
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Zap, Loader2, TriangleAlert, Lock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { signInWithPassword, signInWithEmailOTP, verifyOtp, signInWithGoogle, signUpWithPassword } from '../../services/supabaseService.ts';
import { Logo } from '../../components/Logo.tsx';
import { GlassCard } from '../../components/GlassCard.tsx';

const m = motion as any;

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleCredentialsAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (authMode === 'signup') {
        // 注册阶段：创建账户
        await signUpWithPassword(email, password);
        // 通常注册需要验证码或邮件链接，这里引导至 OTP 录入界面
        setStep('otp');
        setSuccess('准入申请已提交。核验令牌 (OTP) 已发射至您的节点。');
      } else {
        // 登录阶段：首先校验密码
        await signInWithPassword(email, password);
        // 密码正确后，发射 OTP 进行双因子核验
        await signInWithEmailOTP(email);
        setStep('otp');
        setSuccess('凭证核验通过。请输入二次身份令牌以获取准入。');
      }
    } catch (err: any) {
      setError(err.message || '核验失败。协议冲突或凭证无效。');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(index + pasted.length, 5)]?.focus();
    } else {
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = otp.join('');
    if (token.length < 6) return;
    setLoading(true);
    setError(null);
    try {
      const otpType = authMode === 'signup' ? 'signup' : 'email';
      await verifyOtp(email, token, otpType);
      // 验证成功，跳转首页
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || '令牌失效或已过期。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <m.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <Logo size={80} animated={true} className="mx-auto mb-6" />
          <h1 className="text-4xl font-black italic text-white uppercase tracking-tighter mb-2">SomnoAI Lab</h1>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">数字生理特征准入系统</p>
        </div>
        
        <GlassCard className="p-10 rounded-[4rem] border-white/10 shadow-3xl">
          <AnimatePresence mode="wait">
            {step === 'credentials' ? (
              <m.div key="credentials" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-8">
                <div className="flex bg-slate-950/60 p-1 rounded-full border border-white/5">
                  <button onClick={() => { setAuthMode('login'); setError(null); }} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>控制台登录</button>
                  <button onClick={() => { setAuthMode('signup'); setError(null); }} className={`flex-1 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${authMode === 'signup' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>新用户注册</button>
                </div>

                <form onSubmit={handleCredentialsAuth} className="space-y-5">
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={18} />
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="实验员邮箱" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all" required />
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-indigo-400" size={18} />
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="安全口令" className="w-full bg-slate-950/80 border border-white/10 rounded-full pl-16 pr-6 py-5 text-sm text-white focus:border-indigo-500/50 outline-none transition-all" required />
                  </div>
                  <button disabled={loading} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
                    {loading ? <Loader2 className="animate-spin" /> : <Zap size={18} />}
                    {authMode === 'login' ? '初始化上行链路' : '建立数字化档案'}
                  </button>
                </form>

                <div className="relative flex items-center py-2 opacity-30">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink mx-4 text-[9px] text-slate-500 font-black uppercase tracking-widest">第三方集成</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                <button type="button" onClick={() => signInWithGoogle()} className="w-full py-4 bg-white text-slate-950 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-slate-100 active:scale-95 transition-all">
                  <img src="https://img.icons8.com/color/24/google-logo.png" className="w-5 h-5" alt="G" />
                  使用 Google 身份同步
                </button>
              </m.div>
            ) : (
              <m.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                <div className="text-center">
                   <button onClick={() => { setStep('credentials'); setSuccess(null); }} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2 mx-auto mb-6 transition-colors"><ArrowLeft size={14} /> 返回修改凭证</button>
                   <h2 className="text-xl font-black text-white uppercase italic tracking-tight">身份核验令牌 (OTP)</h2>
                   <p className="text-[9px] text-indigo-400 mt-2 font-bold tracking-widest uppercase">已发射至节点: {email.slice(0,3)}***{email.slice(email.indexOf('@'))}</p>
                </div>
                
                <div className="flex justify-between gap-2">
                  {otp.map((digit, idx) => (
                    <input 
                      key={idx} 
                      ref={el => { otpRefs.current[idx] = el; }} 
                      type="text" 
                      maxLength={1} 
                      inputMode="numeric"
                      value={digit} 
                      onChange={(e) => handleOtpChange(idx, e.target.value)} 
                      onKeyDown={(e) => e.key === 'Backspace' && !otp[idx] && idx > 0 && otpRefs.current[idx - 1]?.focus()}
                      className="w-12 h-16 bg-slate-950/80 border border-white/10 rounded-2xl text-2xl text-center text-white font-black focus:border-indigo-500 outline-none transition-all shadow-inner" 
                    />
                  ))}
                </div>
                
                <button onClick={() => handleOtpVerify()} disabled={loading || otp.some(d => !d)} className="w-full py-5 bg-indigo-600 text-white rounded-full font-black text-[11px] uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                  同步数字指纹
                </button>
                
                <p className="text-center text-[9px] text-slate-600 uppercase tracking-widest">
                  未收到令牌？ <button onClick={() => signInWithEmailOTP(email)} className="text-indigo-500 hover:text-indigo-400 font-bold">重新发射</button>
                </p>
              </m.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {(error || success) && (
              <m.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`mt-8 p-5 rounded-3xl border text-[10px] font-bold flex items-center gap-4 ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
                {error ? <TriangleAlert size={18} className="shrink-0" /> : <ShieldCheck size={18} className="shrink-0" />}
                <p className="leading-relaxed italic">{error || success}</p>
              </m.div>
            )}
          </AnimatePresence>
        </GlassCard>
      </m.div>
    </div>
  );
}
